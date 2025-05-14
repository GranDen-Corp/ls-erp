import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderStatusUpdate } from "@/components/orders/order-status-update"
import { OrderStatusHistory } from "@/components/orders/order-status-history"
import { OrderShipmentBatches } from "@/components/orders/order-shipment-batches"
import { supabaseClient } from "@/lib/supabase-client"

// 從 Supabase 獲取訂單數據
async function getOrder(orderId: string) {
  try {
    // 使用 order_id 欄位查詢訂單
    const { data, error } = await supabaseClient.from("orders").select("*").eq("order_id", orderId).single()

    if (error) {
      console.error("獲取訂單數據失敗:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("獲取訂單數據時出錯:", error)
    return null
  }
}

// 模擬從API獲取訂單狀態歷史
async function getOrderStatusHistory(orderId: string) {
  // 這裡應該是從API獲取數據
  return [
    {
      id: "hist-1",
      orderId: orderId,
      status: "created",
      timestamp: "2023-01-15T10:30:00Z",
      userId: "user-1",
      userName: "John Doe",
      notes: "訂單創建",
    },
    {
      id: "hist-2",
      orderId: orderId,
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
          訂單 #{order.order_id}
          <span className="ml-2 text-lg font-normal text-muted-foreground">{order.customer_name}</span>
        </h1>
        <div className="text-sm text-muted-foreground">流水號: {order.order_sid}</div>
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
                    <dd>{order.order_id}</dd>
                    <dt className="font-medium">客戶</dt>
                    <dd>{order.customer_name}</dd>
                    <dt className="font-medium">訂單日期</dt>
                    <dd>{order.order_date}</dd>
                    <dt className="font-medium">交貨日期</dt>
                    <dd>{order.delivery_date}</dd>
                    <dt className="font-medium">狀態</dt>
                    <dd>{order.status}</dd>
                    <dt className="font-medium">總金額</dt>
                    <dd>${order.amount?.toLocaleString()}</dd>
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
                      {order.items?.map((item: any) => (
                        <tr key={item.id} className="border-b">
                          <td className="px-4 py-2">{item.product_name}</td>
                          <td className="px-4 py-2 text-right">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">${item.unit_price}</td>
                          <td className="px-4 py-2 text-right">
                            ${(item.quantity * item.unit_price).toLocaleString()}
                          </td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan={4} className="px-4 py-2 text-center">
                            無訂單項目
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right font-medium">
                          總計
                        </td>
                        <td className="px-4 py-2 text-right font-medium">${order.amount?.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <OrderStatusUpdate orderId={order.order_id} currentStatus={order.status} />
            <OrderStatusHistory history={statusHistory} />
          </TabsContent>

          <TabsContent value="shipment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>訂單分批出貨說明</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  此訂單總數量為 {order.total_quantity || "未知"} 件，可根據需要分批出貨。
                  每個批次可以設定不同的計劃出貨日期和數量。
                </p>
              </CardContent>
            </Card>

            <OrderShipmentBatches
              orderId={order.order_id}
              totalQuantity={order.total_quantity || 0}
              batches={order.shipment_batches || []}
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
