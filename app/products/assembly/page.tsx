"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Product } from "@/types/product"
import { ProductsTable } from "@/components/products/products-table"

export default function AssemblyProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchAssemblyProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        // 獲取所有組合產品
        const { data: assemblyProducts, error: assemblyError } = await supabase
          .from("products")
          .select("*")
          .eq("product_type", "組合件")

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

        // 處理組合產品數據，確保 sub_part_no 格式正確
        const processedProducts = assemblyProducts.map((product) => {
          let subPartNo = product.sub_part_no

          // 如果 sub_part_no 是字符串，嘗試解析為 JSON
          if (typeof subPartNo === "string") {
            try {
              subPartNo = JSON.parse(subPartNo)
            } catch (e) {
              console.error("解析 sub_part_no 時出錯:", e)
              subPartNo = []
            }
          }

          return {
            ...product,
            sub_part_no: subPartNo,
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
  }, [])

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

      {error ? (
        <p className="text-center text-red-500 py-4">{error}</p>
      ) : (
        <ProductsTable products={products} isLoading={loading} />
      )}
    </div>
  )
}
