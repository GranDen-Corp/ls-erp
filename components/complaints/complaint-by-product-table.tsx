"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function ComplaintByProductTable() {
  const [searchTerm, setSearchTerm] = useState("")

  // 模擬產品客訴數據
  const productComplaints = [
    {
      productId: "1",
      productPN: "LCD-15-HD",
      productName: "15吋 HD LCD面板",
      totalComplaints: 5,
      openComplaints: 2,
      resolvedComplaints: 3,
      mostCommonIssue: "亮度不足",
      avgResolutionTime: "4.2天",
    },
    {
      productId: "2",
      productPN: "LCD-17-FHD",
      productName: "17吋 FHD LCD面板",
      totalComplaints: 3,
      openComplaints: 1,
      resolvedComplaints: 2,
      mostCommonIssue: "有亮點",
      avgResolutionTime: "3.5天",
    },
    {
      productId: "3",
      productPN: "CAP-104-SMD",
      productName: "104 SMD電容",
      totalComplaints: 2,
      openComplaints: 0,
      resolvedComplaints: 2,
      mostCommonIssue: "標示錯誤",
      avgResolutionTime: "2.8天",
    },
    {
      productId: "4",
      productPN: "RES-103-SMD",
      productName: "103 SMD電阻",
      totalComplaints: 1,
      openComplaints: 0,
      resolvedComplaints: 1,
      mostCommonIssue: "包裝問題",
      avgResolutionTime: "5.0天",
    },
    {
      productId: "5",
      productPN: "IC-CPU-8086",
      productName: "8086 CPU晶片",
      totalComplaints: 0,
      openComplaints: 0,
      resolvedComplaints: 0,
      mostCommonIssue: "-",
      avgResolutionTime: "-",
    },
  ]

  // 根據搜索詞過濾產品
  const filteredProducts = productComplaints.filter(
    (product) =>
      searchTerm === "" ||
      product.productPN.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Input
          placeholder="搜尋產品編號或名稱..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>產品編號</TableHead>
              <TableHead>產品名稱</TableHead>
              <TableHead className="text-right">總客訴數</TableHead>
              <TableHead className="text-right">未結案客訴</TableHead>
              <TableHead className="text-right">已解決客訴</TableHead>
              <TableHead>最常見問題</TableHead>
              <TableHead className="text-right">平均解決時間</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.productId}>
                <TableCell className="font-medium">
                  <Link href={`/products/${product.productId}`} className="text-blue-600 hover:underline">
                    {product.productPN}
                  </Link>
                </TableCell>
                <TableCell>{product.productName}</TableCell>
                <TableCell className="text-right">{product.totalComplaints}</TableCell>
                <TableCell className="text-right">
                  {product.openComplaints > 0 ? (
                    <Badge className="bg-yellow-500 text-white">{product.openComplaints}</Badge>
                  ) : (
                    product.openComplaints
                  )}
                </TableCell>
                <TableCell className="text-right">{product.resolvedComplaints}</TableCell>
                <TableCell>{product.mostCommonIssue}</TableCell>
                <TableCell className="text-right">{product.avgResolutionTime}</TableCell>
              </TableRow>
            ))}
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  沒有找到符合條件的產品
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
