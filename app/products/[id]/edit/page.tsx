"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ProductForm } from "@/components/products/product-form"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabaseClient } from "@/lib/supabase-client"

interface ProductEditPageProps {
  params: {
    id: string
  }
}

export default function ProductEditPage({ params }: ProductEditPageProps) {
  const { id } = params
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "basic"
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [productData, setProductData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // 從Supabase獲取產品資料
        const { data, error } = await supabaseClient
          .from("products")
          .select(`
          *,
          customer:customer_id(*),
          factory:factory_id(*)
        `)
          .eq("part_no", id)
          .single()

        if (error) {
          throw new Error(`獲取產品資料時出錯: ${error.message}`)
        }

        if (!data) {
          throw new Error(`找不到產品: ${id}`)
        }

        console.log("獲取到的產品資料:", data)

        // 格式化資料以符合表單需求
        const formattedData = {
          ...data,
          componentName: data.component_name || "",
          specification: data.specification || "",
          customsCode: data.customs_code || "",
          endCustomer: data.end_customer || "",
          customerName: data.customer
            ? {
                id: data.customer.customer_id || "",
                name: data.customer.customer_short_name || "",
                code: data.customer.customer_id || "",
              }
            : { id: "", name: "", code: "" },
          factoryName: data.factory
            ? {
                id: data.factory.factory_id || "",
                name: data.factory.factory_name || "",
                code: data.factory.factory_id || "",
              }
            : { id: "", name: "", code: "" },
          productType: data.product_type || "",
          partNo: data.part_no || "",
          classificationCode: data.classification_code || "",
          vehicleDrawingNo: data.vehicle_drawing_no || "",
          customerDrawingNo: data.customer_drawing_no || "",
          productPeriod: data.product_period || "",
          description: data.description || "",
          status: data.status || "active",
          originalDrawingVersion: data.original_drawing_version || "",
          drawingVersion: data.drawing_version || "",
          customerOriginalDrawing: data.customer_original_drawing || { path: "", filename: "" },
          jinzhanDrawing: data.jinzhan_drawing || { path: "", filename: "" },
          customerDrawing: data.customer_drawing || { path: "", filename: "" },
          factoryDrawing: data.factory_drawing || { path: "", filename: "" },
          customerDrawingVersion: data.customer_drawing_version || "",
          factoryDrawingVersion: data.factory_drawing_version || "",
          images: data.images || [],
          isAssembly: data.is_assembly || false,
          components: data.components || [],
          assemblyTime: data.assembly_time || 30,
          assemblyCostPerHour: data.assembly_cost_per_hour || 10,
          additionalCosts: data.additional_costs || 0,
          complianceStatus: data.compliance_status || {},
          importantDocuments: data.important_documents || {},
          partManagement: data.part_management || {},
          editNotes: data.edit_notes || [],
          processData: data.process_data || [],
          orderRequirements: data.order_requirements || "",
          purchaseRequirements: data.purchase_requirements || "",
          specialRequirements: data.special_requirements || [],
          processNotes: data.process_notes || [],
          moq: data.moq || 0,
          leadTime: data.lead_time || "",
          packagingRequirements: data.packaging_requirements || "",
          hasMold: data.has_mold || false,
          moldCost: data.mold_cost || "",
          refundableMoldQuantity: data.refundable_mold_quantity || "",
          moldReturned: data.mold_returned || false,
          accountingNote: data.accounting_note || "",
          qualityNotes: data.quality_notes || [],
          resumeNotes: data.resume_notes || [],
          orderHistory: data.order_history || [],
        }

        // 設置產品資料到表單
        setProductData(formattedData)
      } catch (error) {
        console.error("獲取產品資料時出錯:", error)
        setError(error instanceof Error ? error.message : "未知錯誤")
        toast({
          title: "錯誤",
          description: error instanceof Error ? error.message : "無法載入產品資料，請稍後再試",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id, toast])

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      // 使用Server Action保存產品資料
      const response = await fetch("/api/products/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("保存產品失敗")
      }

      // 成功提示
      toast({
        title: "產品更新成功",
        description: `產品 ${data.partNo || id} 已成功更新`,
      })

      // 導航到產品詳情頁
      router.push(`/products/${id}`)
    } catch (error) {
      console.error("保存產品時出錯:", error)
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
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>載入中...</p>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 border border-red-300 rounded-md">{error}</div>
          ) : (
            <ProductForm
              productId={id}
              onSubmit={handleSubmit}
              initialValues={productData}
              isSubmitting={isSubmitting}
              defaultTab={defaultTab}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
