"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductDataTable } from "@/components/local-data/product-data-table"
import { CustomerDataTable } from "@/components/local-data/customer-data-table"
import { SupplierDataTable } from "@/components/local-data/supplier-data-table"

export default function LocalDataPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SBTest資料表</h1>
        <p className="text-muted-foreground">管理Supabase資料表，包含產品、客戶和供應商資料</p>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">產品資料表</TabsTrigger>
          <TabsTrigger value="customers">客戶資料表</TabsTrigger>
          <TabsTrigger value="suppliers">供應商資料表</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="mt-6">
          <ProductDataTable />
        </TabsContent>
        <TabsContent value="customers" className="mt-6">
          <CustomerDataTable />
        </TabsContent>
        <TabsContent value="suppliers" className="mt-6">
          <SupplierDataTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
