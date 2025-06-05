"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts"

interface FactoryQualityMetricsProps {
  factoryId: string
}

// 模擬品質指標數據
const mockQualityData = [
  { month: "2023-01", defectRate: 0.8, onTimeDelivery: 98, qualityScore: 92 },
  { month: "2023-02", defectRate: 0.7, onTimeDelivery: 97, qualityScore: 93 },
  { month: "2023-03", defectRate: 0.9, onTimeDelivery: 95, qualityScore: 91 },
  { month: "2023-04", defectRate: 0.6, onTimeDelivery: 99, qualityScore: 94 },
  { month: "2023-05", defectRate: 0.5, onTimeDelivery: 100, qualityScore: 96 },
  { month: "2023-06", defectRate: 0.4, onTimeDelivery: 100, qualityScore: 97 },
  { month: "2023-07", defectRate: 0.3, onTimeDelivery: 99, qualityScore: 98 },
  { month: "2023-08", defectRate: 0.4, onTimeDelivery: 98, qualityScore: 97 },
  { month: "2023-09", defectRate: 0.5, onTimeDelivery: 97, qualityScore: 96 },
  { month: "2023-10", defectRate: 0.4, onTimeDelivery: 99, qualityScore: 97 },
  { month: "2023-11", defectRate: 0.3, onTimeDelivery: 100, qualityScore: 98 },
  { month: "2023-12", defectRate: 0.2, onTimeDelivery: 100, qualityScore: 99 },
]

// 模擬不合格原因數據
const mockDefectReasons = [
  { name: "尺寸不符", value: 35 },
  { name: "表面瑕疵", value: 25 },
  { name: "材質問題", value: 15 },
  { name: "組裝錯誤", value: 10 },
  { name: "包裝損壞", value: 8 },
  { name: "其他", value: 7 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export function FactoryQualityMetrics({ factoryId }: FactoryQualityMetricsProps) {
  // 格式化月份顯示
  const formatMonth = (month: string) => {
    const date = new Date(month)
    return `${date.getFullYear()}/${date.getMonth() + 1}`
  }

  return (
    <>
      <Alert variant="warning" className="mb-4">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>開發中功能</AlertTitle>
        <AlertDescription>目前顯示的是模擬數據。此功能正在開發中，未來將與實際品質管理系統整合。</AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>不良率趨勢</CardTitle>
            <CardDescription>過去12個月的產品不良率變化</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockQualityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickFormatter={formatMonth} />
                  <YAxis domain={[0, 2]} />
                  <Tooltip formatter={(value) => `${value}%`} labelFormatter={formatMonth} />
                  <Legend />
                  <Line type="monotone" dataKey="defectRate" name="不良率 (%)" stroke="#ff0000" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>準時交付率</CardTitle>
            <CardDescription>過去12個月的準時交付表現</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockQualityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickFormatter={formatMonth} />
                  <YAxis domain={[90, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} labelFormatter={formatMonth} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="onTimeDelivery"
                    name="準時交付率 (%)"
                    stroke="#00C49F"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>品質評分</CardTitle>
            <CardDescription>過去12個月的綜合品質評分</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockQualityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickFormatter={formatMonth} />
                  <YAxis domain={[80, 100]} />
                  <Tooltip formatter={(value) => `${value}分`} labelFormatter={formatMonth} />
                  <Legend />
                  <Line type="monotone" dataKey="qualityScore" name="品質評分" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>不合格原因分析</CardTitle>
            <CardDescription>不良品主要原因分佈</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockDefectReasons} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="value" name="佔比 (%)">
                    {mockDefectReasons.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
