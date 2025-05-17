"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, FileText, ShoppingCart, Loader2, Copy } from "lucide-react"
import { batchTranslate } from "@/lib/translation-service"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useState, memo } from "react"

interface ProcessTabProps {
  product: any
  setProduct: React.Dispatch<React.SetStateAction<any>>
  setIsProcessDialogOpen: (open: boolean) => void
  setIsSpecialReqDialogOpen: (open: boolean) => void
  setIsProcessNoteDialogOpen: (open: boolean) => void
  handleInputChange: (field: string, value: any) => void
  handleProcessFieldChange: (id: string, field: string, value: string) => void
  handleRemoveProcess: (id: string) => void
  handleMoveProcess: (id: string, direction: "up" | "down") => void
}

// 定義生成備註的類型
type RemarksType = "order" | "purchase"

// 使用 memo 包裝組件以避免不必要的重新渲染
const ProcessTab = memo(function ProcessTab({
  product,
  setProduct,
  setIsProcessDialogOpen,
  setIsSpecialReqDialogOpen,
  setIsProcessNoteDialogOpen,
  handleInputChange,
  handleProcessFieldChange,
  handleRemoveProcess,
  handleMoveProcess,
}: ProcessTabProps) {
  const [isGenerateRemarksDialogOpen, setIsGenerateRemarksDialogOpen] = useState(false)
  const [useTranslation, setUseTranslation] = useState(false)
  const [generatedRemarks, setGeneratedRemarks] = useState("")
  const [currentRemarksType, setCurrentRemarksType] = useState<RemarksType>("order")
  const [isTranslating, setIsTranslating] = useState(false)

  // 生成製程要求
  const generateRequirements = () => {
    if (!product || !product.processData) return []

    // 獲取所有製程要求
    return product.processData
      .filter((proc: any) => proc.requirements)
      .map((proc: any) => `${proc.process}：${proc.requirements}`)
  }

  // 生成所有製程（包括沒有要求的）
  const generateAllProcesses = () => {
    if (!product || !product.processData) return []

    // 獲取所有製程，無論是否有要求
    return product.processData.map((proc: any) => {
      if (proc.requirements) {
        return `${proc.process}：${proc.requirements}`
      } else {
        return `${proc.process}：`
      }
    })
  }

  // 複製所有製程到訂單零件要求
  const copyAllProcessesToOrderRequirements = () => {
    const allProcesses = generateAllProcesses()
    if (allProcesses.length === 0) {
      alert("沒有可用的製程資料")
      return
    }

    const formattedText = allProcesses.join("\n")
    handleInputChange("orderRequirements", formattedText)
  }

  // 複製所有製程到採購單零件要求
  const copyAllProcessesToPurchaseRequirements = () => {
    const allProcesses = generateAllProcesses()
    if (allProcesses.length === 0) {
      alert("沒有可用的製程資料")
      return
    }

    const formattedText = allProcesses.join("\n")
    handleInputChange("purchaseRequirements", formattedText)
  }

  // 打開生成備註對話框
  const openGenerateRemarksDialog = async (type: RemarksType) => {
    const processRequirements = generateRequirements()
    if (processRequirements.length === 0) {
      alert("沒有可用的製程要求")
      return
    }

    // 設置當前備註類型
    setCurrentRemarksType(type)

    // 默認不翻譯
    setGeneratedRemarks("製程要求:\n" + processRequirements.map((req) => `${req}`).join("\n"))
    setUseTranslation(false)
    setIsGenerateRemarksDialogOpen(true)
  }

  // 切換翻譯選項
  const handleToggleTranslation = async (checked: boolean) => {
    setUseTranslation(checked)

    if (checked) {
      setIsTranslating(true)
      try {
        // 獲取所有製程名稱和要求
        const processTerms = product.processData
          .filter((proc: any) => proc.requirements)
          .map((proc: any) => proc.process)

        const requirementTerms = product.processData
          .filter((proc: any) => proc.requirements)
          .map((proc: any) => proc.requirements)

        // 翻譯製程名稱
        const translatedProcesses = await batchTranslate(processTerms, "process")

        // 翻譯要求
        const translatedRequirements = await Promise.all(
          requirementTerms.map(async (req: string) => {
            // 將要求拆分為詞組進行翻譯
            const terms = req.split(/[，,、：:；;]/).filter(Boolean)
            const translatedTerms = await batchTranslate(terms, "requirement")

            // 嘗試保留原始的分隔符
            let result = req
            for (let i = 0; i < terms.length; i++) {
              result = result.replace(terms[i], translatedTerms[i])
            }
            return result
          }),
        )

        // 組合翻譯後的製程要求
        const translatedRemarks = translatedProcesses.map((proc, index) => `${proc}: ${translatedRequirements[index]}`)

        // 格式化為英文訂單備註格式
        setGeneratedRemarks("MANUFACTURING PROCESS:\n" + translatedRemarks.map((req) => `${req}`).join("\n"))
      } catch (error) {
        console.error("翻譯失敗:", error)
        // 如果翻譯失敗，回退到中文
        const processRequirements = generateRequirements()
        setGeneratedRemarks("製程要求:\n" + processRequirements.map((req) => `${req}`).join("\n"))
      } finally {
        setIsTranslating(false)
      }
    } else {
      // 不翻譯，使用原中文
      const processRequirements = generateRequirements()
      setGeneratedRemarks("製程要求:\n" + processRequirements.map((req) => `${req}`).join("\n"))
    }
  }

  // 應用生成的備註
  const applyGeneratedRemarks = () => {
    // 根據當前備註類型更新相應的字段
    if (currentRemarksType === "order") {
      handleInputChange("orderRequirements", generatedRemarks)
    } else {
      handleInputChange("purchaseRequirements", generatedRemarks)
    }
    setIsGenerateRemarksDialogOpen(false)
  }

  // 如果產品數據尚未加載，顯示加載狀態
  if (!product) {
    return <div>加載中...</div>
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">製程資料</h3>
            <Button type="button" size="sm" variant="outline" onClick={() => setIsProcessDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              新增製程
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-6 gap-4">
              <div>
                <Label>製程</Label>
              </div>
              <div>
                <Label>廠商</Label>
              </div>
              <div>
                <Label>產能(SH)</Label>
              </div>
              <div>
                <Label>要求</Label>
              </div>
              <div>
                <Label>報告</Label>
              </div>
              <div>
                <Label>操作</Label>
              </div>
            </div>

            {product.processData &&
              product.processData.map((process: any, index: number) => (
                <div key={process.id} className="grid grid-cols-6 gap-4 items-center border-b pb-2">
                  <div>
                    <Input
                      value={process.process}
                      onChange={(e) => handleProcessFieldChange(process.id, "process", e.target.value)}
                      placeholder="製程名稱"
                    />
                  </div>
                  <div>
                    <Input
                      value={process.vendor}
                      onChange={(e) => handleProcessFieldChange(process.id, "vendor", e.target.value)}
                      placeholder="廠商名稱"
                    />
                  </div>
                  <div>
                    <Input
                      value={process.capacity}
                      onChange={(e) => handleProcessFieldChange(process.id, "capacity", e.target.value)}
                      placeholder="產能數值"
                    />
                  </div>
                  <div>
                    <Input
                      value={process.requirements}
                      onChange={(e) => handleProcessFieldChange(process.id, "requirements", e.target.value)}
                      placeholder="製程要求"
                    />
                  </div>
                  <div>
                    <Input
                      value={process.report}
                      onChange={(e) => handleProcessFieldChange(process.id, "report", e.target.value)}
                      placeholder="報告名稱"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleMoveProcess(process.id, "up")}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-arrow-up"
                      >
                        <path d="m5 12 7-7 7 7" />
                      </svg>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveProcess(process.id, "down")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-arrow-down"
                      >
                        <path d="m19 12-7 7-7-7" />
                      </svg>
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveProcess(process.id)}>
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="orderRequirements">訂單零件要求</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={copyAllProcessesToOrderRequirements}
                  className="ml-2"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  複製所有製程
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => openGenerateRemarksDialog("order")}
                  className="ml-2"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  生成訂單要求
                </Button>
              </div>
            </div>
            {/* 使用標準 Textarea 替代 AutoResizeTextarea */}
            <Textarea
              id="orderRequirements"
              value={product.orderRequirements || ""}
              onChange={(e) => handleInputChange("orderRequirements", e.target.value)}
              rows={5}
              placeholder="輸入訂單零件要求"
              className="w-full min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="purchaseRequirements">採購單零件要求</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={copyAllProcessesToPurchaseRequirements}
                  className="ml-2"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  複製所有製程
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => openGenerateRemarksDialog("purchase")}
                  className="ml-2"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  生成採購單要求
                </Button>
              </div>
            </div>
            {/* 使用標準 Textarea 替代 AutoResizeTextarea */}
            <Textarea
              id="purchaseRequirements"
              value={product.purchaseRequirements || ""}
              onChange={(e) => handleInputChange("purchaseRequirements", e.target.value)}
              rows={5}
              placeholder="輸入採購單零件要求"
              className="w-full min-h-[120px]"
            />
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">特殊要求</h3>
            <Button type="button" size="sm" variant="outline" onClick={() => setIsSpecialReqDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              添加特殊要求
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>要求內容</Label>
            </div>
            <div>
              <Label>使用者</Label>
            </div>
            <div>
              <Label>日期</Label>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {product.specialRequirements &&
              product.specialRequirements.map((req: any, index: number) => (
                <div key={index} className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                  <div>{req.content}</div>
                  <div>{req.user}</div>
                  <div>{req.date}</div>
                </div>
              ))}
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">製程備註</h3>
            <Button type="button" size="sm" variant="outline" onClick={() => setIsProcessNoteDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              添加製程備註
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>備註內容</Label>
            </div>
            <div>
              <Label>使用者</Label>
            </div>
            <div>
              <Label>日期</Label>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {product.processNotes &&
              product.processNotes.map((note: any, index: number) => (
                <div key={index} className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                  <div>{note.content}</div>
                  <div>{note.user}</div>
                  <div>{note.date}</div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>

      {/* 生成備註對話框 */}
      <Dialog open={isGenerateRemarksDialogOpen} onOpenChange={setIsGenerateRemarksDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentRemarksType === "order" ? "生成訂單零件要求" : "生成採購單零件要求"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="useTranslation"
                checked={useTranslation}
                onCheckedChange={(checked) => handleToggleTranslation(checked === true)}
                disabled={isTranslating}
              />
              <Label htmlFor="useTranslation" className="flex items-center">
                使用英文翻譯
                {isTranslating && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </Label>
            </div>
            <Textarea value={generatedRemarks} onChange={(e) => setGeneratedRemarks(e.target.value)} rows={10} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateRemarksDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={applyGeneratedRemarks} disabled={isTranslating}>
              {currentRemarksType === "order" ? "應用到訂單要求" : "應用到採購單要求"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
})

// 預設製程資料
export const defaultProcesses = [
  {
    id: "proc_1",
    process: "材料",
    vendor: "中鋼",
    capacity: "",
    requirements: "SAE 10B21",
    report: "材證",
  },
  {
    id: "proc_2",
    process: "成型",
    vendor: "岡岩",
    capacity: "",
    requirements: "",
    report: "",
  },
  {
    id: "proc_3",
    process: "搓牙",
    vendor: "岡岩",
    capacity: "",
    requirements: "",
    report: "",
  },
  {
    id: "proc_4",
    process: "熱處理",
    vendor: "力大",
    capacity: "",
    requirements: "硬度HRC 28-32，拉力800Mpa，降伏640",
    report: "硬度，拉力",
  },
  {
    id: "proc_5",
    process: "電鍍",
    vendor: "頂上興",
    capacity: "",
    requirements: "三價鉻鋅SUM MIN，鹽測12/48",
    report: "膜厚，鹽測，除氫",
  },
  {
    id: "proc_6",
    process: "篩選",
    vendor: "聖鼎",
    capacity: "",
    requirements: "50 PPM：混料、總長",
    report: "篩選報告",
  },
]

export { ProcessTab }
