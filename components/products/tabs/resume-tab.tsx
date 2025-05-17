"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X } from "lucide-react"

interface ResumeTabProps {
  product: any
  handleInputChange: (field: string, value: any) => void
  setIsOrderHistoryDialogOpen: (open: boolean) => void
  setIsResumeNoteDialogOpen: (open: boolean) => void
  handleOrderHistoryChange: (index: number, field: string, value: string | number) => void
  handleRemoveOrderHistory: (index: number) => void
}

export function ResumeTab({
  product,
  handleInputChange,
  setIsOrderHistoryDialogOpen,
  setIsResumeNoteDialogOpen,
  handleOrderHistoryChange,
  handleRemoveOrderHistory,
}: ResumeTabProps) {
  return (
    <Card className="mt-4">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hasMold">是否有模具</Label>
              <Checkbox
                id="hasMold"
                checked={product.hasMold || false}
                onCheckedChange={(checked) => handleInputChange("hasMold", checked === true)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="moldCost">模具費用</Label>
              <Input
                id="moldCost"
                type="number"
                value={product.moldCost || ""}
                onChange={(e) => handleInputChange("moldCost", e.target.value)}
                placeholder="輸入模具費用"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="refundableMoldQuantity">可退模具數量</Label>
              <Input
                id="refundableMoldQuantity"
                type="number"
                value={product.refundableMoldQuantity || ""}
                onChange={(e) => handleInputChange("refundableMoldQuantity", e.target.value)}
                placeholder="輸入可退模具數量"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="moldReturned">模具是否已退還</Label>
              <Checkbox
                id="moldReturned"
                checked={product.moldReturned || false}
                onCheckedChange={(checked) => handleInputChange("moldReturned", checked === true)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountingNote">會計備註</Label>
            <Textarea
              id="accountingNote"
              value={product.accountingNote || ""}
              onChange={(e) => handleInputChange("accountingNote", e.target.value)}
              rows={3}
              placeholder="輸入會計備註"
            />
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">品質備註</h3>
            <Button type="button" size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              添加品質備註
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

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">訂單歷史記錄</h3>
            <Button type="button" size="sm" variant="outline" onClick={() => setIsOrderHistoryDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              添加訂單記錄
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>訂單號碼</Label>
            </div>
            <div>
              <Label>訂單數量</Label>
            </div>
            <div>
              <Label>操作</Label>
            </div>
          </div>

          {product.orderHistory &&
            product.orderHistory.map((order: any, index: number) => (
              <div key={index} className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                <div>
                  <Input
                    value={order.orderNumber || ""}
                    onChange={(e) => handleOrderHistoryChange(index, "orderNumber", e.target.value)}
                    placeholder="訂單號碼"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    value={order.quantity || 0}
                    onChange={(e) => handleOrderHistoryChange(index, "quantity", Number.parseInt(e.target.value) || 0)}
                    placeholder="訂單數量"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveOrderHistory(index)}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">履歷備註</h3>
            <Button type="button" size="sm" variant="outline" onClick={() => setIsResumeNoteDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              添加履歷備註
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
            {product.resumeNotes &&
              product.resumeNotes.map((note: any, index: number) => (
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
