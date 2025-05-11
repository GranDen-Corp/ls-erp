"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle } from "lucide-react"

export function ProtocolHandlerRegistration() {
  const [showDialog, setShowDialog] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState<"none" | "success" | "error" | "unsupported">("none")

  // 檢查瀏覽器是否支持協議處理程序註冊
  useEffect(() => {
    // 檢查是否支持 navigator.registerProtocolHandler
    if (typeof navigator !== "undefined" && "registerProtocolHandler" in navigator) {
      setRegistrationStatus("none")
    } else {
      setRegistrationStatus("unsupported")
    }
  }, [])

  // 嘗試註冊協議處理程序
  const registerProtocolHandler = () => {
    try {
      // 嘗試註冊 file 協議處理程序
      // 注意：大多數現代瀏覽器出於安全考慮不允許註冊 file: 協議
      navigator.registerProtocolHandler(
        "web+erpdrive",
        `${window.location.origin}/documents/open?path=%s`,
        "ERP 網路磁碟",
      )
      setRegistrationStatus("success")
    } catch (error) {
      console.error("協議處理程序註冊失敗:", error)
      setRegistrationStatus("error")
    }
    setShowDialog(true)
  }

  return (
    <>
      <Button variant="outline" onClick={registerProtocolHandler} disabled={registrationStatus === "unsupported"}>
        註冊網路磁碟處理程序
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {registrationStatus === "success"
                ? "註冊成功"
                : registrationStatus === "error"
                  ? "註冊失敗"
                  : registrationStatus === "unsupported"
                    ? "不支持的功能"
                    : "協議處理程序註冊"}
            </DialogTitle>
            <DialogDescription>
              {registrationStatus === "success"
                ? "協議處理程序已成功註冊"
                : registrationStatus === "error"
                  ? "協議處理程序註冊失敗"
                  : registrationStatus === "unsupported"
                    ? "您的瀏覽器不支持協議處理程序註冊"
                    : "正在註冊協議處理程序"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {registrationStatus === "success" ? (
              <Alert className="bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>註冊成功</AlertTitle>
                <AlertDescription>
                  您現在可以使用網路磁碟功能。當您點擊網路磁碟中的文件時，系統將嘗試打開它。
                </AlertDescription>
              </Alert>
            ) : registrationStatus === "error" ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>註冊失敗</AlertTitle>
                <AlertDescription>
                  由於瀏覽器安全限制，協議處理程序註冊失敗。您可能需要使用桌面應用程序來訪問網路磁碟。
                </AlertDescription>
              </Alert>
            ) : registrationStatus === "unsupported" ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>不支持的功能</AlertTitle>
                <AlertDescription>
                  您的瀏覽器不支持協議處理程序註冊。請嘗試使用其他瀏覽器（如 Chrome 或 Edge）。
                </AlertDescription>
              </Alert>
            ) : null}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDialog(false)}>關閉</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
