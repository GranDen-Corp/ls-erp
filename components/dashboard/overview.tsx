"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { useEffect, useState } from "react"

interface ChartData {
  name: string
  訂單數量: number
  出貨數量: number
  訂單金額: number
}

export function Overview() {
  const [data, setData] = useState<ChartData[]>([])

  useEffect(() => {
    // 這裡應該從API獲取真實數據
    const fetchData = async () => {
      const mockData = [
        {
          name: "7月",
          訂單數量: 18,
          出貨數量: 15,
          訂單金額: 450000,
        },
        {
          name: "8月",
          訂單數量: 22,
          出貨數量: 19,
          訂單金額: 520000,
        },
        {
          name: "9月",
          訂單數量: 25,
          出貨數量: 23,
          訂單金額: 680000,
        },
        {
          name: "10月",
          訂單數量: 19,
          出貨數量: 21,
          訂單金額: 590000,
        },
        {
          name: "11月",
          訂單數量: 28,
          出貨數量: 25,
          訂單金額: 750000,
        },
        {
          name: "12月",
          訂單數量: 24,
          出貨數量: 22,
          訂單金額: 640000,
        },
      ]
      setData(mockData)
    }

    fetchData()
  }, [])

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip
          formatter={(value, name) => {
            if (name === "訂單金額") {
              return [`$${Number(value).toLocaleString()}`, name]
            }
            return [value, name]
          }}
        />
        <Legend />
        <Bar dataKey="訂單數量" fill="#3b82f6" radius={[2, 2, 0, 0]} />
        <Bar dataKey="出貨數量" fill="#10b981" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
