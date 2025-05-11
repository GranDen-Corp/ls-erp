"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const orders = [
  {
    id: "ORD-2023-0012",
    customer: "台灣電子",
    customerInitials: "TE",
    customerImage: "/placeholder.svg",
    amount: "$25,200",
    status: "待確認",
    statusColor: "bg-yellow-500",
    date: "2023-04-15",
  },
  {
    id: "ORD-2023-0011",
    customer: "新竹科技",
    customerInitials: "HT",
    customerImage: "/placeholder.svg",
    amount: "$12,400",
    status: "進行中",
    statusColor: "bg-blue-500",
    date: "2023-04-14",
  },
  {
    id: "ORD-2023-0010",
    customer: "台北工業",
    customerInitials: "TI",
    customerImage: "/placeholder.svg",
    amount: "$8,750",
    status: "驗貨完成",
    statusColor: "bg-green-500",
    date: "2023-04-12",
  },
  {
    id: "ORD-2023-0009",
    customer: "高雄製造",
    customerInitials: "KM",
    customerImage: "/placeholder.svg",
    amount: "$18,300",
    status: "已出貨",
    statusColor: "bg-purple-500",
    date: "2023-04-10",
  },
  {
    id: "ORD-2023-0008",
    customer: "台中電子",
    customerInitials: "TC",
    customerImage: "/placeholder.svg",
    amount: "$9,200",
    status: "結案",
    statusColor: "bg-gray-500",
    date: "2023-04-08",
  },
]

export function RecentOrders() {
  return (
    <div className="space-y-8">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={order.customerImage || "/placeholder.svg"} alt={order.customer} />
            <AvatarFallback>{order.customerInitials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{order.customer}</p>
            <p className="text-sm text-muted-foreground">{order.id}</p>
          </div>
          <div className="ml-auto font-medium">{order.amount}</div>
          <div className="ml-2">
            <Badge className={`${order.statusColor} text-white`}>{order.status}</Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
