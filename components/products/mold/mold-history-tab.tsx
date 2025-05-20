"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Plus,
  FileText,
  PenToolIcon as Tool,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Calendar,
} from "lucide-react"
import { format } from "date-fns"
import type { MoldData, MoldHistoryRecord, MoldMaintenanceRecord, MoldUsageRecord } from "@/types/mold-history"

interface MoldHistoryTabProps {
  product: any
  handleInputChange: (field: string, value: any) => void
}

export function MoldHistoryTab({ product, handleInputChange }: MoldHistoryTabProps) {
  // 初始化模具數據
  const [moldData, setMoldData] = useState<MoldData>(
    product.moldData || {
      id: "",
      productId: product.id || "",
      moldNumber: "",
      manufacturer: "",
      creationDate: "",
      material: "",
      cavities: 1,
      dimensions: "",
      weight: 0,
      location: "",
      status: "active",
      cost: product.moldCost || 0,
      refundableQuantity: product.refundableMoldQuantity || 0,
      expectedLifespan: 0,
      currentCycleCount: 0,
      maxCycleCount: 0,
      maintenanceRecords: [],
      usageRecords: [],
      historyRecords: [],
      notes: "",
    },
  )

  // 對話框狀態
  const [activeTab, setActiveTab] = useState("info")
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false)
  const [isUsageDialogOpen, setIsUsageDialogOpen] = useState(false)
  const [newHistoryRecord, setNewHistoryRecord] = useState<Partial<MoldHistoryRecord>>({
    date: format(new Date(), "yyyy-MM-dd"),
    type: "modification",
    description: "",
    performedBy: "",
  })
  const [newMaintenanceRecord, setNewMaintenanceRecord] = useState<Partial<MoldMaintenanceRecord>>({
    date: format(new Date(), "yyyy-MM-dd"),
    type: "maintenance",
    description: "",
    cost: 0,
    performedBy: "",
    result: "completed",
  })
  const [newUsageRecord, setNewUsageRecord] = useState<Partial<MoldUsageRecord>>({
    date: format(new Date(), "yyyy-MM-dd"),
    orderNumber: "",
    productQuantity: 0,
    cycleCount: 0,
    operator: "",
    notes: "",
  })

  // 當產品資料變更時更新模具數據
  useEffect(() => {
    if (product.moldData) {
      setMoldData(product.moldData)
    } else if (product.hasMold) {
      // 如果沒有模具數據但有模具，則創建初始模具數據
      const initialMoldData: MoldData = {
        id: `mold-${Date.now()}`,
        productId: product.id || "",
        moldNumber: "",
        manufacturer: "",
        creationDate: "",
        material: "",
        cavities: 1,
        dimensions: "",
        weight: 0,
        location: "",
        status: "active",
        cost: product.moldCost || 0,
        refundableQuantity: product.refundableMoldQuantity || 0,
        returnedDate: product.moldReturned ? format(new Date(), "yyyy-MM-dd") : undefined,
        expectedLifespan: 0,
        currentCycleCount: 0,
        maxCycleCount: 0,
        maintenanceRecords: [],
        usageRecords: [],
        historyRecords: [
          {
            id: `hist-${Date.now()}`,
            date: format(new Date(), "yyyy-MM-dd"),
            type: "creation",
            description: "初始模具資料建立",
            performedBy: "",
          },
        ],
        notes: "",
      }
      setMoldData(initialMoldData)
      handleInputChange("moldData", initialMoldData)
    }
  }, [
    product.id,
    product.hasMold,
    product.moldCost,
    product.refundableMoldQuantity,
    product.moldReturned,
    product.moldData,
  ])

  // 處理模具基本資訊變更
  const handleMoldDataChange = (field: keyof MoldData, value: any) => {
    const updatedMoldData = { ...moldData, [field]: value }
    setMoldData(updatedMoldData)
    handleInputChange("moldData", updatedMoldData)

    // 同步更新產品的模具相關欄位
    if (field === "cost") {
      handleInputChange("moldCost", value)
    } else if (field === "refundableQuantity") {
      handleInputChange("refundableMoldQuantity", value)
    } else if (field === "status" && value === "returned") {
      handleInputChange("moldReturned", true)
      // 如果狀態變更為已退回，添加一條歷史記錄
      addHistoryRecord({
        id: `hist-${Date.now()}`,
        date: format(new Date(), "yyyy-MM-dd"),
        type: "return",
        description: "模具已退回",
        performedBy: "",
      })
    }
  }

  // 添加歷史記錄
  const addHistoryRecord = (record: MoldHistoryRecord) => {
    const updatedRecords = [...moldData.historyRecords, record]
    const updatedMoldData = { ...moldData, historyRecords: updatedRecords }
    setMoldData(updatedMoldData)
    handleInputChange("moldData", updatedMoldData)
  }

  // 添加維護記錄
  const addMaintenanceRecord = (record: MoldMaintenanceRecord) => {
    const updatedRecords = [...moldData.maintenanceRecords, record]
    const updatedMoldData = { ...moldData, maintenanceRecords: updatedRecords }
    setMoldData(updatedMoldData)
    handleInputChange("moldData", updatedMoldData)

    // 同時添加一條歷史記錄
    addHistoryRecord({
      id: `hist-${Date.now()}`,
      date: record.date,
      type: "maintenance",
      description: `模具維護: ${record.description}`,
      performedBy: record.performedBy,
      cost: record.cost,
    })
  }

  // 添加使用記錄
  const addUsageRecord = (record: MoldUsageRecord) => {
    const updatedRecords = [...moldData.usageRecords, record]
    // 更新當前循環次數
    const newCycleCount = moldData.currentCycleCount + record.cycleCount
    const updatedMoldData = { ...moldData, usageRecords: updatedRecords, currentCycleCount: newCycleCount }
    setMoldData(updatedMoldData)
    handleInputChange("moldData", updatedMoldData)

    // 同時添加一條歷史記錄
    addHistoryRecord({
      id: `hist-${Date.now()}`,
      date: record.date,
      type: "usage",
      description: `模具使用: 訂單 ${record.orderNumber}, 產量 ${record.productQuantity}`,
      performedBy: record.operator,
    })
  }

  // 處理新增歷史記錄
  const handleAddHistoryRecord = () => {
    if (newHistoryRecord.description && newHistoryRecord.performedBy) {
      const record: MoldHistoryRecord = {
        id: `hist-${Date.now()}`,
        date: newHistoryRecord.date || format(new Date(), "yyyy-MM-dd"),
        type: newHistoryRecord.type as any,
        description: newHistoryRecord.description,
        performedBy: newHistoryRecord.performedBy,
        cost: newHistoryRecord.cost,
        documents: newHistoryRecord.documents,
      }
      addHistoryRecord(record)
      setNewHistoryRecord({
        date: format(new Date(), "yyyy-MM-dd"),
        type: "modification",
        description: "",
        performedBy: "",
      })
      setIsHistoryDialogOpen(false)
    }
  }

  // 處理新增維護記錄
  const handleAddMaintenanceRecord = () => {
    if (newMaintenanceRecord.description && newMaintenanceRecord.performedBy) {
      const record: MoldMaintenanceRecord = {
        id: `maint-${Date.now()}`,
        date: newMaintenanceRecord.date || format(new Date(), "yyyy-MM-dd"),
        type: newMaintenanceRecord.type as any,
        description: newMaintenanceRecord.description,
        cost: newMaintenanceRecord.cost || 0,
        performedBy: newMaintenanceRecord.performedBy,
        result: newMaintenanceRecord.result as any,
      }
      addMaintenanceRecord(record)
      setNewMaintenanceRecord({
        date: format(new Date(), "yyyy-MM-dd"),
        type: "maintenance",
        description: "",
        cost: 0,
        performedBy: "",
        result: "completed",
      })
      setIsMaintenanceDialogOpen(false)
    }
  }

  // 處理新增使用記錄
  const handleAddUsageRecord = () => {
    if (newUsageRecord.orderNumber && newUsageRecord.operator) {
      const record: MoldUsageRecord = {
        id: `usage-${Date.now()}`,
        date: newUsageRecord.date || format(new Date(), "yyyy-MM-dd"),
        orderNumber: newUsageRecord.orderNumber,
        productQuantity: newUsageRecord.productQuantity || 0,
        cycleCount: newUsageRecord.cycleCount || 0,
        operator: newUsageRecord.operator,
        notes: newUsageRecord.notes || "",
      }
      addUsageRecord(record)
      setNewUsageRecord({
        date: format(new Date(), "yyyy-MM-dd"),
        orderNumber: "",
        productQuantity: 0,
        cycleCount: 0,
        operator: "",
        notes: "",
      })
      setIsUsageDialogOpen(false)
    }
  }

  // 刪除歷史記錄
  const handleDeleteHistoryRecord = (id: string) => {
    const updatedRecords = moldData.historyRecords.filter((record) => record.id !== id)
    const updatedMoldData = { ...moldData, historyRecords: updatedRecords }
    setMoldData(updatedMoldData)
    handleInputChange("moldData", updatedMoldData)
  }

  // 刪除維護記錄
  const handleDeleteMaintenanceRecord = (id: string) => {
    const updatedRecords = moldData.maintenanceRecords.filter((record) => record.id !== id)
    const updatedMoldData = { ...moldData, maintenanceRecords: updatedRecords }
    setMoldData(updatedMoldData)
    handleInputChange("moldData", updatedMoldData)
  }

  // 刪除使用記錄
  const handleDeleteUsageRecord = (id: string) => {
    const record = moldData.usageRecords.find((r) => r.id === id)
    const updatedRecords = moldData.usageRecords.filter((r) => r.id !== id)

    // 更新當前循環次數
    let newCycleCount = moldData.currentCycleCount
    if (record) {
      newCycleCount = Math.max(0, newCycleCount - record.cycleCount)
    }

    const updatedMoldData = {
      ...moldData,
      usageRecords: updatedRecords,
      currentCycleCount: newCycleCount,
    }
    setMoldData(updatedMoldData)
    handleInputChange("moldData", updatedMoldData)
  }

  // 計算模具壽命百分比
  const calculateLifespanPercentage = () => {
    if (!moldData.maxCycleCount) return 0
    return Math.min(100, Math.round((moldData.currentCycleCount / moldData.maxCycleCount) * 100))
  }

  // 獲取模具狀態標籤
  const getMoldStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "使用中"
      case "maintenance":
        return "維護中"
      case "retired":
        return "已報廢"
      case "returned":
        return "已退回"
      default:
        return status
    }
  }

  // 獲取維護類型標籤
  const getMaintenanceTypeLabel = (type: string) => {
    switch (type) {
      case "maintenance":
        return "定期維護"
      case "repair":
        return "修復"
      case "modification":
        return "修改"
      case "inspection":
        return "檢查"
      default:
        return type
    }
  }

  // 獲取維護結果標籤
  const getMaintenanceResultLabel = (result: string) => {
    switch (result) {
      case "passed":
        return "通過"
      case "failed":
        return "未通過"
      case "pending":
        return "待定"
      case "completed":
        return "完成"
      default:
        return result
    }
  }

  // 獲取歷史記錄類型標籤
  const getHistoryTypeLabel = (type: string) => {
    switch (type) {
      case "creation":
        return "建立"
      case "modification":
        return "修改"
      case "maintenance":
        return "維護"
      case "usage":
        return "使用"
      case "return":
        return "退回"
      case "retirement":
        return "報廢"
      default:
        return type
    }
  }

  // 獲取歷史記錄類型圖標
  const getHistoryTypeIcon = (type: string) => {
    switch (type) {
      case "creation":
        return <Plus className="h-4 w-4" />
      case "modification":
        return <FileText className="h-4 w-4" />
      case "maintenance":
        return <Tool className="h-4 w-4" />
      case "usage":
        return <RotateCcw className="h-4 w-4" />
      case "return":
        return <CheckCircle className="h-4 w-4" />
      case "retirement":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">基本資訊</TabsTrigger>
          <TabsTrigger value="history">歷史記錄</TabsTrigger>
          <TabsTrigger value="maintenance">維護記錄</TabsTrigger>
          <TabsTrigger value="usage">使用記錄</TabsTrigger>
        </TabsList>

        {/* 基本資訊頁籤 */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>模具基本資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="moldNumber">模具編號</Label>
                      <Input
                        id="moldNumber"
                        value={moldData.moldNumber}
                        onChange={(e) => handleMoldDataChange("moldNumber", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manufacturer">製造商</Label>
                      <Input
                        id="manufacturer"
                        value={moldData.manufacturer}
                        onChange={(e) => handleMoldDataChange("manufacturer", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="creationDate">建立日期</Label>
                      <Input
                        id="creationDate"
                        type="date"
                        value={moldData.creationDate}
                        onChange={(e) => handleMoldDataChange("creationDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="material">材料</Label>
                      <Input
                        id="material"
                        value={moldData.material}
                        onChange={(e) => handleMoldDataChange("material", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cavities">模穴數</Label>
                      <Input
                        id="cavities"
                        type="number"
                        value={moldData.cavities}
                        onChange={(e) => handleMoldDataChange("cavities", Number.parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dimensions">尺寸</Label>
                      <Input
                        id="dimensions"
                        value={moldData.dimensions}
                        onChange={(e) => handleMoldDataChange("dimensions", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">重量 (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={moldData.weight}
                        onChange={(e) => handleMoldDataChange("weight", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">存放位置</Label>
                      <Input
                        id="location"
                        value={moldData.location}
                        onChange={(e) => handleMoldDataChange("location", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">狀態</Label>
                      <Select value={moldData.status} onValueChange={(value) => handleMoldDataChange("status", value)}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="選擇狀態" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">使用中</SelectItem>
                          <SelectItem value="maintenance">維護中</SelectItem>
                          <SelectItem value="retired">已報廢</SelectItem>
                          <SelectItem value="returned">已退回</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cost">模具費用</Label>
                      <Input
                        id="cost"
                        type="number"
                        value={moldData.cost}
                        onChange={(e) => handleMoldDataChange("cost", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="refundableQuantity">可退模具數量</Label>
                      <Input
                        id="refundableQuantity"
                        type="number"
                        value={moldData.refundableQuantity}
                        onChange={(e) =>
                          handleMoldDataChange("refundableQuantity", Number.parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="returnedDate">退回日期</Label>
                      <Input
                        id="returnedDate"
                        type="date"
                        value={moldData.returnedDate || ""}
                        onChange={(e) => handleMoldDataChange("returnedDate", e.target.value)}
                        disabled={moldData.status !== "returned"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expectedLifespan">預期壽命 (小時)</Label>
                      <Input
                        id="expectedLifespan"
                        type="number"
                        value={moldData.expectedLifespan}
                        onChange={(e) => handleMoldDataChange("expectedLifespan", Number.parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxCycleCount">最大循環次數</Label>
                      <Input
                        id="maxCycleCount"
                        type="number"
                        value={moldData.maxCycleCount}
                        onChange={(e) => handleMoldDataChange("maxCycleCount", Number.parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>當前循環次數: {moldData.currentCycleCount}</Label>
                      <span>{calculateLifespanPercentage()}% 已使用</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          calculateLifespanPercentage() > 80 ? "bg-red-500" : "bg-green-500"
                        }`}
                        style={{ width: `${calculateLifespanPercentage()}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">備註</Label>
                    <Textarea
                      id="notes"
                      value={moldData.notes}
                      onChange={(e) => handleMoldDataChange("notes", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 歷史記錄頁籤 */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>模具歷史記錄</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsHistoryDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> 新增記錄
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">日期</TableHead>
                    <TableHead className="w-[100px]">類型</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead className="w-[120px]">執行人員</TableHead>
                    <TableHead className="w-[100px]">費用</TableHead>
                    <TableHead className="w-[80px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moldData.historyRecords.length > 0 ? (
                    moldData.historyRecords
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              {getHistoryTypeIcon(record.type)}
                              <span>{getHistoryTypeLabel(record.type)}</span>
                            </div>
                          </TableCell>
                          <TableCell>{record.description}</TableCell>
                          <TableCell>{record.performedBy}</TableCell>
                          <TableCell>{record.cost ? `$${record.cost.toLocaleString()}` : "-"}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteHistoryRecord(record.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        無歷史記錄
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 維護記錄頁籤 */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>模具維護記錄</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsMaintenanceDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> 新增維護記錄
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">日期</TableHead>
                    <TableHead className="w-[100px]">類型</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead className="w-[100px]">費用</TableHead>
                    <TableHead className="w-[120px]">執行人員</TableHead>
                    <TableHead className="w-[100px]">結果</TableHead>
                    <TableHead className="w-[80px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moldData.maintenanceRecords.length > 0 ? (
                    moldData.maintenanceRecords
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>{getMaintenanceTypeLabel(record.type)}</TableCell>
                          <TableCell>{record.description}</TableCell>
                          <TableCell>${record.cost.toLocaleString()}</TableCell>
                          <TableCell>{record.performedBy}</TableCell>
                          <TableCell>{getMaintenanceResultLabel(record.result)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteMaintenanceRecord(record.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        無維護記錄
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 使用記錄頁籤 */}
        <TabsContent value="usage">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>模具使用記錄</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsUsageDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> 新增使用記錄
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">日期</TableHead>
                    <TableHead className="w-[120px]">訂單號碼</TableHead>
                    <TableHead className="w-[100px]">產品數量</TableHead>
                    <TableHead className="w-[100px]">循環次數</TableHead>
                    <TableHead className="w-[120px]">操作人員</TableHead>
                    <TableHead>備註</TableHead>
                    <TableHead className="w-[80px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moldData.usageRecords.length > 0 ? (
                    moldData.usageRecords
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>{record.orderNumber}</TableCell>
                          <TableCell>{record.productQuantity.toLocaleString()}</TableCell>
                          <TableCell>{record.cycleCount.toLocaleString()}</TableCell>
                          <TableCell>{record.operator}</TableCell>
                          <TableCell>{record.notes}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteUsageRecord(record.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        無使用記錄
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 歷史記錄對話框 */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新增歷史記錄</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="historyDate">日期</Label>
                <Input
                  id="historyDate"
                  type="date"
                  value={newHistoryRecord.date}
                  onChange={(e) => setNewHistoryRecord({ ...newHistoryRecord, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="historyType">類型</Label>
                <Select
                  value={newHistoryRecord.type}
                  onValueChange={(value) => setNewHistoryRecord({ ...newHistoryRecord, type: value })}
                >
                  <SelectTrigger id="historyType">
                    <SelectValue placeholder="選擇類型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="creation">建立</SelectItem>
                    <SelectItem value="modification">修改</SelectItem>
                    <SelectItem value="maintenance">維護</SelectItem>
                    <SelectItem value="usage">使用</SelectItem>
                    <SelectItem value="return">退回</SelectItem>
                    <SelectItem value="retirement">報廢</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="historyDescription">描述</Label>
              <Textarea
                id="historyDescription"
                value={newHistoryRecord.description}
                onChange={(e) => setNewHistoryRecord({ ...newHistoryRecord, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="historyPerformedBy">執行人員</Label>
                <Input
                  id="historyPerformedBy"
                  value={newHistoryRecord.performedBy}
                  onChange={(e) => setNewHistoryRecord({ ...newHistoryRecord, performedBy: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="historyCost">費用 (選填)</Label>
                <Input
                  id="historyCost"
                  type="number"
                  value={newHistoryRecord.cost || ""}
                  onChange={(e) =>
                    setNewHistoryRecord({ ...newHistoryRecord, cost: Number.parseFloat(e.target.value) || undefined })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsHistoryDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddHistoryRecord}>新增</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 維護記錄對話框 */}
      <Dialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新增維護記錄</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maintenanceDate">日期</Label>
                <Input
                  id="maintenanceDate"
                  type="date"
                  value={newMaintenanceRecord.date}
                  onChange={(e) => setNewMaintenanceRecord({ ...newMaintenanceRecord, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenanceType">類型</Label>
                <Select
                  value={newMaintenanceRecord.type}
                  onValueChange={(value) => setNewMaintenanceRecord({ ...newMaintenanceRecord, type: value })}
                >
                  <SelectTrigger id="maintenanceType">
                    <SelectValue placeholder="選擇類型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">定期維護</SelectItem>
                    <SelectItem value="repair">修復</SelectItem>
                    <SelectItem value="modification">修改</SelectItem>
                    <SelectItem value="inspection">檢查</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenanceDescription">描述</Label>
              <Textarea
                id="maintenanceDescription"
                value={newMaintenanceRecord.description}
                onChange={(e) => setNewMaintenanceRecord({ ...newMaintenanceRecord, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maintenanceCost">費用</Label>
                <Input
                  id="maintenanceCost"
                  type="number"
                  value={newMaintenanceRecord.cost || ""}
                  onChange={(e) =>
                    setNewMaintenanceRecord({ ...newMaintenanceRecord, cost: Number.parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenancePerformedBy">執行人員</Label>
                <Input
                  id="maintenancePerformedBy"
                  value={newMaintenanceRecord.performedBy}
                  onChange={(e) => setNewMaintenanceRecord({ ...newMaintenanceRecord, performedBy: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenanceResult">結果</Label>
              <Select
                value={newMaintenanceRecord.result}
                onValueChange={(value) => setNewMaintenanceRecord({ ...newMaintenanceRecord, result: value })}
              >
                <SelectTrigger id="maintenanceResult">
                  <SelectValue placeholder="選擇結果" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passed">通過</SelectItem>
                  <SelectItem value="failed">未通過</SelectItem>
                  <SelectItem value="pending">待定</SelectItem>
                  <SelectItem value="completed">完成</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsMaintenanceDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddMaintenanceRecord}>新增</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 使用記錄對話框 */}
      <Dialog open={isUsageDialogOpen} onOpenChange={setIsUsageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新增使用記錄</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usageDate">日期</Label>
                <Input
                  id="usageDate"
                  type="date"
                  value={newUsageRecord.date}
                  onChange={(e) => setNewUsageRecord({ ...newUsageRecord, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usageOrderNumber">訂單號碼</Label>
                <Input
                  id="usageOrderNumber"
                  value={newUsageRecord.orderNumber}
                  onChange={(e) => setNewUsageRecord({ ...newUsageRecord, orderNumber: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usageProductQuantity">產品數量</Label>
                <Input
                  id="usageProductQuantity"
                  type="number"
                  value={newUsageRecord.productQuantity || ""}
                  onChange={(e) =>
                    setNewUsageRecord({ ...newUsageRecord, productQuantity: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usageCycleCount">循環次數</Label>
                <Input
                  id="usageCycleCount"
                  type="number"
                  value={newUsageRecord.cycleCount || ""}
                  onChange={(e) =>
                    setNewUsageRecord({ ...newUsageRecord, cycleCount: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="usageOperator">操作人員</Label>
              <Input
                id="usageOperator"
                value={newUsageRecord.operator}
                onChange={(e) => setNewUsageRecord({ ...newUsageRecord, operator: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usageNotes">備註</Label>
              <Textarea
                id="usageNotes"
                value={newUsageRecord.notes || ""}
                onChange={(e) => setNewUsageRecord({ ...newUsageRecord, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsUsageDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddUsageRecord}>新增</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
