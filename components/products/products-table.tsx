"use client"

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
import { Copy, Eye, FileText, Layers, MoreHorizontal, Pencil, Loader2, Search } from "lucide-react"
import Link from "next/link"
import { ProductImagePreview } from "@/components/products/product-image-preview"
import { supabaseClient } from "@/lib/supabase-client"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// 產品資料類型
interface Product {
  customer_id: string
  part_no: string
  factory_id: string
  component_name: string
  specification?: string
  customs_code?: string
  end_customer?: string
  product_type?: string
  classification_code?: string
  vehicle_drawing_no?: string
  customer_drawing_no?: string
  product_period?: string
  description?: string
  status?: string
  created_date?: string
  last_order_date?: string
  last_price?: number
  currency?: string
  is_assembly?: boolean
  images?: {
    id: string
    url: string
    alt: string
    isThumbnail: boolean
  }[]
}

interface ProductsTableProps {
  category?: string
  status?: string
  customer?: string
}

export function ProductsTable({ category, status, customer }: ProductsTableProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [customerFilter, setCustomerFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 從Supabase獲取產品資料
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const { data, error } = await supabaseClient.from("products").select("*")

        if (error) {
          throw new Error(`獲取產品資料時出錯: ${error.message}`)
        }

        // 處理資料，確保images欄位是正確的格式
        const processedData = data?.map((product) => {
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

        setProducts(processedData || [])
      } catch (err) {
        console.error("獲取產品資料時出錯:", err)
        setError(err instanceof Error ? err.message : "獲取產品資料時出錯")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // 獲取唯一的產品類型和客戶ID
  const productTypes = Array.from(new Set(products.map((product) => product.product_type).filter(Boolean)))
  const customerIds = Array.from(new Set(products.map((product) => product.customer_id).filter(Boolean)))

  // 根據條件過濾產品
  const filteredProducts = products.filter((product) => {
    let match = true

    // 搜尋條件
    const matchesSearch =
      searchTerm === "" ||
      product.component_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.part_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.customer_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false

    // 類型篩選
    const matchesType = typeFilter === "all" || product.product_type === typeFilter

    // 客戶篩選
    const matchesCustomer = customerFilter === "all" || product.customer_id === customerFilter

    // 外部傳入的篩選條件
    if (category) match = match && product.product_type === category
    if (status) match = match && product.status === status
    if (customer) match = match && product.customer_id === customer

    return match && matchesSearch && matchesType && matchesCustomer
  })

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
      <Card className="w-full">
        <CardHeader>
          <CardTitle>產品列表</CardTitle>
          <CardDescription>載入中...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>載入產品資料中...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>產品列表</CardTitle>
          <CardDescription>發生錯誤</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <p className="text-red-500">錯誤: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜尋產品..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-[200px]">
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
        </div>
        <div className="w-[200px]">
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
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>產品編號</TableHead>
              <TableHead>產品名稱</TableHead>
              <TableHead>客戶</TableHead>
              <TableHead>工廠</TableHead>
              <TableHead>類別</TableHead>
              <TableHead>最近價格</TableHead>
              <TableHead>最近訂單</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center">
                  沒有找到符合條件的產品
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
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
                            href={`/products/${product.customer_id}/${product.part_no}/${product.factory_id}`}
                            className="flex items-center"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            查看詳情
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link
                            href={`/products/${product.customer_id}/${product.part_no}/${product.factory_id}/edit`}
                            className="flex items-center"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            編輯產品
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Link href={`/products/new?clone=${product.part_no}`} className="flex items-center">
                            <Copy className="mr-2 h-4 w-4" />
                            複製產品
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link
                            href={`/products/${product.customer_id}/${product.part_no}/${product.factory_id}/inquiry`}
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
    </div>
  )
}
