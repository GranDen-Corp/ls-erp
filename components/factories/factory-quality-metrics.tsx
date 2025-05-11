"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// 模擬品質指標數據
const qualityData = [
  { month: "1月", defectRate: 1.2, returnRate: 0.5, onTimeDelivery: 98 },
  { month: "2月", defectRate: 1.5, returnRate: 0.7, onTimeDelivery: 97 },
  { month: "3月", defectRate: 1.1, returnRate: 0.4, onTimeDelivery: 99 },
  { month: "4月", defectRate: 0.9, returnRate: 0.3, onTimeDelivery: 99 },
  { month: "5月", defectRate: 1.0, returnRate: 0.4, onTimeDelivery: 98 },
  { month: "6月", defectRate: 0.8, returnRate: 0.2, onTimeDelivery: 100 },
]

export function FactoryQualityMetrics({ factoryId }: { factoryId: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">不良率與退貨率趨勢</h3>
          <ChartContainer
            config={{
              defectRate: {
                label: "不良率 (%)",
                color: "hsl(var(--chart-1))",
              },
              returnRate: {
                label: "退貨率 (%)",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={qualityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="defectRate" stroke="var(--color-defectRate)" name="不良率 (%)" />
                <Line type="monotone" dataKey="returnRate" stroke="var(--color-returnRate)" name="退貨率 (%)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">準時交付率</h3>
          <ChartContainer
            config={{
              onTimeDelivery: {
                label: "準時交付率 (%)",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qualityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[90, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="onTimeDelivery" fill="var(--color-onTimeDelivery)" name="準時交付率 (%)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
