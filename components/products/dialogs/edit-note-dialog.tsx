"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Note } from "@/types/product-form-types"

interface EditNoteDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  newNote: Note
  setNewNote: (note: Note) => void
  onAddNote: () => void
}

export function EditNoteDialog({ isOpen, onOpenChange, newNote, setNewNote, onAddNote }: EditNoteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加編輯備註</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="noteContent">備註內容</Label>
            <Textarea
              id="noteContent"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              rows={3}
              placeholder="輸入備註內容"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="noteUser">使用者</Label>
            <Input
              id="noteUser"
              value={newNote.user}
              onChange={(e) => setNewNote({ ...newNote, user: e.target.value })}
              placeholder="輸入使用者名稱"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="noteDate">日期 (選填)</Label>
            <Input
              id="noteDate"
              value={newNote.date}
              onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
              placeholder={new Date().toLocaleDateString("zh-TW")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" onClick={onAddNote}>
            新增備註
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
