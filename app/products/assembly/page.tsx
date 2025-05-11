"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { ComponentManagement } from "@/components/products/component-management"
import { AssemblyCostCalculator } from "@/components/products/assembly-cost-calculator"
import { useState } from "react"
import type { ProductComponent } from "@/types/assembly-product"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AssemblyProductManagementPage() {
  const [components, setComponents] = useState<ProductComponent[]>([])
  const [productName, setProductName] = useState<string>("")
  const [productPN, setProductPN] = useState<string>("")

  const handleComponentsChange = (updatedComponents: ProductComponent[]) => {
    setComponents(updatedComponents)
  }

  const handleSave = () => {
    // 在實際應用中，這裡會將數據保存到數據庫
    console.log("保存組合產品:", {
      name: productName,
      pn: productPN,
      components,
    })

    // 顯示成功消息
    alert("組合產品已保存！")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/products">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">組合產品管理</h1>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          保存
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="product-name">產品名稱</Label>
          <Input
            id="product-name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="輸入組合產品名稱"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-pn">產品編號</Label>
          <Input
            id="product-pn"
            value={productPN}
            onChange={(e) => setProductPN(e.target.value)}
            placeholder="輸入組合產品編號"
          />
        </div>
      </div>

      <Tabs defaultValue="components">
        <TabsList className="mb-4">
          <TabsTrigger value="components">組件管理</TabsTrigger>
          <TabsTrigger value="cost">成本計算</TabsTrigger>
        </TabsList>
        <TabsContent value="components">
          <ComponentManagement initialComponents={components} onComponentsChange={handleComponentsChange} />
        </TabsContent>
        <TabsContent value="cost">
          <AssemblyCostCalculator components={components} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
