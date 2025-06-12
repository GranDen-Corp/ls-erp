"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShipmentsTable } from "@/components/shipments/shipments-table"
import Link from "next/link"
import { Download, PlusCircle, Upload } from "lucide-react"

export default function ShipmentsPage() {
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

      <Tabs defaultValue="all" className="w-full">
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
              <ShipmentsTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="preparing">
          <Card>
            <CardHeader>
              <CardTitle>準備中出貨</CardTitle>
            </CardHeader>
            <CardContent>
              <ShipmentsTable status="準備中" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="shipped">
          <Card>
            <CardHeader>
              <CardTitle>已出貨</CardTitle>
            </CardHeader>
            <CardContent>
              <ShipmentsTable status="已出貨" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>已完成出貨</CardTitle>
            </CardHeader>
            <CardContent>
              <ShipmentsTable status="已完成" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="delayed">
          <Card>
            <CardHeader>
              <CardTitle>延遲出貨</CardTitle>
            </CardHeader>
            <CardContent>
              <ShipmentsTable isDelayed={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
