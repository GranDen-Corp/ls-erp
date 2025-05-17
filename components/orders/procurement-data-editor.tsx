"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, AlertCircle, Factory, DollarSign, Calendar, TruckIcon, Info, Search } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { SupplierSelectorDialog } from "./supplier-selector-dialog"
import { CustomDatePicker } from "@/components/ui/custom-date-picker"
import { createPurchasesFromProcurementItems } from "@/lib/services/purchase-service"
import { useToast } from "@/hooks/use-toast"

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
  paymentTerm?: string // 保留欄位但不在 UI 中顯示
  deliveryTerm?: string // 保留欄位但不在 UI 中顯示
}

interface ProcurementDataEditorProps {
  orderItems: any[]
  onProcurementDataChange: (procurementItems: ProcurementItem[]) => void
  isCreatingPurchaseOrder: boolean
  orderId?: string // 添加訂單ID參數
}

export function ProcurementDataEditor({
  orderItems,
  onProcurementDataChange,
  isCreatingPurchaseOrder,
  orderId,
}: ProcurementDataEditorProps) {
  const [procurementItems, setProcurementItems] = useState<ProcurementItem[]>([])
  const [factories, setFactories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectAll, setSelectAll] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // 供應商選擇對話框狀態
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false)
  const [currentEditingItemId, setCurrentEditingItemId] = useState<string | null>(null)

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
      const newProcurementItems = orderItems.map((item) => {
        return {
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
        }
      })

      setProcurementItems(newProcurementItems)
      onProcurementDataChange(newProcurementItems)
      return
    }

    // 將訂單項目轉換為採購項目
    const newProcurementItems = orderItems.map((item) => {
      // 查找現有的採購項目
      const existingItem = procurementItems.find((p) => p.productPartNo === item.productPartNo)

      // 從產品資料中獲取工廠信息
      let factoryId = ""
      let factoryName = ""

      // 如果有現有項目，使用其工廠信息
      if (existingItem) {
        factoryId = existingItem.factoryId
        factoryName = existingItem.factoryName
      } else {
        // 嘗試從產品資料中獲取工廠信息
        try {
          if (item.product && item.product.factory_id) {
            factoryId = item.product.factory_id
            const factory = factories.find((f) => f.factory_id === factoryId)
            factoryName = factory ? factory.factory_name || factory.factory_full_name : ""
          }
        } catch (err) {
          console.warn("無法從產品資料獲取工廠信息:", err)
        }
      }

      // 為產品準備工廠選項
      const factoryOptions = factories.map((factory) => ({
        id: factory.factory_id,
        name: factory.factory_name || factory.factory_full_name || `工廠 ${factory.factory_id}`,
        factoryId: factory.factory_id,
        paymentTerm: factory.payment_term,
        deliveryTerm: factory.delivery_term,
      }))

      return {
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
      }
    })

    setProcurementItems(newProcurementItems)
    onProcurementDataChange(newProcurementItems)
  }, [orderItems, factories, loading])

  // 當採購項目變更時，通知父組件
  useEffect(() => {
    onProcurementDataChange(procurementItems)
  }, [procurementItems, onProcurementDataChange])

  // 處理選擇供應商
  const handleSelectSupplier = (supplier: any) => {
    if (!currentEditingItemId) return

    updateProcurementItem(currentEditingItemId, "factoryId", supplier.factory_id)
    updateProcurementItem(currentEditingItemId, "factoryName", supplier.factory_name || supplier.factory_full_name)

    // 更新付款條件和交貨條件
    if (supplier.payment_term) {
      updateProcurementItem(currentEditingItemId, "paymentTerm", supplier.payment_term)
    }

    if (supplier.delivery_term) {
      updateProcurementItem(currentEditingItemId, "deliveryTerm", supplier.delivery_term)
    }
  }

  // 打開供應商選擇對話框
  const openSupplierSelector = (itemId: string) => {
    setCurrentEditingItemId(itemId)
    setSupplierDialogOpen(true)
  }

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>採購資料設定</span>
          <div className="flex items-center space-x-2">
            <Checkbox id="selectAll" checked={selectAll} onCheckedChange={toggleSelectAll} />
            <Label htmlFor="selectAll" className="text-sm font-normal">
              全選
            </Label>
          </div>
        </CardTitle>
        <CardDescription>
          為訂單中的產品設定採購資料，包括供應商、採購價格、交期等。勾選的項目將生成採購單。
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">選擇</TableHead>
                <TableHead>產品編號</TableHead>
                <TableHead>產品名稱</TableHead>
                <TableHead>數量</TableHead>
                <TableHead>供應商</TableHead>
                <TableHead>採購單價</TableHead>
                <TableHead>採購總價</TableHead>
                <TableHead>交期</TableHead>
                <TableHead>備註</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {procurementItems.map((item) => (
                <TableRow key={item.id} className={isCreatingPurchaseOrder && !item.isSelected ? "opacity-50" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={item.isSelected}
                      onCheckedChange={() => toggleItemSelection(item.id)}
                      disabled={isCreatingPurchaseOrder}
                    />
                  </TableCell>
                  <TableCell>{item.productPartNo}</TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateProcurementItem(item.id, "quantity", Number(e.target.value) || 1)}
                      className="w-20"
                      disabled={isCreatingPurchaseOrder}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        value={item.factoryId}
                        onValueChange={(value) => updateProcurementItem(item.id, "factoryId", value)}
                        disabled={isCreatingPurchaseOrder}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="選擇供應商" />
                        </SelectTrigger>
                        <SelectContent>
                          {item.factoryOptions.map((factory) => (
                            <SelectItem key={factory.id} value={factory.id}>
                              {factory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openSupplierSelector(item.id)}
                        disabled={isCreatingPurchaseOrder}
                        className="h-10 w-10"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.purchasePrice}
                      onChange={(e) => updateProcurementItem(item.id, "purchasePrice", Number(e.target.value) || 0)}
                      className="w-24"
                      disabled={isCreatingPurchaseOrder}
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {(item.quantity * item.purchasePrice).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <CustomDatePicker
                      date={item.deliveryDate}
                      setDate={(date) => {
                        console.log("設置交期:", date)
                        updateProcurementItem(item.id, "deliveryDate", date)
                      }}
                      disabled={isCreatingPurchaseOrder}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.notes}
                      onChange={(e) => updateProcurementItem(item.id, "notes", e.target.value)}
                      placeholder="備註"
                      disabled={isCreatingPurchaseOrder}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between bg-muted/20 p-4">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Factory className="h-3 w-3 mr-1" />
            供應商: {procurementItems.filter((item) => item.isSelected && item.factoryId).length}/
            {procurementItems.length}
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <DollarSign className="h-3 w-3 mr-1" />
            總採購金額:{" "}
            {procurementItems
              .filter((item) => item.isSelected)
              .reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0)
              .toFixed(2)}{" "}
            USD
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Calendar className="h-3 w-3 mr-1" />
            最遠交期:{" "}
            {procurementItems
              .filter((item) => item.isSelected && item.deliveryDate)
              .sort((a, b) => {
                if (!a.deliveryDate) return 1
                if (!b.deliveryDate) return -1
                return b.deliveryDate.getTime() - a.deliveryDate.getTime()
              })[0]
              ?.deliveryDate?.toLocaleDateString() || "無"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <TruckIcon className="h-3 w-3 mr-1" />
            已選擇: {procurementItems.filter((item) => item.isSelected).length}/{procurementItems.length}
          </Badge>

          {/* 添加保存採購單按鈕 */}
          <Button
            onClick={savePurchaseOrders}
            disabled={
              isSaving ||
              procurementItems.filter((item) => item.isSelected).length === 0 ||
              !orderId ||
              isCreatingPurchaseOrder
            }
            size="sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Factory className="mr-2 h-4 w-4" />
                生成採購單
              </>
            )}
          </Button>
        </div>
      </CardFooter>
      {/* 供應商選擇對話框 */}
      <SupplierSelectorDialog
        open={supplierDialogOpen}
        onOpenChange={setSupplierDialogOpen}
        onSelect={handleSelectSupplier}
        productPartNo={
          currentEditingItemId
            ? procurementItems.find((item) => item.id === currentEditingItemId)?.productPartNo
            : undefined
        }
        productName={
          currentEditingItemId
            ? procurementItems.find((item) => item.id === currentEditingItemId)?.productName
            : undefined
        }
        currentSupplierId={
          currentEditingItemId
            ? procurementItems.find((item) => item.id === currentEditingItemId)?.factoryId
            : undefined
        }
      />
    </Card>
  )
}
