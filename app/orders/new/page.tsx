"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NewOrderForm } from "@/components/orders/new-order-form"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { generateOrderNumber } from "@/lib/order-number-generator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { marked } from "marked"

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
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [orderData, setOrderData] = useState<any>(null)
  const [canCreatePurchase, setCanCreatePurchase] = useState<boolean>(false)

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
        setOrderNumber("L-YYMMXXXXX (生成失敗)")
      } finally {
        setIsLoadingOrderNumber(false)
      }
    }

    fetchOrderNumber()

    return () => clearInterval(interval)
  }, [])

  // Use useCallback to prevent recreating these functions on every render
  const handleSubmit = useCallback(
    async (createPurchaseOrder = false) => {
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
        if (result && result[0]) {
          setCreatedOrderId(result[0].order_id)
          setOrderData(result[0])
          setCanCreatePurchase(true)
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
    },
    [router],
  )

  const handleCreatePurchaseOrder = useCallback(async () => {
    if (!formRef.current || !createdOrderId) return

    setIsCreatingPurchaseOrder(true)
    setSubmitError(null)

    try {
      // 使用已保存的訂單ID創建採購單
      const result = await formRef.current.createPurchaseOrdersOnly(createdOrderId)
      console.log("採購單創建成功:", result)

      // 3秒後跳轉到訂單列表
      setTimeout(() => {
        router.push("/orders")
      }, 3000)
    } catch (err: any) {
      console.error("採購單創建失敗:", err)
      setSubmitError(err.message || "創建採購單時發生錯誤")
    } finally {
      setIsCreatingPurchaseOrder(false)
    }
  }, [createdOrderId, router])

  const handleTestSubmit = useCallback(async () => {
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

      explanation += "\n### 產品列表\n"

      if (orderData.order_items && orderData.order_items.length > 0) {
        orderData.order_items.forEach((item: any, index: number) => {
          explanation += `\n#### 產品 ${index + 1}\n`
          explanation += `- 產品編號 (part_no): ${item.productPartNo}\n`
          explanation += `- 產品描述 (description): ${item.productName}\n`
          explanation += `- 數量 (quantity): ${item.quantity}\n`
          explanation += `- 單價 (unit_price): ${item.unitPrice}\n`
          explanation += `- 是否為組件 (is_assembly): ${item.isAssembly}\n`

          explanation += "\n##### 批次資訊\n"
          if (item.shipmentBatches && item.shipmentBatches.length > 0) {
            item.shipmentBatches.forEach((batch: any, batchIndex: number) => {
              explanation += `\n###### 批次 ${batchIndex + 1}\n`
              explanation += `- 批次編號 (batch_no): ${batch.batch_no || "(尚未設定)"}\n`
              explanation += `- 數量 (quantity): ${batch.quantity}\n`
              explanation += `- 交貨日期 (delivery_date): ${batch.delivery_date}\n`
            })
          } else {
            explanation += "無批次資訊\n"
          }
        })
      } else {
        explanation += "無產品資訊\n"
      }

      setTestData(marked.parse(explanation).toString())
    } catch (err: any) {
      console.error("獲取訂單資料失敗:", err)
      setTestData("獲取訂單資料失敗")
    } finally {
      setIsTestingSubmit(false)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>新建訂單</CardTitle>
          <CardDescription>請填寫訂單資訊</CardDescription>
        </CardHeader>
        <CardContent>
          {submitSuccess && (
            <Alert variant="success" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>成功</AlertTitle>
              <AlertDescription>訂單已成功提交。</AlertDescription>
            </Alert>
          )}
          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>錯誤</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="form">訂單表單</TabsTrigger>
              <TabsTrigger value="preview">預覽</TabsTrigger>
            </TabsList>
            <TabsContent value="form">
              <NewOrderForm
                ref={formRef}
                onSubmit={handleSubmit}
                createdOrderId={createdOrderId}
                currentStep={currentStep}
                orderData={orderData}
              />
            </TabsContent>
            <TabsContent value="preview">
              <div dangerouslySetInnerHTML={{ __html: testData }} />
            </TabsContent>
          </Tabs>
          <div className="flex justify-end mt-4">
            {!submitSuccess && (
              <Button onClick={() => handleSubmit(false)} disabled={isSubmitting} className="mr-2">
                提交訂單
              </Button>
            )}
            {canCreatePurchase && (
              <Button onClick={handleCreatePurchaseOrder} disabled={isCreatingPurchaseOrder} className="mr-2">
                創建採購單
              </Button>
            )}
            <Button onClick={handleTestSubmit} disabled={isTestingSubmit} variant="outline">
              測試提交
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
