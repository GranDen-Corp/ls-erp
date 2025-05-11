"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProductComponent } from "@/types/assembly-product"

interface ProductAssemblyDetailsProps {
  isAssembly: boolean
  components: ProductComponent[]
  assemblyTime: number
  assemblyCostPerHour: number
  additionalCosts: number
}

export function ProductAssemblyDetails({
  isAssembly,
  components,
  assemblyTime,
  assemblyCostPerHour,
  additionalCosts,
}: ProductAssemblyDetailsProps) {
  if (!isAssembly) {
    return null
  }

  // 計算組裝產品總成本
  const calculateTotalCost = () => {
    // 組件成本
    const componentsCost = components.reduce((sum, component) => {
      return sum + component.quantity * component.unitPrice
    }, 0)

    // 組裝人工成本
    const laborCost = (assemblyTime / 60) * assemblyCostPerHour

    // 總成本 = 組件成本 + 人工成本 + 額外成本
    return componentsCost + laborCost + additionalCosts
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>組裝產品資訊</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">組裝時間</p>
              <p>{assemblyTime} 分鐘</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">組裝人工成本</p>
              <p>{assemblyCostPerHour.toFixed(2)} USD/小時</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">額外成本</p>
              <p>{additionalCosts.toFixed(2)} USD</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-md font-medium">組件清單</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>產品編號</TableHead>
                    <TableHead>產品名稱</TableHead>
                    <TableHead>工廠</TableHead>
                    <TableHead className="text-right">數量</TableHead>
                    <TableHead className="text-right">單價 (USD)</TableHead>
                    <TableHead className="text-right">金額 (USD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {components.map((component) => (
                    <TableRow key={component.id}>
                      <TableCell>{component.productPN}</TableCell>
                      <TableCell>{component.productName}</TableCell>
                      <TableCell>{component.factoryName}</TableCell>
                      <TableCell className="text-right">{component.quantity}</TableCell>
                      <TableCell className="text-right">{component.unitPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        {(component.quantity * component.unitPrice).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {components.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        尚未添加任何組件
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-72 space-y-1">
              <div className="flex justify-between">
                <span>組件成本:</span>
                <span>
                  {components.reduce((sum, component) => sum + component.quantity * component.unitPrice, 0).toFixed(2)}{" "}
                  USD
                </span>
              </div>
              <div className="flex justify-between">
                <span>組裝人工成本:</span>
                <span>{((assemblyTime / 60) * assemblyCostPerHour).toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span>額外成本:</span>
                <span>{additionalCosts.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>總成本:</span>
                <span>{calculateTotalCost().toFixed(2)} USD</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
