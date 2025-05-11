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

interface ComplaintStatusUpdateProps {
  complaintId: string
  currentStatus: string
  onStatusUpdate: (newStatus: string) => void
}

export function ComplaintStatusUpdate({ complaintId, currentStatus, onStatusUpdate }: ComplaintStatusUpdateProps) {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("")
  const [updateReason, setUpdateReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 模擬客訴狀態數據
  const complaintStatuses = [
    { id: "pending", name: "待處理", color: "#f59e0b" },
    { id: "processing", name: "處理中", color: "#3b82f6" },
    { id: "resolved", name: "已解決", color: "#10b981" },
    { id: "closed", name: "已結案", color: "#6b7280" },
  ]

  // 模擬客訴狀態流程規則
  const workflowRules = [
    { fromStatus: "pending", toStatus: "processing" },
    { fromStatus: "processing", toStatus: "resolved" },
    { fromStatus: "resolved", toStatus: "closed" },
    { fromStatus: "processing", toStatus: "pending" }, // 可以退回
  ]

  // 獲取當前狀態可以流轉到的下一個狀態
  const nextStatuses = complaintStatuses.filter((status) =>
    workflowRules.some((rule) => rule.fromStatus === currentStatus && rule.toStatus === status.id),
  )

  // 狀態顏色映射
  const statusColorMap: Record<string, string> = {
    pending: "bg-yellow-500",
    processing: "bg-blue-500",
    resolved: "bg-green-500",
    closed: "bg-gray-500",
  }

  // 狀態名稱映射
  const statusNameMap: Record<string, string> = {
    pending: "待處理",
    processing: "處理中",
    resolved: "已解決",
    closed: "已結案",
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

      // 實際應用中應該調用API更新客訴狀態
      console.log(`更新客訴 ${complaintId} 狀態：${currentStatus} -> ${selectedStatus}，原因：${updateReason}`)

      // 更新狀態
      onStatusUpdate(selectedStatus)

      // 關閉對話框
      setIsUpdateDialogOpen(false)
    } catch (error) {
      console.error("更新客訴狀態失敗：", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center p-4 border rounded-md">
        <Badge className={`${statusColorMap[currentStatus]} text-white text-lg py-1 px-3 mb-2`}>
          {statusNameMap[currentStatus]}
        </Badge>
        <p className="text-sm text-muted-foreground">當前客訴狀態</p>
      </div>

      <Button onClick={handleOpenUpdateDialog} className="w-full" disabled={nextStatuses.length === 0}>
        更新狀態
      </Button>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>更新客訴狀態</DialogTitle>
            <DialogDescription>
              將客訴 {complaintId} 的狀態從 {statusNameMap[currentStatus]} 更新為新狀態
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
                    <SelectItem key={status.id} value={status.id}>
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
                  <Badge className={`${statusColorMap[currentStatus]} text-white`}>
                    {statusNameMap[currentStatus]}
                  </Badge>
                  <ArrowRight className="mx-2 h-4 w-4" />
                  <Badge className={`${statusColorMap[selectedStatus]} text-white`}>
                    {statusNameMap[selectedStatus]}
                  </Badge>
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

      {nextStatuses.length === 0 && currentStatus !== "closed" && (
        <div className="text-sm text-yellow-500">
          <p>當前狀態沒有可用的下一個狀態</p>
        </div>
      )}

      {currentStatus === "closed" && (
        <div className="text-sm text-green-500">
          <p>此客訴已結案</p>
        </div>
      )}
    </div>
  )
}
