"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ProductForm } from "@/components/products/product-form"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface ProductEditPageProps {
  params: {
    id: string
  }
}

export default function ProductEditPage({ params }: ProductEditPageProps) {
  const { id } = params
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      // 模擬API調用
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 成功提示
      toast({
        title: "產品更新成功",
        description: `產品 ${data.pn} 已成功更新`,
      })

      // 導航到產品詳情頁
      router.push(`/products/${id}`)
    } catch (error) {
      toast({
        title: "錯誤",
        description: "產品更新失敗，請稍後再試",
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
          <Link href={`/products/${id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">編輯產品</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>編輯產品資訊</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm productId={id} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  )
}
