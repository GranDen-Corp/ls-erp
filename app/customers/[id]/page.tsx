import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileEdit } from "lucide-react"
import Link from "next/link"
import CustomerContactInfo from "@/components/customers/customer-contact-info"
import CustomerOrderHistory from "@/components/customers/customer-order-history"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Customer } from "@/types/customer"

export const metadata: Metadata = {
  title: "客戶詳情",
  description: "查看客戶詳細資料",
}

// 模擬獲取客戶數據的函數
async function getCustomer(id: string): Promise<Customer> {
  // 在實際應用中，這裡會從API獲取數據
  return {
    id: "cust-001",
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
    createdAt: "2023-01-15T08:30:00Z",
    updatedAt: "2023-06-20T14:45:00Z",
  }
}

export default async function CustomerDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const customer = await getCustomer(params.id)

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回客戶列表
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
          <div className="ml-2">
            <Link href={`/customers/${customer.id}/edit`}>
              <Button variant="outline" size="sm">
                <FileEdit className="mr-2 h-4 w-4" />
                編輯
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">基本資料</TabsTrigger>
          <TabsTrigger value="orders">訂單歷史</TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="mt-4">
          <CustomerContactInfo customer={customer} />
        </TabsContent>
        <TabsContent value="orders" className="mt-4">
          <CustomerOrderHistory customerId={customer.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
