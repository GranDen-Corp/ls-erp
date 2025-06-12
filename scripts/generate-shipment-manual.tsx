"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, FileText, Download } from "lucide-react"

interface GenerateShipmentManualProps {
  onGenerate?: (data: any) => void
  className?: string
}

export function GenerateShipmentManual({ onGenerate, className }: GenerateShipmentManualProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [status, setStatus] = useState<string>("")
  const [error, setError] = useState<string>("")

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError("")
    setStatus("正在生成出貨手冊...")

    try {
      // 模擬生成過程
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const result = {
        success: true,
        filename: `shipment-manual-${new Date().toISOString().split("T")[0]}.pdf`,
        timestamp: new Date().toISOString(),
      }

      setStatus("出貨手冊生成完成！")

      if (onGenerate) {
        onGenerate(result)
      }

      // 模擬下載
      setTimeout(() => {
        setStatus("")
      }, 3000)
    } catch (err) {
      setError("生成出貨手冊時發生錯誤")
      console.error("Generate shipment manual error:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          出貨手冊生成器
        </CardTitle>
        <CardDescription>生成標準化的出貨手冊文件</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status && (
          <Alert>
            <AlertDescription>{status}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              生成出貨手冊
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export default GenerateShipmentManual
