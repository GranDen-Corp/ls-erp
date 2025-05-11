"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { Customer } from "@/types/customer"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// 模擬客戶數據
const mockCustomers: Customer[] = [
  {
    id: "cust-001",
    name: "全球貿易有限公司",
    contactPerson: "張小明",
    email: "contact@globaltrade.com",
    phone: "+886 2 1234 5678",
    address: "台北市信義區信義路五段7號",
    country: "台灣",
    paymentTerms: "T/T 30天",
    creditLimit: 500000,
    currency: "TWD",
    status: "active",
    groupTag: "A集團",
    createdAt: "2023-01-15T08:30:00Z",
    updatedAt: "2023-06-20T14:45:00Z",
  },
  {
    id: "cust-002",
    name: "美國進口商集團",
    contactPerson: "John Smith",
    email: "john@usimporters.com",
    phone: "+1 212 555 1234",
    address: "123 Broadway, New York, NY 10001",
    country: "美國",
    paymentTerms: "L/C 60天",
    creditLimit: 1000000,
    currency: "USD",
    status: "active",
    groupTag: "B集團",
    createdAt: "2023-02-10T10:15:00Z",
    updatedAt: "2023-07-05T09:20:00Z",
  },
  {
    id: "cust-003",
    name: "歐洲配銷中心",
    contactPerson: "Marie Dupont",
    email: "marie@eurodist.eu",
    phone: "+33 1 23 45 67 89",
    address: "25 Rue de la Paix, 75002 Paris",
    country: "法國",
    paymentTerms: "D/P 45天",
    creditLimit: 750000,
    currency: "EUR",
    status: "inactive",
    groupTag: "A集團",
    notes: "暫停交易中，等待信用評估",
    createdAt: "2023-03-05T14:20:00Z",
    updatedAt: "2023-08-12T11:30:00Z",
  },
  {
    id: "cust-004",
    name: "A1芝加哥分部",
    contactPerson: "Mike Johnson",
    email: "mike@agroup.com",
    phone: "+1 312 555 6789",
    address: "456 Michigan Ave, Chicago, IL 60601",
    country: "美國",
    paymentTerms: "T/T 45天",
    creditLimit: 800000,
    currency: "USD",
    status: "active",
    groupTag: "A集團",
    createdAt: "2023-04-20T09:15:00Z",
    updatedAt: "2023-09-01T16:30:00Z",
  },
  {
    id: "cust-005",
    name: "A2底特律分部",
    contactPerson: "Sarah Williams",
    email: "sarah@agroup.com",
    phone: "+1 313 555 4321",
    address: "789 Woodward Ave, Detroit, MI 48226",
    country: "美國",
    paymentTerms: "T/T 45天",
    creditLimit: 600000,
    currency: "USD",
    status: "active",
    groupTag: "A集團",
    createdAt: "2023-05-12T11:45:00Z",
    updatedAt: "2023-09-15T10:20:00Z",
  },
]

// 模擬訂單數據
const mockOrderData = {
  A集團: { orderCount: 42, totalValue: 3500000 },
  B集團: { orderCount: 28, totalValue: 2100000 },
  C集團: { orderCount: 15, totalValue: 980000 },
}

export default function CustomerGroupStatistics() {
  const [viewMode, setViewMode] = useState<"table" | "chart">("table")

  // 按集團分組客戶
  const groupedCustomers = useMemo(() => {
    const groups: Record<string, Customer[]> = {}

    mockCustomers.forEach((customer) => {
      const groupTag = customer.groupTag || "未分組"
      if (!groups[groupTag]) {
        groups[groupTag] = []
      }
      groups[groupTag].push(customer)
    })

    return groups
  }, [])

  // 計算每個集團的統計數據
  const groupStats = useMemo(() => {
    return Object.entries(groupedCustomers)
      .map(([groupName, customers]) => {
        const activeCustomers = customers.filter((c) => c.status === "active").length
        const inactiveCustomers = customers.length - activeCustomers
        const totalCreditLimit = customers.reduce((sum, c) => {
          // 簡單匯率轉換 (實際應用中應使用真實匯率)
          let creditInTWD = c.creditLimit
          if (c.currency === "USD") creditInTWD *= 30
          if (c.currency === "EUR") creditInTWD *= 35
          if (c.currency === "CNY") creditInTWD *= 4.5
          if (c.currency === "JPY") creditInTWD *= 0.25
          return sum + creditInTWD
        }, 0)

        // 獲取訂單數據 (如果有)
        const orderData = mockOrderData[groupName] || { orderCount: 0, totalValue: 0 }

        return {
          groupName,
          customerCount: customers.length,
          activeCustomers,
          inactiveCustomers,
          totalCreditLimit,
          orderCount: orderData.orderCount,
          totalOrderValue: orderData.totalValue,
        }
      })
      .sort((a, b) => b.customerCount - a.customerCount)
  }, [groupedCustomers])

  // 為圖表準備數據
  const chartData = useMemo(() => {
    return groupStats.map((stat) => ({
      name: stat.groupName,
      客戶數量: stat.customerCount,
      訂單數量: stat.orderCount,
      信用額度: stat.totalCreditLimit / 1000000, // 轉換為百萬單位
    }))
  }, [groupStats])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">集團客戶統計</h2>
        <Select value={viewMode} onValueChange={(value: "table" | "chart") => setViewMode(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="選擇視圖模式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="table">表格視圖</SelectItem>
            <SelectItem value="chart">圖表視圖</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {viewMode === "table" ? (
        <Card>
          <CardHeader>
            <CardTitle>集團統計數據</CardTitle>
            <CardDescription>按集團查看客戶數量、信用額度和訂單數據</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>集團名稱</TableHead>
                  <TableHead>客戶數量</TableHead>
                  <TableHead>活躍客戶</TableHead>
                  <TableHead>非活躍客戶</TableHead>
                  <TableHead>總信用額度 (TWD)</TableHead>
                  <TableHead>訂單數量</TableHead>
                  <TableHead>訂單總額 (TWD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupStats.map((stat) => (
                  <TableRow key={stat.groupName}>
                    <TableCell className="font-medium">{stat.groupName}</TableCell>
                    <TableCell>{stat.customerCount}</TableCell>
                    <TableCell>{stat.activeCustomers}</TableCell>
                    <TableCell>{stat.inactiveCustomers}</TableCell>
                    <TableCell>{stat.totalCreditLimit.toLocaleString()}</TableCell>
                    <TableCell>{stat.orderCount}</TableCell>
                    <TableCell>{stat.totalOrderValue.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>集團統計圖表</CardTitle>
            <CardDescription>按集團視覺化比較客戶數量、訂單數量和信用額度</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="客戶數量" fill="#8884d8" />
                  <Bar yAxisId="left" dataKey="訂單數量" fill="#82ca9d" />
                  <Bar yAxisId="right" dataKey="信用額度" fill="#ffc658" name="信用額度 (百萬)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(groupedCustomers).map(([groupName, customers]) => (
          <Card key={groupName}>
            <CardHeader>
              <CardTitle>{groupName}</CardTitle>
              <CardDescription>共 {customers.length} 個客戶</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>客戶名稱</TableHead>
                    <TableHead>國家</TableHead>
                    <TableHead>狀態</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <Link href={`/customers/${customer.id}`} className="hover:underline">
                          {customer.name}
                        </Link>
                      </TableCell>
                      <TableCell>{customer.country}</TableCell>
                      <TableCell>
                        <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                          {customer.status === "active" ? "活躍" : "非活躍"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
