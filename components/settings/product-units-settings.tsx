"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ProductUnit {
  id: number
  category: string
  code: string
  name: string
  value: string
  description: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

interface ProductUnitFormData {
  code: string
  name: string
  value: string
  description: string
  sort_order: number
}

export function ProductUnitsSettings() {
  const [units, setUnits] = useState<ProductUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<ProductUnit | null>(null)
  const [formData, setFormData] = useState<ProductUnitFormData>({
    code: "",
    name: "",
    value: "",
    description: "",
    sort_order: 1,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from("static_parameters")
        .select("*")
        .eq("category", "product_unit")
        .order("sort_order", { ascending: true })

      if (error) throw error
      setUnits(data || [])
    } catch (error) {
      console.error("Error fetching product units:", error)
      toast({
        title: "錯誤",
        description: "無法載入產品單位資料",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const unitData = {
        category: "product_unit",
        code: formData.code,
        name: formData.name,
        value: formData.value,
        description: formData.description || null,
        is_active: true,
        sort_order: formData.sort_order,
      }

      if (editingUnit) {
        const { error } = await supabase.from("static_parameters").update(unitData).eq("id", editingUnit.id)

        if (error) throw error

        toast({
          title: "成功",
          description: "產品單位已更新",
        })
      } else {
        const { error } = await supabase.from("static_parameters").insert([unitData])

        if (error) throw error

        toast({
          title: "成功",
          description: "產品單位已新增",
        })
      }

      setIsDialogOpen(false)
      setEditingUnit(null)
      setFormData({
        code: "",
        name: "",
        value: "",
        description: "",
        sort_order: 1,
      })
      fetchUnits()
    } catch (error) {
      console.error("Error saving product unit:", error)
      toast({
        title: "錯誤",
        description: "儲存產品單位時發生錯誤",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (unit: ProductUnit) => {
    setEditingUnit(unit)
    setFormData({
      code: unit.code,
      name: unit.name,
      value: unit.value,
      description: unit.description || "",
      sort_order: unit.sort_order,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from("static_parameters").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "成功",
        description: "產品單位已刪除",
      })
      fetchUnits()
    } catch (error) {
      console.error("Error deleting product unit:", error)
      toast({
        title: "錯誤",
        description: "刪除產品單位時發生錯誤",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      const { error } = await supabase.from("static_parameters").update({ is_active: isActive }).eq("id", id)

      if (error) throw error

      toast({
        title: "成功",
        description: `產品單位已${isActive ? "啟用" : "停用"}`,
      })
      fetchUnits()
    } catch (error) {
      console.error("Error toggling unit status:", error)
      toast({
        title: "錯誤",
        description: "更新產品單位狀態時發生錯誤",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      value: "",
      description: "",
      sort_order: 1,
    })
    setEditingUnit(null)
  }

  if (loading) {
    return <div className="flex justify-center p-8">載入中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">產品單位設定</h3>
          <p className="text-sm text-muted-foreground">管理產品的數量單位及其換算關係</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增單位
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUnit ? "編輯產品單位" : "新增產品單位"}</DialogTitle>
              <DialogDescription>設定產品單位的代碼、名稱和換算關係</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">單位代碼</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="例如: MPCS"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">單位名稱</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如: 1000PCS"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">換算值 (PCS)</Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="例如: 1000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort_order">排序</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number.parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="單位描述（選填）"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    resetForm()
                  }}
                >
                  取消
                </Button>
                <Button type="submit">{editingUnit ? "更新" : "新增"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>排序</TableHead>
              <TableHead>單位代碼</TableHead>
              <TableHead>單位名稱</TableHead>
              <TableHead>換算值 (PCS)</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell>{unit.sort_order}</TableCell>
                <TableCell className="font-medium">{unit.code}</TableCell>
                <TableCell>{unit.name}</TableCell>
                <TableCell>{unit.value}</TableCell>
                <TableCell>{unit.description || "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={unit.is_active}
                      onCheckedChange={(checked) => handleToggleStatus(unit.id, checked)}
                    />
                    <Badge variant={unit.is_active ? "default" : "secondary"}>{unit.is_active ? "啟用" : "停用"}</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(unit)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>確認刪除</AlertDialogTitle>
                          <AlertDialogDescription>
                            您確定要刪除產品單位「{unit.name}」嗎？此操作無法復原。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(unit.id)}>刪除</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
