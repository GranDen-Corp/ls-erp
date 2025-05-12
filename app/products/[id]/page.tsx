"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Copy, FileText, Pencil } from "lucide-react"
import Link from "next/link"
import { ProductImagePreview } from "@/components/products/product-image-preview"
import { ProductSpecifications } from "@/components/products/product-specifications"
import { ProductOrderHistory } from "@/components/products/product-order-history"
import { ProductPriceHistoryChart } from "@/components/products/product-price-history-chart"
import { ProductComplaintHistory } from "@/components/products/product-complaint-history"
import { ProductAssemblyDetails } from "@/components/products/product-assembly-details"
import { Badge } from "@/components/ui/badge"
import { supabaseClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = params
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        // 特殊路徑處理
        const specialPaths: Record<string, string> = {
          assembly: "/products/assembly",
          new: "/products/new",
        }

        // 檢查是否為特殊路徑
        if (id in specialPaths) {
          router.push(specialPaths[id])
          return
        }

        // 正常查詢產品資料
        const { data, error } = await supabaseClient.from("products").select("*").eq("part_no", id).maybeSingle()

        if (error) {
          throw new Error(`獲取產品資料時出錯: ${error.message}`)
        }

        if (!data) {
          throw new Error(`找不到產品資料: ${id}`)
        }

        // 處理圖片資料
        let images = []
        try {
          if (data.images) {
            if (typeof data.images === "string") {
              images = JSON.parse(data.images)
            } else {
              images = data.images
            }
          }
        } catch (e) {
          console.error("解析產品圖片時出錯:", e)
          images = []
        }

        setProduct({
          ...data,
          images: images.length
            ? images
            : [
                {
                  id: "default",
                  url: "/diverse-products-still-life.png",
                  alt: data.component_name || "產品圖片",
                  isThumbnail: true,
                },
              ],
        })
      } catch (err) {
        console.error("獲取產品資料時出錯:", err)
        setError(err instanceof Error ? err.message : "獲取產品資料時出錯")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id, router])

  // 如果是特殊路徑，顯示載入中，等待重定向
  if (id === "assembly" || id === "new") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Link href="/products">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">重定向中...</h1>
        </div>
        <Card>
          <CardContent className="flex justify-center items-center h-64">
            <p>請稍候...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Link href="/products">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">產品詳情</h1>
        </div>
        <Card>
          <CardContent className="flex justify-center items-center h-64">
            <p>載入中...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Link href="/products">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">產品詳情</h1>
        </div>
        <Card>
          <CardContent className="flex justify-center items-center h-64">
            <p className="text-red-500">{error || "找不到產品資料"}</p>
          </CardContent>
        </Card>
      </div>
    )
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/products">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{product.component_name}</h1>
          {product.status && (
            <Badge className={`${statusColorMap[product.status] || "bg-gray-500"} text-white`}>
              {statusNameMap[product.status] || product.status}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/products/${encodeURIComponent(product.part_no)}/edit`}>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              編輯產品
            </Button>
          </Link>
          <Link href={`/products/new?clone=${encodeURIComponent(product.part_no)}`}>
            <Button variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              複製產品
            </Button>
          </Link>
          <Link href={`/products/${encodeURIComponent(product.part_no)}/inquiry`}>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              生成詢價單
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>產品圖片</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductImagePreview images={product.images} thumbnailSize="large" />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>基本資訊</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Part No.</p>
                <p>{product.part_no}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">產品名稱</p>
                <p>{product.component_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">客戶代碼</p>
                <p>{product.customer_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">工廠代碼</p>
                <p>{product.factory_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">產品類別</p>
                <p>{product.product_type || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">海關編碼</p>
                <p>{product.customs_code || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">最終客戶</p>
                <p>{product.end_customer || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">分類代碼</p>
                <p>{product.classification_code || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">車輛圖號</p>
                <p>{product.vehicle_drawing_no || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">客戶圖號</p>
                <p>{product.customer_drawing_no || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">產品週期</p>
                <p>{product.product_period || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">最近價格</p>
                <p>{product.last_price ? `${product.last_price} ${product.currency || ""}` : "-"}</p>
              </div>
            </div>
            {product.description && (
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">產品描述</p>
                <p>{product.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="specifications">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="specifications">產品規格</TabsTrigger>
          <TabsTrigger value="orders">訂單歷史</TabsTrigger>
          <TabsTrigger value="prices">價格歷史</TabsTrigger>
          <TabsTrigger value="complaints">投訴記錄</TabsTrigger>
          {product.is_assembly && <TabsTrigger value="assembly">組裝詳情</TabsTrigger>}
        </TabsList>
        <TabsContent value="specifications">
          <Card>
            <CardHeader>
              <CardTitle>產品規格</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductSpecifications productId={product.part_no} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>訂單歷史</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductOrderHistory productId={product.part_no} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="prices">
          <Card>
            <CardHeader>
              <CardTitle>價格歷史</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductPriceHistoryChart productId={product.part_no} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="complaints">
          <Card>
            <CardHeader>
              <CardTitle>投訴記錄</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductComplaintHistory productId={product.part_no} />
            </CardContent>
          </Card>
        </TabsContent>
        {product.is_assembly && (
          <TabsContent value="assembly">
            <Card>
              <CardHeader>
                <CardTitle>組裝詳情</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductAssemblyDetails productId={product.part_no} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
