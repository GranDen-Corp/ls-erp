import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StaticParametersManager from "@/components/static-parameters-manager"
import ExchangeRatesManager from "@/components/exchange-rates-manager"
import TradeTermsManager from "@/components/settings/trade-terms-manager"
import PaymentTermsManager from "@/components/settings/payment-terms-manager"
import OrderStatusesManager from "@/components/settings/order-statuses-manager"
import { getStaticParameters, getExchangeRates, getTradeTerms, getPaymentTerms, getOrderStatuses } from "./actions"

export default async function SettingsPage() {
  // Fetch data on the server side
  const [staticParameters, exchangeRates, tradeTerms, paymentTerms, orderStatuses] = await Promise.all([
    getStaticParameters(),
    getExchangeRates(),
    getTradeTerms(),
    getPaymentTerms(),
    getOrderStatuses(),
  ])

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">系統設定</h1>
        <p className="text-gray-600 mt-2">管理系統的各項設定參數</p>
      </div>

      <Tabs defaultValue="system-parameters" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="system-parameters">系統參數設定</TabsTrigger>
          <TabsTrigger value="exchange-rates">匯率設定</TabsTrigger>
          <TabsTrigger value="trade-terms">交易條件</TabsTrigger>
          <TabsTrigger value="payment-terms">付款條件</TabsTrigger>
          <TabsTrigger value="order-statuses">訂單狀態</TabsTrigger>
          <TabsTrigger value="team-matrix">團隊矩陣</TabsTrigger>
        </TabsList>

        <TabsContent value="system-parameters">
          <Card>
            <CardHeader>
              <CardTitle>系統參數設定</CardTitle>
              <CardDescription>設定系統中使用的各種參數，包括產品單位、系統翻譯等</CardDescription>
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

        <TabsContent value="trade-terms">
          <Card>
            <CardHeader>
              <CardTitle>交易條件設定</CardTitle>
              <CardDescription>管理國際貿易條件，如FOB、CIF等貿易術語</CardDescription>
            </CardHeader>
            <CardContent>
              <TradeTermsManager tradeTerms={tradeTerms} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-terms">
          <Card>
            <CardHeader>
              <CardTitle>付款條件設定</CardTitle>
              <CardDescription>管理付款方式和條件，如信用證、電匯等</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentTermsManager paymentTerms={paymentTerms} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="order-statuses">
          <Card>
            <CardHeader>
              <CardTitle>訂單狀態設定</CardTitle>
              <CardDescription>管理訂單處理流程的各個狀態</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderStatusesManager orderStatuses={orderStatuses} />
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
