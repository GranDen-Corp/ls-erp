"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Order {
  id: string
  orderNumber: string
  date: string
  status: string
  totalAmount: number
  currency: string
}

interface CustomerOrderHistoryProps {
  customerId: string
}

export default function CustomerOrderHistory({ customerId }: CustomerOrderHistoryProps) {
  // 模擬訂單數據
  const [orders] = useState<Order[]>([
    {
      id: "order-001",
      orderNumber: "PO-2023-0125",
      date: "2023-05-15T10:30:00Z",
      status: "completed",
      totalAmount: 25000,
      currency: "USD",
    },
    {
      id: "order-002",
      orderNumber: "PO-2023-0156",
      date: "2023-06-22T14:45:00Z",
      status: "processing",
      totalAmount: 18500,
      currency: "USD",
    },
    {
      id: "order-003",
      orderNumber: "PO-2023-0189",
      date: "2023-08-10T09:15:00Z",
      status: "pending",
      totalAmount: 32000,
      currency: "USD",
    },
  ])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">已完成</Badge>
      case "processing":
        return <Badge variant="secondary">處理中</Badge>
      case "pending":
        return <Badge variant="outline">待處理</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>訂單歷史</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-center py-4">此客戶尚無訂單記錄</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>訂單編號</TableHead>
                <TableHead>日期</TableHead>
                <TableHead>金額</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead className="w-[80px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{formatDate(order.date)}</TableCell>
                  <TableCell>{formatCurrency(order.totalAmount, order.currency)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
