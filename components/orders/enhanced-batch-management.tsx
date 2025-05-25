"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Plus, Trash2, Package } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { useToast } from "@/hooks/use-toast"

interface ProductUnit {
  code: string
  name: string
  value: string
  multiplier: number
}

interface ShipmentBatch {
  id: string
  productPartNo: string
  batchNumber: number
  plannedShipDate: Date | undefined
  quantity: number
  unit: string
  unitMultiplier: number
  notes?: string
  status?: string
  trackingNumber?: string
  actualShipDate?: Date
  estimatedArrivalDate?: Date
}

interface OrderItem {
  id: string
  productPartNo: string
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  shipmentBatches: ShipmentBatch[]
}

interface EnhancedBatchManagementProps {
  isOpen: boolean
  onClose: () => void
  orderItem: OrderItem | null
  onUpdateBatches: (productPartNo: string, batches: ShipmentBatch[]) => void
}

export function EnhancedBatchManagement({ isOpen, onClose, orderItem, onUpdateBatches }: EnhancedBatchManagementProps) {
  const [batches, setBatches] = useState<ShipmentBatch[]>([])
  const [productUnits, setProductUnits] = useState<ProductUnit[]>([])
  const [selectedUnit, setSelectedUnit] = useState<string>("MPCS")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchProductUnits()
      if (orderItem) {
        setBatches(orderItem.shipmentBatches || [])
        setSelectedUnit(orderItem.unit || "MPCS")
      }
    }
  }, [isOpen, orderItem])

  const fetchProductUnits = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("static_parameters")
        .select("*")
        .eq("category", "product_unit")
        .eq("is_active", true)
        .order("sort_order")

      if (error) throw error

      const units = (data || []).map((param) => ({
        code: param.code,
        name: param.name,
        value: param.value || "1",
        multiplier: Number.parseInt(param.value || "1"),
      }))

      setProductUnits(units)
    } catch (error: any) {
      console.error("獲取產品單位失敗:", error)
      toast({
        title: "載入失敗",
        description: "無法載入產品單位設定",
        variant: "destructive",
      })
    }
  }

  const getUnitMultiplier = (unitCode: string) => {
    const unit = productUnits.find((u) => u.code === unitCode)
    return unit ? unit.multiplier : 1
  }

  const getUnitName = (unitCode: string) => {
    const unit = productUnits.find((u) => u.code === unitCode)
    return unit ? unit.name : unitCode
  }

  const addBatch = () => {
    if (!orderItem) return

    const newBatch: ShipmentBatch = {
      id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productPartNo: orderItem.productPartNo,
      batchNumber: batches.length + 1,
      plannedShipDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天後
      quantity: 0,
      unit: selectedUnit,
      unitMultiplier: getUnitMultiplier(selectedUnit),
      notes: "",
      status: "pending",
    }

    setBatches([...batches, newBatch])
  }

  const removeBatch = (batchId: string) => {
    setBatches(batches.filter((batch) => batch.id !== batchId))
  }

  const updateBatch = (batchId: string, field: keyof ShipmentBatch, value: any) => {
    setBatches(
      batches.map((batch) => {
        if (batch.id === batchId) {
          const updatedBatch = { ...batch, [field]: value }

          // 如果更新單位，同時更新單位倍數
          if (field === "unit") {
            updatedBatch.unitMultiplier = getUnitMultiplier(value)
          }

          return updatedBatch
        }
        return batch
      }),
    )
  }

  const calculateTotalQuantity = () => {
    return batches.reduce((total, batch) => {
      // 將批次數量轉換為基本單位（PCS）
      return total + batch.quantity * batch.unitMultiplier
    }, 0)
  }

  const calculateOrderQuantityInPcs = () => {
    if (!orderItem) return 0
    const orderUnitMultiplier = getUnitMultiplier(orderItem.unit)
    return orderItem.quantity * orderUnitMultiplier
  }

  const getRemainingQuantity = () => {
    const orderTotalPcs = calculateOrderQuantityInPcs()
    const batchTotalPcs = calculateTotalQuantity()
    return orderTotalPcs - batchTotalPcs
  }

  const handleSave = () => {
    if (!orderItem) return

    // 驗證批次數量
    const remainingQty = getRemainingQuantity()
    if (remainingQty !== 0) {
      toast({
        title: "數量不符",
        description: `批次總數量與訂單數量不符，差異: ${remainingQty} PCS`,
        variant: "destructive",
      })
      return
    }

    // 驗證每個批次都有設定數量和日期
    const invalidBatches = batches.filter((batch) => batch.quantity <= 0 || !batch.plannedShipDate)

    if (invalidBatches.length > 0) {
      toast({
        title: "資料不完整",
        description: "請確保所有批次都有設定數量和計劃出貨日期",
        variant: "destructive",
      })
      return
    }

    onUpdateBatches(orderItem.productPartNo, batches)
    toast({
      title: "批次設定已儲存",
      description: `已設定 ${batches.length} 個批次`,
    })
    onClose()
  }

  const autoDistributeBatches = () => {
    if (!orderItem || batches.length === 0) return

    const orderTotalPcs = calculateOrderQuantityInPcs()
    const batchCount = batches.length
    const avgQuantityPerBatch = Math.floor(orderTotalPcs / batchCount)
    const remainder = orderTotalPcs % batchCount

    const updatedBatches = batches.map((batch, index) => {
      // 將平均數量轉換為當前批次的單位
      let batchQuantity = Math.floor(avgQuantityPerBatch / batch.unitMultiplier)

      // 將餘數分配給前幾個批次
      if (index < remainder) {
        batchQuantity += Math.ceil(1 / batch.unitMultiplier)
      }

      return {
        ...batch,
        quantity: Math.max(1, batchQuantity), // 確保至少為1
      }
    })

    setBatches(updatedBatches)
  }

  if (!orderItem) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            批次出貨管理 - {orderItem.productPartNo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 產品資訊卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">產品資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">產品編號</Label>
                  <p className="font-medium">{orderItem.productPartNo}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">產品名稱</Label>
                  <p className="font-medium">{orderItem.productName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">訂單數量</Label>
                  <p className="font-medium">
                    {orderItem.quantity} {getUnitName(orderItem.unit)}
                    <span className="text-sm text-muted-foreground ml-2">({calculateOrderQuantityInPcs()} PCS)</span>
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">單價</Label>
                  <p className="font-medium">${orderItem.unitPrice.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 批次數量統計 */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Label className="text-sm text-muted-foreground">已分配數量</Label>
                  <p className="text-2xl font-bold text-blue-600">{calculateTotalQuantity()} PCS</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">剩餘數量</Label>
                  <p
                    className={`text-2xl font-bold ${getRemainingQuantity() === 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {getRemainingQuantity()} PCS
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">批次數量</Label>
                  <p className="text-2xl font-bold text-purple-600">{batches.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 批次操作按鈕 */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Label htmlFor="unit-select">新批次單位:</Label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {productUnits.map((unit) => (
                    <SelectItem key={unit.code} value={unit.code}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addBatch} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              新增批次
            </Button>
            <Button onClick={autoDistributeBatches} variant="outline" disabled={batches.length === 0}>
              自動分配數量
            </Button>
          </div>

          {/* 批次列表 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">批次設定</CardTitle>
            </CardHeader>
            <CardContent>
              {batches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">尚未設定批次，請點擊「新增批次」開始設定</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">批次</TableHead>
                      <TableHead className="w-24">數量</TableHead>
                      <TableHead className="w-24">單位</TableHead>
                      <TableHead className="w-32">計劃出貨日</TableHead>
                      <TableHead className="w-32">實際出貨日</TableHead>
                      <TableHead className="w-24">狀態</TableHead>
                      <TableHead>備註</TableHead>
                      <TableHead className="w-16">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.map((batch, index) => (
                      <TableRow key={batch.id}>
                        <TableCell>
                          <Badge variant="outline">#{batch.batchNumber}</Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={batch.quantity}
                            onChange={(e) => updateBatch(batch.id, "quantity", Number.parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                          <div className="text-xs text-muted-foreground mt-1">
                            = {batch.quantity * batch.unitMultiplier} PCS
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select value={batch.unit} onValueChange={(value) => updateBatch(batch.id, "unit", value)}>
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {productUnits.map((unit) => (
                                <SelectItem key={unit.code} value={unit.code}>
                                  {unit.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <DatePicker
                            date={batch.plannedShipDate}
                            setDate={(date) => updateBatch(batch.id, "plannedShipDate", date)}
                          />
                        </TableCell>
                        <TableCell>
                          <DatePicker
                            date={batch.actualShipDate}
                            setDate={(date) => updateBatch(batch.id, "actualShipDate", date)}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={batch.status || "pending"}
                            onValueChange={(value) => updateBatch(batch.id, "status", value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">待出貨</SelectItem>
                              <SelectItem value="shipped">已出貨</SelectItem>
                              <SelectItem value="delivered">已送達</SelectItem>
                              <SelectItem value="delayed">延遲</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Textarea
                            value={batch.notes || ""}
                            onChange={(e) => updateBatch(batch.id, "notes", e.target.value)}
                            placeholder="批次備註"
                            className="min-h-[60px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => removeBatch(batch.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* 操作按鈕 */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSave}>儲存批次設定</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
