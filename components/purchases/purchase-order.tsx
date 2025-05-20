"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DatePicker } from "@/components/ui/date-picker"
import { Loader2, Plus, Trash, FileText, Send, Download } from "lucide-react"
import { formatCurrencyAmount } from "@/lib/currency-utils"
import { createPurchaseOrder } from "@/lib/services/purchase-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Component } from "@/types/assembly-product"

// 定義採購訂單項目類型
interface PurchaseOrderItem {
  id: string
  productPartNo: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  deliveryDate?: Date | null
  notes?: string
  isAssembly?: boolean
  components?: Component[]
}

// 定義採購訂單類型
interface PurchaseOrder {
  orderId: string
  supplierId: string
  supplierName: string
  issueDate: Date
  expectedDeliveryDate?: Date | null
  paymentTerm: string
  deliveryTerm: string
  currency: string
  items: PurchaseOrderItem[]
  notes?: string
  status: string
}

// 定義組件屬性
interface PurchaseOrderProps {
  orderId: string
  supplierId: string
  supplierName: string
  items: any[]
  onSuccess?: () => void
  onCancel?: () => void
}

export const PurchaseOrder: React.FC<PurchaseOrderProps> = ({
  orderId,
  supplierId,
  supplierName,
  items,
  onSuccess,
  onCancel,
}) => {
  // 狀態管理
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder>({
    orderId,
    supplierId,
    supplierName,
    issueDate: new Date(),
    expectedDeliveryDate: null,
    paymentTerm: "Net 30",
    deliveryTerm: "FOB",
    currency: "USD",
    items: [],
    notes: "",
    status: "draft",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showComponentsDialog, setShowComponentsDialog] = useState(false)
  const [selectedAssemblyItem, setSelectedAssemblyItem] = useState<PurchaseOrderItem | null>(null)

  // 初始化採購訂單項目
  useEffect(() => {
    if (items && items.length > 0) {
      const processedItems = items.map((item) => {
        // 檢查是否為組裝產品
        const isAssembly = item.isAssembly || false
        let components: Component[] = []

        // 如果是組裝產品，處理其組件
        if (isAssembly && item.components) {
          components = item.components
        }

        return {
          id: item.id || Math.random().toString(36).substring(2, 9),
          productPartNo: item.productPartNo,
          productName: item.productName,
          quantity: item.quantity || 1,
          unitPrice: item.purchasePrice || item.unitPrice || 0,
          totalPrice: (item.quantity || 1) * (item.purchasePrice || item.unitPrice || 0),
          deliveryDate: item.deliveryDate ? new Date(item.deliveryDate) : null,
          notes: item.notes || "",
          isAssembly,
          components,
        }
      })

      setPurchaseOrder((prev) => ({
        ...prev,
        items: processedItems,
      }))
    }
  }, [items])

  // 計算總金額
  const calculateTotal = () => {
    return purchaseOrder.items.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  // 更新項目
  const updateItem = (id: string, field: keyof PurchaseOrderItem, value: any) => {
    setPurchaseOrder((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }

          // 如果更新的是數量或單價，重新計算總價
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice
          }

          return updatedItem
        }
        return item
      })

      return { ...prev, items: updatedItems }
    })
  }

  // 移除項目
  const removeItem = (id: string) => {
    setPurchaseOrder((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }))
  }

  // 添加新項目
  const addItem = () => {
    const newItem: PurchaseOrderItem = {
      id: Math.random().toString(36).substring(2, 9),
      productPartNo: "",
      productName: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    }

    setPurchaseOrder((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }))
  }

  // 提交採購訂單
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      // 這裡可以添加表單驗證邏輯

      // 調用API創建採購訂單
      await createPurchaseOrder(purchaseOrder)

      setSuccess(true)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message || "提交採購訂單時發生錯誤")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 查看組件詳情
  const viewComponents = (item: PurchaseOrderItem) => {
    setSelectedAssemblyItem(item)
    setShowComponentsDialog(true)
  }

  // 渲染組件詳情對話框
  const renderComponentsDialog = () => {
    if (!selectedAssemblyItem) return null

    return (
      <Dialog open={showComponentsDialog} onOpenChange={setShowComponentsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>組件詳情 - {selectedAssemblyItem.productName}</DialogTitle>
            <DialogDescription>
              產品編號: {selectedAssemblyItem.productPartNo} | 數量: {selectedAssemblyItem.quantity}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>組件編號</TableHead>
                  <TableHead>組件名稱</TableHead>
                  <TableHead className="text-center">每組數量</TableHead>
                  <TableHead className="text-center">總數量</TableHead>
                  <TableHead className="text-right">單價</TableHead>
                  <TableHead className="text-right">總價</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedAssemblyItem.components && selectedAssemblyItem.components.length > 0 ? (
                  selectedAssemblyItem.components.map((component, index) => (
                    <TableRow key={index}>
                      <TableCell>{component.partNo}</TableCell>
                      <TableCell>{component.name}</TableCell>
                      <TableCell className="text-center">{component.quantity}</TableCell>
                      <TableCell className="text-center">
                        {component.quantity * selectedAssemblyItem.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrencyAmount(component.price || 0, purchaseOrder.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrencyAmount(
                          (component.price || 0) * component.quantity * selectedAssemblyItem.quantity,
                          purchaseOrder.currency,
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      沒有組件資料
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          <DialogFooter>
            <Button onClick={() => setShowComponentsDialog(false)}>關閉</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>錯誤</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertTitle>成功</AlertTitle>
          <AlertDescription>採購訂單已成功創建</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>創建採購訂單</CardTitle>
          <CardDescription>
            訂單編號: {orderId} | 供應商: {supplierName}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 採購訂單基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">發行日期</Label>
              <DatePicker
                date={purchaseOrder.issueDate}
                onDateChange={(date) => setPurchaseOrder((prev) => ({ ...prev, issueDate: date || new Date() }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedDeliveryDate">預計交貨日期</Label>
              <DatePicker
                date={purchaseOrder.expectedDeliveryDate || undefined}
                onDateChange={(date) => setPurchaseOrder((prev) => ({ ...prev, expectedDeliveryDate: date }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentTerm">付款條件</Label>
              <Input
                id="paymentTerm"
                value={purchaseOrder.paymentTerm}
                onChange={(e) => setPurchaseOrder((prev) => ({ ...prev, paymentTerm: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryTerm">交貨條件</Label>
              <Input
                id="deliveryTerm"
                value={purchaseOrder.deliveryTerm}
                onChange={(e) => setPurchaseOrder((prev) => ({ ...prev, deliveryTerm: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">貨幣</Label>
              <Select
                value={purchaseOrder.currency}
                onValueChange={(value) => setPurchaseOrder((prev) => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇貨幣" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">美元 (USD)</SelectItem>
                  <SelectItem value="TWD">新台幣 (TWD)</SelectItem>
                  <SelectItem value="EUR">歐元 (EUR)</SelectItem>
                  <SelectItem value="JPY">日元 (JPY)</SelectItem>
                  <SelectItem value="CNY">人民幣 (CNY)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* 採購訂單項目 */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">採購項目</h3>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                添加項目
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>產品編號</TableHead>
                    <TableHead>產品名稱</TableHead>
                    <TableHead className="text-center">數量</TableHead>
                    <TableHead className="text-right">單價 ({purchaseOrder.currency})</TableHead>
                    <TableHead className="text-right">總價 ({purchaseOrder.currency})</TableHead>
                    <TableHead>交貨日期</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrder.items.length > 0 ? (
                    purchaseOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.productPartNo}
                            {item.isAssembly && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 cursor-pointer">
                                      組件
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>此產品是組裝產品，包含多個組件</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value) || 1)}
                            className="w-20 text-right mx-auto"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value) || 0)}
                            className="w-24 text-right ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrencyAmount(item.totalPrice, purchaseOrder.currency)}
                        </TableCell>
                        <TableCell>
                          <DatePicker
                            date={item.deliveryDate || undefined}
                            onDateChange={(date) => updateItem(item.id, "deliveryDate", date)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.isAssembly && (
                              <Button variant="ghost" size="icon" onClick={() => viewComponents(item)}>
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        尚未添加採購項目
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end bg-gray-50 p-4 rounded-md border">
            <div className="space-y-2">
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">小計:</span>
                <span className="font-medium">{formatCurrencyAmount(calculateTotal(), purchaseOrder.currency)}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="font-medium">總計:</span>
                <span className="font-bold text-lg">
                  {formatCurrencyAmount(calculateTotal(), purchaseOrder.currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">備註</Label>
            <Textarea
              id="notes"
              value={purchaseOrder.notes || ""}
              onChange={(e) => setPurchaseOrder((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="輸入採購訂單備註..."
              rows={4}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              下載草稿
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  提交採購訂單
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* 組件詳情對話框 */}
      {renderComponentsDialog()}
    </div>
  )
}
