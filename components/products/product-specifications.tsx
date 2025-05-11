"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabaseClient } from "@/lib/supabase-client"

interface Specification {
  name: string
  value: string
}

interface ProductSpecificationsProps {
  specifications?: Specification[]
  productId?: string
}

export function ProductSpecifications({ specifications, productId }: ProductSpecificationsProps) {
  const [specs, setSpecs] = useState<Specification[]>(specifications || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 如果直接提供了specifications，就不需要從Supabase獲取
    if (specifications) {
      setSpecs(specifications)
      return
    }

    // 如果提供了productId，則從Supabase獲取規格數據
    if (productId) {
      const fetchSpecifications = async () => {
        try {
          setLoading(true)
          setError(null)

          // 從products表獲取specifications字段
          const { data, error } = await supabaseClient
            .from("products")
            .select("specifications")
            .eq("part_no", productId)
            .single()

          if (error) {
            throw new Error(`獲取產品規格時出錯: ${error.message}`)
          }

          // 處理從products表獲取的specifications
          let parsedSpecs: Specification[] = []
          if (data && data.specifications) {
            try {
              if (typeof data.specifications === "string") {
                parsedSpecs = JSON.parse(data.specifications)
              } else if (Array.isArray(data.specifications)) {
                parsedSpecs = data.specifications
              } else if (typeof data.specifications === "object") {
                // 如果是對象格式，轉換為數組格式
                parsedSpecs = Object.entries(data.specifications).map(([name, value]) => ({
                  name,
                  value: String(value),
                }))
              }
            } catch (e) {
              console.error("解析產品規格時出錯:", e)
            }
          }

          setSpecs(parsedSpecs)
        } catch (err) {
          console.error("獲取產品規格時出錯:", err)
          setError(err instanceof Error ? err.message : "獲取產品規格時出錯")
        } finally {
          setLoading(false)
        }
      }

      fetchSpecifications()
    }
  }, [specifications, productId])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <p>載入中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-24">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">規格名稱</TableHead>
            <TableHead>規格值</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {specs && specs.length > 0 ? (
            specs.map((spec, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{spec.name}</TableCell>
                <TableCell>{spec.value}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="h-24 text-center">
                沒有規格資料
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
