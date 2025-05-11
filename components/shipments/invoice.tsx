"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"

interface InvoiceProps {
  shipmentId: string
}

export function Invoice({ shipmentId }: InvoiceProps) {
  // 模擬發票數據 - 實際應用中應從API獲取
  const invoice = {
    id: `INV-${shipmentId}`,
    date: "2023-04-20",
    shipmentId: shipmentId,
    customer: {
      name: "台灣電子股份有限公司",
      address: "台北市內湖區電子路123號",
      contact: "王經理",
      phone: "02-1234-5678",
      email: "wang@taiwanelectronics.com",
    },
    orderRefs: ["ORD-2023-0012"],
    paymentTerms: "T/T 30 days after shipment",
    deliveryTerms: "FOB Taipei",
    shipmentInfo: {
      destination: "台北",
      vessel: "海運一號",
      so: "SO-12345",
      etd: "2023-04-25",
      eta: "2023-05-05",
    },
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
          <h3 className="text-xl font-bold">商業發票 / Commercial Invoice</h3>
          <p>發票編號: {invoice.id}</p>
          <p>日期: {invoice.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <h3 className="font-semibold">客戶資訊:</h3>
          <p>{invoice.customer.name}</p>
          <p>{invoice.customer.address}</p>
          <p>聯絡人: {invoice.customer.contact}</p>
          <p>電話: {invoice.customer.phone}</p>
          <p>Email: {invoice.customer.email}</p>
        </div>
        <div className="space-y-1">
          <p>
            <span className="font-semibold">關聯訂單編號:</span> {invoice.orderRefs.join(", ")}
          </p>
          <p>
            <span className="font-semibold">付款條件:</span> {invoice.paymentTerms}
          </p>
          <p>
            <span className="font-semibold">交貨條件:</span> {invoice.deliveryTerms}
          </p>
          <p>
            <span className="font-semibold">目的地:</span> {invoice.shipmentInfo.destination}
          </p>
          <p>
            <span className="font-semibold">船名/航班:</span> {invoice.shipmentInfo.vessel}
          </p>
          <p>
            <span className="font-semibold">S/O編號:</span> {invoice.shipmentInfo.so}
          </p>
          <p>
            <span className="font-semibold">預計出發日:</span> {invoice.shipmentInfo.etd}
          </p>
          <p>
            <span className="font-semibold">預計到達日:</span> {invoice.shipmentInfo.eta}
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
              <TableHead className="text-right">單價 ({invoice.currency})</TableHead>
              <TableHead className="text-right">金額 ({invoice.currency})</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item) => (
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
              {invoice.subtotal.toFixed(2)} {invoice.currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span>稅金:</span>
            <span>
              {invoice.tax.toFixed(2)} {invoice.currency}
            </span>
          </div>
          <div className="flex justify-between font-bold">
            <span>總計:</span>
            <span>
              {invoice.total.toFixed(2)} {invoice.currency}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-8">
        <div>
          <p className="font-semibold mb-12">LS Trading Co., Ltd.</p>
          <div className="border-t border-black pt-1">
            <p>授權簽名 / Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  )
}
