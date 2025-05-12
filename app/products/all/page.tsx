import { ProductsTable } from "@/components/products/products-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export default async function ProductsPage() {
  const supabase = createServerSupabaseClient()
  const { data: products, error } = await supabase.from("products").select("*")

  if (error) {
    console.error("獲取產品列表時出錯:", error)
    return <div>獲取產品列表時出錯: {error.message}</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">產品管理</h1>
        <div className="flex gap-2">
          <Link href="/products/assembly">
            <Button variant="outline">組裝產品</Button>
          </Link>
          <Link href="/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新增產品
            </Button>
          </Link>
        </div>
      </div>
      <ProductsTable products={products || []} />
    </div>
  )
}
