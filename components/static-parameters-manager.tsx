"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus } from "lucide-react"
import type { StaticParameter, StaticParameterFormData } from "@/types/settings"
import {
  createStaticParameter,
  updateStaticParameter,
  deleteStaticParameter,
  toggleStaticParameterStatus,
} from "@/app/settings/actions"

interface StaticParametersManagerProps {
  parameters: StaticParameter[]
  tradeTerms?: any[]
  paymentTerms?: any[]
  orderStatuses?: any[]
}

export default function StaticParametersManager({ parameters }: StaticParametersManagerProps) {
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
      category: "product_unit",
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

  // Filter only product_unit parameters
  const productUnitParams = parameters.filter((param) => param.category === "product_unit")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>產品單位設定</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium">參數列表</h4>
              <Button onClick={openAddDialog} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                新增參數
              </Button>
            </div>

            {productUnitParams.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暫無參數</p>
            ) : (
              productUnitParams.map((param) => (
                <div key={param.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{param.name}</span>
                      <Badge variant="outline">{param.code}</Badge>
                      <Badge variant={param.is_active ? "default" : "secondary"}>
                        {param.is_active ? "啟用" : "停用"}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>值: {param.value}</p>
                      {param.description && <p>描述: {param.description}</p>}
                      <p>排序: {param.sort_order}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={param.is_active}
                      onCheckedChange={() => handleToggleStatus(param.id, param.is_active)}
                    />
                    <Button variant="outline" size="sm" onClick={() => handleEdit(param)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(param.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingParameter ? "編輯參數" : "新增參數"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="category">類別</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="如: product_unit"
                required
                disabled={!!editingParameter}
              />
            </div>

            <div>
              <Label htmlFor="code">代碼</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="如: pcs, kg"
                required
              />
            </div>

            <div>
              <Label htmlFor="name">名稱</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="如: 個, 公斤"
                required
              />
            </div>

            <div>
              <Label htmlFor="value">值</Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                placeholder="參數值"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="參數說明"
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
  )
}
