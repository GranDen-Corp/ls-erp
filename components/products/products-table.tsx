"use client"

import { useState, useEffect } from "react"
import { Eye, FileText, Loader2, Search, MoreHorizontal, Pencil, Copy, Layers, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ProductImagePreview } from "@/components/products/product-image-preview"
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
import type { Product } from "@/types/product"

interface ProductsTableProps {
  products?: Product[]
  isLoading?: boolean
}

export function ProductsTable({ products = [], isLoading = false }: ProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [customerFilter, setCustomerFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState<string>("part_no")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [processedProducts, setProcessedProducts] = useState<Product[]>([])

  // 處理產品資料
  useEffect(() => {
    if (!products || products.length === 0) {
      setProcessedProducts([])
      return
    }

    // 處理資料，確保images欄位是正確的格式
    const processed = products.map((product) => {
      let images = []
      try {
        if (product.images) {
          if (typeof product.images === "string") {
            images = JSON.parse(product.images)
          } else {
            images = product.images
          }
        }
      } catch (e) {
        console.error("解析產品圖片時出錯:", e)
        images = []
      }

      return {
        ...product,
        images: images.length
          ? images
          : [
              {
                id: "default",
                url: "/diverse-products-still-life.png",
                alt: product.component_name || "產品圖片",
                isThumbnail: true,
              },
            ],
      }
    })

    setProcessedProducts(processed)
  }, [products])

  // 獲取唯一的產品類型和客戶ID
  const productTypes = Array.from(new Set(processedProducts.map((product) => product.product_type).filter(Boolean)))
  const customerIds = Array.from(new Set(processedProducts.map((product) => product.customer_id).filter(Boolean)))
  const statusOptions = ["active", "sample", "discontinued"]

  // 根據條件過濾產品
  const filteredProducts = processedProducts.filter((product) => {
    const match = true

    // 搜尋條件
    const matchesSearch =
      searchTerm === "" ||
      product.component_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.part_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.customer_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.factory_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false

    // 類型篩選
    const matchesType = typeFilter === "all" || product.product_type === typeFilter

    // 客戶篩選
    const matchesCustomer = customerFilter === "all" || product.customer_id === customerFilter

    // 狀態篩選
    const matchesStatus = statusFilter === "all" || product.status === statusFilter

    return match && matchesSearch && matchesType && matchesCustomer && matchesStatus
  })

  // 排序產品
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const fieldA = a[sortField as keyof Product]
    const fieldB = b[sortField as keyof Product]

    if (fieldA === undefined || fieldA === null) return sortDirection === "asc" ? -1 : 1
    if (fieldB === undefined || fieldB === null) return sortDirection === "asc" ? 1 : -1

    if (typeof fieldA === "string" && typeof fieldB === "string") {
      return sortDirection === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA)
    }

    return sortDirection === "asc" ? (fieldA < fieldB ? -1 : 1) : fieldA > fieldB ? -1 : 1
  })

  // 分頁
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage)

  // 處理排序
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // 狀態顏色映射
  const statusColorMap: Record<string, string> = {
    active: "bg-green-500",
    sample: "bg-blue-500",
    discontinued: "bg-gray-500",
  }

  // 狀態名稱映射
  const statusNameMap: Record<string, string> = {
    active: "活躍",
    sample: "樣品階段",
    discontinued: "已停產",
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p>載入產品資料中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜尋產品編號、名稱、客戶或工廠..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="產品類型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有類型</SelectItem>
              {productTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={customerFilter} onValueChange={setCustomerFilter}>
            <SelectTrigger>
              <SelectValue placeholder="客戶" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有客戶</SelectItem>
              {customerIds.map((id) => (
                <SelectItem key={id} value={id}>
                  {id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="狀態" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有狀態</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {statusNameMap[status] || status}
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
              <TableHead className="w-12"></TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("part_no")}>
                  Part No.
                  {sortField === "part_no" && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("component_name")}>
                  產品名稱
                  {sortField === "component_name" && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("customer_id")}>
                  客戶
                  {sortField === "customer_id" && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("factory_id")}>
                  工廠
                  {sortField === "factory_id" && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("product_type")}>
                  類別
                  {sortField === "product_type" && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("last_price")}>
                  最近價格
                  {sortField === "last_price" && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("last_order_date")}>
                  最近訂單
                  {sortField === "last_order_date" && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("status")}>
                  狀態
                  {sortField === "status" && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center">
                  沒有找到符合條件的產品
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => (
                <TableRow key={`${product.customer_id}-${product.part_no}-${product.factory_id}`}>
                  <TableCell>
                    <ProductImagePreview
                      images={
                        product.images || [
                          {
                            id: "default",
                            url: "/diverse-products-still-life.png",
                            alt: product.component_name || "產品圖片",
                            isThumbnail: true,
                          },
                        ]
                      }
                      thumbnailSize="small"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {product.part_no}
                    {product.is_assembly && (
                      <Badge className="ml-2 bg-purple-500 text-white">
                        <Layers className="h-3 w-3 mr-1" />
                        組裝
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{product.component_name}</TableCell>
                  <TableCell>{product.customer_id}</TableCell>
                  <TableCell>{product.factory_id}</TableCell>
                  <TableCell>{product.product_type || "-"}</TableCell>
                  <TableCell>{product.last_price ? `${product.last_price} ${product.currency || ""}` : "-"}</TableCell>
                  <TableCell>{product.last_order_date || "-"}</TableCell>
                  <TableCell>
                    {product.status ? (
                      <Badge className={`${statusColorMap[product.status] || "bg-gray-500"} text-white`}>
                        {statusNameMap[product.status] || product.status}
                      </Badge>
                    ) : (
                      "-"
                    )}
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
                          <Link
                            href={`/products/all/${encodeURIComponent(product.part_no)}`}
                            className="flex items-center"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            查看詳情
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link
                            href={`/products/all/${encodeURIComponent(product.part_no)}/edit`}
                            className="flex items-center"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            編輯產品
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Link
                            href={`/products/new?clone=${encodeURIComponent(product.part_no)}`}
                            className="flex items-center"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            複製產品
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link
                            href={`/products/all/${encodeURIComponent(product.part_no)}/inquiry`}
                            className="flex items-center"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            生成詢價單
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

      {processedProducts.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            顯示 {filteredProducts.length} 個產品中的 {startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, filteredProducts.length)} 個
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
