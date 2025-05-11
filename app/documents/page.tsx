import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DocumentsTable } from "@/components/documents/documents-table"
import { NetworkDriveExplorer } from "@/components/documents/network-drive-explorer"
import { ProtocolHandlerRegistration } from "@/components/documents/protocol-handler-registration"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload } from "lucide-react"

export const metadata: Metadata = {
  title: "文件管理 | 貿易ERP系統",
  description: "管理和查看系統文件",
}

export default function DocumentsPage() {
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">文件管理</h1>
          <p className="text-muted-foreground">管理和查看系統文件</p>
        </div>
        <div className="flex items-center gap-2">
          <ProtocolHandlerRegistration />
          <Button asChild>
            <Link href="/documents/upload">
              <Upload className="mr-2 h-4 w-4" />
              上傳文件
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="system-docs" className="w-full">
        <TabsList>
          <TabsTrigger value="system-docs">系統文件</TabsTrigger>
          <TabsTrigger value="network-drive">網路磁碟 (Z:)</TabsTrigger>
        </TabsList>
        <TabsContent value="system-docs">
          <DocumentsTable />
        </TabsContent>
        <TabsContent value="network-drive">
          <NetworkDriveExplorer />
        </TabsContent>
      </Tabs>
    </div>
  )
}
