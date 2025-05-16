"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface ProductOption {
  value: string
  label: string
  description?: string
  isAssembly?: boolean
  price?: number
  priceLabel?: string
  data?: any
}

interface ProductComboboxProps {
  options: ProductOption[]
  value: string
  onValueChange: (value: string, data?: any) => void
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
}

export function ProductCombobox({
  options,
  value,
  onValueChange,
  placeholder = "選擇產品...",
  emptyMessage = "找不到產品",
  disabled = false,
  className,
}: ProductComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // 獲取當前選中的選項標籤
  const selectedOption = React.useMemo(() => {
    return options.find((option) => option.value === value)
  }, [options, value])

  // 過濾選項
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options

    const lowerQuery = searchQuery.toLowerCase()
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(lowerQuery) ||
        option.value.toLowerCase().includes(lowerQuery) ||
        (option.description && option.description.toLowerCase().includes(lowerQuery)),
    )
  }, [options, searchQuery])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {value ? selectedOption?.label || value : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder="搜尋產品..." value={searchQuery} onValueChange={setSearchQuery} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onValueChange(option.value, option.data)
                    setSearchQuery("")
                    setOpen(false)
                  }}
                  className="flex items-start py-2"
                >
                  <div className="flex items-center mr-2">
                    <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center">
                      <span className="font-medium">{option.value}</span>
                      {option.isAssembly && (
                        <Badge className="ml-2 bg-purple-500 text-white">
                          <Layers className="h-3 w-3 mr-1" />
                          組件
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground truncate">{option.label}</span>
                    {option.price !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        前次單價: {option.priceLabel || `${option.price} USD`}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
