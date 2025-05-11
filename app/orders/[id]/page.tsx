import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderStatusUpdate } from "@/components/orders/order-status-update"
import { OrderStatusHistory } from "@/components/orders/order-status-history"
import { OrderShipmentBatches } from "@/components/orders/order-shipment-batches"

// 模擬從API獲取訂單數據
async function getOrder(id: string) {
  // 這裡應該是從API獲取數據
  const order = {
    id,
    orderNumber: "ORD-2023-" + id.substring(0, 4),
    customerId: "CUST-001",
    customerName: "ABC Electronics Co., Ltd.",
    orderDate: "2023-01-15",
    deliveryDate: "2023-03-30",
    status: "processing",
    totalAmount: 15000,
    items: [
      {
        id: "item-1",
        productId: "PROD-001",
        productName: "Wireless Headphones",
        quantity: 300,
        unitPrice: 50,
        totalPrice: 15000,
      },
    ],
    shipmentBatches: [
      {
        id: "batch-1",
        orderId: id,
        batchNumber: 1,
        quantity: 100,
        plannedShipDate: "2023-01-10",
        actualShipDate: "2023-01-10",
        status: "delivered",
        isDelayed: false,
        notes: "第一批出貨",
      },
      {
        id: "batch-2",
        orderId: id,
        batchNumber: 2,
        quantity: 200,
        plannedShipDate: "2023-03-10",
        status: "pending",
        isDelayed: false,
        notes: "第二批出貨",
      },
    ],
    notes: "客戶要求分批出貨",
  }

  return order
}

// 模擬從API獲取訂單狀態歷史
async function getOrderStatusHistory(id: string) {
  // 這裡應該是從API獲取數據
  return [
    {
      id: "hist-1",
      orderId: id,
      status: "created",
      timestamp: "2023-01-15T10:30:00Z",
      userId: "user-1",
      userName: "John Doe",
      notes: "訂單創建",
    },
    {
      id: "hist-2",
      orderId: id,
      status: "processing",
      timestamp: "2023-01-16T09:15:00Z",
      userId: "user-2",
      userName: "Jane Smith",
      notes: "訂單處理開始",
    },
  ]
}

export const metadata: Metadata = {
  title: "訂單詳情",
  description: "查看和管理訂單詳情",
}

export default async function OrderPage({
  params,
}: {
  params: { id: string }
}) {
  const order = await getOrder(params.id)
  const statusHistory = await getOrderStatusHistory(params.id)

  if (!order) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          訂單 #{order.orderNumber}
          <span className="ml-2 text-lg font-normal text-muted-foreground">{order.customerName}</span>
        </h1>
      </div>

      <div className="grid gap-6">
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">訂單詳情</TabsTrigger>
            <TabsTrigger value="status">狀態更新</TabsTrigger>
            <TabsTrigger value="shipment">分批出貨管理</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>訂單信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <dt className="font-medium">訂單號</dt>
                    <dd>{order.orderNumber}</dd>
                    <dt className="font-medium">客戶</dt>
                    <dd>{order.customerName}</dd>
                    <dt className="font-medium">訂單日期</dt>
                    <dd>{order.orderDate}</dd>
                    <dt className="font-medium">交貨日期</dt>
                    <dd>{order.deliveryDate}</dd>
                    <dt className="font-medium">狀態</dt>
                    <dd>{order.status}</dd>
                    <dt className="font-medium">總金額</dt>
                    <dd>${order.totalAmount.toLocaleString()}</dd>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>備註</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{order.notes || "無備註"}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>訂單項目</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">產品</th>
                        <th className="px-4 py-2 text-right">數量</th>
                        <th className="px-4 py-2 text-right">單價</th>
                        <th className="px-4 py-2 text-right">總價</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="px-4 py-2">{item.productName}</td>
                          <td className="px-4 py-2 text-right">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">${item.unitPrice}</td>
                          <td className="px-4 py-2 text-right">${item.totalPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right font-medium">
                          總計
                        </td>
                        <td className="px-4 py-2 text-right font-medium">${order.totalAmount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />
            <OrderStatusHistory history={statusHistory} />
          </TabsContent>

          <TabsContent value="shipment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>訂單分批出貨說明</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  此訂單總數量為 {order.items.reduce((sum, item) => sum + item.quantity, 0)} 件，可根據需要分批出貨。
                  每個批次可以設定不同的計劃出貨日期和數量。
                </p>
              </CardContent>
            </Card>

            <OrderShipmentBatches
              orderId={order.id}
              totalQuantity={order.items.reduce((sum, item) => sum + item.quantity, 0)}
              batches={order.shipmentBatches || []}
              onAddBatch={(batch) => {
                console.log("Add batch", batch)
                // 這裡應該是調用API添加批次
              }}
              onUpdateBatch={(batch) => {
                console.log("Update batch", batch)
                // 這裡應該是調用API更新批次
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
