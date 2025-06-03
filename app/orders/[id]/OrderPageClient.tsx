"use client"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderShipmentBatches } from "@/components/orders/order-shipment-batches"
import { PrintOrderReport } from "@/components/orders/print-order-report"
import { supabaseClient } from "@/lib/supabase-client"
import { Badge } from "@/components/ui/badge"
import { getOrderBatchItemsByOrderId } from "@/lib/services/order-batch-service"
import { Button } from "@/components/ui/button"
import { Printer, Edit, Save, X } from "lucide-react"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// 從 Supabase 獲取訂單數據
async function getOrder(orderId: string) {
  try {
    // 使用 order_id 欄位查詢訂單
    const { data, error } = await supabaseClient.from("orders").select("*").eq("order_id", orderId).single()

    if (error) {
      console.error("獲取訂單數據失敗:", error)
      return null
    }

    // 獲取訂單批次項目
    const batchResult = await getOrderBatchItemsByOrderId(orderId)

    if (batchResult.success && batchResult.data) {
      // 將批次項目添加到訂單數據中
      data.batch_items = batchResult.data

      // 計算訂單總數量和總金額
      let totalQuantity = 0
      let totalAmount = 0

      batchResult.data.forEach((item) => {
        totalQuantity += item.quantity || 0
        totalAmount += item.total_price || item.quantity * item.unit_price || 0
      })

      data.total_quantity = totalQuantity
      data.amount = totalAmount
    }

    return data
  } catch (error) {
    console.error("獲取訂單數據時出錯:", error)
    return null
  }
}

// 獲取訂單狀態列表
async function getOrderStatuses() {
  try {
    const { data, error } = await supabaseClient.from("order_statuses").select("*").eq("is_active", true)

    if (error) {
      console.error("獲取訂單狀態失敗:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("獲取訂單狀態時出錯:", error)
    return []
  }
}

// 獲取訂單狀態歷史
async function getOrderStatusHistory(orderId: string) {
  try {
    const { data, error } = await supabaseClient
      .from("order_status_history")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("獲取訂單狀態歷史失敗:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("獲取訂單狀態歷史時出錯:", error)
    return []
  }
}

export default function OrderPageClient({
  orderId,
}: {
  orderId: string
}) {  
  const [order, setOrder] = useState<any>(null)
  const [orderStatuses, setOrderStatuses] = useState<any[]>([])
  const [statusHistory, setStatusHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const orderData = await getOrder(orderId)
      const orderStatusesData = await getOrderStatuses()
      const statusHistoryData = await getOrderStatusHistory(orderId)

      if (orderData) {
        setOrder(orderData)
      }

      setOrderStatuses(orderStatusesData)
      setStatusHistory(statusHistoryData)
      setIsLoading(false)
    }

    fetchData()
  }, [orderId])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!order) {
    notFound()
  }

  // 獲取當前狀態信息
  const currentStatus = orderStatuses.find((s) => s.status_code === order.status)

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          訂單 #{order.order_id}
          <span className="ml-2 text-lg font-normal text-muted-foreground">{order.customer_name}</span>
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">流水號: {order.order_sid}</div>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            編輯訂單
          </Button>
          <PrintOrderReport
            orderData={{
              order_id: order.order_id,
              po_id: order.po_id,
              customer_name: order.customer_name,
              customer_address: order.customer_address,
              customer_contact: order.customer_contact,
              order_date: order.order_date,
              delivery_date: order.delivery_date,
              payment_terms: order.payment_terms,
              trade_terms: order.trade_terms,
              remarks: order.remarks,
              amount: order.amount || 0,
              currency: order.currency || "USD",
              batch_items: order.batch_items || [],
              order_info: order.order_info || {},
            }}
            trigger={
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                列印報表
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid gap-6">
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">訂單資訊</TabsTrigger>
            <TabsTrigger value="products">訂單產品列表</TabsTrigger>
            <TabsTrigger value="remarks">訂單備註</TabsTrigger>
            <TabsTrigger value="shipment">分批出貨管理</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <OrderDetailsTab
              order={order}
              orderStatuses={orderStatuses}
              currentStatus={currentStatus}
              statusHistory={statusHistory}
            />
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <OrderProductsTab order={order} />
          </TabsContent>

          <TabsContent value="remarks" className="space-y-4">
            <OrderRemarksTab order={order} />
          </TabsContent>

          <TabsContent value="shipment" className="space-y-4">
            <OrderShipmentTab order={order} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// 訂單資訊分頁組件
function OrderDetailsTab({ order, orderStatuses, currentStatus, statusHistory }: any) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedOrder, setEditedOrder] = useState(order)

  const handleSave = async () => {
    // 實現保存邏輯
    setIsEditing(false)
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabaseClient.from("orders").update({ status: newStatus }).eq("order_id", order.order_id)

      if (!error) {
        // 重新載入頁面或更新狀態
        window.location.reload()
      }
    } catch (error) {
      console.error("更新狀態失敗:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* 基本訂單資訊 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>基本資訊</CardTitle>
          <div className="flex items-center gap-2">
            {currentStatus && (
              <Badge className={`${currentStatus.color} text-white border-0 px-3 py-1`}>{currentStatus.name_zh}</Badge>
            )}
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                編輯
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  取消
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>訂單編號</Label>
                <Input value={order.order_id} disabled />
              </div>
              <div>
                <Label>客戶PO編號</Label>
                <Input
                  value={editedOrder.po_id || ""}
                  disabled={!isEditing}
                  onChange={(e) => setEditedOrder({ ...editedOrder, po_id: e.target.value })}
                />
              </div>
              <div>
                <Label>客戶名稱</Label>
                <Input value={order.customer_name || ""} disabled />
              </div>
              <div>
                <Label>訂單日期</Label>
                <Input
                  type="date"
                  value={editedOrder.order_date || ""}
                  disabled={!isEditing}
                  onChange={(e) => setEditedOrder({ ...editedOrder, order_date: e.target.value })}
                />
              </div>
              <div>
                <Label>交貨日期</Label>
                <Input
                  type="date"
                  value={editedOrder.delivery_date || ""}
                  disabled={!isEditing}
                  onChange={(e) => setEditedOrder({ ...editedOrder, delivery_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>付款條件</Label>
                <Input
                  value={editedOrder.payment_terms || ""}
                  disabled={!isEditing}
                  onChange={(e) => setEditedOrder({ ...editedOrder, payment_terms: e.target.value })}
                />
              </div>
              <div>
                <Label>交易條件</Label>
                <Input
                  value={editedOrder.trade_terms || ""}
                  disabled={!isEditing}
                  onChange={(e) => setEditedOrder({ ...editedOrder, trade_terms: e.target.value })}
                />
              </div>
              <div>
                <Label>總金額</Label>
                <Input
                  type="number"
                  value={editedOrder.amount || 0}
                  disabled={!isEditing}
                  onChange={(e) => setEditedOrder({ ...editedOrder, amount: Number.parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>幣別</Label>
                <Input
                  value={editedOrder.currency || "USD"}
                  disabled={!isEditing}
                  onChange={(e) => setEditedOrder({ ...editedOrder, currency: e.target.value })}
                />
              </div>
              <div>
                <Label>訂單狀態</Label>
                <Select
                  value={String(editedOrder.status || "")}
                  onValueChange={handleStatusChange}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map((status: any) => (
                      <SelectItem key={status.status_code} value={String(status.status_code)}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                          {status.name_zh}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 狀態更新歷史 */}
      <Card>
        <CardHeader>
          <CardTitle>狀態更新歷史</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {statusHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">暫無狀態更新記錄</p>
            ) : (
              statusHistory.map((history: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Badge className={`${history.status_color || "bg-gray-500"} text-white border-0`}>
                      {history.status_name}
                    </Badge>
                    <span className="text-sm">{history.notes || "狀態更新"}</span>
                  </div>
                  <div className="text-sm text-gray-500">{new Date(history.created_at).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 訂單產品列表分頁組件
function OrderProductsTab({ order }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>產品列表</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">產品編號</th>
                <th className="px-4 py-2 text-left">產品描述</th>
                <th className="px-4 py-2 text-left">批次</th>
                <th className="px-4 py-2 text-right">數量</th>
                <th className="px-4 py-2 text-right">單價</th>
                <th className="px-4 py-2 text-right">總價</th>
                <th className="px-4 py-2 text-center">狀態</th>
              </tr>
            </thead>
            <tbody>
              {order.batch_items?.map((item: any) => (
                <tr key={item.order_batch_id} className="border-b">
                  <td className="px-4 py-2">
                    <div className="font-medium">{item.part_no}</div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="text-sm">{item.description}</div>
                  </td>
                  <td className="px-4 py-2">
                    {item.product_index}-{item.batch_number}
                  </td>
                  <td className="px-4 py-2 text-right">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">${item.unit_price}</td>
                  <td className="px-4 py-2 text-right">
                    ${(item.total_price || item.quantity * item.unit_price).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Badge variant="outline">{item.status}</Badge>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={7} className="px-4 py-2 text-center">
                    無產品項目
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// 訂單備註分頁組件
function OrderRemarksTab({ order }: any) {
  const [isEditing, setIsEditing] = useState(false)
  const [remarks, setRemarks] = useState(order.remarks || "")

  const handleSave = async () => {
    try {
      const { error } = await supabaseClient.from("orders").update({ remarks }).eq("order_id", order.order_id)

      if (!error) {
        setIsEditing(false)
      }
    } catch (error) {
      console.error("保存備註失敗:", error)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>訂單備註</CardTitle>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            編輯備註
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          disabled={!isEditing}
          rows={10}
          placeholder="請輸入訂單備註..."
          className="w-full"
        />
      </CardContent>
    </Card>
  )
}

// 分批出貨管理分頁組件
function OrderShipmentTab({ order }: any) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>分批出貨說明</CardTitle>
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
        }}
        onUpdateBatch={(batch) => {
          console.log("Update batch", batch)
        }}
      />
    </div>
  )
}
