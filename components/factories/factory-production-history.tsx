"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// 模擬生產歷史數據
const productionHistory = [
  {
    id: "BATCH-2023-001",
    date: "2023-06-15",
    product: "電子零件A",
    quantity: 5000,
    status: "completed",
    defectRate: 0.5,
  },
  {
    id: "BATCH-2023-002",
    date: "2023-07-22",
    product: "電子零件B",
    quantity: 3000,
    status: "completed",
    defectRate: 0.8,
  },
  {
    id: "BATCH-2023-003",
    date: "2023-08-10",
    product: "電子零件C",
    quantity: 8000,
    status: "processing",
    defectRate: 0.3,
  },
  {
    id: "BATCH-2023-004",
    date: "2023-09-05",
    product: "電子零件D",
    quantity: 2000,
    status: "pending",
    defectRate: null,
  },
]

// 生產狀態對應的 Badge 樣式
const statusStyles: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  completed: { label: "已完成", variant: "default" },
  processing: { label: "生產中", variant: "secondary" },
  pending: { label: "待生產", variant: "outline" },
  cancelled: { label: "已取消", variant: "destructive" },
}

export function FactoryProductionHistory({ factoryId }: { factoryId: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        {productionHistory.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">此工廠尚無生產記錄</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>批次編號</TableHead>
                <TableHead>日期</TableHead>
                <TableHead>產品</TableHead>
                <TableHead>數量</TableHead>
                <TableHead>不良率</TableHead>
                <TableHead>狀態</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productionHistory.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">
                    <Link href={`/shipments/batches/${batch.id}`} className="text-blue-600 hover:underline">
                      {batch.id}
                    </Link>
                  </TableCell>
                  <TableCell>{batch.date}</TableCell>
                  <TableCell>{batch.product}</TableCell>
                  <TableCell>{batch.quantity.toLocaleString()}</TableCell>
                  <TableCell>{batch.defectRate !== null ? `${(batch.defectRate * 100).toFixed(1)}%` : "-"}</TableCell>
                  <TableCell>
                    <Badge variant={statusStyles[batch.status].variant}>{statusStyles[batch.status].label}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
