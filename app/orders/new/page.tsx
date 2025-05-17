"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NewOrderForm } from "@/components/orders/new-order-form"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, FileText, ShoppingCart } from "lucide-react"
import { generateOrderNumber } from "@/lib/order-utils"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NewOrderPage() {
  const router = useRouter()
  const [formattedDate, setFormattedDate] = useState<string>(
    format(new Date(), "yyyy/MM/dd HH:mm:ss", { locale: zhTW }),
  )
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isCreatingPurchaseOrder, setIsCreatingPurchaseOrder] = useState<boolean>(false)
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const formRef = useRef<any>(null)
  const [orderNumber, setOrderNumber] = useState<string>("")
  const [isLoadingOrderNumber, setIsLoadingOrderNumber] = useState<boolean>(true)
  const [testData, setTestData] = useState<string>("")
  const [isTestingSubmit, setIsTestingSubmit] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("form")
  const [createdOrderId, setCreatedOrderId] = useState<string>("")

  // 更新時間和訂單編號
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      setFormattedDate(format(now, "yyyy/MM/dd HH:mm:ss", { locale: zhTW }))
    }

    const interval = setInterval(updateDateTime, 1000)

    // 獲取訂單編號
    const fetchOrderNumber = async () => {
      try {
        setIsLoadingOrderNumber(true)
        const newOrderNumber = await generateOrderNumber()
        setOrderNumber(newOrderNumber)
      } catch (err) {
        console.error("獲取訂單編號失敗:", err)
        setOrderNumber("L-YYMMDD-XXXXX (生成失敗)")
      } finally {
        setIsLoadingOrderNumber(false)
      }
    }

    fetchOrderNumber()

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (createPurchaseOrder = false) => {
    if (!formRef.current) return

    setIsSubmitting(true)
    setIsCreatingPurchaseOrder(createPurchaseOrder)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      const result = await formRef.current.submitOrder(createPurchaseOrder)
      console.log("訂單提交成功:", result)
      setSubmitSuccess(true)

      // 保存創建的訂單ID，以便後續使用
      if (result && result.data && result.data[0]) {
        setCreatedOrderId(result.data[0].order_id)
      }

      // 3秒後跳轉到訂單列表
      setTimeout(() => {
        router.push("/orders")
      }, 3000)
    } catch (err: any) {
      console.error("訂單提交失敗:", err)
      setSubmitError(err.message || "提交訂單時發生錯誤")
    } finally {
      setIsSubmitting(false)
      setIsCreatingPurchaseOrder(false)
    }
  }

  const handleTestSubmit = async () => {
    if (!formRef.current) return

    setIsTestingSubmit(true)
    setTestData("")

    try {
      // 獲取訂單資料但不提交，並且跳過驗證
      const orderData = await formRef.current.getOrderData(true)

      // 生成人類可讀的說明
      let explanation = "## 訂單資料與資料庫欄位對應\n\n"

      // 檢查表單是否有缺少必填欄位
      const missingFields = []
      if (!orderData.customer_id) missingFields.push("客戶")
      if (!orderData.po_id) missingFields.push("客戶PO編號")
      if (!orderData.order_items || orderData.order_items.length === 0) missingFields.push("產品")

      if (missingFields.length > 0) {
        explanation += "⚠️ **警告：表單尚未完成，以下欄位缺少資料：**\n"
        missingFields.forEach((field) => {
          explanation += `- ${field}\n`
        })
        explanation += "\n這是目前表單的預覽資料，實際提交時需要填寫完整。\n\n"
      }

      explanation += "### 基本資訊\n"
      explanation += `- 訂單編號 (order_id): ${orderData.order_id || "(尚未設定)"}\n`
      explanation += `- 客戶ID (customer_id): ${orderData.customer_id || "(尚未選擇)"}\n`
      explanation += `- 客戶PO編號 (po_id): ${orderData.po_id || "(尚未填寫)"}\n`
      explanation += `- 付款條件 (payment_term): ${orderData.payment_term || "(尚未填寫)"}\n`
      explanation += `- 交貨條件 (delivery_terms): ${orderData.delivery_terms || "(尚未填寫)"}\n`
      explanation += `- 訂單狀態 (status): ${orderData.status} (0 = 待確認)\n`
      explanation += `- 備註 (remarks): ${orderData.remarks || "(無)"}\n`
      explanation += `- 創建時間 (created_at): ${orderData.created_at}\n`

      if (orderData.part_no_assembly) {
        explanation += `- 組件產品編號 (part_no_assembly): ${orderData.part_no_assembly}\n`
      }

      explanation += "\n### 產品列表 (part_no_list)\n"

      if (orderData.part_no_list) {
        try {
          const partsList = JSON.parse(orderData.part_no_list)
          if (partsList.length === 0) {
            explanation += "尚未添加產品\n"
          } else {
            partsList.forEach((part: any, index: number) => {
              explanation += `\n#### 產品 ${index + 1}\n`
              explanation += `- 產品編號 (part_no): ${part.part_no}\n`
              explanation += `- 產品描述 (description): ${part.description}\n`
              explanation += `- 數量 (quantity): ${part.quantity}\n`
              explanation += `- 單價 (unit_price): ${part.unit_price}\n`
              explanation += `- 是否為組件 (is_assembly): ${part.is_assembly}\n`

              explanation += "\n##### 批次資訊\n"
              if (part.shipment_batches && part.shipment_batches.length > 0) {
                part.shipment_batches.forEach((batch: any, batchIndex: number) => {
                  explanation += `\n###### 批次 ${batchIndex + 1}\n`
                  explanation += `- 批次編號 (batch_number): ${batch.batch_number}\n`
                  explanation += `- 計劃出貨日期 (planned_ship_date): ${batch.planned_ship_date || "(尚未設定)"}\n`
                  explanation += `- 數量 (quantity): ${batch.quantity}\n`
                  explanation += `- 備註 (notes): ${batch.notes || "無"}\n`
                })
              } else {
                explanation += "尚未設定批次\n"
              }
            })
          }
        } catch (e) {
          explanation += "無法解析產品列表JSON\n"
        }
      } else {
        explanation += "尚未添加產品\n"
      }

      // 添加採購資料
      explanation += "\n### 採購資料\n"
      if (orderData.procurement_items && orderData.procurement_items.length > 0) {
        explanation += `共 ${orderData.procurement_items.length} 項採購資料，其中 ${
          orderData.procurement_items.filter((item: any) => item.isSelected).length
        } 項已選擇\n\n`

        // 按工廠分組
        const itemsByFactory: Record<string, any[]> = {}
        orderData.procurement_items
          .filter((item: any) => item.isSelected)
          .forEach((item: any) => {
            if (!item.factoryId) return
            if (!itemsByFactory[item.factoryId]) {
              itemsByFactory[item.factoryId] = []
            }
            itemsByFactory[item.factoryId].push(item)
          })

        // 顯示每個工廠的採購項目
        Object.entries(itemsByFactory).forEach(([factoryId, items]) => {
          const factoryName = items[0].factoryName
          explanation += `#### 工廠: ${factoryName} (${factoryId})\n`
          items.forEach((item, index) => {
            explanation += `- 產品 ${index + 1}: ${item.productPartNo} - ${item.productName}\n`
            explanation += `  - 數量: ${item.quantity}\n`
            explanation += `  - 採購單價: ${item.purchasePrice}\n`
            explanation += `  - 交期: ${item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString() : "未設定"}\n`
          })
          explanation += `- 總採購金額: ${items
            .reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0)
            .toFixed(2)} USD\n\n`
        })
      } else {
        explanation += "尚未設定採購資料\n"
      }

      explanation += "\n\n## 完整JSON資料\n\n```json\n"
      explanation += JSON.stringify(orderData, null, 2)
      explanation += "\n```"

      setTestData(explanation)
      setActiveTab("test")
    } catch (err: any) {
      console.error("測試提交失敗:", err)
      setTestData(`測試提交失敗: ${err.message || "未知錯誤"}`)
    } finally {
      setIsTestingSubmit(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">新增訂單</h1>
          <p className="text-muted-foreground">建立新訂單 - 當前時間: {formattedDate}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/orders")}>
            取消
          </Button>
          <Button
            variant="outline"
            onClick={handleTestSubmit}
            disabled={isTestingSubmit || isSubmitting}
            className="bg-amber-50 hover:bg-amber-100 border-amber-200"
          >
            {isTestingSubmit ? (
              "處理中..."
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                測試資料
              </>
            )}
          </Button>
          <Button onClick={() => handleSubmit(false)} disabled={isSubmitting || isCreatingPurchaseOrder}>
            {isSubmitting && !isCreatingPurchaseOrder ? "處理中..." : "儲存訂單"}
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting || isCreatingPurchaseOrder}
            className="bg-green-600 hover:bg-green-700"
          >
            {isCreatingPurchaseOrder ? (
              "處理中..."
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                儲存訂單並建立採購單
              </>
            )}
          </Button>
        </div>
      </div>

      {submitSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>訂單建立成功</AlertTitle>
          <AlertDescription>
            {isCreatingPurchaseOrder ? "訂單和採購單已成功建立" : "訂單已成功建立"}，即將跳轉到訂單列表...
          </AlertDescription>
        </Alert>
      )}

      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>訂單建立失敗</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="form">訂單表單</TabsTrigger>
          <TabsTrigger value="test" disabled={!testData}>
            測試資料
          </TabsTrigger>
        </TabsList>
        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>訂單資訊</CardTitle>
              <CardDescription>填寫訂單詳細資訊，包括客戶、產品和交付條件等。</CardDescription>
            </CardHeader>
            <CardContent>
              <NewOrderForm
                ref={formRef}
                orderNumber={orderNumber}
                isLoadingOrderNumber={isLoadingOrderNumber}
                onSubmit={handleSubmit}
                createdOrderId={createdOrderId} // 傳遞創建的訂單ID
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>測試資料</CardTitle>
              <CardDescription>以下是將要儲存到資料庫的資料及其對應關係</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={testData}
                readOnly
                className="font-mono text-sm h-96 overflow-auto whitespace-pre-wrap"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
