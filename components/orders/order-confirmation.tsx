"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface OrderConfirmationProps {
  orderId: string
}

export function OrderConfirmation({ orderId }: OrderConfirmationProps) {
  // 模擬訂單數據 - 實際應用中應從API獲取
  const order = {
    id: orderId,
    scNumber: `SC-${orderId}`,
    date: "2023-04-15",
    customer: {
      name: "台灣電子股份有限公司",
      address: "台北市內湖區電子路123號",
      contact: "王經理",
      phone: "02-1234-5678",
      email: "wang@taiwanelectronics.com",
    },
    poNumber: "PO-TE-2023-042",
    poDate: "2023-04-10",
    paymentTerms: "T/T 30 days after shipment",
    deliveryTerms: "FOB Taipei",
    items: [
      {
        id: 1,
        productCode: "LCD-15-HD",
        description: "15吋 HD LCD面板",
        quantity: 300,
        unit: "片",
        unitPrice: 45.0,
        amount: 13500.0,
      },
      {
        id: 2,
        productCode: "LCD-17-FHD",
        description: "17吋 FHD LCD面板",
        quantity: 200,
        unit: "片",
        unitPrice: 58.5,
        amount: 11700.0,
      },
    ],
    subtotal: 25200.0,
    tax: 0,
    total: 25200.0,
    currency: "USD",
    remarks: "請於收到訂單確認書後3日內簽回，謝謝。",
    status: "待確認",
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
          <h3 className="text-xl font-bold">訂單確認書 / Sales Confirmation</h3>
          <p>編號: {order.scNumber}</p>
          <p>日期: {order.date}</p>
          <Badge className="bg-yellow-500 text-white">{order.status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <h3 className="font-semibold">客戶資訊:</h3>
          <p>{order.customer.name}</p>
          <p>{order.customer.address}</p>
          <p>聯絡人: {order.customer.contact}</p>
          <p>電話: {order.customer.phone}</p>
          <p>Email: {order.customer.email}</p>
        </div>
        <div className="space-y-1">
          <p>
            <span className="font-semibold">客戶訂單編號:</span> {order.poNumber}
          </p>
          <p>
            <span className="font-semibold">客戶訂單日期:</span> {order.poDate}
          </p>
          <p>
            <span className="font-semibold">付款條件:</span> {order.paymentTerms}
          </p>
          <p>
            <span className="font-semibold">交貨條件:</span> {order.deliveryTerms}
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
              <TableHead className="text-right">單價 ({order.currency})</TableHead>
              <TableHead className="text-right">金額 ({order.currency})</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item) => (
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
              {order.subtotal.toFixed(2)} {order.currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span>稅金:</span>
            <span>
              {order.tax.toFixed(2)} {order.currency}
            </span>
          </div>
          <div className="flex justify-between font-bold">
            <span>總計:</span>
            <span>
              {order.total.toFixed(2)} {order.currency}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">備註:</h3>
        <p>{order.remarks}</p>
      </div>

      <div className="grid grid-cols-2 gap-6 pt-8">
        <div>
          <p className="font-semibold mb-12">LS Trading Co., Ltd.</p>
          <div className="border-t border-black pt-1">
            <p>授權簽名 / Authorized Signature</p>
          </div>
        </div>
        <div>
          <p className="font-semibold mb-12">客戶確認 / Customer Confirmation</p>
          <div className="border-t border-black pt-1">
            <p>授權簽名 / Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  )
}
