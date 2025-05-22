import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ProductInquiryForm } from "@/components/products/product-inquiry-form"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function ProductInquiryPage({ params }: { params: { id: string } }) {
  const productId = decodeURIComponent(params.id)

  // 使用服務器端 Supabase 客戶端獲取產品詳情
  const supabase = createServerComponentClient({ cookies })
  const { data: product, error } = await supabase.from("products").select("*").eq("part_no", productId).single()

  if (error || !product) {
    console.error("獲取產品詳情時出錯:", error)
    notFound()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href={`/products/all/${encodeURIComponent(productId)}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">產品詢價單: {product.component_name || product.part_no}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>生成詢價單</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductInquiryForm product={product} />
        </CardContent>
      </Card>
    </div>
  )
}
