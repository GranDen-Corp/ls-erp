"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, Truck, Package, DollarSign } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { supabaseClient } from "@/lib/supabase-client"

interface OrderItem {
  id: string
  productPartNo: string
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  currency: string
  isAssembly: boolean
  product?: any
}

interface ProductUnit {
  id: number
  category: string
  code: string
  name: string
  value: string
  is_active: boolean
  is_default: boolean
  sort_order: number
}

interface Supplier {
  factory_id: string
  factory_name: string
}

interface ProcurementItem {
  productPartNo: string
  productName: string
  supplierId: string
  supplierName: string
  quantity: number
  unit: string
  unitPrice: number
  currency: string
  expectedDeliveryDate: Date | null
  notes: string
  isAssembly: boolean
}

interface ProcurementProductListProps {
  orderItems: OrderItem[]
  onProcurementDataChange: (data: ProcurementItem[]) => void
  customerCurrency: string
  productUnits: ProductUnit[]
  getUnitMultiplier: (unit: string) => number
}

export function ProcurementProductList({
  orderItems = [],
  onProcurementDataChange,
  customerCurrency = "USD",
  productUnits = [],
  getUnitMultiplier,
}: ProcurementProductListProps) {
  const [procurementData, setProcurementData] = useState<ProcurementItem[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(true)

  // 載入供應商資料
  useEffect(() => {
    async function loadSuppliers() {
      try {
        setLoadingSuppliers(true)
        const { data, error } = await supabaseClient
          .from("suppliers")
          .select("factory_id, factory_name")
          .order("factory_name")

        if (error) {
          console.error("Error loading suppliers:", error)
          return
        }

        setSuppliers(data || [])
      } catch (error) {
        console.error("Failed to fetch suppliers:", error)
      } finally {
        setLoadingSuppliers(false)
      }
    }

    loadSuppliers()
  }, [])

  // 解析組件產品的子零件
  const parseSubPartNo = (subPartNo: any) => {
    if (!subPartNo) return []

    try {
      if (Array.isArray(subPartNo)) {
        return subPartNo
      }

      if (typeof subPartNo === "string") {
        const parsed = JSON.parse(subPartNo)
        return Array.isArray(parsed) ? parsed : []
      }

      if (typeof subPartNo === "object") {
        return [subPartNo]
      }

      return []
    } catch (error) {
      console.error("Error parsing sub_part_no:", error)
      return []
    }
  }

  // 根據產品查找供應商
  const findSupplierForProduct = async (customerId: string, partNo: string) => {
    try {
      const { data, error } = await supabaseClient
        .from("products")
        .select("factory_id")
        .eq("customer_id", customerId)
        .eq("part_no", partNo)
        .single()

      if (error || !data?.factory_id) {
        return { supplierId: "", supplierName: "" }
      }

      const supplier = suppliers.find((s) => s.factory_id === data.factory_id)
      return {
        supplierId: data.factory_id,
        supplierName: supplier?.factory_name || "",
      }
    } catch (error) {
      console.error("Error finding supplier for product:", error)
      return { supplierId: "", supplierName: "" }
    }
  }

  // 初始化採購資料
  useEffect(() => {
    async function initializeProcurementData() {
      if (orderItems.length === 0 || suppliers.length === 0) return

      const procurementItems: ProcurementItem[] = []

      for (const orderItem of orderItems) {
        if (orderItem.isAssembly && orderItem.product?.sub_part_no) {
          // 處理組件產品 - 解析子零件
          const subParts = parseSubPartNo(orderItem.product.sub_part_no)

          for (const subPart of subParts) {
            const partNo = subPart.productId || subPart.part_no || subPart.productPartNo
            if (!partNo) continue

            const { supplierId, supplierName } = await findSupplierForProduct(orderItem.product.customer_id, partNo)

            procurementItems.push({
              productPartNo: partNo,
              productName: subPart.productName || subPart.component_name || partNo,
              supplierId,
              supplierName,
              quantity: (subPart.quantity || 1) * orderItem.quantity, // 子零件數量 × 組件數量
              unit: orderItem.unit,
              unitPrice: 0,
              currency: customerCurrency,
              expectedDeliveryDate: null,
              notes: `組件 ${orderItem.productPartNo} 的子零件`,
              isAssembly: false,
            })
          }
        } else {
          // 處理一般產品
          const { supplierId, supplierName } = await findSupplierForProduct(
            orderItem.product?.customer_id || "",
            orderItem.productPartNo,
          )

          procurementItems.push({
            productPartNo: orderItem.productPartNo,
            productName: orderItem.productName,
            supplierId,
            supplierName,
            quantity: orderItem.quantity,
            unit: orderItem.unit,
            unitPrice: 0,
            currency: customerCurrency,
            expectedDeliveryDate: null,
            notes: "",
            isAssembly: orderItem.isAssembly,
          })
        }
      }

      setProcurementData(procurementItems)
      onProcurementDataChange(procurementItems)
    }

    if (orderItems.length > 0 && suppliers.length > 0) {
      initializeProcurementData()
    }
  }, [orderItems, suppliers, customerCurrency, onProcurementDataChange])

  // 更新採購資料
  const updateProcurementItem = (productPartNo: string, field: keyof ProcurementItem, value: any) => {
    setProcurementData((prev) => {
      const updated = prev.map((item) => (item.productPartNo === productPartNo ? { ...item, [field]: value } : item))
      onProcurementDataChange(updated)
      return updated
    })
  }

  // 處理供應商選擇
  const handleSupplierChange = (productPartNo: string, supplierId: string) => {
    const supplier = suppliers.find((s) => s.factory_id === supplierId)
    updateProcurementItem(productPartNo, "supplierId", supplierId)
    updateProcurementItem(productPartNo, "supplierName", supplier?.factory_name || "")
  }

  // 計算採購總金額
  const calculateProcurementTotal = () => {
    return procurementData.reduce((total, item) => {
      const actualQuantity = item.quantity * getUnitMultiplier(item.unit)
      return total + actualQuantity * item.unitPrice
    }, 0)
  }

  if (orderItems.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <Package className="h-12 w-12 text-muted-foreground" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">尚未添加任何產品</h3>
            <p className="text-sm text-muted-foreground">請先在產品設定中添加產品</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            採購產品列表
          </CardTitle>
          <CardDescription>設定每個產品的採購資訊，包括供應商、價格和交期</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {procurementData.length} 項產品
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <DollarSign className="h-3 w-3 mr-1" />
            採購總額: {calculateProcurementTotal().toFixed(2)} {customerCurrency}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">產品編號</TableHead>
                <TableHead>產品名稱</TableHead>
                <TableHead className="text-center w-[80px]">數量</TableHead>
                <TableHead className="text-center w-[80px]">單位</TableHead>
                <TableHead className="w-[200px]">供應商</TableHead>
                <TableHead className="text-right w-[120px]">採購單價</TableHead>
                <TableHead className="text-right w-[120px]">採購金額</TableHead>
                <TableHead className="w-[150px]">預計交期</TableHead>
                <TableHead className="w-[200px]">備註</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {procurementData.map((item, index) => {
                const actualQuantity = item.quantity * getUnitMultiplier(item.unit)
                const totalPrice = actualQuantity * item.unitPrice

                return (
                  <TableRow key={`${item.productPartNo}-${index}`}>
                    <TableCell className="font-medium">
                      {item.productPartNo}
                      {item.isAssembly && <Badge className="ml-2 bg-purple-500 text-white text-xs">組件</Badge>}
                    </TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateProcurementItem(item.productPartNo, "quantity", Number.parseFloat(e.target.value) || 0)
                        }
                        className="w-20 text-center"
                        min="0"
                        step="1000"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Select
                        value={item.unit}
                        onValueChange={(value) => updateProcurementItem(item.productPartNo, "unit", value)}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {productUnits.map((unit) => (
                            <SelectItem key={unit.id} value={unit.code}>
                              {unit.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.supplierId}
                        onValueChange={(value) => handleSupplierChange(item.productPartNo, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={loadingSuppliers ? "載入中..." : "選擇供應商"} />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingSuppliers ? (
                            <SelectItem value="loading" disabled>
                              載入中...
                            </SelectItem>
                          ) : suppliers.length > 0 ? (
                            suppliers.map((supplier) => (
                              <SelectItem key={supplier.factory_id} value={supplier.factory_id}>
                                {supplier.factory_name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-suppliers" disabled>
                              無可用供應商
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateProcurementItem(
                              item.productPartNo,
                              "unitPrice",
                              Number.parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-24 text-right"
                          min="0"
                          step="0.01"
                        />
                        <span className="text-sm text-muted-foreground">{item.currency}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {totalPrice.toFixed(2)} {item.currency}
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !item.expectedDeliveryDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {item.expectedDeliveryDate ? (
                              format(item.expectedDeliveryDate, "yyyy-MM-dd")
                            ) : (
                              <span>選擇日期</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={item.expectedDeliveryDate || undefined}
                            onSelect={(date) =>
                              updateProcurementItem(item.productPartNo, "expectedDeliveryDate", date || null)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={item.notes}
                        onChange={(e) => updateProcurementItem(item.productPartNo, "notes", e.target.value)}
                        placeholder="採購備註..."
                        rows={2}
                        className="min-w-[180px]"
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
              <TableRow>
                <TableCell colSpan={6} className="text-right font-bold">
                  採購總金額:
                </TableCell>
                <TableCell className="text-right font-bold">
                  {calculateProcurementTotal().toFixed(2)} {customerCurrency}
                </TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
