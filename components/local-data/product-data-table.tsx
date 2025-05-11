"use client"

import { DataTable } from "./data-table"
import { Badge } from "@/components/ui/badge"

export function ProductDataTable() {
  // 定義產品資料表的欄位
  const columns = [
    {
      key: "part_no",
      title: "料號",
      sortable: true,
    },
    {
      key: "component_name",
      title: "產品名稱",
      sortable: true,
    },
    {
      key: "customer",
      title: "客戶",
      render: (value: any) => value?.customer_short_name || "-",
      sortable: true,
    },
    {
      key: "factory",
      title: "供應商",
      render: (value: any) => value?.factory_name || "-",
      sortable: true,
    },
    {
      key: "specification",
      title: "規格",
      sortable: true,
    },
    {
      key: "product_type",
      title: "產品類型",
      sortable: true,
    },
    {
      key: "status",
      title: "狀態",
      render: (value: string) => (
        <Badge variant={value === "active" ? "default" : "secondary"}>{value === "active" ? "活躍" : value}</Badge>
      ),
      sortable: true,
    },
  ]

  // 定義產品詳情頁籤
  const detailTabs = [
    {
      id: "details",
      label: "基本資訊",
      fields: [
        { label: "料號", key: "part_no" },
        { label: "產品名稱", key: "component_name" },
        { label: "規格", key: "specification" },
        { label: "產品類型", key: "product_type" },
        { label: "客戶", key: "customer", render: (value: any) => value?.customer_short_name || "-" },
        { label: "供應商", key: "factory", render: (value: any) => value?.factory_name || "-" },
        { label: "海關碼", key: "customs_code" },
        { label: "終端客戶", key: "end_customer" },
        { label: "分類碼", key: "classification_code" },
        { label: "車廠圖號", key: "vehicle_drawing_no" },
        { label: "客戶圖號", key: "customer_drawing_no" },
        { label: "產品期稿", key: "product_period" },
        { label: "產品描述", key: "description" },
        {
          label: "狀態",
          key: "status",
          render: (value: string) => (
            <Badge variant={value === "active" ? "default" : "secondary"}>{value === "active" ? "活躍" : value}</Badge>
          ),
        },
        { label: "最小訂購量", key: "moq" },
        { label: "交貨時間", key: "lead_time" },
        { label: "包裝要求", key: "packaging_requirements" },
      ],
    },
    {
      id: "specs",
      label: "技術規格",
      fields: [
        {
          label: "規格參數",
          key: "specifications",
          render: (value: any[]) => {
            if (!value || value.length === 0) return "無規格參數"
            return (
              <div className="border rounded-md p-2">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">名稱</th>
                      <th className="text-left p-2">值</th>
                    </tr>
                  </thead>
                  <tbody>
                    {value.map((spec, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className="p-2">{spec.name}</td>
                        <td className="p-2">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          },
        },
        { label: "原圖版次", key: "original_drawing_version" },
        { label: "圖面版次", key: "drawing_version" },
        { label: "客戶圖版次", key: "customer_drawing_version" },
        { label: "工廠圖版次", key: "factory_drawing_version" },
        { label: "樣品狀態", key: "sample_status" },
        { label: "樣品日期", key: "sample_date" },
      ],
    },
    {
      id: "process",
      label: "製程資訊",
      fields: [
        {
          label: "製程資料",
          key: "process_data",
          render: (value: any[]) => {
            if (!value || value.length === 0) return "無製程資料"
            return (
              <div className="border rounded-md p-2">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">製程</th>
                      <th className="text-left p-2">供應商</th>
                      <th className="text-left p-2">產能</th>
                      <th className="text-left p-2">要求</th>
                    </tr>
                  </thead>
                  <tbody>
                    {value.map((proc, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className="p-2">{proc.process}</td>
                        <td className="p-2">{proc.vendor}</td>
                        <td className="p-2">{proc.capacity}</td>
                        <td className="p-2">{proc.requirements}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          },
        },
        { label: "訂單要求", key: "order_requirements" },
        { label: "採購要求", key: "purchase_requirements" },
        {
          label: "特殊要求",
          key: "special_requirements",
          render: (value: any[]) => {
            if (!value || value.length === 0) return "無特殊要求"
            return (
              <div className="space-y-2">
                {value.map((req, index) => (
                  <div key={index} className="border p-2 rounded-md">
                    <div>{req.content}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {req.date} - {req.user}
                    </div>
                  </div>
                ))}
              </div>
            )
          },
        },
      ],
    },
    {
      id: "assembly",
      label: "組裝資訊",
      fields: [
        {
          label: "是否組裝件",
          key: "is_assembly",
          render: (value: boolean) => (value ? "是" : "否"),
        },
        {
          label: "組件清單",
          key: "components",
          render: (value: any[]) => {
            if (!value || value.length === 0) return "無組件"
            return (
              <div className="border rounded-md p-2">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">組件名稱</th>
                      <th className="text-left p-2">料號</th>
                      <th className="text-left p-2">數量</th>
                      <th className="text-left p-2">單價</th>
                    </tr>
                  </thead>
                  <tbody>
                    {value.map((comp, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className="p-2">{comp.productName}</td>
                        <td className="p-2">{comp.productPN}</td>
                        <td className="p-2">{comp.quantity}</td>
                        <td className="p-2">{comp.unitPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          },
        },
        { label: "組裝時間 (分鐘)", key: "assembly_time" },
        { label: "組裝人工成本 (每小時)", key: "assembly_cost_per_hour" },
        { label: "額外成本", key: "additional_costs" },
      ],
    },
    {
      id: "compliance",
      label: "認證與合規",
      fields: [
        {
          label: "合規狀態",
          key: "compliance_status",
          render: (value: any) => {
            if (!value) return "無合規資料"
            return (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(value).map(([key, status]: [string, any]) => (
                  <div key={key} className="border p-2 rounded-md">
                    <div className="font-medium">{key}</div>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={
                          status.status === "符合"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }
                      >
                        {status.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )
          },
        },
        {
          label: "零件管理",
          key: "part_management",
          render: (value: any) => {
            if (!value) return "無零件管理資料"
            return (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(value).map(([key, val]: [string, any]) => (
                  <div key={key} className="border p-2 rounded-md">
                    <div className="font-medium">{key}</div>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={
                          val === true
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }
                      >
                        {val === true ? "是" : "否"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )
          },
        },
      ],
    },
  ]

  // 定義篩選選項
  const filterOptions = [
    {
      field: "product_type",
      label: "產品類型",
      options: [
        { value: "焊接螺柱", label: "焊接螺柱" },
        { value: "六角法蘭面螺栓", label: "六角法蘭面螺栓" },
        { value: "精密車床件", label: "精密車床件" },
        { value: "沖壓件", label: "沖壓件" },
        { value: "組裝件", label: "組裝件" },
      ],
    },
    {
      field: "status",
      label: "狀態",
      options: [
        { value: "active", label: "活躍" },
        { value: "inactive", label: "停用" },
        { value: "discontinued", label: "停產" },
      ],
    },
  ]

  return (
    <DataTable
      title="產品資料表"
      tableName="products"
      columns={columns}
      detailTabs={detailTabs}
      filterOptions={filterOptions}
    />
  )
}
