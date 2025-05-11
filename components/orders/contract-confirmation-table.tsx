"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, ShoppingCart, Upload } from "lucide-react"
import Link from "next/link"

// 模擬待確認合約數據
const contractsData = [
  {
    id: "ORD-2023-0012",
    customer: "台灣電子",
    poNumber: "PO-TE-2023-042",
    amount: "$25,200",
    orderDate: "2023-04-15",
    products: "LCD面板 x 500",
    orderConfirmed: false,
    purchaseConfirmed: false,
  },
  {
    id: "ORD-2023-0011",
    customer: "新竹科技",
    poNumber: "PO-HT-2023-118",
    amount: "$12,400",
    orderDate: "2023-04-14",
    products: "電容器 x 2000",
    orderConfirmed: true,
    purchaseConfirmed: false,
  },
  {
    id: "ORD-2023-0010",
    customer: "台北工業",
    poNumber: "PO-TI-2023-087",
    amount: "$8,750",
    orderDate: "2023-04-12",
    products: "電阻 x 5000",
    orderConfirmed: false,
    purchaseConfirmed: true,
  },
]

export function ContractConfirmationTable() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [uploadType, setUploadType] = useState<"order" | "purchase" | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleUpload = (orderId: string, type: "order" | "purchase") => {
    setSelectedOrder(orderId)
    setUploadType(type)
    setIsDialogOpen(true)
  }

  const handleConfirm = () => {
    // 實際應用中這裡會處理文件上傳和狀態更新
    setIsDialogOpen(false)

    // 模擬狀態更新
    // 實際應用中應該調用API更新狀態
  }

  return (
    <>
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
              <TableHead>訂單確認書</TableHead>
              <TableHead>採購單</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contractsData.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell className="font-medium">{contract.id}</TableCell>
                <TableCell>{contract.customer}</TableCell>
                <TableCell>{contract.poNumber}</TableCell>
                <TableCell>{contract.products}</TableCell>
                <TableCell>{contract.amount}</TableCell>
                <TableCell>{contract.orderDate}</TableCell>
                <TableCell>
                  {contract.orderConfirmed ? (
                    <Badge className="bg-green-500 text-white">已確認</Badge>
                  ) : (
                    <Badge className="bg-yellow-500 text-white">待確認</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {contract.purchaseConfirmed ? (
                    <Badge className="bg-green-500 text-white">已確認</Badge>
                  ) : (
                    <Badge className="bg-yellow-500 text-white">待確認</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link href={`/orders/${contract.id}/confirmation`}>
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        訂單
                      </Button>
                    </Link>
                    <Link href={`/purchases/from-order/${contract.id}`}>
                      <Button variant="outline" size="sm">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        採購
                      </Button>
                    </Link>
                    {(!contract.orderConfirmed || !contract.purchaseConfirmed) && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          if (!contract.orderConfirmed) {
                            handleUpload(contract.id, "order")
                          } else if (!contract.purchaseConfirmed) {
                            handleUpload(contract.id, "purchase")
                          }
                        }}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        上傳
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>上傳已簽回{uploadType === "order" ? "訂單確認書" : "採購單"}</DialogTitle>
            <DialogDescription>請上傳客戶{uploadType === "order" ? "" : "/工廠"}已簽回的文件</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">選擇文件</Label>
              <Input id="file" type="file" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">備註</Label>
              <Input id="notes" placeholder="輸入備註（選填）" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleConfirm}>確認上傳</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
