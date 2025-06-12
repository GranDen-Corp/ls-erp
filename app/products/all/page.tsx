"use client"

import { useState, useEffect } from "react"
import { ProductsTable } from "@/components/products/products-table"
import { ManagementLayout } from "@/components/ui/management-layout"
import type { FilterOption } from "@/components/ui/advanced-filter"
import { ColumnControlDialog, type ColumnOption } from "@/components/ui/column-control-dialog"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // 定義預設的產品欄位配置
  const defaultColumnOptions: ColumnOption[] = [
    // 基本資訊
    { id: "part_no", label: "Part No.", visible: true, category: "基本資訊", required: true },
    { id: "component_name", label: "產品名稱", visible: true, category: "基本資訊", required: true },
    { id: "customer_id", label: "客戶", visible: true, category: "基本資訊" },
    { id: "product_type", label: "產品類型", visible: true, category: "基本資訊" },
    { id: "material", label: "材質", visible: true, category: "技術資訊" },
    { id: "last_price", label: "最近價格", visible: true, category: "商業資訊" },
    { id: "currency", label: "幣別", visible: true, category: "商業資訊" },
    { id: "status", label: "狀態", visible: true, category: "其他資訊" },

    // 技術資訊
    { id: "specification", label: "規格", visible: false, category: "技術資訊" },
    { id: "drawing_no", label: "圖號", visible: false, category: "技術資訊" },
    { id: "surface_treatment", label: "表面處理", visible: false, category: "技術資訊" },
    { id: "hardness", label: "硬度", visible: false, category: "技術資訊" },
    { id: "weight", label: "重量", visible: false, category: "技術資訊" },
    { id: "unit", label: "單位", visible: false, category: "技術資訊" },

    // 商業資訊
    { id: "moq", label: "最小訂購量", visible: false, category: "商業資訊" },
    { id: "lead_time", label: "交期", visible: false, category: "商業資訊" },
    { id: "packaging", label: "包裝", visible: false, category: "商業資訊" },
    { id: "factory_id", label: "工廠", visible: false, category: "商業資訊" },

    // 其他資訊
    { id: "notes", label: "備註", visible: false, category: "其他資訊" },
    { id: "created_at", label: "建立時間", visible: false, category: "其他資訊" },
    { id: "updated_at", label: "更新時間", visible: false, category: "其他資訊" },
    { id: "is_assembly", label: "是否組合產品", visible: false, category: "其他資訊" },
  ]

  const [columnOptions, setColumnOptions] = useState<ColumnOption[]>(defaultColumnOptions)

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

  const fetchProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // 從 Supabase 獲取真實的產品資料
      const { data: productsData, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .order("part_no", { ascending: true })

      if (fetchError) {
        throw new Error(`獲取產品資料時出錯: ${fetchError.message}`)
      }

      // 處理產品數據
      const processedProducts =
        productsData?.map((product) => {
          // 處理 sub_part_no
          let subPartNo = product.sub_part_no
          try {
            if (typeof subPartNo === "string" && subPartNo) {
              subPartNo = JSON.parse(subPartNo)
            }
          } catch (e) {
            console.error("解析 sub_part_no 時出錯:", e)
            subPartNo = []
          }

          // 處理 images
          let images = product.images
          try {
            if (typeof images === "string" && images) {
              images = JSON.parse(images)
            }
          } catch (e) {
            console.error("解析 images 時出錯:", e)
            images = []
          }

          // 確保 images 是數組
          if (!Array.isArray(images)) {
            images = []
          }

          // 確保每個圖片對象都有必要的屬性
          const validImages = images
            .filter((img) => img && typeof img === "object")
            .map((img, index) => ({
              id: img.id || `img-${index}`,
              url: img.url || "/diverse-products-still-life.png",
              alt: img.alt || product.component_name || "產品圖片",
              isThumbnail: img.isThumbnail || false,
            }))

          return {
            ...product,
            sub_part_no: subPartNo,
            images:
              validImages.length > 0
                ? validImages
                : [
                    {
                      id: "default",
                      url: "/diverse-products-still-life.png",
                      alt: product.component_name || "產品圖片",
                      isThumbnail: true,
                    },
                  ],
          }
        }) || []

      setProducts(processedProducts)
      setFilteredProducts(processedProducts)
    } catch (error) {
      console.error("Failed to fetch products:", error)
      setError(error instanceof Error ? error.message : "無法載入產品資料，請稍後再試")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleFilterChange = (filters: Record<string, any>) => {
    let result = [...products]

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      result = result.filter(
        (product) =>
          product.part_no?.toLowerCase().includes(searchTerm) ||
          product.component_name?.toLowerCase().includes(searchTerm) ||
          product.customer_id?.toLowerCase().includes(searchTerm),
      )
    }

    // Apply date range filters
    if (filters.created_at) {
      const { from, to } = filters.created_at
      if (from) {
        result = result.filter((product) => new Date(product.created_at) >= new Date(from))
      }
      if (to) {
        result = result.filter((product) => new Date(product.created_at) <= new Date(to))
      }
    }

    if (filters.updated_at) {
      const { from, to } = filters.updated_at
      if (from) {
        result = result.filter((product) => new Date(product.updated_at) >= new Date(from))
      }
      if (to) {
        result = result.filter((product) => new Date(product.updated_at) <= new Date(to))
      }
    }

    setFilteredProducts(result)
  }

  const handleExport = () => {
    console.log("導出產品資料")
  }

  const handleImport = () => {
    console.log("導入產品資料")
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-red-500 text-center">{error}</p>
        <button onClick={fetchProducts} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          重新載入
        </button>
      </div>
    )
  }

  return (
    <ManagementLayout
      title="產品管理"
      description="查看和管理所有產品資料"
      createNewHref="/products/new"
      createNewLabel="新增產品"
      filterOptions={filterOptions}
      extraFilterControls={
        <ColumnControlDialog
          columns={columnOptions}
          onColumnChange={setColumnOptions}
          defaultColumns={defaultColumnOptions}
        />
      }
      onFilterChange={handleFilterChange}
      onRefresh={fetchProducts}
      onExport={handleExport}
      onImport={handleImport}
      searchPlaceholder="搜尋產品編號、名稱或客戶..."
      className="px-0"
    >
      <ProductsTable
        products={filteredProducts}
        isLoading={isLoading}
        visibleColumns={columnOptions.filter((col) => col.visible).map((col) => col.id)}
        columnOrder={columnOptions.map((col) => col.id)}
      />
    </ManagementLayout>
  )
}
