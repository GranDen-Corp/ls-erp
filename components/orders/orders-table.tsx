"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, FileDown, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabaseClient } from "@/lib/supabase-client"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"

// 狀態顏色映射
const statusColorMap: Record<string, string> = {
  待確認: "bg-yellow-500",
  進行中: "bg-blue-500",
  驗貨完成: "bg-green-500",
  已出貨: "bg-purple-500",
  結案: "bg-gray-500",
}

export function OrdersTable() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customers, setCustomers] = useState<Record<string, string>>({})
  const [products, setProducts] = useState<Record<string, Record<string, string>>>({})

  // 獲取訂單、客戶和產品資料
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        // 1. 獲取客戶資料
        const { data: customersData, error: customersError } = await supabaseClient.from("customers").select("*")

        if (customersError) {
          console.error("獲取客戶資料失敗:", customersError)
        } else if (customersData) {
          const customerMap: Record<string, string> = {}

          // 嘗試找出客戶ID和名稱欄位
          if (customersData.length > 0) {
            const firstRow = customersData[0]
            const idField =
              "customer_id" in firstRow
                ? "customer_id"
                : "id" in firstRow
                  ? "id"
                  : Object.keys(firstRow).find((key) => key.includes("id")) || "id"

            const nameField =
              "name" in firstRow
                ? "name"
                : "customer_name" in firstRow
                  ? "customer_name"
                  : "company" in firstRow
                    ? "company"
                    : Object.keys(firstRow).find((key) => key.includes("name")) || "name"

            customersData.forEach((customer) => {
              const id = customer[idField]
              const name = customer[nameField]
              if (id && name) {
                customerMap[id] = name
              }
            })
          }

          setCustomers(customerMap)
        }

        // 2. 獲取產品資料
        const { data: productsData, error: productsError } = await supabaseClient.from("products").select("*")

        if (productsError) {
          console.error("獲取產品資料失敗:", productsError)
        } else if (productsData) {
          const productMap: Record<string, Record<string, string>> = {}

          // 按客戶ID分組產品
          productsData.forEach((product) => {
            const customerId = product.customer_id || "unknown"
            const partNo = product.part_no || product.id || ""
            const componentName = product.component_name || product.name || product.product_name || partNo

            if (!productMap[customerId]) {
              productMap[customerId] = {}
            }

            productMap[customerId][partNo] = componentName
          })

          setProducts(productMap)
        }

        // 3. 獲取訂單資料 - 嘗試多種方式
        let ordersData = null
        let ordersError = null

        // 嘗試方式1: 使用order_date排序
        try {
          const result = await supabaseClient.from("orders").select("*").order("order_date", { ascending: false })
          if (!result.error) {
            ordersData = result.data
          } else if (result.error.message.includes("does not exist")) {
            // 如果order_date不存在，嘗試方式2
            console.log("order_date欄位不存在，嘗試其他排序方式")
          } else {
            // 其他錯誤
            ordersError = result.error
          }
        } catch (err) {
          console.error("嘗試使用order_date排序失敗:", err)
        }

        // 如果方式1失敗，嘗試方式2: 使用order_id排序
        if (!ordersData && !ordersError) {
          try {
            const result = await supabaseClient.from("orders").select("*").order("order_id", { ascending: false })
            if (!result.error) {
              ordersData = result.data
            } else if (result.error.message.includes("does not exist")) {
              // 如果order_id不存在，嘗試方式3
              console.log("order_id欄位不存在，嘗試其他排序方式")
            } else {
              // 其他錯誤
              ordersError = result.error
            }
          } catch (err) {
            console.error("嘗試使用order_id排序失敗:", err)
          }
        }

        // 如果方式2失敗，嘗試方式3: 不排序
        if (!ordersData && !ordersError) {
          try {
            const result = await supabaseClient.from("orders").select("*")
            if (!result.error) {
              ordersData = result.data
            } else {
              ordersError = result.error
            }
          } catch (err) {
            console.error("嘗試不排序獲取訂單失敗:", err)
            ordersError = err instanceof Error ? err : new Error(String(err))
          }
        }

        // 處理最終結果
        if (ordersError) {
          console.error("獲取訂單資料失敗:", ordersError)
          setError("獲取訂單資料失敗，請稍後再試。")
        } else if (ordersData) {
          // 檢查訂單資料的結構，確定可用的欄位
          if (ordersData.length > 0) {
            console.log("訂單資料欄位:", Object.keys(ordersData[0]))
          }

          setOrders(ordersData)
          setFilteredOrders(ordersData)
        } else {
          setOrders([])
          setFilteredOrders([])
        }
      } catch (error) {
        console.error("獲取資料時出錯:", error)
        setError("獲取資料時發生錯誤，請稍後再試。")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // 處理搜尋
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOrders(orders)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = orders.filter((order) => {
        const orderId = String(order.order_id || "").toLowerCase()
        const poId = String(order.po_id || "").toLowerCase()
        const customerId = String(order.customer_id || "").toLowerCase()
        const customerName = customers[order.customer_id] ? customers[order.customer_id].toLowerCase() : ""

        return orderId.includes(term) || poId.includes(term) || customerId.includes(term) || customerName.includes(term)
      })
      setFilteredOrders(filtered)
    }
  }, [searchTerm, orders, customers])

  // 獲取產品名稱
  const getProductName = (order: any) => {
    try {
      const customerId = order.customer_id || "unknown"
      const customerProducts = products[customerId] || {}

      // 如果有組件產品
      if (order.part_no_assembly) {
        return customerProducts[order.part_no_assembly] || order.part_no_assembly
      }

      // 如果有產品清單
      if (order.part_no_list) {
        let partNoList: string[] = []

        // 嘗試解析JSON
        if (typeof order.part_no_list === "string") {
          try {
            partNoList = JSON.parse(order.part_no_list)
          } catch {
            // 如果不是有效的JSON，嘗試按逗號分隔
            partNoList = order.part_no_list.split(/[,;]/).map((item: string) => item.trim())
          }
        } else if (Array.isArray(order.part_no_list)) {
          partNoList = order.part_no_list
        }

        // 獲取每個產品的名稱
        const productNames = partNoList.map((partNo) => customerProducts[partNo] || partNo)

        return productNames.join("; ")
      }

      return "-"
    } catch (error) {
      console.error("獲取產品名稱時出錯:", error)
      return "-"
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    try {
      return format(new Date(dateString), "yyyy/MM/dd", { locale: zhTW })
    } catch (e) {
      return dateString
    }
  }

  // 查看訂單詳情
  const viewOrderDetails = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  // 導出訂單資料
  const exportOrders = () => {
    // 實現導出功能
    alert("導出功能尚未實現")
  }

  // 獲取訂單日期
  const getOrderDate = (order: any) => {
    // 嘗試多個可能的日期欄位
    const possibleDateFields = ["order_date", "created_at", "updated_at", "date"]
    for (const field of possibleDateFields) {
      if (order[field]) {
        return formatDate(order[field])
      }
    }
    return "-"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>訂單管理</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="搜尋訂單..."
              className="pl-8 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={exportOrders}>
            <FileDown className="mr-2 h-4 w-4" />
            導出
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center text-gray-500 py-4">沒有找到訂單資料</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>訂單編號</TableHead>
                  <TableHead>客戶</TableHead>
                  <TableHead>客戶PO編號</TableHead>
                  <TableHead>產品</TableHead>
                  <TableHead>訂單日期</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order, index) => (
                  <TableRow key={order.id || order.order_id || index}>
                    <TableCell className="font-medium">{order.order_id || "-"}</TableCell>
                    <TableCell>{customers[order.customer_id] || order.customer_id || "-"}</TableCell>
                    <TableCell>{order.po_id || "-"}</TableCell>
                    <TableCell>{getProductName(order)}</TableCell>
                    <TableCell>{getOrderDate(order)}</TableCell>
                    <TableCell>
                      {order.status ? (
                        <Badge className={`${statusColorMap[order.status] || "bg-gray-500"} text-white`}>
                          {order.status}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewOrderDetails(order.order_id || order.id || index.toString())}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
