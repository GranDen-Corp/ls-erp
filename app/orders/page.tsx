"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrdersTable } from "@/components/orders/orders-table"
import Link from "next/link"
import { PlusCircle, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { supabaseClient } from "@/lib/supabase-client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface OrderStatus {
  id: number
  status_code: string
  name_zh: string
  description?: string
  color?: string
  is_active: boolean
  sort_order?: number
}

export default function OrdersPage() {
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 獲取訂單狀態資料
  useEffect(() => {
    async function fetchOrderStatuses() {
      try {
        const { data, error } = await supabaseClient
          .from("order_statuses")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })

        if (error) {
          console.error("獲取訂單狀態失敗:", error)
        } else if (data) {
          setOrderStatuses(data)
        }
      } catch (error) {
        console.error("獲取訂單狀態時出錯:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderStatuses()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">訂單管理</h1>
          <div className="flex gap-2">
            <Link href="/orders/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                新增訂單
              </Button>
            </Link>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 計算合適的列數，避免頁籤過多時擠在一行
  const calculateGridCols = () => {
    const totalTabs = orderStatuses.length + 1 // +1 是因為還有"全部"頁籤
    if (totalTabs <= 6) return totalTabs
    if (totalTabs <= 8) return Math.ceil(totalTabs / 2)
    return Math.ceil(totalTabs / 3)
  }

  const gridCols = calculateGridCols()

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">訂單管理</h1>
        <div className="flex gap-2">
          <Link href="/orders/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              新增訂單
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-0">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid-cols-none flex w-full overflow-x-auto scrollbar-hide space-x-1">
              <TabsTrigger value="all" className="whitespace-nowrap flex-shrink-0">
                全部
              </TabsTrigger>
              {orderStatuses.map((status) => (
                <TabsTrigger
                  key={status.status_code}
                  value={status.status_code}
                  className="whitespace-nowrap flex-shrink-0"
                >
                  {status.name_zh}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="pt-4">
              <OrdersTable />
            </TabsContent>

            {orderStatuses.map((status) => (
              <TabsContent key={status.status_code} value={status.status_code} className="pt-4">
                <OrdersTable statusFilter={status.status_code} />
              </TabsContent>
            ))}
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  )
}
