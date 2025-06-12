"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileEdit, MoreHorizontal, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { supabaseClient } from "@/lib/supabase-client"
import { TeamMemberDetailDialog } from "@/components/ui/team-member-detail-dialog"

// 客戶資料類型 - 使用Supabase的資料結構
interface Customer {
  customer_id: string
  customer_short_name: string
  customer_full_name?: string
  division_location?: string
  group_code?: string
  customer_phone?: string
  customer_fax?: string
  report_email?: string
  invoice_email?: string
  client_contact_person?: string
  client_contact_person_email?: string
  sales_representative?: string
  payment_due_date?: string
  payment_terms?: string
  payment_condition?: string
  trade_terms?: string
  delivery_terms?: string
  currency?: string
  exchange_rate?: number
  status?: string
  logistics_coordinator?: string
  customer_address?: string
  invoice_address?: string
  ship_to_address?: string
  client_procurement?: string
  client_sales?: string
  port_of_discharge_default?: string
  forwarder?: string
  customer_packaging?: string
  pallet_format?: string
  carton_format?: string
  max_carton_weight?: number
  sc_shipping_mark?: string
  labels?: string
  qty_allowance_percent?: number
  acceptance_percent?: number
  report_type?: string
  require_report?: boolean
  cbam_note?: string
  legacy_system_note?: string
  remarks?: string
  created_at?: string
  updated_at?: string
}

interface CustomersTableProps {
  data?: Customer[]
  isLoading?: boolean
  visibleColumns?: string[]
  columnOrder?: string[]
}

export function CustomersTable({
  data = [],
  isLoading = false,
  visibleColumns = [],
  columnOrder = [],
}: CustomersTableProps) {
  const [teamMembers, setTeamMembers] = useState<Record<string, string>>({})
  const [paymentTerms, setPaymentTerms] = useState<Record<string, string>>({})
  const [ports, setPorts] = useState<Record<string, string>>({})
  const [loadingData, setLoadingData] = useState(true)
  const [memberDetailDialog, setMemberDetailDialog] = useState({
    open: false,
    employeeId: null as string | null,
    title: "",
  })

  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // 計算分頁資料
  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  // 重置頁面當資料變更時
  useEffect(() => {
    setCurrentPage(1)
  }, [data])

  // 定義所有可能的欄位渲染函數
  const columnRenderers: Record<string, (customer: Customer) => React.ReactNode> = {
    customer_id: (customer) => (
      <Link href={`/customers/all/${customer.customer_id}`} className="text-blue-600 hover:underline cursor-pointer">
        {customer.customer_id}
      </Link>
    ),
    customer_short_name: (customer) => (
      <div>
        <div className="font-medium">{customer.customer_short_name}</div>
        {customer.customer_full_name && (
          <div className="text-sm text-muted-foreground">{customer.customer_full_name}</div>
        )}
      </div>
    ),
    customer_full_name: (customer) => customer.customer_full_name || "-",
    group_code: (customer) => customer.group_code || "-",
    division_location: (customer) => customer.division_location || "-",
    client_contact_person: (customer) => customer.client_contact_person || "-",
    client_contact_person_email: (customer) => customer.client_contact_person_email || "-",
    customer_phone: (customer) => customer.customer_phone || "-",
    customer_fax: (customer) => customer.customer_fax || "-",
    report_email: (customer) => customer.report_email || "-",
    invoice_email: (customer) => customer.invoice_email || "-",
    customer_address: (customer) => customer.customer_address || "-",
    invoice_address: (customer) => customer.invoice_address || "-",
    ship_to_address: (customer) => customer.ship_to_address || "-",
    sales_representative: (customer) => getSalesRepresentative(customer),
    logistics_coordinator: (customer) => getLogisticsCoordinator(customer),
    client_procurement: (customer) => customer.client_procurement || "-",
    client_sales: (customer) => customer.client_sales || "-",
    currency: (customer) => customer.currency || "-",
    exchange_rate: (customer) => customer.exchange_rate?.toString() || "-",
    payment_terms: (customer) => getPaymentTerms(customer),
    payment_due_date: (customer) => customer.payment_due_date || "-",
    payment_condition: (customer) => customer.payment_condition || "-",
    trade_terms: (customer) => customer.trade_terms || "-",
    delivery_terms: (customer) => customer.delivery_terms || "-",
    port_of_discharge_default: (customer) => getPortName(customer.port_of_discharge_default),
    forwarder: (customer) => customer.forwarder || "-",
    customer_packaging: (customer) => customer.customer_packaging || "-",
    pallet_format: (customer) => customer.pallet_format || "-",
    carton_format: (customer) => customer.carton_format || "-",
    max_carton_weight: (customer) => customer.max_carton_weight?.toString() || "-",
    sc_shipping_mark: (customer) => customer.sc_shipping_mark || "-",
    labels: (customer) => customer.labels || "-",
    qty_allowance_percent: (customer) => customer.qty_allowance_percent?.toString() || "-",
    acceptance_percent: (customer) => customer.acceptance_percent?.toString() || "-",
    report_type: (customer) => customer.report_type || "-",
    require_report: (customer) => (customer.require_report ? "是" : "否"),
    cbam_note: (customer) => customer.cbam_note || "-",
    legacy_system_note: (customer) => customer.legacy_system_note || "-",
    remarks: (customer) => customer.remarks || "-",
    status: (customer) => {
      const activityStatus = getActivityStatus(customer)
      return <Badge variant={activityStatus.variant}>{activityStatus.label}</Badge>
    },
    created_at: (customer) => (customer.created_at ? new Date(customer.created_at).toLocaleDateString("zh-TW") : "-"),
    updated_at: (customer) => (customer.updated_at ? new Date(customer.updated_at).toLocaleDateString("zh-TW") : "-"),
  }

  // 欄位標籤映射
  const columnLabels: Record<string, string> = {
    customer_id: "客戶編號",
    customer_short_name: "客戶簡稱",
    customer_full_name: "客戶全名",
    group_code: "集團代號",
    division_location: "分部位置",
    client_contact_person: "客戶聯絡人",
    client_contact_person_email: "聯絡人Email",
    customer_phone: "客戶電話",
    customer_fax: "客戶傳真",
    report_email: "報告Email",
    invoice_email: "發票Email",
    customer_address: "客戶地址",
    invoice_address: "發票地址",
    ship_to_address: "送貨地址",
    sales_representative: "負責業務",
    logistics_coordinator: "負責船務",
    client_procurement: "客戶採購",
    client_sales: "客戶業務",
    currency: "幣別",
    exchange_rate: "匯率",
    payment_terms: "付款條件",
    payment_due_date: "付款到期日",
    payment_condition: "付款條件詳情",
    trade_terms: "貿易條件",
    delivery_terms: "交貨條件",
    port_of_discharge_default: "預設到貨港",
    forwarder: "轉運商",
    customer_packaging: "客戶包裝",
    pallet_format: "棧板格式",
    carton_format: "紙箱格式",
    max_carton_weight: "最大紙箱重量",
    sc_shipping_mark: "嘜頭",
    labels: "標籤",
    qty_allowance_percent: "數量容許百分比",
    acceptance_percent: "驗收百分比",
    report_type: "報告類型",
    require_report: "需要報告",
    cbam_note: "CBAM備註",
    legacy_system_note: "舊系統備註",
    remarks: "備註",
    status: "活躍度",
    created_at: "建立時間",
    updated_at: "更新時間",
  }

  // 根據 columnOrder 和 visibleColumns 決定要顯示的欄位及其順序
  const displayColumns = columnOrder
    .filter((columnId) => visibleColumns.includes(columnId))
    .filter((columnId) => columnRenderers[columnId] && columnLabels[columnId])

  // 獲取相關資料
  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingData(true)

        // 獲取團隊成員
        const { data: teamData, error: teamError } = await supabaseClient
          .from("team_members")
          .select("ls_employee_id, name")

        if (teamError) {
          console.error("Error fetching team members:", teamError)
        } else {
          const teamMemberMap: Record<string, string> = {}
          teamData.forEach((member) => {
            if (member.ls_employee_id && member.name) {
              teamMemberMap[member.ls_employee_id] = member.name
            }
          })
          setTeamMembers(teamMemberMap)
        }

        // 獲取付款條件
        const { data: paymentData, error: paymentError } = await supabaseClient
          .from("payment_terms")
          .select("code, name_zh, name_en")

        if (paymentError) {
          console.error("Error fetching payment terms:", paymentError)
        } else {
          const paymentTermMap: Record<string, string> = {}
          paymentData.forEach((term) => {
            if (term.code && term.name_zh) {
              paymentTermMap[term.code] = term.name_zh
            }
          })
          setPaymentTerms(paymentTermMap)
        }

        // 獲取港口資料
        const { data: portsData, error: portsError } = await supabaseClient
          .from("ports")
          .select("un_locode, port_name_zh, port_name_en")

        if (portsError) {
          console.error("Error fetching ports:", portsError)
        } else {
          const portsMap: Record<string, string> = {}
          portsData.forEach((port) => {
            if (port.un_locode) {
              portsMap[port.un_locode] = port.port_name_zh || port.port_name_en || port.un_locode
            }
          })
          setPorts(portsMap)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [])

  // 獲取業務負責人（可點擊）
  const getSalesRepresentative = (customer: Customer) => {
    const employeeId = customer.sales_representative
    if (!employeeId) return <span className="text-muted-foreground">-</span>

    const memberName = teamMembers[employeeId]
    const displayText = memberName ? `${memberName} (${employeeId})` : employeeId

    return (
      <button
        onClick={() =>
          setMemberDetailDialog({
            open: true,
            employeeId,
            title: "負責業務詳情",
          })
        }
        className="text-blue-600 hover:underline cursor-pointer text-left"
      >
        {displayText}
      </button>
    )
  }

  // 獲取船務負責人（可點擊）
  const getLogisticsCoordinator = (customer: Customer) => {
    const employeeId = customer.logistics_coordinator
    if (!employeeId) return <span className="text-muted-foreground">-</span>

    const memberName = teamMembers[employeeId]
    const displayText = memberName ? `${memberName} (${employeeId})` : employeeId

    return (
      <button
        onClick={() =>
          setMemberDetailDialog({
            open: true,
            employeeId,
            title: "負責船務詳情",
          })
        }
        className="text-blue-600 hover:underline cursor-pointer text-left"
      >
        {displayText}
      </button>
    )
  }

  // 獲取付款條件
  const getPaymentTerms = (customer: Customer) => {
    if (!customer.payment_terms) return "-"

    const termName = paymentTerms[customer.payment_terms]
    if (termName) {
      return `${termName} (${customer.payment_terms})`
    }

    return customer.payment_terms
  }

  // 獲取港口名稱
  const getPortName = (unLocode?: string) => {
    if (!unLocode) return "-"
    return ports[unLocode] || unLocode
  }

  // 獲取活躍度狀態
  const getActivityStatus = (customer: Customer) => {
    if (customer.status === "inactive") {
      return { label: "非活躍", variant: "secondary" as const }
    }
    return { label: "活躍", variant: "default" as const }
  }

  // 分頁控制函數
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1) // 重置到第一頁
  }

  if (isLoading || loadingData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>客戶列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {displayColumns.map((columnId) => (
                <TableHead key={columnId}>{columnLabels[columnId]}</TableHead>
              ))}
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={displayColumns.length + 1} className="h-24 text-center">
                  沒有找到客戶資料
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((customer, index) => (
                <TableRow key={customer.customer_id} className={index % 2 === 1 ? "bg-muted/50" : ""}>
                  {displayColumns.map((columnId) => (
                    <TableCell key={columnId}>{columnRenderers[columnId](customer)}</TableCell>
                  ))}
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
                          <Link href={`/customers/all/${customer.customer_id}/edit`} className="flex items-center">
                            <FileEdit className="mr-2 h-4 w-4" />
                            編輯客戶
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          刪除客戶
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分頁控制 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            顯示 {startIndex + 1} 到 {Math.min(endIndex, totalItems)} 筆，共 {totalItems} 筆資料
          </p>
          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">筆/頁</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            上一頁
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            下一頁
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 團隊成員詳情對話框 */}
      <TeamMemberDetailDialog
        open={memberDetailDialog.open}
        onOpenChange={(open) => setMemberDetailDialog((prev) => ({ ...prev, open }))}
        employeeId={memberDetailDialog.employeeId}
        title={memberDetailDialog.title}
      />
    </div>
  )
}
