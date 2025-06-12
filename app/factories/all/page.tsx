"use client"

import { useState, useEffect } from "react"
import { FactoriesTable } from "@/components/factories/factories-table"
import { ManagementLayout } from "@/components/ui/management-layout"
import type { FilterOption } from "@/components/ui/advanced-filter"
import { useToast } from "@/components/ui/use-toast"
import { ColumnControlDialog, type ColumnOption } from "@/components/ui/column-control-dialog"
import { supabaseClient } from "@/lib/supabase-client"

export default function FactoriesPage() {
  const [factories, setFactories] = useState([])
  const [filteredFactories, setFilteredFactories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // 定義預設的供應商欄位配置
  const defaultColumnOptions: ColumnOption[] = [
    // 基本資訊
    { id: "factory_id", label: "供應商ID", visible: true, category: "基本資訊", required: true },
    { id: "factory_name", label: "供應商名稱", visible: true, category: "基本資訊", required: true },
    { id: "factory_type", label: "供應商類型", visible: true, category: "基本資訊" },
    { id: "location", label: "國家/地區", visible: true, category: "基本資訊" },
    { id: "quality_contact1", label: "負責品管", visible: true, category: "聯絡資訊" },
    { id: "factory_phone", label: "連絡電話", visible: true, category: "聯絡資訊" },
    { id: "status", label: "狀態", visible: true, category: "其他資訊" },

    // 其他可選欄位
    { id: "factory_full_name", label: "供應商全名", visible: false, category: "基本資訊" },
    { id: "city", label: "城市", visible: false, category: "基本資訊" },
    { id: "factory_address", label: "供應商地址", visible: false, category: "聯絡資訊" },
    { id: "factory_fax", label: "傳真", visible: false, category: "聯絡資訊" },
    { id: "tax_id", label: "統一編號", visible: false, category: "聯絡資訊" },
    { id: "contact_person", label: "聯絡人", visible: false, category: "聯絡資訊" },
    { id: "contact_phone", label: "聯絡人電話", visible: false, category: "聯絡資訊" },
    { id: "contact_email", label: "聯絡人Email", visible: false, category: "聯絡資訊" },
    { id: "website", label: "網站", visible: false, category: "聯絡資訊" },
    { id: "quality_contact2", label: "負責品管2", visible: false, category: "聯絡資訊" },
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

  const filterOptions: FilterOption[] = [
    {
      id: "country",
      label: "國家",
      type: "select",
      options: [
        { value: "taiwan", label: "台灣" },
        { value: "china", label: "中國" },
        { value: "vietnam", label: "越南" },
        { value: "thailand", label: "泰國" },
        { value: "other", label: "其他" },
      ],
    },
    {
      id: "category",
      label: "類別",
      type: "select",
      options: [
        { value: "fastener", label: "緊固件" },
        { value: "bearing", label: "軸承" },
        { value: "tool", label: "工具" },
        { value: "raw", label: "原材料" },
        { value: "other", label: "其他" },
      ],
    },
    {
      id: "status",
      label: "狀態",
      type: "select",
      options: [
        { value: "active", label: "合作中" },
        { value: "inactive", label: "暫停合作" },
        { value: "new", label: "新供應商" },
      ],
    },
  ]

  const fetchFactories = async () => {
    setIsLoading(true)
    try {
      // 從 Supabase 獲取真實的供應商資料
      const { data: factoriesData, error } = await supabaseClient
        .from("factories")
        .select("*")
        .order("factory_id", { ascending: true })

      if (error) {
        throw new Error(`獲取供應商資料時出錯: ${error.message}`)
      }

      setFactories(factoriesData || [])
      setFilteredFactories(factoriesData || [])
    } catch (error) {
      console.error("Failed to fetch factories:", error)
      toast({
        title: "錯誤",
        description: "無法載入供應商資料，請稍後再試",
        variant: "destructive",
      })
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

    // Apply country filter
    if (filters.country) {
      result = result.filter((factory) => factory.country === filters.country)
    }

    // Apply category filter
    if (filters.category) {
      result = result.filter((factory) => factory.category === filters.category)
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter((factory) => factory.status === filters.status)
    }

    setFilteredFactories(result)
  }

  const handleExport = () => {
    toast({
      title: "導出成功",
      description: "供應商資料已成功導出",
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
      <FactoriesTable
        data={filteredFactories}
        isLoading={isLoading}
        visibleColumns={columnOptions.filter((col) => col.visible).map((col) => col.id)}
        columnOrder={columnOptions.map((col) => col.id)}
      />
    </ManagementLayout>
  )
}
