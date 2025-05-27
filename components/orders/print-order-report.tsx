"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Printer, Eye } from "lucide-react"
import { formatProductDescription } from "@/lib/product-description-formatter"

interface OrderItem {
  id: string
  productPartNo: string
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  currency: string
  product?: {
    product_type?: string
    part_no: string
    component_name?: string
    order_requirements?: string
    customer_original_drawing?: string
    drawing_version?: string
    packaging_requirements?: string
  }
}

interface Customer {
  customer_id: string
  customer_full_name: string
  customer_short_name?: string
  customer_address?: string
  customer_phone?: string
  customer_fax?: string
}

interface PrintOrderReportProps {
  orderData: {
    order_id: string
    po_id: string
    payment_terms: string
    trade_terms: string
    remarks: string
    created_at: string
  }
  customer: Customer | null
  orderItems: OrderItem[]
  isEnabled: boolean
}

export function PrintOrderReport({ orderData, customer, orderItems = [], isEnabled }: PrintOrderReportProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const preparePrintData = () => {
    // Add null check and default to empty array
    if (!orderItems || !Array.isArray(orderItems)) {
      return []
    }

    return orderItems.map((item) => {
      const description = item.product
        ? formatProductDescription(item.product, orderData?.order_id || "")
        : `${item.productName || ""}\n\nBSC CODE# ${item.productPartNo || ""}\nLOT NO. ${orderData?.order_id || ""}`

      return {
        part_no: item.productPartNo || "",
        description,
        quantity: item.quantity || 0,
        unit: item.unit || "PCS",
        unit_price: item.unitPrice || 0,
        total_price: (item.quantity || 0) * (item.unitPrice || 0),
        currency: item.currency || "USD",
      }
    })
  }

  const handlePreview = () => {
    setIsPreviewOpen(true)
  }

  const handlePrint = () => {
    const printData = preparePrintData()

    // 生成列印內容
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>訂單報表 - ${orderData?.order_id || ""}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .order-info { margin-bottom: 20px; }
            .order-info table { width: 100%; border-collapse: collapse; }
            .order-info td { padding: 5px; border: 1px solid #ddd; }
            .products-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .products-table th, .products-table td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
              vertical-align: top;
            }
            .products-table th { background-color: #f5f5f5; }
            .description-cell { 
              font-family: monospace; 
              font-size: 11px; 
              white-space: pre-line; 
              min-height: 200px;
              width: 300px;
            }
            .number-cell { text-align: right; }
            .center-cell { text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>訂單報表</h1>
            <h2>Order Report</h2>
          </div>
          
          <div class="order-info">
            <table>
              <tr>
                <td><strong>訂單編號:</strong></td>
                <td>${orderData?.order_id || ""}</td>
                <td><strong>客戶PO:</strong></td>
                <td>${orderData?.po_id || ""}</td>
              </tr>
              <tr>
                <td><strong>客戶名稱:</strong></td>
                <td>${customer?.customer_full_name || ""}</td>
                <td><strong>建立日期:</strong></td>
                <td>${orderData?.created_at ? new Date(orderData.created_at).toLocaleDateString() : ""}</td>
              </tr>
              <tr>
                <td><strong>付款條件:</strong></td>
                <td>${orderData?.payment_terms || ""}</td>
                <td><strong>交付條件:</strong></td>
                <td>${orderData?.trade_terms || ""}</td>
              </tr>
            </table>
          </div>

          <table class="products-table">
            <thead>
              <tr>
                <th>產品編號</th>
                <th>產品描述</th>
                <th>數量</th>
                <th>單位</th>
                <th>單價</th>
                <th>總價</th>
              </tr>
            </thead>
            <tbody>
              ${printData
                .map(
                  (item) => `
                <tr>
                  <td class="center-cell">${item.part_no}</td>
                  <td class="description-cell">${item.description}</td>
                  <td class="center-cell">${item.quantity}</td>
                  <td class="center-cell">${item.unit}</td>
                  <td class="number-cell">$${item.unit_price.toFixed(2)}</td>
                  <td class="number-cell">$${item.total_price.toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          ${
            orderData?.remarks
              ? `
            <div style="margin-top: 30px;">
              <strong>備註:</strong><br>
              ${orderData.remarks}
            </div>
          `
              : ""
          }
        </body>
      </html>
    `

    // 開啟列印視窗
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const printData = preparePrintData()

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePreview}
        disabled={!isEnabled}
        className="flex items-center gap-1"
      >
        <Eye className="h-4 w-4" />
        預覽列印
      </Button>

      <Button size="sm" onClick={handlePrint} disabled={!isEnabled} className="flex items-center gap-1">
        <Printer className="h-4 w-4" />
        直接列印
      </Button>

      {isPreviewOpen && (
        <Card className="fixed inset-4 z-50 overflow-auto bg-white shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>列印預覽</CardTitle>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                關閉
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <h1 className="text-2xl font-bold">訂單報表</h1>
                <h2 className="text-lg">Order Report</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 border rounded">
                <div>
                  <strong>訂單編號:</strong> {orderData?.order_id || ""}
                </div>
                <div>
                  <strong>客戶PO:</strong> {orderData?.po_id || ""}
                </div>
                <div>
                  <strong>客戶名稱:</strong> {customer?.customer_full_name || ""}
                </div>
                <div>
                  <strong>建立日期:</strong>{" "}
                  {orderData?.created_at ? new Date(orderData.created_at).toLocaleDateString() : ""}
                </div>
                <div>
                  <strong>付款條件:</strong> {orderData?.payment_terms || ""}
                </div>
                <div>
                  <strong>交付條件:</strong> {orderData?.trade_terms || ""}
                </div>
              </div>

              {printData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>產品編號</TableHead>
                      <TableHead>產品描述</TableHead>
                      <TableHead>數量</TableHead>
                      <TableHead>單位</TableHead>
                      <TableHead>單價</TableHead>
                      <TableHead>總價</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {printData.map((item, index) => (
                      <TableRow key={index} className="h-[240px]">
                        <TableCell className="align-top text-center font-mono">{item.part_no}</TableCell>
                        <TableCell className="align-top">
                          <pre className="font-mono text-xs leading-tight whitespace-pre-line">{item.description}</pre>
                        </TableCell>
                        <TableCell className="align-top text-center">{item.quantity}</TableCell>
                        <TableCell className="align-top text-center">{item.unit}</TableCell>
                        <TableCell className="align-top text-right">${item.unit_price.toFixed(2)}</TableCell>
                        <TableCell className="align-top text-right font-semibold">
                          ${item.total_price.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>尚未添加任何產品</p>
                </div>
              )}

              {orderData?.remarks && (
                <div className="mt-6 p-4 border rounded">
                  <strong>備註:</strong>
                  <br />
                  {orderData.remarks}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
