import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileEdit, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { FactoryProductionHistory } from "@/components/factories/factory-production-history"
import { supabaseClient } from "@/lib/supabase-client"
import type { Factory } from "@/types/factory"

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-"
  try {
    return new Date(dateStr).toLocaleDateString("zh-TW")
  } catch (e) {
    return dateStr
  }
}

// 格式化認證狀態
const formatCertification = (status?: string) => {
  if (!status) return "-"
  return status === "是" ? "已認證" : status === "否" ? "未認證" : status
}

// 從Supabase獲取工廠數據
async function getFactory(id: string) {
  try {
    const { data, error } = await supabaseClient.from("suppliers").select("*").eq("factory_id", id).single()

    if (error) {
      console.error("Error fetching factory:", error)
      return {
        id: id,
        factory_id: id,
        factory_name: "資料載入失敗",
        factory_full_name: "",
        supplier_type: "",
        tax_id: "",
        factory_address: "",
        invoice_address: "",
        factory_phone: "",
        factory_fax: "",
        category1: "",
        category2: "",
        category3: "",
      } as Factory
    }

    return data as Factory
  } catch (error) {
    console.error("Error fetching factory:", error)
    return {
      id: id,
      factory_id: id,
      factory_name: "資料載入失敗",
      factory_full_name: "",
      supplier_type: "",
      tax_id: "",
      factory_address: "",
      invoice_address: "",
      factory_phone: "",
      factory_fax: "",
      category1: "",
      category2: "",
      category3: "",
    } as Factory
  }
}

export default async function FactoryDetailsPage({ params }: { params: { id: string } }) {
  const factory = await getFactory(params.id)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/factories">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{factory.factory_name || "供應商詳細資訊"}</h1>
          <Badge variant="outline">{factory.supplier_type || "-"}</Badge>
        </div>
        <Link href={`/factories/${factory.factory_id}/edit`}>
          <Button>
            <FileEdit className="mr-2 h-4 w-4" />
            編輯供應商
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="details">基本資訊</TabsTrigger>
          <TabsTrigger value="certifications">認證資訊</TabsTrigger>
          <TabsTrigger value="compliance">合規狀況</TabsTrigger>
          <TabsTrigger value="notes">備註資訊</TabsTrigger>
          <TabsTrigger value="production">生產紀錄</TabsTrigger>
        </TabsList>

        {/* 基本資訊 */}
        <TabsContent value="details">
          <Card>
            <CardContent className="p-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">供應商編號</dt>
                  <dd className="mt-1 text-sm">{factory.factory_id || "-"}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">供應商簡稱</dt>
                  <dd className="mt-1 text-sm">{factory.factory_name || "-"}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">供應商全名</dt>
                  <dd className="mt-1 text-sm">{factory.factory_full_name || "-"}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">供應商類型</dt>
                  <dd className="mt-1 text-sm">{factory.supplier_type || "-"}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">統一編號</dt>
                  <dd className="mt-1 text-sm">{factory.tax_id || "-"}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">地址</dt>
                  <dd className="mt-1 text-sm">{factory.factory_address || "-"}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">發票地址</dt>
                  <dd className="mt-1 text-sm">{factory.invoice_address || "-"}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">電話</dt>
                  <dd className="mt-1 text-sm">{factory.factory_phone || "-"}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">傳真</dt>
                  <dd className="mt-1 text-sm">{factory.factory_fax || "-"}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">品管聯絡人</dt>
                  <dd className="mt-1 text-sm">{factory.quality_contact1 || "-"}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">備用品管聯絡人</dt>
                  <dd className="mt-1 text-sm">{factory.quality_contact2 || "-"}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">主要分類</dt>
                  <dd className="mt-1 text-sm">{factory.category1 || "-"}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">次要分類</dt>
                  <dd className="mt-1 text-sm">{factory.category2 || "-"}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">第三分類</dt>
                  <dd className="mt-1 text-sm">{factory.category3 || "-"}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">三年內直接/間接往來</dt>
                  <dd className="mt-1 text-sm">{factory.direct_relation_3yrs || "-"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 認證資訊 */}
        <TabsContent value="certifications">
          <Card>
            <CardContent className="p-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">ISO 9001 認證</dt>
                  <dd className="mt-1 text-sm">
                    <Badge variant={factory.iso9001_certified === "是" ? "default" : "secondary"}>
                      {formatCertification(factory.iso9001_certified)}
                    </Badge>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">ISO 9001 有效期至</dt>
                  <dd className="mt-1 text-sm">{formatDate(factory.iso9001_expiry)}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">IATF 16949 認證</dt>
                  <dd className="mt-1 text-sm">
                    <Badge variant={factory.iatf16949_certified === "是" ? "default" : "secondary"}>
                      {formatCertification(factory.iatf16949_certified)}
                    </Badge>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">IATF 16949 有效期至</dt>
                  <dd className="mt-1 text-sm">{formatDate(factory.iatf16949_expiry)}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">ISO 17025 認證</dt>
                  <dd className="mt-1 text-sm">
                    <Badge variant={factory.iso17025_certified === "是" ? "default" : "secondary"}>
                      {formatCertification(factory.iso17025_certified)}
                    </Badge>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">ISO 17025 有效期至</dt>
                  <dd className="mt-1 text-sm">{formatDate(factory.iso17025_expiry)}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">CQI-9 (熱處理) 認證</dt>
                  <dd className="mt-1 text-sm">
                    <Badge variant={factory.cqi9_certified === "是" ? "default" : "secondary"}>
                      {formatCertification(factory.cqi9_certified)}
                    </Badge>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">CQI-9 有效期至</dt>
                  <dd className="mt-1 text-sm">{formatDate(factory.cqi9_expiry)}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">CQI-11 (電鍍) 認證</dt>
                  <dd className="mt-1 text-sm">
                    <Badge variant={factory.cqi11_certified === "是" ? "default" : "secondary"}>
                      {formatCertification(factory.cqi11_certified)}
                    </Badge>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">CQI-11 有效期至</dt>
                  <dd className="mt-1 text-sm">{formatDate(factory.cqi11_expiry)}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">CQI-12 (塗裝) 認證</dt>
                  <dd className="mt-1 text-sm">
                    <Badge variant={factory.cqi12_certified === "是" ? "default" : "secondary"}>
                      {formatCertification(factory.cqi12_certified)}
                    </Badge>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">CQI-12 有效期至</dt>
                  <dd className="mt-1 text-sm">{formatDate(factory.cqi12_expiry)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 合規狀況 */}
        <TabsContent value="compliance">
          <Card>
            <CardContent className="p-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">RoHS 合規狀態</dt>
                  <dd className="mt-1 text-sm">
                    <Badge variant={factory.rohs_compliance === "符合" ? "default" : "secondary"}>
                      {factory.rohs_compliance || "-"}
                    </Badge>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">REACH 合規狀態</dt>
                  <dd className="mt-1 text-sm">
                    <Badge variant={factory.reach_compliance === "符合" ? "default" : "secondary"}>
                      {factory.reach_compliance || "-"}
                    </Badge>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">PFAS 合規狀態</dt>
                  <dd className="mt-1 text-sm">
                    <Badge variant={factory.pfas_compliance === "符合" ? "default" : "secondary"}>
                      {factory.pfas_compliance || "-"}
                    </Badge>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">CMRT 提供狀態</dt>
                  <dd className="mt-1 text-sm">
                    <Badge variant={factory.cmrt_provided === "已提供" ? "default" : "secondary"}>
                      {factory.cmrt_provided || "-"}
                    </Badge>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">TSCA 合規狀態</dt>
                  <dd className="mt-1 text-sm">
                    <Badge variant={factory.tsca_compliance === "符合" ? "default" : "secondary"}>
                      {factory.tsca_compliance || "-"}
                    </Badge>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">EMRT 提供狀態</dt>
                  <dd className="mt-1 text-sm">
                    <Badge variant={factory.emrt_provided === "已提供" ? "default" : "secondary"}>
                      {factory.emrt_provided || "-"}
                    </Badge>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">CP65 合規狀態</dt>
                  <dd className="mt-1 text-sm">
                    <Badge variant={factory.cp65_compliance === "符合" ? "default" : "secondary"}>
                      {factory.cp65_compliance || "-"}
                    </Badge>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">EU POP 合規狀態</dt>
                  <dd className="mt-1 text-sm">
                    <Badge variant={factory.eu_pop_compliance === "符合" ? "default" : "secondary"}>
                      {factory.eu_pop_compliance || "-"}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 備註資訊 */}
        <TabsContent value="notes">
          <Card>
            <CardContent className="p-6">
              <dl className="grid grid-cols-1 gap-6">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">採購單備註提醒</dt>
                  <dd className="mt-1 text-sm whitespace-pre-wrap">{factory.po_reminder_note || "-"}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">合格供應商清單備註</dt>
                  <dd className="mt-1 text-sm whitespace-pre-wrap">{factory.approval_note || "-"}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">停用原因</dt>
                  <dd className="mt-1 text-sm whitespace-pre-wrap">{factory.disabled_reason || "-"}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">舊訂單系統備註</dt>
                  <dd className="mt-1 text-sm whitespace-pre-wrap">{factory.legacy_notes || "-"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 生產紀錄 */}
        <TabsContent value="production">
          <FactoryProductionHistory factoryId={factory.factory_id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
