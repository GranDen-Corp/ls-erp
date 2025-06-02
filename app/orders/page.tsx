"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrdersTable } from "@/components/orders/orders-table"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { supabaseClient } from "@/lib/supabase-client"

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
      <div className="flex flex-col gap-4">
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
        <div className="text-center py-4">載入中...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
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

      <Tabs defaultValue="all" className="w-full">
        <TabsList className={`grid w-full grid-cols-${Math.min(orderStatuses.length + 1, 6)}`}>
          <TabsTrigger value="all">全部</TabsTrigger>
          {orderStatuses.map((status) => (
            <TabsTrigger key={status.status_code} value={status.status_code}>
              {status.name_zh}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <OrdersTable />
        </TabsContent>

        {orderStatuses.map((status) => (
          <TabsContent key={status.status_code} value={status.status_code}>
            <OrdersTable statusFilter={status.status_code} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
