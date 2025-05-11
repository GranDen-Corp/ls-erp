"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ProductInquiryFormProps {
  productId: string
}

export function ProductInquiryForm({ productId }: ProductInquiryFormProps) {
  // 模擬產品數據
  // 實際應用中應該從API獲取
  const product = {
    id: productId,
    pn: "LCD-15-HD",
    name: "15吋 HD LCD面板",
    description: "15吋高清LCD顯示面板，解析度1366x768，亮度250nits，對比度1000:1",
    customer: {
      id: "1",
      name: "台灣電子",
      code: "TE",
    },
    factory: {
      id: "1",
      name: "深圳電子廠",
      code: "SZE",
      contact: "李經理",
      email: "li@szelec.com",
      phone: "+86-755-1234-5678",
    },
    category: "面板",
    lastOrderDate: "2023-04-15",
    lastPrice: 45.0,
    currency: "USD",
    specifications: [
      { name: "尺寸", value: "15吋" },
      { name: "解析度", value: "1366x768" },
      { name: "亮度", value: "250nits" },
      { name: "對比度", value: "1000:1" },
      { name: "反應時間", value: "5ms" },
      { name: "接口", value: "LVDS" },
    ],
    orderHistory: [
      {
        id: "ORD-2023-0012",
        date: "2023-04-15",
        quantity: 300,
        unitPrice: 45.0,
      },
      {
        id: "ORD-2023-0005",
        date: "2023-02-20",
        quantity: 200,
        unitPrice: 46.5,
      },
      {
        id: "ORD-2022-0089",
        date: "2022-11-10",
        quantity: 250,
        unitPrice: 47.0,
      },
    ],
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
          <h3 className="text-xl font-bold">舊單詢價單 / Inquiry Form</h3>
          <p>日期: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <h3 className="font-semibold">工廠資訊:</h3>
          <p>{product.factory.name}</p>
          <p>聯絡人: {product.factory.contact}</p>
          <p>電話: {product.factory.phone}</p>
          <p>Email: {product.factory.email}</p>
        </div>
        <div className="space-y-1">
          <p>
            <span className="font-semibold">產品編號:</span> {product.pn}
          </p>
          <p>
            <span className="font-semibold">產品名稱:</span> {product.name}
          </p>
          <p>
            <span className="font-semibold">客戶:</span> {product.customer.name} ({product.customer.code})
          </p>
          <p>
            <span className="font-semibold">最近訂單日期:</span> {product.lastOrderDate}
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">產品規格:</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">規格名稱</TableHead>
                <TableHead>規格值</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.specifications.map((spec, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{spec.name}</TableCell>
                  <TableCell>{spec.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">歷史訂單記錄:</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>訂單編號</TableHead>
                <TableHead>日期</TableHead>
                <TableHead className="text-right">數量</TableHead>
                <TableHead className="text-right">單價 ({product.currency})</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.orderHistory.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell className="text-right">{order.quantity.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{order.unitPrice.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">詢價資訊:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">預估數量</Label>
            <Input id="quantity" type="number" placeholder="輸入預估數量" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetPrice">目標價格 ({product.currency})</Label>
            <Input id="targetPrice" type="number" step="0.01" placeholder="輸入目標價格" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expectedDelivery">預期交期</Label>
            <Input id="expectedDelivery" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">付款條件</Label>
            <Input
              id="paymentTerms"
              placeholder="例如: T/T 30 days after shipment"
              defaultValue="T/T 30 days after shipment"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="remarks">備註</Label>
        <Textarea id="remarks" placeholder="輸入備註或特殊要求" rows={4} />
      </div>

      <div className="grid grid-cols-2 gap-6 pt-8">
        <div>
          <p className="font-semibold mb-12">LS Trading Co., Ltd.</p>
          <div className="border-t border-black pt-1">
            <p>授權簽名 / Authorized Signature</p>
          </div>
        </div>
        <div>
          <p className="font-semibold mb-12">工廠確認 / Factory Confirmation</p>
          <div className="border-t border-black pt-1">
            <p>授權簽名 / Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  )
}
