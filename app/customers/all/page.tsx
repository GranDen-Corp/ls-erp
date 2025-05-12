"use client"

import { useState, useEffect } from "react"
import { CustomersTable } from "@/components/customers/customers-table"
import { ManagementLayout } from "@/components/ui/management-layout"
import type { FilterOption } from "@/components/ui/advanced-filter"
import { useToast } from "@/components/ui/use-toast"
import { supabaseClient } from "@/lib/supabase-client"

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

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
      onFilterChange={handleFilterChange}
      onRefresh={fetchCustomers}
      onExport={handleExport}
      onImport={handleImport}
      searchPlaceholder="搜尋客戶名稱、編號或聯絡人..."
    >
      <CustomersTable data={filteredCustomers} isLoading={isLoading} />
    </ManagementLayout>
  )
}
