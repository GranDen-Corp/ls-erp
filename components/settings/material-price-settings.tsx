"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Edit, LineChart, Plus, Save, Trash } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// 模擬料價數據
const initialMaterialPrices = [
  {
    id: "1",
    materialCode: "PCB-FR4",
    materialName: "FR4 PCB 基板",
    price: 2.5,
    unit: "dm²",
    currency: "USD",
    isActive: true,
    history: [
      { date: "2023-01-01", price: 2.3 },
      { date: "2023-02-01", price: 2.35 },
      { date: "2023-03-01", price: 2.4 },
      { date: "2023-04-01", price: 2.45 },
      { date: "2023-05-01", price: 2.48 },
      { date: "2023-06-01", price: 2.5 },
    ],
  },
  {
    id: "2",
    materialCode: "LCD-PANEL",
    materialName: "LCD 面板",
    price: 15.75,
    unit: "片",
    currency: "USD",
    isActive: true,
    history: [
      { date: "2023-01-01", price: 16.5 },
      { date: "2023-02-01", price: 16.2 },
      { date: "2023-03-01", price: 16.0 },
      { date: "2023-04-01", price: 15.9 },
      { date: "2023-05-01", price: 15.8 },
      { date: "2023-06-01", price: 15.75 },
    ],
  },
  {
    id: "3",
    materialCode: "COPPER",
    materialName: "銅材",
    price: 8.35,
    unit: "kg",
    currency: "USD",
    isActive: true,
    history: [
      { date: "2023-01-01", price: 7.9 },
      { date: "2023-02-01", price: 8.0 },
      { date: "2023-03-01", price: 8.1 },
      { date: "2023-04-01", price: 8.2 },
      { date: "2023-05-01", price: 8.3 },
      { date: "2023-06-01", price: 8.35 },
    ],
  },
]

// 貨幣列表
const currencies = [
  { code: "USD", name: "美元" },
  { code: "EUR", name: "歐元" },
  { code: "JPY", name: "日元" },
  { code: "CNY", name: "人民幣" },
  { code: "TWD", name: "新台幣" },
]

// 單位列表
const units = [
  { code: "pcs", name: "個" },
  { code: "片", name: "片" },
  { code: "kg", name: "公斤" },
  { code: "g", name: "克" },
  { code: "m", name: "公尺" },
  { code: "cm", name: "公分" },
  { code: "dm²", name: "平方分米" },
  { code: "m²", name: "平方公尺" },
  { code: "L", name: "公升" },
  { code: "mL", name: "毫升" },
]

interface MaterialPrice {
  id: string
  materialCode: string
  materialName: string
  price: number
  unit: string
  currency: string
  isActive: boolean
  history: { date: string; price: number }[]
}

export function MaterialPriceSettings() {
  const [materials, setMaterials] = useState<MaterialPrice[]>(initialMaterialPrices)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [currentMaterial, setCurrentMaterial] = useState<MaterialPrice | null>(null)
  const [isNewMaterial, setIsNewMaterial] = useState(false)

  const handleAddMaterial = () => {
    setCurrentMaterial({
      id: `${Date.now()}`,
      materialCode: "",
      materialName: "",
      price: 0,
      unit: "pcs",
      currency: "USD",
      isActive: true,
      history: [],
    })
    setIsNewMaterial(true)
    setIsDialogOpen(true)
  }

  const handleEditMaterial = (material: MaterialPrice) => {
    setCurrentMaterial(material)
    setIsNewMaterial(false)
    setIsDialogOpen(true)
  }

  const handleViewHistory = (material: MaterialPrice) => {
    setCurrentMaterial(material)
    setIsHistoryDialogOpen(true)
  }

  const handleToggleActive = (id: string, isActive: boolean) => {
    setMaterials(materials.map((material) => (material.id === id ? { ...material, isActive } : material)))
  }

  const handleDeleteMaterial = (id: string) => {
    setMaterials(materials.filter((material) => material.id !== id))
  }

  const handleSaveMaterial = () => {
    if (!currentMaterial) return

    if (isNewMaterial) {
      setMaterials([...materials, currentMaterial])
    } else {
      setMaterials(materials.map((material) => (material.id === currentMaterial.id ? currentMaterial : material)))
    }

    setIsDialogOpen(false)
  }

  const getUnitName = (code: string) => {
    const unit = units.find((u) => u.code === code)
    return unit ? unit.name : code
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-medium">料價設定</h3>
          <p className="text-sm text-muted-foreground">設定並追蹤各種材料的價格</p>
        </div>
        <Button onClick={handleAddMaterial}>
          <Plus className="mr-2 h-4 w-4" />
          新增材料
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>材料代碼</TableHead>
              <TableHead>材料名稱</TableHead>
              <TableHead>價格</TableHead>
              <TableHead>單位</TableHead>
              <TableHead>貨幣</TableHead>
              <TableHead>啟用</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material) => (
              <TableRow key={material.id}>
                <TableCell>{material.materialCode}</TableCell>
                <TableCell>{material.materialName}</TableCell>
                <TableCell>{material.price.toFixed(2)}</TableCell>
                <TableCell>{material.unit}</TableCell>
                <TableCell>{material.currency}</TableCell>
                <TableCell>
                  <Switch
                    checked={material.isActive}
                    onCheckedChange={(checked) => handleToggleActive(material.id, checked)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleViewHistory(material)}>
                      <LineChart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditMaterial(material)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteMaterial(material.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 新增/編輯材料對話框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNewMaterial ? "新增材料" : "編輯材料"}</DialogTitle>
            <DialogDescription>{isNewMaterial ? "新增一個材料到系統中" : "編輯現有的材料"}</DialogDescription>
          </DialogHeader>

          {currentMaterial && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="materialCode">材料代碼</Label>
                <Input
                  id="materialCode"
                  value={currentMaterial.materialCode}
                  onChange={(e) =>
                    setCurrentMaterial({
                      ...currentMaterial,
                      materialCode: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="materialName">材料名稱</Label>
                <Input
                  id="materialName"
                  value={currentMaterial.materialName}
                  onChange={(e) =>
                    setCurrentMaterial({
                      ...currentMaterial,
                      materialName: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price">價格</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={currentMaterial.price}
                  onChange={(e) =>
                    setCurrentMaterial({
                      ...currentMaterial,
                      price: Number.parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="unit">單位</Label>
                <Select
                  value={currentMaterial.unit}
                  onValueChange={(value) =>
                    setCurrentMaterial({
                      ...currentMaterial,
                      unit: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇單位" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.code} value={unit.code}>
                        {unit.code} ({unit.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="currency">貨幣</Label>
                <Select
                  value={currentMaterial.currency}
                  onValueChange={(value) =>
                    setCurrentMaterial({
                      ...currentMaterial,
                      currency: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇貨幣" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} ({currency.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={currentMaterial.isActive}
                  onCheckedChange={(checked) =>
                    setCurrentMaterial({
                      ...currentMaterial,
                      isActive: checked,
                    })
                  }
                />
                <Label htmlFor="isActive">啟用此材料</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveMaterial}>
              <Save className="mr-2 h-4 w-4" />
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 料價歷史對話框 */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>料價歷史</DialogTitle>
            <DialogDescription>
              {currentMaterial && `${currentMaterial.materialName} (${currentMaterial.materialCode}) 的價格歷史記錄`}
            </DialogDescription>
          </DialogHeader>

          {currentMaterial && (
            <Card>
              <CardHeader>
                <CardTitle>價格趨勢</CardTitle>
                <CardDescription>過去6個月的價格變化</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={currentMaterial.history}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="date" />
                      <YAxis domain={["auto", "auto"]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="price" stroke="#10b981" activeDot={{ r: 8 }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>日期</TableHead>
                        <TableHead className="text-right">
                          價格 ({currentMaterial.currency}/{currentMaterial.unit})
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentMaterial.history.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell className="text-right">{item.price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button onClick={() => setIsHistoryDialogOpen(false)}>關閉</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
