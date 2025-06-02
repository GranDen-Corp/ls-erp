"use client"

import React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, Package, Tag, Box, Truck } from "lucide-react"

interface OrderItem {
  id: string
  productPartNo: string
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  isAssembly: boolean
  shipmentBatches?: any[]
  specifications?: string
  currency: string
  product?: any
}

interface ProductProcurementInfo {
  productPartNo: string
  procurementRemarks: string
  cartonMarkInfo: string
  palletMarkInfo: string
  jinzhanLabelInfo: string
}

interface OrderInfoProps {
  remarks: string
  setRemarks: (value: string) => void
  orderItems: OrderItem[]
  productProcurementInfo: Record<string, ProductProcurementInfo>
  setProductProcurementInfo: (value: Record<string, ProductProcurementInfo>) => void
  isProductSettingsConfirmed: boolean
  isProcurementSettingsConfirmed: boolean
  disabled?: boolean
}

export function OrderInfo({
  remarks,
  setRemarks,
  orderItems = [],
  productProcurementInfo = {},
  setProductProcurementInfo,
  isProductSettingsConfirmed,
  isProcurementSettingsConfirmed,
  disabled = false,
}: OrderInfoProps) {
  // 更新特定產品的採購資訊
  const updateProductProcurementInfo = (
    productPartNo: string,
    field: keyof Omit<ProductProcurementInfo, "productPartNo">,
    value: string,
  ) => {
    setProductProcurementInfo((prev) => ({
      ...prev,
      [productPartNo]: {
        ...prev[productPartNo],
        productPartNo,
        [field]: value,
      },
    }))
  }

  // 確保所有產品都有對應的採購資訊記錄
  const ensureProductProcurementInfo = () => {
    const updatedInfo = { ...productProcurementInfo }

    orderItems.forEach((item) => {
      if (!updatedInfo[item.productPartNo]) {
        updatedInfo[item.productPartNo] = {
          productPartNo: item.productPartNo,
          procurementRemarks: "",
          cartonMarkInfo: "",
          palletMarkInfo: "",
          jinzhanLabelInfo: "",
        }
      }
    })

    // 移除不存在的產品記錄
    Object.keys(updatedInfo).forEach((partNo) => {
      if (!orderItems.find((item) => item.productPartNo === partNo)) {
        delete updatedInfo[partNo]
      }
    })

    setProductProcurementInfo(updatedInfo)
  }

  // 當產品列表變化時，確保採購資訊同步
  React.useEffect(() => {
    if (orderItems.length > 0) {
      ensureProductProcurementInfo()
    }
  }, [orderItems])

  return (
    <div className="space-y-6">
      {/* 訂單備註區塊 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            訂單備註
          </CardTitle>
          <CardDescription>此備註適用於整份訂單，將顯示在訂單文件中</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="order-remarks">訂單備註內容</Label>
            <Textarea
              id="order-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="請輸入訂單備註..."
              rows={8}
              className="min-h-[200px]"
              disabled={disabled}
            />
            <p className="text-sm text-muted-foreground">此備註會自動根據產品資訊生成，您也可以手動編輯</p>
          </div>
        </CardContent>
      </Card>

      {/* 產品採購資訊表格 */}
      {orderItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              產品採購資訊
            </CardTitle>
            <CardDescription>每個產品的個別採購備註、包裝標籤等資訊</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        產品編號
                      </div>
                    </TableHead>
                    <TableHead className="w-[200px]">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        採購備註
                      </div>
                    </TableHead>
                    <TableHead className="w-[200px]">
                      <div className="flex items-center gap-2">
                        <Box className="h-4 w-4" />
                        紙箱嘜頭
                      </div>
                    </TableHead>
                    <TableHead className="w-[200px]">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        棧板嘜頭
                      </div>
                    </TableHead>
                    <TableHead className="w-[200px]">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        今湛標籤
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item) => {
                    const procurementInfo = productProcurementInfo[item.productPartNo] || {
                      productPartNo: item.productPartNo,
                      procurementRemarks: "",
                      cartonMarkInfo: "",
                      palletMarkInfo: "",
                      jinzhanLabelInfo: "",
                    }

                    return (
                      <TableRow key={item.productPartNo}>
                        <TableCell className="font-medium">
                          <div className="space-y-1">
                            <div className="font-mono text-sm">{item.productPartNo}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[140px]">
                              {item.productName}
                            </div>
                            {item.isAssembly && (
                              <Badge variant="secondary" className="text-xs">
                                組件
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Textarea
                            value={procurementInfo.procurementRemarks}
                            onChange={(e) =>
                              updateProductProcurementInfo(item.productPartNo, "procurementRemarks", e.target.value)
                            }
                            placeholder="採購備註..."
                            rows={3}
                            className="min-h-[80px] text-sm"
                            disabled={disabled}
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            value={procurementInfo.cartonMarkInfo}
                            onChange={(e) =>
                              updateProductProcurementInfo(item.productPartNo, "cartonMarkInfo", e.target.value)
                            }
                            placeholder="紙箱嘜頭資訊..."
                            rows={3}
                            className="min-h-[80px] text-sm"
                            disabled={disabled}
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            value={procurementInfo.palletMarkInfo}
                            onChange={(e) =>
                              updateProductProcurementInfo(item.productPartNo, "palletMarkInfo", e.target.value)
                            }
                            placeholder="棧板嘜頭資訊..."
                            rows={3}
                            className="min-h-[80px] text-sm"
                            disabled={disabled}
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            value={procurementInfo.jinzhanLabelInfo}
                            onChange={(e) =>
                              updateProductProcurementInfo(item.productPartNo, "jinzhanLabelInfo", e.target.value)
                            }
                            placeholder="今湛標籤資訊..."
                            rows={3}
                            className="min-h-[80px] text-sm"
                            disabled={disabled}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {orderItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>尚未添加任何產品</p>
                <p className="text-sm">請先在產品設定中添加產品</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
