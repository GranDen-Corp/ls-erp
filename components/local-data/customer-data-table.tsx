"use client"

import { DataTable } from "./data-table"
import { Badge } from "@/components/ui/badge"

export function CustomerDataTable() {
  // 定義客戶資料表的欄位
  const columns = [
    {
      key: "customer_id",
      title: "客戶編號",
      sortable: true,
    },
    {
      key: "customer_short_name",
      title: "客戶簡稱",
      sortable: true,
    },
    {
      key: "customer_full_name",
      title: "客戶全名",
      sortable: true,
    },
    {
      key: "sales_representative",
      title: "負責業務",
      sortable: true,
    },
    {
      key: "currency",
      title: "幣別",
      sortable: true,
    },
    {
      key: "group_code",
      title: "集團代號",
      render: (value: string) =>
        value ? (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {value}
          </Badge>
        ) : (
          "-"
        ),
      sortable: true,
    },
  ]

  // 定義客戶詳情頁籤
  const detailTabs = [
    {
      id: "basic",
      label: "基本資訊",
      fields: [
        { label: "客戶編號", key: "customer_id" },
        { label: "客戶簡稱", key: "customer_short_name" },
        { label: "客戶全名", key: "customer_full_name" },
        { label: "集團代號", key: "group_code" },
        { label: "分部位置", key: "division_location" },
        {
          label: "使用集團設定",
          key: "use_group_setting",
          render: (value: boolean | string) => {
            if (typeof value === "boolean") {
              return value ? "是" : "否"
            }
            return value || "-"
          },
        },
        {
          label: "建立時間",
          key: "created_at",
          render: (value: string) => (value ? new Date(value).toLocaleString("zh-TW") : "-"),
        },
        {
          label: "最後更新",
          key: "updated_at",
          render: (value: string) => (value ? new Date(value).toLocaleString("zh-TW") : "-"),
        },
      ],
    },
    {
      id: "contact",
      label: "聯絡資訊",
      fields: [
        { label: "客戶電話", key: "customer_phone" },
        { label: "客戶傳真", key: "customer_fax" },
        { label: "報告 Email", key: "report_email" },
        { label: "發票 Email", key: "invoice_email" },
        { label: "客戶地址", key: "customer_address" },
        { label: "發票地址", key: "invoice_address" },
        { label: "Ship to 地址", key: "ship_to_address" },
        { label: "客人負責人", key: "client_lead_person" },
        { label: "客人聯絡人", key: "client_contact_person" },
        { label: "客人採購", key: "client_procurement" },
        { label: "客人業務", key: "client_sales" },
        { label: "負責業務", key: "sales_representative" },
        { label: "負責船務", key: "logistics_coordinator" },
      ],
    },
    {
      id: "financial",
      label: "財務資訊",
      fields: [
        { label: "幣別", key: "currency" },
        { label: "匯率", key: "exchange_rate" },
        { label: "付款日期", key: "payment_due_date" },
        { label: "Payment term", key: "payment_term" },
        { label: "付款條件", key: "payment_condition" },
        { label: "交貨條件", key: "delivery_terms" },
      ],
    },
    {
      id: "packaging",
      label: "包裝與出貨",
      fields: [
        { label: "集團包裝要求(代入)", key: "group_packaging_default" },
        { label: "訂單包裝要求(顯示)", key: "order_packaging_display" },
        { label: "客戶包裝要求", key: "customer_packaging" },
        { label: "包裝資訊", key: "packaging_details" },
        { label: "Packing info", key: "packing_info" },
        { label: "棧板格式", key: "pallet_format" },
        { label: "紙箱格式", key: "carton_format" },
        {
          label: "整箱重量 max",
          key: "max_carton_weight",
          render: (value: number) => (value ? `${value} kg` : "-"),
        },
        { label: "SC shipping mark", key: "sc_shipping_mark" },
        { label: "標籤", key: "labels" },
      ],
    },
    {
      id: "quality",
      label: "品質與報告",
      fields: [
        {
          label: "Q'ty Allowance%",
          key: "qty_allowance_percent",
          render: (value: number) => (value !== undefined ? `${value}%` : "-"),
        },
        {
          label: "允收量%",
          key: "acceptance_percent",
          render: (value: number) => (value !== undefined ? `${value}%` : "-"),
        },
        { label: "Reports", key: "report_type" },
        {
          label: "索取報告",
          key: "require_report",
          render: (value: boolean | string) => {
            if (typeof value === "boolean") {
              return value ? "是" : "否"
            }
            return value || "-"
          },
        },
        { label: "出歐洲 CBAM note", key: "cbam_note" },
        { label: "舊系統備註", key: "legacy_system_note" },
      ],
    },
  ]

  // 定義篩選選項
  const filterOptions = [
    {
      field: "currency",
      label: "幣別",
      options: [
        { value: "USD", label: "美元 (USD)" },
        { value: "EUR", label: "歐元 (EUR)" },
        { value: "JPY", label: "日元 (JPY)" },
      ],
    },
    {
      field: "group_code",
      label: "集團代號",
      options: [
        { value: "EU-AUTO", label: "EU-AUTO" },
        { value: "US-AUTO", label: "US-AUTO" },
        { value: "ASIA-AUTO", label: "ASIA-AUTO" },
        { value: "NA-AUTO", label: "NA-AUTO" },
      ],
    },
  ]

  return (
    <DataTable
      title="客戶資料表"
      tableName="customers"
      columns={columns}
      detailTabs={detailTabs}
      filterOptions={filterOptions}
    />
  )
}
