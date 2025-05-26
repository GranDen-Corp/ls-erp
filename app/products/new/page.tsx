"use client"

import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ProductForm } from "@/components/products/product-form"
// import ProductForm from "@/components/products/product-form"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"

export default function NewProductPage(){

  const searchParams = useSearchParams();
  const clone = searchParams.get('clone');
  
  // 解析傳遞過來的產品資料
  const [formattedProduct, setFormattedProduct] = useState(null);


  useEffect(() => {
    if (clone === 'true') {
      const clonedProduct = localStorage.getItem('clonedProduct');
      if (clonedProduct) {
        const product = JSON.parse(clonedProduct);
        
        // 將資料庫資料轉換為表單所需的格式
        const formatted = {
          componentName: product.component_name || "",
          componentNameEn: product.component_name_en || "",
          specification: product.specification || "",
          customsCode: product.customs_code || "",
          endCustomer: product.end_customer || "",
          customer_id: product.customer_id || "",
          factory_id: product.factory_id || "",
          productType: product.product_type || "",
          partNo: product.part_no || "",
          classificationCode: product.classification_code || "",
          vehicleDrawingNo: product.vehicle_drawing_no || "",
          customerDrawingNo: product.customer_drawing_no || "",
          productPeriod: product.product_period || "",
          description: product.description || "",
          status: product.status || "active",
          specifications: product.specifications || [],
          originalDrawingVersion: product.original_drawing_version || "",
          drawingVersion: product.drawing_version || "",
          customerOriginalDrawing: product.customer_original_drawing || { path: "", filename: "" },
          jinzhanDrawing: product.jinzhan_drawing || { path: "", filename: "" },
          customerDrawing: product.customer_drawing || { path: "", filename: "" },
          factoryDrawing: product.factory_drawing || { path: "", filename: "" },
          customerDrawingVersion: product.customer_drawing_version || "",
          factoryDrawingVersion: product.factory_drawing_version || "",
          images: product.images || [],
          isAssembly: product.is_assembly || false,
          components: product.components || [],
          subPartNo: product.sub_part_no || [],
          assemblyTime: product.assembly_time || 30,
          assemblyCostPerHour: product.assembly_cost_per_hour || 10,
          additionalCosts: product.additional_costs || 0,
          complianceStatus: product.compliance_status || {},
          importantDocuments: product.important_documents || {},
          partManagement: product.part_management || {},
          editNotes: product.edit_notes || [],
          processData: product.process_data || [],
          orderRequirements: product.order_requirements || "",
          purchaseRequirements: product.purchase_requirements || "",
          specialRequirements: product.special_requirements || [],
          processNotes: product.process_notes || [],
          moq: product.moq || 0,
          leadTime: product.lead_time || "",
          packagingRequirements: product.packaging_requirements || "",
          hasMold: product.has_mold || false,
          moldCost: product.mold_cost || "",
          refundableMoldQuantity: product.refundable_mold_quantity || "",
          moldReturned: product.mold_returned || false,
          accountingNote: product.accounting_note || "",
          qualityNotes: product.quality_notes || [],
          resumeNotes: product.resume_notes || [],
          orderHistory: product.order_history || [],
          createdDate: product.created_date || "",
          lastOrderDate: product.last_order_date || "",
          lastPrice: product.last_price || "",
          currency: product.currency || "",
          sampleStatus: product.sample_status || "",
          sampleDate: product.sample_date || "",
        }
        
        setFormattedProduct(formatted);

        // 清除 localStorage
        localStorage.removeItem('clonedProduct');
      }
    }
  }, [clone]);

  const PartNo = formattedProduct?.partNo
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Remove productType logic and simplify page title
  const pageTitle = PartNo ? "複製產品" : "新增產品"  

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
          <CardTitle>{PartNo ? "複製現有產品" : "填寫產品資訊"}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            productId={PartNo || undefined}
            initialValues={formattedProduct}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  )
}
