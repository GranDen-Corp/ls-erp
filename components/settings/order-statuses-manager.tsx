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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Edit, Plus, Palette } from "lucide-react"
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

// 預定義的狀態顏色映射
const STATUS_COLORS = {
  0: { name: "橙色", value: "bg-orange-500", hex: "#f97316" },
  1: { name: "黃色", value: "bg-yellow-500", hex: "#eab308" },
  2: { name: "綠色", value: "bg-green-500", hex: "#22c55e" },
  3: { name: "藍色", value: "bg-blue-500", hex: "#3b82f6" },
  4: { name: "靛色", value: "bg-indigo-500", hex: "#6366f1" },
  5: { name: "紫色", value: "bg-purple-500", hex: "#a855f7" },
  6: { name: "咖啡色", value: "bg-amber-700", hex: "#a16207" },
  7: { name: "紅色", value: "bg-red-500", hex: "#ef4444" },
}

export default function OrderStatusesManager({ orderStatuses }: OrderStatusesManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStatus, setEditingStatus] = useState<OrderStatus | null>(null)
  const [formData, setFormData] = useState<OrderStatusFormData>({
    status_code: 0,
    name_zh: "",
    description: "",
    color: STATUS_COLORS[0].value,
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
      color: status.color || STATUS_COLORS[status.status_code]?.value || STATUS_COLORS[0].value,
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
      color: STATUS_COLORS[0].value,
      is_active: true,
      sort_order: 1,
    })
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  // 根據狀態代碼獲取預設顏色
  const getDefaultColor = (statusCode: number) => {
    return STATUS_COLORS[statusCode as keyof typeof STATUS_COLORS]?.value || STATUS_COLORS[0].value
  }

  // 當狀態代碼改變時，自動更新顏色
  const handleStatusCodeChange = (statusCode: number) => {
    setFormData((prev) => ({
      ...prev,
      status_code: statusCode,
      color: getDefaultColor(statusCode),
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">訂單狀態管理</h3>
          <p className="text-sm text-muted-foreground">管理訂單處理流程的各個狀態及其顏色標識</p>
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
                <Select
                  value={String(formData.status_code)}
                  onValueChange={(value) => handleStatusCodeChange(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇狀態代碼" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_COLORS).map(([code, color]) => (
                      <SelectItem key={code} value={code}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${color.value}`}></div>
                          {code} - {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="name_zh">狀態名稱</Label>
                <Input
                  id="name_zh"
                  value={formData.name_zh}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name_zh: e.target.value }))}
                  placeholder="如: 輸入中, 待主管簽核"
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
                <Label htmlFor="color">狀態顏色</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-6 h-6 rounded-full ${formData.color}`}></div>
                  <span className="text-sm text-muted-foreground">
                    {STATUS_COLORS[formData.status_code as keyof typeof STATUS_COLORS]?.name || "預設顏色"}
                  </span>
                </div>
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
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            訂單狀態列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orderStatuses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暫無訂單狀態</p>
            ) : (
              orderStatuses
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((status) => {
                  const statusColor =
                    status.color ||
                    STATUS_COLORS[status.status_code as keyof typeof STATUS_COLORS]?.value ||
                    STATUS_COLORS[0].value
                  return (
                    <div key={status.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-4 h-4 rounded-full ${statusColor}`}></div>
                          <span className="font-medium">{status.name_zh}</span>
                          <Badge variant="outline">{status.status_code}</Badge>
                          <Badge variant={status.is_active ? "default" : "secondary"}>
                            {status.is_active ? "啟用" : "停用"}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 ml-7">
                          {status.description && <p>描述: {status.description}</p>}
                          <p>排序: {status.sort_order}</p>
                          <p>顏色: {STATUS_COLORS[status.status_code as keyof typeof STATUS_COLORS]?.name || "自訂"}</p>
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
                  )
                })
            )}
          </div>
        </CardContent>
      </Card>

      {/* 顏色說明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">狀態顏色說明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(STATUS_COLORS).map(([code, color]) => (
              <div key={code} className="flex items-center gap-2 p-2 border rounded">
                <div className={`w-4 h-4 rounded-full ${color.value}`}></div>
                <span className="text-sm">
                  {code}: {color.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
