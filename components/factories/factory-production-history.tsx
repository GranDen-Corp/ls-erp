"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface FactoryProductionHistoryProps {
  factoryId: string
}

// 模擬生產歷史數據
const mockProductionHistory = [
  {
    id: "PO-2023-001",
    product: "鋼珠軸承 #5678",
    quantity: 5000,
    startDate: "2023-01-15",
    endDate: "2023-02-10",
    status: "completed",
  },
  {
    id: "PO-2023-002",
    product: "滾針軸承 #1234",
    quantity: 3000,
    startDate: "2023-02-20",
    endDate: "2023-03-15",
    status: "completed",
  },
  {
    id: "PO-2023-003",
    product: "圓錐軸承 #9012",
    quantity: 2000,
    startDate: "2023-04-05",
    endDate: "2023-05-01",
    status: "completed",
  },
  {
    id: "PO-2023-004",
    product: "角接觸軸承 #3456",
    quantity: 1500,
    startDate: "2023-05-10",
    endDate: "2023-06-05",
    status: "completed",
  },
  {
    id: "PO-2023-005",
    product: "推力軸承 #7890",
    quantity: 1000,
    startDate: "2023-06-15",
    endDate: null,
    status: "in-progress",
  },
]

export function FactoryProductionHistory({ factoryId }: FactoryProductionHistoryProps) {
  // 格式化日期
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("zh-TW")
  }

  // 獲取狀態顯示
  const getStatusDisplay = (status: string) => {
    if (status === "completed") return { label: "已完成", variant: "default" as const }
    if (status === "in-progress") return { label: "進行中", variant: "secondary" as const }
    return { label: status, variant: "outline" as const }
  }

  return (
    <>
      <Alert variant="warning" className="mb-4">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>開發中功能</AlertTitle>
        <AlertDescription>目前顯示的是模擬數據。此功能正在開發中，未來將與實際生產數據整合。</AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>生產歷史</CardTitle>
          <CardDescription>供應商 {factoryId} 的生產訂單歷史記錄</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>訂單編號</TableHead>
                <TableHead>產品</TableHead>
                <TableHead>數量</TableHead>
                <TableHead>開始日期</TableHead>
                <TableHead>完成日期</TableHead>
                <TableHead>狀態</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProductionHistory.map((record) => {
                const status = getStatusDisplay(record.status)
                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.id}</TableCell>
                    <TableCell>{record.product}</TableCell>
                    <TableCell>{record.quantity.toLocaleString()}</TableCell>
                    <TableCell>{formatDate(record.startDate)}</TableCell>
                    <TableCell>{formatDate(record.endDate)}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
