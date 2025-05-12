import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileEdit } from "lucide-react"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase-client"
import { notFound } from "next/navigation"
import { FactoryProductionHistory } from "@/components/factories/factory-production-history"
import { FactoryContactInfo } from "@/components/factories/factory-contact-info"
import { FactoryQualityMetrics } from "@/components/factories/factory-quality-metrics"

export default async function FactoryDetailsPage({ params }: { params: { id: string } }) {
  const factoryId = params.id
  const supabase = createServerSupabaseClient()

  // 獲取供應商資料
  const { data: factory, error } = await supabase.from("suppliers").select("*").eq("factory_id", factoryId).single()

  if (error || !factory) {
    console.error("獲取供應商資料時出錯:", error)
    notFound()
  }

  // 格式化日期的輔助函數
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    try {
      return new Date(dateString).toLocaleDateString("zh-TW")
    } catch (e) {
      return dateString
    }
  }

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/factories/all">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回供應商列表
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{factory.factory_name}</h1>
          <div className="ml-2">
            <Link href={`/factories/all/${factory.factory_id}/edit`}>
              <Button variant="outline" size="sm">
                <FileEdit className="mr-2 h-4 w-4" />
                編輯
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList>
          <TabsTrigger value="basic">基本資訊</TabsTrigger>
          <TabsTrigger value="certification">認證資訊</TabsTrigger>
          <TabsTrigger value="contact">聯絡資訊</TabsTrigger>
          <TabsTrigger value="production">生產歷史</TabsTrigger>
          <TabsTrigger value="quality">品質指標</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>基本資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">供應商ID</p>
                  <p>{factory.factory_id || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">供應商名稱</p>
                  <p>{factory.factory_name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">供應商全名</p>
                  <p>{factory.factory_full_name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">統一編號</p>
                  <p>{factory.tax_id || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">供應商類型</p>
                  <p>
                    <Badge variant="outline">
                      {factory.supplier_type === "assembly" && "組裝廠"}
                      {factory.supplier_type === "production" && "生產廠"}
                      {factory.supplier_type === "parts" && "零件廠"}
                      {factory.supplier_type === "material" && "材料供應商"}
                      {factory.supplier_type === "service" && "服務供應商"}
                      {!factory.supplier_type && "-"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">狀態</p>
                  <p>
                    <Badge variant={factory.status === "active" ? "default" : "secondary"}>
                      {factory.status === "active" ? "啟用" : "停用"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">國家/地區</p>
                  <p>{factory.country || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">城市</p>
                  <p>{factory.city || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certification" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>認證資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ISO 9001認證</p>
                  <p>
                    <Badge variant={factory.iso9001_certified === "是" ? "default" : "secondary"}>
                      {factory.iso9001_certified === "是" ? "已認證" : factory.iso9001_certified || "未認證"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">IATF 16949認證</p>
                  <p>
                    <Badge variant={factory.iatf16949_certified === "是" ? "default" : "secondary"}>
                      {factory.iatf16949_certified === "是" ? "已認證" : factory.iatf16949_certified || "未認證"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ISO 17025認證</p>
                  <p>
                    <Badge variant={factory.iso17025_certified === "是" ? "default" : "secondary"}>
                      {factory.iso17025_certified === "是" ? "已認證" : factory.iso17025_certified || "未認證"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CQI-9認證</p>
                  <p>
                    <Badge variant={factory.cqi9_certified === "是" ? "default" : "secondary"}>
                      {factory.cqi9_certified === "是" ? "已認證" : factory.cqi9_certified || "未認證"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CQI-11認證</p>
                  <p>
                    <Badge variant={factory.cqi11_certified === "是" ? "default" : "secondary"}>
                      {factory.cqi11_certified === "是" ? "已認證" : factory.cqi11_certified || "未認證"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CQI-12認證</p>
                  <p>
                    <Badge variant={factory.cqi12_certified === "是" ? "default" : "secondary"}>
                      {factory.cqi12_certified === "是" ? "已認證" : factory.cqi12_certified || "未認證"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">類別1</p>
                  <p>{factory.category1 || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">類別2</p>
                  <p>{factory.category2 || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">類別3</p>
                  <p>{factory.category3 || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-4">
          <FactoryContactInfo factory={factory} />
        </TabsContent>

        <TabsContent value="production" className="mt-4">
          <FactoryProductionHistory factoryId={factory.factory_id} />
        </TabsContent>

        <TabsContent value="quality" className="mt-4">
          <FactoryQualityMetrics factoryId={factory.factory_id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
