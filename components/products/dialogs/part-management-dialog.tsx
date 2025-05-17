"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

interface PartManagementDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  newPartManagement: { name: string; value: boolean }
  setNewPartManagement: (data: { name: string; value: boolean }) => void
  onAddPartManagement: () => void
}

export function PartManagementDialog({
  isOpen,
  onOpenChange,
  newPartManagement,
  setNewPartManagement,
  onAddPartManagement,
}: PartManagementDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加零件管理特性</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="partManagementName">特性名稱</Label>
            <Input
              id="partManagementName"
              value={newPartManagement.name}
              onChange={(e) => setNewPartManagement({ ...newPartManagement, name: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="partManagementValue"
              checked={newPartManagement.value}
              onCheckedChange={(checked) => setNewPartManagement({ ...newPartManagement, value: checked === true })}
            />
            <Label htmlFor="partManagementValue">啟用</Label>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" onClick={onAddPartManagement}>
            新增特性
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
