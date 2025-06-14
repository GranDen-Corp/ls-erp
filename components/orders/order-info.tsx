"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText } from "lucide-react"
import { OrderProductTableEditor } from "@/components/orders/order-product-table-editor"
import type { ProductTableItem } from "@/hooks/use-order-form"

interface OrderItem {
  id: string
  productPartNo: string
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  isAssembly: boolean
  shipmentBatches?: any[]
  specifications?: string
  currency: string
  product?: any
}

interface ProductProcurementInfo {
  productPartNo: string
  procurementRemarks: string
  purchaseOrderInfo: string
  cartonMarkInfo: string
  palletMarkInfo: string
  jinzhanLabelInfo: string
}

interface OrderInfoProps {
  remarks: string
  setRemarks: (value: string) => void
  orderItems: OrderItem[]
  productProcurementInfo: Record<string, ProductProcurementInfo>
  setProductProcurementInfo: (value: Record<string, ProductProcurementInfo>) => void
  isProductSettingsConfirmed: boolean
  isProcurementSettingsConfirmed: boolean
  disabled?: boolean
  orderId?: string
  customerCurrency?: string
  getUnitDisplayName?: (unit: string) => string
  calculateItemTotal?: (item: any) => number
  orderData?: any
  onTableDataChange?:  (tableData: ProductTableItem[]) => void
}

export function OrderInfo({
  remarks,
  setRemarks,
  orderItems = [],
  productProcurementInfo = {},
  setProductProcurementInfo,
  isProductSettingsConfirmed,
  isProcurementSettingsConfirmed,
  disabled = false,
  orderId = "",
  customerCurrency = "USD",
  getUnitDisplayName = (unit) => unit,
  calculateItemTotal = (item) => item.quantity * item.unitPrice,
  orderData = {},
  onTableDataChange = () => {}
}: OrderInfoProps) {
  return (
    <div className="space-y-6">
      {/* 訂單產品表格 - 當產品設定確認後顯示 */}
      {isProductSettingsConfirmed && orderItems.length > 0 && (
        <div className="mb-6">
          <OrderProductTableEditor
            orderItems={orderItems}
            orderId={orderId}
            customerCurrency={customerCurrency}
            onTableDataChange={onTableDataChange}
            isVisible={true}
            isProductSettingsConfirmed={isProductSettingsConfirmed}
            getUnitDisplayName={getUnitDisplayName}
            calculateItemTotal={calculateItemTotal}
            orderData={orderData}
          />
        </div>
      )}

      {/* 只有在產品設定確認後才顯示訂單備註 */}
      {isProductSettingsConfirmed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              訂單資訊
            </CardTitle>
            <CardDescription>此備註適用於整份訂單，將顯示在訂單文件中</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="order-remarks">訂單備註內容</Label>
              <Textarea
                id="order-remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="請輸入訂單備註..."
                rows={15}
                className="min-h-[380px]"
                disabled={disabled}
              />
              <p className="text-sm text-muted-foreground">此備註會自動根據產品資訊生成，您也可以手動編輯</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
