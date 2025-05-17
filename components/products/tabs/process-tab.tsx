"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X } from "lucide-react"

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

export function ProcessTab({
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
  // Regenerate requirements
  const regenerateRequirements = () => {
    // Generate requirements based on process data
    const generateRequirements = (processData: any[]) => {
      // Order part requirements - all process requirements
      const orderReqs = processData
        .filter((proc) => proc.requirements)
        .map((proc) => `${proc.process}：${proc.requirements}`)
        .join("\n")

      // Purchase order part requirements - also includes all process requirements
      const purchaseReqs = processData
        .filter((proc) => proc.requirements)
        .map((proc) => `${proc.process}：${proc.requirements}`)
        .join("\n")

      return {
        orderReqs,
        purchaseReqs,
      }
    }

    setProduct((prev: any) => {
      const { orderReqs, purchaseReqs } = generateRequirements(prev.processData || [])
      return {
        ...prev,
        orderRequirements: orderReqs,
        purchaseRequirements: purchaseReqs,
      }
    })
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
            <Label htmlFor="orderRequirements">訂單零件要求</Label>
            <Textarea
              id="orderRequirements"
              value={product.orderRequirements || ""}
              onChange={(e) => handleInputChange("orderRequirements", e.target.value)}
              rows={3}
              placeholder="輸入訂單零件要求"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchaseRequirements">採購單零件要求</Label>
            <Textarea
              id="purchaseRequirements"
              value={product.purchaseRequirements || ""}
              onChange={(e) => handleInputChange("purchaseRequirements", e.target.value)}
              rows={3}
              placeholder="輸入採購單零件要求"
            />
          </div>

          <Button type="button" variant="secondary" onClick={regenerateRequirements}>
            重新生成要求
          </Button>

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
    </Card>
  )
}
