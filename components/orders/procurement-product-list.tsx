"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CustomDatePicker } from "@/components/ui/custom-date-picker"
import { LucideShoppingCart, LucidePackage, LucideAlertTriangle } from "lucide-react"
import { formatCurrencyAmount } from "@/lib/currency-utils"

interface ProcurementItem {
  productPartNo: string
  productName: string
  orderQuantity: number
  orderUnit: string
  orderUnitPrice: number
  orderCurrency: string
  procurementQuantity?: number
  procurementUnit?: string
  procurementUnitPrice?: number
  procurementCurrency?: string
  supplierId?: string
  supplierName?: string
  expectedDeliveryDate?: Date
  remarks?: string
}

interface ProcurementProductListProps {
  orderItems: any[]
  onProcurementDataChange: (data: any) => void
  customerCurrency: string
  productUnits: any[]
  getUnitMultiplier: (unit: string) => number
  disabled?: boolean
}

export function ProcurementProductList({
  orderItems,
  onProcurementDataChange,
  customerCurrency,
  productUnits,
  getUnitMultiplier,
  disabled = false,
}: ProcurementProductListProps) {
  // 使用 useMemo 來初始化採購項目，避免重複初始化
  const initialProcurementItems = useMemo(() => {
    return (orderItems || []).map((item) => ({
      productPartNo: item.productPartNo,
      productName: item.productName,
      orderQuantity: item.quantity,
      orderUnit: item.unit,
      orderUnitPrice: item.unitPrice,
      orderCurrency: item.currency,
      procurementQuantity: item.procurementQuantity || item.quantity,
      procurementUnit: item.procurementUnit || item.unit,
      procurementUnitPrice: item.procurementUnitPrice || item.unitPrice,
      procurementCurrency: item.procurementCurrency || item.currency,
      supplierId: item.supplierId || "",
      supplierName: item.supplierName || "",
      expectedDeliveryDate: item.expectedDeliveryDate ? new Date(item.expectedDeliveryDate) : undefined,
      remarks: item.procurementRemarks || "",
    }))
  }, [orderItems])

  // 使用狀態來保存採購項目，並且只在初始化時設定一次
  const [procurementItems, setProcurementItems] = useState<ProcurementItem[]>([])

  // 只在 orderItems 變化且 procurementItems 為空時才初始化
  useEffect(() => {
    if (orderItems && orderItems.length > 0 && procurementItems.length === 0) {
      setProcurementItems(initialProcurementItems)
    }
  }, [orderItems, initialProcurementItems, procurementItems.length])

  // 當採購項目變化時，通知父組件
  useEffect(() => {
    if (procurementItems.length > 0) {
      const procurementData = procurementItems.reduce((acc, item) => {
        acc[item.productPartNo] = {
          procurementQuantity: item.procurementQuantity,
          procurementUnit: item.procurementUnit,
          procurementUnitPrice: item.procurementUnitPrice,
          procurementCurrency: item.procurementCurrency,
          supplierId: item.supplierId,
          supplierName: item.supplierName,
          expectedDeliveryDate: item.expectedDeliveryDate,
          procurementRemarks: item.remarks,
        }
        return acc
      }, {} as any)

      onProcurementDataChange(procurementData)
    }
  }, [procurementItems, onProcurementDataChange])

  const updateProcurementItem = (productPartNo: string, field: string, value: any) => {
    setProcurementItems((prev) =>
      prev.map((item) => (item.productPartNo === productPartNo ? { ...item, [field]: value } : item)),
    )
  }

  const getUnitDisplayName = (unit: string) => {
    const unitObj = productUnits.find((u) => u.unit_code === unit)
    return unitObj ? unitObj.unit_name : unit
  }

  const calculateProcurementTotal = (item: ProcurementItem) => {
    const quantity = item.procurementQuantity || 0
    const unitPrice = item.procurementUnitPrice || 0
    return quantity * unitPrice
  }

  const calculateGrandTotal = () => {
    return procurementItems.reduce((total, item) => {
      return total + calculateProcurementTotal(item)
    }, 0)
  }

  if (!procurementItems || procurementItems.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <LucidePackage className="h-12 w-12 text-muted-foreground" />
          <p className="text-center text-muted-foreground">沒有可設定的採購產品</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LucideShoppingCart className="h-5 w-5" />
          採購產品列表設定
        </CardTitle>
        <CardDescription>請為每個產品設定採購相關資訊，包括數量、單位、價格、供應商等</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">產品編號</TableHead>
                <TableHead className="w-[150px]">產品名稱</TableHead>
                <TableHead className="text-center w-[100px]">訂單數量</TableHead>
                <TableHead className="text-center w-[100px]">採購數量</TableHead>
                <TableHead className="text-center w-[80px]">採購單位</TableHead>
                <TableHead className="text-right w-[100px]">採購單價</TableHead>
                <TableHead className="text-center w-[80px]">幣別</TableHead>
                <TableHead className="text-right w-[100px]">採購金額</TableHead>
                <TableHead className="w-[150px]">供應商</TableHead>
                <TableHead className="w-[120px]">預計交期</TableHead>
                <TableHead className="w-[150px]">備註</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {procurementItems.map((item) => (
                <TableRow key={item.productPartNo}>
                  <TableCell className="font-medium">{item.productPartNo}</TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-medium">{item.orderQuantity}</span>
                      <Badge variant="outline" className="text-xs">
                        {getUnitDisplayName(item.orderUnit)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.procurementQuantity || ""}
                      onChange={(e) =>
                        updateProcurementItem(
                          item.productPartNo,
                          "procurementQuantity",
                          Number.parseFloat(e.target.value) || 0,
                        )
                      }
                      className="w-20 text-center"
                      disabled={disabled}
                      min="0"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.procurementUnit || ""}
                      onValueChange={(value) => updateProcurementItem(item.productPartNo, "procurementUnit", value)}
                      disabled={disabled}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {productUnits.map((unit) => (
                          <SelectItem key={unit.unit_code} value={unit.unit_code}>
                            {unit.unit_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.procurementUnitPrice || ""}
                      onChange={(e) =>
                        updateProcurementItem(
                          item.productPartNo,
                          "procurementUnitPrice",
                          Number.parseFloat(e.target.value) || 0,
                        )
                      }
                      className="w-24 text-right"
                      disabled={disabled}
                      min="0"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.procurementCurrency || ""}
                      onValueChange={(value) => updateProcurementItem(item.productPartNo, "procurementCurrency", value)}
                      disabled={disabled}
                    >
                      <SelectTrigger className="w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="TWD">TWD</SelectItem>
                        <SelectItem value="CNY">CNY</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="JPY">JPY</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrencyAmount(calculateProcurementTotal(item), item.procurementCurrency || "USD")}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.supplierName || ""}
                      onChange={(e) => updateProcurementItem(item.productPartNo, "supplierName", e.target.value)}
                      placeholder="供應商名稱"
                      className="w-32"
                      disabled={disabled}
                    />
                  </TableCell>
                  <TableCell>
                    <CustomDatePicker
                      date={item.expectedDeliveryDate}
                      setDate={(date) => updateProcurementItem(item.productPartNo, "expectedDeliveryDate", date)}
                      placeholder="選擇日期"
                      className="w-28"
                      disabled={disabled}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.remarks || ""}
                      onChange={(e) => updateProcurementItem(item.productPartNo, "remarks", e.target.value)}
                      placeholder="備註"
                      className="w-32"
                      disabled={disabled}
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell colSpan={7} className="text-right font-bold">
                  採購總金額:
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrencyAmount(calculateGrandTotal(), customerCurrency)}
                </TableCell>
                <TableCell colSpan={3}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* 採購資料完整性檢查 */}
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <LucideAlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="font-medium text-yellow-800">資料完整性檢查</span>
          </div>
          <div className="text-sm text-yellow-700">
            {procurementItems.some(
              (item) =>
                !item.procurementQuantity ||
                !item.procurementUnitPrice ||
                !item.supplierName ||
                !item.expectedDeliveryDate,
            ) ? (
              <p>請確保所有產品都已填寫完整的採購資訊（數量、單價、供應商、預計交期）</p>
            ) : (
              <p>✓ 所有採購資料已完整填寫</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
