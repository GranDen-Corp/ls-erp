"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Eye, Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

interface PurchaseDocumentsProps {
  purchaseId: string
}

export function PurchaseDocuments({ purchaseId }: PurchaseDocumentsProps) {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // 模擬文件數據 - 實際應用中應從數據庫獲取
  useEffect(() => {
    // 這裡應該從數據庫獲取文件數據
    // 目前使用模擬數據
    const mockDocuments = [
      {
        id: "1",
        name: "採購單文件.pdf",
        type: "pdf",
        created_at: new Date().toISOString(),
        size: 1024 * 1024 * 2.5, // 2.5 MB
      },
      {
        id: "2",
        name: "供應商確認書.docx",
        type: "docx",
        created_at: new Date(Date.now() - 86400000).toISOString(), // 昨天
        size: 1024 * 512, // 512 KB
      },
    ]

    // 模擬加載
    setTimeout(() => {
      setDocuments(mockDocuments)
      setLoading(false)
    }, 1000)
  }, [purchaseId])

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-TW")
  }

  // 處理文件上傳
  const handleUpload = () => {
    toast({
      title: "功能尚未實現",
      description: "文件上傳功能尚未實現",
    })
  }

  // 處理文件下載
  const handleDownload = (documentId: string) => {
    toast({
      title: "功能尚未實現",
      description: "文件下載功能尚未實現",
    })
  }

  // 處理文件預覽
  const handlePreview = (documentId: string) => {
    toast({
      title: "功能尚未實現",
      description: "文件預覽功能尚未實現",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">採購單相關文件</h3>
        <Button onClick={handleUpload}>
          <Upload className="mr-2 h-4 w-4" />
          上傳文件
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>文件名稱</TableHead>
                  <TableHead>類型</TableHead>
                  <TableHead>大小</TableHead>
                  <TableHead>上傳日期</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // 載入中顯示骨架屏
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-6 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-20 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      沒有相關文件
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          {document.name}
                        </div>
                      </TableCell>
                      <TableCell>{document.type.toUpperCase()}</TableCell>
                      <TableCell>{formatFileSize(document.size)}</TableCell>
                      <TableCell>{formatDate(document.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handlePreview(document.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDownload(document.id)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h3 className="text-lg font-medium">採購單文件</h3>
          </div>
          <div className="mt-4">
            <Link href={`/purchases/${purchaseId}/document`}>
              <Button>
                <Eye className="mr-2 h-4 w-4" />
                查看採購單文件
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
