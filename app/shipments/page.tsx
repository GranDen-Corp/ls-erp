"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Download, PlusCircle, Upload } from "lucide-react"
import { useState } from "react"

// 簡化的出貨表格組件，避免複雜的初始化邏輯
function SimpleShipmentsTable({ status, isDelayed }: { status?: string; isDelayed?: boolean }) {
  return (
    <div className="rounded-md border">
      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          {status ? `狀態: ${status}` : isDelayed ? "延遲出貨" : "所有出貨"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">出貨資料載入中...</p>
      </div>
    </div>
  )
}

export default function ShipmentsPage() {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">出貨管理</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            匯入交期更新
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            匯出工廠出貨列表
          </Button>
          <Link href="/shipments/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              新增出貨
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="preparing">準備中</TabsTrigger>
          <TabsTrigger value="shipped">已出貨</TabsTrigger>
          <TabsTrigger value="completed">已完成</TabsTrigger>
          <TabsTrigger value="delayed">延遲出貨</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>所有出貨</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleShipmentsTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="preparing">
          <Card>
            <CardHeader>
              <CardTitle>準備中出貨</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleShipmentsTable status="準備中" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="shipped">
          <Card>
            <CardHeader>
              <CardTitle>已出貨</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleShipmentsTable status="已出貨" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>已完成出貨</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleShipmentsTable status="已完成" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="delayed">
          <Card>
            <CardHeader>
              <CardTitle>延遲出貨</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleShipmentsTable isDelayed={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
