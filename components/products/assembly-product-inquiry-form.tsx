"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AssemblyProductInquiryFormProps {
  productId: string
  factory: {
    id: string
    name: string
    code: string
    contact: string
    email: string
    phone: string
  }
  components: Array<{
    id: string
    productId: string
    productName: string
    productPN: string
    quantity: number
    unitPrice: number
    factoryId: string
    factoryName: string
    specifications?: Array<{ name: string; value: string }>
    lastOrderDate?: string
  }>
  assemblyProduct: {
    id: string
    pn: string
    name: string
    customer: {
      id: string
      name: string
      code: string
    }
  }
}

export function AssemblyProductInquiryForm({
  productId,
  factory,
  components,
  assemblyProduct,
}: AssemblyProductInquiryFormProps) {
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
          <Image
            src="/placeholder.svg?height=60&width=150"
            alt="LS Trading Logo"
            width={150}
            height={60}
            className="mb-2"
          />
          <h3 className="text-xl font-bold">組合產品組件詢價單</h3>
          <p>日期: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <h3 className="font-semibold">工廠資訊:</h3>
          <p>
            {factory.name} ({factory.code})
          </p>
          <p>聯絡人: {factory.contact}</p>
          <p>電話: {factory.phone}</p>
          <p>Email: {factory.email}</p>
        </div>
        <div className="space-y-1">
          <p>
            <span className="font-semibold">組合產品編號:</span> {assemblyProduct.pn}
          </p>
          <p>
            <span className="font-semibold">組合產品名稱:</span> {assemblyProduct.name}
          </p>
          <p>
            <span className="font-semibold">客戶:</span> {assemblyProduct.customer.name} (
            {assemblyProduct.customer.code})
          </p>
          <p>
            <span className="font-semibold">詢價組件數量:</span> {components.length}
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">組件清單:</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>組件編號</TableHead>
                <TableHead>組件名稱</TableHead>
                <TableHead className="text-right">數量</TableHead>
                <TableHead className="text-right">上次單價 (USD)</TableHead>
                <TableHead>上次訂單日期</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {components.map((component) => (
                <TableRow key={component.id}>
                  <TableCell className="font-medium">{component.productPN}</TableCell>
                  <TableCell>{component.productName}</TableCell>
                  <TableCell className="text-right">{component.quantity}</TableCell>
                  <TableCell className="text-right">{component.unitPrice.toFixed(2)}</TableCell>
                  <TableCell>{component.lastOrderDate || "無記錄"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {components.map((component) => (
        <div key={component.id} className="border p-4 rounded-md">
          <h3 className="font-semibold mb-2">
            組件詳情: {component.productName} ({component.productPN})
          </h3>

          {component.specifications && component.specifications.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-1">規格:</h4>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">規格名稱</TableHead>
                      <TableHead>規格值</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {component.specifications.map((spec, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{spec.name}</TableCell>
                        <TableCell>{spec.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`quantity-${component.id}`}>數量</Label>
              <Input id={`quantity-${component.id}`} type="number" defaultValue={component.quantity} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`price-${component.id}`}>報價 (USD)</Label>
              <Input id={`price-${component.id}`} type="number" step="0.01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`delivery-${component.id}`}>預計交期</Label>
              <Input id={`delivery-${component.id}`} type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`moq-${component.id}`}>最小訂購量</Label>
              <Input id={`moq-${component.id}`} type="number" />
            </div>
          </div>
        </div>
      ))}

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
          <p className="font-semibold mb-12">{factory.name} 確認</p>
          <div className="border-t border-black pt-1">
            <p>授權簽名 / Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  )
}
