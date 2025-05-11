"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

interface ProductComplaintHistoryProps {
  productId: string
}

export function ProductComplaintHistory({ productId }: ProductComplaintHistoryProps) {
  // 模擬客訴歷史數據
  // 實際應用中應該從API獲取
  const complaintHistory = [
    {
      id: "COMP-2023-0001",
      title: "面板亮度不足",
      customer: "台灣電子",
      status: "pending",
      priority: "high",
      createdDate: "2023-05-10",
      showOnPO: true,
    },
    {
      id: "COMP-2022-0015",
      title: "面板有亮點",
      customer: "台灣電子",
      status: "resolved",
      priority: "medium",
      createdDate: "2022-11-15",
      showOnPO: false,
    },
    {
      id: "COMP-2022-0008",
      title: "包裝不符合要求",
      customer: "台灣電子",
      status: "closed",
      priority: "low",
      createdDate: "2022-08-20",
      showOnPO: false,
    },
  ]

  // 狀態顏色映射
  const statusColorMap: Record<string, string> = {
    pending: "bg-yellow-500",
    processing: "bg-blue-500",
    resolved: "bg-green-500",
    closed: "bg-gray-500",
  }

  // 狀態名稱映射
  const statusNameMap: Record<string, string> = {
    pending: "待處理",
    processing: "處理中",
    resolved: "已解決",
    closed: "已結案",
  }

  // 優先級顏色映射
  const priorityColorMap: Record<string, string> = {
    high: "bg-red-500",
    medium: "bg-orange-500",
    low: "bg-blue-500",
  }

  // 優先級名稱映射
  const priorityNameMap: Record<string, string> = {
    high: "高",
    medium: "中",
    low: "低",
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href={`/complaints/new?productId=${productId}`}>
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            新增客訴
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>客訴編號</TableHead>
              <TableHead>標題</TableHead>
              <TableHead>客戶</TableHead>
              <TableHead>優先級</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>建立日期</TableHead>
              <TableHead>顯示於採購單</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaintHistory.map((complaint) => (
              <TableRow key={complaint.id}>
                <TableCell className="font-medium">
                  <Link href={`/complaints/${complaint.id}`} className="text-blue-600 hover:underline">
                    {complaint.id}
                  </Link>
                </TableCell>
                <TableCell>{complaint.title}</TableCell>
                <TableCell>{complaint.customer}</TableCell>
                <TableCell>
                  <Badge className={`${priorityColorMap[complaint.priority]} text-white`}>
                    {priorityNameMap[complaint.priority]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`${statusColorMap[complaint.status]} text-white`}>
                    {statusNameMap[complaint.status]}
                  </Badge>
                </TableCell>
                <TableCell>{complaint.createdDate}</TableCell>
                <TableCell>{complaint.showOnPO ? "是" : "否"}</TableCell>
              </TableRow>
            ))}
            {complaintHistory.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  沒有客訴記錄
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
