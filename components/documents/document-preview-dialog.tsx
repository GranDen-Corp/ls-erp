"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface DocumentPreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  document: any
}

export function DocumentPreviewDialog({ isOpen, onClose, document }: DocumentPreviewDialogProps) {
  if (!document) return null

  // Handle document download
  const handleDownload = (url: string, filename: string) => {
    // In a real application, this would trigger a download
    console.log(`Downloading ${filename} from ${url}`)
    // Simulate download with an alert
    alert(`正在下載: ${filename}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{document.name}</DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>上傳者: {document.uploadedBy}</span>
            <span>•</span>
            <span>上傳日期: {formatDate(document.uploadDate)}</span>
            <span>•</span>
            <span>大小: {document.size}</span>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto border rounded-md bg-muted/20 my-4">
          {document.type === "pdf" && (
            <div className="h-full flex items-center justify-center">
              <iframe src={document.url} className="w-full h-full" title={document.name} />
            </div>
          )}
          {document.type === "image" && (
            <div className="h-full flex items-center justify-center p-4">
              <img
                src={document.url || "/placeholder.svg"}
                alt={document.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
          {document.type !== "pdf" && document.type !== "image" && (
            <div className="h-full flex items-center justify-center p-8 text-center">
              <div>
                <p className="text-muted-foreground mb-4">無法預覽此類型的文件，請下載後查看</p>
                <Button onClick={() => handleDownload(document.url, document.name)}>
                  <Download className="mr-2 h-4 w-4" />
                  下載文件
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => handleDownload(document.url, document.name)}>
            <Download className="mr-2 h-4 w-4" />
            下載文件
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
