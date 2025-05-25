"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StaticParametersManager from "@/components/static-parameters-manager"
import ExchangeRatesManager from "@/components/exchange-rates-manager"
import { getStaticParameters, getExchangeRates } from "../actions"
import ProductUnitsManager from "@/components/product-units-manager"

export default async function StaticParametersPage() {
  const [staticParameters, exchangeRates] = await Promise.all([getStaticParameters(), getExchangeRates()])

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">系統參數設置</h1>
        <p className="text-gray-600 mt-2">管理系統的靜態參數和匯率設置</p>
      </div>

      <Tabs defaultValue="static-parameters" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="static-parameters">靜態參數</TabsTrigger>
          <TabsTrigger value="exchange-rates">匯率設置</TabsTrigger>
          <TabsTrigger value="product-units">產品單位</TabsTrigger>
        </TabsList>

        <TabsContent value="static-parameters">
          <Card>
            <CardHeader>
              <CardTitle>靜態參數管理</CardTitle>
              <CardDescription>管理系統中的靜態參數，包括產品單位、訂單狀態、付款條件等</CardDescription>
            </CardHeader>
            <CardContent>
              <StaticParametersManager parameters={staticParameters} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exchange-rates">
          <Card>
            <CardHeader>
              <CardTitle>匯率設置</CardTitle>
              <CardDescription>管理系統中的貨幣匯率，設置基準貨幣和各種貨幣的兌換率</CardDescription>
            </CardHeader>
            <CardContent>
              <ExchangeRatesManager rates={exchangeRates} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="product-units">
          <Card>
            <CardHeader>
              <CardTitle>產品單位管理</CardTitle>
              <CardDescription>管理產品的計量單位，設置單位代碼、名稱和換算倍數</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductUnitsManager parameters={staticParameters.filter((p) => p.category === "product_unit")} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
