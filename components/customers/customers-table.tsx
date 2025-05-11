"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, FileEdit, Trash2, Eye, Tag } from "lucide-react"
import type { Customer } from "@/types/customer"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
]

export default function CustomersTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [groupFilter, setGroupFilter] = useState<string>("")
  const [customers] = useState<Customer[]>(mockCustomers)

  // 提取所有唯一的集團標籤
  const uniqueGroups = useMemo(() => {
    const groups = new Set<string>()
    customers.forEach((customer) => {
      if (customer.groupTag) {
        groups.add(customer.groupTag)
      }
    })
    return Array.from(groups)
  }, [customers])

  // 根據搜索詞和集團過濾客戶
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.country.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesGroup = !groupFilter || customer.groupTag === groupFilter

      return matchesSearch && matchesGroup
    })
  }, [customers, searchTerm, groupFilter])

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
              <TableHead>客戶名稱</TableHead>
              <TableHead>聯絡人</TableHead>
              <TableHead>集團</TableHead>
              <TableHead>國家</TableHead>
              <TableHead>付款條件</TableHead>
              <TableHead>狀態</TableHead>
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
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    <div>{customer.contactPerson}</div>
                    <div className="text-sm text-muted-foreground">{customer.email}</div>
                  </TableCell>
                  <TableCell>
                    {customer.groupTag && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {customer.groupTag}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{customer.country}</TableCell>
                  <TableCell>{customer.paymentTerms}</TableCell>
                  <TableCell>
                    <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                      {customer.status === "active" ? "活躍" : "非活躍"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">開啟選單</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/customers/${customer.id}`}>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            查看詳情
                          </DropdownMenuItem>
                        </Link>
                        <Link href={`/customers/${customer.id}/edit`}>
                          <DropdownMenuItem>
                            <FileEdit className="mr-2 h-4 w-4" />
                            編輯
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="text-destructive">
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
