"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ProductsTable } from "@/components/products/products-table"
import type { FilterOption } from "@/components/ui/advanced-filter"
import { useSearchParams } from "next/navigation"
import type { Product } from "@/types/product"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const searchParams = useSearchParams()
  const filterParam = searchParams.get("filter")
  const supabase = createClientComponentClient()

  // 定義篩選選項
  const filterOptions: FilterOption[] = [
    {
      id: "type",
      label: "產品類型",
      type: "select",
      options: [
        { value: "all", label: "所有類型" },
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
        { value: "all", label: "所有狀態" },
        { value: "active", label: "活躍" },
        { value: "inactive", label: "非活躍" },
        { value: "discontinued", label: "已停產" },
      ],
    },
  ]

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        // 構建查詢
        let query = supabase.from("products").select("*")

        // 如果URL參數指定了過濾組合產品
        if (filterParam === "assembly") {
          query = query.eq("is_assembly", true)
        }

        // 應用其他過濾條件
        if (filters.type && filters.type !== "all") {
          query = query.eq("product_type", filters.type)
        }

        if (filters.customer && filters.customer !== "all") {
          query = query.eq("customer_id", filters.customer)
        }

        if (filters.status && filters.status !== "all") {
          query = query.eq("status", filters.status)
        }

        // 執行查詢
        const { data, error: fetchError } = await query

        if (fetchError) {
          throw new Error(`獲取產品資料時出錯: ${fetchError.message}`)
        }

        // 處理產品數據
        const processedProducts =
          data?.map((product) => {
            // 處理 sub_part_no
            let subPartNo = product.sub_part_no
            try {
              if (typeof subPartNo === "string" && subPartNo) {
                subPartNo = JSON.parse(subPartNo)
              }
            } catch (e) {
              console.error("解析 sub_part_no 時出錯:", e)
              subPartNo = []
            }

            // 處理 images
            let images = product.images
            try {
              if (typeof images === "string" && images) {
                images = JSON.parse(images)
              }
            } catch (e) {
              console.error("解析 images 時出錯:", e)
              images = []
            }

            // 確保 images 是數組
            if (!Array.isArray(images)) {
              images = []
            }

            // 確保每個圖片對象都有必要的屬性
            const validImages = images
              .filter((img) => img && typeof img === "object")
              .map((img, index) => ({
                id: img.id || `img-${index}`,
                url: img.url || "/diverse-products-still-life.png",
                alt: img.alt || product.component_name || "產品圖片",
                isThumbnail: img.isThumbnail || false,
              }))

            return {
              ...product,
              sub_part_no: subPartNo,
              images:
                validImages.length > 0
                  ? validImages
                  : [
                      {
                        id: "default",
                        url: "/diverse-products-still-life.png",
                        alt: product.component_name || "產品圖片",
                        isThumbnail: true,
                      },
                    ],
            }
          }) || []

        setProducts(processedProducts)
      } catch (err) {
        console.error("獲取產品資料時出錯:", err)
        setError(err instanceof Error ? err.message : "獲取產品資料時出錯")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filterParam, filters, supabase])

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
  }

  // 根據過濾參數設置頁面標題
  const pageTitle = filterParam === "assembly" ? "組合產品管理" : "產品管理"
  const addButtonText = filterParam === "assembly" ? "新增組合產品" : "新增產品"
  const addButtonLink = filterParam === "assembly" ? "/products/new?type=assembly" : "/products/new"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{pageTitle}</h1>
        <div className="flex gap-2">
          {filterParam !== "assembly" && (
            <Link href="/products/all?filter=assembly">
              <Button variant="outline">查看組合產品</Button>
            </Link>
          )}
          <Link href={addButtonLink}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {addButtonText}
            </Button>
          </Link>
        </div>
      </div>

      {error ? (
        <p className="text-center text-red-500 py-4">{error}</p>
      ) : (
        <ProductsTable products={products} isLoading={loading} />
      )}
    </div>
  )
}
