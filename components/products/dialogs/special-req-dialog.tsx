"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface SpecialReqDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  newSpecialReq: any
  setNewSpecialReq: (req: any) => void
  onAddSpecialReq: (req: any) => void
}

export function SpecialReqDialog({
  isOpen,
  onOpenChange,
  newSpecialReq,
  setNewSpecialReq,
  onAddSpecialReq,
}: SpecialReqDialogProps) {
  const [localReq, setLocalReq] = useState({
    content: "",
    date: "",
    user: "",
  })

  useEffect(() => {
    if (isOpen && newSpecialReq) {
      setLocalReq({
        content: newSpecialReq.content || "",
        date: newSpecialReq.date || new Date().toLocaleDateString("zh-TW"),
        user: newSpecialReq.user || "",
      })
    }
  }, [isOpen, newSpecialReq])

  const handleChange = (field: string, value: string) => {
    setLocalReq((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = () => {
    if (!localReq.content) return

    const date = localReq.date || new Date().toLocaleDateString("zh-TW")
    const user = localReq.user || "系統使用者"

    onAddSpecialReq({
      content: localReq.content,
      date,
      user,
    })

    // Reset form
    setLocalReq({
      content: "",
      date: "",
      user: "",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>添加特殊要求</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="content">特殊要求內容</Label>
            <Textarea
              id="content"
              value={localReq.content}
              onChange={(e) => handleChange("content", e.target.value)}
              placeholder="輸入特殊要求內容"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">日期</Label>
              <Input
                id="date"
                type="text"
                value={localReq.date}
                onChange={(e) => handleChange("date", e.target.value)}
                placeholder="YYYY/MM/DD"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user">使用者</Label>
              <Input
                id="user"
                value={localReq.user}
                onChange={(e) => handleChange("user", e.target.value)}
                placeholder="輸入使用者名稱"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" onClick={handleSubmit}>
            添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
