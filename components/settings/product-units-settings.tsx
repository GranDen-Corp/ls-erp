"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus, Star } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { StaticParameter, StaticParameterFormData } from "@/types/settings"
import {
  createStaticParameter,
  updateStaticParameter,
  deleteStaticParameter,
  toggleStaticParameterStatus,
  setDefaultUnit,
} from "@/app/settings/actions"

interface ProductUnitsSettingsProps {
  parameters: StaticParameter[]
}

export function ProductUnitsSettings({ parameters }: ProductUnitsSettingsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingParameter, setEditingParameter] = useState<StaticParameter | null>(null)
  const [formData, setFormData] = useState<StaticParameterFormData>({
    category: "product_unit",
    code: "",
    name: "",
    value: "",
    description: "",
    is_active: true,
    is_default: false,
    sort_order: 1,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      let result
      if (editingParameter) {
        result = await updateStaticParameter(editingParameter.id, formData)
      } else {
        result = await createStaticParameter(formData)
      }

      if (result.success) {
        toast({
          title: editingParameter ? "單位已更新" : "單位已新增",
          description: `產品單位 ${formData.name} 已成功${editingParameter ? "更新" : "新增"}`,
        })
        setIsDialogOpen(false)
        resetForm()
      } else {
        toast({
          title: "操作失敗",
          description: result.error || "發生未知錯誤",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "操作失敗",
        description: "發生未知錯誤",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (parameter: StaticParameter) => {
    setEditingParameter(parameter)
    setFormData({
      category: parameter.category,
      code: parameter.code,
      name: parameter.name,
      value: parameter.value,
      description: parameter.description || "",
      is_active: parameter.is_active,
      is_default: parameter.is_default || false,
      sort_order: parameter.sort_order,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("確定要刪除此產品單位嗎？")) {
      try {
        const result = await deleteStaticParameter(id)
        if (result.success) {
          toast({
            title: "單位已刪除",
            description: "產品單位已成功刪除",
          })
        } else {
          toast({
            title: "刪除失敗",
            description: result.error || "發生未知錯誤",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "刪除失敗",
          description: "發生未知錯誤",
          variant: "destructive",
        })
      }
    }
  }

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      const result = await toggleStaticParameterStatus(id, !isActive)
      if (result.success) {
        toast({
          title: isActive ? "單位已停用" : "單位已啟用",
          description: `產品單位狀態已更新為${isActive ? "停用" : "啟用"}`,
        })
      } else {
        toast({
          title: "狀態更新失敗",
          description: result.error || "發生未知錯誤",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "狀態更新失敗",
        description: "發生未知錯誤",
        variant: "destructive",
      })
    }
  }

  const handleSetDefault = async (id: number) => {
    try {
      const result = await setDefaultUnit(id)
      if (result.success) {
        toast({
          title: "預設單位已設定",
          description: "產品預設單位已成功更新",
        })
      } else {
        toast({
          title: "設定預設單位失敗",
          description: result.error || "發生未知錯誤",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "設定預設單位失敗",
        description: "發生未知錯誤",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setEditingParameter(null)
    setFormData({
      category: "product_unit",
      code: "",
      name: "",
      value: "",
      description: "",
      is_active: true,
      is_default: false,
      sort_order: 1,
    })
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  // 過濾只顯示產品單位類別的參數
  const productUnitParams = parameters.filter((param) => param.category === "product_unit")

  return (
    <div className="space-y-6">
      {/* 新增按鈕 */}
      <div className="flex justify-end items-center">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              新增產品單位
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingParameter ? "編輯產品單位" : "新增產品單位"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">單位代碼</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                  placeholder="例如: MPCS, PCS"
                  required
                />
              </div>

              <div>
                <Label htmlFor="name">單位名稱</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="例如: 1000PCS, PCS"
                  required
                />
              </div>

              <div>
                <Label htmlFor="value">換算倍數</Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                  placeholder="例如: 1000, 1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="單位描述"
                />
              </div>

              <div>
                <Label htmlFor="sort_order">排序</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sort_order: Number.parseInt(e.target.value) }))}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">啟用</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_default: checked }))}
                />
                <Label htmlFor="is_default">設為預設單位</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingParameter ? "更新" : "新增"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  取消
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 產品單位列表 */}
      <div className="space-y-4">
        {productUnitParams.length === 0 ? (
          <p className="text-gray-500 text-center py-8">暫無產品單位資料</p>
        ) : (
          productUnitParams.map((parameter) => (
            <div key={parameter.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{parameter.name}</span>
                  <Badge variant="outline">{parameter.code}</Badge>
                  {parameter.is_default && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                      預設單位
                    </Badge>
                  )}
                  <Badge variant={parameter.is_active ? "default" : "secondary"}>
                    {parameter.is_active ? "啟用" : "停用"}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <p>換算倍數: {parameter.value}</p>
                  {parameter.description && <p>描述: {parameter.description}</p>}
                  <p>排序: {parameter.sort_order}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!parameter.is_default && (
                  <Button variant="ghost" size="sm" onClick={() => handleSetDefault(parameter.id)} title="設為預設單位">
                    <Star className="w-4 h-4 text-yellow-500" />
                  </Button>
                )}
                {parameter.is_default && (
                  <Button variant="ghost" size="sm" disabled title="目前為預設單位">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  </Button>
                )}
                <Switch
                  checked={parameter.is_active}
                  onCheckedChange={() => handleToggleStatus(parameter.id, parameter.is_active)}
                />
                <Button variant="outline" size="sm" onClick={() => handleEdit(parameter)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(parameter.id)}
                  disabled={parameter.is_default}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
