"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  FileText,
  FileSpreadsheet,
  FileIcon as FilePdf,
  FileImage,
  MoreHorizontal,
  Download,
  Trash,
  Eye,
  Search,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { DocumentPreviewDialog } from "./document-preview-dialog"

// Mock document data
const documents = [
  {
    id: "doc-001",
    name: "出貨管理系統使用手冊",
    type: "pdf",
    category: "使用手冊",
    uploadedBy: "系統管理員",
    uploadDate: "2023-04-17T08:30:00Z",
    size: "1.2 MB",
    url: "/documents/shipment-management-manual.pdf",
  },
  {
    id: "doc-002",
    name: "訂單管理流程圖",
    type: "image",
    category: "流程圖",
    uploadedBy: "業務主管",
    uploadDate: "2023-04-15T10:15:00Z",
    size: "850 KB",
    url: "/documents/order-management-flowchart.png",
  },
  {
    id: "doc-003",
    name: "2023年Q1銷售報告",
    type: "excel",
    category: "報告",
    uploadedBy: "財務部門",
    uploadDate: "2023-04-10T14:45:00Z",
    size: "2.5 MB",
    url: "/documents/sales-report-2023-q1.xlsx",
  },
  {
    id: "doc-004",
    name: "客戶投訴處理指南",
    type: "pdf",
    category: "使用手冊",
    uploadedBy: "客服主管",
    uploadDate: "2023-04-05T09:20:00Z",
    size: "980 KB",
    url: "/documents/complaint-handling-guide.pdf",
  },
  {
    id: "doc-005",
    name: "產品管理系統使用手冊",
    type: "pdf",
    category: "使用手冊",
    uploadedBy: "系統管理員",
    uploadDate: "2023-04-01T11:00:00Z",
    size: "1.5 MB",
    url: "/documents/product-management-manual.pdf",
  },
]

export function DocumentsTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Filter documents based on search query
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get icon based on document type
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FilePdf className="h-5 w-5 text-red-500" />
      case "excel":
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />
      case "image":
        return <FileImage className="h-5 w-5 text-blue-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  // Handle document preview
  const handlePreview = (document: any) => {
    setSelectedDocument(document)
    setIsPreviewOpen(true)
  }

  // Handle document download
  const handleDownload = (url: string, filename: string) => {
    // In a real application, this would trigger a download
    console.log(`Downloading ${filename} from ${url}`)
    // Simulate download with an alert
    alert(`正在下載: ${filename}`)
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜尋文件..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>文件名稱</TableHead>
              <TableHead>分類</TableHead>
              <TableHead>上傳者</TableHead>
              <TableHead>上傳日期</TableHead>
              <TableHead>大小</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  沒有找到符合條件的文件
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>{getDocumentIcon(document.type)}</TableCell>
                  <TableCell className="font-medium">{document.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{document.category}</Badge>
                  </TableCell>
                  <TableCell>{document.uploadedBy}</TableCell>
                  <TableCell>{formatDate(document.uploadDate)}</TableCell>
                  <TableCell>{document.size}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">開啟選單</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreview(document)}>
                          <Eye className="mr-2 h-4 w-4" />
                          預覽
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(document.url, document.name)}>
                          <Download className="mr-2 h-4 w-4" />
                          下載
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          刪除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <DocumentPreviewDialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        document={selectedDocument}
      />
    </Card>
  )
}
