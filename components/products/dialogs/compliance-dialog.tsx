"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface ComplianceDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  newCompliance: {
    regulation: string
    regulationType: string
    status: boolean
    substances: string
    reason: string
    document: string
  }
  setNewCompliance: (data: {
    regulation: string
    regulationType: string
    status: boolean
    substances: string
    reason: string
    document: string
  }) => void
  onAddCompliance: () => void
}

export function ComplianceDialog({
  isOpen,
  onOpenChange,
  newCompliance,
  setNewCompliance,
  onAddCompliance,
}: ComplianceDialogProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>添加符合性要求</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="complianceRegulation">法規名稱</Label>
            <Input
              id="complianceRegulation"
              value={newCompliance.regulation}
              onChange={(e) => setNewCompliance({ ...newCompliance, regulation: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>法規類型</Label>
            <RadioGroup value={newCompliance.regulationType} 
            onValueChange={(value) => setNewCompliance({ ...newCompliance, regulationType: value })} 
            className="flex space-x-4">
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="standard" id="type-standard" />
                <Label htmlFor="type-standard" className="text-sm">
                  標準法規 (符合/不符)
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="containment" id="type-containment" />
                <Label htmlFor="type-containment" className="text-sm">
                  含有物質法規 (含有/不含有)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complianceStatus">符合狀態</Label>
            {newCompliance.regulationType === "standard" ? (
              <RadioGroup
                value={newCompliance.status ? "Yes" : "No"}
                onValueChange={(value) => setNewCompliance({ ...newCompliance, status: value === "Yes" })}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="Yes" id="comply" />
                  <Label htmlFor="comply" className="text-sm">
                    符合
                  </Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="No" id="not-comply" />
                  <Label htmlFor="not-comply" className="text-sm">
                    不符
                  </Label>
                </div>
              </RadioGroup>
            ) : (
              <RadioGroup
                value={newCompliance.status ? "Yes" : "No"}
                onValueChange={(value) => setNewCompliance({ ...newCompliance, status: value === "Yes" })}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="Yes" id="has" />
                  <Label htmlFor="has" className="text-sm">
                    含有
                  </Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="No" id="not-has" />
                  <Label htmlFor="not-has" className="text-sm">
                    不含有
                  </Label>
                </div>
              </RadioGroup>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="complianceSubstances">含有物質</Label>
            <Input
              id="complianceSubstances"
              value={newCompliance.substances}
              onChange={(e) => setNewCompliance({ ...newCompliance, substances: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="complianceReason">理由</Label>
            <Input
              id="complianceReason"
              value={newCompliance.reason}
              onChange={(e) => setNewCompliance({ ...newCompliance, reason: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" onClick={onAddCompliance}>
            新增法規
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
