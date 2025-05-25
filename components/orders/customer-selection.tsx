"use client"

import type React from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface CustomerSelectionProps {
  customers: any[]
  selectedCustomerId: string
  setSelectedCustomerId: (customerId: string) => void
  poNumber: string
  setPoNumber: (poNumber: string) => void
  customOrderNumber: string
  setCustomOrderNumber: (customOrderNumber: string) => void
  useCustomOrderNumber: boolean
  setUseCustomOrderNumber: (useCustomOrderNumber: boolean) => void
  isProductSettingsConfirmed: boolean
  setOrderNumberStatus: (status: string) => void
  setOrderNumberMessage: (message: string) => void
  orderItems?: any[]
}

const CustomerSelection: React.FC<CustomerSelectionProps> = ({
  customers,
  selectedCustomerId,
  setSelectedCustomerId,
  poNumber,
  setPoNumber,
  customOrderNumber,
  setCustomOrderNumber,
  useCustomOrderNumber,
  setUseCustomOrderNumber,
  isProductSettingsConfirmed,
  setOrderNumberStatus,
  setOrderNumberMessage,
  orderItems,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label htmlFor="customer">客戶</Label>
        <Select
          value={selectedCustomerId}
          onValueChange={setSelectedCustomerId}
          disabled={isProductSettingsConfirmed || (orderItems && orderItems.length > 0)}
          required
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="選擇客戶" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="poNumber">客戶PO編號</Label>
        <Input
          id="poNumber"
          value={poNumber}
          onChange={(e) => setPoNumber(e.target.value)}
          placeholder="請輸入客戶PO編號"
          disabled={isProductSettingsConfirmed || (orderItems && orderItems.length > 0)}
          required
        />
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="useCustomOrderNumber">使用自定義訂單編號</Label>
          <Switch
            id="useCustomOrderNumber"
            checked={useCustomOrderNumber}
            onCheckedChange={setUseCustomOrderNumber}
            disabled={isProductSettingsConfirmed || (orderItems && orderItems.length > 0)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="customOrderNumber">訂單編號</Label>
        <Input
          id="customOrderNumber"
          value={customOrderNumber}
          onChange={(e) => {
            setCustomOrderNumber(e.target.value)
            setOrderNumberStatus("idle")
            setOrderNumberMessage("")
          }}
          placeholder="請輸入自定義訂單編號"
          disabled={isProductSettingsConfirmed || (orderItems && orderItems.length > 0)}
          required={useCustomOrderNumber}
        />
      </div>
    </div>
  )
}

export { CustomerSelection }
export default CustomerSelection
