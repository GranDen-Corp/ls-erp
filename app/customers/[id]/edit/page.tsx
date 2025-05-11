import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import CustomerForm from "@/components/customers/customer-form"
import { supabaseClient } from "@/lib/supabase-client"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "編輯客戶",
  description: "編輯客戶資料",
}

// 從資料庫獲取客戶數據
async function getCustomer(id: string) {
  try {
    console.log("正在獲取客戶數據，ID:", id) // 添加日誌以便調試

    const { data, error } = await supabaseClient.from("customers").select("*").eq("customer_id", id).single()

    if (error) {
      console.error("獲取客戶數據錯誤:", error)
      return null
    }

    console.log("獲取到的客戶數據:", data) // 添加日誌以便調試
    return data
  } catch (error) {
    console.error("獲取客戶數據異常:", error)
    return null
  }
}

export default async function EditCustomerPage({
  params,
}: {
  params: { id: string }
}) {
  const customerData = await getCustomer(params.id)

  if (!customerData) {
    notFound()
  }

  // 添加日誌以便調試
  console.log("傳遞給表單的客戶數據:", JSON.stringify(customerData, null, 2))

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
