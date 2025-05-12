"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MoreHorizontal, ArrowUpDown, Search, FileEdit, Trash2, Eye, Loader2 } from "lucide-react"
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
import { supabaseClient } from "@/lib/supabase-client"

// 供應商資料類型
interface Supplier {
  factory_id: string
  factory_name: string
  factory_full_name: string
  supplier_type: string
  factory_address?: string
  factory_phone?: string
  factory_fax?: string
  tax_id?: string
  category1?: string
  category2?: string
  category3?: string
  iso9001_certified?: string
  iatf16949_certified?: string
  iso17025_certified?: string
  cqi9_certified?: string
  cqi11_certified?: string
  cqi12_certified?: string
  status?: string
}

export function FactoriesTable() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // 從Supabase獲取供應商資料
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const { data, error } = await supabaseClient.from("suppliers").select("*")

        if (error) {
          throw new Error(`獲取供應商資料時出錯: ${error.message}`)
        }

        setSuppliers(data || [])
      } catch (err) {
        console.error("獲取供應商資料時出錯:", err)
        setError(err instanceof Error ? err.message : "獲取供應商資料時出錯")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuppliers()
  }, [])

  // 過濾供應商數據
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.factory_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.factory_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.factory_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false

    const matchesStatus = statusFilter === "all" || supplier.status === statusFilter

    const matchesType = typeFilter === "all" || supplier.supplier_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // 處理刪除供應商
  const handleDeleteSupplier = async (supplierId: string) => {
    try {
      const { error } = await supabaseClient.from("suppliers").delete().eq("factory_id", supplierId)

      if (error) {
        throw new Error(`刪除供應商時出錯: ${error.message}`)
      }

      // 更新本地狀態
      setSuppliers(suppliers.filter((supplier) => supplier.factory_id !== supplierId))

      toast({
        title: "供應商已刪除",
        description: `供應商ID: ${supplierId} 已成功刪除`,
      })
    } catch (err) {
      console.error("刪除供應商時出錯:", err)
      toast({
        title: "刪除失敗",
        description: err instanceof Error ? err.message : "刪除供應商時出錯",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>供應商列表</CardTitle>
          <CardDescription>載入中...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>載入供應商資料中...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>供應商列表</CardTitle>
          <CardDescription>發生錯誤</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <p className="text-red-500">錯誤: {error}</p>
        </CardContent>
      </Card>
    )
  }

  // 獲取唯一的供應商類型
  const supplierTypes = Array.from(new Set(suppliers.map((supplier) => supplier.supplier_type).filter(Boolean)))

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
                {supplierTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
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
                <TableHead className="w-[100px]">供應商ID</TableHead>
                <TableHead>
                  <div className="flex items-center">
                    供應商名稱
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>類型</TableHead>
                <TableHead>電話</TableHead>
                <TableHead>ISO認證</TableHead>
                <TableHead>IATF認證</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    沒有找到符合條件的供應商
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.factory_id}>
                    <TableCell className="font-medium">{supplier.factory_id}</TableCell>
                    <TableCell>
                      <div>{supplier.factory_name}</div>
                      <div className="text-sm text-muted-foreground">{supplier.factory_full_name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{supplier.supplier_type || "-"}</Badge>
                    </TableCell>
                    <TableCell>{supplier.factory_phone || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={supplier.iso9001_certified === "是" ? "default" : "secondary"}>
                        {supplier.iso9001_certified === "是" ? "已認證" : "未認證"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          supplier.iatf16949_certified === "是"
                            ? "default"
                            : supplier.iatf16949_certified === "審核中"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {supplier.iatf16949_certified === "是"
                          ? "已認證"
                          : supplier.iatf16949_certified === "審核中"
                            ? "審核中"
                            : "未認證"}
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
                            <Link href={`/factories/all/${supplier.factory_id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              查看詳情
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/factories/all/${supplier.factory_id}/edit`}>
                              <FileEdit className="mr-2 h-4 w-4" />
                              編輯供應商
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteSupplier(supplier.factory_id)}
                          >
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
          顯示 {filteredSuppliers.length} 個供應商中的 1-{filteredSuppliers.length} 個
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
