"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"

interface PurchaseItem {
  item_sid: number
  purchase_sid: number
  product_part_no: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  expected_delivery_date: string | null
  actual_delivery_date: string | null
  status: string
  notes: string | null
}

interface PurchaseItemsProps {
  items: PurchaseItem[]
  currency: string
}

export function PurchaseItems({ items, currency }: PurchaseItemsProps) {
  // 格式化金額顯示
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("zh-TW", { style: "currency", currency }).format(amount)
  }

  // 格式化日期顯示
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "未設定"
    return new Date(dateString).toLocaleDateString("zh-TW")
  }

  // 計算總金額
  const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0)

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>產品編號</TableHead>
              <TableHead>產品名稱</TableHead>
              <TableHead className="text-right">數量</TableHead>
              <TableHead className="text-right">單價</TableHead>
              <TableHead className="text-right">總價</TableHead>
              <TableHead>預期交期</TableHead>
              <TableHead>實際交期</TableHead>
              <TableHead>狀態</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  沒有採購項目資料
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.item_sid}>
                  <TableCell className="font-medium">{item.product_part_no}</TableCell>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatAmount(item.unit_price)}</TableCell>
                  <TableCell className="text-right">{formatAmount(item.total_price)}</TableCell>
                  <TableCell>{formatDate(item.expected_delivery_date)}</TableCell>
                  <TableCell>{formatDate(item.actual_delivery_date)}</TableCell>
                  <TableCell>{item.status}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">總計:</span>
            <span className="text-xl font-bold">{formatAmount(totalAmount)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
