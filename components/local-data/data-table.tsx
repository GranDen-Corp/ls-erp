"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Download,
  Filter,
  RefreshCw,
  Upload,
  ArrowUpDown,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import * as XLSX from "xlsx"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  hidden?: boolean
}

// 資料表屬性類型
interface DataTableProps {
  title: string
  tableName: string
  columns?: ColumnDef[]
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
  isLoading?: boolean
  showAllColumns?: boolean
  primaryKey?: string | string[] // 主鍵欄位，可以是單一欄位或複合鍵
  customQuery?: string // 自定義SQL查詢
  onDataFetched?: (data: DataItem[]) => void // 資料獲取後的回調
}

export function DataTable({
  title,
  tableName,
  columns = [],
  detailTabs = [],
  filterOptions = [],
  isLoading: externalLoading,
  showAllColumns = false,
  primaryKey,
  customQuery,
  onDataFetched,
}: DataTableProps) {
  const [data, setData] = useState<DataItem[]>([])
  const [allColumns, setAllColumns] = useState<ColumnDef[]>([])
  const [visibleColumns, setVisibleColumns] = useState<ColumnDef[]>(columns)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(externalLoading !== undefined ? externalLoading : true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(detailTabs.length > 0 ? detailTabs[0].id : "")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false)
  const [pageSize, setPageSize] = useState(20)
  const [currentPage, setCurrentPage] = useState(0)
  const [duplicateKeyWarnings, setDuplicateKeyWarnings] = useState<string[]>([])
  const [missingKeyWarnings, setMissingKeyWarnings] = useState<string[]>([])

  // 匯出相關狀態
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<string>("csv")
  const [exportOption, setExportOption] = useState<string>("visible")

  // 匯入相關狀態
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importFormat, setImportFormat] = useState<string>("csv")
  const [importFile, setImportFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 從Supabase獲取資料
  useEffect(() => {
    if (externalLoading !== undefined) {
      setIsLoading(externalLoading)
    } else {
      fetchData()
    }
  }, [externalLoading, customQuery])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setDuplicateKeyWarnings([])
      setMissingKeyWarnings([])

      const supabase = createClient()
      const query = supabase.from(tableName).select("*")

      // 如果有自定義查詢，使用自定義查詢
      if (customQuery) {
        const { data, error } = await supabase.rpc("execute_sql", { sql_query: customQuery })
        if (error) {
          throw new Error(`執行自定義查詢時出錯: ${error.message}`)
        }
        setData(data || [])
      } else {
        // 使用標準查詢
        const { data, error } = await query
        if (error) {
          throw new Error(`獲取資料時出錯: ${error.message}`)
        }
        setData(data || [])
      }

      // 檢查主鍵完整性
      if (primaryKey && data && data.length > 0) {
        checkPrimaryKeyIntegrity(data)
      }

      // 如果沒有提供欄位定義或需要顯示所有欄位，則從資料中提取欄位
      if (columns.length === 0 || showAllColumns) {
        if (data && data.length > 0) {
          const firstItem = data[0]
          const extractedColumns: ColumnDef[] = Object.keys(firstItem).map((key) => ({
            key,
            title: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            sortable: true,
          }))
          setAllColumns(extractedColumns)
          setVisibleColumns(extractedColumns)
        }
      } else {
        setAllColumns(columns)
        setVisibleColumns(columns.filter((col) => !col.hidden))
      }

      // 如果有回調函數，調用它
      if (onDataFetched && data) {
        onDataFetched(data)
      }
    } catch (err) {
      console.error(`獲取${title}時出錯:`, err)
      setError(err instanceof Error ? err.message : `獲取${title}時出錯`)
    } finally {
      setIsLoading(false)
    }
  }

  // 檢查主鍵完整性
  const checkPrimaryKeyIntegrity = (data: DataItem[]) => {
    const duplicateWarnings: string[] = []
    const missingWarnings: string[] = []

    // 檢查是否有主鍵
    if (!primaryKey) return

    // 將主鍵轉換為數組
    const keyFields = Array.isArray(primaryKey) ? primaryKey : [primaryKey]

    // 檢查是否有缺少主鍵的記錄
    data.forEach((item, index) => {
      const missingKeys = keyFields.filter((key) => item[key] === undefined || item[key] === null)
      if (missingKeys.length > 0) {
        missingWarnings.push(`記錄 #${index + 1} 缺少主鍵欄位: ${missingKeys.join(", ")}`)
      }
    })

    // 檢查是否有重複的主鍵
    const keyMap = new Map<string, number>()
    data.forEach((item, index) => {
      // 只檢查有完整主鍵的記錄
      if (keyFields.every((key) => item[key] !== undefined && item[key] !== null)) {
        // 創建複合鍵字符串
        const keyString = keyFields.map((key) => `${key}:${item[key]}`).join("|")

        if (keyMap.has(keyString)) {
          const prevIndex = keyMap.get(keyString)
          duplicateWarnings.push(`記錄 #${index + 1} 與記錄 #${prevIndex! + 1} 有相同的主鍵: ${keyString}`)
        } else {
          keyMap.set(keyString, index)
        }
      }
    })

    setDuplicateKeyWarnings(duplicateWarnings)
    setMissingKeyWarnings(missingWarnings)
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
      if (!value || value === "all") return true
      return item[field] === value
    })
  })

  // 分頁資料
  const paginatedData = filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
  const totalPages = Math.ceil(filteredData.length / pageSize)

  // 處理查看詳情
  const handleViewDetails = (item: DataItem) => {
    setSelectedItem(item)
    setIsDetailDialogOpen(true)
  }

  // 處理欄位顯示切換
  const toggleColumnVisibility = (key: string) => {
    setVisibleColumns((prev) => {
      const columnExists = prev.some((col) => col.key === key)

      if (columnExists) {
        return prev.filter((col) => col.key !== key)
      } else {
        const columnToAdd = allColumns.find((col) => col.key === key)
        if (columnToAdd) {
          return [...prev, columnToAdd]
        }
      }
      return prev
    })
  }

  // 處理匯出功能
  const handleExport = async () => {
    try {
      // 決定要匯出的資料
      let dataToExport = data
      if (exportOption === "visible") {
        dataToExport = filteredData
      } else if (exportOption === "selected" && selectedItem) {
        dataToExport = [selectedItem]
      }

      if (dataToExport.length === 0) {
        toast({
          title: "匯出失敗",
          description: "沒有資料可匯出",
          variant: "destructive",
        })
        return
      }

      // 根據選擇的格式匯出資料
      if (exportFormat === "csv") {
        exportToCSV(dataToExport, `${tableName}_export`)
      } else if (exportFormat === "excel") {
        exportToExcel(dataToExport, `${tableName}_export`)
      } else if (exportFormat === "json") {
        exportToJSON(dataToExport, `${tableName}_export`)
      }

      toast({
        title: "匯出成功",
        description: `已成功匯出 ${dataToExport.length} 筆資料`,
      })
    } catch (err) {
      console.error("匯出資料時出錯:", err)
      toast({
        title: "匯出失敗",
        description: err instanceof Error ? err.message : "匯出資料時發生錯誤",
        variant: "destructive",
      })
    } finally {
      setIsExportDialogOpen(false)
    }
  }

  // 匯出為CSV
  const exportToCSV = (data: DataItem[], filename: string) => {
    // 準備CSV內容
    const headers = visibleColumns.map((col) => col.title).join(",")
    const rows = data.map((item) => {
      return visibleColumns
        .map((col) => {
          const value = item[col.key]
          // 處理包含逗號的字串
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`
          }
          return value !== undefined && value !== null ? value : ""
        })
        .join(",")
    })
    const csvContent = [headers, ...rows].join("\n")

    // 創建Blob並下載
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 匯出為Excel
  const exportToExcel = (data: DataItem[], filename: string) => {
    // 準備Excel工作表資料
    const wsData = [
      visibleColumns.map((col) => col.title),
      ...data.map((item) =>
        visibleColumns.map((col) => (item[col.key] !== undefined && item[col.key] !== null ? item[col.key] : "")),
      ),
    ]

    // 創建工作表
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // 創建工作簿
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1")

    // 寫入檔案並下載
    XLSX.writeFile(wb, `${filename}.xlsx`)
  }

  // 匯出為JSON
  const exportToJSON = (data: DataItem[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}.json`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 處理檔案選擇
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0])
    }
  }

  // 處理匯入功能
  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: "匯入失敗",
        description: "請選擇要匯入的檔案",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      let importedData: DataItem[] = []

      // 根據檔案類型解析資料
      if (importFormat === "csv") {
        importedData = await parseCSV(importFile)
      } else if (importFormat === "excel") {
        importedData = await parseExcel(importFile)
      } else if (importFormat === "json") {
        importedData = await parseJSON(importFile)
      }

      if (importedData.length === 0) {
        throw new Error("匯入的檔案不包含有效資料")
      }

      // 將資料寫入Supabase
      const supabase = createClient()
      const { error } = await supabase.from(tableName).upsert(importedData)

      if (error) {
        throw new Error(`寫入資料時出錯: ${error.message}`)
      }

      // 重新載入資料
      await fetchData()

      toast({
        title: "匯入成功",
        description: `已成功匯入 ${importedData.length} 筆資料`,
      })
    } catch (err) {
      console.error("匯入資料時出錯:", err)
      toast({
        title: "匯入失敗",
        description: err instanceof Error ? err.message : "匯入資料時發生錯誤",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsImportDialogOpen(false)
      setImportFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // 解析CSV檔案
  const parseCSV = (file: File): Promise<DataItem[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split("\n")
          const headers = lines[0].split(",").map((h) => h.trim().replace(/^"(.*)"$/, "$1"))

          const result: DataItem[] = []
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue

            // 處理CSV中的引號和逗號
            const values: string[] = []
            let currentValue = ""
            let inQuotes = false

            for (let j = 0; j < lines[i].length; j++) {
              const char = lines[i][j]

              if (char === '"') {
                inQuotes = !inQuotes
              } else if (char === "," && !inQuotes) {
                values.push(currentValue.replace(/^"(.*)"$/, "$1"))
                currentValue = ""
              } else {
                currentValue += char
              }
            }
            values.push(currentValue.replace(/^"(.*)"$/, "$1"))

            const row: DataItem = {}
            for (let j = 0; j < headers.length; j++) {
              if (headers[j]) {
                row[headers[j]] = values[j] || null
              }
            }
            result.push(row)
          }

          resolve(result)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error("讀取檔案時出錯"))
      reader.readAsText(file)
    })
  }

  // 解析Excel檔案
  const parseExcel = (file: File): Promise<DataItem[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })

          // 假設我們只讀取第一個工作表
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]

          // 將工作表轉換為JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

          if (jsonData.length < 2) {
            throw new Error("Excel檔案格式不正確或沒有資料")
          }

          const headers = jsonData[0] as string[]
          const result: DataItem[] = []

          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[]
            const item: DataItem = {}

            for (let j = 0; j < headers.length; j++) {
              if (headers[j]) {
                item[headers[j]] = row[j] !== undefined ? row[j] : null
              }
            }

            result.push(item)
          }

          resolve(result)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error("讀取檔案時出錯"))
      reader.readAsArrayBuffer(file)
    })
  }

  // 解析JSON檔案
  const parseJSON = (file: File): Promise<DataItem[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const data = JSON.parse(text)

          if (!Array.isArray(data)) {
            throw new Error("JSON檔案必須包含資料陣列")
          }

          resolve(data)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error("讀取檔案時出錯"))
      reader.readAsText(file)
    })
  }

  // 渲染詳情對話框
  const renderDetailDialog = () => {
    if (!selectedItem) return null

    return (
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{title}詳細資料</DialogTitle>
            <DialogDescription>{visibleColumns[0] && selectedItem[visibleColumns[0].key]}</DialogDescription>
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
                {allColumns.map((column, index) => (
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
                  disabled={!selectedItem}
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
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={importFormat === "csv" ? ".csv" : importFormat === "excel" ? ".xlsx,.xls" : ".json"}
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    選擇檔案
                  </Button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {importFile
                    ? `已選擇: ${importFile.name}`
                    : `支援 ${
                        importFormat === "csv" ? ".csv" : importFormat === "excel" ? ".xlsx, .xls" : ".json"
                      } 格式`}
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleImport} disabled={!importFile}>
              匯入
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // 渲染欄位選擇器
  const renderColumnSelector = () => {
    return (
      <DropdownMenu open={isColumnSelectorOpen} onOpenChange={setIsColumnSelectorOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            顯示欄位
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>選擇顯示欄位</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-[300px] overflow-y-auto">
            {allColumns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={visibleColumns.some((col) => col.key === column.key)}
                onCheckedChange={() => toggleColumnVisibility(column.key)}
              >
                {column.title}
              </DropdownMenuCheckboxItem>
            ))}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setVisibleColumns(allColumns)}>顯示所有欄位</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // 渲染主鍵完整性警告
  const renderKeyIntegrityWarnings = () => {
    if (duplicateKeyWarnings.length === 0 && missingKeyWarnings.length === 0) {
      return null
    }

    return (
      <div className="space-y-2 mb-4">
        {duplicateKeyWarnings.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">發現重複的主鍵:</div>
              <ul className="list-disc pl-5 mt-1">
                {duplicateKeyWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {missingKeyWarnings.length > 0 && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">發現缺少主鍵欄位的記錄:</div>
              <ul className="list-disc pl-5 mt-1">
                {missingKeyWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
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
                      value={activeFilters[filter.field] || "all"}
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
                        <SelectItem value="all">全部</SelectItem>
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

          {renderColumnSelector()}

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
        {renderKeyIntegrityWarnings()}

        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto" style={{ width: "100%" }}>
            <div style={{ minWidth: "100%", width: "max-content" }}>
              <Table>
                <TableHeader className="bg-gray-50 sticky top-0 z-10">
                  <TableRow>
                    {visibleColumns.map((column) => (
                      <TableHead
                        key={column.key}
                        className={`${column.sortable ? "cursor-pointer select-none" : ""} px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap`}
                        style={column.width ? { width: column.width, minWidth: column.width } : { minWidth: "150px" }}
                        onClick={column.sortable ? () => handleSort(column.key) : undefined}
                      >
                        <div className="flex items-center">
                          {column.title}
                          {column.sortable && <ArrowUpDown className="ml-1 h-4 w-4" />}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead
                      className="text-right sticky right-0 bg-gray-50 shadow-sm"
                      style={{ width: "80px", minWidth: "80px" }}
                    >
                      操作
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={visibleColumns.length + 1} className="text-center">
                        沒有找到符合條件的{title}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((item, index) => (
                      <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        {visibleColumns.map((column) => (
                          <TableCell key={column.key} className="px-4 py-2 border-r border-gray-100 whitespace-nowrap">
                            {column.render
                              ? column.render(item[column.key], item)
                              : item[column.key] !== undefined && item[column.key] !== null
                                ? String(item[column.key])
                                : "-"}
                          </TableCell>
                        ))}
                        <TableCell className="text-right sticky right-0 bg-white shadow-sm">
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
          </div>
        </div>

        {/* 分頁控制 */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value))
                setCurrentPage(0)
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="每頁顯示" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 筆</SelectItem>
                <SelectItem value="20">20 筆</SelectItem>
                <SelectItem value="50">50 筆</SelectItem>
                <SelectItem value="100">100 筆</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500">共 {filteredData.length} 筆資料</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              第 {currentPage + 1} / {totalPages || 1} 頁
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      {renderDetailDialog()}
      {renderExportDialog()}
      {renderImportDialog()}
    </Card>
  )
}
