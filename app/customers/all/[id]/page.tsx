import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileEdit } from "lucide-react"
import Link from "next/link"
import CustomerOrderHistory from "@/components/customers/customer-order-history"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Customer } from "@/types/customer"
import { supabaseClient } from "@/lib/supabase-client"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "客戶詳情",
  description: "查看客戶詳細資料",
}

// 獲取客戶數據的函數
async function getCustomer(id: string): Promise<Customer> {
  try {
    const { data, error } = await supabaseClient.from("customers").select("*").eq("customer_id", id).single()

    if (error) {
      console.error("獲取客戶資料時出錯:", error)
      throw new Error(error.message)
    }

    if (!data) {
      notFound()
    }

    return {
      id: data.customer_id,
      name: data.customer_full_name,
      contactPerson: data.client_contact_person || "",
      email: data.report_email || "",
      phone: data.customer_phone || "",
      address: data.customer_address || "",
      country: data.division_location || "",
      paymentTerms: data.payment_term || "",
      creditLimit: 0,
      currency: data.currency || "",
      status: "active",
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString(),
      sales_representative: data.sales_representative || "",
      ...data, // 包含所有其他字段
    }
  } catch (error) {
    console.error("獲取客戶資料時出錯:", error)
    notFound()
  }
}

// 獲取團隊成員名稱的函數
async function getTeamMemberName(employeeId: string): Promise<string> {
  if (!employeeId) return ""

  try {
    const { data, error } = await supabaseClient
      .from("team_members")
      .select("name")
      .eq("ls_employee_id", employeeId)
      .single()

    if (!error && data) {
      return data.name
    }
    return employeeId // 如果找不到，返回員工ID
  } catch (error) {
    return employeeId
  }
}

// 獲取幣別名稱的函數
async function getCurrencyName(currencyCode: string): Promise<string> {
  try {
    const { data, error } = await supabaseClient
      .from("exchange_rates")
      .select("currency_name")
      .eq("currency_code", currencyCode)
      .single()

    if (!error && data) {
      return data.currency_name
    }
    return currencyCode // 如果找不到，返回代碼
  } catch (error) {
    return currencyCode
  }
}

// 獲取付款方式名稱的函數
async function getPaymentTermName(code: string): Promise<string> {
  try {
    const { data, error } = await supabaseClient
      .from("payment_terms")
      .select("name_zh, name_en")
      .eq("code", code)
      .single()

    if (!error && data) {
      return `${data.name_zh} (${code})`
    }
    return code
  } catch (error) {
    return code
  }
}

// 獲取交貨方式名稱的函數
async function getTradeTermName(code: string): Promise<string> {
  try {
    const { data, error } = await supabaseClient
      .from("trade_terms")
      .select("name_zh, name_en")
      .eq("code", code)
      .single()

    if (!error && data) {
      return `${data.name_zh} (${code})`
    }
    return code
  } catch (error) {
    return code
  }
}

// 獲取港口名稱的函數
async function getPortName(unLocode: string): Promise<string> {
  if (!unLocode) return ""

  try {
    const { data, error } = await supabaseClient
      .from("ports")
      .select("port_name_zh, port_name_en, region")
      .eq("un_locode", unLocode)
      .single()

    if (!error && data) {
      return `${data.port_name_zh} (${unLocode}) - ${data.region}`
    }
    return unLocode // 如果找不到，返回UN/LOCODE
  } catch (error) {
    return unLocode
  }
}

export default async function CustomerDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const customer = await getCustomer(params.id)
  const currencyName = customer.currency ? await getCurrencyName(customer.currency) : ""
  const paymentTermName = customer.payment_terms ? await getPaymentTermName(customer.payment_terms) : ""
  const tradeTermName = customer.trade_terms ? await getTradeTermName(customer.trade_terms) : ""
  const salesRepresentativeName = customer.sales_representative
    ? await getTeamMemberName(customer.sales_representative)
    : ""
  const logisticsCoordinatorName = customer.logistics_coordinator
    ? await getTeamMemberName(customer.logistics_coordinator)
    : ""
  const portOfDischargeName = customer.port_of_discharge_default
    ? await getPortName(customer.port_of_discharge_default)
    : ""

  // 格式化日期的輔助函數
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    try {
      return new Date(dateString).toLocaleDateString("zh-TW")
    } catch (e) {
      return dateString
    }
  }

  // 格式化布爾值的輔助函數
  const formatBoolean = (value?: boolean) => {
    if (value === undefined || value === null) return "-"
    return value ? "是" : "否"
  }

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/customers/all">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回客戶列表
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{customer.customer_short_name || customer.name}</h1>
          <div className="ml-2">
            <Link href={`/customers/all/${customer.id}/edit`}>
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
          <TabsTrigger value="contact">聯絡資訊</TabsTrigger>
          <TabsTrigger value="financial">財務資訊</TabsTrigger>
          <TabsTrigger value="packaging">包裝與出貨</TabsTrigger>
          <TabsTrigger value="quality">品質與報告</TabsTrigger>
          <TabsTrigger value="orders">訂單歷史</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>基本資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">客戶編號</p>
                  <p>{customer.customer_id || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">客戶簡稱</p>
                  <p>{customer.customer_short_name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">客戶全名</p>
                  <p>{customer.customer_full_name || customer.name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">集團代號</p>
                  <p>
                    {customer.group_code ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {customer.group_code}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">分部位置</p>
                  <p>{customer.division_location || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">使用集團設定</p>
                  <p>{formatBoolean(customer.use_group_setting)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">建立時間</p>
                  <p>{formatDate(customer.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">最後更新</p>
                  <p>{formatDate(customer.updatedAt)}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">備註</p>
                  <p className="whitespace-pre-wrap">{customer.remarks || "-"}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">客戶電話</p>
                  <p>{customer.customer_phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">客戶傳真</p>
                  <p>{customer.customer_fax || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">報告 Email</p>
                  <p>{customer.report_email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">發票 Email</p>
                  <p>{customer.invoice_email || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">客戶地址</p>
                  <p>{customer.customer_address || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">發票地址</p>
                  <p>{customer.invoice_address || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Ship to 地址</p>
                  <p>{customer.ship_to_address || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">客戶負責人</p>
                  <p>{customer.client_lead_person || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">客戶聯絡人</p>
                  <p>{customer.client_contact_person || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">客戶聯絡人Email</p>
                  <p>{customer.client_contact_person_email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">客戶採購</p>
                  <p>{customer.client_procurement || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">客戶業務</p>
                  <p>{customer.client_sales || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">負責業務</p>
                  <p>
                    {salesRepresentativeName
                      ? `${salesRepresentativeName} (${customer.sales_representative})`
                      : customer.sales_representative || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">負責船務</p>
                  <p>
                    {logisticsCoordinatorName
                      ? `${logisticsCoordinatorName} (${customer.logistics_coordinator})`
                      : customer.logistics_coordinator || "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>財務資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">幣別</p>
                  <p>{currencyName ? `${currencyName} (${customer.currency})` : customer.currency || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">匯率 (對美元)</p>
                  <p>{customer.exchange_rate || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">付款天數</p>
                  <p>{customer.payment_due_date ? `${customer.payment_due_date} 天` : "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">付款方式</p>
                  <p>{paymentTermName || customer.payment_terms || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">付款條件</p>
                  <p className="whitespace-pre-wrap">{customer.payment_terms_specification || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">交貨方式</p>
                  <p>{tradeTermName || customer.trade_terms || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">交貨條件</p>
                  <p className="whitespace-pre-wrap">{customer.trade_terms_specification || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packaging" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>包裝與出貨</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">集團包裝要求(代入)</p>
                  <p>{customer.group_packaging_default || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">訂單包裝要求(顯示)</p>
                  <p>{customer.order_packaging_display || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">客戶包裝要求</p>
                  <p className="whitespace-pre-wrap">{customer.customer_packaging || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">包裝資訊</p>
                  <p className="whitespace-pre-wrap">{customer.packaging_details || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Packing info</p>
                  <p className="whitespace-pre-wrap">{customer.packing_info || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">棧板格式</p>
                  <p>{customer.pallet_format || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">紙箱格式</p>
                  <p>{customer.carton_format || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">整箱重量 max</p>
                  <p>{customer.max_carton_weight ? `${customer.max_carton_weight} kg` : "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">SC shipping mark</p>
                  <p>{customer.sc_shipping_mark || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">標籤</p>
                  <p>{customer.labels || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">轉運商</p>
                  <p>{customer.forwarder || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">預設到貨港</p>
                  <p>{portOfDischargeName || customer.port_of_discharge_default || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>品質與報告</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Q'ty Allowance%</p>
                  <p>{customer.qty_allowance_percent !== undefined ? `${customer.qty_allowance_percent}%` : "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">允收量%</p>
                  <p>{customer.acceptance_percent !== undefined ? `${customer.acceptance_percent}%` : "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reports</p>
                  <p>{customer.report_type || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">索取報告</p>
                  <p>{formatBoolean(customer.require_report)}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">出歐洲 CBAM note</p>
                  <p className="whitespace-pre-wrap">{customer.cbam_note || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">舊系統備註</p>
                  <p className="whitespace-pre-wrap">{customer.legacy_system_note || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <CustomerOrderHistory customerId={customer.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
