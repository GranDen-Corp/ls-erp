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
    id: customer.customer_id || "",
    name: customer.customer_name || "",
    code: customer.customer_code || customer.customer_id || "",
    contactPerson: customer.contact_person || "",
    phone: customer.phone || customer.customer_phone || "",
    email: customer.email || customer.invoice_email || "",
    address: customer.address || customer.customer_address || "",
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
    fax: customer.fax || customer.customer_fax || "",
    country: customer.country || customer.division_location || "",
    bankName: customer.bank_name || "",
    bankAccount: customer.bank_account || "",
    groupTag: customer.group_tag || customer.group_code || "",
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
