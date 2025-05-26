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
import type { TradeTerm, TradeTermFormData } from "@/types/settings"
import { createTradeTerm, updateTradeTerm, deleteTradeTerm, toggleTradeTermStatus } from "@/app/settings/actions"

interface TradeTermsManagerProps {
  tradeTerms: TradeTerm[]
}

export default function TradeTermsManager({ tradeTerms }: TradeTermsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTerm, setEditingTerm] = useState<TradeTerm | null>(null)
  const [formData, setFormData] = useState<TradeTermFormData>({
    code: "",
    name_en: "",
    name_zh: "",
    description: "",
    is_active: true,
    sort_order: 1,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let result
    if (editingTerm) {
      result = await updateTradeTerm(editingTerm.id, formData)
    } else {
      result = await createTradeTerm(formData)
    }

    if (result.success) {
      setIsDialogOpen(false)
      resetForm()
    }
  }

  const handleEdit = (term: TradeTerm) => {
    setEditingTerm(term)
    setFormData({
      code: term.code,
      name_en: term.name_en,
      name_zh: term.name_zh,
      description: term.description || "",
      is_active: term.is_active,
      sort_order: term.sort_order,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("確定要刪除此交易條件嗎？")) {
      await deleteTradeTerm(id)
    }
  }

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    await toggleTradeTermStatus(id, isActive)
  }

  const resetForm = () => {
    setEditingTerm(null)
    setFormData({
      code: "",
      name_en: "",
      name_zh: "",
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">交易條件管理</h3>
          <p className="text-sm text-muted-foreground">管理國際貿易條件設定</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              新增交易條件
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTerm ? "編輯交易條件" : "新增交易條件"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">代碼</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                  placeholder="如: FOB, CIF"
                  required
                />
              </div>

              <div>
                <Label htmlFor="name_en">英文名稱</Label>
                <Input
                  id="name_en"
                  value={formData.name_en}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name_en: e.target.value }))}
                  placeholder="如: Free On Board"
                  required
                />
              </div>

              <div>
                <Label htmlFor="name_zh">中文名稱</Label>
                <Input
                  id="name_zh"
                  value={formData.name_zh}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name_zh: e.target.value }))}
                  placeholder="如: 裝船交貨"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="交易條件說明"
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
                  {editingTerm ? "更新" : "新增"}
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
          <CardTitle>交易條件列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tradeTerms.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暫無交易條件</p>
            ) : (
              tradeTerms.map((term) => (
                <div key={term.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{term.name_zh}</span>
                      <Badge variant="outline">{term.code}</Badge>
                      <Badge variant={term.is_active ? "default" : "secondary"}>
                        {term.is_active ? "啟用" : "停用"}
                      </Badge>
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
                      onCheckedChange={() => handleToggleStatus(term.id, term.is_active)}
                    />
                    <Button variant="outline" size="sm" onClick={() => handleEdit(term)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(term.id)}>
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
