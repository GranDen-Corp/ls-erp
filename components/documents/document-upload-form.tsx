"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, FileText } from "lucide-react"

export function DocumentUploadForm() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false)
      // Redirect to documents page after successful upload
      router.push("/documents")
      // Show success message
      alert("文件上傳成功！")
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>文件資訊</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">文件名稱</Label>
            <Input id="name" placeholder="輸入文件名稱" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">文件分類</Label>
            <Select required>
              <SelectTrigger id="category">
                <SelectValue placeholder="選擇文件分類" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="使用手冊">使用手冊</SelectItem>
                <SelectItem value="流程圖">流程圖</SelectItem>
                <SelectItem value="報告">報告</SelectItem>
                <SelectItem value="表格">表格</SelectItem>
                <SelectItem value="其他">其他</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">文件描述</Label>
            <Textarea id="description" placeholder="輸入文件描述（選填）" rows={3} />
          </div>

          <div className="space-y-2">
            <Label>上傳文件</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!file ? (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="text-lg font-medium">拖放文件到此處或點擊上傳</p>
                  <p className="text-sm text-muted-foreground">支持的文件格式：PDF、Word、Excel、PowerPoint、圖片等</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    選擇文件
                  </Button>
                  <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1 text-left">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push("/documents")}>
            取消
          </Button>
          <Button type="submit" disabled={!file || isUploading}>
            {isUploading ? "上傳中..." : "上傳文件"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
