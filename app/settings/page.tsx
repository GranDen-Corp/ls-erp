"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import StaticParametersManager from "@/components/static-parameters-manager"
import ExchangeRatesManager from "@/components/exchange-rates-manager"
import { ProductUnitsSettings } from "@/components/settings/product-units-settings"
import { createClient } from "@/lib/supabase-client"
import type { StaticParameter, ExchangeRate } from "@/types/settings"

export default function SettingsPage() {
  const [staticParameters, setStaticParameters] = useState<StaticParameter[]>([])
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()

        // Fetch static parameters
        const { data: parametersData, error: parametersError } = await supabase
          .from("static_parameters")
          .select("*")
          .order("category", { ascending: true })
          .order("sort_order", { ascending: true })

        if (parametersError) {
          console.error("Error fetching static parameters:", parametersError)
        } else {
          setStaticParameters(parametersData || [])
        }

        // Fetch exchange rates
        const { data: ratesData, error: ratesError } = await supabase
          .from("exchange_rates")
          .select("*")
          .order("currency_code", { ascending: true })

        if (ratesError) {
          console.error("Error fetching exchange rates:", ratesError)
        } else {
          setExchangeRates(ratesData || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">載入中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">系統設定</h1>
        <p className="text-muted-foreground">管理系統參數和設定</p>
      </div>

      <Tabs defaultValue="order-status" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="order-status">訂單狀態設定</TabsTrigger>
          <TabsTrigger value="exchange-rates">匯率設定</TabsTrigger>
          <TabsTrigger value="material-price">料價設定</TabsTrigger>
          <TabsTrigger value="product-units">產品單位設定</TabsTrigger>
          <TabsTrigger value="team-matrix">團隊矩陣管理</TabsTrigger>
        </TabsList>

        <TabsContent value="order-status" className="mt-6">
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

        <TabsContent value="exchange-rates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>匯率設定</CardTitle>
              <CardDescription>管理貨幣匯率和基準貨幣設定</CardDescription>
            </CardHeader>
            <CardContent>
              <ExchangeRatesManager exchangeRates={exchangeRates} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="material-price" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>料價設定</CardTitle>
              <CardDescription>管理材料價格和成本設定</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">此功能尚未實現</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="product-units" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>產品單位設定</CardTitle>
              <CardDescription>管理產品數量單位和換算關係</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductUnitsSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team-matrix" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>團隊矩陣管理</CardTitle>
              <CardDescription>管理團隊結構和權限矩陣</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">此功能尚未實現</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
