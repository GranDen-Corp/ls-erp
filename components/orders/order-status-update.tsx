"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { supabaseClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"

// 模擬可用的訂單狀態
const availableStatuses = [
  { id: "created", name: "已建立" },
  { id: "processing", name: "處理中" },
  { id: "shipped", name: "已出貨" },
  { id: "delivered", name: "已送達" },
  { id: "completed", name: "已完成" },
  { id: "cancelled", name: "已取消" },
]

interface OrderStatusUpdateProps {
  orderId: string
  currentStatus: string
}

export function OrderStatusUpdate({ orderId, currentStatus }: OrderStatusUpdateProps) {
  const router = useRouter()
  const [status, setStatus] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!status) return

    setIsSubmitting(true)

    try {
      // 1. 更新訂單狀態
      const { error: updateError } = await supabaseClient.from("orders").update({ status }).eq("order_id", orderId) // 使用 order_id 而不是 order_sid

      if (updateError) {
        console.error("更新訂單狀態失敗:", updateError)
        alert("更新訂單狀態失敗，請稍後再試。")
        return
      }

      // 2. 添加狀態歷史記錄
      const historyEntry = {
        order_id: orderId,
        status,
        notes,
        user_id: "current-user-id", // 實際應用中應該從認證系統獲取
        user_name: "Current User", // 實際應用中應該從認證系統獲取
        timestamp: new Date().toISOString(),
      }

      const { error: historyError } = await supabaseClient.from("order_status_history").insert(historyEntry)

      if (historyError) {
        console.error("添加狀態歷史記錄失敗:", historyError)
        // 即使歷史記錄添加失敗，訂單狀態已更新，所以不需要回滾
      }

      // 重新整理頁面以顯示更新後的狀態
      router.refresh()

      // 清除表單
      setStatus("")
      setNotes("")
    } catch (error) {
      console.error("更新訂單狀態時出錯:", error)
      alert("更新訂單狀態時發生錯誤，請稍後再試。")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>更新訂單狀態</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current-status">目前狀態</Label>
          <div className="p-2 border rounded-md bg-muted">{currentStatus}</div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-status">新狀態</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="new-status">
              <SelectValue placeholder="選擇新狀態" />
            </SelectTrigger>
            <SelectContent>
              {availableStatuses.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">備註</Label>
          <Textarea
            id="notes"
            placeholder="輸入狀態更新的備註..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button onClick={handleSubmit} disabled={!status || isSubmitting}>
          {isSubmitting ? "更新中..." : "更新狀態"}
        </Button>
      </CardContent>
    </Card>
  )
}
