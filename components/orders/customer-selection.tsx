"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import {
  LucideUser,
  LucideRefreshCw,
  LucideCheck,
  LucideAlertCircle,
  LucideLoader2,
  LucideCreditCard,
  LucideTruck,
} from "lucide-react"

interface Customer {
  customer_id: string
  customer_full_name: string
  customer_short_name?: string
  payment_due_date?: string
  payment_terms_specification?: string // 新增欄位
  trade_terms_specification?: string // 新增欄位
  currency?: string
  customer_address?: string
  customer_phone?: string
  customer_fax?: string
  invoice_email?: string
  sales_representative?: string
  group_code?: string
  division_location?: string
  exchange_rate?: number
}

interface CustomerSelectionProps {
  customers: Customer[]
  selectedCustomerId: string
  setSelectedCustomerId: (id: string) => void
  poNumber: string
  setPoNumber: (value: string) => void
  orderNumber: string
  setOrderNumber: (value: string) => void
  customOrderNumber: string
  setCustomOrderNumber: (value: string) => void
  useCustomOrderNumber: boolean
  setUseCustomOrderNumber: (value: boolean) => void
  isProductSettingsConfirmed: boolean
  setOrderNumberStatus: (status: string) => void
  setOrderNumberMessage: (message: string) => void
  orderItems: any[]
  paymentTerms: string
  setPaymentTerms: (value: string) => void
  tradeTerms: string
  setTradeTerms: (value: string) => void
  isLoadingOrderNumber: boolean
  generateNewOrderNumber: () => void
}

export default function CustomerSelection({
  customers,
  selectedCustomerId,
  setSelectedCustomerId,
  poNumber,
  setPoNumber,
  orderNumber,
  setOrderNumber,
  customOrderNumber,
  setCustomOrderNumber,
  useCustomOrderNumber,
  setUseCustomOrderNumber,
  isProductSettingsConfirmed,
  setOrderNumberStatus,
  setOrderNumberMessage,
  orderItems,
  paymentTerms,
  setPaymentTerms,
  tradeTerms,
  setTradeTerms,
  isLoadingOrderNumber,
  generateNewOrderNumber,
}: CustomerSelectionProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // 當選擇客戶時更新客戶資訊和條件
  useEffect(() => {
    if (selectedCustomerId) {
      const customer = customers.find((c) => c.customer_id === selectedCustomerId)
      if (customer) {
        setSelectedCustomer(customer)
        // 自動填入客戶的付款和交付條件規格
        setPaymentTerms(customer.payment_terms_specification || customer.payment_due_date || "")
        setTradeTerms(customer.trade_terms_specification || "")
      }
    } else {
      setSelectedCustomer(null)
      setPaymentTerms("")
      setTradeTerms("")
    }
  }, [selectedCustomerId, customers, setPaymentTerms, setTradeTerms])

  const handleCustomerChange = (customerId: string) => {
    if (isProductSettingsConfirmed && orderItems.length > 0) {
      // 如果已經確認產品設定且有產品，不允許更改客戶
      return
    }
    setSelectedCustomerId(customerId)
  }

  const handleOrderNumberToggle = () => {
    setUseCustomOrderNumber(!useCustomOrderNumber)
    if (!useCustomOrderNumber) {
      // 切換到自訂編號時，清空自訂編號
      setCustomOrderNumber("")
    } else {
      // 切換到自動生成時，重新生成編號
      generateNewOrderNumber()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LucideUser className="h-5 w-5" />
          客戶與訂單基本資訊
        </CardTitle>
        <CardDescription>選擇客戶並設定訂單基本資訊</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 客戶選擇 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer">客戶選擇 *</Label>
            <Select
              value={selectedCustomerId}
              onValueChange={handleCustomerChange}
              disabled={isProductSettingsConfirmed && orderItems.length > 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="請選擇客戶" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.customer_id} value={customer.customer_id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{customer.customer_full_name}</span>
                      {customer.customer_short_name && (
                        <span className="text-sm text-muted-foreground">{customer.customer_short_name}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isProductSettingsConfirmed && orderItems.length > 0 && (
              <p className="text-xs text-muted-foreground">產品設定確認後無法更改客戶</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="po-number">客戶 PO 編號 *</Label>
            <Input
              id="po-number"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="請輸入客戶 PO 編號"
              disabled={isProductSettingsConfirmed}
            />
          </div>
        </div>

        {/* 客戶詳細資訊 */}
        {selectedCustomer && (
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-blue-900">客戶資訊</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">客戶全名：</span>
                <span>{selectedCustomer.customer_full_name}</span>
              </div>
              {selectedCustomer.customer_short_name && (
                <div>
                  <span className="font-medium">客戶簡稱：</span>
                  <span>{selectedCustomer.customer_short_name}</span>
                </div>
              )}
              <div>
                <span className="font-medium">幣別：</span>
                <Badge variant="outline">{selectedCustomer.currency || "USD"}</Badge>
              </div>
              {selectedCustomer.sales_representative && (
                <div>
                  <span className="font-medium">業務代表：</span>
                  <span>{selectedCustomer.sales_representative}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 訂單編號設定 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>訂單編號設定</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOrderNumberToggle}
                disabled={isProductSettingsConfirmed}
              >
                {useCustomOrderNumber ? "使用自動生成" : "使用自訂編號"}
              </Button>
              {!useCustomOrderNumber && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateNewOrderNumber}
                  disabled={isLoadingOrderNumber || isProductSettingsConfirmed}
                >
                  {isLoadingOrderNumber ? (
                    <LucideLoader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LucideRefreshCw className="h-4 w-4" />
                  )}
                  重新生成
                </Button>
              )}
            </div>
          </div>

          {useCustomOrderNumber ? (
            <div className="space-y-2">
              <Label htmlFor="custom-order-number">自訂訂單編號</Label>
              <Input
                id="custom-order-number"
                value={customOrderNumber}
                onChange={(e) => setCustomOrderNumber(e.target.value)}
                placeholder="請輸入自訂訂單編號"
                disabled={isProductSettingsConfirmed}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>系統生成訂單編號</Label>
              <div className="flex items-center gap-2">
                <Input value={orderNumber} disabled className="bg-gray-50" />
                {orderNumber && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <LucideCheck className="h-3 w-3 mr-1" />
                    已生成
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 付款和交付條件 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="payment-terms" className="flex items-center gap-2">
              <LucideCreditCard className="h-4 w-4" />
              付款條件
            </Label>
            <Textarea
              id="payment-terms"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="請輸入付款條件"
              disabled={isProductSettingsConfirmed}
              rows={3}
            />
            {selectedCustomer?.payment_terms_specification && (
              <p className="text-xs text-muted-foreground">客戶預設：{selectedCustomer.payment_terms_specification}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="trade-terms" className="flex items-center gap-2">
              <LucideTruck className="h-4 w-4" />
              交付條件
            </Label>
            <Textarea
              id="trade-terms"
              value={tradeTerms}
              onChange={(e) => setTradeTerms(e.target.value)}
              placeholder="請輸入交付條件"
              disabled={isProductSettingsConfirmed}
              rows={3}
            />
            {selectedCustomer?.trade_terms_specification && (
              <p className="text-xs text-muted-foreground">客戶預設：{selectedCustomer.trade_terms_specification}</p>
            )}
          </div>
        </div>

        {/* 驗證提示 */}
        {(!selectedCustomerId || !poNumber) && (
          <Alert>
            <LucideAlertCircle className="h-4 w-4" />
            <AlertDescription>請選擇客戶並填寫客戶 PO 編號後才能繼續添加產品。</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
