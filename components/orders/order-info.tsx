"use client"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface OrderInfoProps {
  orderInfo: string
  setOrderInfo: (value: string) => void
  remarks: string
  setRemarks: (value: string) => void
  isProductSettingsConfirmed: boolean
  isProcurementSettingsConfirmed: boolean
}

export function OrderInfo({
  orderInfo,
  setOrderInfo,
  remarks,
  setRemarks,
  isProductSettingsConfirmed,
  isProcurementSettingsConfirmed,
}: OrderInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="orderInfo">訂單資訊</Label>
        <Textarea
          id="orderInfo"
          value={orderInfo}
          onChange={(e) => setOrderInfo(e.target.value)}
          placeholder="請輸入訂單相關資訊"
          rows={15}
          className="resize-none"
          disabled={isProductSettingsConfirmed && isProcurementSettingsConfirmed}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="remarks">訂單備註</Label>
        <Textarea
          id="remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="請輸入訂單備註"
          rows={15}
          className="resize-none"
          disabled={isProductSettingsConfirmed && isProcurementSettingsConfirmed}
        />
      </div>
    </div>
  )
}
