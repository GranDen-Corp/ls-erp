"use client"

import { useState, useEffect } from "react"
import { CustomersTable } from "@/components/customers/customers-table"
import { ManagementLayout } from "@/components/ui/management-layout"
import type { FilterOption } from "@/components/ui/advanced-filter"
import { useToast } from "@/hooks/use-toast"
import { supabaseClient } from "@/lib/supabase-client"
import { ColumnControlDialog, type ColumnOption } from "@/components/ui/column-control-dialog"

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // 定義預設的欄位配置（用於重置）
  const defaultColumnOptions: ColumnOption[] = [
    // 基本資訊
    { id: "customer_id", label: "客戶編號", visible: true, category: "基本資訊", required: true },
    { id: "customer_short_name", label: "客戶簡稱", visible: true, category: "基本資訊", required: true },
    { id: "client_contact_person", label: "客戶聯絡人", visible: true, category: "聯絡資訊" },
    { id: "client_contact_person_email", label: "聯絡人Email", visible: true, category: "聯絡資訊" },
    { id: "sales_representative", label: "負責業務", visible: true, category: "業務資訊" },
    { id: "logistics_coordinator", label: "負責船務", visible: true, category: "業務資訊" },
    { id: "trade_terms", label: "貿易條件", visible: true, category: "貿易條件" },
    { id: "payment_terms", label: "付款條件", visible: true, category: "財務資訊" },
    { id: "status", label: "活躍度", visible: true, category: "其他資訊" },

    // 其他可選欄位（預設隱藏）
    { id: "customer_full_name", label: "客戶全名", visible: false, category: "基本資訊" },
    { id: "group_code", label: "集團代號", visible: false, category: "基本資訊" },
    { id: "division_location", label: "分部位置", visible: false, category: "基本資訊" },
    { id: "customer_phone", label: "客戶電話", visible: false, category: "聯絡資訊" },
    { id: "customer_fax", label: "客戶傳真", visible: false, category: "聯絡資訊" },
    { id: "report_email", label: "報告Email", visible: false, category: "聯絡資訊" },
    { id: "invoice_email", label: "發票Email", visible: false, category: "聯絡資訊" },
    { id: "customer_address", label: "客戶地址", visible: false, category: "聯絡資訊" },
    { id: "invoice_address", label: "發票地址", visible: false, category: "聯絡資訊" },
    { id: "ship_to_address", label: "送貨地址", visible: false, category: "聯絡資訊" },
    { id: "client_procurement", label: "客戶採購", visible: false, category: "業務資訊" },
    { id: "client_sales", label: "客戶業務", visible: false, category: "業務資訊" },
    { id: "currency", label: "幣別", visible: false, category: "財務資訊" },
    { id: "exchange_rate", label: "匯率", visible: false, category: "財務資訊" },
    { id: "payment_due_date", label: "付款到期日", visible: false, category: "財務資訊" },
    { id: "payment_condition", label: "付款條件詳情", visible: false, category: "財務資訊" },
    { id: "delivery_terms", label: "交貨條件", visible: false, category: "貿易條件" },
    { id: "port_of_discharge_default", label: "預設到貨港", visible: false, category: "貿易條件" },
    { id: "forwarder", label: "轉運商", visible: false, category: "包裝與出貨" },
    { id: "customer_packaging", label: "客戶包裝", visible: false, category: "包裝與出貨" },
    { id: "pallet_format", label: "棧板格式", visible: false, category: "包裝與出貨" },
    { id: "carton_format", label: "紙箱格式", visible: false, category: "包裝與出貨" },
    { id: "max_carton_weight", label: "最大紙箱重量", visible: false, category: "包裝與出貨" },
    { id: "sc_shipping_mark", label: "嘜頭", visible: false, category: "包裝與出貨" },
    { id: "labels", label: "標籤", visible: false, category: "包裝與出貨" },
    { id: "qty_allowance_percent", label: "數量容許百分比", visible: false, category: "品質與報告" },
    { id: "acceptance_percent", label: "驗收百分比", visible: false, category: "品質與報告" },
    { id: "report_type", label: "報告類型", visible: false, category: "品質與報告" },
    { id: "require_report", label: "需要報告", visible: false, category: "品質與報告" },
    { id: "cbam_note", label: "CBAM備註", visible: false, category: "其他資訊" },
    { id: "legacy_system_note", label: "舊系統備註", visible: false, category: "其他資訊" },
    { id: "remarks", label: "備註", visible: false, category: "其他資訊" },
  ]

  // 當前的欄位配置（可以被用戶修改）
  const [columnOptions, setColumnOptions] = useState<ColumnOption[]>(defaultColumnOptions)

  const filterOptions: FilterOption[] = [
    {
      id: "division_location",
      label: "地區",
      type: "select",
      options: [
        { value: "Taiwan", label: "台灣" },
        { value: "China", label: "中國" },
        { value: "USA", label: "美國" },
        { value: "Europe", label: "歐洲" },
        { value: "Other", label: "其他" },
      ],
    },
    {
      id: "group_code",
      label: "集團",
      type: "select",
      options: [
        { value: "A", label: "A集團" },
        { value: "B", label: "B集團" },
        { value: "C", label: "C集團" },
        { value: "D", label: "D集團" },
        { value: "Other", label: "其他" },
      ],
    },
    {
      id: "status",
      label: "狀態",
      type: "select",
      options: [
        { value: "active", label: "活躍" },
        { value: "inactive", label: "非活躍" },
      ],
    },
  ]

  const fetchCustomers = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabaseClient.from("customers").select("*")

      if (error) {
        throw new Error(`獲取客戶資料時出錯: ${error.message}`)
      }

      console.log("從Supabase獲取到的客戶資料:", data)
      setCustomers(data || [])
      setFilteredCustomers(data || [])
    } catch (error) {
      console.error("Failed to fetch customers:", error)
      toast({
        title: "錯誤",
        description: "無法載入客戶資料，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleFilterChange = (filters: Record<string, any>) => {
    let result = [...customers]

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      result = result.filter(
        (customer) =>
          customer.customer_short_name?.toLowerCase().includes(searchTerm) ||
          customer.customer_full_name?.toLowerCase().includes(searchTerm) ||
          customer.customer_id?.toLowerCase().includes(searchTerm) ||
          customer.client_contact_person?.toLowerCase().includes(searchTerm) ||
          customer.report_email?.toLowerCase().includes(searchTerm) ||
          false,
      )
    }

    // Apply division_location filter
    if (filters.division_location) {
      result = result.filter((customer) => customer.division_location === filters.division_location)
    }

    // Apply group_code filter
    if (filters.group_code) {
      result = result.filter((customer) => customer.group_code === filters.group_code)
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter((customer) =>
        filters.status === "active" ? customer.status !== "inactive" : customer.status === "inactive",
      )
    }

    setFilteredCustomers(result)
  }

  const handleExport = () => {
    toast({
      title: "導出成功",
      description: "客戶資料已成功導出",
    })
  }

  const handleImport = () => {
    toast({
      title: "導入",
      description: "請選擇要導入的檔案",
    })
  }

  return (
    <ManagementLayout
      title="客戶管理"
      description="查看和管理所有客戶資料"
      createNewHref="/customers/new"
      createNewLabel="新增客戶"
      filterOptions={filterOptions}
      extraFilterControls={
        <ColumnControlDialog
          columns={columnOptions}
          onColumnChange={setColumnOptions}
          defaultColumns={defaultColumnOptions}
        />
      }
      onFilterChange={handleFilterChange}
      onRefresh={fetchCustomers}
      onExport={handleExport}
      onImport={handleImport}
      searchPlaceholder="搜尋客戶名稱、編號或聯絡人..."
    >
      <CustomersTable
        data={filteredCustomers}
        isLoading={isLoading}
        visibleColumns={columnOptions.filter((col) => col.visible).map((col) => col.id)}
        columnOrder={columnOptions.map((col) => col.id)}
      />
    </ManagementLayout>
  )
}
