"use client"

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
import { ProductImagePreview } from "@/components/products/product-image-preview"

// 模擬採購單數據
const purchasesData = [
  {
    id: "PO-2023-0012",
    factory: "深圳電子廠",
    orderRef: "ORD-2023-0012",
    amount: "$22,680",
    status: "待確認",
    date: "2023-04-15",
    products: "LCD面板 x 500",
    productImages: [
      {
        id: "1",
        url: "/placeholder.svg?height=100&width=100",
        alt: "LCD面板",
        isThumbnail: true,
      },
    ],
  },
  {
    id: "PO-2023-0011",
    factory: "上海科技廠",
    orderRef: "ORD-2023-0011",
    amount: "$11,160",
    status: "進行中",
    date: "2023-04-14",
    products: "電容器 x 2000",
    productImages: [
      {
        id: "1",
        url: "/placeholder.svg?height=100&width=100",
        alt: "電容器",
        isThumbnail: true,
      },
    ],
  },
  {
    id: "PO-2023-0010",
    factory: "東莞工業廠",
    orderRef: "ORD-2023-0010",
    amount: "$7,875",
    status: "進行中",
    date: "2023-04-12",
    products: "電阻 x 5000",
    productImages: [
      {
        id: "1",
        url: "/placeholder.svg?height=100&width=100",
        alt: "電阻",
        isThumbnail: true,
      },
    ],
  },
  {
    id: "PO-2023-0009",
    factory: "廣州製造廠",
    orderRef: "ORD-2023-0009",
    amount: "$16,470",
    status: "已完成",
    date: "2023-04-10",
    products: "IC晶片 x 300",
    productImages: [
      {
        id: "1",
        url: "/placeholder.svg?height=100&width=100",
        alt: "IC晶片",
        isThumbnail: true,
      },
    ],
  },
  {
    id: "PO-2023-0008",
    factory: "蘇州電子廠",
    orderRef: "ORD-2023-0008",
    amount: "$8,280",
    status: "已完成",
    date: "2023-04-08",
    products: "PCB板 x 150",
    productImages: [
      {
        id: "1",
        url: "/placeholder.svg?height=100&width=100",
        alt: "PCB板",
        isThumbnail: true,
      },
    ],
  },
]

// 狀態顏色映射
const statusColorMap: Record<string, string> = {
  待確認: "bg-yellow-500",
  進行中: "bg-blue-500",
  已完成: "bg-green-500",
}

interface PurchasesTableProps {
  status?: string
}

export function PurchasesTable({ status }: PurchasesTableProps) {
  // 根據狀態過濾採購單
  const filteredPurchases = status ? purchasesData.filter((purchase) => purchase.status === status) : purchasesData

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>採購單編號</TableHead>
            <TableHead>工廠</TableHead>
            <TableHead>關聯訂單</TableHead>
            <TableHead>產品</TableHead>
            <TableHead>金額</TableHead>
            <TableHead>日期</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPurchases.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell>
                <ProductImagePreview images={purchase.productImages} thumbnailSize="small" />
              </TableCell>
              <TableCell className="font-medium">{purchase.id}</TableCell>
              <TableCell>{purchase.factory}</TableCell>
              <TableCell>{purchase.orderRef}</TableCell>
              <TableCell>{purchase.products}</TableCell>
              <TableCell>{purchase.amount}</TableCell>
              <TableCell>{purchase.date}</TableCell>
              <TableCell>
                <Badge className={`${statusColorMap[purchase.status]} text-white`}>{purchase.status}</Badge>
              </TableCell>
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
                      <Link href={`/purchases/${purchase.id}`} className="flex items-center">
                        <Eye className="mr-2 h-4 w-4" />
                        查看詳情
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={`/purchases/${purchase.id}/edit`} className="flex items-center">
                        <Pencil className="mr-2 h-4 w-4" />
                        編輯採購單
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href={`/purchases/${purchase.id}/document`} className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        查看採購單文件
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={`/orders/${purchase.orderRef}`} className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        查看關聯訂單
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
