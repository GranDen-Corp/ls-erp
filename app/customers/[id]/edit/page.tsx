import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import CustomerForm from "@/components/customers/customer-form"
import type { CustomerFormData } from "@/types/customer"

export const metadata: Metadata = {
  title: "編輯客戶",
  description: "編輯客戶資料",
}

// 模擬獲取客戶數據的函數
async function getCustomer(id: string): Promise<CustomerFormData> {
  // 在實際應用中，這裡會從API獲取數據
  return {
    name: "全球貿易有限公司",
    contactPerson: "張小明",
    email: "contact@globaltrade.com",
    phone: "+886 2 1234 5678",
    address: "台北市信義區信義路五段7號",
    country: "台灣",
    paymentTerms: "T/T 30天",
    creditLimit: 500000,
    currency: "TWD",
    status: "active",
    notes: "",
  }
}

export default async function EditCustomerPage({
  params,
}: {
  params: { id: string }
}) {
  const customerData = await getCustomer(params.id)

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <Link href={`/customers/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回客戶詳情
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">編輯客戶</h1>
      </div>

      <CustomerForm initialData={customerData} customerId={params.id} />
    </div>
  )
}
