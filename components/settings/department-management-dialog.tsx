"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DepartmentManagementDialogProps {
  open: boolean
  onClose: () => void
}

export function DepartmentManagementDialog({ open, onClose }: DepartmentManagementDialogProps) {
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadDepartments()
    }
  }, [open])

  const loadDepartments = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API call when available
      setDepartments([
        { id: 1, department_code: "ADMIN", department_name: "管理部", description: "系統管理", is_active: true },
        { id: 2, department_code: "SALES", department_name: "業務部", description: "業務銷售", is_active: true },
        { id: 3, department_code: "QC", department_name: "品管部", description: "品質管理", is_active: true },
        { id: 4, department_code: "SHIPPING", department_name: "出貨部", description: "出貨管理", is_active: true },
      ])
    } catch (error) {
      toast({
        title: "錯誤",
        description: "無法載入部門資料",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>部門管理</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">部門列表</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增部門
            </Button>
          </div>

          <div className="border rounded-lg">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">部門代碼</th>
                  <th className="text-left p-3 font-medium">部門名稱</th>
                  <th className="text-left p-3 font-medium">描述</th>
                  <th className="text-left p-3 font-medium">狀態</th>
                  <th className="text-left p-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept.id} className="border-t">
                    <td className="p-3 font-mono text-sm">{dept.department_code}</td>
                    <td className="p-3">{dept.department_name}</td>
                    <td className="p-3 text-muted-foreground">{dept.description}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${dept.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {dept.is_active ? "啟用" : "停用"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" title="編輯">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" title="刪除">
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

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            關閉
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
