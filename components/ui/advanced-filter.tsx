"use client"

import type React from "react"

import { useState } from "react"
import { Search, Filter, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export type FilterOption = {
  id: string
  label: string
  options?: { value: string; label: string }[]
  type: "select" | "text" | "date" | "number"
}

export type ColumnOption = {
  id: string
  label: string
  visible: boolean
  sortable?: boolean
}

export type SortOption = {
  field: string
  direction: "asc" | "desc"
}

type AdvancedFilterProps = {
  options: FilterOption[]
  onFilterChange: (filters: Record<string, any>) => void
  placeholder?: string
  // 新增的 props
  columnOptions?: ColumnOption[]
  onColumnChange?: (columns: ColumnOption[]) => void
  sortOptions?: SortOption
  onSortChange?: (sort: SortOption) => void
  showColumnControl?: boolean
}

export function AdvancedFilter({
  options,
  onFilterChange,
  placeholder = "搜尋...",
  columnOptions,
  onColumnChange,
  sortOptions,
  onSortChange,
  showColumnControl,
}: AdvancedFilterProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [columnSettings, setColumnSettings] = useState<ColumnOption[]>(columnOptions || [])
  const [sortSettings, setSortSettings] = useState<SortOption>(sortOptions || { field: "", direction: "asc" })

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    onFilterChange({ ...activeFilters, search: value })
  }

  const handleFilterChange = (id: string, value: any) => {
    const newFilters = { ...activeFilters }

    if (value === "" || value === undefined) {
      delete newFilters[id]
    } else {
      newFilters[id] = value
    }

    setActiveFilters(newFilters)
    onFilterChange({ ...newFilters, search: searchTerm })
  }

  const removeFilter = (id: string) => {
    const newFilters = { ...activeFilters }
    delete newFilters[id]
    setActiveFilters(newFilters)
    onFilterChange({ ...newFilters, search: searchTerm })
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    setSearchTerm("")
    onFilterChange({ search: "" })
  }

  const activeFilterCount = Object.keys(activeFilters).length

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder={placeholder} value={searchTerm} onChange={handleSearchChange} className="pl-8" />
        </div>
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              篩選
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 rounded-full px-1.5">
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">篩選條件</h4>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-auto p-0 text-sm text-muted-foreground"
                  >
                    清除全部
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {options.map((option) => (
                  <div key={option.id} className="grid gap-1">
                    <label htmlFor={option.id} className="text-sm font-medium">
                      {option.label}
                    </label>
                    {option.type === "select" ? (
                      <Select
                        value={activeFilters[option.id] || ""}
                        onValueChange={(value) => handleFilterChange(option.id, value)}
                      >
                        <SelectTrigger id={option.id}>
                          <SelectValue placeholder="選擇..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部</SelectItem>
                          {option.options?.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={option.id}
                        type={option.type}
                        value={activeFilters[option.id] || ""}
                        onChange={(e) => handleFilterChange(option.id, e.target.value)}
                        placeholder={`輸入${option.label}`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <Button className="w-full" onClick={() => setIsFilterOpen(false)}>
                套用篩選
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([id, value]) => {
            const option = options.find((opt) => opt.id === id)
            if (!option) return null

            let displayValue = value
            if (option.type === "select") {
              const optionItem = option.options?.find((opt) => opt.value === value)
              displayValue = optionItem?.label || value
            }

            return (
              <Card key={id} className="bg-muted/50">
                <CardContent className="flex items-center p-1 px-3 text-sm">
                  <span className="font-medium mr-1">{option.label}:</span>
                  <span className="mr-1">{displayValue}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeFilter(id)} className="h-auto p-0 ml-1">
                    <X className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
