"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ProcessDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (processData: any) => void
  initialData?: any
}

export function ProcessDialog({ isOpen, onClose, onSave, initialData }: ProcessDialogProps) {
  // Initialize with empty object if initialData is undefined
  const [processData, setProcessData] = useState({
    id: "",
    process: "",
    name: "",
    vendor: "",
    factory: "",
    capacity: "",
    requirements: "",
    description: "",
    report: "",
    order: "",
  })

  // Update local state when dialog opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Use initialData if available, with fallbacks for each property
        setProcessData({
          id: initialData.id || "",
          process: initialData.process || "",
          name: initialData.name || initialData.process || "",
          vendor: initialData.vendor || "",
          factory: initialData.factory || initialData.vendor || "",
          capacity: initialData.capacity || "",
          requirements: initialData.requirements || "",
          description: initialData.description || initialData.requirements || "",
          report: initialData.report || "",
          order: initialData.order || "",
        })
      } else {
        // Reset to empty state if no initialData
        setProcessData({
          id: "",
          process: "",
          name: "",
          vendor: "",
          factory: "",
          capacity: "",
          requirements: "",
          description: "",
          report: "",
          order: "",
        })
      }
    }
  }, [isOpen, initialData])

  const handleChange = (field: string, value: string) => {
    setProcessData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // 同步 process 和 name, requirements 和 description
    if (field === "process") {
      setProcessData((prev) => ({
        ...prev,
        name: value,
      }))
    } else if (field === "name") {
      setProcessData((prev) => ({
        ...prev,
        process: value,
      }))
    } else if (field === "requirements") {
      setProcessData((prev) => ({
        ...prev,
        description: value,
      }))
    } else if (field === "description") {
      setProcessData((prev) => ({
        ...prev,
        requirements: value,
      }))
    } else if (field === "vendor") {
      setProcessData((prev) => ({
        ...prev,
        factory: value,
      }))
    } else if (field === "factory") {
      setProcessData((prev) => ({
        ...prev,
        vendor: value,
      }))
    }
  }

  const handleSubmit = () => {
    // 確保至少有製程名稱
    if (!processData.process && !processData.name) {
      return
    }

    // Generate an ID if one doesn't exist
    const dataToSave = {
      ...processData,
      id: processData.id || `process_${Date.now()}`,
      process: processData.process || processData.name,
      name: processData.name || processData.process,
      requirements: processData.requirements || processData.description,
      description: processData.description || processData.requirements,
      vendor: processData.vendor || processData.factory,
      factory: processData.factory || processData.vendor,
    }

    console.log("Saving process data:", dataToSave)

    // Call the onSave function with the data
    onSave(dataToSave)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "編輯製程" : "新增製程"}</DialogTitle>
          <DialogDescription>填寫製程相關資訊</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="process">製程</Label>
              <Input
                id="process"
                value={processData.process || processData.name}
                onChange={(e) => handleChange("process", e.target.value)}
                placeholder="輸入製程名稱"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor">廠商</Label>
              <Input
                id="vendor"
                value={processData.vendor || processData.factory}
                onChange={(e) => handleChange("vendor", e.target.value)}
                placeholder="輸入廠商名稱"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">產能(8H)</Label>
              <Input
                id="capacity"
                value={processData.capacity}
                onChange={(e) => handleChange("capacity", e.target.value)}
                placeholder="輸入產能"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">要求</Label>
              <Textarea
                id="requirements"
                value={processData.requirements || processData.description}
                onChange={(e) => handleChange("requirements", e.target.value)}
                placeholder="輸入要求"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="report">報告</Label>
              <Input
                id="report"
                value={processData.report}
                onChange={(e) => handleChange("report", e.target.value)}
                placeholder="輸入報告"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {initialData ? "更新" : "新增"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
