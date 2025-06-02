"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  Eye,
  FileEdit,
  Printer,
  Trash2,
  Layers,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { supabaseClient } from "@/lib/supabase-client"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AdvancedFilter, type FilterOption } from "@/components/ui/advanced-filter"

// 在 import 部分添加新的引用
import { getOrderBatchItemsByOrderId } from "@/lib/services/order-batch-service"

// 定義產品項目的介面
interface PartItem {
  part_no: string
  description?: string
}

interface OrderStatus {
  id: number
  status_code: string
  status_name: string
  description?: string
  color?: string
  next_statuses?: number[]
}

interface OrdersTableProps {
  statusFilter?: string
}

type SortField = "order_id" | "po_id" | "customer_id" | "estimated_delivery_date" | "created_at" | "status"
type SortDirection = "asc" | "desc" | null

export function OrdersTable({ statusFilter }: OrdersTableProps) {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customers, setCustomers] = useState<Record<string, any>>({})
  const [products, setProducts] = useState<Record<string, Record<string, string>>>({})
  const [orderStatuses, setOrderStatuses] = useState<Record<string, OrderStatus>>({})
  const [teamMembers, setTeamMembers] = useState<Record<string, string>>({}) // 新增團隊成員映射
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({})
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([])

  // 排序狀態
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  // 獲取訂單、客戶和產品資料
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        // 1. 獲取團隊成員資料
        const { data: teamMembersData, error: teamMembersError } = await supabaseClient
          .from("team_members")
          .select("ls_employee_id, name")

        if (teamMembersError) {
          console.error("獲取團隊成員資料失敗:", teamMembersError)
        } else if (teamMembersData) {
          const teamMemberMap: Record<string, string> = {}
          teamMembersData.forEach((member) => {
            if (member.ls_employee_id) {
              teamMemberMap[member.ls_employee_id] = member.name
            }
          })
          setTeamMembers(teamMemberMap)
        }

        // 2. 獲取客戶資料
        const { data: customersData, error: customersError } = await supabaseClient.from("customers").select("*")

        if (customersError) {
          console.error("獲取客戶資料失敗:", customersError)
        } else if (customersData) {
          const customerMap: Record<string, any> = {}

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
              "customer_short_name" in firstRow
                ? "customer_short_name"
                : "name" in firstRow
                  ? "name"
                  : "company" in firstRow
                    ? "company"
                    : Object.keys(firstRow).find((key) => key.includes("name")) || "name"

            const fullNameField =
              "customer_full_name" in firstRow
                ? "customer_full_name"
                : "full_name" in firstRow
                  ? "full_name"
                  : "company_full" in firstRow
                    ? "company_full"
                    : null

            customersData.forEach((customer) => {
              const id = customer[idField]
              const name = customer[nameField]
              const fullName = fullNameField ? customer[fullNameField] : null
              const salesRepresentative = customer.sales_representative
              if (id) {
                customerMap[id] = {
                  name,
                  fullName,
                  sales_representative: salesRepresentative,
                  salesRepresentative, // 保持向後兼容
                }
              }
            })
          }

          setCustomers(customerMap)

          // 設置客戶篩選選項
          const customerOptions = customersData.map((customer) => ({
            value: customer.customer_id,
            label: customer.customer_short_name || customer.customer_id,
          }))

          setFilterOptions((prev) => [
            ...prev,
            {
              id: "customer_id",
              label: "客戶",
              options: customerOptions,
              type: "select",
            },
          ])
        }

        // 3. 獲取產品資料
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

        // 4. 獲取訂單狀態資料
        try {
          const { data: statusesData, error: statusesError } = await supabaseClient.from("order_statuses").select("*")

          if (statusesError) {
            console.error("獲取訂單狀態資料失敗:", statusesError)
          } else if (statusesData) {
            const statusMap: Record<string, any> = {}
            statusesData.forEach((status) => {
              statusMap[status.status_code] = {
                id: status.id,
                status_code: status.status_code,
                name_zh: status.name_zh,
                color: status.color || `bg-gray-500`,
                description: status.description,
                is_active: status.is_active,
              }
            })
            setOrderStatuses(statusMap)

            // 設置狀態篩選選項
            const statusOptions = statusesData
              .filter((status) => status.is_active)
              .map((status) => ({
                value: status.status_code,
                label: status.name_zh,
              }))

            setFilterOptions((prev) => [
              ...prev,
              {
                id: "status",
                label: "狀態",
                options: statusOptions,
                type: "select",
              },
            ])
          }
        } catch (err) {
          console.error("獲取訂單狀態資料時出錯:", err)
        }

        // 5. 獲取訂單資料 - 使用新的資料表結構
        try {
          let query = supabaseClient.from("orders").select("*").order("order_sid", { ascending: false }) // 使用新的 order_sid 欄位排序

          // 如果有狀態篩選，添加篩選條件
          if (statusFilter) {
            query = query.eq("status", statusFilter)
          }

          const { data: ordersData, error: ordersError } = await query

          if (ordersError) {
            console.error("獲取訂單資料失敗:", ordersError)
            setError("獲取訂單資料失敗，請稍後再試。")
          } else if (ordersData) {
            // 檢查訂單資料的結構，確定可用的欄位
            if (ordersData.length > 0) {
              console.log("訂單資料欄位:", Object.keys(ordersData[0]))
            }

            // 處理訂單資料
            const processedOrders = [...ordersData]

            // 為每個訂單獲取批次項目
            for (const order of processedOrders) {
              try {
                const batchResult = await getOrderBatchItemsByOrderId(order.order_id)
                if (batchResult.success && batchResult.data) {
                  order.batch_items = batchResult.data

                  // 計算訂單總數量和總金額
                  let totalQuantity = 0
                  let totalAmount = 0

                  batchResult.data.forEach((item) => {
                    totalQuantity += item.quantity || 0
                    totalAmount += item.total_price || item.quantity * item.unit_price || 0
                  })

                  order.total_quantity = totalQuantity
                  if (!order.amount) {
                    order.amount = totalAmount
                  }
                }
              } catch (err) {
                console.error(`獲取訂單 ${order.order_id} 的批次項目失敗:`, err)
              }
            }

            setOrders(processedOrders)
            setFilteredOrders(processedOrders)
          } else {
            setOrders([])
            setFilteredOrders([])
          }
        } catch (err) {
          console.error("獲取訂單資料時出錯:", err)
          setError("獲取訂單資料時發生錯誤，請稍後再試。")
        } finally {
          setIsLoading(false)
        }
      } catch (error) {
        console.error("獲取資料時出錯:", error)
        setError("獲取資料時發生錯誤，請稍後再試。")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [statusFilter])

  // 處理搜尋和篩選
  const handleFilterChange = (filters: Record<string, any>) => {
    const { search, ...otherFilters } = filters

    let filtered = [...orders]

    // 處理搜尋
    if (search && search.trim() !== "") {
      const term = search.toLowerCase()
      filtered = filtered.filter((order) => {
        const orderId = String(order.order_id || "").toLowerCase()
        const poId = String(order.po_id || "").toLowerCase()
        const customerId = String(order.customer_id || "").toLowerCase()
        const customerName = customers[order.customer_id]?.name?.toLowerCase() || ""

        return orderId.includes(term) || poId.includes(term) || customerId.includes(term) || customerName.includes(term)
      })
    }

    // 處理其他篩選條件
    Object.entries(otherFilters).forEach(([key, value]) => {
      if (value && value !== "all") {
        filtered = filtered.filter((order) => {
          if (key === "customer_id") {
            return order.customer_id === value
          }
          if (key === "status") {
            return String(order.status) === String(value)
          }
          return true
        })
      }
    })

    setFilteredOrders(filtered)
    setSearchTerm(search || "")
  }

  // 排序功能
  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = "asc"

    if (sortField === field) {
      if (sortDirection === "asc") {
        newDirection = "desc"
      } else if (sortDirection === "desc") {
        newDirection = null
      } else {
        newDirection = "asc"
      }
    }

    setSortField(newDirection ? field : null)
    setSortDirection(newDirection)

    if (newDirection) {
      const sorted = [...filteredOrders].sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (field) {
          case "order_id":
            aValue = a.order_id || ""
            bValue = b.order_id || ""
            break
          case "po_id":
            aValue = a.po_id || ""
            bValue = b.po_id || ""
            break
          case "customer_id":
            aValue = customers[a.customer_id]?.name || a.customer_id || ""
            bValue = customers[b.customer_id]?.name || b.customer_id || ""
            break
          case "estimated_delivery_date":
            aValue = a.estimated_delivery_date || ""
            bValue = b.estimated_delivery_date || ""
            break
          case "created_at":
            aValue = a.created_at || a.order_id || ""
            bValue = b.created_at || b.order_id || ""
            break
          case "status":
            aValue = orderStatuses[a.status]?.name_zh || a.status || ""
            bValue = orderStatuses[b.status]?.name_zh || b.status || ""
            break
          default:
            return 0
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return newDirection === "asc" ? aValue.localeCompare(bValue, "zh-TW") : bValue.localeCompare(aValue, "zh-TW")
        }

        if (aValue < bValue) return newDirection === "asc" ? -1 : 1
        if (aValue > bValue) return newDirection === "asc" ? 1 : -1
        return 0
      })

      setFilteredOrders(sorted)
    } else {
      // 重置為原始順序
      setFilteredOrders([...orders])
    }
  }

  // 獲取排序圖標
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }

    if (sortDirection === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4" />
    } else if (sortDirection === "desc") {
      return <ArrowDown className="ml-2 h-4 w-4" />
    }

    return <ArrowUpDown className="ml-2 h-4 w-4" />
  }

  // 切換訂單展開狀態
  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }))
  }

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

  // 獲取產品名稱
  const getProductName = (order: any) => {
    try {
      const customerId = order.customer_id || "unknown"
      const customerProducts = products[customerId] || {}

      // 使用批次項目數據
      if (order.batch_items && order.batch_items.length > 0) {
        // 按產品索引分組
        const productGroups: Record<string, any[]> = {}

        order.batch_items.forEach((item: any) => {
          if (!productGroups[item.product_index]) {
            productGroups[item.product_index] = []
          }
          productGroups[item.product_index].push(item)
        })

        // 獲取產品名稱
        const productNames = Object.values(productGroups).map((items) => {
          const firstItem = items[0]
          const partNo = firstItem.part_no
          const name = firstItem.description || customerProducts[partNo] || partNo
          return name
        })

        return productNames.join("; ")
      }

      // 如果沒有批次項目數據，嘗試使用舊的方式
      if (order.part_no_assembly) {
        return customerProducts[order.part_no_assembly] || order.part_no_assembly
      }

      if (order.part_no_list) {
        return parsePartNoList(order.part_no_list, customerId)
      }

      return "-"
    } catch (error) {
      console.error("獲取產品名稱時出錯:", error)
      return "-"
    }
  }

  // 獲取組件產品的部件列表
  const getComponentsList = (order: any) => {
    try {
      const customerId = order.customer_id || "unknown"
      const customerProducts = products[customerId] || {}

      if (order.batch_items && order.batch_items.length > 0) {
        // 找出是組件的產品
        const assemblyItems = order.batch_items.filter((item: any) => item.is_assembly)

        if (assemblyItems.length === 0) return null

        // 獲取組件的部件
        const componentsList = assemblyItems.map((assemblyItem: any) => {
          // 找出屬於這個組件的所有部件
          const components = order.batch_items.filter(
            (item: any) => item.assembly_id === assemblyItem.id && !item.is_assembly,
          )

          if (components.length === 0) return null

          return (
            <div key={assemblyItem.id} className="ml-6 mt-1 text-sm">
              <div className="font-medium">組件部件:</div>
              <ul className="list-disc pl-5">
                {components.map((component: any) => (
                  <li key={component.id}>
                    {component.description || customerProducts[component.part_no] || component.part_no}
                    {component.quantity ? ` (${component.quantity}${component.unit || "個"})` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )
        })

        return componentsList
      }

      return null
    } catch (error) {
      console.error("獲取組件部件列表時出錯:", error)
      return null
    }
  }

  // 檢查訂單是否包含組件產品
  const hasAssemblyProduct = (order: any): boolean => {
    // 使用新的批次項目數據
    if (order.batch_items && order.batch_items.length > 0) {
      return order.batch_items.some((item: any) => item.is_assembly)
    }

    // 如果沒有批次項目數據，嘗試使用舊的方式
    return !!order.part_no_assembly
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

  // 獲取訂單建立日期
  const getOrderCreatedDate = (order: any) => {
    // 首先嘗試從 created_at 欄位獲取
    if (order.created_at) {
      try {
        return format(new Date(order.created_at), "yyyy/MM/dd", { locale: zhTW })
      } catch (e) {
        // 忽略錯誤，嘗試下一個方法
      }
    }

    // 如果沒有 created_at，嘗試從order_id提取日期
    if (order.order_id) {
      const extractedDate = extractDateFromOrderId(order.order_id)
      if (extractedDate !== "-") {
        return extractedDate
      }
    }

    // 如果都無法獲取有效日期，嘗試其他日期欄位
    const possibleDateFields = ["order_date", "updated_at", "date"]
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

  // 獲取預期交貨日期
  const getEstimatedDeliveryDate = (order: any) => {
    if (order.estimated_delivery_date) {
      try {
        return format(new Date(order.estimated_delivery_date), "yyyy/MM/dd", { locale: zhTW })
      } catch (e) {
        console.error("格式化預期交貨日期時出錯:", e)
        return "-"
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

      // 從order_statuses表中獲取狀態信息
      const statusInfo = orderStatuses[statusKey]

      if (statusInfo) {
        return {
          text: statusInfo.name_zh,
          color: statusInfo.color || "bg-blue-500",
        }
      }

      // 如果在order_statuses中找不到，使用默認映射
      const defaultStatusMap: Record<string, string> = {
        "0": "待確認",
        "1": "進行中",
        "2": "驗貨完成",
        "3": "已出貨/結案",
      }

      const defaultColorMap: Record<string, string> = {
        "0": "bg-orange-500",
        "1": "bg-yellow-500",
        "2": "bg-green-500",
        "3": "bg-blue-500",
      }

      // 從映射中獲取狀態文字和顏色
      const statusText = defaultStatusMap[statusKey] || `狀態${statusKey}`
      const statusColor = defaultColorMap[statusKey] || "bg-gray-500"

      return { text: statusText, color: statusColor }
    } catch (error) {
      console.error("獲取訂單狀態時出錯:", error)
      return { text: "-", color: "bg-gray-500" }
    }
  }

  // 打開狀態編輯對話框
  const openStatusDialog = (order: any) => {
    setSelectedOrder(order)
    setSelectedStatus(String(order.status || ""))
    setStatusDialogOpen(true)
  }

  // 更新訂單狀態
  const updateOrderStatus = async () => {
    if (!selectedOrder || !selectedStatus) return

    try {
      const { error } = await supabaseClient
        .from("orders")
        .update({ status: selectedStatus })
        .eq("order_id", selectedOrder.order_id)

      if (error) {
        console.error("更新訂單狀態失敗:", error)
        alert("更新訂單狀態失敗，請稍後再試。")
        return
      }

      // 更新本地狀態
      setOrders(
        orders.map((order) =>
          order.order_id === selectedOrder.order_id ? { ...order, status: selectedStatus } : order,
        ),
      )

      setFilteredOrders(
        filteredOrders.map((order) =>
          order.order_id === selectedOrder.order_id ? { ...order, status: selectedStatus } : order,
        ),
      )

      setStatusDialogOpen(false)
    } catch (error) {
      console.error("更新訂單狀態時出錯:", error)
      alert("更新訂單狀態時發生錯誤，請稍後再試。")
    }
  }

  // 查看訂單詳情 - 使用 order_id 而不是 order_sid
  const viewOrderDetails = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  // 編輯訂單
  const editOrder = (orderId: string) => {
    router.push(`/orders/${orderId}/edit`)
  }

  // 列印訂單
  const printOrder = (orderId: string) => {
    router.push(`/orders/${orderId}/print`)
  }

  // 導出訂單資料
  const exportOrders = () => {
    // 實現導出功能
    alert("導出功能尚未實現")
  }

  // 獲取客戶名稱和負責業務
  const getCustomerName = (customerId: string) => {
    const customer = customers[customerId]
    if (!customer) return customerId || "-"

    // 修復：使用 sales_representative 欄位正確獲取負責業務名稱
    const salesRepresentativeId = customer.sales_representative || customer.salesRepresentative
    const salesRepresentativeName = salesRepresentativeId
      ? teamMembers[salesRepresentativeId] || salesRepresentativeId
      : ""

    return (
      <div>
        <div className="font-medium">{customer.name || customerId}</div>
        {customer.fullName && <div className="text-sm text-muted-foreground">{customer.fullName}</div>}
        {salesRepresentativeName && <div className="text-xs text-blue-600">負責業務: {salesRepresentativeName}</div>}
      </div>
    )
  }

  // 渲染排序按鈕
  const renderSortButton = (field: SortField, label: string) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-semibold hover:bg-transparent hover:text-primary"
    >
      {label}
      {getSortIcon(field)}
    </Button>
  )

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <AdvancedFilter
            options={filterOptions}
            onFilterChange={handleFilterChange}
            placeholder="搜尋訂單編號、客戶PO編號、客戶..."
          />
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center text-red-500">{error}</div>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          </CardContent>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center text-gray-500 py-4">沒有找到訂單資料</div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>{renderSortButton("order_id", "訂單編號")}</TableHead>
                    <TableHead>{renderSortButton("po_id", "客戶PO編號")}</TableHead>
                    <TableHead>{renderSortButton("customer_id", "客戶")}</TableHead>
                    <TableHead>產品</TableHead>
                    <TableHead>{renderSortButton("estimated_delivery_date", "預期交貨日期")}</TableHead>
                    <TableHead>{renderSortButton("created_at", "訂單建立日期")}</TableHead>
                    <TableHead>{renderSortButton("status", "狀態")}</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const status = getOrderStatus(order)
                    const isAssembly = hasAssemblyProduct(order)
                    const isExpanded = expandedOrders[order.order_id] || false
                    const componentsList = isAssembly ? getComponentsList(order) : null

                    return (
                      <React.Fragment key={order.order_sid || order.order_id}>
                        <TableRow className="hover:bg-muted/30">
                          <TableCell className="font-medium">{order.order_id || "-"}</TableCell>
                          <TableCell>{order.po_id || "-"}</TableCell>
                          <TableCell>{getCustomerName(order.customer_id)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {isAssembly && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-0 mr-1"
                                  onClick={() => toggleOrderExpand(order.order_id)}
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                              {getProductName(order)}
                              {isAssembly && <Layers className="ml-2 h-4 w-4 text-purple-500" title="組件產品" />}
                            </div>
                          </TableCell>
                          <TableCell>{getEstimatedDeliveryDate(order)}</TableCell>
                          <TableCell>{getOrderCreatedDate(order)}</TableCell>
                          <TableCell>
                            <Badge
                              className={`${status.color} text-white border-0 px-3 py-1 cursor-pointer hover:opacity-80`}
                              onClick={() => openStatusDialog(order)}
                            >
                              {status.text}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <span className="sr-only">開啟選單</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>操作</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => viewOrderDetails(order.order_id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  查看詳情
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => editOrder(order.order_id)}>
                                  <FileEdit className="mr-2 h-4 w-4" />
                                  編輯訂單
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => printOrder(order.order_id)}>
                                  <Printer className="mr-2 h-4 w-4" />
                                  列印訂單
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  刪除訂單
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                        {isExpanded && componentsList && (
                          <TableRow className="bg-muted/20">
                            <TableCell colSpan={8} className="py-1">
                              {componentsList}
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 訂單狀態編輯對話框 */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>更新訂單狀態</DialogTitle>
            <DialogDescription>選擇新的訂單狀態</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="選擇狀態" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(orderStatuses)
                  .filter(([_, status]) => status.is_active)
                  .map(([code, status]) => (
                    <SelectItem key={code} value={code}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                        {status.name_zh}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={updateOrderStatus}>更新狀態</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
