import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"

interface OrderStatusHistoryItem {
  id: string
  orderId: string
  status: string
  timestamp: string
  userId: string
  userName: string
  notes?: string
}

interface OrderStatusHistoryProps {
  history: OrderStatusHistoryItem[]
}

export function OrderStatusHistory({ history }: OrderStatusHistoryProps) {
  // 將狀態ID轉換為顯示名稱的函數
  const getStatusName = (statusId: string) => {
    const statusMap: Record<string, string> = {
      created: "已建立",
      processing: "處理中",
      shipped: "已出貨",
      delivered: "已送達",
      completed: "已完成",
      cancelled: "已取消",
    }

    return statusMap[statusId] || statusId
  }

  // 格式化時間戳
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "yyyy/MM/dd HH:mm", { locale: zhTW })
    } catch (e) {
      return timestamp
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>狀態歷史記錄</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-center text-muted-foreground">沒有狀態歷史記錄</p>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{getStatusName(item.status)}</p>
                    <p className="text-sm text-muted-foreground">由 {item.userName} 更新</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatTimestamp(item.timestamp)}</p>
                </div>
                {item.notes && <p className="mt-2 text-sm">{item.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
