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
import { Trash2, Edit, Plus } from "lucide-react"
import type { OrderStatus, OrderStatusFormData } from "@/types/settings"
import {
  createOrderStatus,
  updateOrderStatus,
  deleteOrderStatus,
  toggleOrderStatusStatus,
} from "@/app/settings/actions"

interface OrderStatusesManagerProps {
  orderStatuses: OrderStatus[]
}

export default function OrderStatusesManager({ orderStatuses }: OrderStatusesManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStatus, setEditingStatus] = useState<OrderStatus | null>(null)
  const [formData, setFormData] = useState<OrderStatusFormData>({
    status_code: 0,
    name_zh: "",
    description: "",
    color: "",
    is_active: true,
    sort_order: 1,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let result
    if (editingStatus) {
      result = await updateOrderStatus(editingStatus.id, formData)
    } else {
      result = await createOrderStatus(formData)
    }

    if (result.success) {
      setIsDialogOpen(false)
      resetForm()
    }
  }

  const handleEdit = (status: OrderStatus) => {
    setEditingStatus(status)
    setFormData({
      status_code: status.status_code,
      name_zh: status.name_zh,
      description: status.description || "",
      color: status.color || "",
      is_active: status.is_active,
      sort_order: status.sort_order,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("確定要刪除此訂單狀態嗎？")) {
      await deleteOrderStatus(id)
    }
  }

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    await toggleOrderStatusStatus(id, isActive)
  }

  const resetForm = () => {
    setEditingStatus(null)
    setFormData({
      status_code: 0,
      name_zh: "",
      description: "",
      color: "",
      is_active: true,
      sort_order: 1,
    })
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const colorOptions = [
    { value: "bg-orange-500", label: "橙色" },
    { value: "bg-yellow-500", label: "黃色" },
    { value: "bg-green-500", label: "綠色" },
    { value: "bg-blue-500", label: "藍色" },
    { value: "bg-indigo-500", label: "靛色" },
    { value: "bg-purple-500", label: "紫色" },
    { value: "bg-red-500", label: "紅色" },
    { value: "bg-gray-500", label: "灰色" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">訂單狀態管理</h3>
          <p className="text-sm text-muted-foreground">管理訂單狀態設定</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              新增訂單狀態
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingStatus ? "編輯訂單狀態" : "新增訂單狀態"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="status_code">狀態代碼</Label>
                <Input
                  id="status_code"
                  type="number"
                  value={formData.status_code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status_code: Number.parseInt(e.target.value) }))}
                  placeholder="如: 0, 1, 2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="name_zh">狀態名稱</Label>
                <Input
                  id="name_zh"
                  value={formData.name_zh}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name_zh: e.target.value }))}
                  placeholder="如: 待確認, 進行中, 已完成"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="狀態說明"
                />
              </div>

              <div>
                <Label htmlFor="color">顏色</Label>
                <select
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">選擇顏色</option>
                  {colorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                  {editingStatus ? "更新" : "新增"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  取消
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>訂單狀態列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orderStatuses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暫無訂單狀態</p>
            ) : (
              orderStatuses.map((status) => (
                <div key={status.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{status.name_zh}</span>
                      <Badge variant="outline">代碼: {status.status_code}</Badge>
                      {status.color && <Badge className={`${status.color} text-white`}>顏色預覽</Badge>}
                      <Badge variant={status.is_active ? "default" : "secondary"}>
                        {status.is_active ? "啟用" : "停用"}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {status.description && <p>描述: {status.description}</p>}
                      <p>排序: {status.sort_order}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={status.is_active}
                      onCheckedChange={() => handleToggleStatus(status.id, status.is_active)}
                    />
                    <Button variant="outline" size="sm" onClick={() => handleEdit(status)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(status.id)}>
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
