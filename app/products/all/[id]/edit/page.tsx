import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ProductForm } from "@/components/products/product-form"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function EditProductPage({ params }: { params: { id: string } }) {
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
        <h1 className="text-2xl font-bold">編輯產品: {product.component_name || product.part_no}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>編輯產品資訊</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm productId={productId} isEdit={true} />
        </CardContent>
      </Card>
    </div>
  )
}
