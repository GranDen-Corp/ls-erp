"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductDataTable } from "@/components/local-data/product-data-table"
import { CustomerDataTable } from "@/components/local-data/customer-data-table"
import { SupplierDataTable } from "@/components/local-data/supplier-data-table"
import { Database, Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LocalDataPage() {
  const [activeTab, setActiveTab] = useState("products")

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Local資料表</h1>
          <p className="text-muted-foreground">管理本地資料表，包含產品、客戶和供應商資料</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            匯入資料
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            匯出資料
          </Button>
        </div>
      </div>

      <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">產品資料表</TabsTrigger>
          <TabsTrigger value="customers">客戶資料表</TabsTrigger>
          <TabsTrigger value="suppliers">供應商資料表</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              {activeTab === "products" && "產品資料表"}
              {activeTab === "customers" && "客戶資料表"}
              {activeTab === "suppliers" && "供應商資料表"}
            </CardTitle>
            <CardDescription>
              {activeTab === "products" && "查看和管理本地產品資料"}
              {activeTab === "customers" && "查看和管理本地客戶資料"}
              {activeTab === "suppliers" && "查看和管理本地供應商資料"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TabsContent value="products" className="mt-0">
              <ProductDataTable />
            </TabsContent>
            <TabsContent value="customers" className="mt-0">
              <CustomerDataTable />
            </TabsContent>
            <TabsContent value="suppliers" className="mt-0">
              <SupplierDataTable />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
