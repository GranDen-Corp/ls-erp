"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Truck, Package, DollarSign, ArrowRight } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { supabaseClient } from "@/lib/supabase-client"

interface OrderItem {
  id: string
  orderSequence: string // 新增：訂單產品序號
  productPartNo: string
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  currency: string
  isAssembly: boolean
  product?: any
  shipmentBatches: Array<{
    id: string
    batchNumber: number
    quantity: number
    plannedShipDate: Date | string
    status?: string
    notes?: string
  }>
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

interface Factory {
  factory_id: string
  factory_name: string
  currency?: string // 新增工廠貨幣欄位
}

interface ProcurementBatch {
  id: string
  orderSequence: string // 對應的訂單產品序號
  orderBatchNumber: number // 對應的訂單批次號
  productPartNo: string
  productName: string
  factoryId: string
  factoryName: string
  quantity: number
  unit: string
  unitPrice: number
  currency: string
  expectedDeliveryDate: Date | null
  notes: string
  isAssembly: boolean
  orderBatchId: string // 對應的訂單批次ID
}

interface ProcurementProductListProps {
  orderItems: OrderItem[]
  onProcurementDataChange: (data: ProcurementBatch[]) => void
  customerCurrency: string
  productUnits: ProductUnit[]
  getUnitMultiplier: (unit: string) => number
  disabled?: boolean
  orderNumber: string // 新增：訂單編號
}

export function ProcurementProductList({
  orderItems = [],
  onProcurementDataChange,
  customerCurrency = "USD",
  productUnits = [],
  getUnitMultiplier,
  disabled = false,
  orderNumber,
}: ProcurementProductListProps) {
  const [procurementBatches, setProcurementBatches] = useState<ProcurementBatch[]>([])
  const [factories, setFactories] = useState<Factory[]>([])
  const [loadingFactories, setLoadingFactories] = useState(true)

  // 載入供應商資料
  useEffect(() => {
    async function loadFactories() {
      try {
        setLoadingFactories(true)
        const { data, error } = await supabaseClient
          .from("factories")
          .select("factory_id, factory_name, currency")
          .order("factory_name")

        if (error) {
          console.error("Error loading factories:", error)
          return
        }

        setFactories(data || [])
      } catch (error) {
        console.error("Failed to fetch factories:", error)
      } finally {
        setLoadingFactories(false)
      }
    }

    loadFactories()
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

  // 根據產品查找供應商和歷史採購價格
  const findFactoryForProduct = async (customerId: string, partNo: string) => {
    try {
      const { data, error } = await supabaseClient
        .from("products")
        .select("factory_id, last_purchase_price")
        .eq("customer_id", customerId)
        .eq("part_no", partNo)
        .single()

      if (error || !data?.factory_id) {
        return { factoryId: "", factoryName: "", lastPurchasePrice: 0 }
      }

      const factory = factories.find((s) => s.factory_id === data.factory_id)
      return {
        factoryId: data.factory_id,
        factoryName: factory?.factory_name || "",
        factoryCurrency: factory?.currency || "USD", // 新增工廠貨幣
        lastPurchasePrice: data.last_purchase_price || 0, // 新增歷史採購價格
      }
    } catch (error) {
      console.error("Error finding factory for product:", error)
      return { factoryId: "", factoryName: "", lastPurchasePrice: 0 }
    }
  }

  // 初始化採購批次資料 - 根據訂單產品的批次來建立
  useEffect(() => {
    async function initializeProcurementBatches() {
      if (orderItems.length === 0 || factories.length === 0) return

      const procurementBatches: ProcurementBatch[] = []

      for (const orderItem of orderItems) {
        if (orderItem.isAssembly && orderItem.product?.sub_part_no) {
          // 處理組件產品 - 解析子零件，每個訂單批次對應多個子零件採購批次
          const subParts = parseSubPartNo(orderItem.product.sub_part_no)

          for (const orderBatch of orderItem.shipmentBatches) {
            for (const subPart of subParts) {
              const partNo = subPart.productId || subPart.part_no || subPart.productPartNo
              if (!partNo) continue

              const { factoryId, factoryName, factoryCurrency, lastPurchasePrice } = await findFactoryForProduct(
                orderItem.product.customer_id,
                partNo,
              )

              procurementBatches.push({
                id: `${orderBatch.id}-${partNo}`,
                orderSequence: orderItem.orderSequence,
                orderBatchNumber: orderBatch.batchNumber,
                productPartNo: partNo,
                productName: subPart.productName || subPart.component_name || partNo,
                factoryId: factoryId,
                factoryName: factoryName,
                quantity: (subPart.quantity || 1) * orderBatch.quantity,
                unit: orderItem.unit,
                unitPrice: lastPurchasePrice, // 使用歷史採購價格
                currency: factoryCurrency, // 使用工廠貨幣
                expectedDeliveryDate: null,
                notes: `組件 ${orderItem.productPartNo} 批次 ${orderBatch.batchNumber} 的子零件`,
                isAssembly: false,
                orderBatchId: orderBatch.id,
              })
            }
          }
        } else {
          // 處理一般產品 - 每個訂單批次對應一個採購批次
          const { factoryId, factoryName, factoryCurrency, lastPurchasePrice } = await findFactoryForProduct(
            orderItem.product?.customer_id || "",
            orderItem.productPartNo,
          )

          for (const orderBatch of orderItem.shipmentBatches) {
            procurementBatches.push({
              id: `${orderBatch.id}-${orderItem.productPartNo}`,
              orderSequence: orderItem.orderSequence,
              orderBatchNumber: orderBatch.batchNumber,
              productPartNo: orderItem.productPartNo,
              productName: orderItem.productName,
              factoryId: factoryId,
              factoryName: factoryName,
              quantity: orderBatch.quantity,
              unit: orderItem.unit,
              unitPrice: lastPurchasePrice, // 使用歷史採購價格
              currency: factoryCurrency, // 使用工廠貨幣
              expectedDeliveryDate: null,
              notes: `批次 ${orderBatch.batchNumber}`,
              isAssembly: orderItem.isAssembly,
              orderBatchId: orderBatch.id,
            })
          }
        }
      }

      setProcurementBatches(procurementBatches)
      onProcurementDataChange(procurementBatches)
    }

    if (orderItems.length > 0 && factories.length > 0) {
      initializeProcurementBatches()
    }
  }, [orderItems, factories, customerCurrency, onProcurementDataChange])

  // 更新採購批次資料
  const updateProcurementBatch = (batchId: string, field: keyof ProcurementBatch, value: any) => {
    setProcurementBatches((prev) => {
      const updated = prev.map((batch) => (batch.id === batchId ? { ...batch, [field]: value } : batch))
      onProcurementDataChange(updated)
      return updated
    })
  }

  // 處理供應商選擇
  const handleFactoryChange = (batchId: string, factoryId: string) => {
    const factory = factories.find((s) => s.factory_id === factoryId)
    updateProcurementBatch(batchId, "factoryId", factoryId)
    updateProcurementBatch(batchId, "factoryName", factory?.factory_name || "")
    updateProcurementBatch(batchId, "currency", factory?.currency || "USD") // 更新貨幣
  }

  // 計算採購總金額
  const calculateProcurementTotal = () => {
    return procurementBatches.reduce((total, batch) => {
      const actualQuantity = batch.quantity * getUnitMultiplier(batch.unit)
      return total + actualQuantity * batch.unitPrice
    }, 0)
  }

  // 按貨幣分組計算採購總金額
  const calculateProcurementTotalByCurrency = () => {
    const totals: Record<string, number> = {}

    procurementBatches.forEach((batch) => {
      const actualQuantity = batch.quantity * getUnitMultiplier(batch.unit)
      const amount = actualQuantity * batch.unitPrice

      if (!totals[batch.currency]) {
        totals[batch.currency] = 0
      }
      totals[batch.currency] += amount
    })

    return totals
  }

  // 生成採購單編號
  const generatePurchaseOrderNumber = (orderNumber: string, sequence: string) => {
    if (!orderNumber || !orderNumber.startsWith("L-")) return ""
    const baseNumber = orderNumber.replace("L-", "LP-")
    return `${baseNumber}-${sequence}`
  }

  // 生成完整採購單批號
  const generatePurchaseBatchNumber = (orderNumber: string, sequence: string, batchNumber: number) => {
    const baseNumber = generatePurchaseOrderNumber(orderNumber, sequence)
    return baseNumber ? `${baseNumber}-${batchNumber}` : ""
  }

  // 按訂單產品序號分組顯示
  const groupedBatches = procurementBatches.reduce(
    (groups, batch) => {
      const key = batch.orderSequence
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(batch)
      return groups
    },
    {} as Record<string, ProcurementBatch[]>,
  )

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
            採購批次列表
          </CardTitle>
          <CardDescription>根據訂單產品批次設定對應的採購批次資訊</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {procurementBatches.length} 個採購批次
          </Badge>
          {Object.entries(calculateProcurementTotalByCurrency()).map(([currency, total]) => (
            <Badge key={currency} variant="outline" className="bg-green-50 text-green-700">
              <DollarSign className="h-3 w-3 mr-1" />
              {currency}: {total.toFixed(2)}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedBatches).map(([orderSequence, batches]) => {
            const orderItem = orderItems.find((item) => item.orderSequence === orderSequence)
            const purchaseOrderNumber = generatePurchaseOrderNumber(orderNumber, orderSequence)

            return (
              <div key={orderSequence} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 font-bold text-lg px-3 py-1">
                        {orderSequence}
                      </Badge>
                      {purchaseOrderNumber && (
                        <div className="text-base font-medium text-blue-600 mt-1">{purchaseOrderNumber}</div>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div>
                      <h3 className="font-semibold text-lg">{orderItem?.productPartNo}</h3>
                      <p className="text-sm text-gray-600">{orderItem?.productName}</p>
                    </div>
                    {orderItem?.isAssembly && <Badge className="bg-purple-500 text-white">組件</Badge>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      訂單總量: {orderItem?.quantity} {orderItem?.unit}
                    </p>
                    <p className="text-sm text-gray-600">批次數: {orderItem?.shipmentBatches.length}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">批次</TableHead>
                        <TableHead className="w-[140px]">產品編號</TableHead>
                        <TableHead className="min-w-[180px]">產品名稱</TableHead>
                        <TableHead className="text-center w-[100px]">數量</TableHead>
                        <TableHead className="text-center w-[80px]">單位</TableHead>
                        <TableHead className="w-[220px]">供應商</TableHead>
                        <TableHead className="text-right w-[140px]">採購單價</TableHead>
                        <TableHead className="text-right w-[140px]">採購金額</TableHead>
                        <TableHead className="w-[160px]">預計交期</TableHead>
                        <TableHead className="w-[240px]">備註</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batches.map((batch) => {
                        const actualQuantity = batch.quantity * getUnitMultiplier(batch.unit)
                        const totalPrice = actualQuantity * batch.unitPrice
                        const purchaseBatchNumber = generatePurchaseBatchNumber(
                          orderNumber,
                          orderSequence,
                          batch.orderBatchNumber,
                        )

                        return (
                          <TableRow key={batch.id}>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center gap-1">
                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                  #{batch.orderBatchNumber}
                                </Badge>
                                {purchaseBatchNumber && (
                                  <div className="text-sm font-medium text-blue-600 mt-1">{purchaseBatchNumber}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{batch.productPartNo}</TableCell>
                            <TableCell>{batch.productName}</TableCell>
                            <TableCell className="text-center">
                              <Input
                                type="number"
                                value={batch.quantity}
                                onChange={(e) =>
                                  updateProcurementBatch(batch.id, "quantity", Number.parseFloat(e.target.value) || 0)
                                }
                                className="w-20 text-center"
                                min="0"
                                step="1000"
                                disabled={disabled}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Select
                                value={batch.unit}
                                onValueChange={(value) => updateProcurementBatch(batch.id, "unit", value)}
                                disabled={disabled}
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
                                value={batch.factoryId}
                                onValueChange={(value) => handleFactoryChange(batch.id, value)}
                                disabled={disabled}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={loadingFactories ? "載入中..." : "選擇供應商"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {loadingFactories ? (
                                    <SelectItem value="loading" disabled>
                                      載入中...
                                    </SelectItem>
                                  ) : factories.length > 0 ? (
                                    factories.map((factory) => (
                                      <SelectItem key={factory.factory_id} value={factory.factory_id}>
                                        {factory.factory_name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="no-factories" disabled>
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
                                  value={batch.unitPrice}
                                  onChange={(e) =>
                                    updateProcurementBatch(
                                      batch.id,
                                      "unitPrice",
                                      Number.parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-24 text-right"
                                  min="0"
                                  step="0.01"
                                  disabled={disabled}
                                />
                                <span className="text-sm text-muted-foreground">{batch.currency}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {totalPrice.toFixed(2)} {batch.currency}
                            </TableCell>
                            <TableCell>
                              <DatePicker
                                date={batch.expectedDeliveryDate}
                                onDateChange={(date) =>
                                  updateProcurementBatch(batch.id, "expectedDeliveryDate", date || null)
                                }
                                placeholder="選擇交期"
                                disabled={disabled}
                              />
                            </TableCell>
                            <TableCell>
                              <Textarea
                                value={batch.notes}
                                onChange={(e) => updateProcurementBatch(batch.id, "notes", e.target.value)}
                                placeholder="採購備註..."
                                rows={2}
                                className="min-w-[180px]"
                                disabled={disabled}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )
          })}

          {/* 總計 */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="text-right space-y-1">
                {Object.entries(calculateProcurementTotalByCurrency()).map(([currency, total]) => (
                  <p key={currency} className="text-lg font-bold">
                    採購總額 ({currency}): {total.toFixed(2)}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
