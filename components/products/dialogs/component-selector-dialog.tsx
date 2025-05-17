"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Search } from "lucide-react"
import type { Product } from "@/types/product-form-types"

interface ComponentSelectorDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  componentSearchTerm: string
  setComponentSearchTerm: (term: string) => void
  availableComponents: Product[]
  selectedComponentIds: string[]
  toggleComponentSelection: (component: Product) => void
  confirmComponentSelection: () => void
  loadAvailableComponents: () => void
  loadingComponents: boolean
}

export function ComponentSelectorDialog({
  isOpen,
  onOpenChange,
  componentSearchTerm,
  setComponentSearchTerm,
  availableComponents,
  selectedComponentIds,
  toggleComponentSelection,
  confirmComponentSelection,
  loadAvailableComponents,
  loadingComponents,
}: ComponentSelectorDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>選擇組件產品</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="搜尋產品編號或名稱..."
              value={componentSearchTerm}
              onChange={(e) => setComponentSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="button" onClick={loadAvailableComponents} disabled={loadingComponents}>
              {loadingComponents ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          <ScrollArea className="h-[300px] border rounded-md p-2">
            {loadingComponents ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : availableComponents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">沒有找到符合條件的產品</div>
            ) : (
              <div className="space-y-2">
                {availableComponents.map((component) => (
                  <div
                    key={component.part_no}
                    className={`flex items-center justify-between p-2 rounded-md ${
                      selectedComponentIds.includes(component.part_no) ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{component.part_no}</div>
                      <div className="text-sm text-gray-500">{component.component_name}</div>
                    </div>
                    <Checkbox
                      checked={selectedComponentIds.includes(component.part_no)}
                      onCheckedChange={() => toggleComponentSelection(component)}
                    />
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" onClick={confirmComponentSelection} disabled={selectedComponentIds.length === 0}>
            確認選擇 ({selectedComponentIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
