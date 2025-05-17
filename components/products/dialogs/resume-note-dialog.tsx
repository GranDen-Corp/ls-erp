"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Note } from "@/types/product-form-types"

interface ResumeNoteDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  newResumeNote: Note
  setNewResumeNote: (note: Note) => void
  onAddResumeNote: () => void
}

export function ResumeNoteDialog({
  isOpen,
  onOpenChange,
  newResumeNote,
  setNewResumeNote,
  onAddResumeNote,
}: ResumeNoteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加履歷備註</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="resumeNoteContent">備註內容</Label>
            <Textarea
              id="resumeNoteContent"
              value={newResumeNote.content}
              onChange={(e) => setNewResumeNote({ ...newResumeNote, content: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resumeNoteUser">使用者</Label>
            <Input
              id="resumeNoteUser"
              value={newResumeNote.user}
              onChange={(e) => setNewResumeNote({ ...newResumeNote, user: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resumeNoteDate">日期 (選填)</Label>
            <Input
              id="resumeNoteDate"
              value={newResumeNote.date}
              onChange={(e) => setNewResumeNote({ ...newResumeNote, date: e.target.value })}
              placeholder={new Date().toLocaleDateString("zh-TW")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" onClick={onAddResumeNote}>
            新增備註
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
