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
import { ArrowDownUp, Edit, Plus, Save, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// 模擬訂單狀態數據
const initialOrderStatuses = [
  { id: "1", name: "待確認", color: "#f59e0b", isDefault: true, isActive: true },
  { id: "2", name: "進行中", color: "#3b82f6", isDefault: false, isActive: true },
  { id: "3", name: "驗貨完成", color: "#10b981", isDefault: false, isActive: true },
  { id: "4", name: "已出貨", color: "#8b5cf6", isDefault: false, isActive: true },
  { id: "5", name: "待收款", color: "#ec4899", isDefault: false, isActive: true },
  { id: "6", name: "結案", color: "#6b7280", isDefault: false, isActive: true },
]

interface OrderStatus {
  id: string
  name: string
  color: string
  isDefault: boolean
  isActive: boolean
}

interface SortableItemProps {
  id: string
  status: OrderStatus
  onEdit: (status: OrderStatus) => void
  onToggleActive: (id: string, isActive: boolean) => void
  onDelete: (id: string) => void
}

function SortableItem({ id, status, onEdit, onToggleActive, onDelete }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TableCell>
        <ArrowDownUp className="h-4 w-4 cursor-move" />
      </TableCell>
      <TableCell>{status.name}</TableCell>
      <TableCell>
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full mr-2" style={{ backgroundColor: status.color }} />
          {status.color}
        </div>
      </TableCell>
      <TableCell>{status.isDefault ? <Badge variant="outline">預設</Badge> : null}</TableCell>
      <TableCell>
        <Switch checked={status.isActive} onCheckedChange={(checked) => onToggleActive(status.id, checked)} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(status)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(status.id)} disabled={status.isDefault}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export function OrderStatusSettings() {
  const [statuses, setStatuses] = useState<OrderStatus[]>(initialOrderStatuses)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<OrderStatus | null>(null)
  const [isNewStatus, setIsNewStatus] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setStatuses((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleAddStatus = () => {
    setCurrentStatus({
      id: `${Date.now()}`,
      name: "",
      color: "#000000",
      isDefault: false,
      isActive: true,
    })
    setIsNewStatus(true)
    setIsDialogOpen(true)
  }

  const handleEditStatus = (status: OrderStatus) => {
    setCurrentStatus(status)
    setIsNewStatus(false)
    setIsDialogOpen(true)
  }

  const handleToggleActive = (id: string, isActive: boolean) => {
    setStatuses(statuses.map((status) => (status.id === id ? { ...status, isActive } : status)))
  }

  const handleDeleteStatus = (id: string) => {
    setStatuses(statuses.filter((status) => status.id !== id))
  }

  const handleSaveStatus = () => {
    if (!currentStatus) return

    if (isNewStatus) {
      setStatuses([...statuses, currentStatus])
    } else {
      setStatuses(statuses.map((status) => (status.id === currentStatus.id ? currentStatus : status)))
    }

    setIsDialogOpen(false)
  }

  const handleSetDefault = (id: string) => {
    setStatuses(
      statuses.map((status) => ({
        ...status,
        isDefault: status.id === id,
      })),
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-medium">訂單狀態列表</h3>
          <p className="text-sm text-muted-foreground">拖動項目可調整狀態順序，這將影響訂單流程</p>
        </div>
        <Button onClick={handleAddStatus}>
          <Plus className="mr-2 h-4 w-4" />
          新增狀態
        </Button>
      </div>

      <div className="rounded-md border">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>狀態名稱</TableHead>
                <TableHead>顏色</TableHead>
                <TableHead>預設</TableHead>
                <TableHead>啟用</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext items={statuses.map((status) => status.id)} strategy={verticalListSortingStrategy}>
                {statuses.map((status) => (
                  <SortableItem
                    key={status.id}
                    id={status.id}
                    status={status}
                    onEdit={handleEditStatus}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDeleteStatus}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNewStatus ? "新增訂單狀態" : "編輯訂單狀態"}</DialogTitle>
            <DialogDescription>{isNewStatus ? "新增一個訂單狀態到系統中" : "編輯現有的訂單狀態"}</DialogDescription>
          </DialogHeader>

          {currentStatus && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">狀態名稱</Label>
                <Input
                  id="name"
                  value={currentStatus.name}
                  onChange={(e) =>
                    setCurrentStatus({
                      ...currentStatus,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="color">顏色</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={currentStatus.color}
                    className="w-16 h-10"
                    onChange={(e) =>
                      setCurrentStatus({
                        ...currentStatus,
                        color: e.target.value,
                      })
                    }
                  />
                  <Input
                    value={currentStatus.color}
                    onChange={(e) =>
                      setCurrentStatus({
                        ...currentStatus,
                        color: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={currentStatus.isDefault}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      // 如果設為預設，其他狀態都不是預設
                      handleSetDefault(currentStatus.id)
                    }
                    setCurrentStatus({
                      ...currentStatus,
                      isDefault: checked,
                    })
                  }}
                />
                <Label htmlFor="isDefault">設為預設狀態</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={currentStatus.isActive}
                  onCheckedChange={(checked) =>
                    setCurrentStatus({
                      ...currentStatus,
                      isActive: checked,
                    })
                  }
                />
                <Label htmlFor="isActive">啟用此狀態</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveStatus}>
              <Save className="mr-2 h-4 w-4" />
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
