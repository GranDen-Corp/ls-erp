"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import { createPurchasesFromProcurementItems } from "@/lib/services/purchase-service"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export interface ProcurementItem {
  id: string
  productPartNo: string
  productName: string
  quantity: number
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
}

export function ProcurementDataEditor({
  orderItems,
  onProcurementDataChange,
  isCreatingPurchaseOrder,
  orderId,
  readOnly = false,
  onConfirmSettings,
  isSettingsConfirmed = false,
}: ProcurementDataEditorProps) {
  const [procurementItems, setProcurementItems] = useState<ProcurementItem[]>([])
  const [factories, setFactories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectAll, setSelectAll] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // 載入供應商資料
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

        // 先獲取表結構以了解可用的列
        const { data: tableInfo, error: tableError } = await supabase.from("suppliers").select("*").limit(1)

        if (tableError) {
          throw new Error(`獲取供應商表結構失敗: ${tableError.message}`)
        }

        // 檢查表是否為空
        if (!tableInfo || tableInfo.length === 0) {
          console.warn("供應商資料表為空")
          setFactories([])
          setLoading(false)
          return
        }

        // 獲取第一行數據以了解列結構
        const firstRow = tableInfo[0]
        console.log("供應商表結構:", Object.keys(firstRow))

        // 獲取所有供應商數據
        const { data: suppliersData, error: suppliersError } = await supabase.from("suppliers").select("*")

        if (suppliersError) {
          throw new Error(`獲取供應商資料失敗: ${suppliersError.message}`)
        }

        if (!suppliersData || suppliersData.length === 0) {
          console.warn("供應商資料表為空")
          setFactories([])
        } else {
          // 將suppliers資料轉換為標準格式，使用動態欄位名稱
          const convertedData = suppliersData.map((supplier) => {
            // 嘗試找出ID和名稱欄位
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
    if (factories.length === 0 && !loading) {
      // 如果沒有供應商資料，創建空的採購項目
      const newProcurementItems: ProcurementItem[] = []

      // 處理所有訂單項目
      orderItems.forEach((item) => {
        // 檢查是否為組件產品
        if (item.isAssembly && item.product && item.product.components && Array.isArray(item.product.components)) {
          // 處理組件產品的部件
          item.product.components.forEach((component: any) => {
            newProcurementItems.push({
              id: `proc-comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              productPartNo: component.productPN || component.part_no || "",
              productName: component.productName || component.component_name || "",
              quantity: (component.quantity || 1) * item.quantity, // 部件數量 × 組件訂購數量
              factoryId: component.factoryId || "",
              factoryName: component.factoryName || "",
              factoryOptions: [],
              purchasePrice: component.unitPrice || 0,
              deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 預設為兩週後
              notes: `組件 ${item.productPartNo} 的部件`,
              status: "pending",
              isSelected: true,
              paymentTerm: "",
              deliveryTerm: "",
              currency: component.currency || item.currency || "USD",
              isComponentPart: true,
              parentAssemblyId: item.productPartNo,
              parentAssemblyName: item.productName,
            })
          })
        } else {
          // 處理普通產品
          newProcurementItems.push({
            id: `proc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            productPartNo: item.productPartNo,
            productName: item.productName,
            quantity: item.quantity,
            factoryId: "",
            factoryName: "",
            factoryOptions: [],
            purchasePrice: item.unitPrice * 0.8, // 預設採購價為銷售價的80%
            deliveryDate: new Date(), // 預設為今天
            notes: "",
            status: "pending",
            isSelected: true,
            paymentTerm: "",
            deliveryTerm: "",
            currency: item.currency || "USD", // 使用產品貨幣或默認USD
          })
        }
      })

      setProcurementItems(newProcurementItems)
      onProcurementDataChange(newProcurementItems)
      return
    }

    // 將訂單項目轉換為採購項目
    const newProcurementItems: ProcurementItem[] = []

    // 處理所有訂單項目
    orderItems.forEach((item) => {
      // 檢查是否為組件產品
      if (item.isAssembly && item.product && item.product.components && Array.isArray(item.product.components)) {
        // 處理組件產品的部件
        item.product.components.forEach((component: any) => {
          // 查找現有的採購項目
          const existingItem = procurementItems.find(
            (p) =>
              p.isComponentPart &&
              p.productPartNo === (component.productPN || component.part_no) &&
              p.parentAssemblyId === item.productPartNo,
          )

          // 從產品資料中獲取工廠信息
          let factoryId = component.factoryId || ""
          let factoryName = component.factoryName || ""

          // 如果部件有指定工廠，則使用該工廠
          if (factoryId) {
            const factory = factories.find((f) => f.factory_id === factoryId)
            factoryName = factory ? factory.factory_name || factory.factory_full_name : "未知供應商"
          }

          // 如果有現有項目且部件沒有工廠ID，則使用現有項目的工廠信息
          if (!factoryId && existingItem) {
            factoryId = existingItem.factoryId
            factoryName = existingItem.factoryName
          }

          // 為部件準備工廠選項
          const factoryOptions = factories.map((factory) => ({
            id: factory.factory_id,
            name: factory.factory_name || factory.factory_full_name || `工廠 ${factory.factory_id}`,
            factoryId: factory.factory_id,
            paymentTerm: factory.payment_term,
            deliveryTerm: factory.delivery_term,
          }))

          newProcurementItems.push({
            id: existingItem?.id || `proc-comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            productPartNo: component.productPN || component.part_no || "",
            productName: component.productName || component.component_name || "",
            quantity: existingItem?.quantity || (component.quantity || 1) * item.quantity, // 部件數量 × 組件訂購數量
            factoryId: factoryId,
            factoryName: factoryName,
            factoryOptions: factoryOptions,
            purchasePrice: existingItem?.purchasePrice || component.unitPrice || 0,
            deliveryDate: existingItem?.deliveryDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 預設為兩週後
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
        // 查找現有的採購項目
        const existingItem = procurementItems.find((p) => !p.isComponentPart && p.productPartNo === item.productPartNo)

        // 從產品資料中獲取工廠信息
        let factoryId = ""
        let factoryName = ""

        // 優先從產品資料中獲取工廠信息
        try {
          if (item.product && item.product.factory_id) {
            factoryId = item.product.factory_id
            const factory = factories.find((f) => f.factory_id === factoryId)
            factoryName = factory ? factory.factory_name || factory.factory_full_name : "未知供應商"
          }
        } catch (err) {
          console.warn("無法從產品資料獲取工廠信息:", err)
        }

        // 如果有現有項目且產品沒有工廠ID，則使用現有項目的工廠信息
        if (!factoryId && existingItem) {
          factoryId = existingItem.factoryId
          factoryName = existingItem.factoryName
        }

        // 為產品準備工廠選項
        const factoryOptions = factories.map((factory) => ({
          id: factory.factory_id,
          name: factory.factory_name || factory.factory_full_name || `工廠 ${factory.factory_id}`,
          factoryId: factory.factory_id,
          paymentTerm: factory.payment_term,
          deliveryTerm: factory.delivery_term,
        }))

        newProcurementItems.push({
          id: existingItem?.id || `proc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          productPartNo: item.productPartNo,
          productName: item.productName,
          quantity: existingItem?.quantity || item.quantity,
          factoryId: factoryId,
          factoryName: factoryName,
          factoryOptions: factoryOptions,
          purchasePrice: existingItem?.purchasePrice || item.unitPrice * 0.8, // 預設採購價為銷售價的80%
          deliveryDate: existingItem?.deliveryDate || new Date(), // 預設為今天
          notes: existingItem?.notes || "",
          status: existingItem?.status || "pending",
          isSelected: existingItem?.isSelected !== undefined ? existingItem.isSelected : true,
          paymentTerm: existingItem?.paymentTerm || "",
          deliveryTerm: existingItem?.deliveryTerm || "",
          currency: existingItem?.currency || item.currency || "USD", // 使用現有貨幣或產品貨幣或默認USD
        })
      }
    })

    setProcurementItems(newProcurementItems)
    onProcurementDataChange(newProcurementItems)
  }, [orderItems, factories, loading, procurementItems])

  // 當採購項目變更時，通知父組件
  useEffect(() => {
    onProcurementDataChange(procurementItems)
  }, [procurementItems, onProcurementDataChange])

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

            // 如果供應商有預設的付款條件和交貨條件，也一併更新
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

      // 檢查是否所有項目都被選中
      const allSelected = newItems.every((item) => item.isSelected)
      setSelectAll(allSelected)

      return newItems
    })
  }

  // 保存採購單
  const savePurchaseOrders = async () => {
    // 檢查是否有選中的項目
    const selectedItems = procurementItems.filter((item) => item.isSelected)
    if (selectedItems.length === 0) {
      toast({
        title: "警告",
        description: "請至少選擇一個採購項目",
        variant: "warning",
      })
      return
    }

    // 檢查是否所有選中的項目都有供應商
    const itemsWithoutSupplier = selectedItems.filter((item) => !item.factoryId)
    if (itemsWithoutSupplier.length > 0) {
      toast({
        title: "警告",
        description: `有 ${itemsWithoutSupplier.length} 個項目未選擇供應商`,
        variant: "warning",
      })
      return
    }

    // 檢查是否有訂單ID
    if (!orderId) {
      toast({
        title: "警告",
        description: "請先保存訂單，然後再創建採購單",
        variant: "warning",
      })
      return
    }

    setIsSaving(true)
    try {
      console.log("正在創建採購單，使用訂單ID:", orderId)
      const result = await createPurchasesFromProcurementItems(procurementItems, orderId)

      if (result.success) {
        toast({
          title: "成功",
          description: `已成功創建 ${result.results.length} 張採購單`,
        })
      } else {
        toast({
          title: "錯誤",
          description: result.error || "創建採購單失敗",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("創建採購單時出錯:", error)
      toast({
        title: "錯誤",
        description: error.message || "創建採購單時發生錯誤",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">採購資料設定</h3>
          <p className="text-sm text-muted-foreground">
            為訂單中的產品設定採購資料，包括供應商、採購價格、交期等。勾選的項目將生成採購單。
          </p>
        </div>
        {!readOnly && (
          <div className="flex items-center space-x-2">
            <Checkbox id="selectAll" checked={selectAll} onCheckedChange={toggleSelectAll} />
            <Label htmlFor="selectAll" className="text-sm font-normal">
              全選
            </Label>
          </div>
        )}
      </div>

      <div className="border rounded-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {!readOnly && <TableHead className="w-12">選擇</TableHead>}
                <TableHead className="w-[120px]">產品編號</TableHead>
                <TableHead>產品名稱</TableHead>
                <TableHead className="text-center w-[80px]">數量</TableHead>
                <TableHead className="w-[180px]">供應商</TableHead>
                <TableHead className="text-center w-[80px]">貨幣</TableHead>
                <TableHead className="text-right w-[100px]">採購單價</TableHead>
                <TableHead className="text-right w-[100px]">採購總價</TableHead>
                <TableHead className="w-[120px]">交期</TableHead>
                <TableHead>備註</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {procurementItems.map((item) => (
                <TableRow
                  key={item.id}
                  className={`${isCreatingPurchaseOrder && !item.isSelected ? "opacity-50" : ""} ${!item.factoryId ? "bg-amber-50" : ""} ${item.isComponentPart ? "bg-blue-50" : ""}`}
                >
                  {!readOnly && (
                    <TableCell className="sticky left-0 bg-inherit">
                      <Checkbox
                        checked={item.isSelected}
                        onCheckedChange={() => toggleItemSelection(item.id)}
                        disabled={isCreatingPurchaseOrder}
                      />
                    </TableCell>
                  )}
                  <TableCell className="sticky left-0 bg-inherit font-medium">
                    {item.productPartNo}
                    {item.isComponentPart && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="ml-1 bg-blue-50 text-blue-700 border-blue-200">
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
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate" title={item.productName}>
                    {item.productName}
                    {item.isComponentPart && (
                      <div className="text-xs text-muted-foreground mt-1">
                        組件: {item.parentAssemblyName} ({item.parentAssemblyId})
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {readOnly ? (
                      item.quantity
                    ) : (
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateProcurementItem(item.id, "quantity", Number(e.target.value) || 1)}
                        className="w-20 text-center"
                        disabled={isCreatingPurchaseOrder}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {readOnly ? (
                      <div className="flex items-center">
                        <Factory className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{item.factoryName || "未指定供應商"}</span>
                      </div>
                    ) : (
                      <Select
                        value={item.factoryId}
                        onValueChange={(value) => updateProcurementItem(item.id, "factoryId", value)}
                        disabled={isCreatingPurchaseOrder}
                      >
                        <SelectTrigger className="w-[180px]">
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
                  </TableCell>
                  <TableCell className="text-center">
                    {readOnly ? (
                      item.currency
                    ) : (
                      <Select
                        value={item.currency}
                        onValueChange={(value) => updateProcurementItem(item.id, "currency", value)}
                        disabled={isCreatingPurchaseOrder}
                      >
                        <SelectTrigger className="w-20">
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
                  </TableCell>
                  <TableCell className="text-right">
                    {readOnly ? (
                      item.purchasePrice.toFixed(2)
                    ) : (
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.purchasePrice}
                        onChange={(e) => updateProcurementItem(item.id, "purchasePrice", Number(e.target.value) || 0)}
                        className="w-24 text-right"
                        disabled={isCreatingPurchaseOrder}
                      />
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {(item.quantity * item.purchasePrice).toFixed(2)} {item.currency}
                  </TableCell>
                  <TableCell>
                    {readOnly ? (
                      item.deliveryDate ? (
                        item.deliveryDate.toLocaleDateString()
                      ) : (
                        <span className="text-amber-600">未設定</span>
                      )
                    ) : (
                      <CustomDatePicker
                        date={item.deliveryDate}
                        setDate={(date) => {
                          updateProcurementItem(item.id, "deliveryDate", date)
                        }}
                        disabled={isCreatingPurchaseOrder}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {readOnly ? (
                      item.notes || <span className="text-muted-foreground italic">無</span>
                    ) : (
                      <Input
                        value={item.notes}
                        onChange={(e) => updateProcurementItem(item.id, "notes", e.target.value)}
                        placeholder="備註"
                        disabled={isCreatingPurchaseOrder}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {isSettingsConfirmed && (
                <TableRow className="bg-gray-50 font-medium">
                  <TableCell colSpan={readOnly ? 6 : 7} className="text-right">
                    採購總金額:
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {procurementItems
                      .filter((item) => item.isSelected)
                      .reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0)
                      .toFixed(2)}{" "}
                    USD
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
              {procurementItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={readOnly ? 8 : 9} className="h-24 text-center text-muted-foreground">
                    尚未添加採購項目
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between bg-muted/10 p-4 gap-4 border rounded-md mt-4">
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
                  .reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0)
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
