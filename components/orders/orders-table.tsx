"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, FileText, MoreHorizontal, Pencil, ShoppingCart, Truck } from "lucide-react"
import Link from "next/link"
import { supabaseClient } from "@/lib/supabase-client"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// 狀態顏色映射
const statusColorMap: Record<string, string> = {
  待確認: "bg-yellow-500",
  進行中: "bg-blue-500",
  驗貨完成: "bg-green-500",
  已出貨: "bg-purple-500",
  結案: "bg-gray-500",
}

// 模擬訂單數據 - 當資料表不存在時使用
const mockOrdersData = [
  {
    id: "1",
    order_number: "ORD-2023-0012",
    customer_id: "1",
    customer_name: "台灣電子",
    po_number: "PO-TE-2023-042",
    amount: 25200,
    status: "待確認",
    order_date: "2023-04-15",
    products: "特殊冷成型零件 x 500",
    currency: "USD",
  },
  {
    id: "2",
    order_number: "ORD-2023-0011",
    customer_id: "2",
    customer_name: "新竹科技",
    po_number: "PO-HT-2023-118",
    amount: 12400,
    status: "進行中",
    order_date: "2023-04-14",
    products: "汽車緊固件 x 2000",
    currency: "USD",
  },
  {
    id: "3",
    order_number: "ORD-2023-0010",
    customer_id: "3",
    customer_name: "台北工業",
    po_number: "PO-TI-2023-087",
    amount: 8750,
    status: "驗貨完成",
    order_date: "2023-04-12",
    products: "特殊沖壓零件 x 5000",
    currency: "USD",
  },
  {
    id: "4",
    order_number: "ORD-2023-0009",
    customer_id: "4",
    customer_name: "高雄製造",
    po_number: "PO-KM-2023-063",
    amount: 18300,
    status: "已出貨",
    order_date: "2023-04-10",
    products: "組裝零件 x 300",
    currency: "USD",
  },
  {
    id: "5",
    order_number: "ORD-2023-0008",
    customer_id: "5",
    customer_name: "台中電子",
    po_number: "PO-TC-2023-055",
    amount: 9200,
    status: "結案",
    order_date: "2023-04-08",
    products: "汽車零件 x 150",
    currency: "USD",
  },
]

interface Order {
  id: string
  order_number: string
  customer_id: string
  customer_name: string
  po_number: string
  amount: number
  status: string
  order_date: string
  products: string
  currency: string
}

interface OrdersTableProps {
  status?: string
}

export function OrdersTable({ status }: OrdersTableProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState(status || "")
  const [usingMockData, setUsingMockData] = useState(false)

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)

        // 檢查orders表是否存在
        const { error: tableCheckError } = await supabaseClient.from("orders").select("id").limit(1).single()

        // 如果表不存在，使用模擬數據
        if (tableCheckError && tableCheckError.message.includes("does not exist")) {
          console.warn("Orders table does not exist, using mock data")
          setUsingMockData(true)

          // 過濾模擬數據
          let filteredMockData = [...mockOrdersData]
          if (statusFilter && statusFilter !== "all") {
            filteredMockData = mockOrdersData.filter((order) => order.status === statusFilter)
          }

          setOrders(filteredMockData)
          return
        }

        // 如果表存在，從Supabase獲取訂單資料
        let query = supabaseClient
          .from("orders")
          .select(`
            id,
            order_number,
            customer_id,
            po_number,
            amount,
            status,
            order_date,
            products,
            currency
          `)
          .order("order_date", { ascending: false })

        // 如果有狀態過濾，則添加過濾條件
        if (statusFilter && statusFilter !== "all") {
          query = query.eq("status", statusFilter)
        }

        const { data: ordersData, error: ordersError } = await query

        if (ordersError) throw ordersError

        try {
          // 獲取所有客戶資料，用於後續映射
          const { data: customersData, error: customersError } = await supabaseClient
            .from("customers")
            .select("id, name")

          if (customersError) throw customersError

          // 創建客戶ID到名稱的映射
          const customerMap = new Map(customersData.map((customer) => [customer.id, customer.name]))

          // 格式化訂單資料，使用映射獲取客戶名稱
          const formattedOrders = ordersData.map((order) => ({
            id: order.id,
            order_number: order.order_number,
            customer_id: order.customer_id,
            customer_name: customerMap.get(order.customer_id) || "Unknown Customer",
            po_number: order.po_number,
            amount: order.amount,
            status: order.status,
            order_date: order.order_date,
            products: order.products,
            currency: order.currency || "USD",
          }))

          setOrders(formattedOrders)
        } catch (customerError) {
          console.error("Error fetching customer data:", customerError)
          // 如果獲取客戶資料失敗，仍然顯示訂單，但客戶名稱顯示為未知
          const formattedOrders = ordersData.map((order) => ({
            id: order.id,
            order_number: order.order_number,
            customer_id: order.customer_id,
            customer_name: "Unknown Customer",
            po_number: order.po_number,
            amount: order.amount,
            status: order.status,
            order_date: order.order_date,
            products: order.products,
            currency: order.currency || "USD",
          }))

          setOrders(formattedOrders)
        }
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError("Failed to load orders. Please try again later.")
        // 發生錯誤時使用模擬數據
        setUsingMockData(true)
        setOrders(mockOrdersData)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [statusFilter])

  // 當props中的status變更時，更新狀態過濾器
  useEffect(() => {
    setStatusFilter(status || "")
  }, [status])

  // 過濾訂單
  const filteredOrders = orders.filter((order) => {
    return (
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.products.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // 處理搜尋輸入變更
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // 處理狀態過濾變更
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
  }

  // 格式化金額顯示
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("zh-TW", { style: "currency", currency }).format(amount)
  }

  return (
    <div className="space-y-4">
      {usingMockData && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>注意</AlertTitle>
          <AlertDescription>
            資料庫中的訂單資料表尚未建立，目前顯示的是模擬資料。請聯繫管理員設置資料庫。
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Input
          placeholder="搜尋訂單編號、客戶、PO編號或產品..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
        {!status && (
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="所有狀態" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有狀態</SelectItem>
              <SelectItem value="待確認">待確認</SelectItem>
              <SelectItem value="進行中">進行中</SelectItem>
              <SelectItem value="驗貨完成">驗貨完成</SelectItem>
              <SelectItem value="已出貨">已出貨</SelectItem>
              <SelectItem value="結案">結案</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>訂單編號</TableHead>
              <TableHead>客戶</TableHead>
              <TableHead>客戶PO編號</TableHead>
              <TableHead>產品</TableHead>
              <TableHead>金額</TableHead>
              <TableHead>日期</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // 載入中顯示骨架屏
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  {searchTerm ? "沒有符合搜尋條件的訂單" : "沒有訂單資料"}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{order.po_number}</TableCell>
                  <TableCell>{order.products}</TableCell>
                  <TableCell>{formatAmount(order.amount, order.currency)}</TableCell>
                  <TableCell>{new Date(order.order_date).toLocaleDateString("zh-TW")}</TableCell>
                  <TableCell>
                    <Badge className={`${statusColorMap[order.status] || "bg-gray-500"} text-white`}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">開啟選單</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Link href={`/orders/${order.id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            查看詳情
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/orders/${order.id}/edit`} className="flex items-center">
                            <Pencil className="mr-2 h-4 w-4" />
                            編輯訂單
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Link href={`/orders/${order.id}/confirmation`} className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            查看訂單確認書
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/purchases/from-order/${order.id}`} className="flex items-center">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            查看採購單
                          </Link>
                        </DropdownMenuItem>
                        {(order.status === "驗貨完成" || order.status === "已出貨" || order.status === "結案") && (
                          <DropdownMenuItem>
                            <Link href={`/shipments/from-order/${order.id}`} className="flex items-center">
                              <Truck className="mr-2 h-4 w-4" />
                              查看出貨資訊
                            </Link>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
