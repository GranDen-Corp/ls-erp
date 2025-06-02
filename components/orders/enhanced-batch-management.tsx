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
import { CustomDatePicker } from "@/components/ui/custom-date-picker"
import { Plus, Trash2, Package, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  getUnitMultiplier?: (unit: string) => number
}

export function EnhancedBatchManagement({
  isOpen,
  onClose,
  orderItem,
  onUpdateBatches,
  getUnitMultiplier,
}: EnhancedBatchManagementProps) {
  const [batches, setBatches] = useState<ShipmentBatch[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // 默認的單位換算函數
  const defaultGetUnitMultiplier = (unit: string) => {
    const unitLower = unit.toLowerCase()
    if (unitLower.includes("mpcs") || unitLower.includes("1000pcs")) {
      return 1000
    }
    if (unitLower.includes("100pcs")) {
      return 100
    }
    if (unitLower.includes("10pcs")) {
      return 10
    }
    return 1
  }

  // 使用傳入的函數或默認函數
  const unitMultiplier = getUnitMultiplier || defaultGetUnitMultiplier

  useEffect(() => {
    if (isOpen && orderItem) {
      // 計算訂單的實際PCS總數量
      const orderTotalPcs = orderItem.quantity * unitMultiplier(orderItem.unit)

      if (orderItem.shipmentBatches && orderItem.shipmentBatches.length > 0) {
        // 使用現有批次，但確保數量正確
        setBatches(
          orderItem.shipmentBatches.map((batch) => ({
            ...batch,
            plannedShipDate: batch.plannedShipDate ? new Date(batch.plannedShipDate) : undefined,
            actualShipDate: batch.actualShipDate ? new Date(batch.actualShipDate) : undefined,
            estimatedArrivalDate: batch.estimatedArrivalDate ? new Date(batch.estimatedArrivalDate) : undefined,
          })),
        )
      } else {
        // 創建默認批次，包含全部數量
        const defaultBatch: ShipmentBatch = {
          id: `batch-${Date.now()}`,
          productPartNo: orderItem.productPartNo,
          batchNumber: 1,
          plannedShipDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天後
          quantity: orderTotalPcs, // 使用實際PCS數量
          unit: "PCS",
          unitMultiplier: 1,
          notes: "",
          status: "pending",
        }
        setBatches([defaultBatch])
      }
    }
  }, [isOpen, orderItem, unitMultiplier])

  const calculateOrderTotalPcs = () => {
    if (!orderItem) return 0
    return orderItem.quantity * unitMultiplier(orderItem.unit)
  }

  const calculateTotalAllocated = () => {
    return batches.reduce((total, batch) => total + batch.quantity, 0)
  }

  const getRemainingQuantity = () => {
    const orderTotalPcs = calculateOrderTotalPcs()
    const allocatedTotal = calculateTotalAllocated()
    return orderTotalPcs - allocatedTotal
  }

  const addBatch = () => {
    if (!orderItem) return

    const remainingQty = getRemainingQuantity()
    if (remainingQty <= 0) {
      toast({
        title: "無法新增批次",
        description: "所有數量已分配完成",
        variant: "destructive",
      })
      return
    }

    const newBatch: ShipmentBatch = {
      id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productPartNo: orderItem.productPartNo,
      batchNumber: batches.length + 1,
      plannedShipDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天後
      quantity: remainingQty, // 自動分配剩餘數量
      unit: "PCS",
      unitMultiplier: 1,
      notes: "",
      status: "pending",
    }

    setBatches([...batches, newBatch])
  }

  const removeBatch = (batchId: string) => {
    if (batches.length <= 1) {
      toast({
        title: "無法刪除",
        description: "至少需要保留一個批次",
        variant: "destructive",
      })
      return
    }
    setBatches(batches.filter((batch) => batch.id !== batchId))
  }

  const updateBatch = (batchId: string, field: keyof ShipmentBatch, value: any) => {
    setBatches(
      batches.map((batch) => {
        if (batch.id === batchId) {
          return { ...batch, [field]: value }
        }
        return batch
      }),
    )
  }

  const autoDistributeBatches = () => {
    if (!orderItem || batches.length === 0) return

    const orderTotalPcs = calculateOrderTotalPcs()
    const batchCount = batches.length
    const avgQuantityPerBatch = Math.floor(orderTotalPcs / batchCount)
    const remainder = orderTotalPcs % batchCount

    const updatedBatches = batches.map((batch, index) => {
      let batchQuantity = avgQuantityPerBatch

      // 將餘數分配給前幾個批次
      if (index < remainder) {
        batchQuantity += 1
      }

      return {
        ...batch,
        quantity: Math.max(1, batchQuantity), // 確保至少為1
        unit: "PCS",
        unitMultiplier: 1,
      }
    })

    setBatches(updatedBatches)
    toast({
      title: "自動分配完成",
      description: `已將 ${orderTotalPcs} 件平均分配到 ${batchCount} 個批次`,
    })
  }

  const handleSave = () => {
    if (!orderItem) return

    // 驗證批次數量
    const remainingQty = getRemainingQuantity()
    if (remainingQty !== 0) {
      toast({
        title: "批次數量未分配完成",
        description: `還有 ${remainingQty} 件未分配，請調整批次數量後再儲存`,
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

  const getUnitDisplayName = (unit: string) => {
    if (unit === "PCS") return "件"
    return unit
  }

  if (!orderItem) return null

  const orderTotalPcs = calculateOrderTotalPcs()
  const allocatedTotal = calculateTotalAllocated()
  const remainingQty = getRemainingQuantity()

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
                    {orderItem.quantity} × {orderItem.unit}
                    <span className="text-sm text-muted-foreground ml-2">= {orderTotalPcs} 件</span>
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
                  <Label className="text-sm text-muted-foreground">訂單總數量</Label>
                  <p className="text-2xl font-bold text-blue-600">{orderTotalPcs} 件</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">已分配數量</Label>
                  <p className="text-2xl font-bold text-green-600">{allocatedTotal} 件</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">剩餘數量</Label>
                  <p className={`text-2xl font-bold ${remainingQty === 0 ? "text-green-600" : "text-red-600"}`}>
                    {remainingQty} 件
                  </p>
                  {remainingQty !== 0 && (
                    <div className="flex items-center justify-center mt-1">
                      <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-xs text-red-500">需要完成分配</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 批次操作按鈕 */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={addBatch} variant="outline" disabled={remainingQty <= 0}>
              <Plus className="mr-2 h-4 w-4" />
              新增批次
            </Button>
            <Button onClick={autoDistributeBatches} variant="outline" disabled={batches.length === 0}>
              自動平均分配
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
                      <TableHead className="w-24">數量(件)</TableHead>
                      <TableHead className="w-32">計劃出貨日</TableHead>
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
                            min="1"
                            max={batch.quantity + remainingQty}
                            value={batch.quantity}
                            onChange={(e) => updateBatch(batch.id, "quantity", Number.parseInt(e.target.value) || 0)}
                            className="w-20"
                            step="1000"
                          />
                        </TableCell>
                        <TableCell>
                          <CustomDatePicker
                            date={batch.plannedShipDate}
                            setDate={(date) => updateBatch(batch.id, "plannedShipDate", date)}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBatch(batch.id)}
                            disabled={batches.length <= 1}
                          >
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
            <Button
              onClick={handleSave}
              disabled={remainingQty !== 0}
              className={remainingQty !== 0 ? "opacity-50" : ""}
            >
              儲存批次設定
              {remainingQty !== 0 && <span className="ml-2 text-xs">({remainingQty}件未分配)</span>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
