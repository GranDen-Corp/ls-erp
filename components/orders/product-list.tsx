"use client"
import { Layers, Trash, Clock, Package } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrencyAmount } from "@/lib/currency-utils"
import type { OrderItem } from "@/hooks/use-order-form"

interface ProductUnit {
  id: number
  category: string
  code: string
  name: string
  value: string
  is_active: boolean
  is_default: boolean
  sort_order: number
}

interface ProductListProps {
  orderItems: OrderItem[]
  handleItemChange: (itemId: string, field: keyof OrderItem, value: any) => void
  handleRemoveProduct: (itemId: string) => void
  calculateItemTotal: (item: OrderItem) => number
  openBatchManagement: (productPartNo: string) => void
  customerCurrency: string
  isProductSettingsConfirmed: boolean
  productUnits?: ProductUnit[]
}

export function ProductList({
  orderItems = [], // 添加默認值
  handleItemChange,
  handleRemoveProduct,
  calculateItemTotal,
  openBatchManagement,
  customerCurrency = "USD", // 添加默認值
  isProductSettingsConfirmed,
  productUnits = [], // 添加默認值
}: ProductListProps) {
  // 確保所有必要的數據都存在
  if (!orderItems || !Array.isArray(orderItems)) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">產品編號</TableHead>
              <TableHead className="w-[200px]">產品名稱</TableHead>
              <TableHead className="text-center w-[80px]">數量</TableHead>
              <TableHead className="text-center w-[80px]">單位</TableHead>
              <TableHead className="text-right w-[100px]">單價</TableHead>
              <TableHead className="text-right w-[120px]">金額 ({customerCurrency})</TableHead>
              <TableHead className="text-center w-[100px]">批次</TableHead>
              <TableHead className="text-center w-[80px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Package className="h-8 w-8 mb-2 opacity-50" />
                  <p>載入中...</p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">產品編號</TableHead>
            <TableHead className="w-[200px]">產品名稱</TableHead>
            <TableHead className="text-center w-[80px]">數量</TableHead>
            <TableHead className="text-center w-[80px]">單位</TableHead>
            <TableHead className="text-right w-[100px]">單價</TableHead>
            <TableHead className="text-right w-[120px]">金額 ({customerCurrency})</TableHead>
            <TableHead className="text-center w-[100px]">批次</TableHead>
            <TableHead className="text-center w-[80px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orderItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {item.productPartNo}
                {item.isAssembly && (
                  <Badge className="ml-2 bg-purple-500 text-white">
                    <Layers className="h-3 w-3 mr-1" />
                    組件
                  </Badge>
                )}
              </TableCell>
              <TableCell>{item.productName}</TableCell>
              <TableCell className="text-center">
                {isProductSettingsConfirmed ? (
                  item.quantity
                ) : (
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                    className="w-20 text-right mx-auto"
                  />
                )}
              </TableCell>
              <TableCell className="text-center">
                {isProductSettingsConfirmed ? (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {item.unit}
                  </Badge>
                ) : (
                  <Select value={item.unit} onValueChange={(value) => handleItemChange(item.id, "unit", value)}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {productUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.code}>
                          {unit.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </TableCell>
              <TableCell className="text-right">
                {isProductSettingsConfirmed ? (
                  `${item.unitPrice.toFixed(2)} ${item.currency}`
                ) : (
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                    className="w-24 text-right"
                  />
                )}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrencyAmount(calculateItemTotal(item), customerCurrency)}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openBatchManagement(item.productPartNo)}
                  className="h-8 px-2"
                  disabled={isProductSettingsConfirmed}
                >
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  批次 ({item.shipmentBatches?.length || 0})
                </Button>
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveProduct(item.id)}
                  disabled={isProductSettingsConfirmed}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {orderItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Package className="h-8 w-8 mb-2 opacity-50" />
                  <p>尚未新增產品</p>
                  <p className="text-sm">請從上方選擇並添加產品</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
