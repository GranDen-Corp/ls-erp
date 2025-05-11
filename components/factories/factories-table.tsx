"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, ArrowUpDown, Search, FileEdit, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useToast } from "@/components/ui/use-toast"

// 模擬工廠數據
const factories = [
  {
    id: "FAC001",
    name: "台灣精密製造廠",
    contactPerson: "王大明",
    email: "contact@twprecision.com",
    phone: "04-2345-6789",
    address: "台中市西屯區工業區路123號",
    country: "台灣",
    type: "assembly",
    status: "active",
    createdAt: "2023-01-10",
  },
  {
    id: "FAC002",
    name: "深圳電子組裝廠",
    contactPerson: "李小華",
    email: "contact@szassembly.com",
    phone: "+86-755-1234-5678",
    address: "廣東省深圳市寶安區工業園B區",
    country: "中國",
    type: "assembly",
    status: "active",
    createdAt: "2023-02-15",
  },
  {
    id: "FAC003",
    name: "越南製造中心",
    contactPerson: "Nguyen Van A",
    email: "contact@vnmanufacturing.com",
    phone: "+84-28-1234-5678",
    address: "Ho Chi Minh City, District 9, Industrial Zone",
    country: "越南",
    type: "production",
    status: "active",
    createdAt: "2023-03-20",
  },
  {
    id: "FAC004",
    name: "馬來西亞電子廠",
    contactPerson: "Ahmad Bin Abdullah",
    email: "contact@myelectronics.com",
    phone: "+60-3-1234-5678",
    address: "Penang, Bayan Lepas Industrial Zone",
    country: "馬來西亞",
    type: "production",
    status: "inactive",
    createdAt: "2023-04-25",
  },
  {
    id: "FAC005",
    name: "台南零件製造廠",
    contactPerson: "陳小華",
    email: "contact@tnparts.com",
    phone: "06-2345-6789",
    address: "台南市安南區工業二路45號",
    country: "台灣",
    type: "parts",
    status: "active",
    createdAt: "2023-05-30",
  },
]

export function FactoriesTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const { toast } = useToast()

  // 過濾工廠數據
  const filteredFactories = factories.filter((factory) => {
    const matchesSearch =
      factory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factory.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factory.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || factory.status === statusFilter

    const matchesType = typeFilter === "all" || factory.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const handleDeleteFactory = (factoryId: string) => {
    // 實際應用中，這裡會調用API刪除工廠
    toast({
      title: "供應商已刪除",
      description: `供應商ID: ${factoryId} 已成功刪除`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>供應商列表</CardTitle>
        <CardDescription>管理您的所有供應商資料</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜尋供應商..."
                className="pl-8 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="狀態篩選" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有狀態</SelectItem>
                <SelectItem value="active">啟用</SelectItem>
                <SelectItem value="inactive">停用</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="類型篩選" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有類型</SelectItem>
                <SelectItem value="assembly">組裝廠</SelectItem>
                <SelectItem value="production">生產廠</SelectItem>
                <SelectItem value="parts">零件廠</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              匯出
            </Button>
            <Button variant="outline" size="sm">
              匯入
            </Button>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">供應商ID</TableHead>
                <TableHead>
                  <div className="flex items-center">
                    供應商名稱
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>聯絡人</TableHead>
                <TableHead>電話</TableHead>
                <TableHead>類型</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFactories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    沒有找到符合條件的供應商
                  </TableCell>
                </TableRow>
              ) : (
                filteredFactories.map((factory) => (
                  <TableRow key={factory.id}>
                    <TableCell className="font-medium">{factory.id}</TableCell>
                    <TableCell>{factory.name}</TableCell>
                    <TableCell>{factory.contactPerson}</TableCell>
                    <TableCell>{factory.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {factory.type === "assembly" && "組裝廠"}
                        {factory.type === "production" && "生產廠"}
                        {factory.type === "parts" && "零件廠"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={factory.status === "active" ? "default" : "secondary"}>
                        {factory.status === "active" ? "啟用" : "停用"}
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
                          <DropdownMenuItem asChild>
                            <Link href={`/factories/${factory.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              查看詳情
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/factories/${factory.id}/edit`}>
                              <FileEdit className="mr-2 h-4 w-4" />
                              編輯供應商
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteFactory(factory.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            刪除供應商
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
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          顯示 {filteredFactories.length} 個供應商中的 1-{filteredFactories.length} 個
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  )
}
