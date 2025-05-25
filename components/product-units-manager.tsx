"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus, Package } from "lucide-react"
import type { StaticParameter, StaticParameterFormData } from "@/types/settings"
import {
  createStaticParameter,
  updateStaticParameter,
  deleteStaticParameter,
  toggleStaticParameterStatus,
} from "@/app/settings/actions"

interface ProductUnitsManagerProps {
  parameters: StaticParameter[]
}

export default function ProductUnitsManager({ parameters }: ProductUnitsManagerProps) {
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

    // 驗證數值
    const numericValue = Number.parseInt(formData.value)
    if (isNaN(numericValue) || numericValue <= 0) {
      alert("請輸入有效的正整數作為單位倍數")
      return
    }

    let result
    if (editingParameter) {
      result = await updateStaticParameter(editingParameter.id, formData)
    } else {
      result = await createStaticParameter(formData)
    }

    if (result.success) {
      setIsDialogOpen(false)
      resetForm()
    } else {
      alert(`操作失敗: ${result.error}`)
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
    if (confirm("確定要刪除此產品單位嗎？刪除後可能會影響現有訂單的顯示。")) {
      const result = await deleteStaticParameter(id)
      if (!result.success) {
        alert(`刪除失敗: ${result.error}`)
      }
    }
  }

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    const result = await toggleStaticParameterStatus(id, !isActive)
    if (!result.success) {
      alert(`狀態更新失敗: ${result.error}`)
    }
  }

  const resetForm = () => {
    setEditingParameter(null)
    const nextSortOrder = parameters.length > 0 ? Math.max(...parameters.map((p) => p.sort_order)) + 1 : 1
    setFormData({
      category: "product_unit",
      code: "",
      name: "",
      value: "",
      description: "",
      is_active: true,
      sort_order: nextSortOrder,
    })
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const getUnitMultiplier = (value: string) => {
    const num = Number.parseInt(value)
    return isNaN(num) ? 1 : num
  }

  return (
    <div className="space-y-6">
      {/* 說明和新增按鈕 */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Package className="h-5 w-5" />
            產品單位管理
          </h3>
          <p className="text-sm text-gray-600">管理產品的計量單位。單位倍數表示該單位相對於基本單位(PCS)的數量。</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• 例如：MPCS = 1000PCS，則倍數為 1000</p>
            <p>• 例如：100PCS = 100PCS，則倍數為 100</p>
            <p>• 例如：PCS = 1PCS，則倍數為 1</p>
          </div>
        </div>

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
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="例如: MPCS, 100PCS, PCS"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">建議使用英文大寫，不含空格</p>
              </div>

              <div>
                <Label htmlFor="name">單位名稱</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="例如: 1000PCS, 100PCS, PCS"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">顯示給用戶看的名稱</p>
              </div>

              <div>
                <Label htmlFor="value">單位倍數</Label>
                <Input
                  id="value"
                  type="number"
                  min="1"
                  value={formData.value}
                  onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                  placeholder="例如: 1000, 100, 1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  相對於基本單位(PCS)的倍數。例如：1000表示1個此單位=1000個PCS
                </p>
              </div>

              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="例如: 一千個為一單位"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="sort_order">排序</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min="1"
                  value={formData.sort_order}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sort_order: Number.parseInt(e.target.value) }))}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">數字越小排序越前面</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">啟用此單位</Label>
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
      <Card>
        <CardHeader>
          <CardTitle>產品單位列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {parameters.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">暫無產品單位</p>
                <p className="text-sm text-gray-400 mt-2">點擊上方按鈕新增第一個產品單位</p>
              </div>
            ) : (
              parameters
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((parameter) => (
                  <div
                    key={parameter.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-lg">{parameter.name}</span>
                        <Badge variant="outline" className="font-mono">
                          {parameter.code}
                        </Badge>
                        <Badge variant={parameter.is_active ? "default" : "secondary"}>
                          {parameter.is_active ? "啟用" : "停用"}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          倍數: {getUnitMultiplier(parameter.value)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">換算:</span> 1 {parameter.name} ={" "}
                          {getUnitMultiplier(parameter.value)} PCS
                        </p>
                        {parameter.description && (
                          <p>
                            <span className="font-medium">描述:</span> {parameter.description}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">排序:</span> {parameter.sort_order}
                        </p>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(parameter.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 使用說明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">使用說明</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>
            • <strong>單位代碼:</strong> 系統內部使用的唯一標識符，建議使用英文大寫
          </p>
          <p>
            • <strong>單位名稱:</strong> 顯示給用戶的友好名稱
          </p>
          <p>
            • <strong>單位倍數:</strong> 該單位相對於基本單位(PCS)的數量關係
          </p>
          <p>
            • <strong>排序:</strong> 控制在下拉選單中的顯示順序，數字越小越靠前
          </p>
          <p>
            • <strong>啟用狀態:</strong> 只有啟用的單位才會在新增訂單時顯示
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
