import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ContractConfirmationTable } from "@/components/orders/contract-confirmation-table"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function ContractConfirmationPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">合約確認</h1>
        <Link href="/orders/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            新增訂單
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>待確認合約</CardTitle>
        </CardHeader>
        <CardContent>
          <ContractConfirmationTable />
        </CardContent>
      </Card>
    </div>
  )
}
