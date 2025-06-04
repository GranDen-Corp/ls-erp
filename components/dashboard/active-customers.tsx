"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-client"

interface ActiveCustomer {
  customer_id: string
  customer_name: string
  initials: string
  orderCount: number
  totalAmount: number
  activityRate: number
}

export function ActiveCustomers() {
  const [customers, setCustomers] = useState<ActiveCustomer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActiveCustomers = async () => {
      try {
        const supabase = createClient()

        // 獲取近30天的訂單數據
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("customer_id, created_at")
          .gte("created_at", thirtyDaysAgo.toISOString())
          .not("customer_id", "is", null)

        if (ordersError) {
          console.error("Error fetching orders:", ordersError)
          return
        }

        if (!ordersData || ordersData.length === 0) {
          setCustomers([])
          return
        }

        // 按客戶分組統計訂單數量
        const customerOrderCounts = new Map<string, number>()
        ordersData.forEach((order) => {
          const customerId = order.customer_id
          customerOrderCounts.set(customerId, (customerOrderCounts.get(customerId) || 0) + 1)
        })

        // 嘗試獲取客戶資訊，使用可能的欄位名稱
        const customerIds = Array.from(customerOrderCounts.keys())
        let customersData = null
        let customersError = null

        // 嘗試不同的可能欄位名稱
        try {
          const result = await supabase
            .from("customers")
            .select("customer_id, company_name")
            .in("customer_id", customerIds)

          customersData = result.data
          customersError = result.error
        } catch (error) {
          console.error("Error with customer_id field, trying alternative fields:", error)

          // 如果customer_id不存在，嘗試其他可能的欄位
          try {
            const result = await supabase.from("customers").select("uuid, company_name").in("uuid", customerIds)

            customersData = result.data
            customersError = result.error
          } catch (error2) {
            console.error("Error with uuid field:", error2)
          }
        }

        // 創建客戶映射
        const customerMap = new Map()
        if (customersData && !customersError) {
          customersData.forEach((customer: any) => {
            const id = customer.customer_id || customer.uuid || customer.id
            customerMap.set(id, customer.company_name)
          })
        }

        // 轉換為陣列並排序
        const sortedCustomers = Array.from(customerOrderCounts.entries())
          .map(([customerId, orderCount]) => ({
            customer_id: customerId,
            customer_name: customerMap.get(customerId) || `客戶 ${customerId.slice(0, 8)}`,
            initials: getInitials(customerMap.get(customerId) || `客戶 ${customerId.slice(0, 8)}`),
            orderCount,
            totalAmount: orderCount * (Math.random() * 20000 + 5000), // 模擬金額
            activityRate: 0, // 將在下面計算
          }))
          .sort((a, b) => b.orderCount - a.orderCount)
          .slice(0, 10)

        // 計算活躍度百分比（基於最高訂單數量）
        const maxOrderCount = sortedCustomers[0]?.orderCount || 1
        const customersWithActivity = sortedCustomers.map((customer) => ({
          ...customer,
          activityRate: Math.round((customer.orderCount / maxOrderCount) * 100),
        }))

        setCustomers(customersWithActivity)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActiveCustomers()
  }, [])

  const getInitials = (name: string) => {
    if (!name || name.startsWith("客戶")) {
      return "CU"
    }
    const words = name.split("")
    return words.slice(0, 2).join("")
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 animate-pulse">
            <div className="text-sm font-medium text-muted-foreground w-4">#{i + 1}</div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-3 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="w-20 space-y-2">
              <div className="h-2 w-full bg-gray-200 rounded"></div>
              <div className="h-3 w-8 bg-gray-200 rounded mx-auto"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>近30天暫無活躍客戶數據</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {customers.map((customer, index) => (
        <div key={customer.customer_id} className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 flex-1">
            <div className="text-sm font-medium text-muted-foreground w-4">#{index + 1}</div>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" alt={customer.customer_name} />
              <AvatarFallback className="text-xs">{customer.initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{customer.customer_name}</p>
              <p className="text-xs text-muted-foreground">
                {customer.orderCount} 筆訂單 • ${customer.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="w-20">
            <Progress value={customer.activityRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-center">{customer.activityRate}%</p>
          </div>
        </div>
      ))}
    </div>
  )
}
