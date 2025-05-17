import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PurchaseEditForm } from "@/components/purchases/purchase-edit-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { notFound } from "next/navigation"

async function getPurchaseWithItems(id: string) {
  const supabase = createClient()

  // 獲取採購單主表數據
  const { data: purchase, error } = await supabase.from("purchases").select("*").eq("purchase_id", id).single()

  if (error || !purchase) {
    console.error("獲取採購單數據時出錯:", error)
    return null
  }

  // 獲取採購單明細
  const { data: items, error: itemsError } = await supabase
    .from("purchase_items")
    .select("*")
    .eq("purchase_sid", purchase.purchase_sid)
    .order("item_sid", { ascending: true })

  if (itemsError) {
    console.error("獲取採購單明細時出錯:", itemsError)
  }

  return {
    ...purchase,
    items: items || [],
  }
}

export default async function PurchaseEditPage({ params }: { params: { id: string } }) {
  const purchase = await getPurchaseWithItems(params.id)

  if (!purchase) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href={`/purchases/${params.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">編輯採購單: {params.id}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>採購單資訊</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseEditForm purchase={purchase} />
        </CardContent>
      </Card>
    </div>
  )
}
