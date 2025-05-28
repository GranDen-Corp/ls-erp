"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Save } from "lucide-react"
import type { Department } from "@/types/team-matrix"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface DepartmentManagementDialogProps {
  open: boolean
  onClose: () => void
}

export function DepartmentManagementDialog({ open, onClose }: DepartmentManagementDialogProps) {
  const [departments, setDepartments] = useState<Department[]>([])
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    department_code: "",
    department_name: "",
    department_name_en: "",
    description: "",
    sort_order: 0,
    is_active: true,
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadDepartments()
    }
  }, [open])

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase.from("departments").select("*").order("sort_order")

      if (error) throw error
      setDepartments(data || [])
    } catch (error) {
      toast({
        title: "錯誤",
        description: "無法載入部門資料",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (dept: Department) => {
    setEditingDept(dept)
    setFormData({
      department_code: dept.department_code,
      department_name: dept.department_name,
      department_name_en: dept.department_name_en || "",
      description: dept.description || "",
      sort_order: dept.sort_order,
      is_active: dept.is_active,
    })
    setIsCreating(false)
  }

  const handleCreate = () => {
    setEditingDept(null)
    setFormData({
      department_code: "",
      department_name: "",
      department_name_en: "",
      description: "",
      sort_order: departments.length + 1,
      is_active: true,
    })
    setIsCreating(true)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      if (isCreating) {
        const { error } = await supabase.from("departments").insert([formData])
        if (error) throw error
        toast({ title: "成功", description: "部門已新增" })
      } else if (editingDept) {
        const { error } = await supabase.from("departments").update(formData).eq("id", editingDept.id)
        if (error) throw error
        toast({ title: "成功", description: "部門已更新" })
      }

      setIsCreating(false)
      setEditingDept(null)
      loadDepartments()
    } catch (error: any) {
      toast({
        title: "錯誤",
        description: error.message || "操作失敗",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (dept: Department) => {
    if (!confirm(`確定要刪除部門「${dept.department_name}」嗎？`)) return

    try {
      const { error } = await supabase.from("departments").delete().eq("id", dept.id)

      if (error) throw error
      toast({ title: "成功", description: "部門已刪除" })
      loadDepartments()
    } catch (error: any) {
      toast({
        title: "錯誤",
        description: error.message || "刪除失敗",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingDept(null)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            部門管理
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              新增部門
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 編輯表單 */}
          {(isCreating || editingDept) && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
              <h3 className="font-medium">{isCreating ? "新增部門" : "編輯部門"}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">部門代碼 *</Label>
                  <Input
                    id="code"
                    value={formData.department_code}
                    onChange={(e) => setFormData({ ...formData, department_code: e.target.value.toUpperCase() })}
                    placeholder="例如: SALES"
                    disabled={!isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">部門名稱 *</Label>
                  <Input
                    id="name"
                    value={formData.department_name}
                    onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                    placeholder="例如: 業務團隊"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_en">英文名稱</Label>
                  <Input
                    id="name_en"
                    value={formData.department_name_en}
                    onChange={(e) => setFormData({ ...formData, department_name_en: e.target.value })}
                    placeholder="例如: Sales Team"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort">排序</Label>
                  <Input
                    id="sort"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">描述</Label>
                <Textarea
                  id="desc"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="部門職責描述"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>啟用狀態</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "處理中..." : "儲存"}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  取消
                </Button>
              </div>
            </div>
          )}

          {/* 部門列表 */}
          <div className="border rounded-lg">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">代碼</th>
                  <th className="text-left p-3 font-medium">名稱</th>
                  <th className="text-left p-3 font-medium">英文名稱</th>
                  <th className="text-left p-3 font-medium">排序</th>
                  <th className="text-left p-3 font-medium">狀態</th>
                  <th className="text-left p-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept.id} className="border-t">
                    <td className="p-3 font-mono">{dept.department_code}</td>
                    <td className="p-3">{dept.department_name}</td>
                    <td className="p-3 text-muted-foreground">{dept.department_name_en}</td>
                    <td className="p-3">{dept.sort_order}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${dept.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {dept.is_active ? "啟用" : "停用"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(dept)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(dept)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
