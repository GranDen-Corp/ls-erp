"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus } from "lucide-react"
import type { StaticParameter, StaticParameterFormData } from "@/types/settings"
import {
  createStaticParameter,
  updateStaticParameter,
  deleteStaticParameter,
  toggleStaticParameterStatus,
} from "@/app/settings/actions"
import { TranslationsManager } from "@/components/settings/translations-manager"

interface StaticParametersManagerProps {
  parameters: StaticParameter[]
}

const CATEGORIES = [
  { value: "product_unit", label: "產品單位" },
  { value: "order_status", label: "訂單狀態" },
  { value: "payment_terms", label: "付款條件" },
  { value: "delivery_terms", label: "交貨條件" },
  { value: "translations", label: "系統翻譯表" },
]

export default function StaticParametersManager({ parameters }: StaticParametersManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("product_unit")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingParameter, setEditingParameter] = useState<StaticParameter | null>(null)
  const [formData, setFormData] = useState<StaticParameterFormData>({
    category: "product_unit",
    code: "",
    name: "",
    value: "",
    description: "",
    is_active: true,
    sort_order: 1,
  })

  // 如果選擇的是系統翻譯表，顯示翻譯管理組件
  if (selectedCategory === "translations") {
    return (
      <div className="space-y-6">
        {/* 類別選擇 */}
        <div className="flex items-center gap-4">
          <Label htmlFor="category">參數類別：</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TranslationsManager />
      </div>
    )
  }

  const filteredParameters = parameters.filter((p) => p.category === selectedCategory)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let result
    if (editingParameter) {
      result = await updateStaticParameter(editingParameter.id, formData)
    } else {
      result = await createStaticParameter(formData)
    }

    if (result.success) {
      setIsDialogOpen(false)
      resetForm()
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
      sort_order: parameter.sort_order,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("確定要刪除此參數嗎？")) {
      await deleteStaticParameter(id)
    }
  }

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    await toggleStaticParameterStatus(id, !isActive)
  }

  const resetForm = () => {
    setEditingParameter(null)
    setFormData({
      category: selectedCategory,
      code: "",
      name: "",
      value: "",
      description: "",
      is_active: true,
      sort_order: 1,
    })
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* 類別選擇 */}
      <div className="flex items-center gap-4">
        <Label htmlFor="category">參數類別：</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              新增參數
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingParameter ? "編輯參數" : "新增參數"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category">類別</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((cat) => cat.value !== "translations").map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="code">代碼</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="name">名稱</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="value">值</Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
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

      {/* 參數列表 */}
      <Card>
        <CardHeader>
          <CardTitle>{CATEGORIES.find((c) => c.value === selectedCategory)?.label} 參數</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredParameters.length === 0 ? (
              <p className="text-gray-500 text-center py-8">此類別暫無參數</p>
            ) : (
              filteredParameters.map((parameter) => (
                <div key={parameter.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{parameter.name}</span>
                      <Badge variant="outline">{parameter.code}</Badge>
                      <Badge variant={parameter.is_active ? "default" : "secondary"}>
                        {parameter.is_active ? "啟用" : "停用"}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>值: {parameter.value}</p>
                      {parameter.description && <p>描述: {parameter.description}</p>}
                      <p>排序: {parameter.sort_order}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={parameter.is_active}
                      onCheckedChange={() => handleToggleStatus(parameter.id, parameter.is_active)}
                    />
                    <Button variant="outline" size="sm" onClick={() => handleEdit(parameter)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(parameter.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
