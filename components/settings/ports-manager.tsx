"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import type { Port } from "@/types/port"
import { addPort, updatePort, deletePort } from "@/app/settings/port-actions"
import { toast } from "@/hooks/use-toast"

interface PortsManagerProps {
  ports: Port[]
}

export function PortsManager({ ports: initialPorts }: PortsManagerProps) {
  const [ports, setPorts] = useState<Port[]>(initialPorts)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentPort, setCurrentPort] = useState<Port | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    region: "",
    port_name_zh: "",
    port_name_en: "",
    un_locode: "",
    port_type: "主要到貨港",
  })

  const filteredPorts = ports.filter(
    (port) =>
      port.port_name_zh.toLowerCase().includes(searchTerm.toLowerCase()) ||
      port.port_name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      port.un_locode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      port.region.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddPort = async () => {
    setIsLoading(true)
    try {
      const result = await addPort(formData)
      if (result.success && result.data) {
        setPorts([...ports, result.data])
        setIsAddDialogOpen(false)
        resetForm()
        toast({
          title: "成功",
          description: "港口新增成功",
        })
      } else {
        toast({
          title: "錯誤",
          description: result.error || "新增港口失敗",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("新增港口失敗:", error)
      toast({
        title: "錯誤",
        description: "新增港口失敗",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePort = async () => {
    if (!currentPort) return

    setIsLoading(true)
    try {
      const result = await updatePort(currentPort.id, formData)
      if (result.success && result.data) {
        setPorts(ports.map((port) => (port.id === currentPort.id ? result.data! : port)))
        setIsEditDialogOpen(false)
        resetForm()
        toast({
          title: "成功",
          description: "港口更新成功",
        })
      } else {
        toast({
          title: "錯誤",
          description: result.error || "更新港口失敗",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("更新港口失敗:", error)
      toast({
        title: "錯誤",
        description: "更新港口失敗",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePort = async () => {
    if (!currentPort) return

    setIsLoading(true)
    try {
      const result = await deletePort(currentPort.id)
      if (result.success) {
        setPorts(ports.filter((port) => port.id !== currentPort.id))
        setIsDeleteDialogOpen(false)
        toast({
          title: "成功",
          description: "港口刪除成功",
        })
      } else {
        toast({
          title: "錯誤",
          description: result.error || "刪除港口失敗",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("刪除港口失敗:", error)
      toast({
        title: "錯誤",
        description: "刪除港口失敗",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = (port: Port) => {
    setCurrentPort(port)
    setFormData({
      region: port.region,
      port_name_zh: port.port_name_zh,
      port_name_en: port.port_name_en,
      un_locode: port.un_locode,
      port_type: port.port_type,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (port: Port) => {
    setCurrentPort(port)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      region: "",
      port_name_zh: "",
      port_name_en: "",
      un_locode: "",
      port_type: "主要到貨港",
    })
    setCurrentPort(null)
  }

  const getRegionColor = (region: string) => {
    const regionColors: Record<string, string> = {
      亞洲: "bg-blue-100 text-blue-800",
      歐洲: "bg-green-100 text-green-800",
      北美洲: "bg-purple-100 text-purple-800",
      南美洲: "bg-yellow-100 text-yellow-800",
      非洲: "bg-orange-100 text-orange-800",
      大洋洲: "bg-pink-100 text-pink-800",
    }

    return regionColors[region] || "bg-gray-100 text-gray-800"
  }

  const isFormValid = () => {
    return formData.region && formData.port_name_zh && formData.port_name_en && formData.un_locode && formData.port_type
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜尋港口..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> 新增港口
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>地區</TableHead>
              <TableHead>港口名稱（中文）</TableHead>
              <TableHead>港口名稱（英文）</TableHead>
              <TableHead>UN/LOCODE</TableHead>
              <TableHead>類型</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPorts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  無符合條件的港口資料
                </TableCell>
              </TableRow>
            ) : (
              filteredPorts.map((port) => (
                <TableRow key={port.id}>
                  <TableCell>
                    <Badge className={getRegionColor(port.region)}>{port.region}</Badge>
                  </TableCell>
                  <TableCell>{port.port_name_zh}</TableCell>
                  <TableCell>{port.port_name_en}</TableCell>
                  <TableCell>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">{port.un_locode}</code>
                  </TableCell>
                  <TableCell>{port.port_type}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(port)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(port)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 新增港口對話框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增港口</DialogTitle>
            <DialogDescription>請填寫港口資料，所有欄位皆為必填。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region" className="text-right">
                地區
              </Label>
              <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="選擇地區" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="亞洲">亞洲</SelectItem>
                  <SelectItem value="歐洲">歐洲</SelectItem>
                  <SelectItem value="北美洲">北美洲</SelectItem>
                  <SelectItem value="南美洲">南美洲</SelectItem>
                  <SelectItem value="非洲">非洲</SelectItem>
                  <SelectItem value="大洋洲">大洋洲</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="port_name_zh" className="text-right">
                港口名稱（中文）
              </Label>
              <Input
                id="port_name_zh"
                value={formData.port_name_zh}
                onChange={(e) => setFormData({ ...formData, port_name_zh: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="port_name_en" className="text-right">
                港口名稱（英文）
              </Label>
              <Input
                id="port_name_en"
                value={formData.port_name_en}
                onChange={(e) => setFormData({ ...formData, port_name_en: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="un_locode" className="text-right">
                UN/LOCODE
              </Label>
              <Input
                id="un_locode"
                value={formData.un_locode}
                onChange={(e) => setFormData({ ...formData, un_locode: e.target.value.toUpperCase() })}
                className="col-span-3"
                placeholder="例如: CNSHA"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="port_type" className="text-right">
                類型
              </Label>
              <Select
                value={formData.port_type}
                onValueChange={(value) => setFormData({ ...formData, port_type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="選擇港口類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="主要到貨港">主要到貨港</SelectItem>
                  <SelectItem value="次要到貨港">次要到貨港</SelectItem>
                  <SelectItem value="轉運港">轉運港</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddPort} disabled={!isFormValid() || isLoading}>
              {isLoading ? "新增中..." : "新增"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 編輯港口對話框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯港口</DialogTitle>
            <DialogDescription>修改港口資料，所有欄位皆為必填。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-region" className="text-right">
                地區
              </Label>
              <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="選擇地區" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="亞洲">亞洲</SelectItem>
                  <SelectItem value="歐洲">歐洲</SelectItem>
                  <SelectItem value="北美洲">北美洲</SelectItem>
                  <SelectItem value="南美洲">南美洲</SelectItem>
                  <SelectItem value="非洲">非洲</SelectItem>
                  <SelectItem value="大洋洲">大洋洲</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-port_name_zh" className="text-right">
                港口名稱（中文）
              </Label>
              <Input
                id="edit-port_name_zh"
                value={formData.port_name_zh}
                onChange={(e) => setFormData({ ...formData, port_name_zh: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-port_name_en" className="text-right">
                港口名稱（英文）
              </Label>
              <Input
                id="edit-port_name_en"
                value={formData.port_name_en}
                onChange={(e) => setFormData({ ...formData, port_name_en: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-un_locode" className="text-right">
                UN/LOCODE
              </Label>
              <Input
                id="edit-un_locode"
                value={formData.un_locode}
                onChange={(e) => setFormData({ ...formData, un_locode: e.target.value.toUpperCase() })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-port_type" className="text-right">
                類型
              </Label>
              <Select
                value={formData.port_type}
                onValueChange={(value) => setFormData({ ...formData, port_type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="選擇港口類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="主要到貨港">主要到貨港</SelectItem>
                  <SelectItem value="次要到貨港">次要到貨港</SelectItem>
                  <SelectItem value="轉運港">轉運港</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdatePort} disabled={!isFormValid() || isLoading}>
              {isLoading ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 刪除港口確認對話框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              您確定要刪除 {currentPort?.port_name_zh} ({currentPort?.port_name_en}) 港口嗎？此操作無法復原。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeletePort} disabled={isLoading}>
              {isLoading ? "刪除中..." : "刪除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PortsManager
