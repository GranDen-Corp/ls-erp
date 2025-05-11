import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CustomerTable from "@/components/local-data/customer-table"

export default function LocalDataPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Local資料表資料</h1>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">產品資料表</TabsTrigger>
          <TabsTrigger value="customers">客戶資料表</TabsTrigger>
          <TabsTrigger value="orders">訂單資料表</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <p>產品資料表 content here</p>
        </TabsContent>
        <TabsContent value="customers">
          <CustomerTable />
        </TabsContent>
        <TabsContent value="orders">
          <p>訂單資料表 content here</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
