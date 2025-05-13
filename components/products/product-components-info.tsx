"use client"

import { useState, useEffect } from "react"
import { Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"

interface ProductComponentsInfoProps {
  isAssembly: boolean
  pidPartNo: any // 接受不同格式的 pid_part_no 數據
  customerId?: string // 產品的客戶ID
}

export function ProductComponentsInfo({ isAssembly, pidPartNo, customerId }: ProductComponentsInfoProps) {
  const [components, setComponents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchComponentDetails() {
      // 如果不是組合產品，不顯示任何內容
      if (!isAssembly) {
        setComponents([])
        setLoading(false)
        return
      }

      // 如果沒有 pid_part_no 數據，不顯示任何內容
      if (!pidPartNo) {
        setComponents([])
        setLoading(false)
        return
      }

      try {
        // 解析 pid_part_no 數據
        let partNumbers: string[] = []
        let partData: any[] = []

        if (Array.isArray(pidPartNo)) {
          partData = pidPartNo
          partNumbers = pidPartNo
            .map((item) => (typeof item === "string" ? item : item.part_number || ""))
            .filter(Boolean)
        } else if (typeof pidPartNo === "string") {
          try {
            const parsed = JSON.parse(pidPartNo)
            if (Array.isArray(parsed)) {
              partData = parsed
              partNumbers = parsed
                .map((item) => (typeof item === "string" ? item : item.part_number || ""))
                .filter(Boolean)
            } else if (parsed && typeof parsed === "object") {
              partData = [parsed]
              partNumbers = [parsed.part_number].filter(Boolean)
            }
          } catch (e) {
            // 如果不是 JSON 字符串，則假設它是單個部件編號
            if (pidPartNo.trim()) {
              partData = [{ part_number: pidPartNo.trim() }]
              partNumbers = [pidPartNo.trim()]
            }
          }
        } else if (pidPartNo && typeof pidPartNo === "object") {
          partData = [pidPartNo]
          if (pidPartNo.part_number) {
            partNumbers = [pidPartNo.part_number]
          }
        }

        if (partNumbers.length === 0) {
          setComponents([])
          setLoading(false)
          return
        }

        // 從數據庫中獲取部件詳細信息
        // 只使用 part_no 和 customer_id 進行查詢
        let query = supabase.from("products").select("part_no, component_name, customer_id").in("part_no", partNumbers)

        // 如果有客戶ID，則添加客戶ID過濾條件
        if (customerId) {
          query = query.eq("customer_id", customerId)
        }

        const { data, error } = await query

        if (error) {
          console.error("獲取部件詳細信息時出錯:", error)
          setComponents([])
        } else {
          // 將查詢結果與原始 pid_part_no 數據合併
          const mergedComponents = partNumbers.map((partNo) => {
            // 查找匹配的部件詳情，優先使用相同客戶ID的部件
            const componentDetails =
              data?.find((item) => item.part_no === partNo && item.customer_id === customerId) ||
              data?.find((item) => item.part_no === partNo) ||
              {}

            // 查找原始數據中的數量和其他信息
            let quantity = 1
            let description = ""

            const originalData = partData.find(
              (item) =>
                (typeof item === "string" && item === partNo) ||
                (item && typeof item === "object" && item.part_number === partNo),
            )

            if (originalData && typeof originalData === "object") {
              quantity = originalData.quantity || 1
              description = originalData.description || ""
            }

            return {
              partNo,
              name: componentDetails.component_name || description || "未知部件",
              customerId: componentDetails.customer_id || "-",
              quantity,
              description,
            }
          })

          setComponents(mergedComponents)
        }
      } catch (e) {
        console.error("處理部件數據時出錯:", e)
        setComponents([])
      } finally {
        setLoading(false)
      }
    }

    fetchComponentDetails()
  }, [isAssembly, pidPartNo, customerId, supabase])

  // 如果不是組合產品，不顯示任何內容
  if (!isAssembly) {
    return null
  }

  // 如果沒有組件數據，但是組合產品，顯示空狀態
  if (components.length === 0 && !loading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center">
            <Layers className="h-5 w-5 mr-2 text-purple-500" />
            組合產品部件資訊
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-24">
            <p className="text-muted-foreground">此組合產品尚未添加部件</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center">
          <Layers className="h-5 w-5 mr-2 text-purple-500" />
          組合產品部件資訊
          <Badge className="ml-2 bg-purple-500">共 {components.length} 個部件</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-24">
            <p className="text-muted-foreground">載入部件資訊中...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>部件編號</TableHead>
                <TableHead>部件名稱</TableHead>
                <TableHead>數量</TableHead>
                <TableHead>客戶</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {components.map((component, index) => (
                <TableRow key={`component-${index}-${component.partNo}`}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/products/all/${encodeURIComponent(component.partNo)}`}
                      className="text-blue-600 hover:underline"
                    >
                      {component.partNo}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {component.name}
                    {component.description && component.description !== component.name && (
                      <span className="text-xs text-gray-500 block">{component.description}</span>
                    )}
                  </TableCell>
                  <TableCell>{component.quantity}</TableCell>
                  <TableCell>{component.customerId}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
