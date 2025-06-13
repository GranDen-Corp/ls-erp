"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase-client"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

// 狀態顏色映射
const statusColorMap: Record<string, string> = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
}

// 狀態顯示名稱映射
const statusDisplayMap: Record<string, string> = {
  pending: "待確認",
  processing: "進行中",
  completed: "已完成",
  cancelled: "已取消",
}

interface PurchaseStatusUpdateProps {
  purchase: any
}

export function PurchaseStatusUpdate({ purchase }: PurchaseStatusUpdateProps) {
  const [status, setStatus] = useState(purchase.status)
  const [notes, setNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  // 格式化日期顯示
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-TW")
  }

  // 更新採購單狀態
  const updateStatus = async () => {
    if (status === purchase.status && !notes) {
      toast({
        title: "無變更",
        description: "狀態未變更且沒有新增備註",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)

    try {
      const supabase = createClient()

      // 準備更新數據
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      }

      // 如果有備註，添加到現有備註中
      if (notes) {
        updateData.notes = purchase.notes
          ? `${purchase.notes}\n\n[${new Date().toISOString()}] ${notes}`
          : `[${new Date().toISOString()}] ${notes}`
      }

      // 更新數據庫
      const { error } = await supabase.from("purchases").update(updateData).eq("purchase_sid", purchase.purchase_sid)

      if (error) {
        throw error
      }

      toast({
        title: "狀態已更新",
        description: `採購單狀態已更新為 ${statusDisplayMap[status] || status}`,
      })

      // 重新載入頁面以顯示更新後的數據
      window.location.reload()
    } catch (error: any) {
      console.error("更新採購單狀態時出錯:", error)
      toast({
        title: "更新失敗",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">當前狀態</h3>
          <div className="flex items-center gap-2">
            <Badge className={`${statusColorMap[purchase.status] || "bg-gray-500"} text-white`}>
              {statusDisplayMap[purchase.status] || purchase.status}
            </Badge>
            <span className="text-muted-foreground">最後更新: {formatDate(purchase.updated_at)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">更新狀態</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">新狀態</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">待確認</SelectItem>
                  <SelectItem value="processing">進行中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">備註</label>
              <Textarea
                placeholder="輸入狀態更新備註..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
            <Button onClick={updateStatus} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              更新狀態
            </Button>
          </div>
        </CardContent>
      </Card>

      {purchase.notes && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-2">歷史備註</h3>
            <div className="whitespace-pre-line bg-muted p-4 rounded-md max-h-96 overflow-y-auto">{purchase.notes}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
