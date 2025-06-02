"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { LucideFileText, LucidePackage, LucideTag } from "lucide-react"

interface OrderInfoProps {
  remarks: string
  setRemarks: (value: string) => void
  purchaseRemarks: string
  setPurchaseRemarks: (value: string) => void
  isProductSettingsConfirmed: boolean
  isProcurementSettingsConfirmed: boolean
  cartonMarkInfo: string
  setCartonMarkInfo: (value: string) => void
  palletMarkInfo: string
  setPalletMarkInfo: (value: string) => void
  jinzhanLabelInfo: string
  setJinzhanLabelInfo: (value: string) => void
  isJinzhanLabelDisabled: boolean
  setIsJinzhanLabelDisabled: (value: boolean) => void
}

export function OrderInfo({
  remarks,
  setRemarks,
  purchaseRemarks,
  setPurchaseRemarks,
  isProductSettingsConfirmed,
  isProcurementSettingsConfirmed,
  cartonMarkInfo,
  setCartonMarkInfo,
  palletMarkInfo,
  setPalletMarkInfo,
  jinzhanLabelInfo,
  setJinzhanLabelInfo,
  isJinzhanLabelDisabled,
  setIsJinzhanLabelDisabled,
}: OrderInfoProps) {
  const isReadOnly = isProductSettingsConfirmed && isProcurementSettingsConfirmed

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LucideFileText className="h-5 w-5" />
          打單資訊與標籤管理
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 標籤管理區域 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 紙箱嘜頭資訊 */}
          <div className="space-y-2">
            <Label htmlFor="carton-mark" className="flex items-center gap-2">
              <LucidePackage className="h-4 w-4" />
              紙箱嘜頭資訊
            </Label>
            <Textarea
              id="carton-mark"
              value={cartonMarkInfo}
              onChange={(e) => setCartonMarkInfo(e.target.value)}
              placeholder="請輸入紙箱嘜頭資訊..."
              rows={10}
              disabled={isReadOnly}
              className="resize-none"
            />
          </div>

          {/* 棧板嘜頭資訊 */}
          <div className="space-y-2">
            <Label htmlFor="pallet-mark" className="flex items-center gap-2">
              <LucidePackage className="h-4 w-4" />
              棧板嘜頭資訊
            </Label>
            <Textarea
              id="pallet-mark"
              value={palletMarkInfo}
              onChange={(e) => setPalletMarkInfo(e.target.value)}
              placeholder="請輸入棧板嘜頭資訊..."
              rows={10}
              disabled={isReadOnly}
              className="resize-none"
            />
          </div>

          {/* 今湛標籤 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="jinzhan-label" className="flex items-center gap-2">
                <LucideTag className="h-4 w-4" />
                今湛標籤
              </Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="jinzhan-disabled"
                  checked={isJinzhanLabelDisabled}
                  onCheckedChange={(checked) => setIsJinzhanLabelDisabled(checked as boolean)}
                  disabled={isReadOnly}
                />
                <Label htmlFor="jinzhan-disabled" className="text-sm text-muted-foreground">
                  不使用
                </Label>
              </div>
            </div>
            <Textarea
              id="jinzhan-label"
              value={jinzhanLabelInfo}
              onChange={(e) => setJinzhanLabelInfo(e.target.value)}
              placeholder="請輸入今湛標籤資訊..."
              rows={10}
              disabled={isReadOnly || isJinzhanLabelDisabled}
              className="resize-none"
            />
          </div>
        </div>

        {/* 訂單備註 */}
        <div className="space-y-2">
          <Label htmlFor="order-remarks" className="flex items-center gap-2">
            <LucideFileText className="h-4 w-4" />
            訂單備註
          </Label>
          <Textarea
            id="order-remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="請輸入訂單備註..."
            rows={8}
            disabled={isReadOnly}
            className="resize-none"
          />
        </div>

        {/* 採購單備註 */}
        <div className="space-y-2">
          <Label htmlFor="purchase-remarks" className="flex items-center gap-2">
            <LucideFileText className="h-4 w-4" />
            採購單備註
          </Label>
          <Textarea
            id="purchase-remarks"
            value={purchaseRemarks}
            onChange={(e) => setPurchaseRemarks(e.target.value)}
            placeholder="請輸入採購單備註..."
            rows={6}
            disabled={isReadOnly}
            className="resize-none"
          />
        </div>

        {isReadOnly && (
          <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-md">
            💡 提示：產品設定和採購設定都已確認，備註資訊已鎖定。如需修改，請先取消確認狀態。
          </div>
        )}
      </CardContent>
    </Card>
  )
}
