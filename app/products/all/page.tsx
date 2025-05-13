import { ProductsTable } from "@/components/products/products-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase-client"
import { AdvancedFilter, type FilterOption } from "@/components/ui/advanced-filter"

export default async function ProductsPage() {
  const supabase = createServerSupabaseClient()
  const { data: products, error } = await supabase.from("products").select("*")

  if (error) {
    console.error("獲取產品列表時出錯:", error)
    return <div>獲取產品列表時出錯: {error.message}</div>
  }

  // 定義篩選選項
  const filterOptions: FilterOption[] = [
    {
      id: "type",
      label: "產品類型",
      type: "select",
      options: [
        { value: "standard", label: "標準產品" },
        { value: "custom", label: "客製產品" },
        { value: "assembly", label: "組合產品" },
      ],
    },
    {
      id: "customer",
      label: "客戶",
      type: "select",
      options: [
        { value: "all", label: "所有客戶" },
        // 這裡可以動態加載客戶列表
      ],
    },
    {
      id: "status",
      label: "狀態",
      type: "select",
      options: [
        { value: "active", label: "活躍" },
        { value: "inactive", label: "非活躍" },
        { value: "discontinued", label: "已停產" },
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">產品管理</h1>
        <div className="flex gap-2">
          <Link href="/products/assembly">
            <Button variant="outline">組合產品</Button>
          </Link>
          <Link href="/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新增產品
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="p-4">
          <h2 className="text-lg font-medium mb-2">搜尋與篩選</h2>
          <AdvancedFilter
            options={filterOptions}
            onFilterChange={(filters) => console.log(filters)}
            placeholder="搜尋產品編號、名稱、客戶或工廠..."
          />
        </div>
      </div>

      <ProductsTable products={products || []} />
    </div>
  )
}
