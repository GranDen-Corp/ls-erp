import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductUnitsSettings } from "@/components/settings/product-units-settings"
import ExchangeRatesManager from "@/components/exchange-rates-manager"
import { getStaticParameters, getExchangeRates, getTradeTerms, getPaymentTerms, getOrderStatuses } from "./actions"
import { TeamMatrixManager } from "@/components/settings/team-matrix-manager"
import TradeTermsManager from "@/components/settings/trade-terms-manager"
import PaymentTermsManager from "@/components/settings/payment-terms-manager"
import OrderStatusesManager from "@/components/settings/order-statuses-manager"
import { TranslationsManager } from "@/components/settings/translations-manager"

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

      <Tabs defaultValue="team-matrix" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="team-matrix">團隊矩陣</TabsTrigger>
          <TabsTrigger value="exchange-rates">匯率設定</TabsTrigger>
          <TabsTrigger value="product-units">產品單位設定</TabsTrigger>
          <TabsTrigger value="order-statuses">訂單狀態設定</TabsTrigger>
          <TabsTrigger value="trade-terms">交易條件設定</TabsTrigger>
          <TabsTrigger value="payment-terms">付款條件設定</TabsTrigger>
          <TabsTrigger value="translations">翻譯表設定</TabsTrigger>
        </TabsList>

        <TabsContent value="team-matrix">
          <Card>
            <CardHeader>
              <CardTitle>團隊矩陣管理</CardTitle>
              <CardDescription>管理團隊成員和部門設定，分配客戶與工廠負責人</CardDescription>
            </CardHeader>
            <CardContent>
              <TeamMatrixManager />
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

        <TabsContent value="product-units">
          <Card>
            <CardHeader>
              <CardTitle>產品單位設定</CardTitle>
              <CardDescription>設定產品計量單位，包括單位代碼、名稱和換算倍數</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductUnitsSettings parameters={staticParameters} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="order-statuses">
          <Card>
            <CardHeader>
              <CardTitle>訂單狀態設定</CardTitle>
              <CardDescription>管理訂單狀態設定，包括狀態代碼、名稱和顏色</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderStatusesManager orderStatuses={orderStatuses} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trade-terms">
          <Card>
            <CardHeader>
              <CardTitle>交易條件設定</CardTitle>
              <CardDescription>管理國際貿易條件設定，如 FOB、CIF 等貿易術語</CardDescription>
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
              <CardDescription>管理付款條件設定，如 NET30、COD 等付款方式</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentTermsManager paymentTerms={paymentTerms} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translations">
          <Card>
            <CardHeader>
              <CardTitle>翻譯表設定</CardTitle>
              <CardDescription>管理系統中的多語言翻譯對照表</CardDescription>
            </CardHeader>
            <CardContent>
              <TranslationsManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
