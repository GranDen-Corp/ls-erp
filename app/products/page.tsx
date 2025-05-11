import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductsTable } from "@/components/products/products-table"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">產品管理</h1>
        <Link href="/products/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            新增產品
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">全部產品</TabsTrigger>
          <TabsTrigger value="active">活躍產品</TabsTrigger>
          <TabsTrigger value="sample">樣品階段</TabsTrigger>
          <TabsTrigger value="discontinued">已停產</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>所有產品</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductsTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>活躍產品</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductsTable status="active" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sample">
          <Card>
            <CardHeader>
              <CardTitle>樣品階段產品</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductsTable status="sample" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="discontinued">
          <Card>
            <CardHeader>
              <CardTitle>已停產產品</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductsTable status="discontinued" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
