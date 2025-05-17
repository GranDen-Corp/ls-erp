import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Edit, FileText } from "lucide-react"
import Link from "next/link"
import { ProductReadOnlyForm } from "@/components/products/product-readonly-form"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const productId = decodeURIComponent(params.id)

  // 使用服務器端 Supabase 客戶端獲取產品詳情
  const supabase = createServerComponentClient({ cookies })
  const { data: product, error } = await supabase.from("products").select("*").eq("part_no", productId).single()

  if (error || !product) {
    console.error("獲取產品詳情時出錯:", error)
    notFound()
  }

  // 將資料庫資料轉換為表單所需的格式
  const formattedProduct = {
    componentName: product.component_name || "",
    specification: product.specification || "",
    customsCode: product.customs_code || "",
    endCustomer: product.end_customer || "",
    customerName: {
      id: product.customer_id || "",
      name: product.customer_name || "",
      code: product.customer_id || "",
    },
    factoryName: {
      id: product.factory_id || "",
      name: product.factory_name || "",
      code: product.factory_id || "",
    },
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/products/all">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">產品詳情: {product.component_name || product.part_no}</h1>
        </div>
        <div>
          <Link href={`/products/${productId}/inquiry`}>
            <Button variant="outline" className="mr-2">
              <FileText className="mr-2 h-4 w-4" />
              生成詢價單
            </Button>
          </Link>
          <Link href={`/products/all/${encodeURIComponent(productId)}/edit`}>
            <Button variant="default">
              <Edit className="mr-2 h-4 w-4" />
              編輯產品
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <ProductReadOnlyForm
            productId={productId}
            initialValues={formattedProduct}
            isAssembly={product.is_assembly}
            defaultTab="basic"
          />
        </CardContent>
      </Card>
    </div>
  )
}
