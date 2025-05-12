"use client"

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
import { Eye, FileEdit, MoreHorizontal, Trash2, Tag } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

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
  currency?: string
  status?: string
}

interface CustomersTableProps {
  data?: Customer[]
  isLoading?: boolean
}

export function CustomersTable({ data = [], isLoading = false }: CustomersTableProps) {
  // Removed the searchTerm state and filtering logic

  if (isLoading) {
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
      {/* Removed the search input div */}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>客戶編號</TableHead>
              <TableHead>客戶名稱</TableHead>
              <TableHead>集團</TableHead>
              <TableHead>國家/地區</TableHead>
              <TableHead>聯絡人</TableHead>
              <TableHead>付款條件</TableHead>
              <TableHead>幣別</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  沒有找到符合條件的客戶
                </TableCell>
              </TableRow>
            ) : (
              data.map((customer) => (
                <TableRow key={customer.customer_id}>
                  <TableCell className="font-medium">{customer.customer_id}</TableCell>
                  <TableCell>
                    <div>{customer.customer_short_name}</div>
                    {customer.customer_full_name && (
                      <div className="text-sm text-muted-foreground">{customer.customer_full_name}</div>
                    )}
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
                  <TableCell>{customer.client_contact_person || "-"}</TableCell>
                  <TableCell>{customer.payment_due_date ? `${customer.payment_due_date}天` : "-"}</TableCell>
                  <TableCell>{customer.currency || "-"}</TableCell>
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
                          <Link href={`/customers/all/${customer.customer_id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            查看詳情
                          </Link>
                        </DropdownMenuItem>
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
    </div>
  )
}
