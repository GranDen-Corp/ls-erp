import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StaticParametersManager from "@/components/static-parameters-manager"
import ExchangeRatesManager from "@/components/exchange-rates-manager"
import { ProductUnitsSettings } from "@/components/settings/product-units-settings"
import { getStaticParameters, getExchangeRates } from "./actions"

export default async function SettingsPage() {
  // Fetch data on the server side
  const [staticParameters, exchangeRates] = await Promise.all([getStaticParameters(), getExchangeRates()])

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">系統設定</h1>
        <p className="text-gray-600 mt-2">管理系統的各項設定參數</p>
      </div>

      <Tabs defaultValue="order-status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="order-status">訂單狀態設定</TabsTrigger>
          <TabsTrigger value="exchange-rates">匯率設定</TabsTrigger>
          <TabsTrigger value="material-price">料價設定</TabsTrigger>
          <TabsTrigger value="team-matrix">團隊矩陣管理</TabsTrigger>
          <TabsTrigger value="product-units">產品單位設定</TabsTrigger>
        </TabsList>

        <TabsContent value="order-status">
          <Card>
            <CardHeader>
              <CardTitle>訂單狀態設定</CardTitle>
              <CardDescription>設定系統中使用的訂單狀態及其流程</CardDescription>
            </CardHeader>
            <CardContent>
              <StaticParametersManager parameters={staticParameters} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exchange-rates">
          <Card>
            <CardHeader>
              <CardTitle>匯率設定</CardTitle>
              <CardDescription>管理系統中的貨幣匯率，設置基準貨幣和各種貨幣的兌換率</CardDescription>
            </CardHeader>
            <CardContent>
              <ExchangeRatesManager exchangeRates={exchangeRates} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="material-price">
          <Card>
            <CardHeader>
              <CardTitle>料價設定</CardTitle>
              <CardDescription>管理產品材料的價格設定</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">此功能尚未實現</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team-matrix">
          <Card>
            <CardHeader>
              <CardTitle>團隊矩陣管理</CardTitle>
              <CardDescription>管理團隊成員和權限矩陣</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">此功能尚未實現</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="product-units">
          <Card>
            <CardHeader>
              <CardTitle>產品單位設定</CardTitle>
              <CardDescription>管理產品的計量單位，設置單位代碼、名稱和換算倍數</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductUnitsSettings parameters={staticParameters.filter((p) => p.category === "product_unit")} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
