import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { FactoryCreateForm } from "@/components/factories/factory-create-form"

export default async function NewFactoryPage() {
  // 獲取團隊成員資料，用於品質聯絡人選擇
  const supabase = createServerComponentClient({ cookies })
  const { data: teamMembers } = await supabase.from("team_members").select("ls_employee_id, name").order("name")

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/factories/all">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回供應商列表
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">新增供應商</h1>
        </div>
      </div>

      <FactoryCreateForm teamMembers={teamMembers || []} />
    </div>
  )
}
