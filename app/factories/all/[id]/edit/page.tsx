import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { FactoryEditForm } from "@/components/factories/factory-edit-form"

export default async function EditFactoryPage({ params }: { params: { id: string } }) {
  const factoryId = decodeURIComponent(params.id)

  // 使用服務器端 Supabase 客戶端獲取供應商詳情
  const supabase = createServerComponentClient({ cookies })
  const { data: factory, error } = await supabase.from("factories").select("*").eq("factory_id", factoryId).single()

  if (error || !factory) {
    console.error("獲取供應商詳情時出錯:", error)
    notFound()
  }

  // 獲取團隊成員資料，用於品質聯絡人選擇
  const { data: teamMembers } = await supabase.from("team_members").select("ls_employee_id, name").order("name")

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href={`/factories/all/${encodeURIComponent(factoryId)}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回供應商詳情
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">編輯供應商: {factory.factory_name}</h1>
        </div>
      </div>

      <FactoryEditForm factory={factory} teamMembers={teamMembers || []} />
    </div>
  )
}
