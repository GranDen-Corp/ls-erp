"use client"

import type React from "react"

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
import { Eye, FileText, MoreHorizontal, Pencil } from "lucide-react"
import Link from "next/link"
import { ProductImagePreview } from "@/components/products/product-image-preview"
import { supabaseClient } from "@/lib/supabase-client"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// 狀態顏色映射
const statusColorMap: Record<string, string> = {
  待確認: "bg-yellow-500",
  進行中: "bg-blue-500",
  已完成: "bg-green-500",
}

interface ProductImage {
  id: string
  url: string
  alt: string
  isThumbnail: boolean
}

interface Purchase {
  id: string
  po_number: string
  factory_id: string
  factory_name: string
  order_id: string
  order_number: string
  amount: number
  status: string
  po_date: string
  products: string
  currency: string
  product_images?: ProductImage[]
}

// 模擬採購單數據 - 與Locksure公司相關的採購單
const mockPurchasesData = [
  {
    id: "PO-2023-0012",
    po_number: "PO-2023-0012",
    factory_id: "1",
    factory_name: "深圳電子廠",
    order_id: "1",
    order_number: "ORD-2023-0012",
    amount: 22680,
    status: "待確認",
    po_date: "2023-04-15",
    products: "特殊冷成型零件 x 500",
    currency: "USD",
    product_images: [
      {
        id: "1",
        url: "/diverse-products-still-life.png",
        alt: "特殊冷成型零件",
        isThumbnail: true,
      },
    ],
  },
  {
    id: "PO-2023-0011",
    po_number: "PO-2023-0011",
    factory_id: "2",
    factory_name: "上海科技廠",
    order_id: "2",
    order_number: "ORD-2023-0011",
    amount: 11160,
    status: "進行中",
    po_date: "2023-04-14",
    products: "汽車緊固件 x 2000",
    currency: "USD",
    product_images: [
      {
        id: "1",
        url: "/diverse-products-still-life.png",
        alt: "汽車緊固件",
        isThumbnail: true,
      },
    ],
  },
  {
    id: "PO-2023-0010",
    po_number: "PO-2023-0010",
    factory_id: "3",
    factory_name: "東莞工業廠",
    order_id: "3",
    order_number: "ORD-2023-0010",
    amount: 7875,
    status: "進行中",
    po_date: "2023-04-12",
    products: "特殊沖壓零件 x 5000",
    currency: "USD",
    product_images: [
      {
        id: "1",
        url: "/diverse-products-still-life.png",
        alt: "特殊沖壓零件",
        isThumbnail: true,
      },
    ],
  },
  {
    id: "PO-2023-0009",
    po_number: "PO-2023-0009",
    factory_id: "4",
    factory_name: "廣州製造廠",
    order_id: "4",
    order_number: "ORD-2023-0009",
    amount: 16470,
    status: "已完成",
    po_date: "2023-04-10",
    products: "組裝零件 x 300",
    currency: "USD",
    product_images: [
      {
        id: "1",
        url: "/diverse-products-still-life.png",
        alt: "組裝零件",
        isThumbnail: true,
      },
    ],
  },
  {
    id: "PO-2023-0008",
    po_number: "PO-2023-0008",
    factory_id: "5",
    factory_name: "蘇州電子廠",
    order_id: "5",
    order_number: "ORD-2023-0008",
    amount: 8280,
    status: "已完成",
    po_date: "2023-04-08",
    products: "汽車零件 x 150",
    currency: "USD",
    product_images: [
      {
        id: "1",
        url: "/diverse-products-still-life.png",
        alt: "汽車零件",
        isThumbnail: true,
      },
    ],
  },
]

interface PurchasesTableProps {
  status?: string
}

export function PurchasesTable({ status }: PurchasesTableProps) {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState(status || "")
  const [usingMockData, setUsingMockData] = useState(false)

  useEffect(() => {
    async function fetchPurchases() {
      try {
        setLoading(true)
        setError(null)

        // 嘗試從Supabase獲取採購單資料
        try {
          // 這個查詢會在表不存在時拋出錯誤
          const { data, error } = await supabaseClient.from("purchases").select("id").limit(1)

          // 如果有錯誤，表示表不存在，使用模擬資料
          if (error) {
            console.log("Using mock data due to table not existing:", error.message)
            setUsingMockData(true)
            setPurchases(mockPurchasesData)
            return
          }

          // 如果沒有錯誤，繼續獲取實際資料
          const { data: purchasesData, error: purchasesError } = await supabaseClient
            .from("purchases")
            .select("*")
            .order("po_date", { ascending: false })

          if (purchasesError) throw purchasesError

          // 格式化採購單資料
          const formattedPurchases = purchasesData.map((purchase) => ({
            id: purchase.id,
            po_number: purchase.po_number,
            factory_id: purchase.factory_id,
            factory_name: purchase.factory_name || "Unknown Factory",
            order_id: purchase.order_id,
            order_number: purchase.order_number || "N/A",
            amount: purchase.amount,
            status: purchase.status,
            po_date: purchase.po_date,
            products: purchase.products,
            currency: purchase.currency || "USD",
            product_images: purchase.product_images,
          }))

          setPurchases(formattedPurchases)
        } catch (err) {
          console.error("Error in Supabase query:", err)
          setUsingMockData(true)
          setPurchases(mockPurchasesData)
        }
      } catch (err) {
        console.error("Error in fetchPurchases:", err)
        setError("載入採購單資料時發生錯誤。")
        setUsingMockData(true)
        setPurchases(mockPurchasesData)
      } finally {
        setLoading(false)
      }
    }

    fetchPurchases()
  }, [statusFilter])

  // 當props中的status變更時，更新狀態過濾器
  useEffect(() => {
    setStatusFilter(status || "")
  }, [status])

  // 過濾採購單
  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.factory_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (purchase.order_number && purchase.order_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      purchase.products.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !statusFilter || statusFilter === "all" || purchase.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // 處理搜尋輸入變更
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // 處理狀態過濾變更
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
  }

  // 格式化金額顯示
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("zh-TW", { style: "currency", currency }).format(amount)
  }

  // 獲取產品圖片
  const getProductImages = (purchase: Purchase): ProductImage[] => {
    if (purchase.product_images && Array.isArray(purchase.product_images) && purchase.product_images.length > 0) {
      return purchase.product_images
    }

    // 如果沒有圖片，返回預設圖片
    return [
      {
        id: "default",
        url: "/diverse-products-still-life.png",
        alt: "產品預設圖片",
        isThumbnail: true,
      },
    ]
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>錯誤</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {usingMockData && (
        <Alert className="mb-4">
          <AlertTitle>注意</AlertTitle>
          <AlertDescription>採購單資料表不存在，目前顯示的是模擬資料。請聯繫系統管理員創建資料表。</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Input
          placeholder="搜尋採購單編號、工廠、訂單編號或產品..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
        {!status && (
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="所有狀態" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有狀態</SelectItem>
              <SelectItem value="待確認">待確認</SelectItem>
              <SelectItem value="進行中">進行中</SelectItem>
              <SelectItem value="已完成">已完成</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>採購單編號</TableHead>
              <TableHead>供應商</TableHead>
              <TableHead>關聯訂單</TableHead>
              <TableHead>產品</TableHead>
              <TableHead>金額</TableHead>
              <TableHead>日期</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // 載入中顯示骨架屏
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredPurchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  {searchTerm ? "沒有符合搜尋條件的採購單" : "沒有採購單資料"}
                </TableCell>
              </TableRow>
            ) : (
              filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>
                    <ProductImagePreview images={getProductImages(purchase)} thumbnailSize="small" />
                  </TableCell>
                  <TableCell className="font-medium">{purchase.po_number}</TableCell>
                  <TableCell>{purchase.factory_name}</TableCell>
                  <TableCell>{purchase.order_number}</TableCell>
                  <TableCell>{purchase.products}</TableCell>
                  <TableCell>{formatAmount(purchase.amount, purchase.currency)}</TableCell>
                  <TableCell>{new Date(purchase.po_date).toLocaleDateString("zh-TW")}</TableCell>
                  <TableCell>
                    <Badge className={`${statusColorMap[purchase.status] || "bg-gray-500"} text-white`}>
                      {purchase.status}
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
                        <DropdownMenuItem>
                          <Link href={`/purchases/${purchase.id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            查看詳情
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/purchases/${purchase.id}/edit`} className="flex items-center">
                            <Pencil className="mr-2 h-4 w-4" />
                            編輯採購單
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Link href={`/purchases/${purchase.id}/document`} className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            查看採購單文件
                          </Link>
                        </DropdownMenuItem>
                        {purchase.order_id && (
                          <DropdownMenuItem>
                            <Link href={`/orders/${purchase.order_id}`} className="flex items-center">
                              <FileText className="mr-2 h-4 w-4" />
                              查看關聯訂單
                            </Link>
                          </DropdownMenuItem>
                        )}
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
