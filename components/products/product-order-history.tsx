"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface ProductOrderHistoryProps {
  productId: string
}

export function ProductOrderHistory({ productId }: ProductOrderHistoryProps) {
  // 模擬訂單歷史數據
  // 實際應用中應該從API獲取
  const orderHistory = [
    {
      id: "ORD-2023-0012",
      date: "2023-04-15",
      customer: "台灣電子",
      quantity: 300,
      unitPrice: 45.0,
      currency: "USD",
      status: "進行中",
    },
    {
      id: "ORD-2023-0005",
      date: "2023-02-20",
      customer: "台灣電子",
      quantity: 200,
      unitPrice: 46.5,
      currency: "USD",
      status: "已完成",
    },
    {
      id: "ORD-2022-0089",
      date: "2022-11-10",
      customer: "台灣電子",
      quantity: 250,
      unitPrice: 47.0,
      currency: "USD",
      status: "已完成",
    },
    {
      id: "ORD-2022-0045",
      date: "2022-06-05",
      customer: "台灣電子",
      quantity: 150,
      unitPrice: 48.5,
      currency: "USD",
      status: "已完成",
    },
    {
      id: "ORD-2022-0012",
      date: "2022-02-10",
      customer: "台灣電子",
      quantity: 10,
      unitPrice: 50.0,
      currency: "USD",
      status: "樣品",
    },
  ]

  // 狀態顏色映射
  const statusColorMap: Record<string, string> = {
    待確認: "bg-yellow-500",
    進行中: "bg-blue-500",
    驗貨完成: "bg-green-500",
    已出貨: "bg-purple-500",
    已完成: "bg-gray-500",
    樣品: "bg-pink-500",
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>訂單編號</TableHead>
            <TableHead>日期</TableHead>
            <TableHead>客戶</TableHead>
            <TableHead className="text-right">數量</TableHead>
            <TableHead className="text-right">單價</TableHead>
            <TableHead>狀態</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orderHistory.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                <Link href={`/orders/${order.id}`} className="hover:underline">
                  {order.id}
                </Link>
              </TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell className="text-right">{order.quantity.toLocaleString()}</TableCell>
              <TableCell className="text-right">
                {order.unitPrice.toFixed(2)} {order.currency}
              </TableCell>
              <TableCell>
                <Badge className={`${statusColorMap[order.status]} text-white`}>{order.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
          {orderHistory.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                沒有訂單歷史記錄
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
