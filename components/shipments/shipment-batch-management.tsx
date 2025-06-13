"use client"

import { useState } from "react"
import { CalendarIcon, CheckCircle2, Clock, XCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"

interface ShipmentBatch {
  id: string
  batchNumber: number
  quantity: number
  plannedShipDate: Date
  actualShipDate?: Date
  customerUpdatedDeliveryDate?: Date
  factoryActualDeliveryDate?: Date
  status: "pending" | "shipped" | "delivered" | "delayed"
}

interface ShipmentBatchManagementProps {
  orderId: string
  orderNumber: string
  totalQuantity: number
  originalDeliveryDate: Date
  batches: ShipmentBatch[]
}

export function ShipmentBatchManagement({
  orderId,
  orderNumber,
  totalQuantity,
  originalDeliveryDate,
  batches: initialBatches,
}: ShipmentBatchManagementProps) {
  const [batches, setBatches] = useState<ShipmentBatch[]>(initialBatches)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentBatch, setCurrentBatch] = useState<ShipmentBatch | null>(null)
  const [newBatch, setNewBatch] = useState<Partial<ShipmentBatch>>({
    quantity: 0,
    plannedShipDate: new Date(),
  })

  const totalShippedQuantity = batches.reduce((sum, batch) => sum + batch.quantity, 0)
  const remainingQuantity = totalQuantity - totalShippedQuantity

  const handleAddBatch = () => {
    if (!newBatch.quantity || newBatch.quantity <= 0) {
      toast({
        title: "無效的數量",
        description: "請輸入大於0的數量",
        variant: "destructive",
      })
      return
    }

    if (newBatch.quantity > remainingQuantity) {
      toast({
        title: "數量超出範圍",
        description: `批次數量不能超過剩餘數量 ${remainingQuantity}`,
        variant: "destructive",
      })
      return
    }

    const newBatchComplete: ShipmentBatch = {
      id: `batch-${Date.now()}`,
      batchNumber: batches.length + 1,
      quantity: newBatch.quantity || 0,
      plannedShipDate: newBatch.plannedShipDate || new Date(),
      status: "pending",
    }

    setBatches([...batches, newBatchComplete])
    setNewBatch({
      quantity: 0,
      plannedShipDate: new Date(),
    })
    setIsAddDialogOpen(false)

    toast({
      title: "批次已添加",
      description: `批次 #${newBatchComplete.batchNumber} 已成功添加`,
    })
  }

  const handleEditBatch = () => {
    if (!currentBatch) return

    const updatedBatches = batches.map((batch) => (batch.id === currentBatch.id ? currentBatch : batch))

    setBatches(updatedBatches)
    setIsEditDialogOpen(false)
    setCurrentBatch(null)

    toast({
      title: "批次已更新",
      description: `批次 #${currentBatch.batchNumber} 已成功更新`,
    })
  }

  const getStatusBadge = (status: ShipmentBatch["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            待出貨
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            已出貨
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            已交付
          </Badge>
        )
      case "delayed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            已延遲
          </Badge>
        )
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  const isOnTime = (batch: ShipmentBatch) => {
    if (!batch.actualShipDate) return true
    return batch.actualShipDate <= batch.plannedShipDate
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">訂單出貨批次管理</h3>
          <p className="text-sm text-muted-foreground">
            訂單 #{orderNumber} - 總數量: {totalQuantity} - 已分配: {totalShippedQuantity} - 剩餘: {remainingQuantity}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={remainingQuantity <= 0}>添加批次</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新批次</DialogTitle>
              <DialogDescription>為訂單 #{orderNumber} 添加新的出貨批次</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  數量
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  className="col-span-3"
                  value={newBatch.quantity || ""}
                  onChange={(e) => setNewBatch({ ...newBatch, quantity: Number.parseInt(e.target.value) || 0 })}
                  max={remainingQuantity}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="shipDate" className="text-right">
                  計劃出貨日期
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newBatch.plannedShipDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newBatch.plannedShipDate ? format(newBatch.plannedShipDate, "PPP") : <span>選擇日期</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newBatch.plannedShipDate}
                        onSelect={(date) => setNewBatch({ ...newBatch, plannedShipDate: date || new Date() })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleAddBatch}>添加批次</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {batches.map((batch) => (
          <Card key={batch.id} className={cn("transition-all", batch.status === "delayed" ? "border-red-300" : "")}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>批次 #{batch.batchNumber}</CardTitle>
                {getStatusBadge(batch.status)}
              </div>
              <CardDescription>數量: {batch.quantity} pcs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">計劃出貨日期:</p>
                  <p>{format(new Date(batch.plannedShipDate), "yyyy/MM/dd")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">實際出貨日期:</p>
                  <p>{batch.actualShipDate ? format(new Date(batch.actualShipDate), "yyyy/MM/dd") : "尚未出貨"}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">客戶更新交期:</p>
                  <p>
                    {batch.customerUpdatedDeliveryDate
                      ? format(new Date(batch.customerUpdatedDeliveryDate), "yyyy/MM/dd")
                      : "無更新"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">工廠實際交期:</p>
                  <p>
                    {batch.factoryActualDeliveryDate
                      ? format(new Date(batch.factoryActualDeliveryDate), "yyyy/MM/dd")
                      : "尚未確認"}
                  </p>
                </div>
              </div>

              {batch.actualShipDate && (
                <div className="flex items-center gap-2 mt-2">
                  {isOnTime(batch) ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      <span className="text-xs">準時出貨</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">延遲出貨</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Dialog
                open={isEditDialogOpen && currentBatch?.id === batch.id}
                onOpenChange={(open) => {
                  setIsEditDialogOpen(open)
                  if (!open) setCurrentBatch(null)
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full" onClick={() => setCurrentBatch(batch)}>
                    更新狀態
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>更新批次 #{batch.batchNumber}</DialogTitle>
                    <DialogDescription>更新批次的出貨狀態和日期</DialogDescription>
                  </DialogHeader>
                  {currentBatch && (
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                          狀態
                        </Label>
                        <select
                          id="status"
                          className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={currentBatch.status}
                          onChange={(e) =>
                            setCurrentBatch({
                              ...currentBatch,
                              status: e.target.value as ShipmentBatch["status"],
                            })
                          }
                        >
                          <option value="pending">待出貨</option>
                          <option value="shipped">已出貨</option>
                          <option value="delivered">已交付</option>
                          <option value="delayed">已延遲</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="actualShipDate" className="text-right">
                          實際出貨日期
                        </Label>
                        <div className="col-span-3">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !currentBatch.actualShipDate && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {currentBatch.actualShipDate ? (
                                  format(new Date(currentBatch.actualShipDate), "PPP")
                                ) : (
                                  <span>選擇日期</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={currentBatch.actualShipDate}
                                onSelect={(date) =>
                                  setCurrentBatch({ ...currentBatch, actualShipDate: date || undefined })
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="customerDate" className="text-right">
                          客戶更新交期
                        </Label>
                        <div className="col-span-3">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !currentBatch.customerUpdatedDeliveryDate && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {currentBatch.customerUpdatedDeliveryDate ? (
                                  format(new Date(currentBatch.customerUpdatedDeliveryDate), "PPP")
                                ) : (
                                  <span>選擇日期</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={currentBatch.customerUpdatedDeliveryDate}
                                onSelect={(date) =>
                                  setCurrentBatch({ ...currentBatch, customerUpdatedDeliveryDate: date || undefined })
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="factoryDate" className="text-right">
                          工廠實際交期
                        </Label>
                        <div className="col-span-3">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !currentBatch.factoryActualDeliveryDate && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {currentBatch.factoryActualDeliveryDate ? (
                                  format(new Date(currentBatch.factoryActualDeliveryDate), "PPP")
                                ) : (
                                  <span>選擇日期</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={currentBatch.factoryActualDeliveryDate}
                                onSelect={(date) =>
                                  setCurrentBatch({ ...currentBatch, factoryActualDeliveryDate: date || undefined })
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditDialogOpen(false)
                        setCurrentBatch(null)
                      }}
                    >
                      取消
                    </Button>
                    <Button onClick={handleEditBatch}>更新</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}

        {batches.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground">尚未添加任何出貨批次</p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => setIsAddDialogOpen(true)}
                disabled={remainingQuantity <= 0}
              >
                添加第一個批次
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
