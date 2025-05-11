"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, FileText } from "lucide-react"

export default function OpenDocumentPage() {
  const searchParams = useSearchParams()
  const path = searchParams.get("path")
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading")

  useEffect(() => {
    if (!path) {
      setStatus("error")
      return
    }

    // 嘗試打開文件
    try {
      // 解析路徑
      const filePath = path.replace("web+erpdrive://", "")

      // 在實際應用中，這裡可以使用協議處理程序嘗試打開文件
      // 例如: window.location.href = `file:///Z:/${filePath}`
      // 但由於安全限制，這可能不會在所有瀏覽器中工作

      // 模擬嘗試打開文件
      setTimeout(() => {
        // 在實際應用中，這裡應該檢查文件是否成功打開
        setStatus("success")
      }, 1500)
    } catch (error) {
      console.error("打開文件失敗:", error)
      setStatus("error")
    }
  }, [path])

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>打開網路磁碟文件</CardTitle>
          <CardDescription>系統正在嘗試打開您請求的文件</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-center text-sm text-muted-foreground">正在嘗試打開文件，請稍候...</p>
            </div>
          ) : status === "error" ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>無法打開文件</AlertTitle>
              <AlertDescription>
                由於瀏覽器安全限制或文件路徑無效，無法打開請求的文件。
                {!path && "未提供有效的文件路徑。"}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <FileText className="h-16 w-16 text-primary" />
              <p className="mt-4 text-center">系統已嘗試打開文件。如果文件沒有自動打開，請使用下方按鈕。</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {status === "success" && <Button onClick={() => window.history.back()}>返回文件瀏覽器</Button>}
          {status === "error" && <Button onClick={() => window.history.back()}>返回文件瀏覽器</Button>}
        </CardFooter>
      </Card>
    </div>
  )
}
