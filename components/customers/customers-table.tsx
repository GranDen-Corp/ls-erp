"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, FileEdit, Trash2, Eye, Tag, Loader2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabaseClient } from "@/lib/supabase-client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

// 客戶資料類型
interface Customer {
  customer_id: string
  customer_short_name: string
  customer_full_name: string
  currency: string
  customer_address?: string
  customer_phone?: string
  customer_fax?: string
  payment_due_date?: string
  division_location?: string
  sales_representative?: string
  group_code?: string
  invoice_email?: string
  report_email?: string
  require_report?: boolean
  report_type?: string
  exchange_rate?: number
  acceptance_percent?: number
  use_group_setting?: boolean
  max_carton_weight?: number
  customer_packaging?: string
  order_packaging_display?: string
}

export default function CustomersTable() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [groupFilter, setGroupFilter] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // 從Supabase獲取客戶資料
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const { data, error } = await supabaseClient.from("customers").select("*")

        if (error) {
          throw new Error(`獲取客戶資料時出錯: ${error.message}`)
        }

        console.log("獲取到的客戶列表:", data) // 添加日誌以便調試
        setCustomers(data || [])
      } catch (err) {
        console.error("獲取客戶資料時出錯:", err)
        setError(err instanceof Error ? err.message : "獲取客戶資料時出錯")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  // 提取所有唯一的集團標籤
  const uniqueGroups = Array.from(new Set(customers.map((customer) => customer.group_code).filter(Boolean)))

  // 根據搜索詞和集團過濾客戶
  const filteredCustomers = customers.filter((customer) => {
    // 先檢查是否符合搜尋條件
    const matchesSearch =
      customer.customer_short_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.division_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false

    // 再檢查是否符合集團篩選條件
    const matchesGroup = !groupFilter || customer.group_code === groupFilter

    return matchesSearch && matchesGroup
  })

  // 處理刪除客戶
  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const { error } = await supabaseClient.from("customers").delete().eq("customer_id", customerId)

      if (error) {
        throw new Error(`刪除客戶時出錯: ${error.message}`)
      }

      // 更新本地狀態
      setCustomers(customers.filter((customer) => customer.customer_id !== customerId))

      toast({
        title: "客戶已刪除",
        description: `客戶ID: ${customerId} 已成功刪除`,
      })
    } catch (err) {
      console.error("刪除客戶時出錯:", err)
      toast({
        title: "刪除失敗",
        description: err instanceof Error ? err.message : "刪除客戶時出錯",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>客戶管理</CardTitle>
          <CardDescription>載入中...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>載入客戶資料中...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>客戶管理</CardTitle>
          <CardDescription>發生錯誤</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <p className="text-red-500">錯誤: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜尋客戶..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-[200px]">
          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger>
              <SelectValue placeholder="按集團過濾" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部集團</SelectItem>
              {uniqueGroups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>客戶編號</TableHead>
              <TableHead>客戶名稱</TableHead>
              <TableHead>集團</TableHead>
              <TableHead>國家/地區</TableHead>
              <TableHead>付款條件</TableHead>
              <TableHead>幣別</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  沒有找到客戶
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.customer_id}>
                  <TableCell className="font-medium">{customer.customer_id}</TableCell>
                  <TableCell>
                    <div>{customer.customer_short_name}</div>
                    <div className="text-sm text-muted-foreground">{customer.customer_full_name}</div>
                  </TableCell>
                  <TableCell>
                    {customer.group_code && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {customer.group_code}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{customer.division_location || "-"}</TableCell>
                  <TableCell>{customer.payment_due_date ? `${customer.payment_due_date}天` : "-"}</TableCell>
                  <TableCell>{customer.currency || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">開啟選單</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            // 使用與 customer-data-table.tsx 中相同的詳情顯示方式
                            // 這裡我們假設會打開一個模態框來顯示客戶詳情
                            router.push(`/customers/${customer.customer_id}`)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          查看詳情
                        </DropdownMenuItem>
                        <Link href={`/customers/${customer.customer_id}/edit`}>
                          <DropdownMenuItem>
                            <FileEdit className="mr-2 h-4 w-4" />
                            編輯
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteCustomer(customer.customer_id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          刪除
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
    </div>
  )
}
