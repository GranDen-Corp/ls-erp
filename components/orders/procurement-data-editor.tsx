"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Loader2,
  AlertCircle,
  Factory,
  DollarSign,
  Calendar,
  TruckIcon,
  Info,
  CheckCircle,
  Settings,
  Layers,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { CustomDatePicker } from "@/components/ui/custom-date-picker"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export interface ProcurementItem {
  id: string
  productPartNo: string
  productName: string
  quantity: number
  unit: string
  factoryId: string
  factoryName: string
  factoryOptions: Array<{
    id: string
    name: string
    factoryId?: string
    paymentTerm?: string
    deliveryTerm?: string
  }>
  purchasePrice: number
  deliveryDate: Date | undefined
  notes: string
  status: string
  isSelected: boolean
  paymentTerm?: string
  deliveryTerm?: string
  currency: string
  isComponentPart?: boolean
  parentAssemblyId?: string
  parentAssemblyName?: string
}

interface ProcurementDataEditorProps {
  orderItems: any[]
  onProcurementDataChange: (procurementItems: ProcurementItem[]) => void
  isCreatingPurchaseOrder: boolean
  orderId?: string
  readOnly?: boolean
  onConfirmSettings?: () => void
  isSettingsConfirmed?: boolean
  productUnits: Array<{
    id: number
    code: string
    name: string
    value: string
  }>
  getUnitMultiplier: (unit: string) => number
}

export function ProcurementDataEditor({
  orderItems,
  onProcurementDataChange,
  isCreatingPurchaseOrder,
  orderId,
  readOnly = false,
  onConfirmSettings,
  isSettingsConfirmed = false,
  productUnits = [],
  getUnitMultiplier,
}: ProcurementDataEditorProps) {
  const [procurementItems, setProcurementItems] = useState<ProcurementItem[]>([])
  const [factories, setFactories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectAll, setSelectAll] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // 獲取單位顯示名稱
  const getUnitDisplayName = (unitValue: string) => {
    const unit = productUnits.find((u) => u.value === unitValue)
    return unit ? unit.code : `${unitValue}PCS`
  }

  // 計算實際數量（考慮單位換算）
  const calculateActualQuantity = (quantity: number, unit: string) => {
    return quantity * getUnitMultiplier(unit)
  }

  // 獲取單位信息
  const getUnitInfo = (unit: string) => {
    const multiplier = getUnitMultiplier(unit)
    if (multiplier === 1000) {
      return { text: "1千件", color: "bg-red-100 text-red-800" }
    } else if (multiplier === 100) {
      return { text: "100件", color: "bg-orange-100 text-orange-800" }
    } else if (multiplier === 10) {
      return { text: "10件", color: "bg-yellow-100 text-yellow-800" }
    }
    return { text: "單件", color: "bg-green-100 text-green-800" }
  }

  // 載入供應商資料
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

        const { data: suppliersData, error: suppliersError } = await supabase.from("suppliers").select("*")

        if (suppliersError) {
          throw new Error(`獲取供應商資料失敗: ${suppliersError.message}`)
        }

        if (!suppliersData || suppliersData.length === 0) {
          console.warn("供應商資料表為空")
          setFactories([])
        } else {
          const convertedData = suppliersData.map((supplier) => {
            const id = supplier.id || supplier.supplier_id || supplier.factory_id || ""
            const name = supplier.name || supplier.supplier_name || supplier.factory_name || `供應商 ${id}`

            return {
              ...supplier,
              factory_id: id,
              factory_name: name,
              factory_full_name:
                supplier.full_name || supplier.supplier_full_name || supplier.factory_full_name || name,
              quality_contact1: supplier.contact_person || supplier.contact_name || "",
              factory_phone: supplier.phone || supplier.contact_phone || "",
              factory_address: supplier.address || "",
              payment_term: supplier.payment_term || "",
              delivery_term: supplier.delivery_term || "",
              legacy_notes: supplier.notes || "",
            }
          })

          setFactories(convertedData)
          console.log("從suppliers表載入了", convertedData.length, "筆供應商資料")
        }
      } catch (err: any) {
        console.error("獲取供應商資料失敗:", err)
        setError(`無法載入供應商資料: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchSuppliers()
  }, [])

  // 當訂單項目變更時，更新採購項目
  useEffect(() => {
    if (orderItems.length === 0) return

    const newProcurementItems: ProcurementItem[] = []

    orderItems.forEach((item) => {
      // 檢查是否為組件產品
      if (item.isAssembly && item.product && item.product.components && Array.isArray(item.product.components)) {
        // 處理組件產品的部件
        item.product.components.forEach((component: any) => {
          const existingItem = procurementItems.find(
            (p) =>
              p.isComponentPart &&
              p.productPartNo === (component.productPN || component.part_no) &&
              p.parentAssemblyId === item.productPartNo,
          )

          let factoryId = component.factoryId || ""
          let factoryName = component.factoryName || ""

          if (factoryId) {
            const factory = factories.find((f) => f.factory_id === factoryId)
            factoryName = factory ? factory.factory_name || factory.factory_full_name : "未知供應商"
          }

          if (!factoryId && existingItem) {
            factoryId = existingItem.factoryId
            factoryName = existingItem.factoryName
          }

          const factoryOptions = factories.map((factory) => ({
            id: factory.factory_id,
            name: factory.factory_name || factory.factory_full_name || `工廠 ${factory.factory_id}`,
            factoryId: factory.factory_id,
            paymentTerm: factory.payment_term,
            deliveryTerm: factory.delivery_term,
          }))

          // 使用訂單項目的單位作為預設，而不是固定的MPCS
          const defaultUnit = existingItem?.unit || item.unit || "MPCS"
          const componentQuantity = component.quantity || 1
          const assemblyQuantity = item.quantity
          const totalQuantityInPcs = componentQuantity * calculateActualQuantity(assemblyQuantity, item.unit)

          // 根據預設單位計算採購數量
          const procurementQuantity = Math.ceil(totalQuantityInPcs / getUnitMultiplier(defaultUnit))

          newProcurementItems.push({
            id: existingItem?.id || `proc-comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            productPartNo: component.productPN || component.part_no || "",
            productName: component.productName || component.component_name || "",
            quantity: existingItem?.quantity || procurementQuantity,
            unit: defaultUnit,
            factoryId: factoryId,
            factoryName: factoryName,
            factoryOptions: factoryOptions,
            purchasePrice: existingItem?.purchasePrice || component.unitPrice || 0,
            deliveryDate: existingItem?.deliveryDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            notes: existingItem?.notes || `組件 ${item.productPartNo} 的部件`,
            status: existingItem?.status || "pending",
            isSelected: existingItem?.isSelected !== undefined ? existingItem.isSelected : true,
            paymentTerm: existingItem?.paymentTerm || "",
            deliveryTerm: existingItem?.deliveryTerm || "",
            currency: existingItem?.currency || component.currency || item.currency || "USD",
            isComponentPart: true,
            parentAssemblyId: item.productPartNo,
            parentAssemblyName: item.productName,
          })
        })
      } else {
        // 處理普通產品
        const existingItem = procurementItems.find((p) => !p.isComponentPart && p.productPartNo === item.productPartNo)

        let factoryId = ""
        let factoryName = ""

        try {
          if (item.product && item.product.factory_id) {
            factoryId = item.product.factory_id
            const factory = factories.find((f) => f.factory_id === factoryId)
            factoryName = factory ? factory.factory_name || factory.factory_full_name : "未知供應商"
          }
        } catch (err) {
          console.warn("無法從產品資料獲取工廠信息:", err)
        }

        if (!factoryId && existingItem) {
          factoryId = existingItem.factoryId
          factoryName = existingItem.factoryName
        }

        const factoryOptions = factories.map((factory) => ({
          id: factory.factory_id,
          name: factory.factory_name || factory.factory_full_name || `工廠 ${factory.factory_id}`,
          factoryId: factory.factory_id,
          paymentTerm: factory.payment_term,
          deliveryTerm: factory.delivery_term,
        }))

        // 使用訂單項目的單位和數量作為預設
        const defaultUnit = existingItem?.unit || item.unit || "MPCS"
        const defaultQuantity = existingItem?.quantity || item.quantity

        newProcurementItems.push({
          id: existingItem?.id || `proc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          productPartNo: item.productPartNo,
          productName: item.productName,
          quantity: defaultQuantity,
          unit: defaultUnit,
          factoryId: factoryId,
          factoryName: factoryName,
          factoryOptions: factoryOptions,
          purchasePrice: existingItem?.purchasePrice || item.unitPrice * 0.8,
          deliveryDate: existingItem?.deliveryDate || new Date(),
          notes: existingItem?.notes || "",
          status: existingItem?.status || "pending",
          isSelected: existingItem?.isSelected !== undefined ? existingItem.isSelected : true,
          paymentTerm: existingItem?.paymentTerm || "",
          deliveryTerm: existingItem?.deliveryTerm || "",
          currency: existingItem?.currency || item.currency || "USD",
        })
      }
    })

    setProcurementItems(newProcurementItems)
    onProcurementDataChange(newProcurementItems)
  }, [orderItems, factories, loading])

  // 更新採購項目
  const updateProcurementItem = (id: string, field: keyof ProcurementItem, value: any) => {
    console.log(`更新採購項目 ${id}, 欄位: ${field}`, value)
    setProcurementItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }

          // 如果更新的是工廠ID，同時更新工廠名稱
          if (field === "factoryId") {
            const factory = factories.find((f) => f.factory_id === value)
            updatedItem.factoryName = factory ? factory.factory_name || factory.factory_full_name : ""

            if (factory) {
              updatedItem.paymentTerm = factory.payment_term || updatedItem.paymentTerm
              updatedItem.deliveryTerm = factory.delivery_term || updatedItem.deliveryTerm
            }
          }

          return updatedItem
        }
        return item
      }),
    )
  }

  // 處理數量變更
  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity < 0) {
      toast({
        title: "錯誤",
        description: "數量不能為負數",
        variant: "destructive",
      })
      return
    }
    updateProcurementItem(itemId, "quantity", quantity)
  }

  // 處理單位變更
  const handleUnitChange = (itemId: string, unit: string) => {
    const item = procurementItems.find((i) => i.id === itemId)
    if (item) {
      // 計算當前實際數量（PCS）
      const currentActualQuantity = calculateActualQuantity(item.quantity, item.unit)
      // 計算新單位下的數量
      const newQuantity = Math.ceil(currentActualQuantity / getUnitMultiplier(unit))

      updateProcurementItem(itemId, "unit", unit)
      updateProcurementItem(itemId, "quantity", newQuantity)

      toast({
        title: "成功",
        description: `單位已更新為 ${getUnitDisplayName(unit)}`,
      })
    }
  }

  // 處理價格變更
  const handlePriceChange = (itemId: string, price: number) => {
    if (price < 0) {
      toast({
        title: "錯誤",
        description: "價格不能為負數",
        variant: "destructive",
      })
      return
    }
    updateProcurementItem(itemId, "purchasePrice", price)
  }

  // 切換全選
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)
    setProcurementItems((prev) =>
      prev.map((item) => ({
        ...item,
        isSelected: newSelectAll,
      })),
    )
  }

  // 切換單個項目選擇
  const toggleItemSelection = (id: string) => {
    setProcurementItems((prev) => {
      const newItems = prev.map((item) => {
        if (item.id === id) {
          return { ...item, isSelected: !item.isSelected }
        }
        return item
      })

      const allSelected = newItems.every((item) => item.isSelected)
      setSelectAll(allSelected)

      return newItems
    })
  }

  // 計算採購總價
  const calculateItemTotal = (item: ProcurementItem) => {
    const actualQuantityInPcs = calculateActualQuantity(item.quantity, item.unit)
    return actualQuantityInPcs * item.purchasePrice
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">載入供應商資料中...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>錯誤</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (procurementItems.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>尚未添加產品</AlertTitle>
        <AlertDescription>請先在訂單中添加產品，然後再設定採購資料。</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>採購資料設定</CardTitle>
            <CardDescription>
              為訂單中的產品設定採購資料，包括供應商、採購價格、交期等。勾選的項目將生成採購單。
              <br />
              <span className="text-blue-600 font-medium">採購數量和單位預設同步於訂單產品，您可以根據需要調整。</span>
            </CardDescription>
          </div>
          {!readOnly && (
            <div className="flex items-center space-x-2">
              <Checkbox id="selectAll" checked={selectAll} onCheckedChange={toggleSelectAll} />
              <Label htmlFor="selectAll" className="text-sm font-normal">
                全選
              </Label>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full">
            <div className="space-y-6">
              {procurementItems.map((item) => {
                const unitInfo = getUnitInfo(item.unit)
                const actualQuantity = calculateActualQuantity(item.quantity, item.unit)

                return (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-4 space-y-4 ${
                      item.isComponentPart ? "bg-blue-50" : "bg-gray-50"
                    } ${!item.factoryId ? "border-amber-300" : ""}`}
                  >
                    {/* 產品基本信息 */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {!readOnly && (
                            <Checkbox
                              checked={item.isSelected}
                              onCheckedChange={() => toggleItemSelection(item.id)}
                              disabled={isCreatingPurchaseOrder}
                            />
                          )}
                          <h4 className="font-medium text-lg">{item.productName}</h4>
                          {item.isComponentPart && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    <Layers className="h-3 w-3 mr-1" />
                                    部件
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>此項目是組件 {item.parentAssemblyName} 的部件</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {!item.factoryId && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              未選擇供應商
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">產品編號: {item.productPartNo}</p>
                        {item.isComponentPart && (
                          <p className="text-xs text-muted-foreground">
                            組件: {item.parentAssemblyName} ({item.parentAssemblyId})
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 採購設定區域 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* 採購數量 */}
                      <div>
                        <Label htmlFor={`quantity-${item.id}`} className="text-sm font-medium">
                          採購數量
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            id={`quantity-${item.id}`}
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, Number.parseInt(e.target.value) || 0)}
                            disabled={readOnly || isCreatingPurchaseOrder}
                            min="1"
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground font-medium min-w-[60px]">
                            {getUnitDisplayName(item.unit)}
                          </span>
                        </div>
                      </div>

                      {/* 採購單位 */}
                      <div>
                        <Label htmlFor={`unit-${item.id}`} className="text-sm font-medium">
                          採購單位
                        </Label>
                        <Select
                          value={item.unit}
                          onValueChange={(value) => handleUnitChange(item.id, value)}
                          disabled={readOnly || isCreatingPurchaseOrder}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="選擇單位" />
                          </SelectTrigger>
                          <SelectContent>
                            {productUnits.map((unit) => (
                              <SelectItem key={unit.id} value={unit.value}>
                                {unit.code} ({unit.name})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Badge className={`mt-1 text-xs ${unitInfo.color}`}>{unitInfo.text}</Badge>
                      </div>

                      {/* 供應商選擇 */}
                      <div>
                        <Label htmlFor={`supplier-${item.id}`} className="text-sm font-medium">
                          供應商
                        </Label>
                        {readOnly ? (
                          <div className="flex items-center mt-1 p-2 border rounded">
                            <Factory className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{item.factoryName || "未指定供應商"}</span>
                          </div>
                        ) : (
                          <Select
                            value={item.factoryId}
                            onValueChange={(value) => updateProcurementItem(item.id, "factoryId", value)}
                            disabled={isCreatingPurchaseOrder}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="選擇供應商" />
                            </SelectTrigger>
                            <SelectContent>
                              {item.factoryOptions.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      {/* 幣值 */}
                      <div>
                        <Label htmlFor={`currency-${item.id}`} className="text-sm font-medium">
                          幣值
                        </Label>
                        {readOnly ? (
                          <div className="mt-1 p-2 border rounded text-center">{item.currency}</div>
                        ) : (
                          <Select
                            value={item.currency}
                            onValueChange={(value) => updateProcurementItem(item.id, "currency", value)}
                            disabled={isCreatingPurchaseOrder}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="貨幣" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="TWD">TWD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="JPY">JPY</SelectItem>
                              <SelectItem value="CNY">CNY</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      {/* 採購單價 */}
                      <div>
                        <Label htmlFor={`price-${item.id}`} className="text-sm font-medium">
                          採購單價
                        </Label>
                        {readOnly ? (
                          <div className="mt-1 p-2 border rounded text-right">{item.purchasePrice.toFixed(4)}</div>
                        ) : (
                          <Input
                            type="number"
                            id={`price-${item.id}`}
                            value={item.purchasePrice}
                            onChange={(e) => handlePriceChange(item.id, Number.parseFloat(e.target.value) || 0)}
                            disabled={isCreatingPurchaseOrder}
                            min="0"
                            step="0.0001"
                            className="mt-1"
                          />
                        )}
                      </div>

                      {/* 交期 */}
                      <div>
                        <Label htmlFor={`delivery-${item.id}`} className="text-sm font-medium">
                          交期
                        </Label>
                        {readOnly ? (
                          <div className="mt-1 p-2 border rounded">
                            {item.deliveryDate ? (
                              item.deliveryDate.toLocaleDateString()
                            ) : (
                              <span className="text-amber-600">未設定</span>
                            )}
                          </div>
                        ) : (
                          <CustomDatePicker
                            date={item.deliveryDate}
                            setDate={(date) => updateProcurementItem(item.id, "deliveryDate", date)}
                            disabled={isCreatingPurchaseOrder}
                          />
                        )}
                      </div>

                      {/* 備註 */}
                      <div className="md:col-span-2">
                        <Label htmlFor={`notes-${item.id}`} className="text-sm font-medium">
                          備註
                        </Label>
                        {readOnly ? (
                          <div className="mt-1 p-2 border rounded min-h-[40px]">
                            {item.notes || <span className="text-muted-foreground italic">無</span>}
                          </div>
                        ) : (
                          <Input
                            id={`notes-${item.id}`}
                            value={item.notes}
                            onChange={(e) => updateProcurementItem(item.id, "notes", e.target.value)}
                            placeholder="備註"
                            disabled={isCreatingPurchaseOrder}
                            className="mt-1"
                          />
                        )}
                      </div>
                    </div>

                    {/* 計算結果顯示 */}
                    <div className="bg-white rounded-md p-3 border">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">實際採購數量:</span>
                          <span className="ml-2 font-medium">{actualQuantity.toLocaleString()} 件</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">採購單價:</span>
                          <span className="ml-2 font-medium">
                            {item.purchasePrice.toFixed(4)} {item.currency}/{getUnitDisplayName(item.unit)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">採購小計:</span>
                          <span className="ml-2 font-bold text-lg">
                            {calculateItemTotal(item).toFixed(2)} {item.currency}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        計算方式: {item.quantity} × {getUnitDisplayName(item.unit)} × {item.purchasePrice} ={" "}
                        {actualQuantity} 件 × {item.purchasePrice} = {calculateItemTotal(item).toFixed(2)}{" "}
                        {item.currency}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 統計信息 */}
      <div className="flex flex-col sm:flex-row justify-between bg-muted/10 p-4 gap-4 border rounded-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1.5">
            <Factory className="h-4 w-4 mr-2" />
            <div>
              <span className="font-semibold">供應商:</span>{" "}
              <span className="font-bold">
                {procurementItems.filter((item) => item.isSelected && item.factoryId).length}
              </span>
              /{procurementItems.length}
            </div>
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1.5">
            <DollarSign className="h-4 w-4 mr-2" />
            <div>
              <span className="font-semibold">總採購金額:</span>{" "}
              <span className="font-bold">
                {procurementItems
                  .filter((item) => item.isSelected)
                  .reduce((sum, item) => sum + calculateItemTotal(item), 0)
                  .toFixed(2)}{" "}
                USD
              </span>
            </div>
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1.5">
            <Calendar className="h-4 w-4 mr-2" />
            <div>
              <span className="font-semibold">最遠交期:</span>{" "}
              <span className="font-bold">
                {procurementItems
                  .filter((item) => item.isSelected && item.deliveryDate)
                  .sort((a, b) => {
                    if (!a.deliveryDate) return 1
                    if (!b.deliveryDate) return -1
                    return b.deliveryDate.getTime() - a.deliveryDate.getTime()
                  })[0]
                  ?.deliveryDate?.toLocaleDateString() || "無"}
              </span>
            </div>
          </Badge>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1.5">
            <TruckIcon className="h-4 w-4 mr-2" />
            <div>
              <span className="font-semibold">已選擇:</span>{" "}
              <span className="font-bold">{procurementItems.filter((item) => item.isSelected).length}</span>/
              {procurementItems.length}
            </div>
          </Badge>
        </div>

        {/* 確認採購設定按鈕 */}
        {onConfirmSettings && (
          <Button
            onClick={onConfirmSettings}
            variant={isSettingsConfirmed ? "outline" : "default"}
            size="sm"
            className="w-full sm:w-auto"
          >
            {isSettingsConfirmed ? (
              <>
                <Settings className="mr-2 h-4 w-4" />
                修改採購設定
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                確認採購設定完成
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
