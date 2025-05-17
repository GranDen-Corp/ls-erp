"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface PurchaseEditFormProps {
  purchase: any
}

export function PurchaseEditForm({ purchase }: PurchaseEditFormProps) {
  const [formData, setFormData] = useState({
    supplier_name: purchase.supplier_name,
    supplier_id: purchase.supplier_id,
    status: purchase.status,
    expected_delivery_date: purchase.expected_delivery_date ? new Date(purchase.expected_delivery_date) : null,
    actual_delivery_date: purchase.actual_delivery_date ? new Date(purchase.actual_delivery_date) : null,
    payment_term: purchase.payment_term || "",
    delivery_term: purchase.delivery_term || "",
    currency: purchase.currency,
    notes: purchase.notes || "",
  })

  const [items, setItems] = useState(purchase.items)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // 處理表單輸入變更
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 處理選擇器變更
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 處理日期變更
  const handleDateChange = (name: string, date: Date | null) => {
    setFormData((prev) => ({ ...prev, [name]: date }))
  }

  // 處理項目輸入變更
  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    // 如果更改了數量或單價，重新計算總價
    if (field === "quantity" || field === "unit_price") {
      const quantity = field === "quantity" ? value : newItems[index].quantity
      const unitPrice = field === "unit_price" ? value : newItems[index].unit_price
      newItems[index].total_price = quantity * unitPrice
    }

    setItems(newItems)
  }

  // 添加新項目
  const addItem = () => {
    setItems([
      ...items,
      {
        product_part_no: "",
        product_name: "",
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        status: "pending",
      },
    ])
  }

  // 刪除項目
  const removeItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  // 計算總金額
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.total_price || 0), 0)
  }

  // 提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // 更新採購單主表
      const { error: updateError } = await supabase
        .from("purchases")
        .update({
          supplier_name: formData.supplier_name,
          supplier_id: formData.supplier_id,
          status: formData.status,
          expected_delivery_date: formData.expected_delivery_date
            ? formData.expected_delivery_date.toISOString()
            : null,
          actual_delivery_date: formData.actual_delivery_date ? formData.actual_delivery_date.toISOString() : null,
          payment_term: formData.payment_term,
          delivery_term: formData.delivery_term,
          currency: formData.currency,
          total_amount: calculateTotal(),
          notes: formData.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("purchase_sid", purchase.purchase_sid)

      if (updateError) {
        throw updateError
      }

      // 處理項目更新
      // 1. 刪除所有現有項目
      const { error: deleteError } = await supabase
        .from("purchase_items")
        .delete()
        .eq("purchase_sid", purchase.purchase_sid)

      if (deleteError) {
        throw deleteError
      }

      // 2. 插入更新後的項目
      if (items.length > 0) {
        const formattedItems = items.map((item) => ({
          purchase_sid: purchase.purchase_sid,
          product_part_no: item.product_part_no,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          expected_delivery_date: item.expected_delivery_date,
          actual_delivery_date: item.actual_delivery_date,
          status: item.status,
          notes: item.notes,
        }))

        const { error: insertError } = await supabase.from("purchase_items").insert(formattedItems)

        if (insertError) {
          throw insertError
        }
      }

      toast({
        title: "採購單已更新",
        description: `採購單 ${purchase.purchase_id} 已成功更新`,
      })

      // 重定向到採購單詳情頁面
      router.push(`/purchases/${purchase.purchase_id}`)
    } catch (error: any) {
      console.error("更新採購單時出錯:", error)
      toast({
        title: "更新失敗",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">供應商名稱</label>
            <Input name="supplier_name" value={formData.supplier_name} onChange={handleInputChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">供應商ID</label>
            <Input name="supplier_id" value={formData.supplier_id} onChange={handleInputChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">狀態</label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="選擇狀態" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">待確認</SelectItem>
                <SelectItem value="processing">進行中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">預期交期</label>
            <DatePicker
              date={formData.expected_delivery_date}
              setDate={(date) => handleDateChange("expected_delivery_date", date)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">實際交期</label>
            <DatePicker
              date={formData.actual_delivery_date}
              setDate={(date) => handleDateChange("actual_delivery_date", date)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">幣別</label>
            <Select value={formData.currency} onValueChange={(value) => handleSelectChange("currency", value)}>
              <SelectTrigger>
                <SelectValue placeholder="選擇幣別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">美元 (USD)</SelectItem>
                <SelectItem value="TWD">新台幣 (TWD)</SelectItem>
                <SelectItem value="CNY">人民幣 (CNY)</SelectItem>
                <SelectItem value="EUR">歐元 (EUR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">付款條件</label>
          <Input name="payment_term" value={formData.payment_term} onChange={handleInputChange} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">交貨條件</label>
          <Input name="delivery_term" value={formData.delivery_term} onChange={handleInputChange} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">備註</label>
          <Textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={4} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">採購項目</h3>
          <Button type="button" variant="outline" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" />
            添加項目
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>產品編號</TableHead>
                <TableHead>產品名稱</TableHead>
                <TableHead>數量</TableHead>
                <TableHead>單價</TableHead>
                <TableHead>總價</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    沒有採購項目，請添加項目
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        value={item.product_part_no}
                        onChange={(e) => handleItemChange(index, "product_part_no", e.target.value)}
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.product_name}
                        onChange={(e) => handleItemChange(index, "product_name", e.target.value)}
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", Number.parseInt(e.target.value))}
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, "unit_price", Number.parseFloat(e.target.value))}
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={item.total_price} readOnly />
                    </TableCell>
                    <TableCell>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
          <div className="bg-muted p-4 rounded-md">
            <div className="text-lg font-medium">
              總計:{" "}
              {new Intl.NumberFormat("zh-TW", { style: "currency", currency: formData.currency }).format(
                calculateTotal(),
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          取消
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          保存採購單
        </Button>
      </div>
    </form>
  )
}
