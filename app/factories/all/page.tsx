"use client"

import { useState, useEffect } from "react"
import { ManagementLayout } from "@/components/ui/management-layout"
import { FactoriesTable } from "@/components/factories/factories-table"
import { ColumnControlDialog, type ColumnOption } from "@/components/ui/column-control-dialog"
import type { FilterOption } from "@/components/ui/advanced-filter"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function FactoriesPage() {
  const [factories, setFactories] = useState([])
  const [filteredFactories, setFilteredFactories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // 定義預設的供應商欄位配置
  const defaultColumnOptions: ColumnOption[] = [
    // 基本資訊
    { id: "factory_id", label: "供應商編號", visible: true, category: "基本資訊", required: true },
    { id: "factory_name", label: "供應商名稱", visible: true, category: "基本資訊", required: true },
    { id: "factory_type", label: "供應商類型", visible: true, category: "基本資訊" },
    { id: "location", label: "國家/地區", visible: true, category: "基本資訊" },
    { id: "quality_contacts", label: "品管人員", visible: true, category: "聯絡資訊" },
    { id: "factory_phone", label: "連絡電話", visible: true, category: "聯絡資訊" },
    { id: "status", label: "狀態", visible: true, category: "其他資訊" },

    // 其他可選欄位
    { id: "factory_full_name", label: "供應商全名", visible: false, category: "基本資訊" },
    { id: "city", label: "城市", visible: false, category: "基本資訊" },
    { id: "factory_address", label: "供應商地址", visible: false, category: "聯絡資訊" },
    { id: "factory_fax", label: "傳真", visible: false, category: "聯絡資訊" },
    { id: "tax_id", label: "統一編號", visible: false, category: "聯絡資訊" },
    { id: "contact_person", label: "聯絡人", visible: false, category: "聯絡資訊" },
    { id: "contact_email", label: "聯絡人Email", visible: false, category: "聯絡資訊" },
    { id: "website", label: "網站", visible: false, category: "聯絡資訊" },
    { id: "invoice_address", label: "發票地址", visible: false, category: "聯絡資訊" },

    // 產品類別
    { id: "category1", label: "產品類別1", visible: false, category: "產品類別" },
    { id: "category2", label: "產品類別2", visible: false, category: "產品類別" },
    { id: "category3", label: "產品類別3", visible: false, category: "產品類別" },

    // 認證資訊
    { id: "iso9001_certified", label: "ISO 9001認證", visible: false, category: "認證資訊" },
    { id: "iatf16949_certified", label: "IATF 16949認證", visible: false, category: "認證資訊" },
    { id: "iso17025_certified", label: "ISO 17025認證", visible: false, category: "認證資訊" },
    { id: "cqi9_certified", label: "CQI-9認證", visible: false, category: "認證資訊" },
    { id: "cqi11_certified", label: "CQI-11認證", visible: false, category: "認證資訊" },
    { id: "cqi12_certified", label: "CQI-12認證", visible: false, category: "認證資訊" },
    { id: "iso9001_expiry", label: "ISO 9001到期日", visible: false, category: "認證資訊" },
    { id: "iatf16949_expiry", label: "IATF 16949到期日", visible: false, category: "認證資訊" },
    { id: "iso17025_expiry", label: "ISO 17025到期日", visible: false, category: "認證資訊" },
    { id: "cqi9_expiry", label: "CQI-9到期日", visible: false, category: "認證資訊" },
    { id: "cqi11_expiry", label: "CQI-11到期日", visible: false, category: "認證資訊" },
    { id: "cqi12_expiry", label: "CQI-12到期日", visible: false, category: "認證資訊" },

    // 其他資訊
    { id: "notes", label: "備註", visible: false, category: "其他資訊" },
    { id: "created_at", label: "建立時間", visible: false, category: "其他資訊" },
    { id: "updated_at", label: "更新時間", visible: false, category: "其他資訊" },
  ]

  const [columnOptions, setColumnOptions] = useState<ColumnOption[]>(defaultColumnOptions)

  // 簡化的篩選選項，只保留建立時間和更新時間
  const filterOptions: FilterOption[] = [
    {
      id: "created_at",
      label: "建立時間",
      type: "dateRange",
    },
    {
      id: "updated_at",
      label: "更新時間",
      type: "dateRange",
    },
  ]

  // 獲取供應商資料
  const fetchFactories = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("開始獲取供應商資料...")

      // 使用 Supabase 客戶端獲取資料
      const { data, error } = await supabase.from("factories").select("*").order("factory_id", { ascending: true })

      if (error) {
        console.error("Supabase 查詢錯誤:", error)
        throw new Error(`獲取供應商資料時出錯: ${error.message}`)
      }

      console.log(`獲取到 ${data?.length || 0} 筆供應商資料`)

      // 如果沒有資料，創建一些模擬資料以便測試
      if (!data || data.length === 0) {
        console.log("沒有找到供應商資料，創建模擬資料...")
        const mockData = [
          {
            id: 1,
            factory_id: "F001",
            factory_name: "台灣精密製造",
            factory_type: "production",
            location: "台灣",
            quality_contact1: "EMP001",
            quality_contact2: "EMP002",
            factory_phone: "02-12345678",
            status: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 2,
            factory_id: "F002",
            factory_name: "中國零件廠",
            factory_type: "parts",
            location: "中國",
            quality_contact1: "EMP003",
            factory_phone: "86-12345678",
            status: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 3,
            factory_id: "F003",
            factory_name: "越南組裝廠",
            factory_type: "assembly",
            location: "越南",
            quality_contact1: "EMP004",
            quality_contact2: "EMP005",
            factory_phone: "84-12345678",
            status: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]
        setFactories(mockData)
        setFilteredFactories(mockData)
      } else {
        setFactories(data)
        setFilteredFactories(data)
      }
    } catch (err) {
      console.error("獲取供應商資料失敗:", err)
      setError(err instanceof Error ? err.message : "無法載入供應商資料，請稍後再試")

      // 創建一些模擬資料以便測試
      const mockData = [
        {
          id: 1,
          factory_id: "F001",
          factory_name: "台灣精密製造",
          factory_type: "production",
          location: "台灣",
          quality_contact1: "EMP001",
          quality_contact2: "EMP002",
          factory_phone: "02-12345678",
          status: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          factory_id: "F002",
          factory_name: "中國零件廠",
          factory_type: "parts",
          location: "中國",
          quality_contact1: "EMP003",
          factory_phone: "86-12345678",
          status: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]
      setFactories(mockData)
      setFilteredFactories(mockData)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFactories()
  }, [])

  const handleFilterChange = (filters: Record<string, any>) => {
    let result = [...factories]

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      result = result.filter(
        (factory) =>
          factory.factory_name?.toLowerCase().includes(searchTerm) ||
          factory.factory_id?.toLowerCase().includes(searchTerm) ||
          factory.contact_person?.toLowerCase().includes(searchTerm) ||
          factory.contact_email?.toLowerCase().includes(searchTerm),
      )
    }

    // Apply date range filters
    if (filters.created_at) {
      const { from, to } = filters.created_at
      if (from) {
        result = result.filter((factory) => new Date(factory.created_at) >= new Date(from))
      }
      if (to) {
        result = result.filter((factory) => new Date(factory.created_at) <= new Date(to))
      }
    }

    if (filters.updated_at) {
      const { from, to } = filters.updated_at
      if (from) {
        result = result.filter((factory) => new Date(factory.updated_at) >= new Date(from))
      }
      if (to) {
        result = result.filter((factory) => new Date(factory.updated_at) <= new Date(to))
      }
    }

    setFilteredFactories(result)
  }

  const handleExport = () => {
    console.log("導出供應商資料")
  }

  const handleImport = () => {
    console.log("導入供應商資料")
  }

  // 處理狀態更新
  const handleStatusUpdate = async (factoryId: string, newStatus: boolean) => {
    try {
      // 更新本地狀態
      const updatedFactories = factories.map((factory) =>
        factory.factory_id === factoryId ? { ...factory, status: newStatus } : factory,
      )
      setFactories(updatedFactories)
      setFilteredFactories(updatedFactories)

      // 更新資料庫
      const { error } = await supabase
        .from("factories")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("factory_id", factoryId)

      if (error) {
        console.error("更新狀態失敗:", error)
        // 如果更新失敗，回復原狀態
        fetchFactories()
      } else {
        console.log(`供應商 ${factoryId} 狀態已更新為 ${newStatus ? "啟用" : "停用"}`)
      }
    } catch (err) {
      console.error("更新狀態時出錯:", err)
      // 如果更新失敗，回復原狀態
      fetchFactories()
    }
  }

  return (
    <ManagementLayout
      title="供應商管理"
      description="查看和管理所有供應商資料"
      createNewHref="/factories/new"
      createNewLabel="新增供應商"
      filterOptions={filterOptions}
      extraFilterControls={
        <ColumnControlDialog
          columns={columnOptions}
          onColumnChange={setColumnOptions}
          defaultColumns={defaultColumnOptions}
        />
      }
      onFilterChange={handleFilterChange}
      onRefresh={fetchFactories}
      onExport={handleExport}
      onImport={handleImport}
      searchPlaceholder="搜尋供應商名稱、ID或聯絡人..."
      className="px-0"
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <FactoriesTable
        data={filteredFactories}
        isLoading={isLoading}
        visibleColumns={columnOptions.filter((col) => col.visible).map((col) => col.id)}
        columnOrder={columnOptions.map((col) => col.id)}
        onStatusUpdate={handleStatusUpdate}
      />
    </ManagementLayout>
  )
}
