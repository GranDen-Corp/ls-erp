"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ShipmentBatch } from "@/hooks/use-order-form"

// 批次狀態選項
const batchStatusOptions = [
  { value: "pending", label: "待處理" },
  { value: "scheduled", label: "已排程" },
  { value: "in_production", label: "生產中" },
  { value: "ready", label: "準備出貨" },
  { value: "shipped", label: "已出貨" },
  { value: "delivered", label: "已送達" },
  { value: "delayed", label: "延遲" },
  { value: "cancelled", label: "已取消" },
]

interface BatchManagementProps {
  isManagingBatches: boolean
  setIsManagingBatches: (isManaging: boolean) => void
  currentManagingProductPartNo: string
  batchManagementTab: string
  setBatchManagementTab: (tab: string) => void
  getCurrentItem: () => any
  getCurrentBatches: () => ShipmentBatch[]
  addBatch: () => void
  removeBatch: (batchId: string) => void
  updateBatch: (batchId: string, field: keyof ShipmentBatch, value: any) => void
  calculateAllocatedQuantity: () => number
  calculateRemainingQuantity: () => number
}

export function BatchManagement({
  isManagingBatches,
  setIsManagingBatches,
  currentManagingProductPartNo,
  batchManagementTab,
  setBatchManagementTab,
  getCurrentItem,
  getCurrentBatches,
  addBatch,
  removeBatch,
  updateBatch,
  calculateAllocatedQuantity,
  calculateRemainingQuantity,
}: BatchManagementProps) {
  return (
    <Dialog open={isManagingBatches} onOpenChange={(open) => !open && setIsManagingBatches(false)}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl">管理批次出貨 - {currentManagingProductPartNo}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            設置產品的批次出貨計劃，確保批次總數量等於產品數量
          </DialogDescription>
        </DialogHeader>

        <Tabs value={batchManagementTab} onValueChange={setBatchManagementTab}>
          <TabsList>
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="batches">批次列表</TabsTrigger>
          </TabsList>
          <TabsContent value="basic">
            {/* 基本信息編輯表單 */}
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  產品數量
                </Label>
                <Input
                  type="number"
                  id="quantity"
                  value={getCurrentItem()?.quantity || 0}
                  disabled
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="allocated" className="text-right">
                  已分配數量
                </Label>
                <Input
                  type="number"
                  id="allocated"
                  value={calculateAllocatedQuantity()}
                  disabled
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="remaining" className="text-right">
                  剩餘可分配數量
                </Label>
                <Input
                  type="number"
                  id="remaining"
                  value={calculateRemainingQuantity()}
                  disabled
                  className="col-span-3"
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="batches">
            {/* 批次列表 */}
            <ScrollArea className="h-[400px] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>批號</TableHead>
                    <TableHead>計劃出貨日</TableHead>
                    <TableHead>數量</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getCurrentBatches().map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell>{batch.batchNumber}</TableCell>
                      <TableCell>
                        <DatePicker
                          date={batch.plannedShipDate ? new Date(batch.plannedShipDate) : undefined}
                          onDateChange={(date) => updateBatch(batch.id, "plannedShipDate", date)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={batch.quantity}
                          onChange={(e) => updateBatch(batch.id, "quantity", Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Select value={batch.status} onValueChange={(value) => updateBatch(batch.id, "status", value)}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="選擇狀態" />
                          </SelectTrigger>
                          <SelectContent>
                            {batchStatusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => removeBatch(batch.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            <Button variant="outline" size="sm" onClick={addBatch} className="mt-2">
              <Plus className="h-4 w-4 mr-2" />
              添加批次
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
