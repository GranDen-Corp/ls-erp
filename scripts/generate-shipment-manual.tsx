"use client"

import { Button } from "@/components/ui/button"
import { FileIcon as FilePdf, Check } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function GenerateShipmentManual() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    setIsGenerating(true)

    // Simulate PDF generation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsGenerating(false)
    setIsGenerated(true)

    // Redirect to documents page after a short delay
    setTimeout(() => {
      router.push("/documents")
    }, 1500)
  }

  return (
    <div className="flex flex-col items-center gap-4 p-8 border rounded-lg bg-muted/20">
      <FilePdf className="h-16 w-16 text-primary" />
      <h3 className="text-xl font-semibold">出貨管理系統使用手冊</h3>
      <p className="text-center text-muted-foreground">生成PDF版本的出貨管理系統使用手冊並添加到文件管理系統</p>
      <Button onClick={handleGenerate} disabled={isGenerating || isGenerated} className="mt-2">
        {isGenerating ? (
          <>生成中...</>
        ) : isGenerated ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            已生成
          </>
        ) : (
          <>生成PDF手冊</>
        )}
      </Button>
    </div>
  )
}
