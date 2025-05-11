"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function ComplaintByCustomerTable() {
  const [searchTerm, setSearchTerm] = useState("")

  // 模擬客戶客訴數據
  const customerComplaints = [
    {
      customerId: "1",
      customerName: "台灣電子",
      customerCode: "TE",
      totalComplaints: 8,
      openComplaints: 3,
      resolvedComplaints: 5,
      mostCommonProduct: "LCD-15-HD",
      mostCommonIssue: "亮度不足",
      avgResolutionTime: "4.5天",
    },
    {
      customerId: "2",
      customerName: "新竹科技",
      customerCode: "HT",
      totalComplaints: 3,
      openComplaints: 1,
      resolvedComplaints: 2,
      mostCommonProduct: "CAP-104-SMD",
      mostCommonIssue: "標示錯誤",
      avgResolutionTime: "3.2天",
    },
    {
      customerId: "3",
      customerName: "台北工業",
      customerCode: "TI",
      totalComplaints: 2,
      openComplaints: 0,
      resolvedComplaints: 2,
      mostCommonProduct: "RES-103-SMD",
      mostCommonIssue: "包裝問題",
      avgResolutionTime: "5.0天",
    },
    {
      customerId: "4",
      customerName: "高雄製造",
      customerCode: "KM",
      totalComplaints: 0,
      openComplaints: 0,
      resolvedComplaints: 0,
      mostCommonProduct: "-",
      mostCommonIssue: "-",
      avgResolutionTime: "-",
    },
    {
      customerId: "5",
      customerName: "台中電子",
      customerCode: "TC",
      totalComplaints: 0,
      openComplaints: 0,
      resolvedComplaints: 0,
      mostCommonProduct: "-",
      mostCommonIssue: "-",
      avgResolutionTime: "-",
    },
  ]

  // 根據搜索詞過濾客戶
  const filteredCustomers = customerComplaints.filter(
    (customer) =>
      searchTerm === "" ||
      customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerCode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Input
          placeholder="搜尋客戶名稱或代碼..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>客戶代碼</TableHead>
              <TableHead>客戶名稱</TableHead>
              <TableHead className="text-right">總客訴數</TableHead>
              <TableHead className="text-right">未結案客訴</TableHead>
              <TableHead className="text-right">已解決客訴</TableHead>
              <TableHead>最常見產品</TableHead>
              <TableHead>最常見問題</TableHead>
              <TableHead className="text-right">平均解決時間</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.customerId}>
                <TableCell className="font-medium">{customer.customerCode}</TableCell>
                <TableCell>
                  <Link href={`/customers/${customer.customerId}`} className="text-blue-600 hover:underline">
                    {customer.customerName}
                  </Link>
                </TableCell>
                <TableCell className="text-right">{customer.totalComplaints}</TableCell>
                <TableCell className="text-right">
                  {customer.openComplaints > 0 ? (
                    <Badge className="bg-yellow-500 text-white">{customer.openComplaints}</Badge>
                  ) : (
                    customer.openComplaints
                  )}
                </TableCell>
                <TableCell className="text-right">{customer.resolvedComplaints}</TableCell>
                <TableCell>{customer.mostCommonProduct}</TableCell>
                <TableCell>{customer.mostCommonIssue}</TableCell>
                <TableCell className="text-right">{customer.avgResolutionTime}</TableCell>
              </TableRow>
            ))}
            {filteredCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  沒有找到符合條件的客戶
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
