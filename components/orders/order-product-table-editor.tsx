"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Save, Eye, Printer } from "lucide-react"
import { formatProductDescription } from "@/lib/product-description-formatter"

interface ProductTableItem {
  part_no: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
  unit: string
}

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

interface OrderProductTableEditorProps {
  orderItems: OrderItem[]
  orderId: string
  customerCurrency: string
  onTableDataChange: (tableData: ProductTableItem[]) => void
  isVisible: boolean
  isProductSettingsConfirmed: boolean
  getUnitDisplayName: (unit: string) => string
  calculateItemTotal: (item: OrderItem) => number
  orderData: any
}

export function OrderProductTableEditor({
  orderItems,
  orderId,
  customerCurrency,
  onTableDataChange,
  isVisible,
  isProductSettingsConfirmed,
  getUnitDisplayName,
  calculateItemTotal,
  orderData,
}: OrderProductTableEditorProps) {
  const [tableData, setTableData] = useState<ProductTableItem[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  // 生成表格資料
  const generateTableData = () => {
    const newTableData = orderItems.map((item) => {
      const description = item.product
        ? formatProductDescription(item.product, orderId)
        : `${item.productName}\n\nBSC CODE# ${item.productPartNo}\nLOT NO. ${orderId}`

      return {
        part_no: item.productPartNo,
        description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.quantity * item.unitPrice,
        unit: item.unit,
      }
    })

    setTableData(newTableData)
    onTableDataChange(newTableData)
    setHasChanges(false)
  }

  // 當訂單項目或訂單ID變更時重新生成
  useEffect(() => {
    if (isVisible && orderItems.length > 0) {
      generateTableData()
    }
  }, [orderItems, orderId, isVisible])

  // 處理描述變更
  const handleDescriptionChange = (index: number, newDescription: string) => {
    const updatedData = [...tableData]
    updatedData[index].description = newDescription
    setTableData(updatedData)
    setHasChanges(true)
  }

  // 儲存變更
  const handleSaveChanges = () => {
    onTableDataChange(tableData)
    setHasChanges(false)
  }

  // 處理預覽列印
  const handlePreviewPrint = () => {
    console.log("預覽列印 - orderData:", orderData)
    console.log("預覽列印 - orderItems:", orderItems)

    // 直接調用列印功能
    const printData = tableData.map((item) => ({
      part_no: item.part_no,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }))

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>訂單報表 - ${orderData?.order_id || orderId}</title>
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
                <td>${orderData?.order_id || orderId}</td>
                <td><strong>客戶PO:</strong></td>
                <td>${orderData?.po_id || ""}</td>
              </tr>
              <tr>
                <td><strong>客戶名稱:</strong></td>
                <td>${orderData?.customer_name || ""}</td>
                <td><strong>建立日期:</strong></td>
                <td>${new Date().toLocaleDateString()}</td>
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

  // 處理直接列印
  const handleDirectPrint = () => {
    console.log("直接列印 - orderData:", orderData)
    handlePreviewPrint() // 暫時使用相同的列印邏輯
  }

  if (!isVisible) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">訂單產品表格</CardTitle>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="secondary" className="text-xs">
                有未儲存的變更
              </Badge>
            )}

            {/* 簡化的列印按鈕 - 直接實現功能 */}
            <Button variant="outline" size="sm" onClick={handlePreviewPrint} className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              預覽列印
            </Button>

            <Button variant="outline" size="sm" onClick={handleDirectPrint} className="flex items-center gap-1">
              <Printer className="h-4 w-4" />
              直接列印
            </Button>

            <Button variant="outline" size="sm" onClick={generateTableData} className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              重新生成
            </Button>
            {hasChanges && (
              <Button size="sm" onClick={handleSaveChanges} className="flex items-center gap-1">
                <Save className="h-4 w-4" />
                儲存變更
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">產品編號</TableHead>
                <TableHead className="w-[400px]">產品描述</TableHead>
                <TableHead className="w-[80px]">數量</TableHead>
                <TableHead className="w-[80px]">單位</TableHead>
                <TableHead className="w-[100px]">單價</TableHead>
                <TableHead className="w-[100px]">總價</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((item, index) => (
                <TableRow key={item.part_no} className="h-[240px]">
                  <TableCell className="align-top font-mono text-sm">{item.part_no}</TableCell>
                  <TableCell className="align-top p-2">
                    <Textarea
                      value={item.description}
                      onChange={(e) => handleDescriptionChange(index, e.target.value)}
                      className="min-h-[220px] font-mono text-xs leading-tight resize-none"
                      rows={15}
                    />
                  </TableCell>
                  <TableCell className="align-top text-center">{item.quantity}</TableCell>
                  <TableCell className="align-top text-center">{item.unit}</TableCell>
                  <TableCell className="align-top text-right">${item.unit_price.toFixed(2)}</TableCell>
                  <TableCell className="align-top text-right font-semibold">${item.total_price.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {tableData.length === 0 && <div className="text-center py-8 text-gray-500">請先添加產品到訂單中</div>}
      </CardContent>
    </Card>
  )
}
