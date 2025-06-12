import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CustomerForm } from "@/components/customers/customer-form"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
  const customerId = decodeURIComponent(params.id)

  // 使用服務器端 Supabase 客戶端獲取客戶詳情
  const supabase = createServerComponentClient({ cookies })
  const { data: customer, error } = await supabase.from("customers").select("*").eq("customer_id", customerId).single()

  if (error || !customer) {
    console.error("獲取客戶詳情時出錯:", error)
    notFound()
  }

  // 將資料庫資料轉換為表單所需的格式
  const formattedCustomer = {
    // 基本資訊
    customer_id: customer.customer_id || "",
    customer_full_name: customer.customer_full_name || customer.customer_name || "",
    customer_short_name: customer.customer_short_name || customer.short_name || "",
    group_code: customer.group_code || customer.group_tag || "",
    division_location: customer.division_location || customer.country || "",
    use_group_setting: customer.use_group_setting || false,

    // 聯絡資訊
    customer_phone: customer.customer_phone || customer.phone || "",
    customer_fax: customer.customer_fax || customer.fax || "",
    report_email: customer.report_email || "",
    invoice_email: customer.invoice_email || customer.email || "",
    customer_address: customer.customer_address || customer.address || "",
    invoice_address: customer.invoice_address || "",
    ship_to_address: customer.ship_to_address || "",
    client_lead_person: customer.client_lead_person || "",
    client_contact_person: customer.client_contact_person || customer.contact_person || "",
    client_procurement: customer.client_procurement || "",
    client_sales: customer.client_sales || "",
    sales_representative: customer.represent_sales || customer.sales_representative || "",
    logistics_coordinator: customer.logistics_coordinator || "",

    // 財務資訊
    currency: customer.currency || "USD",
    exchange_rate: customer.exchange_rate || 1,
    payment_due_date: customer.payment_due_date || customer.payment_terms || "",
    payment_terms: customer.payment_terms || "",
    payment_terms_specification: customer.payment_terms_specification || customer.payment_condition || "",
    trade_terms: customer.trade_terms || customer.delivery_terms || "",
    trade_terms_specification: customer.trade_terms_specification || "",

    // 包裝與出貨
    group_packaging_default: customer.group_packaging_default || "",
    order_packaging_display: customer.order_packaging_display || "",
    customer_packaging: customer.customer_packaging || "",
    packaging_details: customer.packaging_details || "",
    packing_info: customer.packing_info || "",
    pallet_format: customer.pallet_format || "",
    carton_format: customer.carton_format || "",
    max_carton_weight: customer.max_carton_weight || 0,
    sc_shipping_mark: customer.sc_shipping_mark || "",
    labels: customer.labels || "",

    // 品質與報告
    qty_allowance_percent: customer.qty_allowance_percent || 0,
    acceptance_percent: customer.acceptance_percent || 0,
    report_type: customer.report_type || "",
    require_report: customer.require_report || false,
    cbam_note: customer.cbam_note || "",
    legacy_system_note: customer.legacy_system_note || "",

    // 向後兼容的欄位映射
    id: customer.customer_id || "",
    name: customer.customer_full_name || customer.customer_name || "",
    code: customer.customer_code || customer.customer_id || "",
    contactPerson: customer.client_contact_person || customer.contact_person || "",
    phone: customer.customer_phone || customer.phone || "",
    email: customer.invoice_email || customer.email || "",
    address: customer.customer_address || customer.address || "",
    region: customer.region || "",
    industry: customer.industry || "",
    registrationDate: customer.registration_date ? new Date(customer.registration_date) : undefined,
    taxId: customer.tax_id || "",
    website: customer.website || "",
    notes: customer.notes || "",
    paymentTerms: customer.payment_terms || customer.payment_due_date || "",
    creditLimit: customer.credit_limit ? Number(customer.credit_limit) : 0,
    status: customer.status || "active",
    shortName: customer.customer_short_name || customer.short_name || "",
    fax: customer.customer_fax || customer.fax || "",
    country: customer.division_location || customer.country || "",
    bankName: customer.bank_name || "",
    bankAccount: customer.bank_account || "",
    groupTag: customer.group_code || customer.group_tag || "",
    salesRepresentative: customer.represent_sales || customer.sales_representative || "",
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href={`/customers/all/${encodeURIComponent(customerId)}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">編輯客戶: {customer.customer_name || customer.customer_id}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>編輯客戶資訊</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm customerId={customerId} initialData={formattedCustomer} />
        </CardContent>
      </Card>
    </div>
  )
}
