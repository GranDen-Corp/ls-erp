"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderShipmentBatches } from "@/components/orders/order-shipment-batches"
import { PrintOrderReport } from "@/components/orders/print-order-report"
import { supabaseClient } from "@/lib/supabase-client"
import { Badge } from "@/components/ui/badge"
import { getOrderBatchItemsByOrderId } from "@/lib/services/order-batch-service"
import { Button } from "@/components/ui/button"
import { Printer, Edit, Save, X, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"

export default function OrderPageClient({
  params,
}: {
  params: { id: string }
}) {
  const [order, setOrder] = useState<any>(null)
  const [orderStatuses, setOrderStatuses] = useState<any[]>([])
  const [statusHistory, setStatusHistory] = useState<any[]>([])
  const [customers, setCustomers] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // 1. 獲取訂單數據
        const { data: orderData, error: orderError } = await supabaseClient
          .from("orders")
          .select("*")
          .eq("order_id", params.id)
          .single()

        if (orderError) {
          console.error("獲取訂單數據失敗:", orderError)
          setError("獲取訂單數據失敗")
          return
        }

        // 2. 獲取客戶數據
        const { data: customersData, error: customersError } = await supabaseClient.from("customers").select("*")

        if (!customersError && customersData) {
          const customerMap: Record<string, any> = {}
          customersData.forEach((customer) => {
            customerMap[customer.customer_id] = customer
          })
          setCustomers(customerMap)

          // 更新訂單中的客戶信息
          if (orderData && customerMap[orderData.customer_id]) {
            const customer = customerMap[orderData.customer_id]
            orderData.customer_name =
              customer.customer_short_name || customer.customer_full_name || orderData.customer_id
            orderData.customer_address = customer.invoice_address || customer.ship_to_address
            orderData.customer_contact = customer.client_contact_person
          }
        }

        // 3. 獲取訂單批次項目
        if (orderData) {
          const batchResult = await getOrderBatchItemsByOrderId(orderData.order_id)
          if (batchResult.success && batchResult.data) {
            orderData.batch_items = batchResult.data

            // 計算訂單總數量和總金額
            let totalQuantity = 0
            let totalAmount = 0

            batchResult.data.forEach((item) => {
              totalQuantity += item.quantity || 0
              totalAmount += item.total_price || item.quantity * item.unit_price || 0
            })

            orderData.total_quantity = totalQuantity
            if (!orderData.amount) {
              orderData.amount = totalAmount
            }
          }
        }

        // 4. 獲取訂單狀態列表
        const { data: statusesData, error: statusesError } = await supabaseClient
          .from("order_statuses")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })

        if (!statusesError && statusesData) {
          setOrderStatuses(statusesData)
        }

        // 5. 獲取訂單狀態歷史
        const { data: historyData, error: historyError } = await supabaseClient
          .from("order_status_history")
          .select("*")
          .eq("order_id", params.id)
          .order("created_at", { ascending: false })

        if (!historyError && historyData) {
          setStatusHistory(historyData)
        }

        setOrder(orderData)
      } catch (error) {
        console.error("獲取數據時出錯:", error)
        setError("獲取數據時發生錯誤")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>
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
          <span className="ml-2 text-lg font-normal text-muted-foreground">
            {order.customer_name || order.customer_id}
          </span>
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">流水號: {order.order_sid}</div>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = `/orders/${order.order_id}/edit`)}>
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
              setOrder={setOrder}
              orderStatuses={orderStatuses}
              currentStatus={currentStatus}
              statusHistory={statusHistory}
              setStatusHistory={setStatusHistory}
            />
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <OrderProductsTab order={order} />
          </TabsContent>

          <TabsContent value="remarks" className="space-y-4">
            <OrderRemarksTab order={order} setOrder={setOrder} />
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
function OrderDetailsTab({ order, setOrder, orderStatuses, currentStatus, statusHistory, setStatusHistory }: any) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedOrder, setEditedOrder] = useState(order)

  const handleSave = async () => {
    try {
      const { error } = await supabaseClient
        .from("orders")
        .update({
          po_id: editedOrder.po_id,
          order_date: editedOrder.order_date,
          delivery_date: editedOrder.delivery_date,
          payment_terms: editedOrder.payment_terms,
          trade_terms: editedOrder.trade_terms,
          amount: editedOrder.amount,
          currency: editedOrder.currency,
        })
        .eq("order_id", order.order_id)

      if (!error) {
        setOrder(editedOrder)
        setIsEditing(false)
      }
    } catch (error) {
      console.error("保存訂單失敗:", error)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const oldStatus = order.status
      const statusInfo = orderStatuses.find((s) => s.status_code === Number.parseInt(newStatus))

      // 更新訂單狀態
      const { error } = await supabaseClient
        .from("orders")
        .update({ status: Number.parseInt(newStatus) })
        .eq("order_id", order.order_id)

      if (!error) {
        // 記錄狀態變更歷史
        await supabaseClient.from("order_status_history").insert([
          {
            order_id: order.order_id,
            old_status: oldStatus,
            new_status: Number.parseInt(newStatus),
            status_name: statusInfo?.name_zh || `狀態${newStatus}`,
            status_color: statusInfo?.color || "bg-gray-500",
            notes: `狀態從 ${oldStatus} 更新為 ${newStatus}`,
            changed_by: "系統用戶", // 這裡應該是當前登入用戶
          },
        ])

        // 更新本地狀態
        setOrder({ ...order, status: Number.parseInt(newStatus) })

        // 重新載入狀態歷史
        const { data: historyData } = await supabaseClient
          .from("order_status_history")
          .select("*")
          .eq("order_id", order.order_id)
          .order("created_at", { ascending: false })

        if (historyData) {
          setStatusHistory(historyData)
        }
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
                <Input value={order.customer_name || order.customer_id || ""} disabled />
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
                <Select value={String(order.status || "")} onValueChange={handleStatusChange}>
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
                    {history.changed_by && <span className="text-xs text-gray-500">by {history.changed_by}</span>}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(history.created_at), "yyyy/MM/dd HH:mm", { locale: zhTW })}
                  </div>
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
            <tfoot>
              <tr>
                <td colSpan={5} className="px-4 py-2 text-right font-medium">
                  總計
                </td>
                <td className="px-4 py-2 text-right font-medium">${order.amount?.toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// 訂單備註分頁組件
function OrderRemarksTab({ order, setOrder }: any) {
  const [isEditing, setIsEditing] = useState(false)
  const [remarks, setRemarks] = useState(order.remarks || "")

  const handleSave = async () => {
    try {
      const { error } = await supabaseClient.from("orders").update({ remarks }).eq("order_id", order.order_id)

      if (!error) {
        setOrder({ ...order, remarks })
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
