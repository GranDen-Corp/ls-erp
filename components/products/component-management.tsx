"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import type { ProductComponent } from "@/types/assembly-product"
import { Trash2, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DialogClose } from "@radix-ui/react-dialog"

interface ComponentManagementProps {
  initialComponents?: ProductComponent[]
  onComponentsChange?: (components: ProductComponent[]) => void
}

export function ComponentManagement({ initialComponents = [], onComponentsChange }: ComponentManagementProps) {
  const [components, setComponents] = useState<ProductComponent[]>(initialComponents)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // 模擬從數據庫獲取的工廠列表
  const factories = [
    { id: "1", name: "深圳電子廠", code: "SZE" },
    { id: "2", name: "上海科技廠", code: "SHT" },
    { id: "3", name: "東莞塑膠廠", code: "DGP" },
    { id: "4", name: "廣州金屬廠", code: "GZM" },
    { id: "5", name: "蘇州電子廠", code: "SZE2" },
  ]

  // 模擬從數據庫獲取的產品列表
  const products = [
    { id: "1", name: "15吋 HD LCD面板", pn: "LCD-15-HD", price: 40.5 },
    { id: "2", name: "主板 PCB V1", pn: "PCB-MAIN-V1", price: 15.75 },
    { id: "3", name: "電源適配器", pn: "PWR-ADPT-12V", price: 8.25 },
    { id: "4", name: "HDMI線", pn: "CABLE-HDMI-1M", price: 2.5 },
    { id: "5", name: "散熱風扇", pn: "FAN-80MM", price: 3.75 },
    { id: "6", name: "塑膠外殼", pn: "CASE-PLASTIC", price: 5.25 },
  ]

  const addComponent = (component: Partial<ProductComponent>) => {
    const newComponent: ProductComponent = {
      id: `comp-${Date.now()}`,
      productId: component.productId || "",
      productName: component.productName || "",
      productPN: component.productPN || "",
      quantity: component.quantity || 1,
      unitPrice: component.unitPrice || 0,
      factoryId: component.factoryId || "",
      factoryName: component.factoryName || "",
    }

    const updatedComponents = [...components, newComponent]
    setComponents(updatedComponents)
    onComponentsChange?.(updatedComponents)
    setIsAddDialogOpen(false)
  }

  const removeComponent = (id: string) => {
    const updatedComponents = components.filter((comp) => comp.id !== id)
    setComponents(updatedComponents)
    onComponentsChange?.(updatedComponents)
  }

  const updateComponentQuantity = (id: string, quantity: number) => {
    const updatedComponents = components.map((comp) => (comp.id === id ? { ...comp, quantity } : comp))
    setComponents(updatedComponents)
    onComponentsChange?.(updatedComponents)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>組件管理</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              添加組件
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新組件</DialogTitle>
            </DialogHeader>
            <AddComponentForm factories={factories} products={products} onAdd={addComponent} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {components.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            尚未添加任何組件。點擊「添加組件」按鈕開始構建您的組合產品。
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>組件編號</TableHead>
                  <TableHead>組件名稱</TableHead>
                  <TableHead>工廠</TableHead>
                  <TableHead className="text-right">數量</TableHead>
                  <TableHead className="text-right">單價 (USD)</TableHead>
                  <TableHead className="text-right">小計 (USD)</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {components.map((component) => (
                  <TableRow key={component.id}>
                    <TableCell className="font-medium">{component.productPN}</TableCell>
                    <TableCell>{component.productName}</TableCell>
                    <TableCell>{component.factoryName}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min="1"
                        className="w-16 text-right"
                        value={component.quantity}
                        onChange={(e) => updateComponentQuantity(component.id, Number.parseInt(e.target.value) || 1)}
                      />
                    </TableCell>
                    <TableCell className="text-right">{component.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {(component.quantity * component.unitPrice).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeComponent(component.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4}></TableCell>
                  <TableCell className="font-medium text-right">總計:</TableCell>
                  <TableCell className="font-medium text-right">
                    {components.reduce((sum, comp) => sum + comp.quantity * comp.unitPrice, 0).toFixed(2)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface AddComponentFormProps {
  factories: Array<{ id: string; name: string; code: string }>
  products: Array<{ id: string; name: string; pn: string; price: number }>
  onAdd: (component: Partial<ProductComponent>) => void
}

function AddComponentForm({ factories, products, onAdd }: AddComponentFormProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [selectedFactory, setSelectedFactory] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const product = products.find((p) => p.id === selectedProduct)
    const factory = factories.find((f) => f.id === selectedFactory)

    if (product && factory) {
      onAdd({
        productId: product.id,
        productName: product.name,
        productPN: product.pn,
        quantity: quantity,
        unitPrice: product.price,
        factoryId: factory.id,
        factoryName: factory.name,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="product">產品</Label>
        <Select value={selectedProduct} onValueChange={setSelectedProduct} required>
          <SelectTrigger id="product">
            <SelectValue placeholder="選擇產品" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name} ({product.pn}) - ${product.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="factory">工廠</Label>
        <Select value={selectedFactory} onValueChange={setSelectedFactory} required>
          <SelectTrigger id="factory">
            <SelectValue placeholder="選擇工廠" />
          </SelectTrigger>
          <SelectContent>
            {factories.map((factory) => (
              <SelectItem key={factory.id} value={factory.id}>
                {factory.name} ({factory.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">數量</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            取消
          </Button>
        </DialogClose>
        <Button type="submit">添加</Button>
      </div>
    </form>
  )
}
