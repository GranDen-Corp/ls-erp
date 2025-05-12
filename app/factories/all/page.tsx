import { Button } from "@/components/ui/button"
import { FactoriesTable } from "@/components/factories/factories-table"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function FactoriesAllPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">供應商管理</h1>
        <Link href="/factories/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            新增供應商
          </Button>
        </Link>
      </div>
      <FactoriesTable />
    </div>
  )
}
