"use client"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { AlertCircle, CheckCircle, Clock, Edit } from "lucide-react"

// 模擬數據
const shipmentBatches = [
  {
    id: "BAT001",
    orderNumber: "ORD-2023-001",
    batchNumber: 1,
    customer: "ABC Electronics",
    product: "Wireless Earbuds",
    totalQuantity: 1000,
    batchQuantity: 500,
    originalDeliveryDate: "2023-05-15",
    updatedCustomerDeliveryDate: "2023-05-20",
    factoryDeliveryDate: "2023-05-10",
    actualFactoryDeliveryDate: "2023-05-12",
    status: "on-time",
  },
  {
    id: "BAT002",
    orderNumber: "ORD-2023-001",
    batchNumber: 2,
    customer: "ABC Electronics",
    product: "Wireless Earbuds",
    totalQuantity: 1000,
    batchQuantity: 500,
    originalDeliveryDate: "2023-06-15",
    updatedCustomerDeliveryDate: "2023-06-20",
    factoryDeliveryDate: "2023-06-10",
    actualFactoryDeliveryDate: null,
    status: "pending",
  },
  {
    id: "BAT003",
    orderNumber: "ORD-2023-002",
    batchNumber: 1,
    customer: "XYZ Tech",
    product: "Bluetooth Speaker",
    totalQuantity: 500,
    batchQuantity: 250,
    originalDeliveryDate: "2023-06-01",
    updatedCustomerDeliveryDate: "2023-06-01",
    factoryDeliveryDate: "2023-05-25",
    actualFactoryDeliveryDate: "2023-06-02",
    status: "delayed",
  },
  {
    id: "BAT004",
    orderNumber: "ORD-2023-002",
    batchNumber: 2,
    customer: "XYZ Tech",
    product: "Bluetooth Speaker",
    totalQuantity: 500,
    batchQuantity: 250,
    originalDeliveryDate: "2023-07-01",
    updatedCustomerDeliveryDate: "2023-07-01",
    factoryDeliveryDate: "2023-06-25",
    actualFactoryDeliveryDate: null,
    status: "pending",
  },
  {
    id: "BAT005",
    orderNumber: "ORD-2023-003",
    batchNumber: 1,
    customer: "Global Gadgets",
    product: "Smart Watch",
    totalQuantity: 300,
    batchQuantity: 300,
    originalDeliveryDate: "2023-06-15",
    updatedCustomerDeliveryDate: "2023-06-10",
    factoryDeliveryDate: "2023-06-05",
    actualFactoryDeliveryDate: "2023-06-03",
    status: "early",
  },
]

interface ShipmentBatchesTableProps {
  searchTerm?: string
  dateRange?: { from: Date | undefined; to: Date | undefined }
  status?: string
}

export function ShipmentBatchesTable({ searchTerm = "", dateRange, status = "all" }: ShipmentBatchesTableProps) {
  // 過濾數據
  const filteredBatches = shipmentBatches.filter((batch) => {
    // 搜索詞過濾
    if (
      searchTerm &&
      !batch.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !batch.customer.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !batch.product.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }

    // 狀態過濾
    if (status !== "all" && batch.status !== status && status !== "pending") {
      return false
    }

    // 日期範圍過濾
    if (dateRange?.from && dateRange?.to) {
      const batchDate = new Date(batch.originalDeliveryDate)
      if (batchDate < dateRange.from || batchDate > dateRange.to) {
        return false
      }
    }

    return true
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>訂單號</TableHead>
            <TableHead>批次</TableHead>
            <TableHead>客戶</TableHead>
            <TableHead>產品</TableHead>
            <TableHead>總數量</TableHead>
            <TableHead>批次數量</TableHead>
            <TableHead>原始交貨期</TableHead>
            <TableHead>客戶更新交貨期</TableHead>
            <TableHead>工廠交貨期</TableHead>
            <TableHead>工廠實際交貨期</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBatches.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center py-4">
                沒有找到符合條件的出貨批次記錄
              </TableCell>
            </TableRow>
          ) : (
            filteredBatches.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell>
                  <Link href={`/orders/${batch.orderNumber}`} className="text-blue-600 hover:underline">
                    {batch.orderNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">批次 {batch.batchNumber}</Badge>
                </TableCell>
                <TableCell>{batch.customer}</TableCell>
                <TableCell>{batch.product}</TableCell>
                <TableCell>{batch.totalQuantity}</TableCell>
                <TableCell>{batch.batchQuantity}</TableCell>
                <TableCell>{formatDate(batch.originalDeliveryDate)}</TableCell>
                <TableCell>{formatDate(batch.updatedCustomerDeliveryDate)}</TableCell>
                <TableCell>{formatDate(batch.factoryDeliveryDate)}</TableCell>
                <TableCell>
                  {batch.actualFactoryDeliveryDate ? (
                    formatDate(batch.actualFactoryDeliveryDate)
                  ) : (
                    <span className="text-gray-400">尚未交貨</span>
                  )}
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          {batch.status === "on-time" && (
                            <Badge className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              準時
                            </Badge>
                          )}
                          {batch.status === "delayed" && (
                            <Badge className="bg-red-500">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              延遲
                            </Badge>
                          )}
                          {batch.status === "early" && (
                            <Badge className="bg-blue-500">
                              <Clock className="h-3 w-3 mr-1" />
                              提前
                            </Badge>
                          )}
                          {batch.status === "pending" && (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                              <Clock className="h-3 w-3 mr-1" />
                              待出貨
                            </Badge>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {batch.status === "on-time" && "按時交貨"}
                        {batch.status === "delayed" && "交貨延遲"}
                        {batch.status === "early" && "提前交貨"}
                        {batch.status === "pending" && "尚未出貨"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <Link href={`/shipments/batches/${batch.id}`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      更新
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
