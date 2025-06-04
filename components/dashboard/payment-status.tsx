"use client"

import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, Clock } from "lucide-react"
import { useEffect, useState } from "react"

interface PaymentData {
  received: number
  pending: number
  overdue: number
  total: number
  receivedRate: number
  overdueRate: number
}

export function PaymentStatus() {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    received: 0,
    pending: 0,
    overdue: 0,
    total: 0,
    receivedRate: 0,
    overdueRate: 0,
  })

  useEffect(() => {
    const fetchPaymentData = async () => {
      // 模擬收款數據
      const mockData = {
        received: 2450000,
        pending: 680000,
        overdue: 125000,
        total: 3255000,
        receivedRate: 75.3,
        overdueRate: 3.8,
      }
      setPaymentData(mockData)
    }

    fetchPaymentData()
  }, [])

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* 總收款概況 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">已收款</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(paymentData.received)}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span>+12.5% 較上月</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">待收款</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{formatCurrency(paymentData.pending)}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingDown className="h-3 w-3 text-red-500" />
            <span>-5.2% 較上月</span>
          </div>
        </div>
      </div>

      {/* 收款率進度條 */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">收款率</span>
          <span className="text-sm text-muted-foreground">{paymentData.receivedRate}%</span>
        </div>
        <Progress value={paymentData.receivedRate} className="h-2" />
      </div>

      {/* 逾期款項 */}
      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-800">逾期款項</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(paymentData.overdue)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-red-600">佔總額 {paymentData.overdueRate}%</p>
            <p className="text-xs text-red-500">需要跟催</p>
          </div>
        </div>
      </div>

      {/* 本月收款目標 */}
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-800">本月目標</p>
            <p className="text-lg font-bold text-blue-600">$3,500,000</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-600">已達成 93%</p>
            <Progress value={93} className="h-1 w-16 mt-1" />
          </div>
        </div>
      </div>
    </div>
  )
}
