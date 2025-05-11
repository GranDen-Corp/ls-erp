"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface OrderStatusHistoryProps {
  orderId: string
}

export function OrderStatusHistory({ orderId }: OrderStatusHistoryProps) {
  // 模擬訂單狀態歷史數據
  // 實際應用中應該從API獲取
  const statusHistory = [
    {
      id: "1",
      orderId: orderId,
      fromStatus: "待確認",
      toStatus: "進行中",
      reason: "業務確認訂單",
      updatedBy: "王小明",
      updatedAt: new Date("2023-04-16T09:30:00"),
    },
    {
      id: "2",
      orderId: orderId,
      fromStatus: "進行中",
      toStatus: "驗貨完成",
      reason: "品檢通過自動更新",
      updatedBy: "system",
      updatedAt: new Date("2023-04-20T14:15:00"),
    },
    {
      id: "3",
      orderId: orderId,
      fromStatus: "驗貨完成",
      toStatus: "已出貨",
      reason: "創建出貨單自動更新",
      updatedBy: "system",
      updatedAt: new Date("2023-04-22T10:45:00"),
    },
  ]

  // 狀態顏色映射
  const statusColorMap: Record<string, string> = {
    待確認: "bg-yellow-500",
    進行中: "bg-blue-500",
    驗貨完成: "bg-green-500",
    已出貨: "bg-purple-500",
    待收款: "bg-pink-500",
    結案: "bg-gray-500",
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>時間</TableHead>
            <TableHead>從狀態</TableHead>
            <TableHead>至狀態</TableHead>
            <TableHead>原因</TableHead>
            <TableHead>更新者</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {statusHistory.map((history) => (
            <TableRow key={history.id}>
              <TableCell>{format(history.updatedAt, "yyyy-MM-dd HH:mm:ss")}</TableCell>
              <TableCell>
                <Badge className={`${statusColorMap[history.fromStatus]} text-white`}>{history.fromStatus}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={`${statusColorMap[history.toStatus]} text-white`}>{history.toStatus}</Badge>
              </TableCell>
              <TableCell>{history.reason}</TableCell>
              <TableCell>{history.updatedBy}</TableCell>
            </TableRow>
          ))}
          {statusHistory.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                沒有狀態變更歷史記錄
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
