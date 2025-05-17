"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Note } from "@/types/product-form-types"

interface SpecialReqDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  newSpecialReq: Note
  setNewSpecialReq: (note: Note) => void
  onAddSpecialReq: () => void
}

export function SpecialReqDialog({
  isOpen,
  onOpenChange,
  newSpecialReq,
  setNewSpecialReq,
  onAddSpecialReq,
}: SpecialReqDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加特殊要求</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="specialReqContent">要求內容</Label>
            <Textarea
              id="specialReqContent"
              value={newSpecialReq.content}
              onChange={(e) => setNewSpecialReq({ ...newSpecialReq, content: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialReqUser">使用者</Label>
            <Input
              id="specialReqUser"
              value={newSpecialReq.user}
              onChange={(e) => setNewSpecialReq({ ...newSpecialReq, user: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialReqDate">日期 (選填)</Label>
            <Input
              id="specialReqDate"
              value={newSpecialReq.date}
              onChange={(e) => setNewSpecialReq({ ...newSpecialReq, date: e.target.value })}
              placeholder={new Date().toLocaleDateString("zh-TW")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" onClick={onAddSpecialReq}>
            新增特殊要求
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
