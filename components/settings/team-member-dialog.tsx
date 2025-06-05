"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { createTeamMember, updateTeamMember } from "@/app/settings/team-matrix-actions"

interface TeamMemberDialogProps {
  open: boolean
  onClose: () => void
  member: any | null
  department: any | null
}

export function TeamMemberDialog({ open, onClose, member, department }: TeamMemberDialogProps) {
  const [formData, setFormData] = useState({
    ls_employee_id: "",
    name: "",
    role: "",
    department: "",
    email: "",
    phone_no: "",
    is_active: true,
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (member) {
      setFormData({
        ls_employee_id: member.ls_employee_id || "",
        name: member.name || "",
        role: member.role || "",
        department: member.department || "",
        email: member.email || "",
        phone_no: member.phone_no || "",
        is_active: member.is_active ?? true,
      })
    } else {
      setFormData({
        ls_employee_id: "",
        name: "",
        role: department?.department_code?.toLowerCase() || "",
        department: department?.department_name || "",
        email: "",
        phone_no: "",
        is_active: true,
      })
    }
  }, [member, department])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = member ? await updateTeamMember(member.id, formData) : await createTeamMember(formData)

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{member ? "編輯團隊成員" : "新增團隊成員"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ls_employee_id">員工編號</Label>
            <Input
              id="ls_employee_id"
              value={formData.ls_employee_id}
              onChange={(e) => setFormData({ ...formData, ls_employee_id: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">姓名</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">角色</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="選擇角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">管理員</SelectItem>
                <SelectItem value="sales">業務</SelectItem>
                <SelectItem value="qc">品管</SelectItem>
                <SelectItem value="shipping">出貨</SelectItem>
                <SelectItem value="finance">財務</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">部門</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">電子郵件</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="輸入電子郵件地址"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_no">電話號碼</Label>
            <Input
              id="phone_no"
              value={formData.phone_no}
              onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })}
              placeholder="輸入電話號碼"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">啟用</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "處理中..." : member ? "更新" : "新增"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
