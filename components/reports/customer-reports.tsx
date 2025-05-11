"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import type { Customer } from "@/types/customer"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users } from "lucide-react"

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
  {
    id: "cust-006",
    name: "台灣電子製造商",
    contactPerson: "李大華",
    email: "david@twelectronics.com",
    phone: "+886 3 567 8901",
    address: "新竹科學園區創新路100號",
    country: "台灣",
    paymentTerms: "T/T 30天",
    creditLimit: 450000,
    currency: "TWD",
    status: "active",
    createdAt: "2023-01-20T09:00:00Z",
    updatedAt: "2023-06-25T15:30:00Z",
  },
  {
    id: "cust-007",
    name: "日本零售連鎖",
    contactPerson: "佐藤健",
    email: "takeshi@jpretail.co.jp",
    phone: "+81 3 1234 5678",
    address: "東京都新宿区西新宿2-8-1",
    country: "日本",
    paymentTerms: "T/T 60天",
    creditLimit: 900000,
    currency: "JPY",
    status: "active",
    createdAt: "2023-03-10T08:45:00Z",
    updatedAt: "2023-07-15T11:20:00Z",
  },
  {
    id: "cust-008",
    name: "B1法蘭克福分部",
    contactPerson: "Hans Mueller",
    email: "hans@bgroup.de",
    phone: "+49 69 1234 5678",
    address: "Mainzer Landstraße 50, 60325 Frankfurt",
    country: "德國",
    paymentTerms: "L/C 45天",
    creditLimit: 850000,
    currency: "EUR",
    status: "active",
    groupTag: "B集團",
    createdAt: "2023-02-15T10:30:00Z",
    updatedAt: "2023-08-05T14:15:00Z",
  },
]

// 模擬訂單數據
const mockOrderData: Record<string, { orderCount: number; totalValue: number }> = {
  "cust-001": { orderCount: 15, totalValue: 1200000 },
  "cust-002": { orderCount: 8, totalValue: 950000 },
  "cust-003": { orderCount: 5, totalValue: 600000 },
  "cust-004": { orderCount: 12, totalValue: 1100000 },
  "cust-005": { orderCount: 10, totalValue: 800000 },
  "cust-006": { orderCount: 7, totalValue: 550000 },
  "cust-007": { orderCount: 9, totalValue: 750000 },
  "cust-008": { orderCount: 6, totalValue: 700000 },
}

// 顏色配置
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

// 將客戶數據轉換為統計數據
function customerToStats(customer: Customer) {
  const orderData = mockOrderData[customer.id] || { orderCount: 0, totalValue: 0 }

  // 簡單匯率轉換 (實際應用中應使用真實匯率)
  let creditInTWD = customer.creditLimit
  if (customer.currency === "USD") creditInTWD *= 30
  if (customer.currency === "EUR") creditInTWD *= 35
  if (customer.currency === "CNY") creditInTWD *= 4.5
  if (customer.currency === "JPY") creditInTWD *= 0.25

  return {
    id: customer.id,
    name: customer.name,
    country: customer.country,
    status: customer.status,
    groupTag: customer.groupTag,
    creditLimit: creditInTWD,
    orderCount: orderData.orderCount,
    totalOrderValue: orderData.totalValue,
    isGroup: false,
  }
}

export function CustomerReports() {
  const [viewMode, setViewMode] = useState<"table" | "chart">("table")
  const [reportType, setReportType] = useState<"overview" | "orders" | "credit">("overview")
  const [groupByTag, setGroupByTag] = useState(false)

  // 計算客戶統計數據
  const customerStats = useMemo(() => {
    if (!groupByTag) {
      // 不分組，顯示每個客戶的統計
      return mockCustomers.map(customerToStats).sort((a, b) => b.totalOrderValue - a.totalOrderValue)
    } else {
      // 按集團分組，但只對有集團標籤的客戶進行分組
      const result = []
      const groups: Record<string, Customer[]> = {}

      // 先將有集團標籤的客戶分組
      mockCustomers.forEach((customer) => {
        if (customer.groupTag) {
          if (!groups[customer.groupTag]) {
            groups[customer.groupTag] = []
          }
          groups[customer.groupTag].push(customer)
        }
      })

      // 處理有集團標籤的客戶
      Object.entries(groups).forEach(([groupName, customers]) => {
        const activeCustomers = customers.filter((c) => c.status === "active").length
        const totalCreditLimit = customers.reduce((sum, c) => {
          // 簡單匯率轉換
          let creditInTWD = c.creditLimit
          if (c.currency === "USD") creditInTWD *= 30
          if (c.currency === "EUR") creditInTWD *= 35
          if (c.currency === "CNY") creditInTWD *= 4.5
          if (c.currency === "JPY") creditInTWD *= 0.25
          return sum + creditInTWD
        }, 0)

        // 計算訂單總數和總值
        let totalOrderCount = 0
        let totalOrderValue = 0
        customers.forEach((c) => {
          const orderData = mockOrderData[c.id] || { orderCount: 0, totalValue: 0 }
          totalOrderCount += orderData.orderCount
          totalOrderValue += orderData.totalValue
        })

        result.push({
          id: groupName,
          name: groupName,
          customerCount: customers.length,
          activeCustomers,
          inactiveCustomers: customers.length - activeCustomers,
          creditLimit: totalCreditLimit,
          orderCount: totalOrderCount,
          totalOrderValue: totalOrderValue,
          customers: customers,
          isGroup: true,
        })
      })

      // 添加沒有集團標籤的客戶（作為獨立項）
      mockCustomers
        .filter((customer) => !customer.groupTag)
        .forEach((customer) => {
          result.push(customerToStats(customer))
        })

      return result.sort((a, b) => b.totalOrderValue - a.totalOrderValue)
    }
  }, [groupByTag])

  // 為圖表準備數據
  const chartData = useMemo(() => {
    return customerStats.map((stat) => {
      if (stat.isGroup) {
        return {
          name: stat.name,
          客戶數量: stat.customerCount,
          訂單數量: stat.orderCount,
          信用額度: Math.round(stat.creditLimit / 10000) / 100, // 轉換為百萬單位
          訂單總額: Math.round(stat.totalOrderValue / 10000) / 100, // 轉換為百萬單位
        }
      } else {
        return {
          name: stat.name,
          客戶數量: 1,
          訂單數量: stat.orderCount,
          信用額度: Math.round(stat.creditLimit / 10000) / 100, // 轉換為百萬單位
          訂單總額: Math.round(stat.totalOrderValue / 10000) / 100, // 轉換為百萬單位
        }
      }
    })
  }, [customerStats])

  // 為餅圖準備數據
  const pieData = useMemo(() => {
    if (reportType === "overview") {
      return customerStats.map((stat) => ({
        name: stat.name,
        value: stat.isGroup ? stat.customerCount : 1,
      }))
    } else if (reportType === "orders") {
      return customerStats.map((stat) => ({
        name: stat.name,
        value: stat.totalOrderValue,
      }))
    } else {
      return customerStats.map((stat) => ({
        name: stat.name,
        value: stat.creditLimit,
      }))
    }
  }, [customerStats, reportType])

  // 過濾要顯示的圖表數據
  const filteredChartData = useMemo(() => {
    if (reportType === "overview") {
      return chartData.map((item) => ({
        name: item.name,
        客戶數量: item.客戶數量,
        訂單數量: item.訂單數量,
      }))
    } else if (reportType === "orders") {
      return chartData.map((item) => ({
        name: item.name,
        訂單數量: item.訂單數量,
        訂單總額: item.訂單總額,
      }))
    } else {
      return chartData.map((item) => ({
        name: item.name,
        信用額度: item.信用額度,
      }))
    }
  }, [chartData, reportType])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>客戶報表</CardTitle>
          <CardDescription>查看客戶統計數據、訂單和信用額度分析</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="group-by-tag" checked={groupByTag} onCheckedChange={setGroupByTag} />
              <Label htmlFor="group-by-tag">按集團分組統計</Label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={reportType}
                onValueChange={(value: "overview" | "orders" | "credit") => setReportType(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="選擇報表類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">概覽報表</SelectItem>
                  <SelectItem value="orders">訂單報表</SelectItem>
                  <SelectItem value="credit">信用額度報表</SelectItem>
                </SelectContent>
              </Select>

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
          </div>

          {viewMode === "table" ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名稱</TableHead>
                    {groupByTag && <TableHead>類型</TableHead>}
                    {groupByTag && <TableHead>客戶數量</TableHead>}
                    {!groupByTag && <TableHead>國家</TableHead>}
                    {!groupByTag && <TableHead>狀態</TableHead>}
                    {groupByTag && <TableHead>活躍客戶</TableHead>}
                    <TableHead>信用額度 (TWD)</TableHead>
                    <TableHead>訂單數量</TableHead>
                    <TableHead>訂單總額 (TWD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerStats.map((stat) => (
                    <TableRow key={stat.id}>
                      <TableCell className="font-medium">
                        {!stat.isGroup ? (
                          <Link href={`/customers/${stat.id}`} className="hover:underline">
                            {stat.name}
                          </Link>
                        ) : (
                          stat.name
                        )}
                        {!groupByTag && stat.groupTag && (
                          <Badge variant="outline" className="ml-2">
                            {stat.groupTag}
                          </Badge>
                        )}
                      </TableCell>
                      {groupByTag && (
                        <TableCell>
                          {stat.isGroup ? (
                            <Badge variant="default" className="bg-blue-500">
                              集團
                            </Badge>
                          ) : (
                            <Badge variant="outline">個別客戶</Badge>
                          )}
                        </TableCell>
                      )}
                      {groupByTag && <TableCell>{stat.isGroup ? stat.customerCount : 1}</TableCell>}
                      {!groupByTag && <TableCell>{stat.country}</TableCell>}
                      {!groupByTag && (
                        <TableCell>
                          <Badge variant={stat.status === "active" ? "default" : "secondary"}>
                            {stat.status === "active" ? "活躍" : "非活躍"}
                          </Badge>
                        </TableCell>
                      )}
                      {groupByTag && (
                        <TableCell>{stat.isGroup ? stat.activeCustomers : stat.status === "active" ? 1 : 0}</TableCell>
                      )}
                      <TableCell>{stat.creditLimit.toLocaleString()}</TableCell>
                      <TableCell>{stat.orderCount}</TableCell>
                      <TableCell>{stat.totalOrderValue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Tabs defaultValue="bar" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="bar">柱狀圖</TabsTrigger>
                <TabsTrigger value="pie">餅圖</TabsTrigger>
              </TabsList>
              <TabsContent value="bar" className="pt-4">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {reportType === "overview" && <Bar dataKey="客戶數量" fill="#8884d8" />}
                      {reportType !== "credit" && <Bar dataKey="訂單數量" fill="#82ca9d" />}
                      {reportType === "orders" && <Bar dataKey="訂單總額" fill="#ffc658" name="訂單總額 (百萬)" />}
                      {reportType !== "orders" && <Bar dataKey="信用額度" fill="#ff8042" name="信用額度 (百萬)" />}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="pie" className="pt-4">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) =>
                          reportType === "overview"
                            ? `${value} 客戶`
                            : `${value.toLocaleString()} ${reportType === "orders" ? "TWD" : "TWD"}`
                        }
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {groupByTag && viewMode === "table" && (
        <div className="grid gap-6 md:grid-cols-2">
          {customerStats
            .filter((stat) => stat.isGroup)
            .map((group: any) => (
              <Card key={group.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-xl">{group.name}</CardTitle>
                    <CardDescription>共 {group.customerCount} 個客戶</CardDescription>
                  </div>
                  <Users className="h-5 w-5 text-muted-foreground" />
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
                      {group.customers.map((customer: Customer) => (
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
      )}
    </div>
  )
}
