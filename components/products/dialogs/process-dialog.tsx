"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { ProcessRecord } from "@/types/product-form-types"

interface ProcessDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  newProcess: ProcessRecord
  onAddProcess: () => void
  setNewProcess: (process: ProcessRecord) => void
}

export function ProcessDialog({ isOpen, onOpenChange, newProcess, onAddProcess, setNewProcess }: ProcessDialogProps) {
  // Use local state to manage form inputs, avoiding parent component state updates causing re-renders
  const [localProcess, setLocalProcess] = useState<Omit<ProcessRecord, "id">>({
    process: newProcess.process,
    vendor: newProcess.vendor,
    capacity: newProcess.capacity,
    requirements: newProcess.requirements,
    report: newProcess.report,
  })

  // When the dialog opens, sync external state to local state
  useEffect(() => {
    if (isOpen) {
      setLocalProcess({
        process: newProcess.process,
        vendor: newProcess.vendor,
        capacity: newProcess.capacity,
        requirements: newProcess.requirements,
        report: newProcess.report,
      })
    }
  }, [isOpen, newProcess.process, newProcess.vendor, newProcess.capacity, newProcess.requirements, newProcess.report])

  // Handle local form submission
  const handleLocalSubmit = () => {
    // Update external state
    setNewProcess({
      id: "",
      process: localProcess.process,
      vendor: localProcess.vendor,
      capacity: localProcess.capacity,
      requirements: localProcess.requirements,
      report: localProcess.report,
    })

    // Call add process function
    onAddProcess()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>新增製程</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="processName">製程</Label>
            <Input
              id="processName"
              value={localProcess.process}
              onChange={(e) => setLocalProcess((prev) => ({ ...prev, process: e.target.value }))}
              placeholder="輸入製程名稱"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="processVendor">廠商</Label>
            <Input
              id="processVendor"
              value={localProcess.vendor}
              onChange={(e) => setLocalProcess((prev) => ({ ...prev, vendor: e.target.value }))}
              placeholder="輸入廠商名稱"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="processCapacity">產能(SH)</Label>
            <Input
              id="processCapacity"
              value={localProcess.capacity}
              onChange={(e) => setLocalProcess((prev) => ({ ...prev, capacity: e.target.value }))}
              placeholder="輸入產能數值"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="processRequirements">要求</Label>
            <Input
              id="processRequirements"
              value={localProcess.requirements}
              onChange={(e) => setLocalProcess((prev) => ({ ...prev, requirements: e.target.value }))}
              placeholder="輸入製程要求"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="processReport">報告</Label>
            <Input
              id="processReport"
              value={localProcess.report}
              onChange={(e) => setLocalProcess((prev) => ({ ...prev, report: e.target.value }))}
              placeholder="輸入報告名稱"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" onClick={handleLocalSubmit}>
            新增製程
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
