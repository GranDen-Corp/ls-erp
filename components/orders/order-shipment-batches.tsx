"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Plus, Edit } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ShipmentBatch } from "@/types/order"

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
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date>()
  const [quantity, setQuantity] = useState("")
  const [notes, setNotes] = useState("")
  const [editBatch, setEditBatch] = useState<ShipmentBatch | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editDate, setEditDate] = useState<Date>()
  const [editQuantity, setEditQuantity] = useState("")
  const [editNotes, setEditNotes] = useState("")

  const totalShippedQuantity = batches.reduce((sum, batch) => sum + batch.quantity, 0)
  const remainingQuantity = totalQuantity - totalShippedQuantity

  const handleAddBatch = () => {
    if (!date || !quantity) return

    onAddBatch({
      orderId,
      batchNumber: batches.length + 1,
      quantity: Number.parseInt(quantity),
      plannedShipDate: date.toISOString(),
      status: "pending",
      isDelayed: false,
      notes,
    })

    setOpen(false)
    setDate(undefined)
    setQuantity("")
    setNotes("")
  }

  const handleEditBatch = (batch: ShipmentBatch) => {
    setEditBatch(batch)
    setEditDate(new Date(batch.plannedShipDate))
    setEditQuantity(batch.quantity.toString())
    setEditNotes(batch.notes || "")
    setEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editBatch || !editDate || !editQuantity) return

    onUpdateBatch({
      ...editBatch,
      quantity: Number.parseInt(editQuantity),
      plannedShipDate: editDate.toISOString(),
      notes: editNotes,
    })

    setEditOpen(false)
    setEditBatch(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">待出貨</Badge>
      case "shipped":
        return <Badge variant="secondary">已出貨</Badge>
      case "delivered":
        return <Badge variant="success">已送達</Badge>
      case "delayed":
        return <Badge variant="destructive">延遲</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>訂單分批出貨管理</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              添加批次
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加出貨批次</DialogTitle>
              <DialogDescription>為此訂單添加新的出貨批次。剩餘可出貨數量：{remainingQuantity}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  批次數量
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  className="col-span-3"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  max={remainingQuantity}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  計劃出貨日期
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "yyyy-MM-dd") : "選擇日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  備註
                </Label>
                <Input id="notes" className="col-span-3" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddBatch}>確認添加</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-sm text-muted-foreground">
            訂單總數量: {totalQuantity} | 已安排批次數量: {totalShippedQuantity} | 剩餘未安排數量: {remainingQuantity}
          </div>
        </div>
        {batches.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>批次</TableHead>
                <TableHead>數量</TableHead>
                <TableHead>計劃出貨日期</TableHead>
                <TableHead>實際出貨日期</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>備註</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell>第 {batch.batchNumber} 批</TableCell>
                  <TableCell>{batch.quantity}</TableCell>
                  <TableCell>{format(new Date(batch.plannedShipDate), "yyyy-MM-dd")}</TableCell>
                  <TableCell>
                    {batch.actualShipDate ? format(new Date(batch.actualShipDate), "yyyy-MM-dd") : "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(batch.status)}</TableCell>
                  <TableCell>{batch.notes || "-"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleEditBatch(batch)}>
                      <Edit className="h-4 w-4 mr-1" />
                      編輯
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">尚未添加出貨批次，請點擊「添加批次」按鈕</p>
          </div>
        )}

        {/* 編輯批次對話框 */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>編輯出貨批次</DialogTitle>
              <DialogDescription>編輯第 {editBatch?.batchNumber} 批出貨信息</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editQuantity" className="text-right">
                  批次數量
                </Label>
                <Input
                  id="editQuantity"
                  type="number"
                  className="col-span-3"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editDate" className="text-right">
                  計劃出貨日期
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editDate ? format(editDate, "yyyy-MM-dd") : "選擇日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={editDate} onSelect={setEditDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editNotes" className="text-right">
                  備註
                </Label>
                <Input
                  id="editNotes"
                  className="col-span-3"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSaveEdit}>保存更改</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
