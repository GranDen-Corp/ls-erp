"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus } from "lucide-react"
import type { StaticParameter, StaticParameterFormData, TradeTerm, PaymentTerm, OrderStatus } from "@/types/settings"
import {
  createStaticParameter,
  updateStaticParameter,
  deleteStaticParameter,
  toggleStaticParameterStatus,
  deleteTradeTerm,
  toggleTradeTermStatus,
  deletePaymentTerm,
  togglePaymentTermStatus,
  deleteOrderStatus,
  toggleOrderStatusStatus,
} from "@/app/settings/actions"

interface StaticParametersManagerProps {
  parameters: StaticParameter[]
  tradeTerms: TradeTerm[]
  paymentTerms: PaymentTerm[]
  orderStatuses: OrderStatus[]
}

export default function StaticParametersManager({
  parameters,
  tradeTerms,
  paymentTerms,
  orderStatuses,
}: StaticParametersManagerProps) {
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
    await toggleStaticParameterStatus(id, isActive)
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

  const openAddDialog = (category = "product_unit") => {
    resetForm()
    setFormData((prev) => ({ ...prev, category }))
    setIsDialogOpen(true)
  }

  // 按類別分組參數
  const parametersByCategory = parameters.reduce(
    (acc, param) => {
      if (!acc[param.category]) {
        acc[param.category] = []
      }
      acc[param.category].push(param)
      return acc
    },
    {} as Record<string, StaticParameter[]>,
  )

  const renderParameterList = (categoryParams: StaticParameter[], category: string) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium">參數列表</h4>
        <Button onClick={() => openAddDialog(category)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          新增參數
        </Button>
      </div>

      {categoryParams.length === 0 ? (
        <p className="text-gray-500 text-center py-8">暫無參數</p>
      ) : (
        categoryParams.map((param) => (
          <div key={param.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{param.name}</span>
                <Badge variant="outline">{param.code}</Badge>
                <Badge variant={param.is_active ? "default" : "secondary"}>{param.is_active ? "啟用" : "停用"}</Badge>
              </div>
              <div className="text-sm text-gray-600">
                <p>值: {param.value}</p>
                {param.description && <p>描述: {param.description}</p>}
                <p>排序: {param.sort_order}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={param.is_active} onCheckedChange={() => handleToggleStatus(param.id, param.is_active)} />
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
  )

  const renderTradeTermsList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium">交易條件列表</h4>
        <Button
          onClick={() => {
            /* TODO: 實現新增交易條件 */
          }}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增交易條件
        </Button>
      </div>

      {tradeTerms.length === 0 ? (
        <p className="text-gray-500 text-center py-8">暫無交易條件</p>
      ) : (
        tradeTerms.map((term) => (
          <div key={term.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{term.name_zh}</span>
                <Badge variant="outline">{term.code}</Badge>
                <Badge variant={term.is_active ? "default" : "secondary"}>{term.is_active ? "啟用" : "停用"}</Badge>
              </div>
              <div className="text-sm text-gray-600">
                <p>英文: {term.name_en}</p>
                {term.description && <p>描述: {term.description}</p>}
                <p>排序: {term.sort_order}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={term.is_active} onCheckedChange={() => toggleTradeTermStatus(term.id, term.is_active)} />
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => deleteTradeTerm(term.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  )

  const renderPaymentTermsList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium">付款條件列表</h4>
        <Button
          onClick={() => {
            /* TODO: 實現新增付款條件 */
          }}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增付款條件
        </Button>
      </div>

      {paymentTerms.length === 0 ? (
        <p className="text-gray-500 text-center py-8">暫無付款條件</p>
      ) : (
        paymentTerms.map((term) => (
          <div key={term.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{term.name_zh}</span>
                <Badge variant="outline">{term.code}</Badge>
                <Badge variant={term.is_active ? "default" : "secondary"}>{term.is_active ? "啟用" : "停用"}</Badge>
              </div>
              <div className="text-sm text-gray-600">
                <p>英文: {term.name_en}</p>
                {term.description && <p>描述: {term.description}</p>}
                <p>排序: {term.sort_order}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={term.is_active}
                onCheckedChange={() => togglePaymentTermStatus(term.id, term.is_active)}
              />
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => deletePaymentTerm(term.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  )

  const renderOrderStatusesList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium">訂單狀態列表</h4>
        <Button
          onClick={() => {
            /* TODO: 實現新增訂單狀態 */
          }}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增訂單狀態
        </Button>
      </div>

      {orderStatuses.length === 0 ? (
        <p className="text-gray-500 text-center py-8">暫無訂單狀態</p>
      ) : (
        orderStatuses.map((status) => (
          <div key={status.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{status.name_zh}</span>
                <Badge variant="outline">{status.status_code}</Badge>
                <Badge variant={status.is_active ? "default" : "secondary"}>{status.is_active ? "啟用" : "停用"}</Badge>
              </div>
              <div className="text-sm text-gray-600">
                {status.description && <p>描述: {status.description}</p>}
                <p>排序: {status.sort_order}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={status.is_active}
                onCheckedChange={() => toggleOrderStatusStatus(status.id, status.is_active)}
              />
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => deleteOrderStatus(status.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <Tabs defaultValue="product-units" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="product-units">產品單位</TabsTrigger>
          <TabsTrigger value="trade-terms">交易條件</TabsTrigger>
          <TabsTrigger value="payment-terms">付款條件</TabsTrigger>
          <TabsTrigger value="order-statuses">訂單狀態</TabsTrigger>
        </TabsList>

        <TabsContent value="product-units">
          <Card>
            <CardHeader>
              <CardTitle>產品單位設定</CardTitle>
            </CardHeader>
            <CardContent>{renderParameterList(parametersByCategory.product_unit || [], "product_unit")}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trade-terms">
          <Card>
            <CardHeader>
              <CardTitle>交易條件設定</CardTitle>
            </CardHeader>
            <CardContent>{renderTradeTermsList()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-terms">
          <Card>
            <CardHeader>
              <CardTitle>付款條件設定</CardTitle>
            </CardHeader>
            <CardContent>{renderPaymentTermsList()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="order-statuses">
          <Card>
            <CardHeader>
              <CardTitle>訂單狀態設定</CardTitle>
            </CardHeader>
            <CardContent>{renderOrderStatusesList()}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
