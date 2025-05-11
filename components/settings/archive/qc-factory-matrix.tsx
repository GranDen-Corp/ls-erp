"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Edit, Factory, Plus, Save, Trash } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

// 模擬品管人員數據
const initialQcStaff = [
  {
    id: "1",
    name: "林品管",
    email: "lin@lstrading.com",
    phone: "0912-345-678",
    factories: ["1", "2", "3"], // 工廠ID
  },
  {
    id: "2",
    name: "黃品管",
    email: "huang@lstrading.com",
    phone: "0923-456-789",
    factories: ["4", "5"],
  },
  {
    id: "3",
    name: "劉品管",
    email: "liu@lstrading.com",
    phone: "0934-567-890",
    factories: ["1", "4"],
  },
]

// 模擬工廠數據
const factories = [
  { id: "1", name: "深圳電子廠", code: "SZE" },
  { id: "2", name: "上海科技廠", code: "SHT" },
  { id: "3", name: "東莞工業廠", code: "DGI" },
  { id: "4", name: "廣州製造廠", code: "GZM" },
  { id: "5", name: "蘇州電子廠", code: "SZE" },
]

interface QcStaff {
  id: string
  name: string
  email: string
  phone: string
  factories: string[]
}

export function QcFactoryMatrix() {
  const [qcStaff, setQcStaff] = useState<QcStaff[]>(initialQcStaff)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFactoryDialogOpen, setIsFactoryDialogOpen] = useState(false)
  const [currentStaff, setCurrentStaff] = useState<QcStaff | null>(null)
  const [isNewStaff, setIsNewStaff] = useState(false)

  const handleAddStaff = () => {
    setCurrentStaff({
      id: `${Date.now()}`,
      name: "",
      email: "",
      phone: "",
      factories: [],
    })
    setIsNewStaff(true)
    setIsDialogOpen(true)
  }

  const handleEditStaff = (staff: QcStaff) => {
    setCurrentStaff(staff)
    setIsNewStaff(false)
    setIsDialogOpen(true)
  }

  const handleEditFactories = (staff: QcStaff) => {
    setCurrentStaff(staff)
    setIsFactoryDialogOpen(true)
  }

  const handleDeleteStaff = (id: string) => {
    setQcStaff(qcStaff.filter((staff) => staff.id !== id))
  }

  const handleSaveStaff = () => {
    if (!currentStaff) return

    if (isNewStaff) {
      setQcStaff([...qcStaff, currentStaff])
    } else {
      setQcStaff(qcStaff.map((staff) => (staff.id === currentStaff.id ? currentStaff : staff)))
    }

    setIsDialogOpen(false)
  }

  const handleSaveFactories = () => {
    if (!currentStaff) return

    setQcStaff(qcStaff.map((staff) => (staff.id === currentStaff.id ? currentStaff : staff)))

    setIsFactoryDialogOpen(false)
  }

  const handleToggleFactory = (factoryId: string) => {
    if (!currentStaff) return

    const newFactories = currentStaff.factories.includes(factoryId)
      ? currentStaff.factories.filter((id) => id !== factoryId)
      : [...currentStaff.factories, factoryId]

    setCurrentStaff({
      ...currentStaff,
      factories: newFactories,
    })
  }

  const getFactoryNames = (factoryIds: string[]) => {
    return factoryIds
      .map((id) => {
        const factory = factories.find((f) => f.id === id)
        return factory ? factory.name : id
      })
      .join(", ")
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-medium">品管工廠對應</h3>
          <p className="text-sm text-muted-foreground">設定品管人員負責的工廠（一對多關係）</p>
        </div>
        <Button onClick={handleAddStaff}>
          <Plus className="mr-2 h-4 w-4" />
          新增品管人員
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>姓名</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>電話</TableHead>
              <TableHead>負責工廠</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {qcStaff.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell>{staff.name}</TableCell>
                <TableCell>{staff.email}</TableCell>
                <TableCell>{staff.phone}</TableCell>
                <TableCell>
                  {staff.factories.length > 0 ? (
                    getFactoryNames(staff.factories)
                  ) : (
                    <span className="text-muted-foreground">未指派</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditFactories(staff)}>
                      <Factory className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditStaff(staff)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteStaff(staff.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {qcStaff.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Factory className="h-8 w-8 mb-2" />
                    <p>尚未有品管人員</p>
                    <Button variant="outline" className="mt-2" onClick={handleAddStaff}>
                      <Plus className="mr-2 h-4 w-4" />
                      新增品管人員
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 新增/編輯品管人員對話框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNewStaff ? "新增品管人員" : "編輯品管人員"}</DialogTitle>
            <DialogDescription>{isNewStaff ? "新增一個品管人員到系統中" : "編輯現有的品管人員"}</DialogDescription>
          </DialogHeader>

          {currentStaff && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={currentStaff.name}
                  onChange={(e) =>
                    setCurrentStaff({
                      ...currentStaff,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={currentStaff.email}
                  onChange={(e) =>
                    setCurrentStaff({
                      ...currentStaff,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">電話</Label>
                <Input
                  id="phone"
                  value={currentStaff.phone}
                  onChange={(e) =>
                    setCurrentStaff({
                      ...currentStaff,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveStaff}>
              <Save className="mr-2 h-4 w-4" />
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 編輯工廠對話框 */}
      <Dialog open={isFactoryDialogOpen} onOpenChange={setIsFactoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯負責工廠</DialogTitle>
            <DialogDescription>{currentStaff && `設定 ${currentStaff.name} 負責的工廠`}</DialogDescription>
          </DialogHeader>

          {currentStaff && (
            <Card>
              <CardHeader>
                <CardTitle>工廠列表</CardTitle>
                <CardDescription>選擇 {currentStaff.name} 負責的工廠</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {factories.map((factory) => (
                    <div key={factory.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`factory-${factory.id}`}
                        checked={currentStaff.factories.includes(factory.id)}
                        onCheckedChange={() => handleToggleFactory(factory.id)}
                      />
                      <Label htmlFor={`factory-${factory.id}`}>
                        {factory.name} ({factory.code})
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFactoryDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveFactories}>
              <Save className="mr-2 h-4 w-4" />
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
