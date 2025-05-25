"use client"

import type React from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2 } from "lucide-react"

interface Customer {
  customer_id: string
  customer_full_name: string
  customer_short_name?: string
  payment_due_date?: string
  currency?: string
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
  setCustomOrderNumber: (customOrderNumber: string) => void
  useCustomOrderNumber: boolean
  setUseCustomOrderNumber: (useCustomOrderNumber: boolean) => void
  isProductSettingsConfirmed: boolean
  setOrderNumberStatus: (status: string) => void
  setOrderNumberMessage: (message: string) => void
  orderItems?: any[]
  paymentTerm: string
  setPaymentTerm: (term: string) => void
  deliveryTerms: string
  setDeliveryTerms: (terms: string) => void
  isLoadingOrderNumber: boolean
  generateNewOrderNumber: () => void
}

const CustomerSelection: React.FC<CustomerSelectionProps> = ({
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
  paymentTerm,
  setPaymentTerm,
  deliveryTerms,
  setDeliveryTerms,
  isLoadingOrderNumber,
  generateNewOrderNumber,
}) => {
  const isLocked = isProductSettingsConfirmed || (orderItems && orderItems.length > 0)

  const getCustomerDisplayName = (customer: Customer) => {
    return customer.customer_full_name || customer.customer_short_name || `客戶 ${customer.customer_id}`
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 訂單編號 - 第一個 */}
        <div className="space-y-2">
          <Label htmlFor="orderNumber" className="text-sm font-medium">
            訂單編號 <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="orderNumber"
              value={useCustomOrderNumber ? customOrderNumber : orderNumber}
              onChange={(e) => {
                if (useCustomOrderNumber) {
                  setCustomOrderNumber(e.target.value)
                } else {
                  setOrderNumber(e.target.value)
                }
                setOrderNumberStatus("idle")
                setOrderNumberMessage("")
              }}
              placeholder="請輸入訂單編號"
              disabled={isLocked}
              required
              className={isLocked ? "bg-gray-100" : ""}
            />
            {!useCustomOrderNumber && !isLocked && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateNewOrderNumber}
                disabled={isLoadingOrderNumber}
                className="px-3"
              >
                {isLoadingOrderNumber ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="useCustomOrderNumber"
              checked={useCustomOrderNumber}
              onCheckedChange={setUseCustomOrderNumber}
              disabled={isLocked}
            />
            <Label htmlFor="useCustomOrderNumber" className="text-sm">
              使用自定義訂單編號
            </Label>
          </div>
        </div>

        {/* 客戶PO編號 - 第二個 */}
        <div className="space-y-2">
          <Label htmlFor="poNumber" className="text-sm font-medium">
            客戶PO編號 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="poNumber"
            value={poNumber}
            onChange={(e) => setPoNumber(e.target.value)}
            placeholder="請輸入客戶PO編號"
            disabled={isLocked}
            required
            className={isLocked ? "bg-gray-100" : ""}
          />
        </div>

        {/* 客戶選擇 - 第三個 */}
        <div className="space-y-2">
          <Label htmlFor="customer" className="text-sm font-medium">
            客戶 <span className="text-red-500">*</span>
          </Label>
          <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId} disabled={isLocked} required>
            <SelectTrigger className={isLocked ? "bg-gray-100" : ""}>
              <SelectValue placeholder="選擇客戶" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.customer_id} value={customer.customer_id}>
                  {getCustomerDisplayName(customer)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 付款條件和交付條件 - 第二行 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="paymentTerm" className="text-sm font-medium">
            付款條件
          </Label>
          <Input
            id="paymentTerm"
            value={paymentTerm}
            onChange={(e) => setPaymentTerm(e.target.value)}
            placeholder="付款條件"
            disabled={isLocked}
            className={isLocked ? "bg-gray-100" : ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deliveryTerms" className="text-sm font-medium">
            交付條件
          </Label>
          <Input
            id="deliveryTerms"
            value={deliveryTerms}
            onChange={(e) => setDeliveryTerms(e.target.value)}
            placeholder="交付條件"
            disabled={isLocked}
            className={isLocked ? "bg-gray-100" : ""}
          />
        </div>
      </div>

      {/* 鎖定狀態提示 */}
      {isLocked && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-sm text-yellow-800">📌 已添加產品，客戶資訊已鎖定。如需修改客戶，請先清除所有產品。</p>
        </div>
      )}
    </div>
  )
}

export { CustomerSelection }
export default CustomerSelection
