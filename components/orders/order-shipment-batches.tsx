"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit } from "lucide-react"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { DatePicker } from "@/components/ui/date-picker"

interface ShipmentBatch {
  id: string
  orderId: string
  batchNumber: number
  quantity: number
  plannedShipDate: string
  actualShipDate?: string
  status: "pending" | "shipped" | "delivered" | "delayed"
  customerUpdatedDeliveryDate?: string
  factoryActualDeliveryDate?: string
  isDelayed: boolean
  trackingNumber?: string
  notes?: string
}

interface OrderShipmentBatchesProps {
  orderId: string
  totalQuantity: number
  batches: ShipmentBatch[]
  onAddBatch: (batch: Omit<ShipmentBatch, "id">) => void
  onUpdateBatch: (batch: ShipmentBatch) => void
}

export function OrderShipmentBatches({
  orderId,
  totalQuantity,
  batches,
  onAddBatch,
  onUpdateBatch,
}: OrderShipmentBatchesProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<ShipmentBatch | null>(null)

  // 新批次的表單狀態
  const [newBatchQuantity, setNewBatchQuantity] = useState(0)
  const [newBatchPlannedDate, setNewBatchPlannedDate] = useState<Date | undefined>(new Date())
  const [newBatchNotes, setNewBatchNotes] = useState("")

  // 編輯批次的表單狀態
  const [editQuantity, setEditQuantity] = useState(0)
  const [editPlannedDate, setEditPlannedDate] = useState<Date | undefined>(new Date())
  const [editActualDate, setEditActualDate] = useState<Date | undefined>(undefined)
  const [editStatus, setEditStatus] = useState<ShipmentBatch["status"]>("pending")
  const [editTrackingNumber, setEditTrackingNumber] = useState("")
  const [editNotes, setEditNotes] = useState("")

  // 計算已分配的數量
  const allocatedQuantity = batches.reduce((sum, batch) => sum + batch.quantity, 0)
  const remainingQuantity = totalQuantity - allocatedQuantity

  // 處理添加新批次
  const handleAddBatch = () => {
    if (newBatchQuantity <= 0 || !newBatchPlannedDate) return

    const newBatch = {
      orderId,
      batchNumber: batches.length + 1,
      quantity: newBatchQuantity,
      plannedShipDate: newBatchPlannedDate.toISOString().split("T")[0],
      status: "pending" as const,
      isDelayed: false,
      notes: newBatchNotes,
    }

    onAddBatch(newBatch)
    setIsAddDialogOpen(false)
    resetNewBatchForm()
  }

  // 處理更新批次
  const handleUpdateBatch = () => {
    if (!editingBatch || editQuantity <= 0 || !editPlannedDate) return

    const updatedBatch = {
      ...editingBatch,
      quantity: editQuantity,
      plannedShipDate: editPlannedDate.toISOString().split("T")[0],
      actualShipDate: editActualDate ? editActualDate.toISOString().split("T")[0] : undefined,
      status: editStatus,
      trackingNumber: editTrackingNumber,
      notes: editNotes,
    }

    onUpdateBatch(updatedBatch)
    setIsEditDialogOpen(false)
    setEditingBatch(null)
  }

  // 打開編輯對話框
  const openEditDialog = (batch: ShipmentBatch) => {
    setEditingBatch(batch)
    setEditQuantity(batch.quantity)
    setEditPlannedDate(batch.plannedShipDate ? new Date(batch.plannedShipDate) : new Date())
    setEditActualDate(batch.actualShipDate ? new Date(batch.actualShipDate) : undefined)
    setEditStatus(batch.status)
    setEditTrackingNumber(batch.trackingNumber || "")
    setEditNotes(batch.notes || "")
    setIsEditDialogOpen(true)
  }

  // 重置新批次表單
  const resetNewBatchForm = () => {
    setNewBatchQuantity(0)
    setNewBatchPlannedDate(new Date())
    setNewBatchNotes("")
  }

  // 獲取狀態顯示名稱
  const getStatusDisplay = (status: ShipmentBatch["status"]) => {
    const statusMap: Record<ShipmentBatch["status"], { text: string; color: string }> = {
      pending: { text: "待出貨", color: "bg-yellow-500" },
      shipped: { text: "已出貨", color: "bg-blue-500" },
      delivered: { text: "已送達", color: "bg-green-500" },
      delayed: { text: "延遲", color: "bg-red-500" },
    }

    return statusMap[status] || { text: status, color: "bg-gray-500" }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>分批出貨管理</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={remainingQuantity <= 0}>
                <Plus className="mr-2 h-4 w-4" />
                新增批次
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增出貨批次</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">數量 (剩餘可分配: {remainingQuantity})</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={remainingQuantity}
                    value={newBatchQuantity}
                    onChange={(e) => setNewBatchQuantity(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plannedDate">計劃出貨日期</Label>
                  <DatePicker date={newBatchPlannedDate} setDate={setNewBatchPlannedDate} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">備註</Label>
                  <Textarea
                    id="notes"
                    value={newBatchNotes}
                    onChange={(e) => setNewBatchNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleAddBatch}
                  disabled={newBatchQuantity <= 0 || newBatchQuantity > remainingQuantity}
                >
                  新增批次
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">總數量:</span> {totalQuantity}
              </div>
              <div>
                <span className="font-medium">已分配:</span> {allocatedQuantity} (
                {((allocatedQuantity / totalQuantity) * 100).toFixed(1)}%)
              </div>
              <div>
                <span className="font-medium">剩餘:</span> {remainingQuantity}
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>批次</TableHead>
                    <TableHead>數量</TableHead>
                    <TableHead>計劃出貨日期</TableHead>
                    <TableHead>實際出貨日期</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>追蹤號碼</TableHead>
                    <TableHead>備註</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        尚未設定分批出貨
                      </TableCell>
                    </TableRow>
                  ) : (
                    batches.map((batch) => {
                      const status = getStatusDisplay(batch.status)
                      return (
                        <TableRow key={batch.id}>
                          <TableCell>批次 {batch.batchNumber}</TableCell>
                          <TableCell>{batch.quantity}</TableCell>
                          <TableCell>
                            {batch.plannedShipDate
                              ? format(new Date(batch.plannedShipDate), "yyyy/MM/dd", { locale: zhTW })
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {batch.actualShipDate
                              ? format(new Date(batch.actualShipDate), "yyyy/MM/dd", { locale: zhTW })
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${status.color} text-white`}>{status.text}</Badge>
                          </TableCell>
                          <TableCell>{batch.trackingNumber || "-"}</TableCell>
                          <TableCell>{batch.notes || "-"}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(batch)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯出貨批次</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">數量</Label>
              <Input
                id="edit-quantity"
                type="number"
                min="1"
                value={editQuantity}
                onChange={(e) => setEditQuantity(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-planned-date">計劃出貨日期</Label>
              <DatePicker date={editPlannedDate} setDate={setEditPlannedDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-actual-date">實際出貨日期</Label>
              <DatePicker date={editActualDate} setDate={setEditActualDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">狀態</Label>
              <select
                id="edit-status"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as ShipmentBatch["status"])}
              >
                <option value="pending">待出貨</option>
                <option value="shipped">已出貨</option>
                <option value="delivered">已送達</option>
                <option value="delayed">延遲</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tracking">追蹤號碼</Label>
              <Input
                id="edit-tracking"
                value={editTrackingNumber}
                onChange={(e) => setEditTrackingNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">備註</Label>
              <Textarea id="edit-notes" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} />
            </div>
            <Button onClick={handleUpdateBatch} disabled={editQuantity <= 0}>
              更新批次
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
