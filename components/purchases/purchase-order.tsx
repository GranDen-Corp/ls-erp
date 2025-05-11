"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface PurchaseOrderProps {
  purchaseId: string
}

export function PurchaseOrder({ purchaseId }: PurchaseOrderProps) {
  // 模擬採購單數據 - 實際應用中應從API獲取
  const purchase = {
    id: purchaseId,
    poNumber: `PO-${purchaseId}`,
    date: "2023-04-18",
    factory: {
      name: "深圳電子廠",
      address: "深圳市寶安區沙井街道",
      contact: "李經理",
      phone: "+86-755-1234-5678",
      email: "li@szdianzi.com",
    },
    orderRef: "ORD-2023-0012",
    paymentTerms: "T/T 30 days after shipment",
    deliveryTerms: "FOB Shenzhen",
    items: [
      {
        id: 1,
        productCode: "LCD-15-HD",
        description: "15吋 HD LCD面板",
        quantity: 300,
        unit: "片",
        unitPrice: 42.0,
        amount: 12600.0,
      },
      {
        id: 2,
        productCode: "LCD-17-FHD",
        description: "17吋 FHD LCD面板",
        quantity: 200,
        unit: "片",
        unitPrice: 50.0,
        amount: 10000.0,
      },
    ],
    subtotal: 22600.0,
    tax: 0,
    total: 22600.0,
    currency: "USD",
    status: "待確認",
    remarks: "請於收到採購單後3日內簽回，謝謝。",
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h2 className="text-xl font-bold">LS Trading Co., Ltd.</h2>
          <p>台北市信義區貿易路456號8樓</p>
          <p>電話: 02-8765-4321</p>
          <p>Email: info@lstrading.com</p>
        </div>
        <div className="text-right">
          <Image src="/placeholder.svg" alt="LS Trading Logo" width={150} height={60} className="mb-2" />
          <h3 className="text-xl font-bold">採購單 / Purchase Order</h3>
          <p>採購單編號: {purchase.poNumber}</p>
          <p>日期: {purchase.date}</p>
          <Badge className="bg-yellow-500 text-white">{purchase.status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <h3 className="font-semibold">供應商資訊:</h3>
          <p>{purchase.factory.name}</p>
          <p>{purchase.factory.address}</p>
          <p>聯絡人: {purchase.factory.contact}</p>
          <p>電話: {purchase.factory.phone}</p>
          <p>Email: {purchase.factory.email}</p>
        </div>
        <div className="space-y-1">
          <p>
            <span className="font-semibold">關聯訂單編號:</span> {purchase.orderRef}
          </p>
          <p>
            <span className="font-semibold">付款條件:</span> {purchase.paymentTerms}
          </p>
          <p>
            <span className="font-semibold">交貨條件:</span> {purchase.deliveryTerms}
          </p>
        </div>
      </div>

      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>項次</TableHead>
              <TableHead>產品編號</TableHead>
              <TableHead>產品描述</TableHead>
              <TableHead className="text-right">數量</TableHead>
              <TableHead className="text-right">單位</TableHead>
              <TableHead className="text-right">單價 ({purchase.currency})</TableHead>
              <TableHead className="text-right">金額 ({purchase.currency})</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchase.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.productCode}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                <TableCell className="text-right">{item.unit}</TableCell>
                <TableCell className="text-right">{item.unitPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">{item.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <div className="w-72 space-y-1">
          <div className="flex justify-between">
            <span>小計:</span>
            <span>
              {purchase.subtotal.toFixed(2)} {purchase.currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span>稅金:</span>
            <span>
              {purchase.tax.toFixed(2)} {purchase.currency}
            </span>
          </div>
          <div className="flex justify-between font-bold">
            <span>總計:</span>
            <span>
              {purchase.total.toFixed(2)} {purchase.currency}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">備註:</h3>
        <p>{purchase.remarks}</p>
      </div>

      <div className="grid grid-cols-2 gap-6 pt-8">
        <div>
          <p className="font-semibold mb-12">LS Trading Co., Ltd.</p>
          <div className="border-t border-black pt-1">
            <p>採購 / Purchaser</p>
          </div>
        </div>
        <div>
          <p className="font-semibold mb-12">{purchase.factory.name}</p>
          <div className="border-t border-black pt-1">
            <p>授權簽名 / Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  )
}
