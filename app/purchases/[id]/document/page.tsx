import { Button } from "@/components/ui/button"
import { PurchaseOrder } from "@/components/purchases/purchase-order"
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

  // 格式化數據以適應 PurchaseOrder 組件
  const formattedItems = (items || []).map((item) => ({
    id: item.item_sid.toString(),
    name: item.product_name,
    pn: item.product_part_no,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    totalPrice: item.total_price,
  }))

  return {
    poNumber: purchase.purchase_id,
    factoryId: purchase.factory_id,
    factoryName: purchase.factory_name,
    currency: purchase.currency,
    deliveryTerms: purchase.delivery_term || "",
    paymentTerms: purchase.payment_term || "",
    deliveryDate: purchase.expected_delivery_date ? new Date(purchase.expected_delivery_date) : undefined,
    remarks: purchase.notes || "",
    products: formattedItems,
  }
}

export default async function PurchaseDocumentPage({ params }: { params: { id: string } }) {
  const purchaseData = await getPurchaseWithItems(params.id)

  if (!purchaseData) {
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
        <h1 className="text-2xl font-bold">採購單文件: {params.id}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        <PurchaseOrder purchaseData={purchaseData} />
      </div>
    </div>
  )
}
