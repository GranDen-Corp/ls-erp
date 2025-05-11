"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// 模擬工廠數據
const factories = [
  { id: "1", name: "深圳電子廠" },
  { id: "2", name: "上海科技廠" },
  { id: "3", name: "東莞工業廠" },
  { id: "4", name: "廣州製造廠" },
  { id: "5", name: "蘇州電子廠" },
]

interface ExportFactoryShipmentsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportFactoryShipments({ open, onOpenChange }: ExportFactoryShipmentsProps) {
  const [selectedFactory, setSelectedFactory] = useState<string | null>(null)

  const handleExport = async () => {
    if (!selectedFactory) {
      toast({
        title: "請選擇工廠",
        description: "請先選擇要匯出的工廠",
        variant: "destructive",
      })
      return
    }

    // 模擬API請求
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 實際應用中應該調用API匯出數據
    console.log("匯出工廠出貨列表:", {
      factory: selectedFactory,
      period: "最近一個月",
    })

    toast({
      title: "匯出成功",
      description: `已成功匯出 ${selectedFactory} 的出貨列表`,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>匯出工廠出貨列表</DialogTitle>
          <DialogDescription>匯出工廠最近一個月準備要出貨的採購單列表</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">選擇工廠</label>
            <Select value={selectedFactory || ""} onValueChange={setSelectedFactory}>
              <SelectTrigger>
                <SelectValue placeholder="選擇工廠" />
              </SelectTrigger>
              <SelectContent>
                {factories.map((factory) => (
                  <SelectItem key={factory.id} value={factory.name}>
                    {factory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-2 rounded-md bg-muted">
            <p className="text-sm">
              匯出的數據將包含：採購單號碼、數量、批次、採購單交期、負責船務、預計交期（供工廠填寫）
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            匯出
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
