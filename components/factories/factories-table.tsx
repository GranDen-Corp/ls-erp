"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MoreHorizontal, ArrowUpDown, Loader2, FileEdit, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

type SortField = keyof Supplier | ""
type SortDirection = "asc" | "desc"

export function FactoriesTable() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>("factory_id")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
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

  // 處理排序
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // 排序供應商
  const sortedSuppliers = [...suppliers].sort((a, b) => {
    if (!sortField) return 0

    const fieldA = a[sortField as keyof Supplier]
    const fieldB = b[sortField as keyof Supplier]

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
      <div className="w-full flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p>載入供應商資料中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <p className="text-red-500">錯誤: {error}</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{renderSortButton("factory_id", "供應商ID")}</TableHead>
              <TableHead>{renderSortButton("factory_name", "供應商名稱")}</TableHead>
              <TableHead>{renderSortButton("supplier_type", "類型")}</TableHead>
              <TableHead>{renderSortButton("factory_phone", "電話")}</TableHead>
              <TableHead>{renderSortButton("iso9001_certified", "ISO認證")}</TableHead>
              <TableHead>{renderSortButton("iatf16949_certified", "IATF認證")}</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  沒有找到供應商資料
                </TableCell>
              </TableRow>
            ) : (
              sortedSuppliers.map((supplier) => (
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
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          顯示 {suppliers.length} 個供應商中的 1-{suppliers.length} 個
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
      </div>
    </div>
  )
}
