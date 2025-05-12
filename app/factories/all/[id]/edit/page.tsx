import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { FactoryForm } from "@/components/factories/factory-form"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function EditFactoryPage({ params }: { params: { id: string } }) {
  const factoryId = decodeURIComponent(params.id)

  // 使用服務器端 Supabase 客戶端獲取供應商詳情
  const supabase = createServerComponentClient({ cookies })
  const { data: factory, error } = await supabase.from("suppliers").select("*").eq("factory_id", factoryId).single()

  if (error || !factory) {
    console.error("獲取供應商詳情時出錯:", error)
    notFound()
  }

  // 將資料庫資料轉換為表單所需的格式
  const formattedFactory = {
    id: factory.factory_id || "",
    name: factory.factory_name || "",
    code: factory.factory_code || factory.factory_id || "",
    contactPerson: factory.contact_person || "",
    phone: factory.phone || factory.factory_phone || "",
    email: factory.email || factory.contact_email || "",
    address: factory.address || factory.factory_address || "",
    country: factory.country || "",
    category: factory.category1 || "",
    establishedDate: factory.established_date ? new Date(factory.established_date) : undefined,
    taxId: factory.tax_id || "",
    website: factory.website || "",
    notes: factory.notes || "",
    paymentTerms: factory.payment_terms || "",
    minimumOrderValue: factory.minimum_order_value ? Number(factory.minimum_order_value) : 0,
    leadTime: factory.lead_time ? Number(factory.lead_time) : 0,
    qualityRating: factory.quality_rating ? Number(factory.quality_rating) : 3,
    status: factory.status || "active",
    fullName: factory.factory_full_name || "",
    fax: factory.fax || factory.factory_fax || "",
    city: factory.city || "",
    postalCode: factory.postal_code || "",
    supplierType: factory.supplier_type || "",
    category2: factory.category2 || "",
    category3: factory.category3 || "",
    iso9001Certified: factory.iso9001_certified || "否",
    iatf16949Certified: factory.iatf16949_certified || "否",
    iso17025Certified: factory.iso17025_certified || "否",
    cqi9Certified: factory.cqi9_certified || "否",
    cqi11Certified: factory.cqi11_certified || "否",
    cqi12Certified: factory.cqi12_certified || "否",
    contactPhone: factory.contact_phone || "",
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href={`/factories/all/${encodeURIComponent(factoryId)}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">編輯供應商: {factory.factory_name || factory.factory_id}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>編輯供應商資訊</CardTitle>
        </CardHeader>
        <CardContent>
          <FactoryForm factoryId={factoryId} initialData={formattedFactory} />
        </CardContent>
      </Card>
    </div>
  )
}
