"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isAfter, parseISO } from "date-fns"
import { CalendarIcon, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface ShipmentProgressTableProps {
  shipments: any[]
}

export function ShipmentProgressTable({ shipments }: ShipmentProgressTableProps) {
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null)
  const [open, setOpen] = useState(false)
  const [customerDate, setCustomerDate] = useState<Date | undefined>()
  const [factoryDate, setFactoryDate] = useState<Date | undefined>()

  const handleUpdateDates = () => {
    console.log("Update dates for shipment", selectedShipment?.id, {
      customerUpdatedDeliveryDate: customerDate?.toISOString(),
      factoryActualDeliveryDate: factoryDate?.toISOString(),
    })
    // 這裡應該是調用API更新日期
    setOpen(false)
  }

  const getStatusBadge = (shipment: any) => {
    if (shipment.status === "delivered") {
      return <Badge variant="success">已送達</Badge>
    }

    if (shipment.status === "shipped") {
      return <Badge variant="secondary">已出貨</Badge>
    }

    if (shipment.isDelayed) {
      return <Badge variant="destructive">延遲</Badge>
    }

    return <Badge variant="outline">待出貨</Badge>
  }

  const getDeliveryStatus = (shipment: any) => {
    const deliveryDate = parseISO(shipment.deliveryDate)
    const today = new Date()

    if (shipment.status === "delivered") {
      const actualDate = shipment.factoryActualDeliveryDate ? parseISO(shipment.factoryActualDeliveryDate) : today
      return isAfter(actualDate, deliveryDate) ? (
        <Badge variant="destructive">延遲交貨</Badge>
      ) : (
        <Badge variant="success">準時交貨</Badge>
      )
    }

    return isAfter(today, deliveryDate) ? (
      <Badge variant="destructive">已延遲</Badge>
    ) : (
      <Badge variant="outline">進行中</Badge>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>訂單號</TableHead>
            <TableHead>批次</TableHead>
            <TableHead>客戶</TableHead>
            <TableHead>產品</TableHead>
            <TableHead>數量</TableHead>
            <TableHead>訂單交期</TableHead>
            <TableHead>採購單交期</TableHead>
            <TableHead>客戶更新交期</TableHead>
            <TableHead>工廠實際交期</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead>交期狀態</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipments.map((shipment) => (
            <TableRow key={shipment.id}>
              <TableCell>
                <Link href={`/orders/${shipment.orderId}`} className="font-medium text-blue-600 hover:underline">
                  {shipment.orderNumber}
                </Link>
              </TableCell>
              <TableCell>第 {shipment.batchNumber} 批</TableCell>
              <TableCell>{shipment.customerName}</TableCell>
              <TableCell>{shipment.productName}</TableCell>
              <TableCell>{shipment.quantity}</TableCell>
              <TableCell>{format(new Date(shipment.deliveryDate), "yyyy-MM-dd")}</TableCell>
              <TableCell>{format(new Date(shipment.purchaseDeliveryDate), "yyyy-MM-dd")}</TableCell>
              <TableCell>
                {shipment.customerUpdatedDeliveryDate
                  ? format(new Date(shipment.customerUpdatedDeliveryDate), "yyyy-MM-dd")
                  : "-"}
              </TableCell>
              <TableCell>
                {shipment.factoryActualDeliveryDate
                  ? format(new Date(shipment.factoryActualDeliveryDate), "yyyy-MM-dd")
                  : "-"}
              </TableCell>
              <TableCell>{getStatusBadge(shipment)}</TableCell>
              <TableCell>{getDeliveryStatus(shipment)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedShipment(shipment)
                    setCustomerDate(
                      shipment.customerUpdatedDeliveryDate ? new Date(shipment.customerUpdatedDeliveryDate) : undefined,
                    )
                    setFactoryDate(
                      shipment.factoryActualDeliveryDate ? new Date(shipment.factoryActualDeliveryDate) : undefined,
                    )
                    setOpen(true)
                  }}
                >
                  <FileText className="h-4 w-4" />
                  <span className="sr-only">更新交期</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>更新交期信息</DialogTitle>
            <DialogDescription>
              更新訂單 {selectedShipment?.orderNumber} 第 {selectedShipment?.batchNumber} 批的交期信息
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
                        !customerDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customerDate ? format(customerDate, "PPP") : "選擇日期"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={customerDate} onSelect={setCustomerDate} initialFocus />
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
                        !factoryDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {factoryDate ? format(factoryDate, "PPP") : "選擇日期"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={factoryDate} onSelect={setFactoryDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateDates}>確認更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
