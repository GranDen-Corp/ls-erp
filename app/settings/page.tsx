import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderStatusSettings } from "@/components/settings/order-status-settings"
import { ExchangeRateSettings } from "@/components/settings/exchange-rate-settings"
import { MaterialPriceSettings } from "@/components/settings/material-price-settings"
import { TeamCustomerMatrix } from "@/components/settings/team-customer-matrix"
import { InitLocksureDataButton } from "@/components/admin/init-locksure-data-button"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">系統設定</h1>

      <Tabs defaultValue="order-status" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="order-status">訂單狀態設定</TabsTrigger>
          <TabsTrigger value="exchange-rate">匯率設定</TabsTrigger>
          <TabsTrigger value="material-price">料價設定</TabsTrigger>
          <TabsTrigger value="team-matrix">團隊矩陣管理</TabsTrigger>
        </TabsList>

        <TabsContent value="order-status">
          <Card>
            <CardHeader>
              <CardTitle>訂單狀態設定</CardTitle>
              <CardDescription>設定系統中使用的訂單狀態及其流程</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderStatusSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exchange-rate">
          <Card>
            <CardHeader>
              <CardTitle>匯率設定</CardTitle>
              <CardDescription>設定並追蹤不同貨幣的匯率</CardDescription>
            </CardHeader>
            <CardContent>
              <ExchangeRateSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="material-price">
          <Card>
            <CardHeader>
              <CardTitle>料價設定</CardTitle>
              <CardDescription>設定並追蹤各種材料的價格</CardDescription>
            </CardHeader>
            <CardContent>
              <MaterialPriceSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team-matrix">
          <Card>
            <CardHeader>
              <CardTitle>團隊矩陣管理</CardTitle>
              <CardDescription>設定團隊成員負責的客戶、工廠及品管對應關係</CardDescription>
            </CardHeader>
            <CardContent>
              <TeamCustomerMatrix />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <h3 className="text-lg font-medium">系統管理</h3>
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">初始化Locksure公司資料</p>
              <p className="text-sm text-gray-500">清除現有訂單和採購單資料，並創建新的Locksure公司相關資料</p>
            </div>
            <InitLocksureDataButton />
          </div>
        </div>
      </div>
    </div>
  )
}
