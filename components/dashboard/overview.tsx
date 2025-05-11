"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "1月",
    訂單: 12,
    出貨: 10,
  },
  {
    name: "2月",
    訂單: 18,
    出貨: 15,
  },
  {
    name: "3月",
    訂單: 15,
    出貨: 14,
  },
  {
    name: "4月",
    訂單: 22,
    出貨: 18,
  },
  {
    name: "5月",
    訂單: 28,
    出貨: 25,
  },
  {
    name: "6月",
    訂單: 24,
    出貨: 22,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Bar dataKey="訂單" fill="#adfa1d" radius={[4, 4, 0, 0]} />
        <Bar dataKey="出貨" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
