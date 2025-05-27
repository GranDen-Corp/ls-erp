"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  LucideTrash2,
  LucideLayers,
  LucideCalendar,
  LucideAlertTriangle,
  LucideCheckCircle,
  LucidePackage,
  LucidePrinter,
} from "lucide-react"
import { formatCurrencyAmount } from "@/lib/currency-utils"
import { PrintOrderReport } from "@/components/orders/print-order-report"

interface OrderItem {
  id: string
  productPartNo: string
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  currency: string
  isAssembly: boolean
  shipmentBatches: Array<{
    id: string
    batch_no: string
    quantity: number
    delivery_date: string
  }>
}

interface EnhancedProductListProps {
  orderItems: OrderItem[]
  handleItemChange: (id: string, field: string, value: any) => void
  handleRemoveProduct: (id: string) => void
  calculateItemTotal: (item: OrderItem) => number
  openBatchManagement: (item: OrderItem) => void
  customerCurrency: string
  isProductSettingsConfirmed: boolean
  handleClearAllProducts: () => void
  productUnits: Array<{ id: string; name: string; multiplier: number }>
  exchangeRates: Record<string, number>
  getUnitMultiplier: (unitName: string) => number
  calculateActualQuantity: (quantity: number, unit: string) => number
  calculateActualUnitPrice: (unitPrice: number, unit: string) => number
}

export function EnhancedProductList({
  orderItems,
  handleItemChange,
  handleRemoveProduct,
  calculateItemTotal,
  openBatchManagement,
  customerCurrency,
  isProductSettingsConfirmed,
  handleClearAllProducts,
  productUnits,
  exchangeRates,
  getUnitMultiplier,
  calculateActualQuantity,
  calculateActualUnitPrice,
}: EnhancedProductListProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null)

  const getUnitDisplayName = (unitName: string) => {
    const unit = productUnits.find((u) => u.name === unitName)
    return unit ? unit.name : unitName
  }

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  const getTotalBatchQuantity = (item: OrderItem) => {
    return item.shipmentBatches.reduce((sum, batch) => sum + batch.quantity, 0)
  }

  const hasQuantityMismatch = (item: OrderItem) => {
    const totalBatchQuantity = getTotalBatchQuantity(item)
    const actualQuantity = calculateActualQuantity(item.quantity, item.unit)
    return Math.abs(totalBatchQuantity - actualQuantity) > 0.01
  }

  // 準備列印報表的資料
  const preparePrintData = () => {
    return {
      order_id: "PREVIEW-ORDER",
      po_id: "PREVIEW-PO",
      customer_name: "預覽客戶",
      customer_address: "預覽地址",
      customer_contact: "預覽聯絡人",
      order_date: new Date().toISOString(),
      delivery_date: new Date().toISOString(),
      payment_term: "T/T 30 days",
      delivery_terms: "FOB Taiwan",
      remarks: "這是預覽報表",
      amount: calculateTotal(),
      currency: customerCurrency,
      batch_items: orderItems.map((item) => ({
        part_no: item.productPartNo,
        description: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: calculateItemTotal(item),
        unit: getUnitDisplayName(item.unit),
      })),
    }
  }

  if (orderItems.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <LucidePackage className="h-12 w-12 text-muted-foreground" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">尚未添加任何產品</h3>
            <p className="text-sm text-muted-foreground">請先選擇並添加產品到訂單中</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <LucidePackage className="h-5 w-5" />
            訂單產品列表
          </CardTitle>
          <CardDescription>管理訂單中的產品資訊和批次設定</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {orderItems.length} 項產品
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            總金額: {formatCurrencyAmount(calculateTotal(), customerCurrency)}
          </Badge>
          {orderItems.length > 0 && (
            <PrintOrderReport
              orderData={preparePrintData()}
              trigger={
                <Button variant="outline" size="sm">
                  <LucidePrinter className="h-4 w-4 mr-2" />
                  預覽報表
                </Button>
              }
            />
          )}
          {!isProductSettingsConfirmed && (
            <Button variant="outline" size="sm" onClick={handleClearAllProducts}>
              <LucideTrash2 className="h-4 w-4 mr-2" />
              清空所有產品
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">產品編號</TableHead>
                <TableHead>產品名稱</TableHead>
                <TableHead className="text-center w-[100px]">數量</TableHead>
                <TableHead className="text-center w-[80px]">單位</TableHead>
                <TableHead className="text-right w-[120px]">單價</TableHead>
                <TableHead className="text-right w-[120px]">金額</TableHead>
                <TableHead className="text-center w-[100px]">批次管理</TableHead>
                <TableHead className="text-center w-[80px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {item.productPartNo}
                      {item.isAssembly && (
                        <Badge className="bg-purple-500 text-white">
                          <LucideLayers className="h-3 w-3 mr-1" />
                          組件
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingItem === item.id ? (
                      <Input
                        value={item.productName}
                        onChange={(e) => handleItemChange(item.id, "productName", e.target.value)}
                        onBlur={() => setEditingItem(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setEditingItem(null)
                        }}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="cursor-pointer hover:bg-gray-50 p-1 rounded"
                        onClick={() => !isProductSettingsConfirmed && setEditingItem(item.id)}
                      >
                        {item.productName}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {isProductSettingsConfirmed ? (
                      <span>{item.quantity}</span>
                    ) : (
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, "quantity", Number.parseFloat(e.target.value) || 0)}
                        className="w-20 text-center"
                        min="0"
                        step="0.01"
                      />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {isProductSettingsConfirmed ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {getUnitDisplayName(item.unit)}
                      </Badge>
                    ) : (
                      <Select value={item.unit} onValueChange={(value) => handleItemChange(item.id, "unit", value)}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {productUnits.map((unit) => (
                            <SelectItem key={unit.id} value={unit.name}>
                              {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isProductSettingsConfirmed ? (
                      <span>
                        {item.unitPrice.toFixed(2)} {item.currency}
                      </span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)
                          }
                          className="w-24 text-right"
                          min="0"
                          step="0.01"
                        />
                        <span className="text-sm text-muted-foreground">{item.currency}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {calculateItemTotal(item).toFixed(2)} {item.currency}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openBatchManagement(item)}
                        disabled={isProductSettingsConfirmed}
                      >
                        <LucideCalendar className="h-4 w-4 mr-1" />
                        {item.shipmentBatches.length} 批次
                      </Button>
                      {hasQuantityMismatch(item) && (
                        <div className="flex items-center gap-1 text-amber-600">
                          <LucideAlertTriangle className="h-3 w-3" />
                          <span className="text-xs">數量不符</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {!isProductSettingsConfirmed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveProduct(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <LucideTrash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5} className="text-right font-bold">
                  訂單總金額:
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrencyAmount(calculateTotal(), customerCurrency)}
                </TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* 數量不符警告 */}
        {orderItems.some((item) => hasQuantityMismatch(item)) && (
          <Alert className="mt-4 border-amber-200 bg-amber-50">
            <LucideAlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              部分產品的批次數量與訂單數量不符，請檢查批次設定。
            </AlertDescription>
          </Alert>
        )}

        {/* 設定完成提示 */}
        {isProductSettingsConfirmed && (
          <Alert className="mt-4 border-green-200 bg-green-50">
            <LucideCheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              產品設定已確認完成。如需修改，請點擊上方的「修改產品設定」按鈕。
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
