"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface OrderStatusUpdateProps {
  orderId: string
  currentStatus: string
  onStatusUpdate: (newStatus: string) => void
}

export function OrderStatusUpdate({ orderId, currentStatus, onStatusUpdate }: OrderStatusUpdateProps) {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("")
  const [updateReason, setUpdateReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 模擬訂單狀態數據
  const orderStatuses = [
    { id: "1", name: "待確認", color: "#f59e0b" },
    { id: "2", name: "進行中", color: "#3b82f6" },
    { id: "3", name: "驗貨完成", color: "#10b981" },
    { id: "4", name: "已出貨", color: "#8b5cf6" },
    { id: "5", name: "待收款", color: "#ec4899" },
    { id: "6", name: "結案", color: "#6b7280" },
  ]

  // 模擬訂單狀態流程規則
  const workflowRules = [
    { fromStatus: "待確認", toStatus: "進行中" },
    { fromStatus: "進行中", toStatus: "驗貨完成" },
    { fromStatus: "驗貨完成", toStatus: "已出貨" },
    { fromStatus: "已出貨", toStatus: "待收款" },
    { fromStatus: "待收款", toStatus: "結案" },
  ]

  // 獲取當前狀態可以流轉到的下一個狀態
  const nextStatuses = orderStatuses.filter((status) =>
    workflowRules.some((rule) => rule.fromStatus === currentStatus && rule.toStatus === status.name),
  )

  // 狀態顏色映射
  const statusColorMap: Record<string, string> = {
    待確認: "bg-yellow-500",
    進行中: "bg-blue-500",
    驗貨完成: "bg-green-500",
    已出貨: "bg-purple-500",
    待收款: "bg-pink-500",
    結案: "bg-gray-500",
  }

  const handleOpenUpdateDialog = () => {
    setSelectedStatus("")
    setUpdateReason("")
    setIsUpdateDialogOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedStatus || !updateReason) return

    setIsSubmitting(true)

    try {
      // 模擬API請求
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 實際應用中應該調用API更新訂單狀態
      console.log(`更新訂單 ${orderId} 狀態：${currentStatus} -> ${selectedStatus}，原因：${updateReason}`)

      // 更新狀態
      onStatusUpdate(selectedStatus)

      // 關閉對話框
      setIsUpdateDialogOpen(false)
    } catch (error) {
      console.error("更新訂單狀態失敗：", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center p-4 border rounded-md">
        <Badge className={`${statusColorMap[currentStatus]} text-white text-lg py-1 px-3 mb-2`}>{currentStatus}</Badge>
        <p className="text-sm text-muted-foreground">當前訂單狀態</p>
      </div>

      <Button onClick={handleOpenUpdateDialog} className="w-full" disabled={nextStatuses.length === 0}>
        更新狀態
      </Button>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>更新訂單狀態</DialogTitle>
            <DialogDescription>
              將訂單 {orderId} 的狀態從 {currentStatus} 更新為新狀態
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">選擇新狀態</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇新狀態" />
                </SelectTrigger>
                <SelectContent>
                  {nextStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.name}>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: status.color }}></div>
                        {status.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">更新原因</Label>
              <Textarea
                id="reason"
                value={updateReason}
                onChange={(e) => setUpdateReason(e.target.value)}
                placeholder="請輸入狀態更新的原因"
                rows={3}
              />
            </div>

            {selectedStatus && (
              <div className="flex items-center justify-center p-2 border rounded-md bg-muted/50">
                <div className="flex items-center">
                  <Badge className={`${statusColorMap[currentStatus]} text-white`}>{currentStatus}</Badge>
                  <ArrowRight className="mx-2 h-4 w-4" />
                  <Badge className={`${statusColorMap[selectedStatus]} text-white`}>{selectedStatus}</Badge>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)} disabled={isSubmitting}>
              取消
            </Button>
            <Button onClick={handleUpdateStatus} disabled={!selectedStatus || !updateReason || isSubmitting}>
              {isSubmitting ? "更新中..." : "確認更新"}
              {!isSubmitting && <Check className="ml-2 h-4 w-4" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {nextStatuses.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <p>可更新的下一個狀態：</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {nextStatuses.map((status) => (
              <Badge key={status.id} variant="outline" className="border-2" style={{ borderColor: status.color }}>
                {status.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {nextStatuses.length === 0 && currentStatus !== "結案" && (
        <div className="text-sm text-yellow-500">
          <p>當前狀態沒有可用的下一個狀態</p>
        </div>
      )}

      {currentStatus === "結案" && (
        <div className="text-sm text-green-500">
          <p>此訂單已結案</p>
        </div>
      )}
    </div>
  )
}
