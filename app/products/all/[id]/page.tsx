import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"
import { ProductSpecifications } from "@/components/products/product-specifications"
import { ProductOrderHistory } from "@/components/products/product-order-history"
import { ProductComplaintHistory } from "@/components/products/product-complaint-history"
import { ProductImagePreview } from "@/components/products/product-image-preview"
import { ProductPriceHistoryChart } from "@/components/products/product-price-history-chart"
import { ProductComponentsInfo } from "@/components/products/product-components-info"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function ProductDetailPage({
  params,
  searchParams,
}: { params: { id: string }; searchParams: { tab?: string } }) {
  const productId = decodeURIComponent(params.id)
  const defaultTab = searchParams.tab || "specifications"

  // 使用服務器端 Supabase 客戶端獲取產品詳情
  const supabase = createServerComponentClient({ cookies })
  const { data: product, error } = await supabase.from("products").select("*").eq("part_no", productId).single()

  if (error || !product) {
    console.error("獲取產品詳情時出錯:", error)
    notFound()
  }

  // 處理產品圖片
  let productImages = []
  try {
    if (product.images) {
      if (typeof product.images === "string") {
        productImages = JSON.parse(product.images)
      } else {
        productImages = product.images
      }
    }
  } catch (e) {
    console.error("解析產品圖片時出錯:", e)
    productImages = []
  }

  if (productImages.length === 0) {
    productImages = [
      {
        id: "default",
        url: "/diverse-products-still-life.png",
        alt: product.component_name || "產品圖片",
        isThumbnail: true,
      },
    ]
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/products/all">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{product.component_name || product.part_no}</h1>
        </div>
        <Link href={`/products/${productId}/inquiry`}>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            生成詢價單
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>基本資訊</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">產品編號</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.part_no}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">產品名稱</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.component_name || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">客戶</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.customer_id || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">工廠</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.factory_id || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">產品類型</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.product_type || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">狀態</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.status || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">最近價格</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {product.last_price ? `${product.last_price} ${product.currency || ""}` : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">最近訂單日期</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.last_order_date || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">規格</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.specification || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">海關碼</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.customs_code || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">終端客戶</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.end_customer || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">分類碼</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.classification_code || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">車廠圖號</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.vehicle_drawing_no || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">客戶圖號</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.customer_drawing_no || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">產品期稿</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.product_period || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">創建日期</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.created_date || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">MOQ</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.moq || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">交貨時間</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.lead_time || "-"}</dd>
              </div>
              {product.is_assembly && (
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500">組合產品</dt>
                  <dd className="mt-1 text-sm text-gray-900">是</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>產品圖片</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductImagePreview images={productImages} />
          </CardContent>
        </Card>
      </div>

      {/* 組合產品部件資訊 - 只有當產品是組合產品時才顯示 */}
      <ProductComponentsInfo isAssembly={product.is_assembly} pidPartNo={product.pid_part_no} />

      <Card>
        <CardHeader>
          <CardTitle>產品描述</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-900">{product.description || "無產品描述"}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="specifications">規格</TabsTrigger>
          <TabsTrigger value="orders">訂單歷史</TabsTrigger>
          <TabsTrigger value="price">價格歷史</TabsTrigger>
          <TabsTrigger value="complaints">投訴記錄</TabsTrigger>
        </TabsList>
        <TabsContent value="specifications">
          <Card>
            <CardHeader>
              <CardTitle>產品規格</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductSpecifications product={product} />
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
        <TabsContent value="price">
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
      </Tabs>
    </div>
  )
}
