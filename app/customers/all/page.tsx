import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import CustomersTable from "@/components/customers/customers-table"

export const metadata: Metadata = {
  title: "客戶管理",
  description: "管理所有客戶資料",
}

export default function CustomersAllPage() {
  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">客戶管理</h1>
          <p className="text-muted-foreground">查看和管理所有客戶資料</p>
        </div>
        <Link href="/customers/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            新增客戶
          </Button>
        </Link>
      </div>
      <CustomersTable />
    </div>
  )
}
