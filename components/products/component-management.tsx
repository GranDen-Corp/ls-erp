"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash, Plus, Calculator, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrencyAmount } from "@/lib/currency-utils"
import type { Component } from "@/types/assembly-product"

interface ComponentManagementProps {
  components: Component[]
  onChange: (components: Component[]) => void
  currency?: string
  readOnly?: boolean
  availableComponents?: any[] // 可用的組件列表
}

export const ComponentManagement: React.FC<ComponentManagementProps> = ({
  components: initialComponents,
  onChange,
  currency = "USD",
  readOnly = false,
  availableComponents = [],
}) => {
  const [components, setComponents] = useState<Component[]>(initialComponents || [])
  const [showComponentSelector, setShowComponentSelector] = useState(false)
  const [selectedComponents, setSelectedComponents] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showCostCalculator, setShowCostCalculator] = useState(false)
  const [showComponentDetails, setShowComponentDetails] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)

  // 當初始組件變更時更新狀態
  useEffect(() => {
    setComponents(initialComponents || [])
  }, [initialComponents])

  // 當組件變更時通知父組件
  useEffect(() => {
    onChange(components)
  }, [components, onChange])

  // 添加組件
  const addComponent = () => {
    const newComponent: Component = {
      id: Math.random().toString(36).substring(2, 9),
      partNo: "",
      name: "",
      quantity: 1,
      price: 0,
      unit: "pcs",
      notes: "",
    }

    setComponents([...components, newComponent])
  }

  // 更新組件
  const updateComponent = (id: string, field: keyof Component, value: any) => {
    setComponents(
      components.map((component) => {
        if (component.id === id) {
          return { ...component, [field]: value }
        }
        return component
      }),
    )
  }

  // 移除組件
  const removeComponent = (id: string) => {
    setComponents(components.filter((component) => component.id !== id))
  }

  // 計算總成本
  const calculateTotalCost = () => {
    return components.reduce((sum, component) => sum + (component.price || 0) * component.quantity, 0)
  }

  // 從可用組件中添加選中的組件
  const addSelectedComponents = () => {
    const newComponents = selectedComponents
      .map((partNo) => {
        const foundComponent = availableComponents.find((c) => c.part_no === partNo)
        if (foundComponent) {
          return {
            id: Math.random().toString(36).substring(2, 9),
            partNo: foundComponent.part_no,
            name: foundComponent.name || foundComponent.product_name,
            quantity: 1,
            price: foundComponent.unit_price || foundComponent.last_price || 0,
            unit: foundComponent.unit || "pcs",
            notes: "",
            specifications: foundComponent.specifications,
            material: foundComponent.material,
          }
        }
        return null
      })
      .filter(Boolean) as Component[]

    setComponents([...components, ...newComponents])
    setSelectedComponents([])
    setShowComponentSelector(false)
  }

  // 過濾可用組件
  const filteredComponents = availableComponents.filter((component) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      component.part_no?.toLowerCase().includes(searchLower) ||
      component.name?.toLowerCase().includes(searchLower) ||
      component.product_name?.toLowerCase().includes(searchLower)
    )
  })

  // 切換選中狀態
  const toggleComponentSelection = (partNo: string) => {
    setSelectedComponents((prev) => {
      if (prev.includes(partNo)) {
        return prev.filter((p) => p !== partNo)
      } else {
        return [...prev, partNo]
      }
    })
  }

  // 檢查組件是否已添加
  const isComponentAdded = (partNo: string) => {
    return components.some((component) => component.partNo === partNo)
  }

  // 查看組件詳情
  const viewComponentDetails = (component: Component) => {
    setSelectedComponent(component)
    setShowComponentDetails(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">組件管理</h3>
          <p className="text-sm text-muted-foreground">管理產品的組成部件</p>
        </div>
        <div className="flex gap-2">
          {!readOnly && (
            <>
              <Button variant="outline" onClick={() => setShowComponentSelector(true)}>
                <FileText className="h-4 w-4 mr-2" />
                從產品庫選擇
              </Button>
              <Button variant="outline" onClick={addComponent}>
                <Plus className="h-4 w-4 mr-2" />
                添加組件
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => setShowCostCalculator(true)}>
            <Calculator className="h-4 w-4 mr-2" />
            成本計算器
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>組件編號</TableHead>
              <TableHead>組件名稱</TableHead>
              <TableHead className="text-center">數量</TableHead>
              <TableHead>單位</TableHead>
              <TableHead className="text-right">單價 ({currency})</TableHead>
              <TableHead className="text-right">總價 ({currency})</TableHead>
              {!readOnly && <TableHead className="w-[100px]">操作</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {components.length > 0 ? (
              components.map((component) => (
                <TableRow key={component.id}>
                  <TableCell>{component.partNo}</TableCell>
                  <TableCell>
                    <div className="cursor-pointer hover:text-blue-600" onClick={() => viewComponentDetails(component)}>
                      {component.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {readOnly ? (
                      component.quantity
                    ) : (
                      <Input
                        type="number"
                        min="1"
                        value={component.quantity}
                        onChange={(e) => updateComponent(component.id, "quantity", Number(e.target.value) || 1)}
                        className="w-20 text-right mx-auto"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {readOnly ? (
                      component.unit
                    ) : (
                      <Select
                        value={component.unit}
                        onValueChange={(value) => updateComponent(component.id, "unit", value)}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="單位" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pcs">件 (pcs)</SelectItem>
                          <SelectItem value="set">套 (set)</SelectItem>
                          <SelectItem value="kg">公斤 (kg)</SelectItem>
                          <SelectItem value="m">米 (m)</SelectItem>
                          <SelectItem value="roll">卷 (roll)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {readOnly ? (
                      formatCurrencyAmount(component.price || 0, currency)
                    ) : (
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={component.price || 0}
                        onChange={(e) => updateComponent(component.id, "price", Number(e.target.value) || 0)}
                        className="w-24 text-right ml-auto"
                      />
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrencyAmount((component.price || 0) * component.quantity, currency)}
                  </TableCell>
                  {!readOnly && (
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeComponent(component.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={readOnly ? 6 : 7} className="h-24 text-center">
                  尚未添加組件
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={readOnly ? 4 : 5} className="text-right font-bold">
                總成本:
              </TableCell>
              <TableCell className="text-right font-bold">
                {formatCurrencyAmount(calculateTotalCost(), currency)}
              </TableCell>
              {!readOnly && <TableCell></TableCell>}
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* 組件選擇器對話框 */}
      <Dialog open={showComponentSelector} onOpenChange={setShowComponentSelector}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>選擇組件</DialogTitle>
            <DialogDescription>從產品庫中選擇要添加的組件</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="搜尋組件編號或名稱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredComponents.length > 0 ? (
                  filteredComponents.map((component) => {
                    const partNo = component.part_no
                    const isAdded = isComponentAdded(partNo)
                    const isSelected = selectedComponents.includes(partNo)

                    return (
                      <div
                        key={partNo}
                        className={`flex items-start space-x-2 p-2 border rounded-md ${
                          isAdded ? "bg-gray-100 border-gray-300" : isSelected ? "bg-blue-50 border-blue-300" : ""
                        }`}
                        onClick={() => !isAdded && toggleComponentSelection(partNo)}
                        style={{ cursor: isAdded ? "default" : "pointer" }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleComponentSelection(partNo)}
                          disabled={isAdded}
                          className="mt-1 mr-2"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{partNo}</div>
                          <div className="text-sm">{component.name || component.product_name}</div>
                          <div className="text-xs text-muted-foreground">
                            單價: {component.unit_price || component.last_price || 0} {currency}
                          </div>
                        </div>
                        {isAdded && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            已添加
                          </Badge>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="col-span-full text-center text-gray-500 py-4">
                    {searchTerm ? "沒有符合搜尋條件的組件" : "沒有可用的組件"}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComponentSelector(false)}>
              取消
            </Button>
            <Button onClick={addSelectedComponents} disabled={selectedComponents.length === 0}>
              添加選中組件 ({selectedComponents.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 成本計算器對話框 */}
      <Dialog open={showCostCalculator} onOpenChange={setShowCostCalculator}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>組件成本計算器</DialogTitle>
            <DialogDescription>查看組件成本明細</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>組件</TableHead>
                  <TableHead className="text-center">數量</TableHead>
                  <TableHead className="text-right">單價</TableHead>
                  <TableHead className="text-right">總價</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {components.map((component) => (
                  <TableRow key={component.id}>
                    <TableCell>{component.name}</TableCell>
                    <TableCell className="text-center">{component.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrencyAmount(component.price || 0, currency)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrencyAmount((component.price || 0) * component.quantity, currency)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold">
                    總成本:
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrencyAmount(calculateTotalCost(), currency)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium mb-2">成本分析</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>組件總數:</span>
                  <span>{components.length} 項</span>
                </div>
                <div className="flex justify-between">
                  <span>平均單件成本:</span>
                  <span>
                    {components.length > 0
                      ? formatCurrencyAmount(calculateTotalCost() / components.length, currency)
                      : formatCurrencyAmount(0, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>最高單價組件:</span>
                  <span>
                    {components.length > 0
                      ? `${components.reduce((max, c) => ((c.price || 0) > (max.price || 0) ? c : max), components[0]).name} (${formatCurrencyAmount(
                          components.reduce((max, c) => ((c.price || 0) > (max.price || 0) ? c : max), components[0])
                            .price || 0,
                          currency,
                        )})`
                      : "無"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowCostCalculator(false)}>關閉</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 組件詳情對話框 */}
      <Dialog open={showComponentDetails} onOpenChange={setShowComponentDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>組件詳情</DialogTitle>
            <DialogDescription>
              {selectedComponent?.partNo} - {selectedComponent?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedComponent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>組件編號</Label>
                  <div className="font-medium">{selectedComponent.partNo}</div>
                </div>
                <div>
                  <Label>組件名稱</Label>
                  <div className="font-medium">{selectedComponent.name}</div>
                </div>
                <div>
                  <Label>數量</Label>
                  <div className="font-medium">
                    {selectedComponent.quantity} {selectedComponent.unit}
                  </div>
                </div>
                <div>
                  <Label>單價</Label>
                  <div className="font-medium">{formatCurrencyAmount(selectedComponent.price || 0, currency)}</div>
                </div>
              </div>

              {selectedComponent.specifications && (
                <div>
                  <Label>規格</Label>
                  <div className="bg-gray-50 p-2 rounded-md mt-1">{selectedComponent.specifications}</div>
                </div>
              )}

              {selectedComponent.material && (
                <div>
                  <Label>材料</Label>
                  <div className="bg-gray-50 p-2 rounded-md mt-1">{selectedComponent.material}</div>
                </div>
              )}

              {selectedComponent.notes && (
                <div>
                  <Label>備註</Label>
                  <div className="bg-gray-50 p-2 rounded-md mt-1">{selectedComponent.notes}</div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowComponentDetails(false)}>關閉</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
