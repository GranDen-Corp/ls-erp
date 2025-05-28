"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Factory, DollarSign, Package, AlertCircle, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { CustomDatePicker } from "@/components/ui/custom-date-picker"
import { formatCurrencyAmount } from "@/lib/currency-utils"

interface ProcurementProductItem {
  id: string
  productPartNo: string
  productName: string
  orderQuantity: number
  orderUnit: string
  orderUnitPrice: number
  orderCurrency: string

  // 採購資訊
  procurementQuantity: number
  procurementUnit: string
  procurementUnitPrice: number
  procurementCurrency: string
  supplierId: string
  supplierName: string
  expectedDeliveryDate: Date | undefined
  notes: string
  isSelected: boolean

  // 產品資訊
  factoryId?: string
  factoryName?: string
  lastPurchasePrice?: number
  availableSuppliers: Array<{
    id: string
    name: string
    lastPrice?: number
    paymentTerm?: string
    deliveryTerm?: string
  }>
}

interface ProcurementProductListProps {
  orderItems: any[]
  onProcurementDataChange: (items: ProcurementProductItem[]) => void
  customerCurrency: string
  productUnits: Array<{
    id: number
    code: string
    name: string
    value: string
  }>
  getUnitMultiplier: (unit: string) => number
}

export function ProcurementProductList({
  orderItems,
  onProcurementDataChange,
  customerCurrency,
  productUnits,
  getUnitMultiplier,
}: ProcurementProductListProps) {
  const [procurementItems, setProcurementItems] = useState<ProcurementProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectAll, setSelectAll] = useState(true)
  const [suppliers, setSuppliers] = useState<any[]>([])

  // 添加調試信息
  console.log("ProcurementProductList 渲染:", {
    orderItemsLength: orderItems.length,
    suppliersLength: suppliers.length,
    loading,
    error,
  })

  // 獲取單位顯示名稱
  const getUnitDisplayName = (unitValue: string) => {
    const unit = productUnits.find((u) => u.value === unitValue)
    return unit ? unit.code : `${unitValue}PCS`
  }

  // 計算實際數量（考慮單位換算）
  const calculateActualQuantity = (quantity: number, unit: string) => {
    return quantity * getUnitMultiplier(unit)
  }

  // 載入供應商資料
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const supabase = createClient()
        const { data: suppliersData, error: suppliersError } = await supabase
          .from("suppliers")
          .select("*")
          .order("factory_name")

        if (suppliersError) {
          throw new Error(`獲取供應商資料失敗: ${suppliersError.message}`)
        }

        const convertedSuppliers = (suppliersData || []).map((supplier) => ({
          ...supplier,
          factory_id: supplier.id || supplier.supplier_id || supplier.factory_id,
          factory_name: supplier.name || supplier.supplier_name || supplier.factory_name,
        }))

        setSuppliers(convertedSuppliers)
      } catch (err: any) {
        console.error("獲取供應商資料失敗:", err)
        setError(err.message)
      }
    }

    fetchSuppliers()
  }, [])

  // 根據訂單項目生成採購項目
  useEffect(() => {
    console.log("ProcurementProductList useEffect 觸發:", {
      orderItemsLength: orderItems.length,
      suppliersLength: suppliers.length,
    })

    if (orderItems.length === 0) {
      console.log("訂單項目為空，跳過生成採購項目")
      setLoading(false)
      return
    }

    if (suppliers.length === 0) {
      console.log("供應商列表為空，跳過生成採購項目")
      return
    }

    const generateProcurementItems = async () => {
      try {
        setLoading(true)
        console.log("開始生成採購項目...")
        const supabase = createClient()
        const newProcurementItems: ProcurementProductItem[] = []

        for (const orderItem of orderItems) {
          console.log("處理訂單項目:", orderItem.productPartNo)

          // 查詢產品資訊
          const { data: productData, error: productError } = await supabase
            .from("products")
            .select("*")
            .eq("part_no", orderItem.productPartNo)
            .single()

          if (productError) {
            console.warn(`無法找到產品 ${orderItem.productPartNo}:`, productError)
          }

          // 準備可用供應商列表
          const availableSuppliers = suppliers.map((supplier) => ({
            id: supplier.factory_id,
            name: supplier.factory_name,
            paymentTerm: supplier.payment_term,
            deliveryTerm: supplier.delivery_term,
          }))

          // 預設供應商（從產品資料或第一個供應商）
          let defaultSupplierId = ""
          let defaultSupplierName = ""
          const defaultPrice = orderItem.unitPrice * 0.8 // 預設採購價為訂單價的80%

          if (productData && productData.factory_id) {
            const productSupplier = suppliers.find((s) => s.factory_id === productData.factory_id)
            if (productSupplier) {
              defaultSupplierId = productSupplier.factory_id
              defaultSupplierName = productSupplier.factory_name
            }
          }

          if (!defaultSupplierId && suppliers.length > 0) {
            defaultSupplierId = suppliers[0].factory_id
            defaultSupplierName = suppliers[0].factory_name
          }

          const procurementItem: ProcurementProductItem = {
            id: `proc-${orderItem.id}`,
            productPartNo: orderItem.productPartNo,
            productName: orderItem.productName,
            orderQuantity: orderItem.quantity,
            orderUnit: orderItem.unit,
            orderUnitPrice: orderItem.unitPrice,
            orderCurrency: orderItem.currency,

            // 採購資訊（預設與訂單相同）
            procurementQuantity: orderItem.quantity,
            procurementUnit: orderItem.unit,
            procurementUnitPrice: defaultPrice,
            procurementCurrency: "USD", // 預設採購幣別為USD
            supplierId: defaultSupplierId,
            supplierName: defaultSupplierName,
            expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 預設14天後交貨
            notes: "",
            isSelected: true,

            // 產品資訊
            factoryId: productData?.factory_id,
            factoryName: productData?.factory_name,
            availableSuppliers,
          }

          newProcurementItems.push(procurementItem)
        }

        console.log("生成的採購項目:", newProcurementItems)
        setProcurementItems(newProcurementItems)
        onProcurementDataChange(newProcurementItems)
      } catch (err: any) {
        console.error("生成採購項目失敗:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    generateProcurementItems()
  }, [orderItems, suppliers, onProcurementDataChange])

  // 更新採購項目
  const updateProcurementItem = (id: string, field: keyof ProcurementProductItem, value: any) => {
    setProcurementItems((prev) => {
      const newItems = prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }

          // 如果更新供應商，同時更新供應商名稱
          if (field === "supplierId") {
            const supplier = suppliers.find((s) => s.factory_id === value)
            updatedItem.supplierName = supplier ? supplier.factory_name : ""
          }

          return updatedItem
        }
        return item
      })

      onProcurementDataChange(newItems)
      return newItems
    })
  }

  // 切換全選
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)
    setProcurementItems((prev) => {
      const newItems = prev.map((item) => ({ ...item, isSelected: newSelectAll }))
      onProcurementDataChange(newItems)
      return newItems
    })
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

      onProcurementDataChange(newItems)
      return newItems
    })
  }

  // 計算採購總金額
  const calculateProcurementTotal = (item: ProcurementProductItem) => {
    const actualQuantity = calculateActualQuantity(item.procurementQuantity, item.procurementUnit)
    return actualQuantity * item.procurementUnitPrice
  }

  // 計算總採購金額
  const getTotalProcurementAmount = () => {
    return procurementItems
      .filter((item) => item.isSelected)
      .reduce((sum, item) => sum + calculateProcurementTotal(item), 0)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">載入採購資料中...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              採購產品列表
            </CardTitle>
            <CardDescription>根據訂單產品自動生成採購清單，請確認供應商、價格和交期等資訊</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="selectAll" checked={selectAll} onCheckedChange={toggleSelectAll} />
              <label htmlFor="selectAll" className="text-sm font-medium">
                全選
              </label>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              總採購金額: {formatCurrencyAmount(getTotalProcurementAmount(), "USD")}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">選擇</TableHead>
                <TableHead className="w-[120px]">產品編號</TableHead>
                <TableHead className="min-w-[150px]">產品名稱</TableHead>
                <TableHead className="w-[100px]">訂單數量</TableHead>
                <TableHead className="w-[100px]">採購數量</TableHead>
                <TableHead className="w-[100px]">採購單位</TableHead>
                <TableHead className="w-[120px]">採購單價</TableHead>
                <TableHead className="w-[80px]">幣別</TableHead>
                <TableHead className="w-[150px]">供應商</TableHead>
                <TableHead className="w-[120px]">預計交期</TableHead>
                <TableHead className="w-[120px]">採購金額</TableHead>
                <TableHead className="min-w-[150px]">備註</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {procurementItems.map((item) => (
                <TableRow key={item.id} className={item.isSelected ? "bg-blue-50" : ""}>
                  <TableCell>
                    <Checkbox checked={item.isSelected} onCheckedChange={() => toggleItemSelection(item.id)} />
                  </TableCell>
                  <TableCell className="font-medium">{item.productPartNo}</TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell className="text-center">
                    <div className="text-sm">
                      <div>{item.orderQuantity}</div>
                      <Badge variant="outline" className="text-xs">
                        {getUnitDisplayName(item.orderUnit)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.procurementQuantity}
                      onChange={(e) =>
                        updateProcurementItem(item.id, "procurementQuantity", Number(e.target.value) || 0)
                      }
                      min="1"
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.procurementUnit}
                      onValueChange={(value) => updateProcurementItem(item.id, "procurementUnit", value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {productUnits.map((unit) => (
                          <SelectItem key={unit.id} value={unit.value}>
                            {unit.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.procurementUnitPrice}
                      onChange={(e) =>
                        updateProcurementItem(item.id, "procurementUnitPrice", Number(e.target.value) || 0)
                      }
                      min="0"
                      step="0.0001"
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.procurementCurrency}
                      onValueChange={(value) => updateProcurementItem(item.id, "procurementCurrency", value)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="TWD">TWD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="JPY">JPY</SelectItem>
                        <SelectItem value="CNY">CNY</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.supplierId}
                      onValueChange={(value) => updateProcurementItem(item.id, "supplierId", value)}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="選擇供應商" />
                      </SelectTrigger>
                      <SelectContent>
                        {item.availableSuppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <CustomDatePicker
                      date={item.expectedDeliveryDate}
                      setDate={(date) => updateProcurementItem(item.id, "expectedDeliveryDate", date)}
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {calculateProcurementTotal(item).toFixed(2)} {item.procurementCurrency}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.notes}
                      onChange={(e) => updateProcurementItem(item.id, "notes", e.target.value)}
                      placeholder="備註"
                      className="w-36"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 統計資訊 */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">總產品數:</span>
              <span className="font-semibold">{procurementItems.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">已選擇:</span>
              <span className="font-semibold">{procurementItems.filter((item) => item.isSelected).length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Factory className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-600">供應商數:</span>
              <span className="font-semibold">
                {new Set(procurementItems.filter((item) => item.isSelected).map((item) => item.supplierId)).size}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">總採購金額:</span>
              <span className="font-bold text-green-700">
                {formatCurrencyAmount(getTotalProcurementAmount(), "USD")}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
