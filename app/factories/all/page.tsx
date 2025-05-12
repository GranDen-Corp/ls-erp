"use client"

import { useState, useEffect } from "react"
import { FactoriesTable } from "@/components/factories/factories-table"
import { ManagementLayout } from "@/components/ui/management-layout"
import type { FilterOption } from "@/components/ui/advanced-filter"
import { useToast } from "@/components/ui/use-toast"

export default function FactoriesPage() {
  const [factories, setFactories] = useState([])
  const [filteredFactories, setFilteredFactories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock data
      const mockFactories = [
        {
          id: "1",
          name: "台灣精密製造廠",
          contactPerson: "林經理",
          phone: "02-23456789",
          email: "contact@tpmf.com.tw",
          country: "taiwan",
          category: "fastener",
          status: "active",
        },
        {
          id: "2",
          name: "中國東莞五金廠",
          contactPerson: "王先生",
          phone: "+86-769-12345678",
          email: "sales@dgmetal.com.cn",
          country: "china",
          category: "tool",
          status: "active",
        },
        {
          id: "3",
          name: "越南河內製造",
          contactPerson: "Nguyen",
          phone: "+84-24-87654321",
          email: "info@hanoifactory.com.vn",
          country: "vietnam",
          category: "bearing",
          status: "new",
        },
        {
          id: "4",
          name: "泰國曼谷工業",
          contactPerson: "Somchai",
          phone: "+66-2-12345678",
          email: "contact@bangkokindustry.co.th",
          country: "thailand",
          category: "raw",
          status: "inactive",
        },
      ]

      setFactories(mockFactories)
      setFilteredFactories(mockFactories)
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
          factory.name.toLowerCase().includes(searchTerm) ||
          factory.contactPerson.toLowerCase().includes(searchTerm) ||
          factory.email.toLowerCase().includes(searchTerm),
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
      onFilterChange={handleFilterChange}
      onRefresh={fetchFactories}
      onExport={handleExport}
      onImport={handleImport}
      searchPlaceholder="搜尋供應商名稱、聯絡人或電子郵件..."
    >
      <FactoriesTable data={filteredFactories} isLoading={isLoading} />
    </ManagementLayout>
  )
}
