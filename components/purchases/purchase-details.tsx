"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// 狀態顏色映射
const statusColorMap: Record<string, string> = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
}

// 狀態顯示名稱映射
const statusDisplayMap: Record<string, string> = {
  pending: "待確認",
  processing: "進行中",
  completed: "已完成",
  cancelled: "已取消",
}

interface PurchaseDetailsProps {
  purchase: any
}

export function PurchaseDetails({ purchase }: PurchaseDetailsProps) {
  // 格式化金額顯示
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("zh-TW", { style: "currency", currency }).format(amount)
  }

  // 格式化日期顯示
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "未設定"
    return new Date(dateString).toLocaleDateString("zh-TW")
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">採購單資訊</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">採購單編號:</span>
                <span className="font-medium">{purchase.purchase_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">發出日期:</span>
                <span>{formatDate(purchase.issue_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">預期交期:</span>
                <span>{formatDate(purchase.expected_delivery_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">實際交期:</span>
                <span>{formatDate(purchase.actual_delivery_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">狀態:</span>
                <Badge className={`${statusColorMap[purchase.status] || "bg-gray-500"} text-white`}>
                  {statusDisplayMap[purchase.status] || purchase.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">總金額:</span>
                <span className="font-medium">{formatAmount(purchase.total_amount, purchase.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">已付金額:</span>
                <span>{formatAmount(purchase.paid_amount || 0, purchase.currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">供應商資訊</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">供應商名稱:</span>
                <span className="font-medium">{purchase.supplier_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">供應商ID:</span>
                <span>{purchase.supplier_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">付款條件:</span>
                <span>{purchase.payment_term || "未設定"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">交貨條件:</span>
                <span>{purchase.delivery_term || "未設定"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">關聯訂單:</span>
                <span>
                  {purchase.order_id ? (
                    <a href={`/orders/${purchase.order_id}`} className="text-blue-600 hover:underline">
                      {purchase.order_id}
                    </a>
                  ) : (
                    "無關聯訂單"
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {purchase.notes && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-2">備註</h3>
            <p className="whitespace-pre-line">{purchase.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
