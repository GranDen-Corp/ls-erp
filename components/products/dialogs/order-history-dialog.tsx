"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { OrderHistoryRecord } from "@/types/product-form-types"

interface OrderHistoryDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  newOrderHistory: OrderHistoryRecord
  setNewOrderHistory: (record: OrderHistoryRecord) => void
  onAddOrderHistory: () => void
}

export function OrderHistoryDialog({
  isOpen,
  onOpenChange,
  newOrderHistory,
  setNewOrderHistory,
  onAddOrderHistory,
}: OrderHistoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加訂單記錄</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="orderNumber">訂單號碼</Label>
            <Input
              id="orderNumber"
              value={newOrderHistory.orderNumber}
              onChange={(e) => setNewOrderHistory({ ...newOrderHistory, orderNumber: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orderQuantity">訂單數量</Label>
            <Input
              id="orderQuantity"
              type="number"
              value={newOrderHistory.quantity}
              onChange={(e) =>
                setNewOrderHistory({ ...newOrderHistory, quantity: Number.parseInt(e.target.value) || 0 })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" onClick={onAddOrderHistory}>
            新增訂單記錄
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
