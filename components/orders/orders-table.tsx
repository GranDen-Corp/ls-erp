"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, FileDown, Eye, Layers } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabaseClient } from "@/lib/supabase-client"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"

// 狀態映射: 數字到文字
const statusMap: Record<string, string> = {
  "0": "待確認",
  "1": "進行中",
  "2": "驗貨完成",
  "3": "已出貨/結案",
}

// 狀態顏色映射
const statusColorMap: Record<string, string> = {
  待確認: "bg-yellow-500",
  進行中: "bg-blue-500",
  驗貨完成: "bg-green-500",
  "已出貨/結案": "bg-purple-500",
}

// 定義產品項目的介面
interface PartItem {
  part_no: string
  description?: string
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

        // 3. 獲取訂單資料 - 使用新的資料表結構
        try {
          const { data: ordersData, error: ordersError } = await supabaseClient
            .from("orders")
            .select("*")
            .order("order_sid", { ascending: false }) // 使用新的 order_sid 欄位排序

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
        } catch (err) {
          console.error("獲取訂單資料時出錯:", err)
          setError("獲取訂單資料時發生錯誤，請稍後再試。")
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

  // 解析part_no_list JSON並獲取產品名稱
  const parsePartNoList = (partNoListData: any, customerId: string): string => {
    try {
      let partItems: PartItem[] = []

      // 如果是字符串，嘗試解析JSON
      if (typeof partNoListData === "string") {
        try {
          partItems = JSON.parse(partNoListData)
        } catch (e) {
          console.error("解析part_no_list JSON失敗:", e)
          return "-"
        }
      }
      // 如果已經是陣列，直接使用
      else if (Array.isArray(partNoListData)) {
        partItems = partNoListData
      }
      // 其他情況
      else {
        console.error("無法處理的part_no_list格式:", partNoListData)
        return "-"
      }

      // 確保partItems是陣列且有元素
      if (!Array.isArray(partItems) || partItems.length === 0) {
        return "-"
      }

      // 獲取客戶的產品映射
      const customerProducts = products[customerId] || {}

      // 映射每個part_no到產品名稱
      const productNames = partItems.map((item) => {
        // 確保item是對象且有part_no屬性
        if (typeof item === "object" && item && "part_no" in item) {
          const partNo = item.part_no
          // 從products中查找產品名稱，如果找不到則使用part_no
          return customerProducts[partNo] || partNo
        } else if (typeof item === "string") {
          // 如果item直接是字符串，假設它是part_no
          return customerProducts[item] || item
        }
        return "-"
      })

      // 用分號連接所有產品名稱
      return productNames.join("; ")
    } catch (error) {
      console.error("解析part_no_list時出錯:", error)
      return "-"
    }
  }

  // 檢查訂單是否包含組件產品
  const hasAssemblyProduct = (order: any): boolean => {
    return !!order.part_no_assembly
  }

  // 獲取產品名稱
  const getProductName = (order: any) => {
    try {
      const customerId = order.customer_id || "unknown"
      const customerProducts = products[customerId] || {}

      // 如果有組件產品
      if (order.part_no_assembly) {
        return customerProducts[order.part_no_assembly] || order.part_no_assembly
      }

      // 如果有產品清單 - 使用新的解析函數
      if (order.part_no_list) {
        return parsePartNoList(order.part_no_list, customerId)
      }

      return "-"
    } catch (error) {
      console.error("獲取產品名稱時出錯:", error)
      return "-"
    }
  }

  // 從order_id中提取日期
  const extractDateFromOrderId = (orderId: string): string => {
    try {
      // 檢查orderId是否為有效的字符串
      if (!orderId || typeof orderId !== "string") {
        return "-"
      }

      // 嘗試提取timestamp部分
      // 假設order_id格式為timestamp或包含timestamp
      // 例如: "1620000000000" 或 "ORD-1620000000000" 或 "ORD-1620000000000-XXX"

      // 提取數字部分
      const timestampMatch = orderId.match(/(\d{10,13})/)
      if (!timestampMatch) {
        return "-"
      }

      const timestamp = Number.parseInt(timestampMatch[1])

      // 檢查是否為有效的timestamp
      if (isNaN(timestamp)) {
        return "-"
      }

      // 轉換為日期並格式化
      const date = new Date(
        // 如果是10位數（秒），轉換為毫秒
        timestamp.toString().length === 10 ? timestamp * 1000 : timestamp,
      )

      // 檢查是否為有效日期
      if (isNaN(date.getTime())) {
        return "-"
      }

      return format(date, "yyyy/MM/dd", { locale: zhTW })
    } catch (error) {
      console.error("從order_id提取日期時出錯:", error, "order_id:", orderId)
      return "-"
    }
  }

  // 獲取訂單日期
  const getOrderDate = (order: any) => {
    // 首先嘗試從order_id提取日期
    if (order.order_id) {
      const extractedDate = extractDateFromOrderId(order.order_id)
      if (extractedDate !== "-") {
        return extractedDate
      }
    }

    // 如果從order_id無法提取有效日期，嘗試其他日期欄位
    const possibleDateFields = ["order_date", "created_at", "updated_at", "date"]
    for (const field of possibleDateFields) {
      if (order[field]) {
        try {
          return format(new Date(order[field]), "yyyy/MM/dd", { locale: zhTW })
        } catch (e) {
          // 忽略錯誤，嘗試下一個欄位
        }
      }
    }

    return "-"
  }

  // 獲取訂單狀態
  const getOrderStatus = (order: any): { text: string; color: string } => {
    try {
      // 檢查是否有status欄位
      if (order.status === undefined || order.status === null) {
        return { text: "-", color: "bg-gray-500" }
      }

      // 將status轉換為字符串
      const statusKey = String(order.status)

      // 從映射中獲取狀態文字
      const statusText = statusMap[statusKey] || statusKey

      // 獲取狀態顏色
      const statusColor = statusColorMap[statusText] || "bg-gray-500"

      return { text: statusText, color: statusColor }
    } catch (error) {
      console.error("獲取訂單狀態時出錯:", error)
      return { text: "-", color: "bg-gray-500" }
    }
  }

  // 查看訂單詳情 - 使用 order_id 而不是 order_sid
  const viewOrderDetails = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  // 導出訂單資料
  const exportOrders = () => {
    // 實現導出功能
    alert("導出功能尚未實現")
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
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

      {error ? (
        <div className="text-center text-red-500 py-4">{error}</div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center text-gray-500 py-4">沒有找到訂單資料</div>
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>流水號</TableHead>
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
              {filteredOrders.map((order) => {
                const status = getOrderStatus(order)
                const isAssembly = hasAssemblyProduct(order)
                return (
                  <TableRow key={order.order_sid}>
                    <TableCell>{order.order_sid}</TableCell>
                    <TableCell className="font-medium">{order.order_id || "-"}</TableCell>
                    <TableCell>{customers[order.customer_id] || order.customer_id || "-"}</TableCell>
                    <TableCell>{order.po_id || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getProductName(order)}
                        {isAssembly && <Layers className="ml-2 h-4 w-4 text-purple-500" title="組件產品" />}
                      </div>
                    </TableCell>
                    <TableCell>{getOrderDate(order)}</TableCell>
                    <TableCell>
                      <Badge className={`${status.color} text-white`}>{status.text}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => viewOrderDetails(order.order_id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
