"use client"

import { useState } from "react"
import { Check, ChevronDown, Eye, EyeOff, RotateCcw, Settings, SortAsc, SortDesc } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export interface ColumnOption {
  id: string
  label: string
  visible: boolean
  sortable: boolean
}

export interface SortOption {
  field: string
  direction: "asc" | "desc"
}

interface ColumnDisplayControlProps {
  columns: ColumnOption[]
  onColumnChange: (columns: ColumnOption[]) => void
  sortOption: SortOption
  onSortChange: (sort: SortOption) => void
  className?: string
}

export function ColumnDisplayControl({
  columns,
  onColumnChange,
  sortOption,
  onSortChange,
  className,
}: ColumnDisplayControlProps) {
  const [open, setOpen] = useState(false)

  const visibleColumnsCount = columns.filter((col) => col.visible).length
  const sortableColumns = columns.filter((col) => col.sortable)

  const handleToggleColumn = (id: string) => {
    // Prevent hiding all columns
    if (id === columns.find((col) => col.visible)?.id && visibleColumnsCount === 1) {
      return
    }

    const updatedColumns = columns.map((col) => (col.id === id ? { ...col, visible: !col.visible } : col))
    onColumnChange(updatedColumns)
  }

  const handleResetColumns = () => {
    const resetColumns = columns.map((col) => ({ ...col, visible: true }))
    onColumnChange(resetColumns)
  }

  const handleSortFieldChange = (field: string) => {
    onSortChange({ ...sortOption, field })
  }

  const handleSortDirectionToggle = () => {
    onSortChange({
      ...sortOption,
      direction: sortOption.direction === "asc" ? "desc" : "asc",
    })
  }

  const currentSortColumn = columns.find((col) => col.id === sortOption.field)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-8 gap-1 border-dashed", className)}>
          <Settings className="h-3.5 w-3.5" />
          <span className="hidden sm:inline-block">顯示欄位</span>
          {visibleColumnsCount < columns.length && (
            <Badge variant="secondary" className="ml-1 rounded-sm px-1 font-normal lg:hidden">
              {visibleColumnsCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[220px] p-0">
        <div className="p-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">顯示欄位</p>
            <Button onClick={handleResetColumns} variant="ghost" size="sm" className="h-8 px-2 text-xs">
              <RotateCcw className="mr-1 h-3 w-3" />
              重置
            </Button>
          </div>
        </div>
        <Separator />
        <div className="max-h-[300px] overflow-auto">
          <div className="grid gap-1 p-2">
            {columns.map((column) => (
              <div key={column.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleColumn(column.id)}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md border text-xs",
                      column.visible
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted bg-transparent hover:bg-muted/50",
                    )}
                  >
                    {column.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                  <span className="text-sm">{column.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Separator />
        <div className="p-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">排序</p>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 justify-between">
                    {currentSortColumn?.label || "選擇欄位"}
                    <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[180px]">
                  {sortableColumns.map((column) => (
                    <DropdownMenuItem
                      key={column.id}
                      onClick={() => handleSortFieldChange(column.id)}
                      className="flex items-center justify-between"
                    >
                      {column.label}
                      {sortOption.field === column.id && <Check className="h-3.5 w-3.5" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className="w-9 p-0" onClick={handleSortDirectionToggle}>
                {sortOption.direction === "asc" ? (
                  <SortAsc className="h-3.5 w-3.5" />
                ) : (
                  <SortDesc className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
        <Separator />
        <div className="p-2">
          <p className="text-xs text-muted-foreground">
            目前顯示 {visibleColumnsCount} 個欄位，
            {sortOption.direction === "asc" ? "升序" : "降序"}排序 {currentSortColumn?.label || "無"}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
