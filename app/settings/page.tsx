import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StaticParametersManager from "@/components/static-parameters-manager"
import ExchangeRatesManager from "@/components/exchange-rates-manager"
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

      <Tabs defaultValue="system-parameters" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="system-parameters">系統參數設定</TabsTrigger>
          <TabsTrigger value="exchange-rates">匯率設定</TabsTrigger>
          <TabsTrigger value="material-price">料價設定</TabsTrigger>
          <TabsTrigger value="team-matrix">團隊矩陣管理</TabsTrigger>
        </TabsList>

        <TabsContent value="system-parameters">
          <Card>
            <CardHeader>
              <CardTitle>系統參數設定</CardTitle>
              <CardDescription>設定系統中使用的各種參數，包括訂單狀態、產品單位、系統翻譯等</CardDescription>
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
      </Tabs>
    </div>
  )
}
