"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useState, useEffect } from "react"
import type { ProductComponent, AssemblyCostBreakdown } from "@/types/assembly-product"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface AssemblyCostCalculatorProps {
  components: ProductComponent[]
}

export function AssemblyCostCalculator({ components }: AssemblyCostCalculatorProps) {
  const [assemblyTime, setAssemblyTime] = useState<number>(30) // 分鐘
  const [laborCostPerHour, setLaborCostPerHour] = useState<number>(10) // USD/小時
  const [packagingCost, setPackagingCost] = useState<number>(2) // USD
  const [additionalCosts, setAdditionalCosts] = useState<number>(5) // USD
  const [profitMargin, setProfitMargin] = useState<number>(30) // 百分比
  const [costBreakdown, setCostBreakdown] = useState<AssemblyCostBreakdown>({
    componentsCost: 0,
    laborCost: 0,
    packagingCost: 0,
    otherCosts: 0,
    totalCost: 0,
    suggestedPrice: 0,
  })

  // 計算組件總成本
  const calculateComponentsCost = () => {
    return components.reduce((sum, component) => sum + component.quantity * component.unitPrice, 0)
  }

  // 計算人工成本
  const calculateLaborCost = () => {
    return (assemblyTime / 60) * laborCostPerHour
  }

  // 計算總成本和建議售價
  useEffect(() => {
    const componentsCost = calculateComponentsCost()
    const laborCost = calculateLaborCost()

    const totalCost = componentsCost + laborCost + packagingCost + additionalCosts
    const suggestedPrice = totalCost * (1 + profitMargin / 100)

    setCostBreakdown({
      componentsCost,
      laborCost,
      packagingCost,
      otherCosts: additionalCosts,
      totalCost,
      suggestedPrice,
    })
  }, [components, assemblyTime, laborCostPerHour, packagingCost, additionalCosts, profitMargin])

  // 為餅圖準備數據
  const chartData = [
    { name: "組件成本", value: costBreakdown.componentsCost },
    { name: "人工成本", value: costBreakdown.laborCost },
    { name: "包裝成本", value: costBreakdown.packagingCost },
    { name: "其他成本", value: costBreakdown.otherCosts },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>組合產品成本計算</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="assembly-time">組裝時間 (分鐘)</Label>
                <span>{assemblyTime} 分鐘</span>
              </div>
              <Slider
                id="assembly-time"
                min={1}
                max={120}
                step={1}
                value={[assemblyTime]}
                onValueChange={(value) => setAssemblyTime(value[0])}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="labor-cost">人工成本 (USD/小時)</Label>
              <Input
                id="labor-cost"
                type="number"
                min="0"
                step="0.1"
                value={laborCostPerHour}
                onChange={(e) => setLaborCostPerHour(Number.parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="packaging-cost">包裝成本 (USD)</Label>
              <Input
                id="packaging-cost"
                type="number"
                min="0"
                step="0.1"
                value={packagingCost}
                onChange={(e) => setPackagingCost(Number.parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional-costs">其他成本 (USD)</Label>
              <Input
                id="additional-costs"
                type="number"
                min="0"
                step="0.1"
                value={additionalCosts}
                onChange={(e) => setAdditionalCosts(Number.parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="profit-margin">利潤率 (%)</Label>
                <span>{profitMargin}%</span>
              </div>
              <Slider
                id="profit-margin"
                min={0}
                max={100}
                step={1}
                value={[profitMargin]}
                onValueChange={(value) => setProfitMargin(value[0])}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span className="font-medium">組件總成本:</span>
                <span>${costBreakdown.componentsCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">人工成本:</span>
                <span>${costBreakdown.laborCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">包裝成本:</span>
                <span>${costBreakdown.packagingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">其他成本:</span>
                <span>${costBreakdown.otherCosts.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">總成本:</span>
                <span className="font-medium">${costBreakdown.totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold">建議售價:</span>
                <span className="font-bold text-green-600">${costBreakdown.suggestedPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>利潤:</span>
                <span>
                  ${(costBreakdown.suggestedPrice - costBreakdown.totalCost).toFixed(2)} ({profitMargin}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
