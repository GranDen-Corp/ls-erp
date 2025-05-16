"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { Calendar, DollarSign, Eye, Info, Package } from "lucide-react"

// 批次狀態映射
const batchStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "待處理", color: "bg-gray-500" },
  scheduled: { label: "已排程", color: "bg-blue-500" },
  in_production: { label: "生產中", color: "bg-indigo-500" },
  ready: { label: "準備出貨", color: "bg-green-500" },
  shipped: { label: "已出貨", color: "bg-purple-500" },
  delivered: { label: "已送達", color: "bg-teal-500" },
  delayed: { label: "延遲", color: "bg-amber-500" },
  cancelled: { label: "已取消", color: "bg-red-500" },
}

// 獲取批次狀態顯示名稱和顏色
const getBatchStatus = (status: string) => {
  return batchStatusMap[status] || { label: status, color: "bg-gray-500" }
}

// 格式化日期
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-"
  try {
    return format(new Date(dateString), "yyyy/MM/dd", { locale: zhTW })
  } catch (e) {
    return "-"
  }
}

interface OrderBatchDetailsProps {
  orderItems: any[] // 訂單產品項目
}

export function OrderBatchDetails({ orderItems }: OrderBatchDetailsProps) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  // 計算所有批次總數
  const totalBatches = orderItems.reduce((total, item) => {
    return total + (item.shipment_batches?.length || 0)
  }, 0)

  // 打開批次詳情對話框
  const openBatchDetails = (item: any) => {
    setSelectedItem(item)
    setIsDialogOpen(true)
    setActiveTab("basic")
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">批次出貨資訊 ({totalBatches} 個批次)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {orderItems.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    {item.part_no} - {item.description}
                    {item.is_assembly && (
                      <Badge className="ml-2" variant="outline">
                        組件產品
                      </Badge>
                    )}
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => openBatchDetails(item)}>
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    查看批次詳情
                  </Button>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>批次編號</TableHead>
                        <TableHead>數量</TableHead>
                        <TableHead>計劃出貨日</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead>備註</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item.shipment_batches && item.shipment_batches.length > 0 ? (
                        item.shipment_batches.map((batch: any, batchIndex: number) => {
                          const status = getBatchStatus(batch.status || "pending")
                          return (
                            <TableRow key={batchIndex}>
                              <TableCell>{batch.batch_number}</TableCell>
                              <TableCell>{batch.quantity}</TableCell>
                              <TableCell>{formatDate(batch.planned_ship_date)}</TableCell>
                              <TableCell>
                                <Badge className={`${status.color} text-white`}>{status.label}</Badge>
                              </TableCell>
                              <TableCell>{batch.notes || "-"}</TableCell>
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                            此產品沒有批次資訊
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}

            {orderItems.length === 0 && <div className="text-center py-8 text-muted-foreground">沒有產品資訊</div>}
          </div>
        </CardContent>
      </Card>

      {/* 批次詳情對話框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.part_no} - {selectedItem?.description} 批次詳情
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic" className="flex items-center">
                  <Info className="mr-2 h-4 w-4" />
                  基本資訊
                </TabsTrigger>
                <TabsTrigger value="shipping" className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  出貨資訊
                </TabsTrigger>
                <TabsTrigger value="customs" className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4" />
                  海關資訊
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>批次編號</TableHead>
                      <TableHead>數量</TableHead>
                      <TableHead>計劃出貨日</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead>備註</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItem.shipment_batches && selectedItem.shipment_batches.length > 0 ? (
                      selectedItem.shipment_batches.map((batch: any, batchIndex: number) => {
                        const status = getBatchStatus(batch.status || "pending")
                        return (
                          <TableRow key={batchIndex}>
                            <TableCell>{batch.batch_number}</TableCell>
                            <TableCell>{batch.quantity}</TableCell>
                            <TableCell>{formatDate(batch.planned_ship_date)}</TableCell>
                            <TableCell>
                              <Badge className={`${status.color} text-white`}>{status.label}</Badge>
                            </TableCell>
                            <TableCell>{batch.notes || "-"}</TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          此產品沒有批次資訊
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="shipping" className="space-y-4 pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>批次編號</TableHead>
                      <TableHead>追蹤號碼</TableHead>
                      <TableHead>計劃出貨日</TableHead>
                      <TableHead>實際出貨日</TableHead>
                      <TableHead>預計到達日</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItem.shipment_batches && selectedItem.shipment_batches.length > 0 ? (
                      selectedItem.shipment_batches.map((batch: any, batchIndex: number) => {
                        return (
                          <TableRow key={batchIndex}>
                            <TableCell>{batch.batch_number}</TableCell>
                            <TableCell>{batch.tracking_number || "-"}</TableCell>
                            <TableCell>{formatDate(batch.planned_ship_date)}</TableCell>
                            <TableCell>{formatDate(batch.actual_ship_date)}</TableCell>
                            <TableCell>{formatDate(batch.estimated_arrival_date)}</TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          此產品沒有出貨資訊
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="customs" className="space-y-4 pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>批次編號</TableHead>
                      <TableHead>海關編號</TableHead>
                      <TableHead>清關日期</TableHead>
                      <TableHead>海關費用</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItem.shipment_batches && selectedItem.shipment_batches.length > 0 ? (
                      selectedItem.shipment_batches.map((batch: any, batchIndex: number) => {
                        const customsInfo = batch.customs_info || {}
                        return (
                          <TableRow key={batchIndex}>
                            <TableCell>{batch.batch_number}</TableCell>
                            <TableCell>{customsInfo.customs_number || "-"}</TableCell>
                            <TableCell>{formatDate(customsInfo.clearance_date)}</TableCell>
                            <TableCell>
                              {customsInfo.customs_fees ? `${customsInfo.customs_fees.toFixed(2)} USD` : "-"}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          此產品沒有海關資訊
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
