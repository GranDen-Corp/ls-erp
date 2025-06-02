"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

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
  isCartonMarkDisabled?: boolean
  setIsCartonMarkDisabled?: (value: boolean) => void
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
  isCartonMarkDisabled = false,
  setIsCartonMarkDisabled = () => {},
}: OrderInfoProps) {
  const [activeTab, setActiveTab] = useState("remarks")

  return (
    <Card>
      <CardHeader>
        <CardTitle>訂單資訊與備註</CardTitle>
        <CardDescription>請填寫訂單相關的備註、標籤資訊等</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="remarks">訂單備註</TabsTrigger>
            <TabsTrigger value="purchase-remarks">採購備註</TabsTrigger>
            <TabsTrigger value="carton-mark">紙箱嘜頭</TabsTrigger>
            <TabsTrigger value="pallet-mark">棧板嘜頭</TabsTrigger>
            <TabsTrigger value="jinzhan-label">今湛標籤</TabsTrigger>
          </TabsList>
          <TabsContent value="remarks">
            <div className="space-y-2">
              <Label htmlFor="remarks">訂單備註</Label>
              <Textarea
                id="remarks"
                placeholder="請輸入訂單備註"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={10}
                className="font-mono text-sm"
                disabled={isProcurementSettingsConfirmed}
              />
            </div>
          </TabsContent>
          <TabsContent value="purchase-remarks">
            <div className="space-y-2">
              <Label htmlFor="purchase-remarks">採購備註</Label>
              <Textarea
                id="purchase-remarks"
                placeholder="請輸入採購備註"
                value={purchaseRemarks}
                onChange={(e) => setPurchaseRemarks(e.target.value)}
                rows={10}
                className="font-mono text-sm"
                disabled={isProcurementSettingsConfirmed}
              />
            </div>
          </TabsContent>
          <TabsContent value="carton-mark">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="carton-mark-disabled"
                  checked={isCartonMarkDisabled}
                  onCheckedChange={(checked) => setIsCartonMarkDisabled(checked === true)}
                  disabled={isProcurementSettingsConfirmed}
                />
                <Label htmlFor="carton-mark-disabled">不使用</Label>
              </div>
              <Label htmlFor="carton-mark">紙箱嘜頭資訊</Label>
              <Textarea
                id="carton-mark"
                placeholder="請輸入紙箱嘜頭資訊"
                value={cartonMarkInfo}
                onChange={(e) => setCartonMarkInfo(e.target.value)}
                rows={10}
                className="font-mono text-sm"
                disabled={isCartonMarkDisabled || isProcurementSettingsConfirmed}
              />
            </div>
          </TabsContent>
          <TabsContent value="pallet-mark">
            <div className="space-y-2">
              <Label htmlFor="pallet-mark">棧板嘜頭資訊</Label>
              <Textarea
                id="pallet-mark"
                placeholder="請輸入棧板嘜頭資訊"
                value={palletMarkInfo}
                onChange={(e) => setPalletMarkInfo(e.target.value)}
                rows={10}
                className="font-mono text-sm"
                disabled={isProcurementSettingsConfirmed}
              />
            </div>
          </TabsContent>
          <TabsContent value="jinzhan-label">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="jinzhan-label-disabled"
                  checked={isJinzhanLabelDisabled}
                  onCheckedChange={(checked) => setIsJinzhanLabelDisabled(checked === true)}
                  disabled={isProcurementSettingsConfirmed}
                />
                <Label htmlFor="jinzhan-label-disabled">不使用</Label>
              </div>
              <Label htmlFor="jinzhan-label">今湛標籤資訊</Label>
              <Textarea
                id="jinzhan-label"
                placeholder="請輸入今湛標籤資訊"
                value={jinzhanLabelInfo}
                onChange={(e) => setJinzhanLabelInfo(e.target.value)}
                rows={10}
                className="font-mono text-sm"
                disabled={isJinzhanLabelDisabled || isProcurementSettingsConfirmed}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
