"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, FileJson, RefreshCw, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

// 定義客戶類型（如果沒有types/customer.ts文件）
type Customer = {
  customer_id: string
  use_group_setting: boolean | string
  group_packaging_default: string
  order_packaging_display: string
  customer_short_name: string
  report_email: string
  customer_packaging: string
  group_code: string
  sales_representative: string
  division_location: string
  currency: string
  customer_full_name: string
  exchange_rate: number
  customer_address: string
  payment_due_date: string
  customer_phone: string
  invoice_address: string
  customer_fax: string
  invoice_email: string
  supplier_phone: string
  supplier_fax: string
  client_lead_person: string
  client_contact_person: string
  supplier_contact_person: string
  client_procurement: string
  client_sales: string
  logistics_coordinator: string
  labels: string
  pallet_format: string
  cbam_note: string
  sc_shipping_mark: string
  carton_format: string
  ship_to_address: string
  max_carton_weight: number
  payment_term: string
  delivery_terms: string
  packing_info: string
  payment_condition: string
  qty_allowance_percent: number
  packaging_details: string
  report_type: string
  acceptance_percent: number
  require_report: boolean | string
  legacy_system_note: string
}

// 模擬客戶資料 - 螺絲軸承貿易公司
const customerData: Customer[] = [
  {
    customer_id: "C001",
    use_group_setting: false,
    group_packaging_default: "",
    order_packaging_display: "標準工業包裝",
    customer_short_name: "台灣精密機械",
    report_email: "quality@tpm.com.tw",
    customer_packaging: "防潮包裝，每箱不超過20kg",
    group_code: "",
    sales_representative: "張經理",
    division_location: "台中總部",
    currency: "TWD",
    customer_full_name: "台灣精密機械股份有限公司",
    exchange_rate: 1,
    customer_address: "台中市西屯區工業區一路123號",
    payment_due_date: "月結60天",
    customer_phone: "+886-4-2345-6789",
    invoice_address: "台中市西屯區工業區一路123號 財務部",
    customer_fax: "+886-4-2345-6780",
    invoice_email: "invoice@tpm.com.tw",
    supplier_phone: "",
    supplier_fax: "",
    client_lead_person: "林總經理",
    client_contact_person: "王採購",
    supplier_contact_person: "",
    client_procurement: "陳主任",
    client_sales: "",
    logistics_coordinator: "李小姐",
    labels: "需貼附產品標籤及批號",
    pallet_format: "標準棧板 1100x1100mm",
    cbam_note: "",
    sc_shipping_mark: "TPM",
    carton_format: "五層瓦楞紙箱",
    ship_to_address: "台中市西屯區工業區一路123號 收料部",
    max_carton_weight: 20,
    payment_term: "T/T",
    delivery_terms: "DAP 台中",
    packing_info: "每箱需附裝箱清單",
    payment_condition: "發票日起算60天內付款",
    qty_allowance_percent: 0,
    packaging_details: "小包裝需使用防鏽袋",
    report_type: "檢驗報告",
    acceptance_percent: 100,
    require_report: true,
    legacy_system_note: "舊系統客戶代碼: TPM-001",
  },
  {
    customer_id: "C002",
    use_group_setting: false,
    group_packaging_default: "",
    order_packaging_display: "標準工業包裝",
    customer_short_name: "台灣電機工業",
    report_email: "qc@tmi.com.tw",
    customer_packaging: "防潮防震包裝",
    group_code: "",
    sales_representative: "李經理",
    division_location: "高雄總部",
    currency: "TWD",
    customer_full_name: "台灣電機工業股份有限公司",
    exchange_rate: 1,
    customer_address: "高雄市仁武區工業二路456號",
    payment_due_date: "月結45天",
    customer_phone: "+886-7-3456-7890",
    invoice_address: "高雄市仁武區工業二路456號 會計部",
    customer_fax: "+886-7-3456-7891",
    invoice_email: "accounting@tmi.com.tw",
    supplier_phone: "",
    supplier_fax: "",
    client_lead_person: "黃總經理",
    client_contact_person: "吳工程師",
    supplier_contact_person: "",
    client_procurement: "鄭主任",
    client_sales: "",
    logistics_coordinator: "周先生",
    labels: "需貼附產品標籤及製造日期",
    pallet_format: "塑膠棧板 1200x1000mm",
    cbam_note: "",
    sc_shipping_mark: "TMI",
    carton_format: "五層瓦楞紙箱，防水處理",
    ship_to_address: "高雄市仁武區工業二路456號 倉儲部",
    max_carton_weight: 15,
    payment_term: "T/T",
    delivery_terms: "DAP 高雄",
    packing_info: "每箱需附裝箱清單及檢驗合格證",
    payment_condition: "發票日起算45天內付款",
    qty_allowance_percent: 0,
    packaging_details: "軸承需單獨包裝",
    report_type: "材質報告, 尺寸檢驗報告",
    acceptance_percent: 100,
    require_report: true,
    legacy_system_note: "舊系統客戶代碼: TMI-002",
  },
  {
    customer_id: "C003",
    use_group_setting: false,
    group_packaging_default: "",
    order_packaging_display: "電子產品包裝",
    customer_short_name: "台灣電子科技",
    report_email: "iqc@tet.com.tw",
    customer_packaging: "防靜電包裝",
    group_code: "",
    sales_representative: "王經理",
    division_location: "新竹總部",
    currency: "TWD",
    customer_full_name: "台灣電子科技股份有限公司",
    exchange_rate: 1,
    customer_address: "新竹科學園區研發二路789號",
    payment_due_date: "月結30天",
    customer_phone: "+886-3-5678-9012",
    invoice_address: "新竹科學園區研發二路789號 財務處",
    customer_fax: "+886-3-5678-9013",
    invoice_email: "finance@tet.com.tw",
    supplier_phone: "",
    supplier_fax: "",
    client_lead_person: "張董事長",
    client_contact_person: "林工程師",
    supplier_contact_person: "",
    client_procurement: "劉經理",
    client_sales: "",
    logistics_coordinator: "陳小姐",
    labels: "需貼附防靜電標籤及追蹤碼",
    pallet_format: "塑膠棧板 1200x800mm",
    cbam_note: "",
    sc_shipping_mark: "TET",
    carton_format: "防靜電紙箱",
    ship_to_address: "新竹科學園區研發二路789號 收料區",
    max_carton_weight: 10,
    payment_term: "T/T",
    delivery_terms: "DAP 新竹",
    packing_info: "每箱需附裝箱清單及靜電測試報告",
    payment_condition: "發票日起算30天內付款",
    qty_allowance_percent: 0,
    packaging_details: "需使用防靜電袋單獨包裝",
    report_type: "RoHS報告, 尺寸檢驗報告",
    acceptance_percent: 100,
    require_report: "每批次皆需提供完整報告",
    legacy_system_note: "舊系統客戶代碼: TET-003",
  },
  {
    customer_id: "C004",
    use_group_setting: true,
    group_packaging_default: "汽車零件標準包裝規範 2023版",
    order_packaging_display: "汽車零件包裝",
    customer_short_name: "台灣汽車零件",
    report_email: "quality@tap.com.tw",
    customer_packaging: "防鏽防震包裝，需附防鏽劑",
    group_code: "TAP",
    sales_representative: "陳經理",
    division_location: "台南總部",
    currency: "TWD",
    customer_full_name: "台灣汽車零件股份有限公司",
    exchange_rate: 1,
    customer_address: "台南市安南區工業三路321號",
    payment_due_date: "月結90天",
    customer_phone: "+886-6-2345-6789",
    invoice_address: "台南市安南區工業三路321號 財務部",
    customer_fax: "+886-6-2345-6780",
    invoice_email: "ap@tap.com.tw",
    supplier_phone: "",
    supplier_fax: "",
    client_lead_person: "許總經理",
    client_contact_person: "郭工程師",
    supplier_contact_person: "",
    client_procurement: "楊經理",
    client_sales: "",
    logistics_coordinator: "趙先生",
    labels: "需貼附IATF標籤及批次追蹤碼",
    pallet_format: "木棧板 1200x1000mm，需熱處理",
    cbam_note: "需符合歐盟CBAM規範",
    sc_shipping_mark: "TAP-TN",
    carton_format: "七層高強度瓦楞紙箱",
    ship_to_address: "台南市安南區工業三路321號 物料倉",
    max_carton_weight: 25,
    payment_term: "T/T",
    delivery_terms: "DAP 台南",
    packing_info: "每箱需附裝箱清單、檢驗合格證及追溯文件",
    payment_condition: "發票日起算90天內付款",
    qty_allowance_percent: 0,
    packaging_details: "軸承需真空包裝並附防鏽劑",
    report_type: "PPAP, 材質報告, 尺寸檢驗報告, 性能測試報告",
    acceptance_percent: 100,
    require_report: true,
    legacy_system_note: "舊系統客戶代碼: TAP-004, IATF認證供應商",
  },
  {
    customer_id: "C005",
    use_group_setting: false,
    group_packaging_default: "",
    order_packaging_display: "工具機零件包裝",
    customer_short_name: "台灣工具機",
    report_email: "qc@ttm.com.tw",
    customer_packaging: "防鏽防震包裝",
    group_code: "",
    sales_representative: "林經理",
    division_location: "台中總部",
    currency: "TWD",
    customer_full_name: "台灣工具機股份有限公司",
    exchange_rate: 1,
    customer_address: "台中市潭子區工業路567號",
    payment_due_date: "月結60天",
    customer_phone: "+886-4-3456-7890",
    invoice_address: "台中市潭子區工業路567號 會計部",
    customer_fax: "+886-4-3456-7891",
    invoice_email: "accounting@ttm.com.tw",
    supplier_phone: "",
    supplier_fax: "",
    client_lead_person: "謝總經理",
    client_contact_person: "蔡工程師",
    supplier_contact_person: "",
    client_procurement: "鄧經理",
    client_sales: "",
    logistics_coordinator: "馮先生",
    labels: "需貼附產品標籤及批號",
    pallet_format: "木棧板 1100x1100mm",
    cbam_note: "",
    sc_shipping_mark: "TTM",
    carton_format: "五層瓦楞紙箱，防水處理",
    ship_to_address: "台中市潭子區工業路567號 收料部",
    max_carton_weight: 20,
    payment_term: "T/T",
    delivery_terms: "DAP 台中",
    packing_info: "每箱需附裝箱清單及檢驗合格證",
    payment_condition: "發票日起算60天內付款",
    qty_allowance_percent: 0,
    packaging_details: "精密螺絲需防鏽包裝",
    report_type: "材質報告, 尺寸檢驗報告, 硬度報告",
    acceptance_percent: 100,
    require_report: true,
    legacy_system_note: "舊系統客戶代碼: TTM-005",
  },
]

export function CustomerDataTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // 根據搜索詞過濾客戶
  const filteredCustomers = customerData.filter(
    (customer) =>
      customer.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_short_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.sales_representative.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜尋客戶..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileJson className="h-4 w-4 mr-2" />
            查看原始資料
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            重新整理
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            新增客戶
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>客戶編號</TableHead>
              <TableHead>客戶簡稱</TableHead>
              <TableHead>客戶全名</TableHead>
              <TableHead>負責業務</TableHead>
              <TableHead>幣別</TableHead>
              <TableHead>集團代號</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  沒有找到客戶
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.customer_id}>
                  <TableCell className="font-medium">{customer.customer_id}</TableCell>
                  <TableCell>{customer.customer_short_name}</TableCell>
                  <TableCell>{customer.customer_full_name}</TableCell>
                  <TableCell>{customer.sales_representative}</TableCell>
                  <TableCell>{customer.currency}</TableCell>
                  <TableCell>
                    {customer.group_code ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {customer.group_code}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(customer)}>
                      <Eye className="h-4 w-4 mr-1" />
                      詳情
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>客戶詳細資料</DialogTitle>
            <DialogDescription>
              {selectedCustomer?.customer_id} - {selectedCustomer?.customer_short_name}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {selectedCustomer && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">基本資訊</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-muted-foreground">客戶編號</div>
                      <div>{selectedCustomer.customer_id}</div>
                      <div className="text-sm text-muted-foreground">客戶簡稱</div>
                      <div>{selectedCustomer.customer_short_name}</div>
                      <div className="text-sm text-muted-foreground">客戶全名</div>
                      <div>{selectedCustomer.customer_full_name}</div>
                      <div className="text-sm text-muted-foreground">集團代號</div>
                      <div>{selectedCustomer.group_code || "-"}</div>
                      <div className="text-sm text-muted-foreground">分部位置</div>
                      <div>{selectedCustomer.division_location}</div>
                      <div className="text-sm text-muted-foreground">使用集團設定</div>
                      <div>
                        {typeof selectedCustomer.use_group_setting === "boolean"
                          ? selectedCustomer.use_group_setting
                            ? "是"
                            : "否"
                          : selectedCustomer.use_group_setting}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">聯絡資訊</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-muted-foreground">客戶電話</div>
                      <div>{selectedCustomer.customer_phone}</div>
                      <div className="text-sm text-muted-foreground">客戶傳真</div>
                      <div>{selectedCustomer.customer_fax}</div>
                      <div className="text-sm text-muted-foreground">報告 Email</div>
                      <div>{selectedCustomer.report_email}</div>
                      <div className="text-sm text-muted-foreground">發票 Email</div>
                      <div>{selectedCustomer.invoice_email}</div>
                      <div className="text-sm text-muted-foreground">客戶地址</div>
                      <div>{selectedCustomer.customer_address}</div>
                      <div className="text-sm text-muted-foreground">發票地址</div>
                      <div>{selectedCustomer.invoice_address}</div>
                      <div className="text-sm text-muted-foreground">Ship to 地址</div>
                      <div>{selectedCustomer.ship_to_address}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">聯絡人</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-muted-foreground">客人負責人</div>
                      <div>{selectedCustomer.client_lead_person}</div>
                      <div className="text-sm text-muted-foreground">客人聯絡人</div>
                      <div>{selectedCustomer.client_contact_person}</div>
                      <div className="text-sm text-muted-foreground">客人採購</div>
                      <div>{selectedCustomer.client_procurement}</div>
                      <div className="text-sm text-muted-foreground">客人業務</div>
                      <div>{selectedCustomer.client_sales}</div>
                      <div className="text-sm text-muted-foreground">負責業務</div>
                      <div>{selectedCustomer.sales_representative}</div>
                      <div className="text-sm text-muted-foreground">負責船務</div>
                      <div>{selectedCustomer.logistics_coordinator}</div>
                      <div className="text-sm text-muted-foreground">供應商聯絡人</div>
                      <div>{selectedCustomer.supplier_contact_person}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">財務資訊</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-muted-foreground">幣別</div>
                      <div>{selectedCustomer.currency}</div>
                      <div className="text-sm text-muted-foreground">匯率</div>
                      <div>{selectedCustomer.exchange_rate}</div>
                      <div className="text-sm text-muted-foreground">付款日期</div>
                      <div>{selectedCustomer.payment_due_date}</div>
                      <div className="text-sm text-muted-foreground">Payment term</div>
                      <div>{selectedCustomer.payment_term}</div>
                      <div className="text-sm text-muted-foreground">付款條件</div>
                      <div>{selectedCustomer.payment_condition}</div>
                      <div className="text-sm text-muted-foreground">交貨條件</div>
                      <div>{selectedCustomer.delivery_terms}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">包裝與出貨資訊</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-muted-foreground">集團包裝要求(代入)</div>
                      <div>{selectedCustomer.group_packaging_default || "-"}</div>
                      <div className="text-sm text-muted-foreground">訂單包裝要求(顯示)</div>
                      <div>{selectedCustomer.order_packaging_display}</div>
                      <div className="text-sm text-muted-foreground">客戶包裝要求</div>
                      <div>{selectedCustomer.customer_packaging}</div>
                      <div className="text-sm text-muted-foreground">包裝資訊</div>
                      <div>{selectedCustomer.packaging_details}</div>
                      <div className="text-sm text-muted-foreground">Packing info</div>
                      <div>{selectedCustomer.packing_info}</div>
                      <div className="text-sm text-muted-foreground">棧板格式</div>
                      <div>{selectedCustomer.pallet_format}</div>
                      <div className="text-sm text-muted-foreground">紙箱格式</div>
                      <div>{selectedCustomer.carton_format}</div>
                      <div className="text-sm text-muted-foreground">整箱重量 max</div>
                      <div>{selectedCustomer.max_carton_weight} kg</div>
                      <div className="text-sm text-muted-foreground">SC shipping mark</div>
                      <div>{selectedCustomer.sc_shipping_mark}</div>
                      <div className="text-sm text-muted-foreground">標籤</div>
                      <div>{selectedCustomer.labels}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">品質與報告</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-muted-foreground">Q'ty Allowance%</div>
                      <div>{selectedCustomer.qty_allowance_percent}%</div>
                      <div className="text-sm text-muted-foreground">允收量%</div>
                      <div>{selectedCustomer.acceptance_percent}%</div>
                      <div className="text-sm text-muted-foreground">Reports</div>
                      <div>{selectedCustomer.report_type}</div>
                      <div className="text-sm text-muted-foreground">索取報告</div>
                      <div>
                        {typeof selectedCustomer.require_report === "boolean"
                          ? selectedCustomer.require_report
                            ? "是"
                            : "否"
                          : selectedCustomer.require_report}
                      </div>
                      <div className="text-sm text-muted-foreground">出歐洲 CBAM note</div>
                      <div>{selectedCustomer.cbam_note}</div>
                      <div className="text-sm text-muted-foreground">舊系統備註</div>
                      <div>{selectedCustomer.legacy_system_note}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
