"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2 } from "lucide-react"

interface ProductAssemblyDetailsProps {
  productId: string
}

interface ComponentPart {
  part_number: string
  description: string
  component_name?: string
  quantity?: number
}

export function ProductAssemblyDetails({ productId }: ProductAssemblyDetailsProps) {
  const [components, setComponents] = useState<ComponentPart[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchAssemblyDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        // 獲取產品資料
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("pid_part_no")
          .eq("part_no", productId)
          .single()

        if (productError) {
          throw new Error(`獲取產品資料時出錯: ${productError.message}`)
        }

        if (!product || !product.pid_part_no) {
          setComponents([])
          return
        }

        // 解析組合部件
        let componentParts: ComponentPart[] = []
        if (typeof product.pid_part_no === "string") {
          try {
            componentParts = JSON.parse(product.pid_part_no)
          } catch (e) {
            console.error("解析組合部件時出錯:", e)
            componentParts = []
          }
        } else if (Array.isArray(product.pid_part_no)) {
          componentParts = product.pid_part_no
        }

        // 獲取所有部件的詳細資訊
        if (componentParts.length > 0) {
          const partNumbers = componentParts
            .map((part) => (typeof part === "string" ? part : part.part_number))
            .filter(Boolean)

          if (partNumbers.length > 0) {
            const { data: partsData, error: partsError } = await supabase
              .from("products")
              .select("part_no, component_name")
              .in("part_no", partNumbers)

            if (partsError) {
              console.warn("獲取部件詳細資訊時出錯:", partsError)
            } else if (partsData) {
              // 將部件詳細資訊合併到組件列表中
              componentParts = componentParts.map((part) => {
                const partNo = typeof part === "string" ? part : part.part_number
                const partData = partsData.find((p) => p.part_no === partNo)

                if (typeof part === "string") {
                  return {
                    part_number: part,
                    description: "",
                    component_name: partData?.component_name || "",
                  }
                }

                return {
                  ...part,
                  component_name: partData?.component_name || "",
                }
              })
            }
          }
        }

        setComponents(componentParts)
      } catch (err) {
        console.error("獲取組合詳情時出錯:", err)
        setError(err instanceof Error ? err.message : "獲取組合詳情時出錯")
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchAssemblyDetails()
    }
  }, [productId, supabase])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>
  }

  if (components.length === 0) {
    return <div className="text-gray-500 py-4">此產品沒有組合部件資訊</div>
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">部件編號</th>
              <th className="border px-4 py-2 text-left">部件名稱</th>
              <th className="border px-4 py-2 text-left">部件描述</th>
            </tr>
          </thead>
          <tbody>
            {components.map((component, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{component.part_number}</td>
                <td className="border px-4 py-2">{component.component_name || "-"}</td>
                <td className="border px-4 py-2">{component.description || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
