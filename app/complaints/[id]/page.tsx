"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Pencil, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { ComplaintStatusUpdate } from "@/components/complaints/complaint-status-update"
import { ComplaintComments } from "@/components/complaints/complaint-comments"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// 狀態顏色映射
const statusColorMap: Record<string, string> = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  resolved: "bg-green-500",
  closed: "bg-gray-500",
}

// 狀態名稱映射
const statusNameMap: Record<string, string> = {
  pending: "待處理",
  processing: "處理中",
  resolved: "已解決",
  closed: "已結案",
}

// 優先級顏色映射
const priorityColorMap: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-orange-500",
  low: "bg-blue-500",
}

// 優先級名稱映射
const priorityNameMap: Record<string, string> = {
  high: "高",
  medium: "中",
  low: "低",
}

interface ComplaintPageProps {
  params: {
    id: string
  }
}

export default function ComplaintPage({ params }: ComplaintPageProps) {
  const { id } = params
  const [currentStatus, setCurrentStatus] = useState("pending")
  const [showOnPO, setShowOnPO] = useState(true)

  // 模擬從API獲取客訴數據
  // 實際應用中應該使用API獲取
  const complaint = {
    id: id,
    customer: {
      id: "1",
      name: "台灣電子",
      code: "TE",
    },
    product: {
      id: "1",
      pn: "LCD-15-HD",
      name: "15吋 HD LCD面板",
    },
    order: {
      id: "ORD-2023-0012",
      orderNumber: "ORD-2023-0012",
    },
    title: "面板亮度不足",
    description:
      "客戶反映部分面板亮度低於規格要求的250nits，在批次為SZ20230510的產品中發現約5%的面板亮度僅有220-230nits。",
    status: currentStatus,
    priority: "high",
    createdDate: "2023-05-10",
    updatedDate: "2023-05-10",
    showOnPO: showOnPO,
    attachments: [
      { id: "1", name: "測試報告.pdf", size: "2.5MB", uploadDate: "2023-05-10" },
      { id: "2", name: "問題面板照片.jpg", size: "1.2MB", uploadDate: "2023-05-10" },
    ],
  }

  // 處理狀態更新
  const handleStatusUpdate = (newStatus: string) => {
    setCurrentStatus(newStatus)
  }

  // 處理顯示於採購單設定更新
  const handleShowOnPOChange = (checked: boolean) => {
    setShowOnPO(checked)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/complaints">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">客訴詳情 - {complaint.id}</h1>
          <Badge className={`${statusColorMap[complaint.status]} text-white ml-2`}>
            {statusNameMap[complaint.status]}
          </Badge>
          <Badge className={`${priorityColorMap[complaint.priority]} text-white ml-2`}>
            優先級: {priorityNameMap[complaint.priority]}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/products/${complaint.product.id}`}>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              查看產品
            </Button>
          </Link>
          <Link href={`/complaints/${id}/edit`}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              編輯客訴
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>客訴基本資訊</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">客訴編號</dt>
                <dd className="mt-1 text-sm">{complaint.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">客戶</dt>
                <dd className="mt-1 text-sm">
                  {complaint.customer.name} ({complaint.customer.code})
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">產品編號</dt>
                <dd className="mt-1 text-sm">{complaint.product.pn}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">產品名稱</dt>
                <dd className="mt-1 text-sm">{complaint.product.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">相關訂單</dt>
                <dd className="mt-1 text-sm">
                  <Link href={`/orders/${complaint.order.id}`} className="text-blue-600 hover:underline">
                    {complaint.order.orderNumber}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">建立日期</dt>
                <dd className="mt-1 text-sm">{complaint.createdDate}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">客訴標題</dt>
                <dd className="mt-1 text-sm">{complaint.title}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">客訴描述</dt>
                <dd className="mt-1 text-sm">{complaint.description}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">附件</dt>
                <dd className="mt-1 text-sm">
                  <ul className="space-y-1">
                    {complaint.attachments.map((attachment) => (
                      <li key={attachment.id} className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                        <a href="#" className="text-blue-600 hover:underline">
                          {attachment.name}
                        </a>
                        <span className="text-gray-500 ml-2">({attachment.size})</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Switch id="show-on-po" checked={showOnPO} onCheckedChange={handleShowOnPOChange} />
                  <Label htmlFor="show-on-po" className="font-medium">
                    顯示於採購單
                  </Label>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  啟用此選項後，此客訴資訊將顯示在相關產品的採購單上，提醒供應商注意
                </p>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>客訴狀態</CardTitle>
          </CardHeader>
          <CardContent>
            <ComplaintStatusUpdate complaintId={id} currentStatus={currentStatus} onStatusUpdate={handleStatusUpdate} />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="comments" className="w-full">
        <TabsList>
          <TabsTrigger value="comments">處理記錄</TabsTrigger>
          <TabsTrigger value="related">相關客訴</TabsTrigger>
        </TabsList>
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>處理記錄</CardTitle>
            </CardHeader>
            <CardContent>
              <ComplaintComments complaintId={id} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="related">
          <Card>
            <CardHeader>
              <CardTitle>相關客訴</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                <AlertTriangle className="h-5 w-5 text-yellow-500 inline-block mr-2" />
                目前沒有與此產品相關的其他客訴記錄
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
