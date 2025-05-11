import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomerReports } from "@/components/reports/customer-reports"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReportsPage() {
  // 在服務器端，我們無法使用 useSearchParams，所以我們在客戶端組件中處理標籤切換
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">報表中心</h1>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">客戶報表</TabsTrigger>
          <TabsTrigger value="sales">銷售報表</TabsTrigger>
          <TabsTrigger value="products">產品報表</TabsTrigger>
          <TabsTrigger value="performance">績效報表</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <CustomerReports />
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>銷售報表</CardTitle>
              <CardDescription>查看銷售趨勢、產品銷量和收入分析</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">銷售報表功能開發中...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>產品報表</CardTitle>
              <CardDescription>查看產品性能、庫存和利潤分析</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">產品報表功能開發中...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>績效報表</CardTitle>
              <CardDescription>查看團隊和個人績效指標</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">績效報表功能開發中...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
