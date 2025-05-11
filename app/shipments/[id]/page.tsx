"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Pencil, Calendar } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface ShipmentPageProps {
  params: {
    id: string
  }
}

export default function ShipmentPage({ params }: ShipmentPageProps) {
  const { id } = params
  const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false)
  const [customerUpdatedDate, setCustomerUpdatedDate] = useState("")
  const [factoryActualDate, setFactoryActualDate] = useState("")

  // 模擬從API獲取出貨數據
  // 實際應用中應該使用API獲取
  const shipment = {
    id: id,
    customer: "台灣電子",
    orderRef: "ORD-2023-0012",
    batchNumber: 2,
    totalBatches: 2,
    batchQuantity: 200,
    totalQuantity: 300,
    amount: "$12,600",
    status: "準備中",
    date: "2023-04-20",
    destination: "台北",
    vessel: "待定",
    orderDeliveryDate: "2023-03-30", // 訂單交貨期
    purchaseDeliveryDate: "2023-03-25", // 採購單交貨期
    customerUpdatedDeliveryDate: "2023-04-05", // 客戶更新交貨期
    factoryActualDeliveryDate: "", // 工廠實際交貨期
    isDelayed: true, // 是否延遲
    items: [
      {
        id: "1",
        productId: "1",
        productName: "15吋 HD LCD面板",
        productPN: "LCD-15-HD",
        quantity: 200,
        unitPrice: 45.0,
        amount: 9000.0,
      },
    ],
  }

  // 初始化對話框數據
  useState(() => {
    setCustomerUpdatedDate(shipment.customerUpdatedDeliveryDate || "")
    setFactoryActualDate(shipment.factoryActualDeliveryDate || "")
  })

  // 保存交期更新
  const handleSaveDeliveryDates = async () => {
    // 模擬API請求
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 實際應用中應該調用API更新交期
    console.log("更新交期:", {
      shipmentId: shipment.id,
      customerUpdatedDeliveryDate: customerUpdatedDate,
      factoryActualDeliveryDate: factoryActualDate,
    })

    setIsDeliveryDialogOpen(false)
  }

  // 判斷交期狀態
  const getDeliveryStatus = () => {
    const actualDate = shipment.factoryActualDeliveryDate || new Date().toISOString().split("T")[0]
    const targetDate = shipment.customerUpdatedDeliveryDate || shipment.orderDeliveryDate

    if (!targetDate) return { status: "normal", text: "正常" }

    if (new Date(actualDate) > new Date(targetDate)) {
      return { status: "delayed", text: "延遲" }
    } else if (new Date(actualDate) < new Date(targetDate)) {
      return { status: "early", text: "提前" }
    } else {
      return { status: "ontime", text: "準時" }
    }
  }

  const deliveryStatus = getDeliveryStatus()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/shipments">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">出貨詳情 - {shipment.id}</h1>
          <Badge
            className={
              shipment.status === "已完成"
                ? "bg-green-500"
                : shipment.status === "已出貨"
                  ? "bg-blue-500"
                  : "bg-yellow-500"
            }
          >
            {shipment.status}
          </Badge>
          <Badge
            className={
              deliveryStatus.status === "delayed"
                ? "bg-red-500"
                : deliveryStatus.status === "early"
                  ? "bg-green-500"
                  : "bg-blue-500"
            }
          >
            {deliveryStatus.text}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsDeliveryDialogOpen(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            更新交期
          </Button>
          <Link href={`/shipments/${id}/edit`}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              編輯出貨
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>出貨基本資訊</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">出貨編號</dt>
                <dd className="mt-1 text-sm">{shipment.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">客戶</dt>
                <dd className="mt-1 text-sm">{shipment.customer}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">關聯訂單</dt>
                <dd className="mt-1 text-sm">
                  <Link href={`/orders/${shipment.orderRef}`} className="text-blue-600 hover:underline block">
                    {shipment.orderRef}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">批次信息</dt>
                <dd className="mt-1 text-sm">
                  第 {shipment.batchNumber} 批 (共 {shipment.totalBatches} 批)
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">數量</dt>
                <dd className="mt-1 text-sm">
                  {shipment.batchQuantity} / {shipment.totalQuantity} (批次數量/訂單總數量)
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">目的地</dt>
                <dd className="mt-1 text-sm">{shipment.destination}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">船名/航班</dt>
                <dd className="mt-1 text-sm">{shipment.vessel}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">出貨日期</dt>
                <dd className="mt-1 text-sm">{shipment.date}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">金額</dt>
                <dd className="mt-1 text-sm">{shipment.amount}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>交期資訊</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">訂單交期</p>
                <p className="text-sm bg-muted p-2 rounded">{shipment.orderDeliveryDate}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">採購單交期</p>
                <p className="text-sm bg-muted p-2 rounded">{shipment.purchaseDeliveryDate}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">客戶更新交期</p>
                <p className="text-sm bg-muted p-2 rounded">
                  {shipment.customerUpdatedDeliveryDate || <span className="text-gray-400">未更新</span>}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">工廠實際交期</p>
                <p className="text-sm bg-muted p-2 rounded">
                  {shipment.factoryActualDeliveryDate || <span className="text-gray-400">未更新</span>}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">交期狀態</p>
                <div className="flex items-center">
                  <Badge
                    className={
                      deliveryStatus.status === "delayed"
                        ? "bg-red-500"
                        : deliveryStatus.status === "early"
                          ? "bg-green-500"
                          : "bg-blue-500"
                    }
                  >
                    {deliveryStatus.text}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isDeliveryDialogOpen} onOpenChange={setIsDeliveryDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>更新交期</DialogTitle>
              <DialogDescription>更新出貨的預計交貨日期。</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="customerUpdatedDate" className="text-right">
                  客戶更新交期
                </label>
                <Input
                  type="date"
                  id="customerUpdatedDate"
                  value={customerUpdatedDate}
                  onChange={(e) => setCustomerUpdatedDate(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="factoryActualDate" className="text-right">
                  工廠實際交期
                </label>
                <Input
                  type="date"
                  id="factoryActualDate"
                  value={factoryActualDate}
                  onChange={(e) => setFactoryActualDate(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsDeliveryDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" onClick={handleSaveDeliveryDates}>
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
