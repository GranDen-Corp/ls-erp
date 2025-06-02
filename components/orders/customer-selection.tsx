"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DatePicker } from "@/components/ui/date-picker"
import { CustomerCombobox } from "@/components/ui/customer-combobox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LucideUser,
  LucideMapPin,
  LucideRefreshCw,
  LucideLoader2,
  LucideCheck,
  LucideShip,
  LucidePlus,
} from "lucide-react"

interface Customer {
  customer_id: string
  customer_full_name: string
  customer_short_name?: string
  payment_terms_specification?: string
  trade_terms_specification?: string
  currency?: string
  port_of_discharge_default?: string
}

interface OrderItem {
  id: string
  productPartNo: string
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  isAssembly: boolean
  shipmentBatches?: any[]
}

interface Port {
  un_locode: string
  port_name_en: string
  port_name_zh: string
  port_type?: string
}

interface CustomerSelectionProps {
  customers: Customer[]
  selectedCustomerId: string
  setSelectedCustomerId: (customerId: string) => void
  poNumber: string
  setPoNumber: (poNumber: string) => void
  orderNumber: string
  setOrderNumber: (orderNumber: string) => void
  customOrderNumber: string
  setCustomOrderNumber: (orderNumber: string) => void
  useCustomOrderNumber: boolean
  setUseCustomOrderNumber: (use: boolean) => void
  isProductSettingsConfirmed: boolean
  setOrderNumberStatus: (status: string) => void
  setOrderNumberMessage: (message: string) => void
  orderItems: OrderItem[]
  paymentTerms: string
  setPaymentTerms: (terms: string) => void
  tradeTerms: string
  setTradeTerms: (terms: string) => void
  isLoadingOrderNumber: boolean
  generateNewOrderNumber: () => void
  portOfLoading: string
  setPortOfLoading: (port: string) => void
  portOfDischarge: string
  setPortOfDischarge: (port: string) => void
  ports: Port[]
  onCreateOrder?: () => Promise<any>
  isCreatingOrder?: boolean
  orderCreated?: boolean
  getPortDisplayName: (unLocode: string) => string
  deliveryDate?: Date
  setDeliveryDate?: (date: Date | undefined) => void
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
  portOfLoading,
  setPortOfLoading,
  portOfDischarge,
  setPortOfDischarge,
  ports,
  onCreateOrder,
  isCreatingOrder = false,
  orderCreated = false,
  getPortDisplayName,
  deliveryDate = new Date(),
  setDeliveryDate = () => {},
}: CustomerSelectionProps) {
  const [localOrderNumber, setLocalOrderNumber] = useState(orderNumber)
  const [localCustomOrderNumber, setLocalCustomOrderNumber] = useState(customOrderNumber)

  // 同步外部狀態變化
  useEffect(() => {
    setLocalOrderNumber(orderNumber)
  }, [orderNumber])

  useEffect(() => {
    setLocalCustomOrderNumber(customOrderNumber)
  }, [customOrderNumber])

  // 處理訂單編號變更
  const handleOrderNumberChange = (value: string) => {
    setLocalOrderNumber(value)
    setOrderNumber(value)
  }

  const handleCustomOrderNumberChange = (value: string) => {
    setLocalCustomOrderNumber(value)
    setCustomOrderNumber(value)
  }

  // 獲取客戶資訊
  const selectedCustomer = customers.find((c) => c.customer_id === selectedCustomerId)

  // 分類港口
  const mainLoadingPorts = ports.filter((port) => port.port_type === "主要出貨港")
  const secondaryLoadingPorts = ports.filter((port) => port.port_type === "次要出貨港")
  const mainDischargePorts = ports.filter((port) => port.port_type === "主要到貨港")
  const secondaryDischargePorts = ports.filter((port) => port.port_type === "次要到貨港")
  const otherPorts = ports.filter((port) => !port.port_type || port.port_type === "其他")

  // 處理創建訂單
  const handleCreateOrder = async () => {
    if (onCreateOrder) {
      try {
        await onCreateOrder()
      } catch (error) {
        console.error("創建訂單失敗:", error)
      }
    }
  }

  // 獲取今日日期（用於限制最小選擇日期）
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LucideUser className="h-5 w-5" />
          客戶與訂單基本資訊
        </CardTitle>
        <CardDescription>請選擇客戶並填寫訂單基本資訊</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 客戶選擇 */}
        <div className="space-y-2">
          <Label htmlFor="customer">客戶選擇 *</Label>
          <CustomerCombobox
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onCustomerChange={setSelectedCustomerId}
            disabled={isProductSettingsConfirmed}
          />
          {selectedCustomer && (
            <div className="text-sm text-muted-foreground">
              幣別: {selectedCustomer.currency || "USD"} | 付款條件:{" "}
              {selectedCustomer.payment_terms_specification || "未設定"} | 交貨條件:{" "}
              {selectedCustomer.trade_terms_specification || "未設定"}
            </div>
          )}
        </div>

        {/* 客戶PO編號 */}
        <div className="space-y-2">
          <Label htmlFor="po-number">客戶PO編號 *</Label>
          <Input
            id="po-number"
            value={poNumber}
            onChange={(e) => setPoNumber(e.target.value)}
            placeholder="請輸入客戶PO編號"
            disabled={isProductSettingsConfirmed}
          />
        </div>

        {/* 訂單編號和交貨日期 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 訂單編號 */}
          <div className="space-y-2">
            <Label htmlFor="order-number">訂單編號 *</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="order-number"
                  value={useCustomOrderNumber ? localCustomOrderNumber : localOrderNumber}
                  onChange={(e) =>
                    useCustomOrderNumber
                      ? handleCustomOrderNumberChange(e.target.value)
                      : handleOrderNumberChange(e.target.value)
                  }
                  placeholder={useCustomOrderNumber ? "請輸入自訂訂單編號" : "系統自動生成"}
                  disabled={isProductSettingsConfirmed || (!useCustomOrderNumber && isLoadingOrderNumber)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={generateNewOrderNumber}
                disabled={useCustomOrderNumber || isLoadingOrderNumber || isProductSettingsConfirmed}
                title="重新生成訂單編號"
              >
                {isLoadingOrderNumber ? (
                  <LucideLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LucideRefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="use-custom-order-number"
                checked={useCustomOrderNumber}
                onChange={(e) => setUseCustomOrderNumber(e.target.checked)}
                disabled={isProductSettingsConfirmed}
                className="rounded"
              />
              <Label htmlFor="use-custom-order-number" className="text-sm">
                使用自訂訂單編號
              </Label>
            </div>
          </div>

          {/* 交貨日期 */}
          <div className="space-y-2">
            <Label htmlFor="delivery-date">預期(期望)交貨日期 *</Label>
            <DatePicker
              date={deliveryDate}
              onDateChange={setDeliveryDate}
              placeholder="選擇交貨日期"
              disabled={isProductSettingsConfirmed}
              className="w-full"
              fromDate={today} // 限制只能選擇今日之後的日期
            />
            <p className="text-xs text-muted-foreground">設定預期交貨日期，只能選擇今日或之後的日期</p>
          </div>
        </div>

        {/* 港口資訊 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 出貨港 */}
          <div className="space-y-2">
            <Label htmlFor="port-of-loading">出貨港 *</Label>
            <Select value={portOfLoading} onValueChange={setPortOfLoading} disabled={isProductSettingsConfirmed}>
              <SelectTrigger>
                <SelectValue placeholder="選擇出貨港" />
              </SelectTrigger>
              <SelectContent>
                {mainLoadingPorts.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">主要出貨港</div>
                    {mainLoadingPorts.map((port) => (
                      <SelectItem key={port.un_locode} value={port.un_locode}>
                        <div className="flex items-center gap-2">
                          <LucideShip className="h-4 w-4" />
                          <span>{port.port_name_en}</span>
                          <span className="text-muted-foreground">({port.port_name_zh})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
                {secondaryLoadingPorts.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">次要出貨港</div>
                    {secondaryLoadingPorts.map((port) => (
                      <SelectItem key={port.un_locode} value={port.un_locode}>
                        <div className="flex items-center gap-2">
                          <LucideMapPin className="h-4 w-4" />
                          <span>{port.port_name_en}</span>
                          <span className="text-muted-foreground">({port.port_name_zh})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
                {otherPorts.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">其他港口</div>
                    {otherPorts.map((port) => (
                      <SelectItem key={port.un_locode} value={port.un_locode}>
                        <div className="flex items-center gap-2">
                          <LucideMapPin className="h-4 w-4" />
                          <span>{port.port_name_en}</span>
                          <span className="text-muted-foreground">({port.port_name_zh})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* 到貨港 */}
          <div className="space-y-2">
            <Label htmlFor="port-of-discharge">到貨港 *</Label>
            <Select value={portOfDischarge} onValueChange={setPortOfDischarge} disabled={isProductSettingsConfirmed}>
              <SelectTrigger>
                <SelectValue placeholder="選擇到貨港" />
              </SelectTrigger>
              <SelectContent>
                {mainDischargePorts.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">主要到貨港</div>
                    {mainDischargePorts.map((port) => (
                      <SelectItem key={port.un_locode} value={port.un_locode}>
                        <div className="flex items-center gap-2">
                          <LucideShip className="h-4 w-4" />
                          <span>{port.port_name_en}</span>
                          <span className="text-muted-foreground">({port.port_name_zh})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
                {secondaryDischargePorts.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">次要到貨港</div>
                    {secondaryDischargePorts.map((port) => (
                      <SelectItem key={port.un_locode} value={port.un_locode}>
                        <div className="flex items-center gap-2">
                          <LucideMapPin className="h-4 w-4" />
                          <span>{port.port_name_en}</span>
                          <span className="text-muted-foreground">({port.port_name_zh})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
                {otherPorts.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">其他港口</div>
                    {otherPorts.map((port) => (
                      <SelectItem key={port.un_locode} value={port.un_locode}>
                        <div className="flex items-center gap-2">
                          <LucideMapPin className="h-4 w-4" />
                          <span>{port.port_name_en}</span>
                          <span className="text-muted-foreground">({port.port_name_zh})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 付款條件和交貨條件 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="payment-terms">付款條件 *</Label>
            <Input
              id="payment-terms"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="請輸入付款條件"
              disabled={isProductSettingsConfirmed}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trade-terms">交貨條件 *</Label>
            <Input
              id="trade-terms"
              value={tradeTerms}
              onChange={(e) => setTradeTerms(e.target.value)}
              placeholder="請輸入交貨條件"
              disabled={isProductSettingsConfirmed}
            />
          </div>
        </div>

        {/* 訂單狀態顯示 */}
        {orderItems.length > 0 && (
          <Alert>
            <LucideCheck className="h-4 w-4" />
            <AlertDescription>
              已添加 {orderItems.length} 個產品到訂單中。
              {isProductSettingsConfirmed && " 產品設定已確認。"}
            </AlertDescription>
          </Alert>
        )}

        {/* 創建訂單按鈕 */}
        {!orderCreated && onCreateOrder && (
          <div className="flex justify-end">
            <Button
              onClick={handleCreateOrder}
              disabled={
                isCreatingOrder ||
                !selectedCustomerId ||
                !poNumber.trim() ||
                !portOfLoading ||
                !portOfDischarge ||
                !paymentTerms.trim() ||
                !tradeTerms.trim() ||
                !deliveryDate
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreatingOrder ? (
                <>
                  <LucideLoader2 className="h-4 w-4 mr-2 animate-spin" />
                  正在建立訂單...
                </>
              ) : (
                <>
                  <LucidePlus className="h-4 w-4 mr-2" />
                  開立訂單
                </>
              )}
            </Button>
          </div>
        )}

        {/* 訂單已創建提示 */}
        {orderCreated && (
          <Alert className="bg-green-50 border-green-200">
            <LucideCheck className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              訂單已成功建立！現在可以繼續添加產品和設定採購資料。
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
