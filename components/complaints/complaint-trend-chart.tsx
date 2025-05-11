"use client"

import { useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function ComplaintTrendChart() {
  const [timeRange, setTimeRange] = useState("6months")

  // 模擬趨勢數據
  const trendData = {
    "3months": [
      { name: "3月", 待處理: 3, 處理中: 5, 已解決: 7, 已結案: 4 },
      { name: "4月", 待處理: 4, 處理中: 6, 已解決: 5, 已結案: 3 },
      { name: "5月", 待處理: 5, 處理中: 8, 已解決: 6, 已結案: 5 },
    ],
    "6months": [
      { name: "12月", 待處理: 2, 處理中: 4, 已解決: 3, 已結案: 2 },
      { name: "1月", 待處理: 3, 處理中: 5, 已解決: 4, 已結案: 3 },
      { name: "2月", 待處理: 2, 處理中: 4, 已解決: 5, 已結案: 4 },
      { name: "3月", 待處理: 3, 處理中: 5, 已解決: 7, 已結案: 4 },
      { name: "4月", 待處理: 4, 處理中: 6, 已解決: 5, 已結案: 3 },
      { name: "5月", 待處理: 5, 處理中: 8, 已解決: 6, 已結案: 5 },
    ],
    "12months": [
      { name: "6月", 待處理: 1, 處理中: 3, 已解決: 2, 已結案: 1 },
      { name: "7月", 待處理: 2, 處理中: 4, 已解決: 3, 已結案: 2 },
      { name: "8月", 待處理: 3, 處理中: 5, 已解決: 4, 已結案: 3 },
      { name: "9月", 待處理: 2, 處理中: 3, 已解決: 5, 已結案: 4 },
      { name: "10月", 待處理: 3, 處理中: 4, 已解決: 6, 已結案: 5 },
      { name: "11月", 待處理: 2, 處理中: 3, 已解決: 4, 已結案: 3 },
      { name: "12月", 待處理: 2, 處理中: 4, 已解決: 3, 已結案: 2 },
      { name: "1月", 待處理: 3, 處理中: 5, 已解決: 4, 已結案: 3 },
      { name: "2月", 待處理: 2, 處理中: 4, 已解決: 5, 已結案: 4 },
      { name: "3月", 待處理: 3, 處理中: 5, 已解決: 7, 已結案: 4 },
      { name: "4月", 待處理: 4, 處理中: 6, 已解決: 5, 已結案: 3 },
      { name: "5月", 待處理: 5, 處理中: 8, 已解決: 6, 已結案: 5 },
    ],
  }

  const data = trendData[timeRange as keyof typeof trendData] || trendData["6months"]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="space-y-1 w-40">
          <Label htmlFor="timeRange">時間範圍</Label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger id="timeRange">
              <SelectValue placeholder="選擇時間範圍" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">最近3個月</SelectItem>
              <SelectItem value="6months">最近6個月</SelectItem>
              <SelectItem value="12months">最近12個月</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="待處理" fill="#f59e0b" />
            <Bar dataKey="處理中" fill="#3b82f6" />
            <Bar dataKey="已解決" fill="#10b981" />
            <Bar dataKey="已結案" fill="#6b7280" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
