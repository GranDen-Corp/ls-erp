import { Button } from "@/components/ui/button"
import { Eye, FileEdit, FileText } from "lucide-react"
import Link from "next/link"
import type { AssemblyProduct } from "@/types/assembly-product"

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
        <div className="flex items-center gap-2">
          <Link href={`/products/all/${encodeURIComponent(product.part_no)}`}>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/products/all/${encodeURIComponent(product.part_no)}/edit`}>
            <Button variant="ghost" size="icon">
              <FileEdit className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/products/all/${encodeURIComponent(product.part_no)}/assembly-inquiry`}>
            <Button variant="ghost" size="icon">
              <FileText className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )
    },
  },
]
