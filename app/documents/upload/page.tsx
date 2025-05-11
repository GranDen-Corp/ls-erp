import type { Metadata } from "next"
import { DocumentUploadForm } from "@/components/documents/document-upload-form"

export const metadata: Metadata = {
  title: "上傳文件 | 貿易ERP系統",
  description: "上傳新的文件到系統",
}

export default function DocumentUploadPage() {
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">上傳文件</h1>
        <p className="text-muted-foreground">上傳新的文件到系統</p>
      </div>
      <DocumentUploadForm />
    </div>
  )
}
