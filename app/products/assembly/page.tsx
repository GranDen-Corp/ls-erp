"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Product } from "@/types/product"
import { useRouter } from "next/navigation"
import { ProductsTable } from "@/components/products/products-table"
import { AdvancedFilter, type FilterOption } from "@/components/ui/advanced-filter"

export default function AssemblyProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({})
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const fetchAssemblyProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        // 獲取所有組合產品
        const { data: assemblyProducts, error: assemblyError } = await supabase
          .from("products")
          .select("*")
          .eq("is_assembly", true)

        if (assemblyError) {
          throw new Error(`獲取組合產品資料時出錯: ${assemblyError.message}`)
        }

        // 獲取所有產品以便查找組件名稱
        const { data: allProducts, error: productsError } = await supabase
          .from("products")
          .select("part_no, component_name")

        if (productsError) {
          throw new Error(`獲取產品資料時出錯: ${productsError.message}`)
        }

        // 處理組合產品數據，確保 pid_part_no 格式正確
        const processedProducts = assemblyProducts.map((product) => {
          let pidPartNo = product.pid_part_no

          // 如果 pid_part_no 是字符串，嘗試解析為 JSON
          if (typeof pidPartNo === "string") {
            try {
              pidPartNo = JSON.parse(pidPartNo)
            } catch (e) {
              console.error("解析 pid_part_no 時出錯:", e)
              pidPartNo = []
            }
          }

          return {
            ...product,
            pid_part_no: pidPartNo,
          }
        })

        setProducts(processedProducts || [])
      } catch (err) {
        console.error("獲取組合產品資料時出錯:", err)
        setError(err instanceof Error ? err.message : "獲取組合產品資料時出錯")
      } finally {
        setLoading(false)
      }
    }

    fetchAssemblyProducts()
  }, [filters])

  // 定義篩選選項
  const filterOptions: FilterOption[] = [
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

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/products/all">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">組合產品管理</h1>
        </div>
        <Link href="/products/new?type=assembly">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新增組合產品
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <div className="p-4">
          <h2 className="text-lg font-medium mb-2">搜尋與篩選</h2>
          <AdvancedFilter
            options={filterOptions}
            onFilterChange={handleFilterChange}
            placeholder="搜尋產品編號、名稱、客戶或工廠..."
          />
        </div>
      </div>

      {error ? (
        <p className="text-center text-red-500 py-4">{error}</p>
      ) : (
        <ProductsTable
          products={products}
          isLoading={loading}
          onEdit={(product) => router.push(`/products/${encodeURIComponent(product.part_no)}/edit?tab=composite`)}
          onView={(product) => router.push(`/products/all/${encodeURIComponent(product.part_no)}?tab=assembly`)}
        />
      )}
    </div>
  )
}
