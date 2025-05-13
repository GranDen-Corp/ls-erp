"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, FileEdit, Eye } from "lucide-react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Product } from "@/types/product"
import { DataTable } from "@/components/ui/data-table"
import { useRouter } from "next/navigation"

export default function AssemblyProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
  }, [])

  // 定義表格列
  const columns = [
    {
      accessorKey: "part_no",
      header: "產品編號",
    },
    {
      accessorKey: "component_name",
      header: "產品名稱",
    },
    {
      accessorKey: "customer_id",
      header: "客戶",
    },
    {
      accessorKey: "factory_id",
      header: "工廠",
    },
    {
      accessorKey: "status",
      header: "狀態",
    },
    {
      id: "actions",
      cell: ({ row }: { row: { original: Product } }) => {
        const product = row.original

        // 顯示組件名稱
        let componentNames = ""
        if (product.pid_part_no && Array.isArray(product.pid_part_no)) {
          componentNames = product.pid_part_no
            .map((comp) => (typeof comp === "object" ? comp.description : ""))
            .filter((name) => name)
            .join(", ")
        }

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/products/all/${encodeURIComponent(product.part_no)}?tab=assembly`)}
            >
              <Eye className="h-4 w-4 mr-1" />
              詳情
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/products/${encodeURIComponent(product.part_no)}/edit?tab=composite`)}
            >
              <FileEdit className="h-4 w-4 mr-1" />
              編輯
            </Button>
          </div>
        )
      },
    },
  ]

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

      <Card>
        <CardHeader>
          <CardTitle>組合產品列表</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-center text-red-500 py-4">{error}</p>
          ) : (
            <DataTable columns={columns} data={products} loading={loading} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
