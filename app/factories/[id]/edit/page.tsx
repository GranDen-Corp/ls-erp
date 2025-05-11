import { FactoryForm } from "@/components/factories/factory-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { supabaseClient } from "@/lib/supabase-client"
import { notFound } from "next/navigation"

export default async function EditFactoryPage({ params }: { params: { id: string } }) {
  // 從資料庫獲取供應商資訊
  const { data: factory, error } = await supabaseClient
    .from("suppliers")
    .select("*")
    .eq("factory_id", params.id)
    .single()

  // 如果發生錯誤或找不到供應商，導向404頁面
  if (error || !factory) {
    console.error("獲取供應商資訊時出錯:", error?.message || "找不到供應商")
    notFound()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href={`/factories/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">編輯供應商: {factory.factory_name}</h1>
      </div>
      <FactoryForm factory={factory} />
    </div>
  )
}
