"use client"

import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState, useEffect } from "react"
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
import { Eye, FileText, MoreHorizontal, Pencil, Package, Calendar, Upload, Download } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Update the mock data to include factory information
const shipmentsData = [
  {
    id: "SHP-2023-0005",
    customer: "台灣電子",
    factory: "深圳電子廠",
    orderRef: "ORD-2023-0012",
    batchNumber: 2,
    totalBatches: 2,
    batchQuantity: 200,
    totalQuantity: 300,
    amount: "$12,600",
    status: "準備中",
    date: "2023-04-20",
    destination: "台北",
    vessel: "待定",
    orderDeliveryDate: "2023-03-30", // 訂單交貨期
    purchaseDeliveryDate: "2023-03-25", // 採購單交貨期
    customerUpdatedDeliveryDate: "2023-04-05", // 客戶更新交貨期
    factoryActualDeliveryDate: "", // 工廠實際交貨期
    factoryExpectedDeliveryDate: "2023-04-02", // 工廠預計交貨期
    isDelayed: true, // 是否延遲
    shippingResponsible: "張小芳", // 負責船務
  },
  {
    id: "SHP-2023-0004",
    customer: "新竹科技",
    factory: "上海科技廠",
    orderRef: "ORD-2023-0011",
    batchNumber: 1,
    totalBatches: 1,
    batchQuantity: 150,
    totalQuantity: 150,
    amount: "$12,400",
    status: "準備中",
    date: "2023-04-18",
    destination: "新竹",
    vessel: "待定",
    orderDeliveryDate: "2023-04-20", // 訂單交貨期
    purchaseDeliveryDate: "2023-04-15", // 採購單交貨期
    customerUpdatedDeliveryDate: "", // 客戶更新交貨期
    factoryActualDeliveryDate: "", // 工廠實際交貨期
    factoryExpectedDeliveryDate: "2023-04-14", // 工廠預計交貨期
    isDelayed: false, // 是否延遲
    shippingResponsible: "陳小強", // 負責船務
  },
  {
    id: "SHP-2023-0003",
    customer: "台北工業",
    factory: "東莞工業廠",
    orderRef: "ORD-2023-0010",
    batchNumber: 1,
    totalBatches: 1,
    batchQuantity: 100,
    totalQuantity: 100,
    amount: "$8,750",
    status: "已出貨",
    date: "2023-04-15",
    destination: "台北",
    vessel: "海運一號",
    orderDeliveryDate: "2023-04-15", // 訂單交貨期
    purchaseDeliveryDate: "2023-04-10", // 採購單交貨期
    customerUpdatedDeliveryDate: "", // 客戶更新交貨期
    factoryActualDeliveryDate: "2023-04-12", // 工廠實際交貨期
    factoryExpectedDeliveryDate: "2023-04-11", // 工廠預計交貨期
    isDelayed: false, // 是否延遲
    shippingResponsible: "張小芳", // 負責船務
  },
  {
    id: "SHP-2023-0002",
    customer: "高雄製造",
    factory: "廣州製造廠",
    orderRef: "ORD-2023-0009",
    batchNumber: 1,
    totalBatches: 1,
    batchQuantity: 200,
    totalQuantity: 200,
    amount: "$18,300",
    status: "已出貨",
    date: "2023-04-12",
    destination: "高雄",
    vessel: "海運二號",
    orderDeliveryDate: "2023-04-10", // 訂單交貨期
    purchaseDeliveryDate: "2023-04-05", // 採購單交貨期
    customerUpdatedDeliveryDate: "", // 客戶更新交貨期
    factoryActualDeliveryDate: "2023-04-08", // 工廠實際交貨期
    factoryExpectedDeliveryDate: "2023-04-07", // 工廠預計交貨期
    isDelayed: false, // 是否延遲
    shippingResponsible: "陳小強", // 負責船務
  },
  {
    id: "SHP-2023-0001",
    customer: "台灣電子",
    factory: "蘇州電子廠",
    orderRef: "ORD-2023-0012",
    batchNumber: 1,
    totalBatches: 2,
    batchQuantity: 100,
    totalQuantity: 300,
    amount: "$12,600",
    status: "已完成",
    date: "2023-01-28",
    destination: "台北",
    vessel: "海運三號",
    orderDeliveryDate: "2023-01-30", // 訂單交貨期
    purchaseDeliveryDate: "2023-01-25", // 採購單交貨期
    customerUpdatedDeliveryDate: "", // 客戶更新交貨期
    factoryActualDeliveryDate: "2023-01-28", // 工廠實際交貨期
    factoryExpectedDeliveryDate: "2023-01-27", // 工廠預計交貨期
    isDelayed: false, // 是否延遲
    shippingResponsible: "張小芳", // 負責船務
  },
]

// 模擬當前用戶數據
const currentUser = {
  id: "3",
  name: "張小芳",
  role: "shipping",
  customers: ["1", "3", "4"], // 客戶ID
}

// 模擬客戶數據
const customers = [
  { id: "1", name: "台灣電子" },
  { id: "2", name: "新竹科技" },
  { id: "3", name: "台北工業" },
  { id: "4", name: "高雄製造" },
  { id: "5", name: "台中電子" },
  { id: "6", name: "桃園科技" },
  { id: "7", name: "嘉義工業" },
]

// 模擬工廠數據
const factories = [
  { id: "1", name: "深圳電子廠" },
  { id: "2", name: "上海科技廠" },
  { id: "3", name: "東莞工業廠" },
  { id: "4", name: "廣州製造廠" },
  { id: "5", name: "蘇州電子廠" },
]

// 狀態顏色映射
const statusColorMap: Record<string, string> = {
  準備中: "bg-yellow-500",
  已出貨: "bg-blue-500",
  已完成: "bg-green-500",
}

interface ShipmentsTableProps {
  status?: string
  isDelayed?: boolean
}

export function ShipmentsTable({ status, isDelayed }: ShipmentsTableProps) {
  const [loading, setLoading] = useState(true)
  const [shipments, setShipments] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<any>(null)
  const [customerUpdatedDate, setCustomerUpdatedDate] = useState("")
  const [factoryActualDate, setFactoryActualDate] = useState("")
  const [factoryExpectedDate, setFactoryExpectedDate] = useState("")
  const [selectedFactory, setSelectedFactory] = useState<string | null>(null)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)

  useEffect(() => {
    // 模擬資料載入
    const timer = setTimeout(() => {
      setShipments([
        { id: 1, number: "SH-2023-001", customer: "客戶A", status: "準備中", date: "2023-06-10" },
        { id: 2, number: "SH-2023-002", customer: "客戶B", status: "已出貨", date: "2023-06-15" },
        { id: 3, number: "SH-2023-003", customer: "客戶C", status: "已完成", date: "2023-06-20" },
      ])
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <div className="p-4 text-center">載入中...</div>
  }

  if (shipments.length === 0) {
    return <div className="p-4 text-center">沒有找到符合條件的出貨</div>
  }

  // 根據用戶的客戶矩陣過濾出貨數據
  const userFilteredShipments = shipmentsData.filter((shipment) => {
    // 找到對應的客戶ID
    const customerObj = customers.find((c) => c.name === shipment.customer)
    // 如果找不到客戶或用戶是管理員，則顯示所有數據
    if (!customerObj || currentUser.role === "admin") return true
    // 檢查用戶是否負責該客戶
    return currentUser.customers.includes(customerObj.id)
  })

  // 根據狀態和延遲標誌過濾出貨
  const filteredShipments = userFilteredShipments
    .filter((shipment) => {
      if (status) return shipment.status === status
      if (isDelayed) return shipment.isDelayed
      return true
    })
    .filter(
      (shipment) =>
        searchTerm === "" ||
        shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.factory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.orderRef.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  // 打開交期更新對話框
  const handleOpenDeliveryDialog = (shipment: any) => {
    setSelectedShipment(shipment)
    setCustomerUpdatedDate(shipment.customerUpdatedDeliveryDate || "")
    setFactoryActualDate(shipment.factoryActualDeliveryDate || "")
    setFactoryExpectedDate(shipment.factoryExpectedDeliveryDate || "")
    setIsDeliveryDialogOpen(true)
  }

  // 保存交期更新
  const handleSaveDeliveryDates = async () => {
    // 模擬API請求
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 實際應用中應該調用API更新交期
    console.log("更新交期:", {
      shipmentId: selectedShipment.id,
      customerUpdatedDeliveryDate: customerUpdatedDate,
      factoryActualDeliveryDate: factoryActualDate,
      factoryExpectedDeliveryDate: factoryExpectedDate,
    })

    toast({
      title: "交期已更新",
      description: `出貨 ${selectedShipment.id} 的交期信息已成功更新`,
    })

    setIsDeliveryDialogOpen(false)
  }

  // 打開匯出對話框
  const handleOpenExportDialog = () => {
    setIsExportDialogOpen(true)
  }

  // 匯出工廠出貨列表
  const handleExportFactoryShipments = async () => {
    if (!selectedFactory) {
      toast({
        title: "請選擇工廠",
        description: "請先選擇要匯出的工廠",
        variant: "destructive",
      })
      return
    }

    // 模擬API請求
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 實際應用中應該調用API匯出數據
    console.log("匯出工廠出貨列表:", {
      factory: selectedFactory,
      period: "最近一個月",
    })

    toast({
      title: "匯出成功",
      description: `已成功匯出 ${selectedFactory} 的出貨列表`,
    })

    setIsExportDialogOpen(false)
  }

  // 打開匯入對話框
  const handleOpenImportDialog = () => {
    setIsImportDialogOpen(true)
  }

  // 處理文件選擇
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0])
    }
  }

  // 匯入交期更新
  const handleImportDeliveryDates = async () => {
    if (!importFile) {
      toast({
        title: "請選擇文件",
        description: "請先選擇要匯入的交期更新文件",
        variant: "destructive",
      })
      return
    }

    // 模擬API請求
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 實際應用中應該調用API匯入數據
    console.log("匯入交期更新:", {
      file: importFile.name,
    })

    toast({
      title: "匯入成功",
      description: `已成功匯入交期更新數據`,
    })

    setImportFile(null)
    setIsImportDialogOpen(false)
  }

  // 判斷交期狀態
  const getDeliveryStatus = (shipment: any) => {
    const actualDate = shipment.factoryActualDeliveryDate || new Date().toISOString().split("T")[0]
    const targetDate = shipment.customerUpdatedDeliveryDate || shipment.orderDeliveryDate

    if (!targetDate) return { status: "normal", text: "正常" }

    if (new Date(actualDate) > new Date(targetDate)) {
      return { status: "delayed", text: "延遲" }
    } else if (new Date(actualDate) < new Date(targetDate)) {
      return { status: "early", text: "提前" }
    } else {
      return { status: "ontime", text: "準時" }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="搜尋出貨編號、客戶、工廠或訂單..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenImportDialog}>
            <Upload className="mr-2 h-4 w-4" />
            匯入交期更新
          </Button>
          <Button variant="outline" onClick={handleOpenExportDialog}>
            <Download className="mr-2 h-4 w-4" />
            匯出工廠出貨列表
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>出貨編號</TableHead>
              <TableHead>客戶</TableHead>
              <TableHead>工廠</TableHead>
              <TableHead>訂單編號</TableHead>
              <TableHead>批次</TableHead>
              <TableHead>數量</TableHead>
              <TableHead>訂單交期</TableHead>
              <TableHead>採購單交期</TableHead>
              <TableHead>客戶更新交期</TableHead>
              <TableHead>工廠預計交期</TableHead>
              <TableHead>工廠實際交期</TableHead>
              <TableHead>負責船務</TableHead>
              <TableHead>交期狀態</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShipments.map((shipment) => {
              const deliveryStatus = getDeliveryStatus(shipment)
              return (
                <TableRow key={shipment.id}>
                  <TableCell className="font-medium">{shipment.id}</TableCell>
                  <TableCell>{shipment.customer}</TableCell>
                  <TableCell>{shipment.factory}</TableCell>
                  <TableCell>
                    <Link href={`/orders/${shipment.orderRef}`} className="text-blue-600 hover:underline block">
                      {shipment.orderRef}
                    </Link>
                  </TableCell>
                  <TableCell>
                    第 {shipment.batchNumber} 批 (共 {shipment.totalBatches} 批)
                  </TableCell>
                  <TableCell>
                    {shipment.batchQuantity} / {shipment.totalQuantity}
                  </TableCell>
                  <TableCell>{shipment.orderDeliveryDate}</TableCell>
                  <TableCell>{shipment.purchaseDeliveryDate}</TableCell>
                  <TableCell>
                    {shipment.customerUpdatedDeliveryDate || <span className="text-gray-400">-</span>}
                  </TableCell>
                  <TableCell>
                    {shipment.factoryExpectedDeliveryDate || <span className="text-gray-400">-</span>}
                  </TableCell>
                  <TableCell>
                    {shipment.factoryActualDeliveryDate || <span className="text-gray-400">-</span>}
                  </TableCell>
                  <TableCell>{shipment.shippingResponsible}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        deliveryStatus.status === "delayed"
                          ? "bg-red-500"
                          : deliveryStatus.status === "early"
                            ? "bg-green-500"
                            : "bg-blue-500"
                      }
                    >
                      {deliveryStatus.text}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusColorMap[shipment.status]} text-white`}>{shipment.status}</Badge>
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
                          <Link href={`/shipments/${shipment.id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            查看詳情
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/shipments/${shipment.id}/edit`} className="flex items-center">
                            <Pencil className="mr-2 h-4 w-4" />
                            編輯出貨
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDeliveryDialog(shipment)}>
                          <Calendar className="mr-2 h-4 w-4" />
                          更新交期
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Link href={`/shipments/${shipment.id}/invoice`} className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            查看發票
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/shipments/${shipment.id}/packing`} className="flex items-center">
                            <Package className="mr-2 h-4 w-4" />
                            查看裝箱單
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* 交期更新對話框 */}
      <Dialog open={isDeliveryDialogOpen} onOpenChange={setIsDeliveryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>更新交期信息</DialogTitle>
            <DialogDescription>{selectedShipment && `更新 ${selectedShipment.id} 的交期信息`}</DialogDescription>
          </DialogHeader>

          {selectedShipment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">訂單交期</p>
                  <p className="text-sm">{selectedShipment.orderDeliveryDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">採購單交期</p>
                  <p className="text-sm">{selectedShipment.purchaseDeliveryDate}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">客戶更新交期</label>
                <Input
                  type="date"
                  value={customerUpdatedDate}
                  onChange={(e) => setCustomerUpdatedDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">如果客戶要求更改交期，請在此更新</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">工廠預計交期</label>
                <Input
                  type="date"
                  value={factoryExpectedDate}
                  onChange={(e) => setFactoryExpectedDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">工廠預計交貨日期</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">工廠實際交期</label>
                <Input type="date" value={factoryActualDate} onChange={(e) => setFactoryActualDate(e.target.value)} />
                <p className="text-xs text-muted-foreground">工廠實際交貨日期</p>
              </div>

              {customerUpdatedDate && factoryActualDate && (
                <div className="p-2 rounded-md bg-muted">
                  <p className="text-sm font-medium flex items-center">
                    交期狀態:
                    {new Date(factoryActualDate) >
                    new Date(customerUpdatedDate || selectedShipment.orderDeliveryDate) ? (
                      <>
                        <Badge className="ml-2 bg-red-500">延遲</Badge>
                        <span className="ml-2 text-red-500">
                          延遲{" "}
                          {Math.ceil(
                            (new Date(factoryActualDate).getTime() -
                              new Date(customerUpdatedDate || selectedShipment.orderDeliveryDate).getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}{" "}
                          天
                        </span>
                      </>
                    ) : new Date(factoryActualDate) <
                      new Date(customerUpdatedDate || selectedShipment.orderDeliveryDate) ? (
                      <>
                        <Badge className="ml-2 bg-green-500">提前</Badge>
                        <span className="ml-2 text-green-500">
                          提前{" "}
                          {Math.ceil(
                            (new Date(customerUpdatedDate || selectedShipment.orderDeliveryDate).getTime() -
                              new Date(factoryActualDate).getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}{" "}
                          天
                        </span>
                      </>
                    ) : (
                      <Badge className="ml-2 bg-blue-500">準時</Badge>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeliveryDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveDeliveryDates}>儲存交期信息</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 匯出工廠出貨列表對話框 */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>匯出工廠出貨列表</DialogTitle>
            <DialogDescription>匯出工廠最近一個月準備要出貨的採購單列表</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">選擇工廠</label>
              <Select value={selectedFactory || ""} onValueChange={setSelectedFactory}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇工廠" />
                </SelectTrigger>
                <SelectContent>
                  {factories.map((factory) => (
                    <SelectItem key={factory.id} value={factory.name}>
                      {factory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-2 rounded-md bg-muted">
              <p className="text-sm">
                匯出的數據將包含：採購單號碼、數量、批次、採購單交期、負責船務、預計交期（供工廠填寫）
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleExportFactoryShipments}>
              <Download className="mr-2 h-4 w-4" />
              匯出
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 匯入交期更新對話框 */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>匯入交期更新</DialogTitle>
            <DialogDescription>匯入工廠回傳的預計交期更新</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">選擇檔案</label>
              <Input type="file" accept=".xlsx,.csv" onChange={handleFileChange} />
              <p className="text-xs text-muted-foreground">
                請上傳工廠填寫並回傳的交期更新檔案（支援 Excel 或 CSV 格式）
              </p>
            </div>

            {importFile && (
              <div className="p-2 rounded-md bg-muted">
                <p className="text-sm">已選擇檔案：{importFile.name}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleImportDeliveryDates}>
              <Upload className="mr-2 h-4 w-4" />
              匯入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
