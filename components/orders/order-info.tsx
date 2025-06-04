"use client"

import type React from "react"
import { useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface OrderItem {
  productPartNo: string
  productName: string
  // 其他屬性
}

interface OrderInfoProps {
  orderItems: OrderItem[]
  productProcurementInfo: {
    [productPartNo: string]: { cartonMarkInfo?: string; palletMarkInfo?: string; jinzhanLabelInfo?: string }
  }
  handleProcurementInfoChange: (productPartNo: string, field: string, value: string) => void
  disabled?: boolean
}

const OrderInfo: React.FC<OrderInfoProps> = ({
  orderItems,
  productProcurementInfo,
  handleProcurementInfoChange,
  disabled,
}) => {
  useEffect(() => {
    console.log("產品採購資訊已更新:", productProcurementInfo)
  }, [productProcurementInfo])

  return (
    <div>
      {orderItems.map((item) => {
        const procurementInfo = productProcurementInfo[item.productPartNo] || {}

        return (
          <div key={item.productPartNo} className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">
              {item.productPartNo} - {item.productName}
            </h4>

            {/* 紙箱嘜頭 */}
            <div>
              <Label htmlFor={`carton-${item.productPartNo}`}>紙箱嘜頭</Label>
              <Textarea
                id={`carton-${item.productPartNo}`}
                value={procurementInfo.cartonMarkInfo || ""}
                onChange={(e) => handleProcurementInfoChange(item.productPartNo, "cartonMarkInfo", e.target.value)}
                placeholder="紙箱嘜頭資訊..."
                rows={6}
                disabled={disabled}
              />
            </div>

            {/* 棧板嘜頭 */}
            <div>
              <Label htmlFor={`pallet-${item.productPartNo}`}>棧板嘜頭</Label>
              <Textarea
                id={`pallet-${item.productPartNo}`}
                value={procurementInfo.palletMarkInfo || ""}
                onChange={(e) => handleProcurementInfoChange(item.productPartNo, "palletMarkInfo", e.target.value)}
                placeholder="棧板嘜頭資訊..."
                rows={6}
                disabled={disabled}
              />
            </div>

            {/* 進展標籤 */}
            <div>
              <Label htmlFor={`jinzhan-${item.productPartNo}`}>進展標籤</Label>
              <Textarea
                id={`jinzhan-${item.productPartNo}`}
                value={procurementInfo.jinzhanLabelInfo || ""}
                onChange={(e) => handleProcurementInfoChange(item.productPartNo, "jinzhanLabelInfo", e.target.value)}
                placeholder="進展標籤資訊..."
                rows={4}
                disabled={disabled}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { OrderInfo }
