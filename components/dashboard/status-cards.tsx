"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, ShoppingCart, Truck, DollarSign } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-client"

interface OrderStats {
  pending: number
  inProgress: number
  readyToShip: number
  totalValue: number
  pendingPayment: number
}

export function StatusCards() {
  const [stats, setStats] = useState<OrderStats>({
    pending: 0,
    inProgress: 0,
    readyToShip: 0,
    totalValue: 0,
    pendingPayment: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient()

        // 只查詢status欄位，因為我們只需要統計數量
        const { data: orders, error } = await supabase.from("orders").select("status")

        if (error) {
          console.error("Error fetching orders:", error)
          return
        }

        // 統計各狀態訂單數量
        const statusCounts = {
          pending: 0,
          inProgress: 0,
          readyToShip: 0,
        }

        orders?.forEach((order) => {
          switch (order.status) {
            case "待確認":
            case "報價中":
            case "新訂單":
              statusCounts.pending++
              break
            case "進行中":
            case "生產中":
            case "品檢中":
            case "確認中":
              statusCounts.inProgress++
              break
            case "待出貨":
            case "驗貨完成":
            case "完成":
              statusCounts.readyToShip++
              break
          }
        })

        // 使用mock data for 本月訂單總額和待收款項
        const mockTotalValue = 2847650
        const mockPendingPayment = 456780

        setStats({
          pending: statusCounts.pending,
          inProgress: statusCounts.inProgress,
          readyToShip: statusCounts.readyToShip,
          totalValue: mockTotalValue,
          pendingPayment: mockPendingPayment,
        })
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">待確認訂單</CardTitle>
          <FileText className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          <p className="text-xs text-muted-foreground">需要業務確認</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">進行中訂單</CardTitle>
          <ShoppingCart className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <p className="text-xs text-muted-foreground">生產製造中</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">待出貨</CardTitle>
          <Truck className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.readyToShip}</div>
          <p className="text-xs text-muted-foreground">準備出貨</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">本月訂單總額</CardTitle>
          <DollarSign className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">${stats.totalValue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">+15.2% 較上月 (模擬數據)</p>
        </CardContent>
      </Card>
    </div>
  )
}
