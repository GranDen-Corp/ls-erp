"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus, Star } from "lucide-react"
import type { ExchangeRate, ExchangeRateFormData } from "@/types/settings"
import {
  createExchangeRate,
  updateExchangeRate,
  deleteExchangeRate,
  toggleExchangeRateStatus,
  setBaseCurrency,
} from "@/app/settings/actions"

interface ExchangeRatesManagerProps {
  exchangeRates: ExchangeRate[]
}

export default function ExchangeRatesManager({ exchangeRates }: ExchangeRatesManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null)
  const [formData, setFormData] = useState<ExchangeRateFormData>({
    currency_code: "",
    currency_name: "",
    currency_name_zh: "",
    rate_to_usd: 1.0,
    is_base_currency: false,
    is_active: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let result
    if (editingRate) {
      result = await updateExchangeRate(editingRate.id, formData)
    } else {
      result = await createExchangeRate(formData)
    }

    if (result.success) {
      setIsDialogOpen(false)
      resetForm()
    }
  }

  const handleEdit = (rate: ExchangeRate) => {
    setEditingRate(rate)
    setFormData({
      currency_code: rate.currency_code,
      currency_name: rate.currency_name,
      currency_name_zh: rate.currency_name_zh,
      rate_to_usd: rate.rate_to_usd,
      is_base_currency: rate.is_base_currency,
      is_active: rate.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("確定要刪除此匯率嗎？")) {
      await deleteExchangeRate(id)
    }
  }

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    await toggleExchangeRateStatus(id, !isActive)
  }

  const handleSetBaseCurrency = async (id: number) => {
    if (confirm("確定要設定此貨幣為基準貨幣嗎？")) {
      await setBaseCurrency(id)
    }
  }

  const resetForm = () => {
    setEditingRate(null)
    setFormData({
      currency_code: "",
      currency_name: "",
      currency_name_zh: "",
      rate_to_usd: 1.0,
      is_base_currency: false,
      is_active: true,
    })
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* 新增按鈕 */}
      <div className="flex justify-end items-center">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              新增匯率
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingRate ? "編輯匯率" : "新增匯率"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="currency_code">貨幣代碼</Label>
                <Input
                  id="currency_code"
                  value={formData.currency_code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currency_code: e.target.value.toUpperCase() }))}
                  placeholder="例如: USD, EUR"
                  maxLength={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="currency_name">英文名稱</Label>
                <Input
                  id="currency_name"
                  value={formData.currency_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currency_name: e.target.value }))}
                  placeholder="例如: US Dollar"
                  required
                />
              </div>

              <div>
                <Label htmlFor="currency_name_zh">中文名稱</Label>
                <Input
                  id="currency_name_zh"
                  value={formData.currency_name_zh}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currency_name_zh: e.target.value }))}
                  placeholder="例如: 美元"
                  required
                />
              </div>

              <div>
                <Label htmlFor="rate_to_usd">對美元匯率</Label>
                <Input
                  id="rate_to_usd"
                  type="number"
                  step="0.000001"
                  value={formData.rate_to_usd}
                  onChange={(e) => setFormData((prev) => ({ ...prev, rate_to_usd: Number.parseFloat(e.target.value) }))}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_base_currency"
                  checked={formData.is_base_currency}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_base_currency: checked }))}
                />
                <Label htmlFor="is_base_currency">設為基準貨幣</Label>
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
                  {editingRate ? "更新" : "新增"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  取消
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 匯率列表 */}
      <Card>
        <CardHeader>
          <CardTitle>匯率列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exchangeRates.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暫無匯率資料</p>
            ) : (
              exchangeRates.map((rate) => (
                <div key={rate.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{rate.currency_code}</span>
                      <span className="text-sm text-gray-600">
                        {rate.currency_name} / {rate.currency_name_zh}
                      </span>
                      {rate.is_base_currency && (
                        <Badge variant="default" className="bg-yellow-500">
                          <Star className="w-3 h-3 mr-1" />
                          基準貨幣
                        </Badge>
                      )}
                      <Badge variant={rate.is_active ? "default" : "secondary"}>
                        {rate.is_active ? "啟用" : "停用"}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>對美元匯率: {rate.rate_to_usd}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!rate.is_base_currency && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetBaseCurrency(rate.id)}
                        title="設為基準貨幣"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    )}
                    <Switch
                      checked={rate.is_active}
                      onCheckedChange={() => handleToggleStatus(rate.id, rate.is_active)}
                    />
                    <Button variant="outline" size="sm" onClick={() => handleEdit(rate)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(rate.id)}>
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
