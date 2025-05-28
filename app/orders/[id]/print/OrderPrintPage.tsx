"use client"

import { useEffect, useState } from "react"
import { supabaseClient } from "@/lib/supabase-client"
import { getOrderBatchItemsByOrderId } from "@/lib/services/order-batch-service"
import { Button } from "@/components/ui/button"
import { Printer, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"

export default function OrderPrintPage({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [customer, setCustomer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 獲取訂單數據
        const { data: orderData, error: orderError } = await supabaseClient
          .from("orders")
          .select("*")
          .eq("order_id", orderId)
          .single()

        if (orderError) {
          console.error("獲取訂單數據失敗:", orderError)
          return
        }

        // 獲取客戶數據
        if (orderData.customer_id) {
          const { data: customerData } = await supabaseClient
            .from("customers")
            .select("*")
            .eq("customer_id", orderData.customer_id)
            .single()

          if (customerData) {
            setCustomer(customerData)
            orderData.customer_name = customerData.customer_short_name || customerData.customer_full_name
            orderData.customer_address = customerData.invoice_address || customerData.ship_to_address
            orderData.customer_contact = customerData.client_contact_person
          }
        }

        // 獲取批次項目
        const batchResult = await getOrderBatchItemsByOrderId(orderId)
        if (batchResult.success && batchResult.data) {
          orderData.batch_items = batchResult.data

          // 計算總金額
          let totalAmount = 0
          batchResult.data.forEach((item) => {
            totalAmount += item.total_price || item.quantity * item.unit_price || 0
          })
          orderData.amount = totalAmount
        }

        setOrder(orderData)
      } catch (error) {
        console.error("獲取數據時出錯:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [orderId])

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return <div className="flex justify-center items-center py-8">載入中...</div>
  }

  if (!order) {
    return <div className="text-center text-red-500 py-4">找不到訂單數據</div>
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 列印控制按鈕 - 只在螢幕上顯示 */}
      <div className="print:hidden p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            列印
          </Button>
        </div>
      </div>

      {/* 列印內容 */}
      <div className="p-8 max-w-4xl mx-auto">
        {/* 公司標頭 */}
        <div className="text-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold mb-2">LockSure Corporation</h1>
          <p className="text-gray-600">訂單確認書 / Order Confirmation</p>
        </div>

        {/* 訂單基本資訊 */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">訂單資訊</h2>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="w-24 font-medium">訂單編號:</span>
                <span>{order.order_id}</span>
              </div>
              <div className="flex">
                <span className="w-24 font-medium">客戶PO:</span>
                <span>{order.po_id || "-"}</span>
              </div>
              <div className="flex">
                <span className="w-24 font-medium">訂單日期:</span>
                <span>
                  {order.order_date ? format(new Date(order.order_date), "yyyy/MM/dd", { locale: zhTW }) : "-"}
                </span>
              </div>
              <div className="flex">
                <span className="w-24 font-medium">交貨日期:</span>
                <span>
                  {order.delivery_date ? format(new Date(order.delivery_date), "yyyy/MM/dd", { locale: zhTW }) : "-"}
                </span>
              </div>
              <div className="flex">
                <span className="w-24 font-medium">付款條件:</span>
                <span>{order.payment_terms || "-"}</span>
              </div>
              <div className="flex">
                <span className="w-24 font-medium">交易條件:</span>
                <span>{order.trade_terms || "-"}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">客戶資訊</h2>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="w-24 font-medium">客戶名稱:</span>
                <span>{order.customer_name || order.customer_id}</span>
              </div>
              <div className="flex">
                <span className="w-24 font-medium">聯絡人:</span>
                <span>{order.customer_contact || "-"}</span>
              </div>
              <div className="flex">
                <span className="w-24 font-medium">地址:</span>
                <span>{order.customer_address || "-"}</span>
              </div>
              {customer && (
                <>
                  <div className="flex">
                    <span className="w-24 font-medium">電話:</span>
                    <span>{customer.customer_phone || "-"}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 font-medium">傳真:</span>
                    <span>{customer.customer_fax || "-"}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 產品列表 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">產品明細</h2>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-left">項次</th>
                <th className="border border-gray-300 px-3 py-2 text-left">產品編號</th>
                <th className="border border-gray-300 px-3 py-2 text-left">產品描述</th>
                <th className="border border-gray-300 px-3 py-2 text-center">數量</th>
                <th className="border border-gray-300 px-3 py-2 text-center">單位</th>
                <th className="border border-gray-300 px-3 py-2 text-right">單價</th>
                <th className="border border-gray-300 px-3 py-2 text-right">金額</th>
              </tr>
            </thead>
            <tbody>
              {order.batch_items?.map((item: any, index: number) => (
                <tr key={item.order_batch_id}>
                  <td className="border border-gray-300 px-3 py-2 text-center">{index + 1}</td>
                  <td className="border border-gray-300 px-3 py-2">{item.part_no}</td>
                  <td className="border border-gray-300 px-3 py-2">{item.description}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">{item.unit || "PCS"}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">
                    {order.currency || "USD"} {item.unit_price?.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right">
                    {order.currency || "USD"} {(item.total_price || item.quantity * item.unit_price)?.toLocaleString()}
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={7} className="border border-gray-300 px-3 py-2 text-center">
                    無產品項目
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={6} className="border border-gray-300 px-3 py-2 text-right">
                  總計:
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right">
                  {order.currency || "USD"} {order.amount?.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 備註 */}
        {order.remarks && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">備註</h2>
            <div className="text-sm whitespace-pre-wrap">{order.remarks}</div>
          </div>
        )}

        {/* 簽名區域 */}
        <div className="grid grid-cols-2 gap-8 mt-12">
          <div>
            <div className="border-b border-gray-400 mb-2 pb-8"></div>
            <p className="text-sm text-center">客戶簽名 / Customer Signature</p>
            <p className="text-xs text-center text-gray-500 mt-1">日期 / Date: _______________</p>
          </div>
          <div>
            <div className="border-b border-gray-400 mb-2 pb-8"></div>
            <p className="text-sm text-center">LockSure 業務簽名 / Sales Signature</p>
            <p className="text-xs text-center text-gray-500 mt-1">日期 / Date: _______________</p>
          </div>
        </div>

        {/* 頁腳 */}
        <div className="mt-12 pt-4 border-t text-xs text-gray-500 text-center">
          <p>此訂單確認書一式兩份，雙方各執一份</p>
          <p>This order confirmation is made in duplicate, each party keeps one copy</p>
        </div>
      </div>
    </div>
  )
}
