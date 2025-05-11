import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileEdit, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { FactoryProductionHistory } from "@/components/factories/factory-production-history"
import { FactoryContactInfo } from "@/components/factories/factory-contact-info"
import { FactoryQualityMetrics } from "@/components/factories/factory-quality-metrics"

// 模擬工廠數據獲取函數
function getFactory(id: string) {
  return {
    id: "FAC001",
    name: "台灣精密製造廠",
    contactPerson: "王大明",
    email: "contact@twprecision.com",
    phone: "04-2345-6789",
    address: "台中市西屯區工業區路123號",
    country: "台灣",
    type: "assembly",
    status: "active",
    createdAt: "2023-01-10",
    taxId: "12345678",
    website: "https://www.twprecision.com",
    capacity: "每月5000單位",
    certifications: ["ISO 9001", "ISO 14001"],
    notes: "主要負責高精密零件組裝",
    contacts: [
      {
        name: "王大明",
        title: "廠長",
        email: "contact@twprecision.com",
        phone: "04-2345-6789",
        primary: true,
      },
      {
        name: "林小華",
        title: "品管主管",
        email: "qc@twprecision.com",
        phone: "04-2345-6780",
        primary: false,
      },
    ],
  }
}

export default function FactoryDetailsPage({ params }: { params: { id: string } }) {
  const factory = getFactory(params.id)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/factories">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{factory.name}</h1>
          <Badge variant={factory.status === "active" ? "default" : "secondary"}>
            {factory.status === "active" ? "啟用" : "停用"}
          </Badge>
        </div>
        <Link href={`/factories/${factory.id}/edit`}>
          <Button>
            <FileEdit className="mr-2 h-4 w-4" />
            編輯工廠
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>工廠資訊</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between py-1">
                <dt className="font-medium text-muted-foreground">工廠ID</dt>
                <dd>{factory.id}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="font-medium text-muted-foreground">統一編號</dt>
                <dd>{factory.taxId}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="font-medium text-muted-foreground">國家/地區</dt>
                <dd>{factory.country}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="font-medium text-muted-foreground">工廠類型</dt>
                <dd>
                  {factory.type === "assembly" && "組裝廠"}
                  {factory.type === "production" && "生產廠"}
                  {factory.type === "parts" && "零件廠"}
                </dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="font-medium text-muted-foreground">產能</dt>
                <dd>{factory.capacity}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="font-medium text-muted-foreground">建立日期</dt>
                <dd>{factory.createdAt}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="font-medium text-muted-foreground">網站</dt>
                <dd>
                  <a
                    href={factory.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {factory.website}
                  </a>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>聯絡資訊</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between py-1">
                <dt className="font-medium text-muted-foreground">主要聯絡人</dt>
                <dd>{factory.contactPerson}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="font-medium text-muted-foreground">電子郵件</dt>
                <dd>
                  <a href={`mailto:${factory.email}`} className="text-blue-600 hover:underline">
                    {factory.email}
                  </a>
                </dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="font-medium text-muted-foreground">電話</dt>
                <dd>{factory.phone}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="font-medium text-muted-foreground">地址</dt>
                <dd>{factory.address}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="font-medium text-muted-foreground">認證</dt>
                <dd className="flex gap-1">
                  {factory.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline">
                      {cert}
                    </Badge>
                  ))}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="production" className="w-full">
        <TabsList>
          <TabsTrigger value="production">生產歷史</TabsTrigger>
          <TabsTrigger value="contacts">聯絡人</TabsTrigger>
          <TabsTrigger value="quality">品質指標</TabsTrigger>
          <TabsTrigger value="notes">備註</TabsTrigger>
        </TabsList>
        <TabsContent value="production">
          <FactoryProductionHistory factoryId={factory.id} />
        </TabsContent>
        <TabsContent value="contacts">
          <FactoryContactInfo contacts={factory.contacts} />
        </TabsContent>
        <TabsContent value="quality">
          <FactoryQualityMetrics factoryId={factory.id} />
        </TabsContent>
        <TabsContent value="notes">
          <Card>
            <CardContent className="pt-6">
              <p>{factory.notes || "沒有備註"}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
