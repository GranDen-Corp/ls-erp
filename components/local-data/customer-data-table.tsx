"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, FileJson, RefreshCw, Eye } from "lucide-react"
import type { Customer } from "@/types/customer"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

// 模擬客戶資料
const customerData: Customer[] = [
  {
    customer_id: "Y001",
    use_group_setting: true,
    group_packaging_default: "標準集團包裝規範 YG-2023",
    order_packaging_display: "依集團規範包裝",
    customer_short_name: "YAMASHIN",
    report_email: "reports@yamashin.co.jp",
    customer_packaging: "每箱不超過15kg，需使用防潮包裝",
    group_code: "YG",
    sales_representative: "王小明",
    division_location: "大阪總部",
    currency: "JPY",
    customer_full_name: "山真工業株式会社",
    exchange_rate: 0.22,
    customer_address: "大阪府大阪市中央区1-2-3",
    payment_due_date: "月底結30天",
    customer_phone: "+81-6-1234-5678",
    invoice_address: "大阪府大阪市中央区1-2-3 財務部",
    customer_fax: "+81-6-1234-5679",
    invoice_email: "invoice@yamashin.co.jp",
    supplier_phone: "+886-2-2345-6789",
    supplier_fax: "+886-2-2345-6780",
    client_lead_person: "山田太郎",
    client_contact_person: "佐藤花子",
    supplier_contact_person: "李大華",
    client_procurement: "鈴木一郎",
    client_sales: "田中誠",
    logistics_coordinator: "陳小美",
    labels: "需貼附JIS標籤及客戶專用條碼",
    pallet_format: "日規棧板 1100x1100mm",
    cbam_note: "不適用",
    sc_shipping_mark: "YS-OSAKA",
    carton_format: "五層瓦楞紙箱，單箱尺寸 40x30x25cm",
    ship_to_address: "大阪府堺市北区1-2-3 山真工業物流中心",
    max_carton_weight: 15,
    payment_term: "T/T",
    delivery_terms: "FOB 基隆",
    packing_info: "每箱需附裝箱清單，外箱需印刷型號及數量",
    payment_condition: "發票日起算30天內付款",
    qty_allowance_percent: 5,
    packaging_details: "需使用防靜電包裝袋，每50個為一小包",
    report_type: "COA, 檢驗報告",
    acceptance_percent: 99.5,
    require_report: true,
    legacy_system_note: "舊系統客戶代碼: YMN-001",
  },
  {
    customer_id: "Z001",
    use_group_setting: false,
    group_packaging_default: "",
    order_packaging_display: "客製化包裝",
    customer_short_name: "ZEXEL",
    report_email: "qc@zexel.com",
    customer_packaging: "需使用防震包裝，並附加乾燥劑",
    group_code: "",
    sales_representative: "張小華",
    division_location: "上海分部",
    currency: "USD",
    customer_full_name: "Zexel Precision Components Co., Ltd.",
    exchange_rate: 31.5,
    customer_address: "上海市浦東新區張江高科技園區88號",
    payment_due_date: "Net 45",
    customer_phone: "+86-21-5888-7777",
    invoice_address: "上海市浦東新區張江高科技園區88號 財務部",
    customer_fax: "+86-21-5888-7778",
    invoice_email: "ap@zexel.com",
    supplier_phone: "+886-2-8765-4321",
    supplier_fax: "+886-2-8765-4322",
    client_lead_person: "張偉",
    client_contact_person: "李明",
    supplier_contact_person: "陳大同",
    client_procurement: "王強",
    client_sales: "劉紅",
    logistics_coordinator: "林小玲",
    labels: "需貼附UL認證標籤及序號條碼",
    pallet_format: "歐規棧板 1200x800mm",
    cbam_note: "需提供碳足跡報告",
    sc_shipping_mark: "ZX-SH",
    carton_format: "七層高強度瓦楞紙箱，單箱尺寸 60x40x30cm",
    ship_to_address: "上海市松江區工業園區66號 澤賽爾物流中心",
    max_carton_weight: 20,
    payment_term: "L/C 60天",
    delivery_terms: "CIF 上海",
    packing_info: "每箱最多裝100個單位，需用塑膠隔板分隔",
    payment_condition: "發票日起算45天內電匯付款",
    qty_allowance_percent: 3,
    packaging_details: "產品需真空包裝，外箱需防水處理",
    report_type: "PPAP, 材質報告, 尺寸檢驗報告",
    acceptance_percent: 99.9,
    require_report: "每批次皆需提供完整報告",
    legacy_system_note: "重要客戶，特殊價格政策適用",
  },
  {
    customer_id: "T002",
    use_group_setting: true,
    group_packaging_default: "TG集團標準包裝規範 2023版",
    order_packaging_display: "TG標準包裝",
    customer_short_name: "TOSHIBA",
    report_email: "quality@toshiba.co.jp",
    customer_packaging: "需使用防靜電包裝，並標示ESD警告標誌",
    group_code: "TG",
    sales_representative: "林大為",
    division_location: "東京總部",
    currency: "JPY",
    customer_full_name: "東芝電子元件株式会社",
    exchange_rate: 0.22,
    customer_address: "東京都港区芝浦1-1-1",
    payment_due_date: "月底結60天",
    customer_phone: "+81-3-3457-8900",
    invoice_address: "東京都港区芝浦1-1-1 財務部門",
    customer_fax: "+81-3-3457-8901",
    invoice_email: "invoice@toshiba-corp.jp",
    supplier_phone: "+886-2-2567-8901",
    supplier_fax: "+886-2-2567-8902",
    client_lead_person: "佐々木健",
    client_contact_person: "高橋誠",
    supplier_contact_person: "黃志明",
    client_procurement: "渡辺浩",
    client_sales: "中村剛",
    logistics_coordinator: "吳小菁",
    labels: "需貼附Toshiba專用標籤及2D條碼",
    pallet_format: "日規棧板 1100x1100mm，需熱處理",
    cbam_note: "需符合RoHS及REACH規範",
    sc_shipping_mark: "TSB-TYO",
    carton_format: "五層瓦楞紙箱，單箱尺寸 50x40x30cm",
    ship_to_address: "神奈川県川崎市幸区堀川町72-34 東芝物流中心",
    max_carton_weight: 18,
    payment_term: "T/T",
    delivery_terms: "CIF 橫濱",
    packing_info: "每箱需附裝箱清單及檢驗合格證",
    payment_condition: "發票日起算60天內付款",
    qty_allowance_percent: 2,
    packaging_details: "小包裝需使用防靜電袋，並以真空包裝",
    report_type: "COA, 尺寸檢驗報告, 材質證明",
    acceptance_percent: 99.8,
    require_report: true,
    legacy_system_note: "舊系統客戶代碼: TSB-002, 優先出貨客戶",
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
