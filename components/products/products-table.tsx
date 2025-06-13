"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  FileText,
  Loader2,
  MoreHorizontal,
  Pencil,
  Copy,
  Layers,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react"
import Link from "next/link"
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
import type { Product } from "@/types/product"
import { supabase } from "@/lib/supabase"

interface ProductsTableProps {
  products?: Product[]
  isLoading?: boolean
  onEdit?: (product: Product) => void
  onView?: (product: Product) => void
  visibleColumns?: string[]
  columnOrder?: string[]
}

export function ProductsTable({
  products = [],
  isLoading = false,
  onEdit,
  onView,
  visibleColumns = [],
  columnOrder = [],
}: ProductsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [processedProducts, setProcessedProducts] = useState<Product[]>([])
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // 產品類別映射
  const [productTypeMap, setProductTypeMap] = useState<Record<string, string>>({})

  const handleCloneProduct = (product: Product) => {
    localStorage.setItem("clonedProduct", JSON.stringify(product))
    return "/products/new?clone=true"
  }

  const sortData = (data: Product[], column: string | null, direction: "asc" | "desc") => {
    if (!column) return data

    return [...data].sort((a, b) => {
      let valueA = a[column as keyof Product]
      let valueB = b[column as keyof Product]

      // Handle special cases
      if (column === "last_price") {
        valueA = Number(a.last_price || 0)
        valueB = Number(b.last_price || 0)
      }

      // Handle string comparisons
      if (typeof valueA === "string" && typeof valueB === "string") {
        return direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
      }

      // Handle numeric and other comparisons
      if (valueA < valueB) return direction === "asc" ? -1 : 1
      if (valueA > valueB) return direction === "asc" ? 1 : -1
      return 0
    })
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // 定義所有可能的欄位渲染函數
  const columnRenderers: Record<string, (product: Product) => React.ReactNode> = {
    part_no: (product) => (
      <div className="flex items-center gap-2">
        <Link
          href={`/products/all/${encodeURIComponent(product.customer_id)}/${encodeURIComponent(product.part_no)}`}
          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
        >
          {product.part_no}
        </Link>
        {product.product_type === "組合件" && (
          <Badge className="bg-purple-500 text-white">
            <Layers className="h-3 w-3 mr-1" />
            組合
          </Badge>
        )}
      </div>
    ),
    component_name: (product) => {
      const assemblyParts = parseAssemblyParts(product)
      return (
        <div>
          {product.component_name}
          {product.product_type === "組合件" && assemblyParts.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {assemblyParts
                .filter((part) => part.partNo)
                .map((part, index) => (
                  <span key={`part-${index}-${part.partNo}`}>
                    {index > 0 && "; "}
                    {part.partNo}
                    {part.componentName ? ` (${part.componentName})` : ""}
                  </span>
                ))}
            </div>
          )}
        </div>
      )
    },
    customer_id: (product) => product.customer_id,
    factory_id: (product) => product.factory_id,
    product_type: (product) => productTypeMap[product.product_type] || product.product_type || "-",
    last_price: (product) => (product.last_price ? `${product.last_price} ${product.currency || ""}` : "-"),
    last_order_date: (product) => product.last_order_date || "-",
    status: (product) => {
      const statusColorMap: Record<string, string> = {
        active: "bg-green-500",
        sample: "bg-blue-500",
        discontinued: "bg-gray-500",
      }
      const statusNameMap: Record<string, string> = {
        active: "活躍",
        sample: "樣品階段",
        discontinued: "已停產",
      }
      return product.status ? (
        <Badge className={`${statusColorMap[product.status] || "bg-gray-500"} text-white`}>
          {statusNameMap[product.status] || product.status}
        </Badge>
      ) : (
        "-"
      )
    },
    drawing_no: (product) => product.drawing_no || "-",
    specification: (product) => product.specification || "-",
    material: (product) => product.material || "-",
    surface_treatment: (product) => product.surface_treatment || "-",
    hardness: (product) => product.hardness || "-",
    unit: (product) => product.unit || "-",
    weight: (product) => product.weight || "-",
    currency: (product) => product.currency || "-",
    moq: (product) => product.moq || "-",
    lead_time: (product) => product.lead_time || "-",
    packaging: (product) => product.packaging || "-",
    is_assembly: (product) => (product.product_type === "組合件" ? "是" : "否"),
    created_at: (product) => product.created_at || "-",
    updated_at: (product) => product.updated_at || "-",
    notes: (product) => product.notes || "-",
  }

  // 欄位標籤映射
  const columnLabels: Record<string, string> = {
    part_no: "Part No.",
    component_name: "產品名稱",
    customer_id: "客戶",
    factory_id: "工廠",
    product_type: "產品類別",
    last_price: "最近價格",
    last_order_date: "最近訂單",
    status: "狀態",
    drawing_no: "圖號",
    specification: "規格",
    material: "材質",
    surface_treatment: "表面處理",
    hardness: "硬度",
    unit: "單位",
    weight: "重量",
    currency: "幣別",
    moq: "最小訂購量",
    lead_time: "交期",
    packaging: "包裝",
    is_assembly: "是否組合產品",
    created_at: "建立時間",
    updated_at: "更新時間",
    notes: "備註",
  }

  // 根據 columnOrder 和 visibleColumns 決定要顯示的欄位及其順序
  const displayColumns = columnOrder
    .filter((columnId) => visibleColumns.includes(columnId))
    .filter((columnId) => columnRenderers[columnId] && columnLabels[columnId])

  // 獲取產品類別數據
  useEffect(() => {
    async function fetchProductTypes() {
      try {
        const { data, error } = await supabase.from("product_types").select("type_code, type_name")

        if (error) throw error

        const typeMap: Record<string, string> = {}
        data?.forEach((type) => {
          typeMap[type.type_code] = type.type_name
        })

        setProductTypeMap(typeMap)
      } catch (error) {
        console.error("獲取產品類別失敗:", error)
      }
    }

    fetchProductTypes()
  }, [])

  // 處理產品資料
  useEffect(() => {
    if (!products || products.length === 0) {
      setProcessedProducts([])
      return
    }

    let processed = products.map((product) => {
      let images = []
      try {
        if (product.images) {
          if (typeof product.images === "string") {
            try {
              images = JSON.parse(product.images)
            } catch (e) {
              console.error("解析產品圖片字符串時出錯:", e)
              images = []
            }
          } else if (Array.isArray(product.images)) {
            images = product.images
          }
        }
      } catch (e) {
        console.error("處理產品圖片時出錯:", e)
        images = []
      }

      // 確保每個圖片對象都有必要的屬性
      const validImages = images
        .filter((img) => img && typeof img === "object")
        .map((img, index) => ({
          id: img.id || `img-${index}`,
          url: img.url || "/diverse-products-still-life.png",
          alt: img.alt || product.component_name || "產品圖片",
          isThumbnail: img.isThumbnail || false,
        }))

      return {
        ...product,
        images:
          validImages.length > 0
            ? validImages
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

    // Apply sorting if needed
    if (sortColumn) {
      processed = sortData(processed, sortColumn, sortDirection)
    }

    setProcessedProducts(processed)
  }, [products, sortColumn, sortDirection])

  // Add a function to handle delete action
  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`確定要刪除產品 ${product.part_no} 嗎？`)) {
      return
    }

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("part_no", product.part_no)
        .eq("customer_id", product.customer_id)

      if (error) {
        throw error
      }

      // Refresh the product list
      window.location.reload()
    } catch (error) {
      console.error("刪除產品時出錯:", error)
      alert("刪除產品失敗，請稍後再試")
    }
  }

  // 解析組合件的零件編號和名稱
  const parseAssemblyParts = (product: Product) => {
    if (product.product_type !== "組合件" || !product.sub_part_no) return []

    let components: Array<{ part_no?: string; description?: string }> = []

    try {
      // 處理不同格式的 sub_part_no
      if (Array.isArray(product.sub_part_no)) {
        // 如果是數組，直接使用
        components = product.sub_part_no
      } else if (typeof product.sub_part_no === "string") {
        // 如果是字符串，嘗試解析為 JSON
        try {
          const parsed = JSON.parse(product.sub_part_no)
          if (Array.isArray(parsed)) {
            components = parsed
          }
        } catch (e) {
          console.error("解析 sub_part_no 字符串時出錯:", e)
        }
      } else if (product.sub_part_no && typeof product.sub_part_no === "object") {
        // 如果是單個對象，放入數組
        components = [product.sub_part_no]
      }
    } catch (e) {
      console.error("解析組合部件時出錯:", e, product.sub_part_no)
      return []
    }

    // 查找每個部件的產品名稱
    return components.map((component) => {
      const partNo = component.part_no || ""
      const componentProduct = products.find((p) => p.part_no === partNo)
      return {
        partNo,
        componentName: componentProduct?.component_name || "",
        description: component.description || "",
      }
    })
  }

  // 分頁計算
  const totalPages = Math.ceil(products.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, products.length)
  const paginatedProducts = products.slice(startIndex, endIndex)

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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              {displayColumns.map((columnId) => (
                <TableHead
                  key={columnId}
                  onClick={() => handleSort(columnId)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <div className="flex items-center gap-1">
                    {columnLabels[columnId]}
                    {sortColumn === columnId &&
                      (sortDirection === "asc" ? (
                        <ChevronLeft className="h-4 w-4 rotate-90" />
                      ) : (
                        <ChevronLeft className="h-4 w-4 -rotate-90" />
                      ))}
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={displayColumns.length + 2} className="text-center">
                  沒有找到符合條件的產品
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product, index) => (
                <TableRow
                  key={`${product.customer_id}-${product.part_no}`}
                  className={index % 2 === 1 ? "bg-muted/50" : ""}
                >
                  <TableCell>
                    <ProductImagePreview
                      images={
                        product.images && Array.isArray(product.images) && product.images.length > 0
                          ? product.images
                          : [
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
                  {displayColumns.map((columnId) => (
                    <TableCell key={columnId}>{columnRenderers[columnId](product)}</TableCell>
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
                          <Link
                            href={`/products/all/${encodeURIComponent(product.customer_id)}/${encodeURIComponent(product.part_no)}/edit`}
                            className="flex items-center"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            編輯產品
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              const url = handleCloneProduct(product)
                              window.location.href = url
                            }}
                            className="flex items-center"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            複製產品
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link
                            href={
                              product.product_type === "組合件"
                                ? `/products/all/${encodeURIComponent(product.customer_id)}/${encodeURIComponent(product.part_no)}/assembly-inquiry`
                                : `/products/all/${encodeURIComponent(product.customer_id)}/${encodeURIComponent(product.part_no)}/inquiry`
                            }
                            className="flex items-center"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            生成詢價單
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onSelect={() => handleDeleteProduct(product)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          刪除產品
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

      {products.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            顯示 {startIndex + 1} 到 {endIndex} 筆，共 {products.length} 筆資料
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">每頁顯示</p>
              <Select
                value={`${itemsPerPage}`}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={itemsPerPage} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm font-medium">筆</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 lg:px-3"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">上一頁</span>
              </Button>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                第 {currentPage} 頁，共 {totalPages} 頁
              </div>
              <Button
                variant="outline"
                className="h-8 px-2 lg:px-3"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">下一頁</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
