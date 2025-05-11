import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComplaintsTable } from "@/components/complaints/complaints-table"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default function ComplaintsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">客訴管理</h1>
        <Link href="/complaints/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            新增客訴
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="pending">待處理</TabsTrigger>
          <TabsTrigger value="processing">處理中</TabsTrigger>
          <TabsTrigger value="resolved">已解決</TabsTrigger>
          <TabsTrigger value="closed">已結案</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>所有客訴</CardTitle>
            </CardHeader>
            <CardContent>
              <ComplaintsTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>待處理客訴</CardTitle>
            </CardHeader>
            <CardContent>
              <ComplaintsTable status="pending" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="processing">
          <Card>
            <CardHeader>
              <CardTitle>處理中客訴</CardTitle>
            </CardHeader>
            <CardContent>
              <ComplaintsTable status="processing" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="resolved">
          <Card>
            <CardHeader>
              <CardTitle>已解決客訴</CardTitle>
            </CardHeader>
            <CardContent>
              <ComplaintsTable status="resolved" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="closed">
          <Card>
            <CardHeader>
              <CardTitle>已結案客訴</CardTitle>
            </CardHeader>
            <CardContent>
              <ComplaintsTable status="closed" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
