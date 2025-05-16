"use client"

import { useEffect, useState } from "react"
import { DataTable } from "./data-table"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase-client"

export function ProductDataTable() {
  const [customers, setCustomers] = useState<Record<string, any>>({})
  const [suppliers, setSuppliers] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 獲取客戶和供應商(工廠)資料
  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()

        // 嘗試獲取客戶資料
        try {
          const { data: customerData, error: customerError } = await supabase.from("customers").select("*")

          if (customerError) {
            console.error("獲取客戶資料失敗:", customerError.message)
          } else if (customerData) {
            // 將客戶資料轉換為以ID為鍵的對象
            const customersMap: Record<string, any> = {}
            customerData.forEach((customer) => {
              // 使用customer_id作為鍵，如果不存在則使用id
              const customerId = customer.customer_id || customer.id
              if (customerId) {
                customersMap[customerId] = customer
              }
            })

            setCustomers(customersMap)
          }
        } catch (err: any) {
          console.error("處理客戶資料時出錯:", err.message)
        }

        // 嘗試獲取供應商(工廠)資料
        try {
          const { data: supplierData, error: supplierError } = await supabase.from("suppliers").select("*")

          if (supplierError) {
            console.error("獲取供應商資料失敗:", supplierError.message)
          } else if (supplierData) {
            // 將供應商資料轉換為以ID為鍵的對象
            const suppliersMap: Record<string, any> = {}
            supplierData.forEach((supplier) => {
              // 使用supplier_id作為鍵，如果不存在則使用id
              const supplierId = supplier.supplier_id || supplier.id
              if (supplierId) {
                suppliersMap[supplierId] = supplier
              }
            })

            setSuppliers(suppliersMap)
          }
        } catch (err: any) {
          console.error("處理供應商資料時出錯:", err.message)
        }
      } catch (err: any) {
        console.error("獲取資料時出錯:", err.message)
        setError(`獲取資料時出錯: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 定義產品資料表的欄位
  const columns = [
    {
      key: "part_no",
      title: "Part No.",
      sortable: true,
    },
    {
      key: "component_name",
      title: "產品名稱",
      sortable: true,
    },
    {
      key: "customer_id",
      title: "客戶",
      render: (value: any, row: any) => {
        const customer = customers[value]
        return customer ? customer.customer_short_name || customer.customer_name || customer.name : value || "-"
      },
      sortable: true,
    },
    {
      key: "factory_id",
      title: "工廠",
      render: (value: any, row: any) => {
        const supplier = suppliers[value]
        return supplier ? supplier.supplier_name || supplier.factory_name || supplier.name : value || "-"
      },
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
    {
      key: "customer_drawing_no",
      title: "客戶圖號",
      sortable: true,
    },
    {
      key: "vehicle_drawing_no",
      title: "車廠圖號",
      sortable: true,
    },
    {
      key: "description",
      title: "產品描述",
      sortable: true,
    },
    {
      key: "moq",
      title: "最小訂購量",
      sortable: true,
    },
    {
      key: "lead_time",
      title: "交貨時間",
      sortable: true,
    },
    {
      key: "is_assembly",
      title: "組裝件",
      render: (value: boolean) => <Badge variant={value ? "default" : "outline"}>{value ? "是" : "否"}</Badge>,
      sortable: true,
    },
    {
      key: "created_at",
      title: "建立日期",
      sortable: true,
    },
    {
      key: "updated_at",
      title: "更新日期",
      sortable: true,
    },
  ]

  // 定義產品詳情頁籤
  const detailTabs = [
    {
      id: "details",
      label: "基本資訊",
      fields: [
        { label: "Part No.", key: "part_no" },
        { label: "產品名稱", key: "component_name" },
        { label: "規格", key: "specification" },
        { label: "產品類型", key: "product_type" },
        {
          label: "客戶",
          key: "customer_id",
          render: (value: any) => {
            const customer = customers[value]
            return customer ? customer.customer_short_name || customer.customer_name || customer.name : value || "-"
          },
        },
        {
          label: "工廠",
          key: "factory_id",
          render: (value: any) => {
            const supplier = suppliers[value]
            return supplier ? supplier.supplier_name || supplier.factory_name || supplier.name : value || "-"
          },
        },
        { label: "海關碼", key: "customs_code" },
        { label: "終端客戶", key: "end_customer" },
        { label: "分類碼", key: "classification_code" },
        { label: "車廠圖號", key: "vehicle_drawing_no" },
        { label: "客戶圖號", key: "customer_drawing_no" },
        { label: "產品別稱", key: "product_period" },
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
                      <th className="text-left p-2">產能(8H)</th>
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
          label: "特殊要求與測試",
          key: "special_requirements",
          render: (value: any[]) => {
            if (!value || value.length === 0) return "無特殊要求與測試"
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
                {Object.entries(value).map(([key, status]: [string, any]) => {
                  // 檢查是否為PFAS, CMRT, EMRT，這些使用含有/不含有
                  const isContainmentType = ["PFAS", "CMRT", "EMRT"].includes(key)

                  return (
                    <div key={key} className="border p-2 rounded-md">
                      <div className="font-medium">{key}</div>
                      <div className="mt-1">
                        <Badge
                          variant="outline"
                          className={
                            status.status === "符合" || status.status === "含有"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }
                        >
                          {status.status}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          },
        },
        {
          label: "零件管理",
          key: "part_management",
          render: (value: any) => {
            if (!value) return "無零件管理資料"

            // 將時鐘要求改為熔鑄地要求
            const displayLabels: Record<string, string> = {
              clockRequirement: "熔鑄地要求",
              safetyPart: "安全件",
              automotivePart: "汽車件",
              CBAMPart: "CBAM件",
            }

            return (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(value).map(([key, val]: [string, any]) => (
                  <div key={key} className="border p-2 rounded-md">
                    <div className="font-medium">{displayLabels[key] || key}</div>
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
    {
      field: "is_assembly",
      label: "組裝件",
      options: [
        { value: "true", label: "是" },
        { value: "false", label: "否" },
      ],
    },
  ]

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  return (
    <DataTable
      title="產品資料表"
      tableName="products"
      columns={columns}
      detailTabs={detailTabs}
      filterOptions={filterOptions}
      isLoading={loading}
      showAllColumns={true}
      primaryKey={["part_no", "customer_id"]} // 設定複合主鍵
    />
  )
}
