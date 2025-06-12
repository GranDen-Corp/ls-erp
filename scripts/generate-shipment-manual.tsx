"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download } from "lucide-react"

interface GenerateShipmentManualProps {
  onGenerate?: () => void
}

export function GenerateShipmentManual({ onGenerate }: GenerateShipmentManualProps) {
  const handleGenerateManual = async () => {
    try {
      // 這裡可以添加生成出貨手冊的邏輯
      console.log("正在生成出貨手冊...")

      // 模擬生成過程
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 調用回調函數
      if (onGenerate) {
        onGenerate()
      }

      console.log("出貨手冊生成完成")
    } catch (error) {
      console.error("生成出貨手冊時發生錯誤:", error)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          出貨手冊生成器
        </CardTitle>
        <CardDescription>生成標準化的出貨作業手冊</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGenerateManual} className="w-full" variant="default">
          <Download className="h-4 w-4 mr-2" />
          生成出貨手冊
        </Button>
      </CardContent>
    </Card>
  )
}

export default GenerateShipmentManual
