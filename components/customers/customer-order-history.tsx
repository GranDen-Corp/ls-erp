"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { supabaseClient } from "@/lib/supabase-client"

interface Order {
  id: string
  order_number: string
  order_date: string
  status: string
  total_amount: number
  currency: string
  customer_id: string
}

interface CustomerOrderHistoryProps {
  customerId: string
}

// Helper function to format date
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("zh-TW")
  } catch (e) {
    return dateString
  }
}

// Helper function to format currency
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount)
}

export default function CustomerOrderHistory({ customerId }: CustomerOrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 獲取客戶訂單資料
  useEffect(() => {
    const fetchOrders = async () => {
      if (!customerId) return

      try {
        setIsLoading(true)
        setError(null)

        const { data, error } = await supabaseClient
          .from("orders")
          .select("id, order_number, order_date, status, total_amount, currency, customer_id")
          .eq("customer_id", customerId)
          .order("order_date", { ascending: false })

        if (error) {
          throw new Error(error.message)
        }

        setOrders(data || [])
      } catch (err) {
        console.error("獲取訂單資料時出錯:", err)
        setError(err instanceof Error ? err.message : "獲取訂單資料失敗")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [customerId])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">已完成</Badge>
      case "processing":
        return <Badge variant="secondary">處理中</Badge>
      case "pending":
        return <Badge variant="outline">待處理</Badge>
      case "cancelled":
        return <Badge variant="destructive">已取消</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>訂單歷史</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>訂單歷史</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-600">載入訂單資料時發生錯誤: {error}</div>
        </CardContent>
      </Card>
    )
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
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>{formatDate(order.order_date)}</TableCell>
                  <TableCell>{formatCurrency(order.total_amount, order.currency)}</TableCell>
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
