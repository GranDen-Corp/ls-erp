"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Folder,
  File,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileIcon as FilePdf,
  ArrowUpRight,
  ExternalLink,
  AlertTriangle,
  Search,
  RefreshCcw,
} from "lucide-react"

// 模擬網路磁碟的文件結構
const mockNetworkDrive = {
  財務報表: {
    type: "folder",
    children: {
      "2023年報表": {
        type: "folder",
        children: {
          "Q1財務報表.xlsx": { type: "file", size: "1.2 MB", modified: "2023-03-31", fileType: "excel" },
          "Q2財務報表.xlsx": { type: "file", size: "1.3 MB", modified: "2023-06-30", fileType: "excel" },
          "Q3財務報表.xlsx": { type: "file", size: "1.1 MB", modified: "2023-09-30", fileType: "excel" },
          "Q4財務報表.xlsx": { type: "file", size: "1.4 MB", modified: "2023-12-31", fileType: "excel" },
        },
      },
      "2024年報表": {
        type: "folder",
        children: {
          "Q1財務報表.xlsx": { type: "file", size: "1.3 MB", modified: "2024-03-31", fileType: "excel" },
        },
      },
    },
  },
  客戶資料: {
    type: "folder",
    children: {
      "客戶列表.xlsx": { type: "file", size: "2.5 MB", modified: "2024-04-15", fileType: "excel" },
      客戶合約: {
        type: "folder",
        children: {
          "A公司合約.pdf": { type: "file", size: "3.2 MB", modified: "2023-11-10", fileType: "pdf" },
          "B公司合約.pdf": { type: "file", size: "2.8 MB", modified: "2024-01-22", fileType: "pdf" },
          "C公司合約.pdf": { type: "file", size: "4.1 MB", modified: "2024-02-15", fileType: "pdf" },
        },
      },
    },
  },
  產品資料: {
    type: "folder",
    children: {
      "產品目錄.pdf": { type: "file", size: "5.7 MB", modified: "2024-03-05", fileType: "pdf" },
      產品圖片: {
        type: "folder",
        children: {
          "產品A.jpg": { type: "file", size: "2.3 MB", modified: "2023-10-12", fileType: "image" },
          "產品B.jpg": { type: "file", size: "1.8 MB", modified: "2023-10-12", fileType: "image" },
          "產品C.jpg": { type: "file", size: "2.1 MB", modified: "2023-10-12", fileType: "image" },
        },
      },
      產品規格: {
        type: "folder",
        children: {
          "產品A規格.docx": { type: "file", size: "1.5 MB", modified: "2023-09-20", fileType: "word" },
          "產品B規格.docx": { type: "file", size: "1.7 MB", modified: "2023-09-20", fileType: "word" },
          "產品C規格.docx": { type: "file", size: "1.6 MB", modified: "2023-09-20", fileType: "word" },
        },
      },
    },
  },
  "出貨管理系統使用手冊.pdf": { type: "file", size: "4.2 MB", modified: "2024-04-10", fileType: "pdf" },
  "公司規章制度.docx": { type: "file", size: "1.8 MB", modified: "2024-02-28", fileType: "word" },
}

// 文件類型圖標映射
const fileIcons = {
  folder: <Folder className="h-5 w-5 text-blue-500" />,
  file: <File className="h-5 w-5 text-gray-500" />,
  excel: <FileSpreadsheet className="h-5 w-5 text-green-600" />,
  word: <FileText className="h-5 w-5 text-blue-600" />,
  pdf: <FilePdf className="h-5 w-5 text-red-600" />,
  image: <FileImage className="h-5 w-5 text-purple-600" />,
}

export function NetworkDriveExplorer() {
  const [currentPath, setCurrentPath] = useState<string[]>([])
  const [currentFolder, setCurrentFolder] = useState<any>(mockNetworkDrive)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showOpenDialog, setShowOpenDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [showProtocolDialog, setShowProtocolDialog] = useState(false)

  // 處理文件夾導航
  const navigateToFolder = (folderName: string) => {
    const newPath = [...currentPath, folderName]
    setCurrentPath(newPath)

    // 根據路徑更新當前文件夾
    let folder = mockNetworkDrive
    for (const pathPart of newPath) {
      folder = folder[pathPart].children
    }
    setCurrentFolder(folder)
    setIsSearching(false)
  }

  // 處理返回上一級
  const navigateUp = () => {
    if (currentPath.length === 0) return

    const newPath = [...currentPath]
    newPath.pop()
    setCurrentPath(newPath)

    // 根據路徑更新當前文件夾
    let folder = mockNetworkDrive
    for (const pathPart of newPath) {
      folder = folder[pathPart].children
    }
    setCurrentFolder(folder)
    setIsSearching(false)
  }

  // 處理麵包屑導航
  const navigateToBreadcrumb = (index: number) => {
    if (index < 0) {
      setCurrentPath([])
      setCurrentFolder(mockNetworkDrive)
      return
    }

    const newPath = currentPath.slice(0, index + 1)
    setCurrentPath(newPath)

    // 根據路徑更新當前文件夾
    let folder = mockNetworkDrive
    for (const pathPart of newPath) {
      folder = folder[pathPart].children
    }
    setCurrentFolder(folder)
  }

  // 處理文件點擊
  const handleFileClick = (fileName: string, fileData: any) => {
    setSelectedFile({
      name: fileName,
      ...fileData,
    })
    setShowOpenDialog(true)
  }

  // 處理搜索
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const results: any[] = []

    // 遞歸搜索函數
    const searchInFolder = (folder: any, path: string[] = []) => {
      Object.entries(folder).forEach(([name, data]: [string, any]) => {
        if (name.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({
            name,
            path: [...path],
            ...data,
          })
        }

        if (data.type === "folder" && data.children) {
          searchInFolder(data.children, [...path, name])
        }
      })
    }

    searchInFolder(mockNetworkDrive)
    setSearchResults(results)
  }

  // 處理文件打開
  const handleOpenFile = () => {
    setShowOpenDialog(false)
    setShowProtocolDialog(true)

    // 在實際應用中，這裡可以使用協議處理程序嘗試打開文件
    // 例如: window.location.href = `file:///Z:/${currentPath.join('/')}/${selectedFile.name}`
    // 但由於安全限制，這可能不會在所有瀏覽器中工作
  }

  // 處理文件瀏覽器打開
  const handleOpenInExplorer = () => {
    setShowOpenDialog(false)
    setShowProtocolDialog(true)

    // 在實際應用中，這裡可以嘗試打開文件瀏覽器到指定路徑
    // 例如: window.location.href = `explorer:///Z:/${currentPath.join('/')}`
    // 但由於安全限制，這可能不會在所有瀏覽器中工作
  }

  // 當搜索查詢變化時重置搜索
  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearching(false)
    }
  }, [searchQuery])

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>網路磁碟瀏覽器 (Z:)</CardTitle>
          <CardDescription>瀏覽和訪問網路磁碟上的文件</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 搜索和導航欄 */}
            <div className="flex flex-col sm:flex-row gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={navigateUp} disabled={currentPath.length === 0}>
                  上一級
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentPath([])
                    setCurrentFolder(mockNetworkDrive)
                    setIsSearching(false)
                  }}
                >
                  <RefreshCcw className="h-4 w-4 mr-1" />
                  重新整理
                </Button>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="搜索文件..."
                    className="pl-8 w-[200px] sm:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch()
                      }
                    }}
                  />
                </div>
                <Button variant="secondary" size="sm" onClick={handleSearch}>
                  搜索
                </Button>
              </div>
            </div>

            {/* 麵包屑導航 */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => navigateToBreadcrumb(-1)}>Z:</BreadcrumbLink>
                </BreadcrumbItem>
                {currentPath.map((folder, index) => (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem key={index}>
                      <BreadcrumbLink onClick={() => navigateToBreadcrumb(index)}>{folder}</BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                ))}
              </BreadcrumbList>
            </Breadcrumb>

            {/* 瀏覽器安全提示 */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>瀏覽器限制提示</AlertTitle>
              <AlertDescription>
                由於瀏覽器安全限制，直接訪問網路磁碟可能受限。點擊文件時，系統將嘗試使用協議處理程序打開文件。
              </AlertDescription>
            </Alert>

            {/* 文件列表 */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[400px]">名稱</TableHead>
                    <TableHead>類型</TableHead>
                    <TableHead>大小</TableHead>
                    <TableHead>修改日期</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isSearching ? (
                    searchResults.length > 0 ? (
                      searchResults.map((item, index) => (
                        <TableRow key={index} className="cursor-pointer hover:bg-muted/50">
                          <TableCell
                            className="font-medium"
                            onClick={() => {
                              if (item.type === "folder") {
                                setCurrentPath(item.path)
                                navigateToFolder(item.name)
                              } else {
                                handleFileClick(item.name, item)
                              }
                            }}
                          >
                            <div className="flex items-center gap-2">
                              {fileIcons[item.fileType || item.type]}
                              <span>{item.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.type === "folder"
                              ? "資料夾"
                              : item.fileType === "excel"
                                ? "Excel 檔案"
                                : item.fileType === "word"
                                  ? "Word 檔案"
                                  : item.fileType === "pdf"
                                    ? "PDF 檔案"
                                    : item.fileType === "image"
                                      ? "圖片檔案"
                                      : "檔案"}
                          </TableCell>
                          <TableCell>{item.type === "folder" ? "--" : item.size}</TableCell>
                          <TableCell>{item.modified || "--"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          沒有找到符合 &quot;{searchQuery}&quot; 的文件
                        </TableCell>
                      </TableRow>
                    )
                  ) : (
                    Object.entries(currentFolder).map(([name, data]: [string, any], index) => (
                      <TableRow key={index} className="cursor-pointer hover:bg-muted/50">
                        <TableCell
                          className="font-medium"
                          onClick={() => {
                            if (data.type === "folder") {
                              navigateToFolder(name)
                            } else {
                              handleFileClick(name, data)
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {fileIcons[data.fileType || data.type]}
                            <span>{name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {data.type === "folder"
                            ? "資料夾"
                            : data.fileType === "excel"
                              ? "Excel 檔案"
                              : data.fileType === "word"
                                ? "Word 檔案"
                                : data.fileType === "pdf"
                                  ? "PDF 檔案"
                                  : data.fileType === "image"
                                    ? "圖片檔案"
                                    : "檔案"}
                        </TableCell>
                        <TableCell>{data.type === "folder" ? "--" : data.size}</TableCell>
                        <TableCell>{data.modified || "--"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 文件打開對話框 */}
      <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>打開文件</DialogTitle>
            <DialogDescription>選擇如何打開 &quot;{selectedFile?.name}&quot;</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              由於瀏覽器安全限制，直接訪問網路磁碟可能受限。請選擇以下選項之一：
            </p>
            <div className="space-y-2">
              <Button className="w-full justify-start" onClick={handleOpenFile}>
                <ArrowUpRight className="mr-2 h-4 w-4" />
                直接打開文件
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={handleOpenInExplorer}>
                <ExternalLink className="mr-2 h-4 w-4" />
                在檔案總管中打開
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOpenDialog(false)}>
              取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 協議處理對話框 */}
      <Dialog open={showProtocolDialog} onOpenChange={setShowProtocolDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>瀏覽器權限請求</DialogTitle>
            <DialogDescription>系統正在嘗試打開本地文件或應用程序</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>瀏覽器可能會阻止此操作</AlertTitle>
              <AlertDescription>由於瀏覽器安全限制，您可能需要允許此網站打開本地應用程序。</AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">如果沒有任何反應，您可能需要：</p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground mt-2 space-y-1">
              <li>檢查瀏覽器是否顯示了權限請求彈窗</li>
              <li>確認您的瀏覽器支持協議處理程序</li>
              <li>嘗試使用其他瀏覽器（如 Chrome 或 Edge）</li>
              <li>聯繫 IT 支持以獲取幫助</li>
            </ul>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowProtocolDialog(false)}>我明白了</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
