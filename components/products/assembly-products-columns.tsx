import { Button } from "@/components/ui/button"
import { Eye, FileText, MoreHorizontal, Pencil, Copy } from "lucide-react"
import Link from "next/link"
import type { AssemblyProduct } from "@/types/assembly-product"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// 定義表格列
export const columns = [
  {
    accessorKey: "part_no",
    header: "產品編號",
  },
  {
    accessorKey: "component_name",
    header: "產品名稱",
  },
  {
    accessorKey: "customer_id",
    header: "客戶",
  },
  {
    accessorKey: "components_count",
    header: "組件數量",
  },
  {
    accessorKey: "total_cost",
    header: "總成本",
    cell: ({ row }) => {
      const cost = row.getValue("total_cost")
      const currency = row.original.currency || "USD"
      return cost ? `${cost} ${currency}` : "-"
    },
  },
  {
    accessorKey: "status",
    header: "狀態",
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => {
      const product = row.original as AssemblyProduct
      return (
        <div className="text-right">
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
                <Link href={`/products/all/${encodeURIComponent(product.part_no)}`} className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  查看詳情
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={`/products/all/${encodeURIComponent(product.part_no)}/edit`} className="flex items-center">
                  <Pencil className="mr-2 h-4 w-4" />
                  編輯產品
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={`/products/new?clone=${encodeURIComponent(product.part_no)}`} className="flex items-center">
                  <Copy className="mr-2 h-4 w-4" />
                  複製產品
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={`/products/all/${encodeURIComponent(product.part_no)}/assembly-inquiry`}
                  className="flex items-center"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  生成詢價單
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
