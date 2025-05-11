"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Printer, AlertCircle } from "lucide-react"
import Link from "next/link"
import { QuickOrderForm } from "@/components/orders/quick-order-form"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { printOrderDocuments } from "@/lib/services/print-service"

export default function QuickOrderPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const [orderData, setOrderData] = useState<any>(null)

  const handleValidationChange = (valid: boolean, message: string | null, data: any | null) => {
    setIsValid(valid)
    setValidationMessage(message)
    setOrderData(data)
  }

  const handleSubmit = async () => {
    if (!isValid || !orderData) return

    setIsSubmitting(true)

    try {
      // 模擬API請求
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // 實際應用中應該調用API保存訂單和採購單
      console.log("訂單資料:", orderData.order)
      console.log("採購單資料:", orderData.purchase)

      // 顯示成功訊息
      alert("訂單和採購單已成功建立！")

      // 導航到訂單列表頁面
      router.push("/orders")
    } catch (error) {
      console.error("建立訂單失敗:", error)
      alert("建立訂單失敗，請稍後再試。")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrint = async () => {
    if (!isValid || !orderData) return

    setIsPrinting(true)

    try {
      // 調用打印服務
      const result = await printOrderDocuments(orderData)

      // 顯示成功訊息
      alert(result.message)
    } catch (error) {
      console.error("列印失敗:", error)
      alert("列印失敗，請稍後再試。")
    } finally {
      setIsPrinting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/orders">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">快速建立訂單</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} disabled={!isValid || isPrinting}>
            <Printer className="mr-2 h-4 w-4" />
            {isPrinting ? "列印中..." : "列印文件"}
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "建立中..." : "建立訂單"}
          </Button>
        </div>
      </div>

      {validationMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>驗證錯誤</AlertTitle>
          <AlertDescription>{validationMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>訂單與採購單資訊</CardTitle>
        </CardHeader>
        <CardContent>
          <QuickOrderForm onValidationChange={handleValidationChange} />
        </CardContent>
      </Card>
    </div>
  )
}
