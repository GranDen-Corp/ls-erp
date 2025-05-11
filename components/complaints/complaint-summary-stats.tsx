"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react"

export function ComplaintSummaryStats() {
  // 模擬統計數據
  const stats = [
    {
      title: "待處理客訴",
      value: 5,
      icon: AlertTriangle,
      color: "text-yellow-500",
      change: "+2 較上月",
      changeType: "increase",
    },
    {
      title: "處理中客訴",
      value: 8,
      icon: Clock,
      color: "text-blue-500",
      change: "+3 較上月",
      changeType: "increase",
    },
    {
      title: "已解決客訴",
      value: 12,
      icon: CheckCircle,
      color: "text-green-500",
      change: "+5 較上月",
      changeType: "increase",
    },
    {
      title: "平均解決時間",
      value: "4.5天",
      icon: XCircle,
      color: "text-purple-500",
      change: "-0.5天 較上月",
      changeType: "decrease",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className={`text-xs ${stat.changeType === "increase" ? "text-green-500" : "text-red-500"}`}>
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
