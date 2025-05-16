"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface CustomerOption {
  value: string
  label: string
  data?: any
}

interface CustomerComboboxProps {
  options: CustomerOption[]
  value: string
  onValueChange: (value: string, data?: any) => void
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
}

export function CustomerCombobox({
  options,
  value,
  onValueChange,
  placeholder = "選擇客戶...",
  emptyMessage = "找不到客戶",
  disabled = false,
  className,
}: CustomerComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  // 處理點擊外部關閉下拉選單
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // 簡化版本 - 直接顯示所有選項，不進行複雜的篩選
  const filteredOptions = searchQuery
    ? options.filter(
        (option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          option.value.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : options

  // 獲取當前選中的選項
  const selectedOption = options.find((option) => option.value === value)

  // 調試信息
  React.useEffect(() => {
    console.log("CustomerCombobox 選項數量:", options.length)
    console.log("CustomerCombobox 選項範例:", options.slice(0, 3))
    console.log("CustomerCombobox 當前值:", value)
    console.log("CustomerCombobox 選中選項:", selectedOption)
    console.log("CustomerCombobox 下拉選單狀態:", open ? "開啟" : "關閉")
  }, [options, value, selectedOption, open])

  return (
    <div className="relative w-full">
      {/* 自定義按鈕 */}
      <Button
        ref={buttonRef}
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn("w-full justify-between", disabled ? "opacity-50 cursor-not-allowed" : "", className)}
        disabled={disabled}
        type="button"
        onClick={() => {
          console.log("CustomerCombobox 按鈕被點擊")
          setOpen(!open)
        }}
      >
        {value && selectedOption ? (
          <span className="text-left truncate">{selectedOption.label}</span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {/* 自定義下拉選單 */}
      {open && (
        <div
          ref={dropdownRef}
          className="absolute z-[9999] w-full bg-white rounded-md border border-gray-200 shadow-lg mt-1 overflow-hidden"
          style={{ maxHeight: "300px", overflowY: "auto" }}
        >
          {/* 搜尋框 */}
          <div className="p-2 border-b relative">
            <Input
              placeholder="搜尋客戶..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
              autoFocus
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            {searchQuery && (
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* 選項列表 */}
          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-3 text-sm text-gray-500 text-center">{emptyMessage}</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "px-2 py-2 text-sm flex items-center cursor-pointer hover:bg-gray-100",
                    value === option.value ? "bg-gray-100" : "",
                  )}
                  onClick={() => {
                    console.log("選擇客戶:", option.value, option.label)
                    onValueChange(option.value, option.data)
                    setOpen(false)
                    setSearchQuery("")
                  }}
                >
                  <div className="w-5 h-5 mr-2 flex items-center justify-center">
                    {value === option.value && <Check className="h-4 w-4" />}
                  </div>
                  <span>{option.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 調試信息 */}
      {process.env.NODE_ENV !== "production" && (
        <div className="mt-2 text-xs text-gray-500">
          <div>選項數量: {options.length}</div>
          <div>當前選中: {selectedOption ? selectedOption.label : "無"}</div>
          <div>下拉狀態: {open ? "開啟" : "關閉"}</div>
        </div>
      )}
    </div>
  )
}
