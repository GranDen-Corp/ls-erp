import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { StatusCards } from "@/components/dashboard/status-cards"
import { ActiveCustomers } from "@/components/dashboard/active-customers"

export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">儀表板</h1>

      <StatusCards />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最近訂單</CardTitle>
            <CardDescription>最新10筆訂單狀態</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrders />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>活躍客戶排行</CardTitle>
            <CardDescription>近30天訂單量排名前10的客戶</CardDescription>
          </CardHeader>
          <CardContent>
            <ActiveCustomers />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
