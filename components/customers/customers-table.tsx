"use client"

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
import { FileEdit, MoreHorizontal, Trash2, ArrowUpDown } from "lucide-react"
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
  sales_representative?: string
  payment_due_date?: string
  payment_terms?: string
  trade_terms?: string
  currency?: string
  status?: string
  logistics_coordinator?: string
}

interface TeamMember {
  id: number
  ls_employee_id: string
  name: string
  role?: string
  department?: string
  is_active?: boolean
}

interface PaymentTerm {
  code: string
  name_zh: string
  name_en: string
}

interface CustomersTableProps {
  data?: Customer[]
  isLoading?: boolean
  // 新增的 props
  visibleColumns?: string[]
  defaultSort?: { field: string; direction: "asc" | "desc" }
}

type SortField = keyof Customer | ""
type SortDirection = "asc" | "desc"

export function CustomersTable({
  data = [],
  isLoading = false,
  visibleColumns = [],
  defaultSort,
}: CustomersTableProps) {
  // 使用傳入的預設排序
  const [sortField, setSortField] = useState<SortField>((defaultSort?.field as SortField) || "customer_id")
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSort?.direction || "asc")
  const [teamMembers, setTeamMembers] = useState<Record<string, string>>({})
  const [paymentTerms, setPaymentTerms] = useState<Record<string, string>>({})
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(true)
  const [memberDetailDialog, setMemberDetailDialog] = useState({
    open: false,
    employeeId: null as string | null,
    title: "",
  })

  // 定義所有可能的欄位
  const allColumns = [
    {
      id: "customer_id",
      label: "客戶編號",
      render: (customer: Customer) => (
        <Link href={`/customers/all/${customer.customer_id}`} className="text-blue-600 hover:underline cursor-pointer">
          {customer.customer_id}
        </Link>
      ),
    },
    {
      id: "customer_short_name",
      label: "客戶名稱",
      render: (customer: Customer) => (
        <div>
          <div className="font-medium">{customer.customer_short_name}</div>
          {customer.customer_full_name && (
            <div className="text-sm text-muted-foreground">{customer.customer_full_name}</div>
          )}
        </div>
      ),
    },
    {
      id: "client_contact_person",
      label: "聯絡人",
      render: (customer: Customer) => customer.client_contact_person || "-",
    },
    { id: "contact_email", label: "聯絡人Email", render: (customer: Customer) => getContactEmail(customer) },
    { id: "sales_representative", label: "負責業務", render: (customer: Customer) => getSalesRepresentative(customer) },
    {
      id: "logistics_coordinator",
      label: "負責船務",
      render: (customer: Customer) => getLogisticsCoordinator(customer),
    },
    { id: "trade_terms", label: "貿易條件", render: (customer: Customer) => customer.trade_terms || "-" },
    { id: "payment_terms", label: "付款條件", render: (customer: Customer) => getPaymentTerms(customer) },
    {
      id: "status",
      label: "活躍度",
      render: (customer: Customer) => {
        const activityStatus = getActivityStatus(customer)
        return <Badge variant={activityStatus.variant}>{activityStatus.label}</Badge>
      },
    },
  ]

  // 根據 visibleColumns 過濾要顯示的欄位
  const displayColumns =
    visibleColumns.length > 0 ? allColumns.filter((col) => visibleColumns.includes(col.id)) : allColumns

  // 獲取團隊成員資料和付款條件
  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingTeamMembers(true)

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
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoadingTeamMembers(false)
      }
    }

    fetchData()
  }, [])

  // 處理排序
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // 排序客戶
  const sortedCustomers = [...data].sort((a, b) => {
    if (!sortField) return 0

    const fieldA = a[sortField as keyof Customer]
    const fieldB = b[sortField as keyof Customer]

    if (fieldA === undefined || fieldA === null) return sortDirection === "asc" ? -1 : 1
    if (fieldB === undefined || fieldB === null) return sortDirection === "asc" ? 1 : -1

    if (typeof fieldA === "string" && typeof fieldB === "string") {
      return sortDirection === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA)
    }

    return sortDirection === "asc" ? (fieldA < fieldB ? -1 : 1) : fieldA > fieldB ? -1 : 1
  })

  // 渲染排序按鈕
  const renderSortButton = (field: SortField, label: string) => (
    <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort(field)}>
      {label}
      <ArrowUpDown
        className={`ml-2 h-4 w-4 ${sortField === field ? "opacity-100" : "opacity-50"} ${
          sortField === field && sortDirection === "desc" ? "rotate-180 transform" : ""
        }`}
      />
    </Button>
  )

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

  // 獲取聯絡人Email
  const getContactEmail = (customer: Customer) => {
    return customer.report_email || customer.invoice_email || "-"
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

  // 獲取活躍度狀態
  const getActivityStatus = (customer: Customer) => {
    if (customer.status === "inactive") {
      return { label: "非活躍", variant: "secondary" as const }
    }
    return { label: "活躍", variant: "default" as const }
  }

  if (isLoading || loadingTeamMembers) {
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
              {displayColumns.map((column) => (
                <TableHead key={column.id}>
                  {column.id === sortField ? (
                    <Button
                      variant="ghost"
                      className="p-0 font-semibold"
                      onClick={() => handleSort(column.id as SortField)}
                    >
                      {column.label}
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${sortField === column.id ? "opacity-100" : "opacity-50"} ${
                          sortField === column.id && sortDirection === "desc" ? "rotate-180 transform" : ""
                        }`}
                      />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      className="p-0 font-semibold"
                      onClick={() => handleSort(column.id as SortField)}
                    >
                      {column.label}
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${sortField === column.id ? "opacity-100" : "opacity-50"}`}
                      />
                    </Button>
                  )}
                </TableHead>
              ))}
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  沒有找到客戶資料
                </TableCell>
              </TableRow>
            ) : (
              sortedCustomers.map((customer) => {
                return (
                  <TableRow key={customer.customer_id}>
                    {displayColumns.map((column) => (
                      <TableCell key={column.id}>{column.render(customer)}</TableCell>
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
                )
              })
            )}
          </TableBody>
        </Table>
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
