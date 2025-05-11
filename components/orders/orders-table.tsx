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
import { Eye, FileText, MoreHorizontal, Pencil, ShoppingCart, Truck } from "lucide-react"
import Link from "next/link"

// 模擬訂單數據
const ordersData = [
  {
    id: "ORD-2023-0012",
    customer: "台灣電子",
    poNumber: "PO-TE-2023-042",
    amount: "$25,200",
    status: "待確認",
    date: "2023-04-15",
    products: "LCD面板 x 500",
  },
  {
    id: "ORD-2023-0011",
    customer: "新竹科技",
    poNumber: "PO-HT-2023-118",
    amount: "$12,400",
    status: "進行中",
    date: "2023-04-14",
    products: "電容器 x 2000",
  },
  {
    id: "ORD-2023-0010",
    customer: "台北工業",
    poNumber: "PO-TI-2023-087",
    amount: "$8,750",
    status: "驗貨完成",
    date: "2023-04-12",
    products: "電阻 x 5000",
  },
  {
    id: "ORD-2023-0009",
    customer: "高雄製造",
    poNumber: "PO-KM-2023-063",
    amount: "$18,300",
    status: "已出貨",
    date: "2023-04-10",
    products: "IC晶片 x 300",
  },
  {
    id: "ORD-2023-0008",
    customer: "台中電子",
    poNumber: "PO-TC-2023-055",
    amount: "$9,200",
    status: "結案",
    date: "2023-04-08",
    products: "PCB板 x 150",
  },
]

// 狀態顏色映射
const statusColorMap: Record<string, string> = {
  待確認: "bg-yellow-500",
  進行中: "bg-blue-500",
  驗貨完成: "bg-green-500",
  已出貨: "bg-purple-500",
  結案: "bg-gray-500",
}

interface OrdersTableProps {
  status?: string
}

export function OrdersTable({ status }: OrdersTableProps) {
  // 根據狀態過濾訂單
  const filteredOrders = status ? ordersData.filter((order) => order.status === status) : ordersData

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>訂單編號</TableHead>
            <TableHead>客戶</TableHead>
            <TableHead>客戶PO編號</TableHead>
            <TableHead>產品</TableHead>
            <TableHead>金額</TableHead>
            <TableHead>日期</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>{order.poNumber}</TableCell>
              <TableCell>{order.products}</TableCell>
              <TableCell>{order.amount}</TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell>
                <Badge className={`${statusColorMap[order.status]} text-white`}>{order.status}</Badge>
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
                      <Link href={`/orders/${order.id}`} className="flex items-center">
                        <Eye className="mr-2 h-4 w-4" />
                        查看詳情
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={`/orders/${order.id}/edit`} className="flex items-center">
                        <Pencil className="mr-2 h-4 w-4" />
                        編輯訂單
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href={`/orders/${order.id}/confirmation`} className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        查看訂單確認書
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={`/purchases/from-order/${order.id}`} className="flex items-center">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        查看採購單
                      </Link>
                    </DropdownMenuItem>
                    {(order.status === "驗貨完成" || order.status === "已出貨") && (
                      <DropdownMenuItem>
                        <Link href={`/shipments/from-order/${order.id}`} className="flex items-center">
                          <Truck className="mr-2 h-4 w-4" />
                          查看出貨資訊
                        </Link>
                      </DropdownMenuItem>
                    )}
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
