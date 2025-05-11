"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComplaintSummaryStats } from "@/components/complaints/complaint-summary-stats"
import { ComplaintTrendChart } from "@/components/complaints/complaint-trend-chart"
import { ComplaintByProductTable } from "@/components/complaints/complaint-by-product-table"
import { ComplaintByCustomerTable } from "@/components/complaints/complaint-by-customer-table"

export default function ComplaintReportsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">客訴報表</h1>
      </div>

      <ComplaintSummaryStats />

      <Tabs defaultValue="trends" className="w-full">
        <TabsList>
          <TabsTrigger value="trends">趨勢分析</TabsTrigger>
          <TabsTrigger value="by-product">依產品分析</TabsTrigger>
          <TabsTrigger value="by-customer">依客戶分析</TabsTrigger>
        </TabsList>
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>客訴趨勢分析</CardTitle>
            </CardHeader>
            <CardContent>
              <ComplaintTrendChart />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="by-product">
          <Card>
            <CardHeader>
              <CardTitle>依產品客訴分析</CardTitle>
            </CardHeader>
            <CardContent>
              <ComplaintByProductTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="by-customer">
          <Card>
            <CardHeader>
              <CardTitle>依客戶客訴分析</CardTitle>
            </CardHeader>
            <CardContent>
              <ComplaintByCustomerTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
