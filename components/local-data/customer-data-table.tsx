"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, RefreshCw, Eye, Edit, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabaseClient } from "@/lib/supabase-client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 定義客戶類型
interface Customer {
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
  created_at?: string
  updated_at?: string
}

export function CustomerDataTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 從Supabase獲取客戶資料
  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true)
        const { data, error } = await supabaseClient
          .from("customers")
          .select("*")
          .order("customer_id", { ascending: true })

        if (error) {
          throw error
        }

        setCustomers(data || [])
      } catch (err) {
        console.error("Error fetching customers:", err)
        setError("獲取客戶資料時發生錯誤")
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  // 根據搜索詞過濾客戶
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_short_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.sales_representative && customer.sales_representative.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDialogOpen(true)
  }

  const handleRefresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabaseClient
        .from("customers")
        .select("*")
        .order("customer_id", { ascending: true })

      if (error) {
        throw error
      }

      setCustomers(data || [])
    } catch (err) {
      console.error("Error refreshing customers:", err)
      setError("重新整理客戶資料時發生錯誤")
    } finally {
      setLoading(false)
    }
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
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            重新整理
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            新增客戶
          </Button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">{error}</div>}

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
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    載入中...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
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
                  <TableCell>{customer.sales_representative || "-"}</TableCell>
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
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(customer)}>
                        <Eye className="h-4 w-4 mr-1" />
                        詳情
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        編輯
                      </Button>
                    </div>
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
              <Tabs defaultValue="basic">
                <TabsList className="mb-4">
                  <TabsTrigger value="basic">基本資訊</TabsTrigger>
                  <TabsTrigger value="contact">聯絡資訊</TabsTrigger>
                  <TabsTrigger value="financial">財務資訊</TabsTrigger>
                  <TabsTrigger value="packaging">包裝與出貨</TabsTrigger>
                  <TabsTrigger value="quality">品質與報告</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-sm text-muted-foreground">客戶編號</div>
                    <div>{selectedCustomer.customer_id}</div>
                    <div className="text-sm text-muted-foreground">客戶簡稱</div>
                    <div>{selectedCustomer.customer_short_name}</div>
                    <div className="text-sm text-muted-foreground">客戶全名</div>
                    <div>{selectedCustomer.customer_full_name}</div>
                    <div className="text-sm text-muted-foreground">集團代號</div>
                    <div>{selectedCustomer.group_code || "-"}</div>
                    <div className="text-sm text-muted-foreground">分部位置</div>
                    <div>{selectedCustomer.division_location || "-"}</div>
                    <div className="text-sm text-muted-foreground">使用集團設定</div>
                    <div>
                      {typeof selectedCustomer.use_group_setting === "boolean"
                        ? selectedCustomer.use_group_setting
                          ? "是"
                          : "否"
                        : selectedCustomer.use_group_setting || "-"}
                    </div>
                    <div className="text-sm text-muted-foreground">建立時間</div>
                    <div>
                      {selectedCustomer.created_at
                        ? new Date(selectedCustomer.created_at).toLocaleString("zh-TW")
                        : "-"}
                    </div>
                    <div className="text-sm text-muted-foreground">最後更新</div>
                    <div>
                      {selectedCustomer.updated_at
                        ? new Date(selectedCustomer.updated_at).toLocaleString("zh-TW")
                        : "-"}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-sm text-muted-foreground">客戶電話</div>
                    <div>{selectedCustomer.customer_phone || "-"}</div>
                    <div className="text-sm text-muted-foreground">客戶傳真</div>
                    <div>{selectedCustomer.customer_fax || "-"}</div>
                    <div className="text-sm text-muted-foreground">報告 Email</div>
                    <div>{selectedCustomer.report_email || "-"}</div>
                    <div className="text-sm text-muted-foreground">發票 Email</div>
                    <div>{selectedCustomer.invoice_email || "-"}</div>
                    <div className="text-sm text-muted-foreground">客戶地址</div>
                    <div>{selectedCustomer.customer_address || "-"}</div>
                    <div className="text-sm text-muted-foreground">發票地址</div>
                    <div>{selectedCustomer.invoice_address || "-"}</div>
                    <div className="text-sm text-muted-foreground">Ship to 地址</div>
                    <div>{selectedCustomer.ship_to_address || "-"}</div>
                    <div className="text-sm text-muted-foreground">客人負責人</div>
                    <div>{selectedCustomer.client_lead_person || "-"}</div>
                    <div className="text-sm text-muted-foreground">客人聯絡人</div>
                    <div>{selectedCustomer.client_contact_person || "-"}</div>
                    <div className="text-sm text-muted-foreground">客人採購</div>
                    <div>{selectedCustomer.client_procurement || "-"}</div>
                    <div className="text-sm text-muted-foreground">客人業務</div>
                    <div>{selectedCustomer.client_sales || "-"}</div>
                    <div className="text-sm text-muted-foreground">負責業務</div>
                    <div>{selectedCustomer.sales_representative || "-"}</div>
                    <div className="text-sm text-muted-foreground">負責船務</div>
                    <div>{selectedCustomer.logistics_coordinator || "-"}</div>
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-sm text-muted-foreground">幣別</div>
                    <div>{selectedCustomer.currency || "-"}</div>
                    <div className="text-sm text-muted-foreground">匯率</div>
                    <div>{selectedCustomer.exchange_rate || "-"}</div>
                    <div className="text-sm text-muted-foreground">付款日期</div>
                    <div>{selectedCustomer.payment_due_date || "-"}</div>
                    <div className="text-sm text-muted-foreground">Payment term</div>
                    <div>{selectedCustomer.payment_term || "-"}</div>
                    <div className="text-sm text-muted-foreground">付款條件</div>
                    <div>{selectedCustomer.payment_condition || "-"}</div>
                    <div className="text-sm text-muted-foreground">交貨條件</div>
                    <div>{selectedCustomer.delivery_terms || "-"}</div>
                  </div>
                </TabsContent>

                <TabsContent value="packaging" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-sm text-muted-foreground">集團包裝要求(代入)</div>
                    <div>{selectedCustomer.group_packaging_default || "-"}</div>
                    <div className="text-sm text-muted-foreground">訂單包裝要求(顯示)</div>
                    <div>{selectedCustomer.order_packaging_display || "-"}</div>
                    <div className="text-sm text-muted-foreground">客戶包裝要求</div>
                    <div>{selectedCustomer.customer_packaging || "-"}</div>
                    <div className="text-sm text-muted-foreground">包裝資訊</div>
                    <div>{selectedCustomer.packaging_details || "-"}</div>
                    <div className="text-sm text-muted-foreground">Packing info</div>
                    <div>{selectedCustomer.packing_info || "-"}</div>
                    <div className="text-sm text-muted-foreground">棧板格式</div>
                    <div>{selectedCustomer.pallet_format || "-"}</div>
                    <div className="text-sm text-muted-foreground">紙箱格式</div>
                    <div>{selectedCustomer.carton_format || "-"}</div>
                    <div className="text-sm text-muted-foreground">整箱重量 max</div>
                    <div>{selectedCustomer.max_carton_weight ? `${selectedCustomer.max_carton_weight} kg` : "-"}</div>
                    <div className="text-sm text-muted-foreground">SC shipping mark</div>
                    <div>{selectedCustomer.sc_shipping_mark || "-"}</div>
                    <div className="text-sm text-muted-foreground">標籤</div>
                    <div>{selectedCustomer.labels || "-"}</div>
                  </div>
                </TabsContent>

                <TabsContent value="quality" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-sm text-muted-foreground">Q'ty Allowance%</div>
                    <div>
                      {selectedCustomer.qty_allowance_percent !== undefined
                        ? `${selectedCustomer.qty_allowance_percent}%`
                        : "-"}
                    </div>
                    <div className="text-sm text-muted-foreground">允收量%</div>
                    <div>
                      {selectedCustomer.acceptance_percent !== undefined
                        ? `${selectedCustomer.acceptance_percent}%`
                        : "-"}
                    </div>
                    <div className="text-sm text-muted-foreground">Reports</div>
                    <div>{selectedCustomer.report_type || "-"}</div>
                    <div className="text-sm text-muted-foreground">索取報告</div>
                    <div>
                      {typeof selectedCustomer.require_report === "boolean"
                        ? selectedCustomer.require_report
                          ? "是"
                          : "否"
                        : selectedCustomer.require_report || "-"}
                    </div>
                    <div className="text-sm text-muted-foreground">出歐洲 CBAM note</div>
                    <div>{selectedCustomer.cbam_note || "-"}</div>
                    <div className="text-sm text-muted-foreground">舊系統備註</div>
                    <div>{selectedCustomer.legacy_system_note || "-"}</div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
