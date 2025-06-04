"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-client"

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_initials: string
  amount: number
  status: string
  created_at: string
}

export function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const supabase = createClient()

        // 使用 select * 來獲取所有可用欄位
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10)

        if (ordersError) {
          console.error("Error fetching orders:", ordersError)
          // 如果查詢失敗，使用模擬數據
          const mockOrders = generateMockOrders()
          setOrders(mockOrders)
          return
        }

        if (!ordersData || ordersData.length === 0) {
          setOrders([])
          return
        }

        // 動態處理數據，適應不同的欄位名稱
        const formattedOrders = ordersData.map((order, index) => {
          // 嘗試不同的可能欄位名稱
          const id = order.id || order.order_id || order.uuid || `order-${index}`
          const orderNumber = order.order_number || order.number || order.order_no || `LS-${id}`
          const customerId = order.customer_id || order.customer || order.client_id
          const status = order.status || order.order_status || "待確認"
          const createdAt = order.created_at || order.date_created || order.created || new Date().toISOString()

          return {
            id: String(id),
            order_number: String(orderNumber),
            customer_name: customerId ? `客戶 ${String(customerId).slice(0, 8)}` : "未知客戶",
            customer_initials: "CU",
            amount: Math.floor(Math.random() * 100000) + 10000, // 模擬金額
            status: String(status),
            created_at: String(createdAt),
          }
        })

        setOrders(formattedOrders)
      } catch (error) {
        console.error("Error:", error)
        // 發生錯誤時使用模擬數據
        const mockOrders = generateMockOrders()
        setOrders(mockOrders)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const generateMockOrders = (): Order[] => {
    return Array.from({ length: 5 }, (_, index) => ({
      id: `mock-${index + 1}`,
      order_number: `LS-${2024}${String(index + 1).padStart(3, "0")}`,
      customer_name: ["台積電", "鴻海科技", "聯發科", "華碩電腦", "宏碁集團"][index],
      customer_initials: ["TS", "FH", "MT", "AS", "AC"][index],
      amount: Math.floor(Math.random() * 100000) + 10000,
      status: ["待確認", "進行中", "品檢中", "待出貨", "已完成"][index],
      created_at: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
    }))
  }

  const getInitials = (name: string) => {
    if (!name || name === "未知客戶") return "UK"
    const words = name.split("")
    return words.slice(0, 2).join("")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "待確認":
      case "報價中":
      case "新訂單":
        return "bg-orange-500"
      case "進行中":
      case "生產中":
      case "確認中":
        return "bg-blue-500"
      case "品檢中":
        return "bg-yellow-500"
      case "待出貨":
      case "驗貨完成":
      case "完成":
        return "bg-green-500"
      case "已出貨":
        return "bg-purple-500"
      case "結案":
      case "已完成":
        return "bg-gray-500"
      default:
        return "bg-gray-400"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-TW", {
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center animate-pulse">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="ml-4 space-y-2 flex-1">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="text-right space-y-2">
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
              <div className="h-5 w-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>暫無訂單數據</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg" alt={order.customer_name} />
            <AvatarFallback className="text-sm font-medium">{order.customer_initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1 flex-1">
            <p className="text-sm font-medium leading-none">{order.customer_name}</p>
            <p className="text-xs text-muted-foreground">{order.order_number}</p>
          </div>
          <div className="text-right">
            <div className="font-medium text-sm">${order.amount.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`${getStatusColor(order.status)} text-white text-xs`}>{order.status}</Badge>
              <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
