"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, FileText, MoreHorizontal, Pencil } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

// 模擬客訴數據
const complaintsData = [
  {
    id: "COMP-2023-0001",
    customer: {
      id: "1",
      name: "台灣電子",
      code: "TE",
    },
    product: {
      id: "1",
      pn: "LCD-15-HD",
      name: "15吋 HD LCD面板",
    },
    title: "面板亮度不足",
    description: "客戶反映部分面板亮度低於規格要求的250nits",
    status: "pending",
    priority: "high",
    createdDate: "2023-05-10",
    updatedDate: "2023-05-10",
    showOnPO: true,
  },
  {
    id: "COMP-2023-0002",
    customer: {
      id: "2",
      name: "新竹科技",
      code: "HT",
    },
    product: {
      id: "3",
      pn: "CAP-104-SMD",
      name: "104 SMD電容",
    },
    title: "電容標示錯誤",
    description: "客戶反映部分電容標示值與實際不符",
    status: "processing",
    priority: "medium",
    createdDate: "2023-05-15",
    updatedDate: "2023-05-16",
    showOnPO: true,
  },
  {
    id: "COMP-2023-0003",
    customer: {
      id: "3",
      name: "台北工業",
      code: "TI",
    },
    product: {
      id: "4",
      pn: "RES-103-SMD",
      name: "103 SMD電阻",
    },
    title: "包裝問題",
    description: "客戶反映電阻包裝不符合防靜電要求",
    status: "resolved",
    priority: "low",
    createdDate: "2023-05-20",
    updatedDate: "2023-05-25",
    showOnPO: false,
  },
  {
    id: "COMP-2023-0004",
    customer: {
      id: "1",
      name: "台灣電子",
      code: "TE",
    },
    product: {
      id: "2",
      pn: "LCD-17-FHD",
      name: "17吋 FHD LCD面板",
    },
    title: "面板有亮點",
    description: "客戶反映部分面板有明顯亮點",
    status: "closed",
    priority: "high",
    createdDate: "2023-04-10",
    updatedDate: "2023-04-20",
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

interface ComplaintsTableProps {
  status?: string
}

export function ComplaintsTable({ status }: ComplaintsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // 根據狀態和搜索詞過濾客訴
  const filteredComplaints = complaintsData
    .filter((complaint) => !status || complaint.status === status)
    .filter(
      (complaint) =>
        searchTerm === "" ||
        complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.product.pn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.product.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Input
          placeholder="搜尋客訴編號、標題、客戶、產品編號或名稱..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>客訴編號</TableHead>
              <TableHead>客戶</TableHead>
              <TableHead>產品編號</TableHead>
              <TableHead>標題</TableHead>
              <TableHead>優先級</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>建立日期</TableHead>
              <TableHead>顯示於採購單</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComplaints.map((complaint) => (
              <TableRow key={complaint.id}>
                <TableCell className="font-medium">{complaint.id}</TableCell>
                <TableCell>
                  {complaint.customer.name} ({complaint.customer.code})
                </TableCell>
                <TableCell>{complaint.product.pn}</TableCell>
                <TableCell>{complaint.title}</TableCell>
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
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">開啟選單</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>操作</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Link href={`/complaints/${complaint.id}`} className="flex items-center">
                          <Eye className="mr-2 h-4 w-4" />
                          查看詳情
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href={`/complaints/${complaint.id}/edit`} className="flex items-center">
                          <Pencil className="mr-2 h-4 w-4" />
                          編輯客訴
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link href={`/products/${complaint.product.id}`} className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          查看產品
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredComplaints.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  沒有找到符合條件的客訴
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
