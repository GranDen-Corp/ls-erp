import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PurchaseDetails } from "@/components/purchases/purchase-details"
import { PurchaseItems } from "@/components/purchases/purchase-items"
import { PurchaseStatusUpdate } from "@/components/purchases/purchase-status-update"
import { PurchaseDocuments } from "@/components/purchases/purchase-documents"
import Link from "next/link"
import { ArrowLeft, FileText, Pencil } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { notFound } from "next/navigation"

async function getPurchase(id: string) {
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

export default async function PurchasePage({ params }: { params: { id: string } }) {
  const purchase = await getPurchase(params.id)

  if (!purchase) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/purchases">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">採購單: {purchase.purchase_id}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/purchases/${params.id}/document`}>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              查看文件
            </Button>
          </Link>
          <Link href={`/purchases/${params.id}/edit`}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              編輯採購單
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">基本資訊</TabsTrigger>
          <TabsTrigger value="items">採購項目</TabsTrigger>
          <TabsTrigger value="status">狀態更新</TabsTrigger>
          <TabsTrigger value="documents">相關文件</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>採購單資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <PurchaseDetails purchase={purchase} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>採購項目清單</CardTitle>
            </CardHeader>
            <CardContent>
              <PurchaseItems items={purchase.items} currency={purchase.currency} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>狀態更新</CardTitle>
            </CardHeader>
            <CardContent>
              <PurchaseStatusUpdate purchase={purchase} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>相關文件</CardTitle>
            </CardHeader>
            <CardContent>
              <PurchaseDocuments purchaseId={params.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
