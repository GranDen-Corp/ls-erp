"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/components/products/assembly-products-columns"

export default function AssemblyProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchAssemblyProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase.from("products").select("*").eq("is_assembly", true)

        if (error) {
          throw new Error(`獲取組裝產品資料時出錯: ${error.message}`)
        }

        setProducts(data || [])
      } catch (err) {
        console.error("獲取組裝產品資料時出錯:", err)
        setError(err instanceof Error ? err.message : "獲取組裝產品資料時出錯")
      } finally {
        setLoading(false)
      }
    }

    fetchAssemblyProducts()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Link href="/products/all">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">組裝產品管理</h1>
        </div>
        <Card>
          <CardContent className="flex justify-center items-center h-64">
            <p>載入中...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Link href="/products/all">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">組裝產品管理</h1>
        </div>
        <Card>
          <CardContent className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
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
          <h1 className="text-2xl font-bold">組裝產品管理</h1>
        </div>
        <Link href="/products/new?type=assembly">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新增組裝產品
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>組裝產品列表</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-center py-4">尚無組裝產品資料</p>
          ) : (
            <DataTable columns={columns} data={products} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
