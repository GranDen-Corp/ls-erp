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
  const [currency, setCurrency] = useState("USD") // 預設為USD
  const [exchangeRate, setExchangeRate] = useState(1)
  const [paymentDays, setPaymentDays] = useState("") // 改為付款天數
  const [paymentTerms, setPaymentTerms] = useState("")
  const [paymentTermsSpecification, setPaymentTermsSpecification] = useState("")
  const [tradeTerms, setTradeTerms] = useState("")
  const [tradeTermsSpecification, setTradeTermsSpecification] = useState("")

  // 付款和交貨條件選項資料
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

  // 在其他狀態變數後面添加
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

        // 載入港口選項
        const { data: portData, error: portError } = await supabaseClient
          .from("ports")
          .select("*")
          .order("region", { ascending: true })
          .order("port_name_zh", { ascending: true })

        if (!portError && portData) {
          setPortOptions(portData)
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
      // 基本資訊 - 優先使用新的欄位名稱，然後回退到舊的欄位名稱
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

      // 財務資訊
      setCurrency(initialData.currency || "USD")
      setExchangeRate(Number(initialData.exchange_rate) || 1)
      setPaymentDays(initialData.payment_due_date || "") // 改為付款天數
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

      // 品質與報告
      setQtyAllowancePercent(Number(initialData.qty_allowance_percent) || 0)
      setAcceptancePercent(Number(initialData.acceptance_percent) || 0)
      setReportType(initialData.report_type || "")
      setRequireReport(initialData.require_report === true || initialData.require_report === "true")
      setCbamNote(initialData.cbam_note || "")
      setLegacySystemNote(initialData.legacy_system_note || "")

      // 在其他欄位初始化後面添加
      setClientContactPersonEmail(initialData.client_contact_person_email || "")
      setPortOfDischargeDefault(initialData.port_of_discharge_default || "")
      // 在其他欄位初始化後面添加
      setForwarder(initialData.forwarder || "")
      setRemarks(initialData.remarks || "")

      // 在 useEffect 的最後部分，確保正確設定預設到貨港
      setPortOfDischargeDefault(initialData.port_of_discharge_default || "")

      // 添加調試日誌
      console.log("設定預設到貨港 UN/LOCODE:", initialData.port_of_discharge_default)
    }
  }, [initialData])

  // 處理幣別變更
  const handleCurrencyChange = (selectedCurrency: string) => {
    setCurrency(selectedCurrency)

    // 自動設定匯率
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

        // 聯絡資訊
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
        // 在 logistics_coordinator 後面添加
        client_contact_person_email: clientContactPersonEmail,

        // 財務資訊
        currency,
        exchange_rate: exchangeRate,
        payment_due_date: paymentDays, // 改為付款天數
        payment_terms: paymentTerms,
        payment_terms_specification: paymentTermsSpecification,
        trade_terms: tradeTerms,
        trade_terms_specification: tradeTermsSpecification,

        // 包裝與出貨
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
        // 在 labels 後面添加
        port_of_discharge_default: portOfDischargeDefault,

        // 品質與報告
        qty_allowance_percent: qtyAllowancePercent,
        acceptance_percent: acceptancePercent,
        report_type: reportType,
        require_report: requireReport,
        cbam_note: cbamNote,
        legacy_system_note: legacySystemNote,
        // 在 legacy_system_note 後面添加
        forwarder,
        remarks,
      }

      let result

      if (customerId) {
        // 更新現有客戶
        result = await supabaseClient.from("customers").update(customerData).eq("customer_id", customerId)
      } else {
        // 新增客戶
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

      // 成功訊息
      console.log(`客戶 ${customerFullName} 已${customerId ? "更新" : "創建"}`)
      alert(`客戶 ${customerFullName} 已${customerId ? "更新" : "創建"}成功！`)

      router.push("/customers/all")
      router.refresh()
    } catch (error) {
      console.error("保存客戶時出錯:", error)
      const errorMessage = error instanceof Error ? error.message : "保存客戶失敗，請稍後再試"
      setFormError(errorMessage)
      alert(`保存客戶失敗: ${errorMessage}`)
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
                  <Label htmlFor="customerShortName">客戶簡稱</Label>
                  <Input
                    id="customerShortName"
                    value={customerShortName}
                    onChange={(e) => setCustomerShortName(e.target.value)}
                    placeholder="例如: 台科"
                  />
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
                {/* 在 "basic" TabsContent 中（約第 400 行附近），在最後一個 div 後面添加備註欄位： */}
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

        <TabsContent value="contact" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>聯絡資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">客戶電話</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="例如: 02-12345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerFax">客戶傳真</Label>
                  <Input
                    id="customerFax"
                    value={customerFax}
                    onChange={(e) => setCustomerFax(e.target.value)}
                    placeholder="例如: 02-87654321"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportEmail">報告 Email</Label>
                  <Input
                    id="reportEmail"
                    type="email"
                    value={reportEmail}
                    onChange={(e) => setReportEmail(e.target.value)}
                    placeholder="例如: report@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceEmail">發票 Email</Label>
                  <Input
                    id="invoiceEmail"
                    type="email"
                    value={invoiceEmail}
                    onChange={(e) => setInvoiceEmail(e.target.value)}
                    placeholder="例如: invoice@example.com"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="customerAddress">客戶地址</Label>
                  <Input
                    id="customerAddress"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="例如: 台北市信義區信義路五段7號"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="invoiceAddress">發票地址</Label>
                  <Input
                    id="invoiceAddress"
                    value={invoiceAddress}
                    onChange={(e) => setInvoiceAddress(e.target.value)}
                    placeholder="例如: 台北市信義區信義路五段7號"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="shipToAddress">Ship to 地址</Label>
                  <Input
                    id="shipToAddress"
                    value={shipToAddress}
                    onChange={(e) => setShipToAddress(e.target.value)}
                    placeholder="例如: 台北市信義區信義路五段7號"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientLeadPerson">客戶負責人</Label>
                  <Input
                    id="clientLeadPerson"
                    value={clientLeadPerson}
                    onChange={(e) => setClientLeadPerson(e.target.value)}
                    placeholder="例如: 張三"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientContactPerson">客戶聯絡人</Label>
                  <Input
                    id="clientContactPerson"
                    value={clientContactPerson}
                    onChange={(e) => setClientContactPerson(e.target.value)}
                    placeholder="例如: 李四"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientContactPersonEmail">客戶聯絡人 Email</Label>
                  <Input
                    id="clientContactPersonEmail"
                    type="email"
                    value={clientContactPersonEmail}
                    onChange={(e) => setClientContactPersonEmail(e.target.value)}
                    placeholder="例如: lisi@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientProcurement">客戶採購</Label>
                  <Input
                    id="clientProcurement"
                    value={clientProcurement}
                    onChange={(e) => setClientProcurement(e.target.value)}
                    placeholder="例如: 王五"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientSales">客戶業務</Label>
                  <Input
                    id="clientSales"
                    value={clientSales}
                    onChange={(e) => setClientSales(e.target.value)}
                    placeholder="例如: 趙六"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salesRepresentative">負責業務</Label>
                  <Select value={salesRepresentative} onValueChange={setSalesRepresentative}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇負責業務" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMemberOptions.map((member) => (
                        <SelectItem key={member.ls_employee_id} value={member.ls_employee_id}>
                          {member.name} ({member.ls_employee_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logisticsCoordinator">負責船務</Label>
                  <Select value={logisticsCoordinator} onValueChange={setLogisticsCoordinator}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇負責船務" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMemberOptions.map((member) => (
                        <SelectItem key={member.ls_employee_id} value={member.ls_employee_id}>
                          {member.name} ({member.ls_employee_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>財務資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">幣別</Label>
                  <Select value={currency} onValueChange={handleCurrencyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇幣別" />
                    </SelectTrigger>
                    <SelectContent>
                      {exchangeRateOptions.map((option) => (
                        <SelectItem key={option.currency_code} value={option.currency_code}>
                          {option.currency_name} ({option.currency_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exchangeRate">匯率 (對美元)</Label>
                  <Input
                    id="exchangeRate"
                    type="number"
                    step="0.0001"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number.parseFloat(e.target.value) || 1)}
                    placeholder="例如: 30.5"
                  />
                  <p className="text-sm text-muted-foreground">選擇幣別後會自動填入當前匯率，仍可手動修改</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentDays">付款天數</Label>
                  <Input
                    id="paymentDays"
                    type="number"
                    value={paymentDays}
                    onChange={(e) => setPaymentDays(e.target.value)}
                    placeholder="例如: 30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">付款方式</Label>
                  <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇付款方式" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTermOptions.map((option) => (
                        <SelectItem key={option.code} value={option.code}>
                          {option.name_zh} ({option.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTermsSpecification">付款條件</Label>
                  <Textarea
                    id="paymentTermsSpecification"
                    value={paymentTermsSpecification}
                    onChange={(e) => setPaymentTermsSpecification(e.target.value)}
                    placeholder="例如: 月結30天"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tradeTerms">交貨方式</Label>
                  <Select value={tradeTerms} onValueChange={setTradeTerms}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇交貨方式" />
                    </SelectTrigger>
                    <SelectContent>
                      {tradeTermOptions.map((option) => (
                        <SelectItem key={option.code} value={option.code}>
                          {option.name_zh} ({option.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tradeTermsSpecification">交貨條件</Label>
                  <Textarea
                    id="tradeTermsSpecification"
                    value={tradeTermsSpecification}
                    onChange={(e) => setTradeTermsSpecification(e.target.value)}
                    placeholder="例如: 指定港口交貨"
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
                  <Label htmlFor="groupPackagingDefault">集團包裝要求(代入)</Label>
                  <Input
                    id="groupPackagingDefault"
                    value={groupPackagingDefault}
                    onChange={(e) => setGroupPackagingDefault(e.target.value)}
                    placeholder="例如: 標準包裝"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderPackagingDisplay">訂單包裝要求(顯示)</Label>
                  <Input
                    id="orderPackagingDisplay"
                    value={orderPackagingDisplay}
                    onChange={(e) => setOrderPackagingDisplay(e.target.value)}
                    placeholder="例如: 標準包裝"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="customerPackaging">客戶包裝要求</Label>
                  <Textarea
                    id="customerPackaging"
                    value={customerPackaging}
                    onChange={(e) => setCustomerPackaging(e.target.value)}
                    placeholder="例如: 每箱不超過20kg，需使用防潮包裝"
                    rows={3}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="packagingDetails">包裝資訊</Label>
                  <Textarea
                    id="packagingDetails"
                    value={packagingDetails}
                    onChange={(e) => setPackagingDetails(e.target.value)}
                    placeholder="例如: 每箱需標示產品編號、數量、重量"
                    rows={3}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="packingInfo">Packing info</Label>
                  <Textarea
                    id="packingInfo"
                    value={packingInfo}
                    onChange={(e) => setPackingInfo(e.target.value)}
                    placeholder="例如: 每箱需標示產品編號、數量、重量"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="palletFormat">棧板格式</Label>
                  <Input
                    id="palletFormat"
                    value={palletFormat}
                    onChange={(e) => setPalletFormat(e.target.value)}
                    placeholder="例如: 歐規棧板"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cartonFormat">紙箱格式</Label>
                  <Input
                    id="cartonFormat"
                    value={cartonFormat}
                    onChange={(e) => setCartonFormat(e.target.value)}
                    placeholder="例如: 五層瓦楞紙箱"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxCartonWeight">整箱重量 max (kg)</Label>
                  <Input
                    id="maxCartonWeight"
                    type="number"
                    value={maxCartonWeight}
                    onChange={(e) => setMaxCartonWeight(Number.parseFloat(e.target.value) || 0)}
                    placeholder="例如: 20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scShippingMark">SC shipping mark</Label>
                  <Input
                    id="scShippingMark"
                    value={scShippingMark}
                    onChange={(e) => setScShippingMark(e.target.value)}
                    placeholder="例如: SC-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="labels">標籤</Label>
                  <Input
                    id="labels"
                    value={labels}
                    onChange={(e) => setLabels(e.target.value)}
                    placeholder="例如: 產品標籤、警告標籤"
                  />
                </div>
                {/* 在 "packaging" TabsContent 中（約第 600 行附近），在 labels 欄位後面添加轉運商欄位： */}
                <div className="space-y-2">
                  <Label htmlFor="forwarder">轉運商</Label>
                  <Input
                    id="forwarder"
                    value={forwarder}
                    onChange={(e) => setForwarder(e.target.value)}
                    placeholder="例如: DHL, FedEx, UPS"
                  />
                </div>
                {/* 在 "packaging" TabsContent 中，在轉運商欄位後面添加預設到貨港欄位 */}
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
                  {portOfDischargeDefault && (
                    <p className="text-sm text-muted-foreground">
                      當前選中:{" "}
                      {portOptions.find((p) => p.un_locode === portOfDischargeDefault)?.port_name_zh ||
                        portOfDischargeDefault}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>品質與報告</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qtyAllowancePercent">Q'ty Allowance (%)</Label>
                  <Input
                    id="qtyAllowancePercent"
                    type="number"
                    step="0.1"
                    value={qtyAllowancePercent}
                    onChange={(e) => setQtyAllowancePercent(Number.parseFloat(e.target.value) || 0)}
                    placeholder="例如: 5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acceptancePercent">允收量 (%)</Label>
                  <Input
                    id="acceptancePercent"
                    type="number"
                    step="0.1"
                    value={acceptancePercent}
                    onChange={(e) => setAcceptancePercent(Number.parseFloat(e.target.value) || 0)}
                    placeholder="例如: 95"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportType">Reports</Label>
                  <Input
                    id="reportType"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    placeholder="例如: 品質報告、測試報告"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireReport">索取報告</Label>
                    <Switch id="requireReport" checked={requireReport} onCheckedChange={setRequireReport} />
                  </div>
                  <p className="text-sm text-muted-foreground">是否需要提供報告</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="cbamNote">出歐洲 CBAM note</Label>
                  <Textarea
                    id="cbamNote"
                    value={cbamNote}
                    onChange={(e) => setCbamNote(e.target.value)}
                    placeholder="例如: 需符合歐盟碳邊境調整機制要求"
                    rows={3}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="legacySystemNote">舊系統備註</Label>
                  <Textarea
                    id="legacySystemNote"
                    value={legacySystemNote}
                    onChange={(e) => setLegacySystemNote(e.target.value)}
                    placeholder="例如: 從舊系統遷移的備註資訊"
                    rows={3}
                  />
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
