import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileEdit } from "lucide-react"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase-client"
import { notFound } from "next/navigation"

export default async function FactoryDetailsPage({ params }: { params: { id: string } }) {
  const factoryId = params.id
  const supabase = createServerSupabaseClient()

  // 獲取供應商資料和團隊成員資料
  const [factoryResult, teamMembersResult] = await Promise.all([
    supabase.from("factories").select("*").eq("factory_id", factoryId).single(),
    supabase.from("team_members").select("ls_employee_id, name"),
  ])

  if (factoryResult.error || !factoryResult.data) {
    console.error("獲取供應商資料時出錯:", factoryResult.error)
    notFound()
  }

  const factory = factoryResult.data
  const teamMembers = teamMembersResult.data || []

  // 根據員工ID獲取員工姓名
  const getEmployeeName = (employeeId?: string) => {
    if (!employeeId) return "-"
    const member = teamMembers.find((m) => m.ls_employee_id === employeeId)
    return member ? member.name : employeeId
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

  // 渲染供應商類型
  const renderFactoryType = (type: string) => {
    const typeMap = {
      assembly: "組裝廠",
      production: "生產廠",
      parts: "零件廠",
      material: "材料供應商",
      service: "服務供應商",
    }
    return typeMap[type as keyof typeof typeMap] || type || "未分類"
  }

  // 渲染認證狀態
  const renderCertificationStatus = (certified?: string, expiry?: string) => {
    if (certified === "Y" || certified === "是") {
      const isExpired = expiry && new Date(expiry) < new Date()
      const isExpiringSoon = expiry && new Date(expiry) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

      return (
        <div className="space-y-1">
          <Badge
            variant={isExpired ? "destructive" : isExpiringSoon ? "outline" : "default"}
            className={
              isExpired
                ? "bg-red-100 text-red-800"
                : isExpiringSoon
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
            }
          >
            已認證
          </Badge>
          {expiry && <div className="text-xs text-muted-foreground">到期日: {formatDate(expiry)}</div>}
        </div>
      )
    } else if (certified === "審核中") {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          審核中
        </Badge>
      )
    } else {
      return <Badge variant="secondary">未認證</Badge>
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">基本資訊</TabsTrigger>
          <TabsTrigger value="location">地址資訊</TabsTrigger>
          <TabsTrigger value="contact">聯絡資訊</TabsTrigger>
          <TabsTrigger value="certification">認證資訊</TabsTrigger>
          <TabsTrigger value="additional">其他資訊</TabsTrigger>
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
                  <p className="font-mono">{factory.factory_id || "-"}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">供應商簡稱</p>
                  <p>{factory.factory_short_name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">統一編號</p>
                  <p className="font-mono">{factory.tax_id || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">供應商類型</p>
                  <p>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                      {renderFactoryType(factory.factory_type)}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">狀態</p>
                  <p>
                    <Badge variant={factory.status === true ? "default" : "secondary"}>
                      {factory.status === true ? "啟用" : "停用"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">建立時間</p>
                  <p>{formatDate(factory.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">更新時間</p>
                  <p>{formatDate(factory.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>地址資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">國家/地區</p>
                  <p>{factory.location || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">國家</p>
                  <p>{factory.country || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">城市</p>
                  <p>{factory.city || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">郵遞區號</p>
                  <p>{factory.postal_code || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">工廠地址</p>
                  <p>{factory.factory_address || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">發票地址</p>
                  <p>{factory.invoice_address || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>聯絡資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">公司電話</p>
                  <p>{factory.factory_phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">公司傳真</p>
                  <p>{factory.factory_fax || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">聯絡人</p>
                  <p>{factory.contact_person || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">聯絡人電話</p>
                  <p>{factory.contact_phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">聯絡人電子郵件</p>
                  <p>{factory.contact_email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">網站</p>
                  <p>
                    {factory.website ? (
                      <a
                        href={factory.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {factory.website}
                      </a>
                    ) : (
                      "-"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">品質聯絡人1</p>
                  <p>{getEmployeeName(factory.quality_contact1)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">品質聯絡人2</p>
                  <p>{getEmployeeName(factory.quality_contact2)}</p>
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
            <CardContent className="space-y-6">
              {/* ISO 認證 */}
              <div>
                <h4 className="font-medium mb-3">ISO 認證</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ISO 9001認證</p>
                    {renderCertificationStatus(factory.iso9001_certified, factory.iso9001_expiry)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">IATF 16949認證</p>
                    {renderCertificationStatus(factory.iatf16949_certified, factory.iatf16949_expiry)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ISO 17025認證</p>
                    {renderCertificationStatus(factory.iso17025_certified, factory.iso17025_expiry)}
                  </div>
                </div>
              </div>

              {/* CQI 認證 */}
              <div>
                <h4 className="font-medium mb-3">CQI 認證</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CQI-9認證</p>
                    {renderCertificationStatus(factory.cqi9_certified, factory.cqi9_expiry)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CQI-11認證</p>
                    {renderCertificationStatus(factory.cqi11_certified, factory.cqi11_expiry)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CQI-12認證</p>
                    {renderCertificationStatus(factory.cqi12_certified, factory.cqi12_expiry)}
                  </div>
                </div>
              </div>

              {/* 類別 */}
              <div>
                <h4 className="font-medium mb-3">類別分類</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="additional" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>其他資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">備註</p>
                <div className="bg-gray-50 p-3 rounded-md min-h-[100px]">
                  <p className="whitespace-pre-wrap">{factory.notes || "無備註"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
