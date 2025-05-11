"use client"

import type React from "react"

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
import { Input } from "@/components/ui/input"
import { Upload } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ImportDeliveryDatesProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportDeliveryDates({ open, onOpenChange }: ImportDeliveryDatesProps) {
  const [importFile, setImportFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: "請選擇文件",
        description: "請先選擇要匯入的交期更新文件",
        variant: "destructive",
      })
      return
    }

    // 模擬API請求
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 實際應用中應該調用API匯入數據
    console.log("匯入交期更新:", {
      file: importFile.name,
    })

    toast({
      title: "匯入成功",
      description: `已成功匯入交期更新數據`,
    })

    setImportFile(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>匯入交期更新</DialogTitle>
          <DialogDescription>匯入工廠回傳的預計交期更新</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">選擇檔案</label>
            <Input type="file" accept=".xlsx,.csv" onChange={handleFileChange} />
            <p className="text-xs text-muted-foreground">
              請上傳工廠填寫並回傳的交期更新檔案（支援 Excel 或 CSV 格式）
            </p>
          </div>

          {importFile && (
            <div className="p-2 rounded-md bg-muted">
              <p className="text-sm">已選擇檔案：{importFile.name}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleImport}>
            <Upload className="mr-2 h-4 w-4" />
            匯入
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
