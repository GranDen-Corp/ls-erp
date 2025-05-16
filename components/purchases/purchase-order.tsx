"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Download, Printer, Share2 } from "lucide-react"
import Image from "next/image"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface PurchaseOrderProps {
  purchaseData: {
    poNumber: string
    factoryId: string
    factoryName: string
    currency: string
    deliveryTerms: string
    paymentTerms: string
    deliveryDate: Date | undefined
    remarks: string
    products: Array<{
      id: string
      name: string
      pn: string
      quantity: number
      unitPrice: number
      totalPrice: number
      isAssembly?: boolean
      components?: Array<{
        id: string
        name: string
        pn: string
        quantity: number
        unitPrice: number
      }>
    }>
  }
}

export function PurchaseOrder({ purchaseData }: PurchaseOrderProps) {
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = () => {
    setIsPrinting(true)
    window.print()
    setTimeout(() => setIsPrinting(false), 1000)
  }

  const handleDownload = () => {
    alert("下載功能尚未實現")
  }

  const handleShare = () => {
    alert("分享功能尚未實現")
  }

  // 計算總金額
  const totalAmount = purchaseData.products.reduce((sum, product) => sum + product.totalPrice, 0)

  return (
    <div className="relative bg-white print:shadow-none">
      {/* 列印控制按鈕 */}
      <div className="absolute top-4 right-4 flex gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={handlePrint} disabled={isPrinting}>
          <Printer className="h-4 w-4 mr-2" />
          列印
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          下載
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          分享
        </Button>
      </div>

      <Card className="border-0 shadow-none print:shadow-none">
        <CardContent className="p-8">
          {/* 標題和公司信息 */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-1">採購單</h1>
              <p className="text-muted-foreground">Purchase Order</p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end mb-2">
                <Image src="/images/logo.jpg" alt="Company Logo" width={150} height={50} className="object-contain" />
              </div>
              <p className="font-medium">貿易通有限公司</p>
              <p className="text-sm text-muted-foreground">Trade Link Co., Ltd.</p>
              <p className="text-sm text-muted-foreground">台北市信義區信義路五段7號</p>
              <p className="text-sm text-muted-foreground">+886 2 2720 1230</p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* 採購單信息 */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="font-medium mb-2">供應商資訊</h2>
              <p className="font-medium">{purchaseData.factoryName || purchaseData.supplier_name}</p>
              <p className="text-sm text-muted-foreground">ID: {purchaseData.factoryId}</p>
            </div>
            <div className="text-right">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">採購單號:</span>
                  <span>{purchaseData.poNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">日期:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">交期:</span>
                  <span>{purchaseData.deliveryDate ? formatDate(purchaseData.deliveryDate) : "待定"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">幣別:</span>
                  <span>{purchaseData.currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 產品列表 */}
          <div className="mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>產品編號</TableHead>
                  <TableHead>產品名稱</TableHead>
                  <TableHead className="text-right">數量</TableHead>
                  <TableHead className="text-right">單價</TableHead>
                  <TableHead className="text-right">總價</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseData.products.map((product) => (
                  <>
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.pn}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="text-right">{product.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.unitPrice, purchaseData.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.totalPrice, purchaseData.currency)}
                      </TableCell>
                    </TableRow>
                    {/* 如果是組裝產品，顯示組件清單 */}
                    {product.isAssembly && product.components && product.components.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="bg-muted/30">
                          <div className="pl-4 py-2">
                            <p className="font-medium text-sm mb-2">組件清單:</p>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>組件編號</TableHead>
                                  <TableHead>組件名稱</TableHead>
                                  <TableHead className="text-right">數量</TableHead>
                                  <TableHead className="text-right">單價</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {product.components.map((component) => (
                                  <TableRow key={component.id}>
                                    <TableCell className="font-medium">{component.pn}</TableCell>
                                    <TableCell>{component.name}</TableCell>
                                    <TableCell className="text-right">
                                      {component.quantity * product.quantity}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {formatCurrency(component.unitPrice, purchaseData.currency)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 總計 */}
          <div className="flex justify-end mb-6">
            <div className="w-1/3">
              <div className="flex justify-between py-2 font-medium">
                <span>總計:</span>
                <span>{formatCurrency(totalAmount, purchaseData.currency)}</span>
              </div>
            </div>
          </div>

          {/* 條款和備註 */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium mb-2">交貨條件</h3>
              <p className="text-sm">{purchaseData.deliveryTerms || "無"}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">付款條件</h3>
              <p className="text-sm">{purchaseData.paymentTerms || "無"}</p>
            </div>
          </div>

          {purchaseData.remarks && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">備註</h3>
              <p className="text-sm whitespace-pre-line">{purchaseData.remarks}</p>
            </div>
          )}

          {/* 簽名區域 */}
          <div className="grid grid-cols-2 gap-6 mt-12">
            <div>
              <Separator className="mb-4" />
              <p className="text-center text-sm">採購方簽名</p>
            </div>
            <div>
              <Separator className="mb-4" />
              <p className="text-center text-sm">供應商簽名</p>
            </div>
          </div>

          {/* 頁腳 */}
          <div className="mt-12 text-center text-xs text-muted-foreground">
            <p>本採購單由貿易通ERP系統生成 - 採購單號: {purchaseData.poNumber}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
