"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Eye, FileEdit, MoreHorizontal } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import type { Product } from "@/types/product"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProductsTableProps {
  products: Product[]
  isLoading?: boolean
  onEdit?: (product: Product) => void
  onView?: (product: Product) => void
}

export function ProductsTable({ products, isLoading = false, onEdit, onView }: ProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products

    return products.filter((product) => {
      const searchFields = [
        product.part_no,
        product.component_name,
        product.customer_id,
        product.factory_id,
        product.description,
      ]
      return searchFields.some((field) => field && field.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    })
  }, [products, searchTerm])

  const columns = [
    {
      accessorKey: "part_no",
      header: "產品編號",
    },
    {
      accessorKey: "component_name",
      header: "產品名稱",
      cell: ({ row }: { row: { original: Product } }) => {
        const product = row.original

        // 顯示組件名稱
        let componentNames = ""
        if (product.is_assembly && product.pid_part_no) {
          let components = product.pid_part_no

          // 如果是字符串，嘗試解析為JSON
          if (typeof components === "string") {
            try {
              components = JSON.parse(components)
            } catch (e) {
              console.error("解析組件時出錯:", e)
              components = []
            }
          }

          if (Array.isArray(components)) {
            componentNames = components
              .map((comp) => (typeof comp === "object" ? comp.description : ""))
              .filter((name) => name)
              .join(", ")
          }
        }

        return (
          <div>
            <div>{product.component_name}</div>
            {componentNames && <div className="text-xs text-muted-foreground mt-1">{componentNames}</div>}
          </div>
        )
      },
    },
    {
      accessorKey: "customer_id",
      header: "客戶",
    },
    {
      accessorKey: "factory_id",
      header: "工廠",
    },
    {
      accessorKey: "status",
      header: "狀態",
    },
    {
      id: "actions",
      cell: ({ row }: { row: { original: Product } }) => {
        const product = row.original

        return (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => (onView ? onView(product) : null)} asChild={!onView}>
              {!onView ? (
                <Link href={`/products/all/${encodeURIComponent(product.part_no)}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  詳情
                </Link>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  詳情
                </>
              )}
            </Button>

            <Button variant="ghost" size="sm" onClick={() => (onEdit ? onEdit(product) : null)} asChild={!onEdit}>
              {!onEdit ? (
                <Link href={`/products/${encodeURIComponent(product.part_no)}/edit`}>
                  <FileEdit className="h-4 w-4 mr-1" />
                  編輯
                </Link>
              ) : (
                <>
                  <FileEdit className="h-4 w-4 mr-1" />
                  編輯
                </>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>操作</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href={`/products/all/${encodeURIComponent(product.part_no)}/inquiry`} className="w-full">
                    詢價
                  </Link>
                </DropdownMenuItem>
                {product.is_assembly && (
                  <DropdownMenuItem>
                    <Link
                      href={`/products/all/${encodeURIComponent(product.part_no)}/assembly-inquiry`}
                      className="w-full"
                    >
                      組合詢價
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  return <DataTable columns={columns} data={filteredProducts} loading={isLoading} />
}
