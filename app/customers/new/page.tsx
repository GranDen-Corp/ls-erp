import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CustomerForm } from "@/components/customers/customer-form"

export const metadata: Metadata = {
  title: "新增客戶",
  description: "新增客戶資料",
}

export default function NewCustomerPage() {
  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <Link href="/customers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回客戶列表
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">新增客戶</h1>
      </div>

      <CustomerForm />
    </div>
  )
}
