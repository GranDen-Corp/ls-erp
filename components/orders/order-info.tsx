"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface OrderInfoProps {
  remarks: string
  setRemarks: (value: string) => void
  purchaseRemarks: string
  setPurchaseRemarks: (value: string) => void
  isProductSettingsConfirmed: boolean
  isProcurementSettingsConfirmed: boolean
}

export function OrderInfo({
  remarks,
  setRemarks,
  purchaseRemarks,
  setPurchaseRemarks,
  isProductSettingsConfirmed,
  isProcurementSettingsConfirmed,
}: OrderInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>備註資訊</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 訂單備註 */}
        <div className="space-y-2">
          <Label htmlFor="order-remarks" className="text-sm font-medium">
            訂單備註
          </Label>
          <Textarea
            id="order-remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="請輸入訂單備註"
            className="w-full resize-none"
            rows={15}
            disabled={!isProductSettingsConfirmed}
          />
        </div>

        {/* 採購單備註 */}
        <div className="space-y-2">
          <Label htmlFor="purchase-remarks" className="text-sm font-medium">
            採購單備註
          </Label>
          <Textarea
            id="purchase-remarks"
            value={purchaseRemarks}
            onChange={(e) => setPurchaseRemarks(e.target.value)}
            placeholder="請輸入採購單備註"
            className="w-full resize-none"
            rows={15}
            disabled={!isProcurementSettingsConfirmed}
          />
        </div>
      </CardContent>
    </Card>
  )
}
