import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PurchasesTable } from "@/components/purchases/purchases-table"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default function PurchasesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">採購管理</h1>
        <Link href="/purchases/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            新增採購單
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="pending">待確認</TabsTrigger>
          <TabsTrigger value="inProgress">進行中</TabsTrigger>
          <TabsTrigger value="completed">已完成</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>所有採購單</CardTitle>
            </CardHeader>
            <CardContent>
              <PurchasesTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>待確認採購單</CardTitle>
            </CardHeader>
            <CardContent>
              <PurchasesTable status="pending" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inProgress">
          <Card>
            <CardHeader>
              <CardTitle>進行中採購單</CardTitle>
            </CardHeader>
            <CardContent>
              <PurchasesTable status="processing" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>已完成採購單</CardTitle>
            </CardHeader>
            <CardContent>
              <PurchasesTable status="completed" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
