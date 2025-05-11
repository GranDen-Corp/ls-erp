"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ProductPriceHistoryChartProps {
  productId: string
}

export function ProductPriceHistoryChart({ productId }: ProductPriceHistoryChartProps) {
  // 模擬價格歷史數據
  // 實際應用中應該從API獲取
  const priceHistory = [
    { date: "2022-01", price: 50.0 },
    { date: "2022-04", price: 49.5 },
    { date: "2022-07", price: 48.0 },
    { date: "2022-10", price: 47.5 },
    { date: "2023-01", price: 46.5 },
    { date: "2023-04", price: 45.0 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>價格趨勢</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              price: {
                label: "價格 (USD)",
                color: "hsl(var(--chart-1))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistory} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tickMargin={10} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="var(--color-price)"
                  name="價格 (USD)"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
