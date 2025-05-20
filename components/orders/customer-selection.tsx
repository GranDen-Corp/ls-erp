"use client"
import { AlertCircle, Loader2, CheckCircle, XCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import type { Customer } from "@/hooks/use-order-form"

interface CustomerSelectionProps {
  customers: Customer[]
  selectedCustomerId: string
  setSelectedCustomerId: (id: string) => void
  poNumber: string
  setPoNumber: (value: string) => void
  paymentTerm: string
  setPaymentTerm: (value: string) => void
  deliveryTerms: string
  setDeliveryTerms: (value: string) => void
  orderNumber: string
  isLoadingOrderNumber: boolean
  customOrderNumber: string
  setCustomOrderNumber: (value: string) => void
  useCustomOrderNumber: boolean
  setUseCustomOrderNumber: (value: boolean) => void
  isCheckingOrderNumber: boolean
  orderNumberStatus: "idle" | "valid" | "invalid" | "checking"
  orderNumberMessage: string
  checkOrderNumberDuplicate: () => void
  isProductSettingsConfirmed: boolean
  isProcurementSettingsConfirmed: boolean
  getCustomerName: (customer: Customer) => string
  setOrderNumberStatus: (status: "idle" | "valid" | "invalid" | "checking") => void
  setOrderNumberMessage: (message: string) => void
}

export function CustomerSelection({
  customers,
  selectedCustomerId,
  setSelectedCustomerId,
  poNumber,
  setPoNumber,
  paymentTerm,
  setPaymentTerm,
  deliveryTerms,
  setDeliveryTerms,
  orderNumber,
  isLoadingOrderNumber,
  customOrderNumber,
  setCustomOrderNumber,
  useCustomOrderNumber,
  setUseCustomOrderNumber,
  isCheckingOrderNumber,
  orderNumberStatus,
  orderNumberMessage,
  checkOrderNumberDuplicate,
  isProductSettingsConfirmed,
  isProcurementSettingsConfirmed,
  getCustomerName,
  setOrderNumberStatus,
  setOrderNumberMessage,
}: CustomerSelectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="orderId">訂單編號</Label>
        <div className="relative">
          <Input
            id="orderId"
            value={
              useCustomOrderNumber ? customOrderNumber : isLoadingOrderNumber ? "正在生成訂單編號..." : orderNumber
            }
            onChange={(e) => setCustomOrderNumber(e.target.value)}
            readOnly={!useCustomOrderNumber || isLoadingOrderNumber}
            className={`${!useCustomOrderNumber ? "bg-gray-50" : ""} pr-10`}
            disabled={isProductSettingsConfirmed && isProcurementSettingsConfirmed}
          />
          {isLoadingOrderNumber && !useCustomOrderNumber && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {useCustomOrderNumber && orderNumberStatus === "checking" && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {useCustomOrderNumber && orderNumberStatus === "valid" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{orderNumberMessage}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {useCustomOrderNumber && orderNumberStatus === "invalid" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <XCircle className="h-4 w-4 text-red-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{orderNumberMessage}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="useCustomOrderNumber"
              checked={useCustomOrderNumber}
              onCheckedChange={(checked) => {
                setUseCustomOrderNumber(checked === true)
                if (checked) {
                  setOrderNumberStatus("idle")
                  setOrderNumberMessage("")
                }
              }}
              disabled={isProductSettingsConfirmed && isProcurementSettingsConfirmed}
            />
            <Label htmlFor="useCustomOrderNumber" className="text-sm font-normal cursor-pointer">
              我想自行輸入訂單編號
            </Label>
          </div>
          {useCustomOrderNumber && (
            <Button
              variant="outline"
              size="sm"
              onClick={checkOrderNumberDuplicate}
              disabled={isCheckingOrderNumber || (isProductSettingsConfirmed && isProcurementSettingsConfirmed)}
              className="h-7 text-xs"
            >
              {isCheckingOrderNumber ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  檢查中...
                </>
              ) : (
                "檢查重複編號"
              )}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">格式: L-YYMMXXXXX</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="poNumber">客戶PO編號</Label>
        <Input
          id="poNumber"
          value={poNumber}
          onChange={(e) => setPoNumber(e.target.value)}
          placeholder="請輸入客戶PO編號"
          disabled={isProductSettingsConfirmed && isProcurementSettingsConfirmed}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customer">客戶</Label>
        <select
          id="customer"
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          disabled={isProductSettingsConfirmed && isProcurementSettingsConfirmed}
        >
          <option value="">選擇客戶...</option>
          {customers.map((customer) => (
            <option key={customer.customer_id} value={customer.customer_id}>
              {getCustomerName(customer)}
            </option>
          ))}
        </select>
        {customers.length === 0 && (
          <Alert variant="warning" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>警告</AlertTitle>
            <AlertDescription>未能載入客戶資料。請確保您已連接到資料庫並且有權限訪問客戶資料表。</AlertDescription>
          </Alert>
        )}
      </div>
      {selectedCustomerId && customers.length > 0 && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md border text-sm">
          {(() => {
            const customer = customers.find((c) => c.customer_id === selectedCustomerId || c.id === selectedCustomerId)
            if (!customer) return <p>找不到客戶資料</p>

            return (
              <div className="space-y-1">
                <div className="font-medium">{getCustomerName(customer)}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                  <div>ID: {customer.customer_id || customer.id}</div>
                  {customer.customer_phone && <div>電話: {customer.customer_phone}</div>}
                  {customer.payment_term && <div>付款條件: {customer.payment_term}</div>}
                  {customer.delivery_terms && <div>交貨條件: {customer.delivery_terms}</div>}
                  {customer.customer_address && <div className="col-span-2">地址: {customer.customer_address}</div>}
                </div>
              </div>
            )
          })()}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="paymentTerm">付款條件</Label>
        <Input
          id="paymentTerm"
          value={paymentTerm}
          onChange={(e) => setPaymentTerm(e.target.value)}
          placeholder="付款條件"
          disabled={isProductSettingsConfirmed && isProcurementSettingsConfirmed}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="deliveryTerms">交貨條件</Label>
        <Input
          id="deliveryTerms"
          value={deliveryTerms}
          onChange={(e) => setDeliveryTerms(e.target.value)}
          placeholder="交貨條件"
          disabled={isProductSettingsConfirmed && isProcurementSettingsConfirmed}
        />
      </div>
    </div>
  )
}
