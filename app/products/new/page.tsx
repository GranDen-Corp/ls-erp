"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ProductForm } from "@/components/products/product-form"
// import ProductForm from "@/components/products/product-form"
import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"

export default function NewProductPage() {
  const searchParams = useSearchParams()
  const cloneId = searchParams.get("clone")
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Remove productType logic and simplify page title
  const pageTitle = cloneId ? "複製產品" : "新增產品"

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      // 成功提示
      toast({
        title: "產品創建成功",
        description: `產品 ${data.partNo} 已成功創建`,
      })

      // 導航到產品列表
      router.push("/products/all")
    } catch (error) {
      toast({
        title: "錯誤",
        description: "產品創建失敗，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
          <h1 className="text-2xl font-bold">{pageTitle}</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{cloneId ? "複製現有產品" : "填寫產品資訊"}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            productId={cloneId || undefined}
            isClone={!!cloneId}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  )
}
