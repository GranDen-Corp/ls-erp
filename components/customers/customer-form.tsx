"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { supabaseClient } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CustomerFormProps {
  initialData?: any
  customerId?: string
}

interface ExchangeRate {
  id: number
  currency_code: string
  currency_name: string
  rate_to_usd: number
  is_active: boolean
}

interface PaymentTerm {
  id: number
  code: string
  name_en: string
  name_zh: string
  description: string
  is_active: boolean
}

interface TradeTerm {
  id: number
  code: string
  name_en: string
  name_zh: string
  description: string
  is_active: boolean
}

interface TeamMember {
  id: number
  ls_employee_id: string
  name: string
  role?: string
  department?: string
  is_active: boolean
}

interface Port {
  id: string
  region: string
  port_name_zh: string
  port_name_en: string
  un_locode: string
  port_type: string
}

export function CustomerForm({ initialData, customerId }: CustomerFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [formError, setFormError] = useState<string | null>(null)

  // 基本資訊
  const [customerId_field, setCustomerId] = useState("")
  const [customerFullName, setCustomerFullName] = useState("")
  const [customerShortName, setCustomerShortName] = useState("")
  const [groupCode, setGroupCode] = useState("")
  const [divisionLocation, setDivisionLocation] = useState("")
  const [useGroupSetting, setUseGroupSetting] = useState(false)

  // 聯絡資訊
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerFax, setCustomerFax] = useState("")
  const [reportEmail, setReportEmail] = useState("")
  const [invoiceEmail, setInvoiceEmail] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [invoiceAddress, setInvoiceAddress] = useState("")
  const [shipToAddress, setShipToAddress] = useState("")
  const [clientLeadPerson, setClientLeadPerson] = useState("")
  const [clientContactPerson, setClientContactPerson] = useState("")
  const [clientProcurement, setClientProcurement] = useState("")
  const [clientSales, setClientSales] = useState("")
  const [salesRepresentative, setSalesRepresentative] = useState("")
  const [logisticsCoordinator, setLogisticsCoordinator] = useState("")

  // 財務資訊
  const [currency, setCurrency] = useState("USD")
  const [exchangeRate, setExchangeRate] = useState(1)
  const [paymentDays, setPaymentDays] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("")
  const [paymentTermsSpecification, setPaymentTermsSpecification] = useState("")
  const [tradeTerms, setTradeTerms] = useState("")
  const [tradeTermsSpecification, setTradeTermsSpecification] = useState("")

  // 選項資料
  const [paymentTermOptions, setPaymentTermOptions] = useState<PaymentTerm[]>([])
  const [tradeTermOptions, setTradeTermOptions] = useState<TradeTerm[]>([])
  const [exchangeRateOptions, setExchangeRateOptions] = useState<ExchangeRate[]>([])
  const [teamMemberOptions, setTeamMemberOptions] = useState<TeamMember[]>([])
  const [portOptions, setPortOptions] = useState<Port[]>([])

  // 包裝與出貨
  const [groupPackagingDefault, setGroupPackagingDefault] = useState("")
  const [orderPackagingDisplay, setOrderPackagingDisplay] = useState("")
  const [customerPackaging, setCustomerPackaging] = useState("")
  const [packagingDetails, setPackagingDetails] = useState("")
  const [packingInfo, setPackingInfo] = useState("")
  const [palletFormat, setPalletFormat] = useState("")
  const [cartonFormat, setCartonFormat] = useState("")
  const [maxCartonWeight, setMaxCartonWeight] = useState(0)
  const [scShippingMark, setScShippingMark] = useState("")
  const [labels, setLabels] = useState("")

  // 品質與報告
  const [qtyAllowancePercent, setQtyAllowancePercent] = useState(0)
  const [acceptancePercent, setAcceptancePercent] = useState(0)
  const [reportType, setReportType] = useState("")
  const [requireReport, setRequireReport] = useState(false)
  const [cbamNote, setCbamNote] = useState("")
  const [legacySystemNote, setLegacySystemNote] = useState("")

  // 其他欄位
  const [forwarder, setForwarder] = useState("")
  const [remarks, setRemarks] = useState("")
  const [clientContactPersonEmail, setClientContactPersonEmail] = useState("")
  const [portOfDischargeDefault, setPortOfDischargeDefault] = useState("")

  // 載入所有選項資料
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // 載入匯率選項
        const { data: exchangeData, error: exchangeError } = await supabaseClient
          .from("exchange_rates")
          .select("*")
          .eq("is_active", true)
          .order("currency_code", { ascending: true })

        if (!exchangeError && exchangeData) {
          setExchangeRateOptions(exchangeData)
        }

        // 載入付款條件選項
        const { data: paymentData, error: paymentError } = await supabaseClient
          .from("payment_terms")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })

        if (!paymentError && paymentData) {
          setPaymentTermOptions(paymentData)
        }

        // 載入交貨條件選項
        const { data: tradeData, error: tradeError } = await supabaseClient
          .from("trade_terms")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })

        if (!tradeError && tradeData) {
          setTradeTermOptions(tradeData)
        }

        // 載入團隊成員選項
        const { data: teamData, error: teamError } = await supabaseClient
          .from("team_members")
          .select("*")
          .eq("is_active", true)
          .order("name", { ascending: true })

        if (!teamError && teamData) {
          setTeamMemberOptions(teamData)
        }

        // 載入港口選項 - 修正欄位名稱
        const { data: portData, error: portError } = await supabaseClient
          .from("ports")
          .select("id, region, port_name_zh, port_name_en, un_locode, port_type")
          .order("region", { ascending: true })
          .order("port_name_zh", { ascending: true })

        if (!portError && portData) {
          setPortOptions(portData)
        } else if (portError) {
          console.error("載入港口選項時發生錯誤:", portError)
        }
      } catch (error) {
        console.error("載入選項資料時出錯:", error)
      }
    }

    loadOptions()
  }, [])

  // 當 initialData 變更時更新狀態
  useEffect(() => {
    if (initialData) {
      console.log("載入的客戶資料:", initialData)

      // 基本資訊
      setCustomerId(initialData.customer_id || initialData.id || "")
      setCustomerFullName(initialData.customer_full_name || initialData.name || "")
      setCustomerShortName(initialData.customer_short_name || initialData.shortName || initialData.short_name || "")
      setGroupCode(initialData.group_code || initialData.groupTag || initialData.group_tag || "")
      setDivisionLocation(initialData.division_location || initialData.country || "")
      setUseGroupSetting(initialData.use_group_setting === true || initialData.use_group_setting === "true")

      // 聯絡資訊
      setCustomerPhone(initialData.customer_phone || initialData.phone || "")
      setCustomerFax(initialData.customer_fax || initialData.fax || "")
      setReportEmail(initialData.report_email || "")
      setInvoiceEmail(initialData.invoice_email || initialData.email || "")
      setCustomerAddress(initialData.customer_address || initialData.address || "")
      setInvoiceAddress(initialData.invoice_address || "")
      setShipToAddress(initialData.ship_to_address || "")
      setClientLeadPerson(initialData.client_lead_person || "")
      setClientContactPerson(
        initialData.client_contact_person || initialData.contactPerson || initialData.contact_person || "",
      )
      setClientProcurement(initialData.client_procurement || "")
      setClientSales(initialData.client_sales || "")
      setSalesRepresentative(initialData.sales_representative || "")
      setLogisticsCoordinator(initialData.logistics_coordinator || "")
      setClientContactPersonEmail(initialData.client_contact_person_email || "")

      // 財務資訊
      setCurrency(initialData.currency || "USD")
      setExchangeRate(Number(initialData.exchange_rate) || 1)
      setPaymentDays(initialData.payment_due_date || "")
      setPaymentTerms(initialData.payment_terms || "")
      setPaymentTermsSpecification(initialData.payment_terms_specification || initialData.payment_condition || "")
      setTradeTerms(initialData.trade_terms || initialData.delivery_terms || "")
      setTradeTermsSpecification(initialData.trade_terms_specification || "")

      // 包裝與出貨
      setGroupPackagingDefault(initialData.group_packaging_default || "")
      setOrderPackagingDisplay(initialData.order_packaging_display || "")
      setCustomerPackaging(initialData.customer_packaging || "")
      setPackagingDetails(initialData.packaging_details || "")
      setPackingInfo(initialData.packing_info || "")
      setPalletFormat(initialData.pallet_format || "")
      setCartonFormat(initialData.carton_format || "")
      setMaxCartonWeight(Number(initialData.max_carton_weight) || 0)
      setScShippingMark(initialData.sc_shipping_mark || "")
      setLabels(initialData.labels || "")
      setForwarder(initialData.forwarder || "")
      setPortOfDischargeDefault(initialData.port_of_discharge_default || "")

      // 品質與報告
      setQtyAllowancePercent(Number(initialData.qty_allowance_percent) || 0)
      setAcceptancePercent(Number(initialData.acceptance_percent) || 0)
      setReportType(initialData.report_type || "")
      setRequireReport(initialData.require_report === true || initialData.require_report === "true")
      setCbamNote(initialData.cbam_note || "")
      setLegacySystemNote(initialData.legacy_system_note || "")
      setRemarks(initialData.remarks || "")

      console.log("設定預設到貨港:", initialData.port_of_discharge_default)
    }
  }, [initialData])

  // 處理幣別變更
  const handleCurrencyChange = (selectedCurrency: string) => {
    setCurrency(selectedCurrency)
    const selectedRate = exchangeRateOptions.find((rate) => rate.currency_code === selectedCurrency)
    if (selectedRate) {
      setExchangeRate(selectedRate.rate_to_usd)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError(null)

    // 驗證必填欄位
    if (!customerId_field.trim()) {
      setFormError("客戶編號為必填欄位")
      setActiveTab("basic")
      setIsSubmitting(false)
      return
    }

    if (!customerFullName.trim()) {
      setFormError("客戶全名為必填欄位")
      setActiveTab("basic")
      setIsSubmitting(false)
      return
    }

    try {
      const customerData = {
        customer_id: customerId_field,
        customer_full_name: customerFullName,
        customer_short_name: customerShortName,
        group_code: groupCode,
        division_location: divisionLocation,
        use_group_setting: useGroupSetting,
        customer_phone: customerPhone,
        customer_fax: customerFax,
        report_email: reportEmail,
        invoice_email: invoiceEmail,
        customer_address: customerAddress,
        invoice_address: invoiceAddress,
        ship_to_address: shipToAddress,
        client_lead_person: clientLeadPerson,
        client_contact_person: clientContactPerson,
        client_procurement: clientProcurement,
        client_sales: clientSales,
        sales_representative: salesRepresentative,
        logistics_coordinator: logisticsCoordinator,
        client_contact_person_email: clientContactPersonEmail,
        currency,
        exchange_rate: exchangeRate,
        payment_due_date: paymentDays,
        payment_terms: paymentTerms,
        payment_terms_specification: paymentTermsSpecification,
        trade_terms: tradeTerms,
        trade_terms_specification: tradeTermsSpecification,
        group_packaging_default: groupPackagingDefault,
        order_packaging_display: orderPackagingDisplay,
        customer_packaging: customerPackaging,
        packaging_details: packagingDetails,
        packing_info: packingInfo,
        pallet_format: palletFormat,
        carton_format: cartonFormat,
        max_carton_weight: maxCartonWeight,
        sc_shipping_mark: scShippingMark,
        labels,
        port_of_discharge_default: portOfDischargeDefault,
        qty_allowance_percent: qtyAllowancePercent,
        acceptance_percent: acceptancePercent,
        report_type: reportType,
        require_report: requireReport,
        cbam_note: cbamNote,
        legacy_system_note: legacySystemNote,
        forwarder,
        remarks,
      }

      let result

      if (customerId) {
        result = await supabaseClient.from("customers").update(customerData).eq("customer_id", customerId)
      } else {
        result = await supabaseClient.from("customers").insert([
          {
            ...customerData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
      }

      if (result.error) {
        throw new Error(result.error.message)
      }

      toast({
        title: customerId ? "客戶更新成功" : "客戶創建成功",
        description: `客戶 ${customerFullName} 已${customerId ? "更新" : "創建"}`,
      })

      router.push("/customers/all")
      router.refresh()
    } catch (error) {
      console.error("保存客戶時出錯:", error)
      setFormError(error instanceof Error ? error.message : "保存客戶失敗，請稍後再試")
      toast({
        title: "錯誤",
        description: `保存客戶失敗: ${error instanceof Error ? error.message : "未知錯誤"}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">基本資訊</TabsTrigger>
          <TabsTrigger value="contact">聯絡資訊</TabsTrigger>
          <TabsTrigger value="financial">財務資訊</TabsTrigger>
          <TabsTrigger value="packaging">包裝與出貨</TabsTrigger>
          <TabsTrigger value="quality">品質與報告</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>基本資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">客戶編號 *</Label>
                  <Input
                    id="customerId"
                    value={customerId_field}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                    disabled={!!customerId}
                    placeholder="例如: CUST001"
                  />
                  {customerId && <p className="text-sm text-muted-foreground">客戶編號不可修改</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerFullName">客戶全名 *</Label>
                  <Input
                    id="customerFullName"
                    value={customerFullName}
                    onChange={(e) => setCustomerFullName(e.target.value)}
                    required
                    placeholder="例如: 台灣科技股份有限公司"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerShortName">客戶簡稱</Label>
                  <Input
                    id="customerShortName"
                    value={customerShortName}
                    onChange={(e) => setCustomerShortName(e.target.value)}
                    placeholder="例如: 台科"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="groupCode">集團代號</Label>
                  <Input
                    id="groupCode"
                    value={groupCode}
                    onChange={(e) => setGroupCode(e.target.value)}
                    placeholder="例如: TG-01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="divisionLocation">分部位置</Label>
                  <Input
                    id="divisionLocation"
                    value={divisionLocation}
                    onChange={(e) => setDivisionLocation(e.target.value)}
                    placeholder="例如: 台北"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="useGroupSetting">使用集團設定</Label>
                    <Switch id="useGroupSetting" checked={useGroupSetting} onCheckedChange={setUseGroupSetting} />
                  </div>
                  <p className="text-sm text-muted-foreground">啟用後將使用集團的預設設定</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="remarks">備註</Label>
                  <Textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="例如: 特殊要求或注意事項"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packaging" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>包裝與出貨</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="portOfDischargeDefault">預設到貨港</Label>
                  <Select value={portOfDischargeDefault} onValueChange={setPortOfDischargeDefault}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇預設到貨港" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">-- 請選擇港口 --</SelectItem>
                      {portOptions.map((port) => (
                        <SelectItem key={port.un_locode} value={port.un_locode}>
                          {port.port_name_zh} ({port.un_locode}) - {port.region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">選擇客戶的預設到貨港口</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => router.push("/customers/all")} disabled={isSubmitting}>
          取消
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              處理中...
            </>
          ) : customerId ? (
            "更新客戶"
          ) : (
            "創建客戶"
          )}
        </Button>
      </div>
    </form>
  )
}

// 命名導出

// 預設導出
export default CustomerForm
