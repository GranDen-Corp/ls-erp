"use client"

import type React from "react"

import { useState } from "react"
import { Eye, MoreHorizontal, Pencil, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Factory {
  id: string | number
  factory_id: string
  factory_name: string
  factory_type?: string
  location?: string
  contact_person?: string
  factory_phone?: string
  status?: string
  created_at?: string
  updated_at?: string
  [key: string]: any
}

interface FactoriesTableProps {
  data: Factory[]
  isLoading?: boolean
  visibleColumns?: string[]
  columnOrder?: string[]
}

export function FactoriesTable({
  data = [],
  isLoading = false,
  visibleColumns = [],
  columnOrder = [],
}: FactoriesTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // 定義欄位渲染函數
  const columnRenderers: Record<string, (factory: Factory) => React.ReactNode> = {
    factory_id: (factory) => (
      <Link
        href={`/factories/all/${factory.factory_id}`}
        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
      >
        {factory.factory_id}
      </Link>
    ),
    factory_name: (factory) => factory.factory_name,
    factory_type: (factory) => {
      const typeMap: Record<string, string> = {
        assembly: "組裝廠",
        production: "生產廠",
        parts: "零件廠",
        material: "材料供應商",
        service: "服務供應商",
      }
      return typeMap[factory.factory_type || ""] || factory.factory_type || "-"
    },
    location: (factory) => factory.location || "-",
    contact_person: (factory) => factory.contact_person || "-",
    factory_phone: (factory) => factory.factory_phone || "-",
    status: (factory) => {
      const statusColorMap: Record<string, string> = {
        active: "bg-green-500",
        inactive: "bg-gray-500",
        pending: "bg-yellow-500",
      }
      return (
        <Badge className={`${statusColorMap[factory.status || ""] || "bg-gray-500"} text-white`}>
          {factory.status === "active" ? "活躍" : factory.status === "inactive" ? "停用" : factory.status || "未知"}
        </Badge>
      )
    },
    created_at: (factory) => {
      if (!factory.created_at) return "-"
      try {
        const date = new Date(factory.created_at)
        return date.toLocaleString("zh-TW")
      } catch (e) {
        return factory.created_at
      }
    },
    updated_at: (factory) => {
      if (!factory.updated_at) return "-"
      try {
        const date = new Date(factory.updated_at)
        return date.toLocaleString("zh-TW")
      } catch (e) {
        return factory.updated_at
      }
    },
    factory_full_name: (factory) => factory.factory_full_name || "-",
    city: (factory) => factory.city || "-",
    factory_address: (factory) => factory.factory_address || "-",
    factory_fax: (factory) => factory.factory_fax || "-",
    tax_id: (factory) => factory.tax_id || "-",
    contact_email: (factory) => factory.contact_email || "-",
    website: (factory) => factory.website || "-",
    quality_contact1: (factory) => factory.quality_contact1 || "-",
    quality_contact2: (factory) => factory.quality_contact2 || "-",
    invoice_address: (factory) => factory.invoice_address || "-",
    category1: (factory) => factory.category1 || "-",
    category2: (factory) => factory.category2 || "-",
    category3: (factory) => factory.category3 || "-",
    iso9001_certified: (factory) => factory.iso9001_certified || "-",
    iatf16949_certified: (factory) => factory.iatf16949_certified || "-",
    iso17025_certified: (factory) => factory.iso17025_certified || "-",
    cqi9_certified: (factory) => factory.cqi9_certified || "-",
    cqi11_certified: (factory) => factory.cqi11_certified || "-",
    cqi12_certified: (factory) => factory.cqi12_certified || "-",
    iso9001_expiry: (factory) => factory.iso9001_expiry || "-",
    iatf16949_expiry: (factory) => factory.iatf16949_expiry || "-",
    iso17025_expiry: (factory) => factory.iso17025_expiry || "-",
    cqi9_expiry: (factory) => factory.cqi9_expiry || "-",
    cqi11_expiry: (factory) => factory.cqi11_expiry || "-",
    cqi12_expiry: (factory) => factory.cqi12_expiry || "-",
    notes: (factory) => factory.notes || "-",
  }

  // 欄位標籤映射
  const columnLabels: Record<string, string> = {
    factory_id: "供應商編號",
    factory_name: "供應商名稱",
    factory_type: "供應商類型",
    location: "國家/地區",
    contact_person: "聯絡人",
    factory_phone: "連絡電話",
    status: "狀態",
    created_at: "建立時間",
    updated_at: "更新時間",
    factory_full_name: "供應商全名",
    city: "城市",
    factory_address: "供應商地址",
    factory_fax: "傳真",
    tax_id: "統一編號",
    contact_email: "聯絡人Email",
    website: "網站",
    quality_contact1: "負責品管",
    quality_contact2: "負責品管2",
    invoice_address: "發票地址",
    category1: "產品類別1",
    category2: "產品類別2",
    category3: "產品類別3",
    iso9001_certified: "ISO 9001認證",
    iatf16949_certified: "IATF 16949認證",
    iso17025_certified: "ISO 17025認證",
    cqi9_certified: "CQI-9認證",
    cqi11_certified: "CQI-11認證",
    cqi12_certified: "CQI-12認證",
    iso9001_expiry: "ISO 9001到期日",
    iatf16949_expiry: "IATF 16949到期日",
    iso17025_expiry: "ISO 17025到期日",
    cqi9_expiry: "CQI-9到期日",
    cqi11_expiry: "CQI-11到期日",
    cqi12_expiry: "CQI-12到期日",
    notes: "備註",
  }

  // 根據 columnOrder 和 visibleColumns 決定要顯示的欄位及其順序
  const displayColumns = columnOrder
    .filter((columnId) => visibleColumns.includes(columnId))
    .filter((columnId) => columnRenderers[columnId] && columnLabels[columnId])

  // 分頁
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p>載入供應商資料中...</p>
        </div>
      </div>
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
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={displayColumns.length + 1} className="text-center py-8">
                  沒有找到符合條件的供應商
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((factory, index) => (
                <TableRow key={factory.id || index}>
                  {displayColumns.map((columnId) => (
                    <TableCell key={columnId}>{columnRenderers[columnId](factory)}</TableCell>
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
                          <Link href={`/factories/all/${factory.factory_id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            查看詳情
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Link href={`/factories/all/${factory.factory_id}/edit`} className="flex items-center">
                            <Pencil className="mr-2 h-4 w-4" />
                            編輯供應商
                          </Link>
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

      {data.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            顯示 {data.length} 個供應商中的 {startIndex + 1}-{Math.min(startIndex + itemsPerPage, data.length)} 個
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1) setCurrentPage(currentPage - 1)
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + 1
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === pageNumber}
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(pageNumber)
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              {totalPages > 5 && (
                <>
                  <PaginationItem>
                    <PaginationLink href="#" onClick={(e) => e.preventDefault()}>
                      ...
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(totalPages)
                      }}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number.parseInt(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="每頁顯示" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">每頁 10 筆</SelectItem>
              <SelectItem value="20">每頁 20 筆</SelectItem>
              <SelectItem value="50">每頁 50 筆</SelectItem>
              <SelectItem value="100">每頁 100 筆</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
