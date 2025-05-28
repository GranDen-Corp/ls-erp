"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createTeamMember, updateTeamMember } from "@/app/settings/team-matrix-actions"
import type { Department, TeamMemberWithRelations } from "@/types/team-matrix"
import { useToast } from "@/hooks/use-toast"

interface TeamMemberDialogProps {
  open: boolean
  onClose: () => void
  member?: TeamMemberWithRelations | null
  department?: Department | null
}

export function TeamMemberDialog({ open, onClose, member, department }: TeamMemberDialogProps) {
  const [formData, setFormData] = useState({
    ls_employee_id: "",
    name: "",
    role: "",
    department: "",
    is_active: true,
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const roles = [
    { value: "admin", label: "管理" },
    { value: "sales", label: "業務" },
    { value: "shipping", label: "船務" },
    { value: "qc", label: "品管" },
  ]

  useEffect(() => {
    if (open) {
      if (member) {
        // 編輯模式
        setFormData({
          ls_employee_id: member.ls_employee_id || "",
          name: member.name || "",
          role: member.role || "",
          department: member.department || "",
          is_active: member.is_active ?? true,
        })
      } else {
        // 新增模式
        setFormData({
          ls_employee_id: "",
          name: "",
          role: department?.department_code.toLowerCase() || "",
          department: department?.department_name || "",
          is_active: true,
        })
      }
    }
  }, [open, member, department])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (member) {
        // 更新
        result = await updateTeamMember(member.id, formData)
      } else {
        // 新增
        result = await createTeamMember(formData)
      }

      if (result.success) {
        toast({
          title: "成功",
          description: member ? "團隊成員已更新" : "團隊成員已新增",
        })
        onClose()
      } else {
        toast({
          title: "錯誤",
          description: result.error || "操作失敗",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "錯誤",
        description: "操作失敗",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{member ? "編輯團隊成員" : "新增團隊成員"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ls_employee_id">員工編號 *</Label>
            <Input
              id="ls_employee_id"
              value={formData.ls_employee_id}
              onChange={(e) => handleInputChange("ls_employee_id", e.target.value)}
              placeholder="請輸入員工編號"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">姓名 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="請輸入姓名"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">角色 *</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
              <SelectTrigger>
                <SelectValue placeholder="選擇角色" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">部門 *</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => handleInputChange("department", e.target.value)}
              placeholder="請輸入部門名稱"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange("is_active", checked)}
            />
            <Label htmlFor="is_active">啟用狀態</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "處理中..." : member ? "更新" : "新增"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
