"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Download, Filter, RefreshCw, Upload, ArrowUpDown, Eye, Loader2 } from "lucide-react"
import { supabaseClient } from "@/lib/supabase-client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 通用資料類型
type DataItem = Record<string, any>

// 欄位定義類型
type ColumnDef = {
  key: string
  title: string
  render?: (value: any, item: DataItem) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string
}

// 資料表屬性類型
interface DataTableProps {
  title: string
  tableName: string
  columns: ColumnDef[]
  detailTabs?: {
    id: string
    label: string
    fields: { label: string; key: string; render?: (value: any) => React.ReactNode }[]
  }[]
  filterOptions?: {
    field: string
    label: string
    options: { value: string; label: string }[]
  }[]
}

export function DataTable({ title, tableName, columns, detailTabs = [], filterOptions = [] }: DataTableProps) {
  const [data, setData] = useState<DataItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(detailTabs.length > 0 ? detailTabs[0].id : "")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  // 匯出相關狀態
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<string>("csv")
  const [exportOption, setExportOption] = useState<string>("visible")

  // 匯入相關狀態
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importFormat, setImportFormat] = useState<string>("csv")

  // 從Supabase獲取資料
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabaseClient.from(tableName).select("*")

      if (error) {
        throw new Error(`獲取資料時出錯: ${error.message}`)
      }

      setData(data || [])
    } catch (err) {
      console.error(`獲取${title}時出錯:`, err)
      setError(err instanceof Error ? err.message : `獲取${title}時出錯`)
    } finally {
      setIsLoading(false)
    }
  }

  // 處理排序
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc"

    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === "asc" ? "desc" : "asc"
    }

    setSortConfig({ key, direction })
  }

  // 排序資料
  const sortedData = [...data]
  if (sortConfig) {
    sortedData.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sortConfig.direction === "asc" ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1
    })
  }

  // 過濾資料
  const filteredData = sortedData.filter((item) => {
    // 先檢查是否符合搜尋條件
    const matchesSearch = Object.values(item).some(
      (value) =>
        value !== null && value !== undefined && value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (!matchesSearch) return false

    // 再檢查是否符合篩選條件
    return Object.entries(activeFilters).every(([field, value]) => {
      if (!value) return true
      return item[field] === value
    })
  })

  // 處理查看詳情
  const handleViewDetails = (item: DataItem) => {
    setSelectedItem(item)
    setIsDetailDialogOpen(true)
  }

  // 處理匯出功能
  const handleExport = () => {
    // 這裡實現匯出功能
    console.log(`匯出${title}，格式:`, exportFormat, "選項:", exportOption)
    setIsExportDialogOpen(false)
  }

  // 處理匯入功能
  const handleImport = () => {
    // 這裡實現匯入功能
    console.log(`匯入${title}，格式:`, importFormat)
    setIsImportDialogOpen(false)
  }

  // 渲染詳情對話框
  const renderDetailDialog = () => {
    if (!selectedItem) return null

    return (
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{title}詳細資料</DialogTitle>
            <DialogDescription>{columns[0] && selectedItem[columns[0].key]}</DialogDescription>
          </DialogHeader>

          {detailTabs.length > 0 ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${detailTabs.length}, 1fr)` }}>
                {detailTabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <ScrollArea className="h-[60vh] pr-4">
                {detailTabs.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {tab.fields.map((field, index) => (
                        <div key={index} className="space-y-2">
                          <p className="text-sm font-medium">{field.label}</p>
                          <div>
                            {field.render
                              ? field.render(selectedItem[field.key])
                              : selectedItem[field.key] !== undefined && selectedItem[field.key] !== null
                                ? String(selectedItem[field.key])
                                : "-"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </ScrollArea>
            </Tabs>
          ) : (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="grid grid-cols-2 gap-4">
                {columns.map((column, index) => (
                  <div key={index} className="space-y-2">
                    <p className="text-sm font-medium">{column.title}</p>
                    <div>
                      {column.render
                        ? column.render(selectedItem[column.key], selectedItem)
                        : selectedItem[column.key] !== undefined && selectedItem[column.key] !== null
                          ? String(selectedItem[column.key])
                          : "-"}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  // 渲染匯出對話框
  const renderExportDialog = () => {
    return (
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>匯出{title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">選擇匯出格式</h4>
              <div className="flex space-x-2">
                <Button
                  variant={exportFormat === "csv" ? "default" : "outline"}
                  onClick={() => setExportFormat("csv")}
                  size="sm"
                >
                  CSV
                </Button>
                <Button
                  variant={exportFormat === "excel" ? "default" : "outline"}
                  onClick={() => setExportFormat("excel")}
                  size="sm"
                >
                  Excel
                </Button>
                <Button
                  variant={exportFormat === "json" ? "default" : "outline"}
                  onClick={() => setExportFormat("json")}
                  size="sm"
                >
                  JSON
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">選擇匯出內容</h4>
              <div className="flex flex-col space-y-2">
                <Button
                  variant={exportOption === "visible" ? "default" : "outline"}
                  onClick={() => setExportOption("visible")}
                  size="sm"
                  className="justify-start"
                >
                  目前顯示的資料
                </Button>
                <Button
                  variant={exportOption === "all" ? "default" : "outline"}
                  onClick={() => setExportOption("all")}
                  size="sm"
                  className="justify-start"
                >
                  全部資料
                </Button>
                <Button
                  variant={exportOption === "selected" ? "default" : "outline"}
                  onClick={() => setExportOption("selected")}
                  size="sm"
                  className="justify-start"
                >
                  選取的資料
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleExport}>匯出</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // 渲染匯入對話框
  const renderImportDialog = () => {
    return (
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>匯入{title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">選擇匯入格式</h4>
              <div className="flex space-x-2">
                <Button
                  variant={importFormat === "csv" ? "default" : "outline"}
                  onClick={() => setImportFormat("csv")}
                  size="sm"
                >
                  CSV
                </Button>
                <Button
                  variant={importFormat === "excel" ? "default" : "outline"}
                  onClick={() => setImportFormat("excel")}
                  size="sm"
                >
                  Excel
                </Button>
                <Button
                  variant={importFormat === "json" ? "default" : "outline"}
                  onClick={() => setImportFormat("json")}
                  size="sm"
                >
                  JSON
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">上傳檔案</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="mt-2">
                  <Button variant="outline" size="sm">
                    選擇檔案
                  </Button>
                </div>
                <p className="mt-2 text-xs text-gray-500">支援 .csv, .xlsx, .json 格式</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleImport}>匯入</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>載入中...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <p className="text-red-500">錯誤: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`搜尋${title}...`}
              className="w-[200px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filterOptions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>篩選條件</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filterOptions.map((filter) => (
                  <div key={filter.field} className="px-2 py-1.5">
                    <div className="text-sm mb-1">{filter.label}</div>
                    <Select
                      value={activeFilters[filter.field] || ""}
                      onValueChange={(value) => {
                        setActiveFilters((prev) => ({
                          ...prev,
                          [filter.field]: value,
                        }))
                      }}
                    >
                      <SelectTrigger className="w-full h-8">
                        <SelectValue placeholder="全部" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="non-empty-string">全部</SelectItem>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveFilters({})} className="justify-center text-center">
                  清除所有篩選
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button variant="outline" size="icon" onClick={() => fetchData()}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsExportDialogOpen(true)}>匯出資料</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)}>匯入資料</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={column.sortable ? "cursor-pointer select-none" : ""}
                    style={column.width ? { width: column.width } : {}}
                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  >
                    <div className="flex items-center">
                      {column.title}
                      {column.sortable && <ArrowUpDown className="ml-1 h-4 w-4" />}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center">
                    沒有找到符合條件的{title}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {column.render
                          ? column.render(item[column.key], item)
                          : item[column.key] !== undefined && item[column.key] !== null
                            ? String(item[column.key])
                            : "-"}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(item)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          共 {filteredData.length} 筆{title}
        </div>
      </CardFooter>

      {renderDetailDialog()}
      {renderExportDialog()}
      {renderImportDialog()}
    </Card>
  )
}
