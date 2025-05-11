"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, FileJson, RefreshCw } from "lucide-react"

// 模擬供應商資料
const supplierData = [
  {
    id: "S001",
    name: "深圳電子廠",
    contactPerson: "李明",
    email: "liming@szelec.com",
    phone: "+86 755 1234 5678",
    category: "電子元件",
    country: "中國",
    status: "active",
  },
  {
    id: "S002",
    name: "上海科技廠",
    contactPerson: "王偉",
    email: "wangwei@shtech.com",
    phone: "+86 21 8765 4321",
    category: "面板",
    country: "中國",
    status: "active",
  },
  {
    id: "S003",
    name: "東莞工業廠",
    contactPerson: "陳剛",
    email: "chengang@dgind.com",
    phone: "+86 769 8765 4321",
    category: "塑膠零件",
    country: "中國",
    status: "active",
  },
  {
    id: "S004",
    name: "廣州製造廠",
    contactPerson: "張強",
    email: "zhangqiang@gzmfg.com",
    phone: "+86 20 1234 5678",
    category: "金屬零件",
    country: "中國",
    status: "inactive",
  },
  {
    id: "S005",
    name: "台灣精密工業",
    contactPerson: "林志明",
    email: "lin@twprecision.com",
    phone: "+886 3 1234 5678",
    category: "精密零件",
    country: "台灣",
    status: "active",
  },
]

export function SupplierDataTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [suppliers] = useState(supplierData)

  // 根據搜索詞過濾供應商
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.country.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜尋供應商..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileJson className="h-4 w-4 mr-2" />
            查看原始資料
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            重新整理
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            新增供應商
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>供應商名稱</TableHead>
              <TableHead>聯絡人</TableHead>
              <TableHead>類別</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>電話</TableHead>
              <TableHead>國家</TableHead>
              <TableHead>狀態</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  沒有找到供應商
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.contactPerson}</TableCell>
                  <TableCell>{supplier.category}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell>{supplier.phone}</TableCell>
                  <TableCell>{supplier.country}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        supplier.status === "active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }
                    >
                      {supplier.status === "active" ? "活躍" : "非活躍"}
                    </Badge>
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
