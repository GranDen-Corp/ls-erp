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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings2, Eye, EyeOff, GripVertical, ChevronUp, ChevronDown, Lock } from "lucide-react"

export interface ColumnOption {
  id: string
  label: string
  visible: boolean
  category?: string
  required?: boolean // 新增必要欄位標記
}

interface ColumnControlDialogProps {
  columns: ColumnOption[]
  onColumnChange: (columns: ColumnOption[]) => void
  defaultColumns: ColumnOption[] // 新增預設欄位配置
}

export function ColumnControlDialog({ columns, onColumnChange, defaultColumns }: ColumnControlDialogProps) {
  const [open, setOpen] = useState(false)
  const [localColumns, setLocalColumns] = useState<ColumnOption[]>(columns)

  const visibleColumnsCount = columns.filter((col) => col.visible).length
  const totalColumnsCount = columns.length

  const handleOpen = () => {
    setLocalColumns([...columns])
    setOpen(true)
  }

  const handleSave = () => {
    onColumnChange(localColumns)
    setOpen(false)
  }

  const handleResetToDefault = () => {
    // 重置為預設的欄位顯示和排序
    setLocalColumns([...defaultColumns])
  }

  const toggleColumnVisibility = (columnId: string) => {
    const targetColumn = localColumns.find((col) => col.id === columnId)

    // 檢查是否為必要欄位
    if (targetColumn?.required) {
      return // 必要欄位不允許隱藏
    }

    // 檢查是否至少有一個可見欄位（排除必要欄位）
    const visibleNonRequiredCount = localColumns.filter((col) => col.visible && !col.required).length
    const isTargetVisible = targetColumn?.visible

    // 如果嘗試隱藏最後一個非必要的可見欄位，則不允許
    if (visibleNonRequiredCount === 1 && isTargetVisible) {
      return
    }

    setLocalColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, visible: !col.visible } : col)))
  }

  const moveColumn = (index: number, direction: "up" | "down") => {
    const newColumns = [...localColumns]
    const targetIndex = direction === "up" ? index - 1 : index + 1

    if (targetIndex >= 0 && targetIndex < newColumns.length) {
      ;[newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]]
      setLocalColumns(newColumns)
    }
  }

  // 按類別分組欄位
  const groupedColumns = localColumns.reduce(
    (acc, column, index) => {
      const category = column.category || "其他"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push({ ...column, originalIndex: index })
      return acc
    },
    {} as Record<string, Array<ColumnOption & { originalIndex: number }>>,
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleOpen}>
          <Settings2 className="h-4 w-4" />
          欄位設定
          {visibleColumnsCount < totalColumnsCount && (
            <Badge variant="secondary" className="ml-1">
              {visibleColumnsCount}/{totalColumnsCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>欄位顯示與順序設定</DialogTitle>
          <DialogDescription>選擇要顯示的欄位並調整顯示順序</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4">
            {Object.entries(groupedColumns).map(([category, categoryColumns]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">{category}</h4>
                <div className="space-y-1">
                  {categoryColumns.map((column) => (
                    <div
                      key={column.id}
                      className={`flex items-center justify-between p-2 rounded-md border bg-card hover:bg-accent/50 ${
                        column.required ? "border-primary/50 bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <span className="text-sm flex items-center gap-1">
                          {column.label}
                          {column.required && <Lock className="h-3 w-3 text-primary" />}
                        </span>
                        {column.visible && (
                          <Badge variant="outline" className="text-xs">
                            顯示中
                          </Badge>
                        )}
                        {column.required && (
                          <Badge variant="secondary" className="text-xs">
                            必要
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveColumn(column.originalIndex, "up")}
                          disabled={column.originalIndex === 0}
                          className="h-6 w-6 p-0"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveColumn(column.originalIndex, "down")}
                          disabled={column.originalIndex === localColumns.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleColumnVisibility(column.id)}
                          disabled={column.required}
                          className={`h-6 w-6 p-0 ${
                            column.required
                              ? "cursor-not-allowed opacity-50"
                              : column.visible
                                ? "text-primary"
                                : "text-muted-foreground"
                          }`}
                          title={column.required ? "必要欄位無法隱藏" : column.visible ? "隱藏欄位" : "顯示欄位"}
                        >
                          {column.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="text-xs text-muted-foreground border-t pt-2">
          <p>
            目前顯示 {visibleColumnsCount} 個欄位，共 {totalColumnsCount} 個可用欄位
          </p>
          <p>使用上下箭頭調整欄位順序，眼睛圖示控制顯示/隱藏</p>
          <p className="text-primary">🔒 必要欄位無法隱藏</p>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleResetToDefault}>
            重置預設顯示
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>確認</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
