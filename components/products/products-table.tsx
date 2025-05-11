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
import { Copy, Eye, FileText, Layers, MoreHorizontal, Pencil } from "lucide-react"
import Link from "next/link"
import { ProductImagePreview } from "@/components/products/product-image-preview"

// 模擬產品數據
const productsData = [
  {
    id: "1",
    pn: "LCD-15-HD",
    name: "15吋 HD LCD面板",
    customer: "台灣電子",
    factory: "深圳電子廠",
    category: "面板",
    status: "active",
    lastPrice: "$45.00",
    lastOrderDate: "2023-04-15",
    isAssembly: false,
    images: [
      {
        id: "1",
        url: "/placeholder.svg?height=100&width=100",
        alt: "LCD-15-HD",
        isThumbnail: true,
      },
    ],
  },
  {
    id: "2",
    pn: "LCD-17-FHD",
    name: "17吋 FHD LCD面板",
    customer: "台灣電子",
    factory: "深圳電子廠",
    category: "面板",
    status: "active",
    lastPrice: "$58.50",
    lastOrderDate: "2023-04-10",
    isAssembly: false,
    images: [
      {
        id: "1",
        url: "/placeholder.svg?height=100&width=100",
        alt: "LCD-17-FHD",
        isThumbnail: true,
      },
    ],
  },
  {
    id: "3",
    pn: "CAP-104-SMD",
    name: "104 SMD電容",
    customer: "新竹科技",
    factory: "上海科技廠",
    category: "電子元件",
    status: "active",
    lastPrice: "$0.05",
    lastOrderDate: "2023-04-08",
    isAssembly: false,
    images: [
      {
        id: "1",
        url: "/placeholder.svg?height=100&width=100",
        alt: "CAP-104-SMD",
        isThumbnail: true,
      },
    ],
  },
  {
    id: "4",
    pn: "RES-103-SMD",
    name: "103 SMD電阻",
    customer: "台北工業",
    factory: "東莞工業廠",
    category: "電子元件",
    status: "active",
    lastPrice: "$0.03",
    lastOrderDate: "2023-04-05",
    isAssembly: false,
    images: [
      {
        id: "1",
        url: "/placeholder.svg?height=100&width=100",
        alt: "RES-103-SMD",
        isThumbnail: true,
      },
    ],
  },
  {
    id: "5",
    pn: "IC-CPU-8086",
    name: "8086 CPU晶片",
    customer: "高雄製造",
    factory: "廣州製造廠",
    category: "IC晶片",
    status: "active",
    lastPrice: "$12.50",
    lastOrderDate: "2023-04-01",
    isAssembly: false,
    images: [
      {
        id: "1",
        url: "/placeholder.svg?height=100&width=100",
        alt: "IC-CPU-8086",
        isThumbnail: true,
      },
    ],
  },
  {
    id: "ASSY-001",
    pn: "ASSY-MONITOR-15",
    name: "15吋顯示器組裝品",
    customer: "台灣電子",
    factory: "深圳電子廠",
    category: "組裝產品",
    status: "active",
    lastPrice: "$72.50",
    lastOrderDate: "2023-04-18",
    isAssembly: true,
    images: [
      {
        id: "1",
        url: "/placeholder.svg?height=100&width=100",
        alt: "ASSY-MONITOR-15",
        isThumbnail: true,
      },
    ],
  },
]

// 狀態顏色映射
const statusColorMap: Record<string, string> = {
  active: "bg-green-500",
  sample: "bg-blue-500",
  discontinued: "bg-gray-500",
}

// 狀態名稱映射
const statusNameMap: Record<string, string> = {
  active: "活躍",
  sample: "樣品階段",
  discontinued: "已停產",
}

interface ProductsTableProps {
  category?: string
  status?: string
  customer?: string
}

export function ProductsTable({ category, status, customer }: ProductsTableProps) {
  // 根據條件過濾產品
  const filteredProducts = productsData.filter((product) => {
    let match = true
    if (category) match = match && product.category === category
    if (status) match = match && product.status === status
    if (customer) match = match && product.customer === customer
    return match
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>產品編號</TableHead>
            <TableHead>產品名稱</TableHead>
            <TableHead>客戶</TableHead>
            <TableHead>工廠</TableHead>
            <TableHead>類別</TableHead>
            <TableHead>最近價格</TableHead>
            <TableHead>最近訂單</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <ProductImagePreview images={product.images} thumbnailSize="small" />
              </TableCell>
              <TableCell className="font-medium">
                {product.pn}
                {product.isAssembly && (
                  <Badge className="ml-2 bg-purple-500 text-white">
                    <Layers className="h-3 w-3 mr-1" />
                    組裝
                  </Badge>
                )}
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.customer}</TableCell>
              <TableCell>{product.factory}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{product.lastPrice}</TableCell>
              <TableCell>{product.lastOrderDate}</TableCell>
              <TableCell>
                <Badge className={`${statusColorMap[product.status]} text-white`}>
                  {statusNameMap[product.status]}
                </Badge>
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
                      <Link href={`/products/${product.id}`} className="flex items-center">
                        <Eye className="mr-2 h-4 w-4" />
                        查看詳情
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={`/products/${product.id}/edit`} className="flex items-center">
                        <Pencil className="mr-2 h-4 w-4" />
                        編輯產品
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href={`/products/new?clone=${product.id}`} className="flex items-center">
                        <Copy className="mr-2 h-4 w-4" />
                        複製產品
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={`/products/${product.id}/inquiry`} className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        生成詢價單
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
