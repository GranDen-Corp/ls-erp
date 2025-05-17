"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Note } from "@/types/product-form-types"

interface ProcessNoteDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  newProcessNote: Note
  setNewProcessNote: (note: Note) => void
  onAddProcessNote: () => void
}

export function ProcessNoteDialog({
  isOpen,
  onOpenChange,
  newProcessNote,
  setNewProcessNote,
  onAddProcessNote,
}: ProcessNoteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加製程備註</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="processNoteContent">備註內容</Label>
            <Textarea
              id="processNoteContent"
              value={newProcessNote.content}
              onChange={(e) => setNewProcessNote({ ...newProcessNote, content: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="processNoteUser">使用者</Label>
            <Input
              id="processNoteUser"
              value={newProcessNote.user}
              onChange={(e) => setNewProcessNote({ ...newProcessNote, user: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="processNoteDate">日期 (選填)</Label>
            <Input
              id="processNoteDate"
              value={newProcessNote.date}
              onChange={(e) => setNewProcessNote({ ...newProcessNote, date: e.target.value })}
              placeholder={new Date().toLocaleDateString("zh-TW")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" onClick={onAddProcessNote}>
            新增備註
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
