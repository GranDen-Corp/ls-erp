"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NewOrderForm } from "@/components/orders/new-order-form"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { generateOrderNumber } from "@/lib/order-utils"

export default function NewOrderTestPage() {
  const router = useRouter()
  const [formattedDate, setFormattedDate] = useState<string>(
    format(new Date(), "yyyy/MM/dd HH:mm:ss", { locale: zhTW }),
  )
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const formRef = useRef<any>(null)
  const [orderNumber, setOrderNumber] = useState<string>("")
  const [isLoadingOrderNumber, setIsLoadingOrderNumber] = useState<boolean>(true)

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
        setOrderNumber("L-YYYYMMDD-XXXXX (生成失敗)")
      } finally {
        setIsLoadingOrderNumber(false)
      }
    }

    fetchOrderNumber()

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async () => {
    if (!formRef.current) return

    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      const result = await formRef.current.submitOrder()
      console.log("訂單提交成功:", result)
      setSubmitSuccess(true)

      // 3秒後跳轉到訂單列表
      setTimeout(() => {
        router.push("/orders")
      }, 3000)
    } catch (err: any) {
      console.error("訂單提交失敗:", err)
      setSubmitError(err.message || "提交訂單時發生錯誤")
    } finally {
      setIsSubmitting(false)
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
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "處理中..." : "儲存訂單"}
          </Button>
        </div>
      </div>

      {submitSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>訂單建立成功</AlertTitle>
          <AlertDescription>訂單已成功建立，即將跳轉到訂單列表...</AlertDescription>
        </Alert>
      )}

      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>訂單建立失敗</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

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
          />
        </CardContent>
      </Card>
    </div>
  )
}
