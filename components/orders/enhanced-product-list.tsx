"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Settings, Calculator } from "lucide-react"
import { toast } from "sonner"

interface OrderItem {
  id: string
  productKey: string
  productName: string
  productPartNo: string
  quantity: number
  unit: string
  unitPrice: number
  isAssembly: boolean
  shipmentBatches: any[]
  specifications?: string
  remarks?: string
  currency: string
  discount?: number
  taxRate?: number
  product?: any
}

interface ExchangeRate {
  id: number
  currency_code: string
  currency_name: string
  rate_to_usd: number
  is_base_currency: boolean
  is_active: boolean
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
  productUnits: Array<{
    id: number
    code: string
    name: string
    value: string
  }>
  exchangeRates: ExchangeRate[]
  getUnitMultiplier: (unit: string) => number
  calculateActualQuantity: (quantity: number, unit: string) => number
  calculateActualUnitPrice: (unitPrice: number, unit: string) => number
}

export const EnhancedProductList: React.FC<EnhancedProductListProps> = ({
  orderItems = [],
  handleItemChange,
  handleRemoveProduct,
  calculateItemTotal,
  openBatchManagement,
  customerCurrency = "USD",
  isProductSettingsConfirmed = false,
  handleClearAllProducts,
  productUnits = [],
  exchangeRates = [],
  getUnitMultiplier,
  calculateActualQuantity,
  calculateActualUnitPrice,
}) => {
  const getUnitDisplayName = (unitValue: string) => {
    const unit = productUnits.find((u) => u.value === unitValue)
    return unit ? unit.code : `${unitValue}PCS`
  }

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity < 0) {
      toast.error("數量不能為負數")
      return
    }
    handleItemChange(itemId, "quantity", quantity)

    // 智慧化更新批次數量 - 使用實際PCS數量
    const item = orderItems.find((i) => i.id === itemId)
    if (item && item.shipmentBatches.length > 0) {
      const actualQuantityInPcs = quantity * getUnitMultiplier(item.unit)
      const updatedBatches = item.shipmentBatches.map((batch, index) => {
        if (index === 0) {
          // 第一個批次設為總實際數量（PCS）
          return { ...batch, quantity: actualQuantityInPcs, unit: "PCS", unitMultiplier: 1 }
        }
        return batch
      })
      handleItemChange(itemId, "shipmentBatches", updatedBatches)
    }
  }

  const handleUnitChange = (itemId: string, unit: string) => {
    const item = orderItems.find((i) => i.id === itemId)
    if (item) {
      handleItemChange(itemId, "unit", unit)

      // 更新批次數量以反映新的單位
      const actualQuantityInPcs = item.quantity * getUnitMultiplier(unit)
      if (item.shipmentBatches.length > 0) {
        const updatedBatches = item.shipmentBatches.map((batch, index) => {
          if (index === 0) {
            return { ...batch, quantity: actualQuantityInPcs, unit: "PCS", unitMultiplier: 1 }
          }
          return batch
        })
        handleItemChange(itemId, "shipmentBatches", updatedBatches)
      }

      toast.success(`單位已更新為 ${getUnitDisplayName(unit)}`)
    }
  }

  const handlePriceChange = (itemId: string, price: number) => {
    if (price < 0) {
      toast.error("價格不能為負數")
      return
    }
    handleItemChange(itemId, "unitPrice", price)
  }

  const handleCurrencyChange = (itemId: string, currency: string) => {
    handleItemChange(itemId, "currency", currency)
    toast.success(`幣值已更新為 ${currency}`)
  }

  const getUnitInfo = (unit: string) => {
    const multiplier = getUnitMultiplier(unit)
    if (multiplier === 1000) {
      return { text: "1千件", color: "bg-red-100 text-red-800" }
    } else if (multiplier === 100) {
      return { text: "100件", color: "bg-orange-100 text-orange-800" }
    } else if (multiplier === 10) {
      return { text: "10件", color: "bg-yellow-100 text-yellow-800" }
    }
    return { text: "單件", color: "bg-green-100 text-green-800" }
  }

  if (!orderItems || orderItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>訂單產品摘要</CardTitle>
          <CardDescription>尚未選擇任何產品，請先選擇產品以繼續。</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>訂單產品摘要</CardTitle>
          <CardDescription>調整所選產品的數量、單位、價格和幣值。</CardDescription>
        </div>
        {orderItems.length > 0 && !isProductSettingsConfirmed && (
          <Button variant="destructive" size="sm" onClick={handleClearAllProducts} className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            清空所有產品
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] w-full">
          <div className="space-y-6">
            {orderItems.map((item) => {
              const unitInfo = getUnitInfo(item.unit)
              const actualQuantity = calculateActualQuantity(item.quantity, item.unit)

              return (
                <div key={item.id} className="border rounded-lg p-4 space-y-4 bg-gray-50">
                  {/* 產品基本信息 */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-lg">{item.productName}</h4>
                        {item.isAssembly && <Badge className="bg-purple-500 text-white">組件產品</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">產品編號: {item.productPartNo}</p>
                      {item.specifications && (
                        <p className="text-sm text-muted-foreground">規格: {item.specifications}</p>
                      )}
                    </div>
                    {!isProductSettingsConfirmed && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveProduct(item.id)}
                        className="ml-4"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* 產品設定區域 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 數量設定 */}
                    <div>
                      <Label htmlFor={`quantity-${item.id}`} className="text-sm font-medium">
                        訂購數量
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="number"
                          id={`quantity-${item.id}`}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, Number.parseInt(e.target.value) || 0)}
                          disabled={isProductSettingsConfirmed}
                          min="1"
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground font-medium min-w-[60px]">
                          {getUnitDisplayName(item.unit)}
                        </span>
                      </div>
                    </div>

                    {/* 單位設定 */}
                    <div>
                      <Label htmlFor={`unit-${item.id}`} className="text-sm font-medium">
                        計價單位
                      </Label>
                      <Select
                        value={item.unit}
                        onValueChange={(value) => handleUnitChange(item.id, value)}
                        disabled={isProductSettingsConfirmed}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="選擇單位" />
                        </SelectTrigger>
                        <SelectContent>
                          {productUnits.map((unit) => (
                            <SelectItem key={unit.id} value={unit.value}>
                              {unit.code} ({unit.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Badge className={`mt-1 text-xs ${unitInfo.color}`}>{unitInfo.text}</Badge>
                    </div>

                    {/* 單價設定 */}
                    <div>
                      <Label htmlFor={`price-${item.id}`} className="text-sm font-medium">
                        單價
                      </Label>
                      <Input
                        type="number"
                        id={`price-${item.id}`}
                        value={item.unitPrice}
                        onChange={(e) => handlePriceChange(item.id, Number.parseFloat(e.target.value) || 0)}
                        disabled={isProductSettingsConfirmed}
                        min="0"
                        step="0.01"
                        className="mt-1"
                      />
                    </div>

                    {/* 幣值設定 */}
                    <div>
                      <Label htmlFor={`currency-${item.id}`} className="text-sm font-medium">
                        幣值
                      </Label>
                      <Select
                        value={item.currency}
                        onValueChange={(value) => handleCurrencyChange(item.id, value)}
                        disabled={isProductSettingsConfirmed}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="選擇幣值" />
                        </SelectTrigger>
                        <SelectContent>
                          {exchangeRates.map((rate) => (
                            <SelectItem key={rate.id} value={rate.currency_code}>
                              {rate.currency_code} - {rate.currency_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 計算結果顯示 */}
                  <div className="bg-white rounded-md p-3 border">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">數量:</span>
                        <span className="ml-2 font-medium">{item.quantity.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">單位:</span>
                        <span className="ml-2 font-medium">{getUnitDisplayName(item.unit)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">單價:</span>
                        <span className="ml-2 font-medium">
                          {item.unitPrice.toFixed(4)} {item.currency}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">小計:</span>
                        <span className="ml-2 font-bold text-lg">
                          {calculateItemTotal(item).toFixed(2)} {item.currency}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      實際數量: {calculateActualQuantity(item.quantity, item.unit).toLocaleString()} 件 | 計算方式:{" "}
                      {item.quantity} × {getUnitDisplayName(item.unit)} × {item.unitPrice} ={" "}
                      {calculateItemTotal(item).toFixed(2)} {item.currency}
                    </div>
                  </div>

                  {/* 操作按鈕 */}
                  {!isProductSettingsConfirmed && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openBatchManagement(item)}
                        className="flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        批次出貨管理 ({item.shipmentBatches.length})
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        價格計算器
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
