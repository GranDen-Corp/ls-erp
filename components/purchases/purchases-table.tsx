"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Eye, FileText, MoreHorizontal, Pencil } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase-client"

// 狀態顏色映射
const statusColorMap: Record<string, string> = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
}

// 狀態顯示名稱映射
const statusDisplayMap: Record<string, string> = {
  pending: "待確認",
  processing: "進行中",
  completed: "已完成",
  cancelled: "已取消",
}

interface Purchase {
  purchase_sid: number
  purchase_id: string
  factory_id: string
  factory_name: string
  order_id: string | null
  status: string
  issue_date: string
  expected_delivery_date: string | null
  total_amount: number
  currency: string
  created_at: string
  updated_at: string
}

interface PurchasesTableProps {
  status?: string
}

export function PurchasesTable({ status }: PurchasesTableProps) {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState(status || "all")

  useEffect(() => {
    async function fetchPurchases() {
      try {
        setLoading(true)
        setError(null)

        const supabase = createClient()

        // 構建查詢
        let query = supabase.from("purchases").select("*")

        // 應用狀態過濾
        if (statusFilter && statusFilter !== "all") {
          query = query.eq("status", statusFilter)
        }

        // 獲取數據並按日期排序
        const { data, error } = await query.order("issue_date", { ascending: false })

        if (error) {
          throw error
        }

        setPurchases(data || [])
      } catch (err: any) {
        console.error("獲取採購單數據時出錯:", err)
        setError(`載入採購單資料時發生錯誤: ${err.message}`)
        setPurchases([])
      } finally {
        setLoading(false)
      }
    }

    fetchPurchases()
  }, [statusFilter])

  // 當props中的status變更時，更新狀態過濾器
  useEffect(() => {
    setStatusFilter(status || "all")
  }, [status])

  // 過濾採購單
  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.purchase_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.factory_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (purchase.order_id && purchase.order_id.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesSearch
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

  // 格式化日期顯示
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "未設定"
    return new Date(dateString).toLocaleDateString("zh-TW")
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>錯誤</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Input
          placeholder="搜尋採購單編號、供應商或訂單編號..."
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
              <SelectItem value="pending">待確認</SelectItem>
              <SelectItem value="processing">進行中</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
              <SelectItem value="cancelled">已取消</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>採購單編號</TableHead>
              <TableHead>供應商</TableHead>
              <TableHead>關聯訂單</TableHead>
              <TableHead>發出日期</TableHead>
              <TableHead>預期交期</TableHead>
              <TableHead>金額</TableHead>
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
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredPurchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  {searchTerm ? "沒有符合搜尋條件的採購單" : "沒有採購單資料"}
                </TableCell>
              </TableRow>
            ) : (
              filteredPurchases.map((purchase) => (
                <TableRow key={purchase.purchase_sid}>
                  <TableCell className="font-medium">{purchase.purchase_id}</TableCell>
                  <TableCell>{purchase.factory_name}</TableCell>
                  <TableCell>{purchase.order_id || "無關聯訂單"}</TableCell>
                  <TableCell>{formatDate(purchase.issue_date)}</TableCell>
                  <TableCell>{formatDate(purchase.expected_delivery_date)}</TableCell>
                  <TableCell>{formatAmount(purchase.total_amount, purchase.currency)}</TableCell>
                  <TableCell>
                    <Badge className={`${statusColorMap[purchase.status] || "bg-gray-500"} text-white`}>
                      {statusDisplayMap[purchase.status] || purchase.status}
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
                          <Link href={`/purchases/${purchase.purchase_id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            查看詳情
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/purchases/${purchase.purchase_id}/edit`} className="flex items-center">
                            <Pencil className="mr-2 h-4 w-4" />
                            編輯採購單
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Link href={`/purchases/${purchase.purchase_id}/document`} className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            查看採購單文件
                          </Link>
                        </DropdownMenuItem>
                        {purchase.order_id && (
                          <DropdownMenuItem>
                            <Link href={`/orders/${purchase.order_id}`} className="flex items-center">
                              <FileText className="mr-2 h-4 w-4" />
                              查看關聯訂單
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
