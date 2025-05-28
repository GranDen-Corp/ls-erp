"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Dynamic import to avoid SSR issues
import dynamic from "next/dynamic"

const NewOrderForm = dynamic(
  () => import("@/components/orders/new-order-form").then((mod) => ({ default: mod.NewOrderForm })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">載入表單中...</span>
      </div>
    ),
    ssr: false,
  },
)

const generateOrderNumber = dynamic(
  () => import("@/lib/order-number-generator").then((mod) => mod.generateOrderNumber),
  {
    ssr: false,
  },
)

export default function NewOrderPage() {
  const router = useRouter()
  const [formattedDate, setFormattedDate] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isCreatingPurchaseOrder, setIsCreatingPurchaseOrder] = useState<boolean>(false)
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const formRef = useRef<any>(null)
  const hasSetOrderData = useRef(false)
  const [orderNumber, setOrderNumber] = useState<string>("")
  const [isLoadingOrderNumber, setIsLoadingOrderNumber] = useState<boolean>(true)
  const [testData, setTestData] = useState<string>("")
  const [isTestingSubmit, setIsTestingSubmit] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("form")
  const [createdOrderId, setCreatedOrderId] = useState<string>("")
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [orderData, setOrderData] = useState<any>(null)
  const [canCreatePurchase, setCanCreatePurchase] = useState<boolean>(false)
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)

    // Format date
    const now = new Date()
    setFormattedDate(now.toLocaleString("zh-TW"))

    // Update time every second
    const interval = setInterval(() => {
      const now = new Date()
      setFormattedDate(now.toLocaleString("zh-TW"))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Generate order number
  useEffect(() => {
    if (!isClient) return

    const fetchOrderNumber = async () => {
      try {
        setIsLoadingOrderNumber(true)
        // Simple fallback order number generation
        const now = new Date()
        const year = now.getFullYear().toString().slice(-2)
        const month = (now.getMonth() + 1).toString().padStart(2, "0")
        const day = now.getDate().toString().padStart(2, "0")
        const time = now.getTime().toString().slice(-4)
        const newOrderNumber = `L-${year}${month}${day}${time}`
        setOrderNumber(newOrderNumber)
      } catch (err) {
        console.error("獲取訂單編號失敗:", err)
        setOrderNumber("L-" + Date.now().toString().slice(-8))
      } finally {
        setIsLoadingOrderNumber(false)
      }
    }

    fetchOrderNumber()
  }, [isClient])

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
        if (result && result[0] && !hasSetOrderData.current) {
          setCreatedOrderId(result[0].order_id)
          setOrderData(result[0])
          setCanCreatePurchase(true)
          hasSetOrderData.current = true
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
      const result = await formRef.current.createPurchaseOrdersOnly(createdOrderId)
      console.log("採購單創建成功:", result)

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
      const orderData = await formRef.current.getOrderData(true)

      let explanation = "## 訂單資料預覽\n\n"
      explanation += `- 訂單編號: ${orderData.order_id || "(尚未設定)"}\n`
      explanation += `- 客戶ID: ${orderData.customer_id || "(尚未選擇)"}\n`
      explanation += `- 客戶PO編號: ${orderData.po_id || "(尚未填寫)"}\n`
      explanation += `- 付款條件: ${orderData.payment_terms || "(尚未填寫)"}\n`
      explanation += `- 交易條件: ${orderData.trade_terms || "(尚未填寫)"}\n`
      explanation += `- 備註: ${orderData.remarks || "(無)"}\n`

      setTestData(explanation)
    } catch (err: any) {
      console.error("獲取訂單資料失敗:", err)
      setTestData("獲取訂單資料失敗: " + err.message)
    } finally {
      setIsTestingSubmit(false)
    }
  }, [])

  if (!isClient) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card className="w-full max-w-6xl mx-auto">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">載入中...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>新建訂單</CardTitle>
          <CardDescription>
            當前時間: {formattedDate} | 訂單編號: {isLoadingOrderNumber ? "生成中..." : orderNumber}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitSuccess && (
            <Alert variant="default" className="mb-4 border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">成功</AlertTitle>
              <AlertDescription className="text-green-700">訂單已成功提交。3秒後將跳轉到訂單列表...</AlertDescription>
            </Alert>
          )}
          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>錯誤</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="form">訂單表單</TabsTrigger>
              <TabsTrigger value="preview">資料預覽</TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="mt-6">
              <NewOrderForm
                ref={formRef}
                onSubmit={handleSubmit}
                createdOrderId={createdOrderId}
                currentStep={currentStep}
                orderData={orderData}
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">訂單資料預覽</h3>
                  <Button onClick={handleTestSubmit} disabled={isTestingSubmit} variant="outline">
                    {isTestingSubmit ? "載入中..." : "重新載入預覽"}
                  </Button>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50 min-h-[400px]">
                  {testData ? (
                    <pre className="whitespace-pre-wrap text-sm">{testData}</pre>
                  ) : (
                    <p className="text-gray-500">點擊"重新載入預覽"查看當前表單資料</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            {!submitSuccess && (
              <>
                <Button onClick={() => handleSubmit(false)} disabled={isSubmitting} className="min-w-[120px]">
                  {isSubmitting ? "提交中..." : "提交訂單"}
                </Button>
                <Button
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  variant="secondary"
                  className="min-w-[140px]"
                >
                  {isSubmitting ? "處理中..." : "提交並創建採購單"}
                </Button>
              </>
            )}
            {canCreatePurchase && (
              <Button
                onClick={handleCreatePurchaseOrder}
                disabled={isCreatingPurchaseOrder}
                variant="outline"
                className="min-w-[120px]"
              >
                {isCreatingPurchaseOrder ? "創建中..." : "創建採購單"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
