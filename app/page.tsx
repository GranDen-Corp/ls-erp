import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { StatusCards } from "@/components/dashboard/status-cards"

export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">儀表板</h1>

      <StatusCards />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>概覽</CardTitle>
            <CardDescription>過去30天的訂單和出貨概況</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>最近訂單</CardTitle>
            <CardDescription>最近10筆訂單</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrders />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
