"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Save, Eye, Printer } from "lucide-react"
import { formatProductDescription } from "@/lib/product-description-formatter"
import { PrintOrderReport } from "@/components/orders/print-order-report"

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

  if (!isVisible || !isProductSettingsConfirmed) {
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

            {/* 列印按鈕組 */}
            <PrintOrderReport
              orderData={orderData}
              trigger={
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  預覽列印
                </Button>
              }
            />

            <PrintOrderReport
              orderData={orderData}
              directPrint={true}
              trigger={
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  直接列印
                </Button>
              }
            />

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
