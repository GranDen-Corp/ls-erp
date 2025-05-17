import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrdersTable } from "@/components/orders/orders-table"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">訂單管理</h1>
        <div className="flex gap-2">
          <Link href="/orders/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              新增訂單
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="pending">待確認</TabsTrigger>
          <TabsTrigger value="inProgress">進行中</TabsTrigger>
          <TabsTrigger value="inspected">驗貨完成</TabsTrigger>
          <TabsTrigger value="shipped">已出貨/結案</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <OrdersTable />
        </TabsContent>
        <TabsContent value="pending">
          <OrdersTable status="待確認" />
        </TabsContent>
        <TabsContent value="inProgress">
          <OrdersTable status="進行中" />
        </TabsContent>
        <TabsContent value="inspected">
          <OrdersTable status="驗貨完成" />
        </TabsContent>
        <TabsContent value="shipped">
          <OrdersTable status="已出貨" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
