"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrencyAmount } from "@/lib/currency-utils"
import type { Component, AssemblyProduct } from "@/types/assembly-product"
import { FileText, Package, Settings, Layers, ChevronDown, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PurchaseAssemblyManagementProps {
  assemblyProducts: AssemblyProduct[]
  currency?: string
  onComponentsChange?: (productId: string, components: Component[]) => void
}

export const PurchaseAssemblyManagement: React.FC<PurchaseAssemblyManagementProps> = ({
  assemblyProducts,
  currency = "USD",
  onComponentsChange,
}) => {
  const [expandedProducts, setExpandedProducts] = useState<string[]>([])
  const [showComponentDetails, setShowComponentDetails] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  // 切換產品展開狀態
  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  // 查看組件詳情
  const viewComponentDetails = (component: Component, productId: string) => {
    setSelectedComponent(component)
    setSelectedProductId(productId)
    setShowComponentDetails(true)
  }

  // 計算產品的總組件成本
  const calculateProductComponentsCost = (components: Component[]) => {
    return components.reduce((sum, component) => sum + (component.price || 0) * component.quantity, 0)
  }

  // 計算所有產品的總成本
  const calculateTotalCost = () => {
    return assemblyProducts.reduce(
      (sum, product) => sum + calculateProductComponentsCost(product.components || []) * product.quantity,
      0,
    )
  }

  // 計算特定組件在所有產品中的總數量
  const calculateTotalComponentQuantity = (componentPartNo: string) => {
    let total = 0
    assemblyProducts.forEach((product) => {
      const component = product.components?.find((c) => c.partNo === componentPartNo)
      if (component) {
        total += component.quantity * product.quantity
      }
    })
    return total
  }

  // 獲取所有唯一的組件
  const getAllUniqueComponents = () => {
    const componentsMap = new Map<string, Component & { totalQuantity: number }>()

    assemblyProducts.forEach((product) => {
      product.components?.forEach((component) => {
        const existingComponent = componentsMap.get(component.partNo)
        if (existingComponent) {
          existingComponent.totalQuantity += component.quantity * product.quantity
        } else {
          componentsMap.set(component.partNo, {
            ...component,
            totalQuantity: component.quantity * product.quantity,
          })
        }
      })
    })

    return Array.from(componentsMap.values())
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">組裝產品採購管理</h3>
        <p className="text-sm text-muted-foreground">管理組裝產品的組件採購</p>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-2" />
            按產品查看
          </TabsTrigger>
          <TabsTrigger value="components">
            <Settings className="h-4 w-4 mr-2" />
            按組件查看
          </TabsTrigger>
          <TabsTrigger value="summary">
            <FileText className="h-4 w-4 mr-2" />
            採購摘要
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {assemblyProducts.length > 0 ? (
            assemblyProducts.map((product) => (
              <Card key={product.id}>
                <CardHeader className="py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleProductExpansion(product.id)}
                        className="h-6 w-6"
                      >
                        {expandedProducts.includes(product.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{product.name}</CardTitle>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700">
                            <Layers className="h-3 w-3 mr-1" />
                            組件
                          </Badge>
                        </div>
                        <CardDescription>產品編號: {product.partNo}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">數量: {product.quantity}</div>
                      <div className="text-sm text-muted-foreground">組件: {product.components?.length || 0} 項</div>
                    </div>
                  </div>
                </CardHeader>

                <Collapsible open={expandedProducts.includes(product.id)}>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>組件編號</TableHead>
                            <TableHead>組件名稱</TableHead>
                            <TableHead className="text-center">每組數量</TableHead>
                            <TableHead className="text-center">總數量</TableHead>
                            <TableHead className="text-right">單價 ({currency})</TableHead>
                            <TableHead className="text-right">總價 ({currency})</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {product.components && product.components.length > 0 ? (
                            product.components.map((component, index) => (
                              <TableRow key={index}>
                                <TableCell>{component.partNo}</TableCell>
                                <TableCell>
                                  <div
                                    className="cursor-pointer hover:text-blue-600"
                                    onClick={() => viewComponentDetails(component, product.id)}
                                  >
                                    {component.name}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">{component.quantity}</TableCell>
                                <TableCell className="text-center">{component.quantity * product.quantity}</TableCell>
                                <TableCell className="text-right">
                                  {formatCurrencyAmount(component.price || 0, currency)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrencyAmount(
                                    (component.price || 0) * component.quantity * product.quantity,
                                    currency,
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-4">
                                沒有組件資料
                              </TableCell>
                            </TableRow>
                          )}
                          <TableRow>
                            <TableCell colSpan={4} className="text-right font-bold">
                              產品組件總成本:
                            </TableCell>
                            <TableCell colSpan={2} className="text-right font-bold">
                              {formatCurrencyAmount(
                                calculateProductComponentsCost(product.components || []) * product.quantity,
                                currency,
                              )}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))
          ) : (
            <Alert>
              <AlertTitle>沒有組裝產品</AlertTitle>
              <AlertDescription>目前沒有需要採購的組裝產品</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="components">
          <Card>
            <CardHeader>
              <CardTitle>組件採購清單</CardTitle>
              <CardDescription>所有組裝產品需要的組件清單</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>組件編號</TableHead>
                      <TableHead>組件名稱</TableHead>
                      <TableHead className="text-center">總數量</TableHead>
                      <TableHead>單位</TableHead>
                      <TableHead className="text-right">單價 ({currency})</TableHead>
                      <TableHead className="text-right">總價 ({currency})</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getAllUniqueComponents().map((component, index) => (
                      <TableRow key={index}>
                        <TableCell>{component.partNo}</TableCell>
                        <TableCell>
                          <div
                            className="cursor-pointer hover:text-blue-600"
                            onClick={() => viewComponentDetails(component, "")}
                          >
                            {component.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{component.totalQuantity}</TableCell>
                        <TableCell>{component.unit}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrencyAmount(component.price || 0, currency)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrencyAmount((component.price || 0) * component.totalQuantity, currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={5} className="text-right font-bold">
                        組件總成本:
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrencyAmount(calculateTotalCost(), currency)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>採購摘要</CardTitle>
              <CardDescription>組裝產品採購成本分析</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{assemblyProducts.length}</div>
                    <div className="text-sm text-muted-foreground">組裝產品數量</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{getAllUniqueComponents().length}</div>
                    <div className="text-sm text-muted-foreground">不同組件數量</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{formatCurrencyAmount(calculateTotalCost(), currency)}</div>
                    <div className="text-sm text-muted-foreground">總採購成本</div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="text-lg font-medium mb-4">產品成本分析</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>產品編號</TableHead>
                      <TableHead>產品名稱</TableHead>
                      <TableHead className="text-center">數量</TableHead>
                      <TableHead className="text-center">組件數</TableHead>
                      <TableHead className="text-right">單位成本</TableHead>
                      <TableHead className="text-right">總成本</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assemblyProducts.map((product) => {
                      const componentCost = calculateProductComponentsCost(product.components || [])
                      return (
                        <TableRow key={product.id}>
                          <TableCell>{product.partNo}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell className="text-center">{product.quantity}</TableCell>
                          <TableCell className="text-center">{product.components?.length || 0}</TableCell>
                          <TableCell className="text-right">{formatCurrencyAmount(componentCost, currency)}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrencyAmount(componentCost * product.quantity, currency)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              <div>
                <h4 className="text-lg font-medium mb-4">組件成本分佈</h4>
                <div className="h-[300px] bg-gray-50 rounded-md p-4 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">此處可以添加組件成本分佈圖表</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
                  <div className="text-sm text-muted-foreground">組件編號</div>
                  <div className="font-medium">{selectedComponent.partNo}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">組件名稱</div>
                  <div className="font-medium">{selectedComponent.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">單位</div>
                  <div className="font-medium">{selectedComponent.unit}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">單價</div>
                  <div className="font-medium">{formatCurrencyAmount(selectedComponent.price || 0, currency)}</div>
                </div>
              </div>

              {selectedProductId && (
                <div>
                  <div className="text-sm text-muted-foreground">在產品中的數量</div>
                  <div className="font-medium">
                    {selectedComponent.quantity} {selectedComponent.unit}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm text-muted-foreground">所有產品中的總數量</div>
                <div className="font-medium">
                  {calculateTotalComponentQuantity(selectedComponent.partNo)} {selectedComponent.unit}
                </div>
              </div>

              {selectedComponent.specifications && (
                <div>
                  <div className="text-sm text-muted-foreground">規格</div>
                  <div className="bg-gray-50 p-2 rounded-md mt-1">{selectedComponent.specifications}</div>
                </div>
              )}

              {selectedComponent.material && (
                <div>
                  <div className="text-sm text-muted-foreground">材料</div>
                  <div className="bg-gray-50 p-2 rounded-md mt-1">{selectedComponent.material}</div>
                </div>
              )}

              {selectedComponent.notes && (
                <div>
                  <div className="text-sm text-muted-foreground">備註</div>
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
