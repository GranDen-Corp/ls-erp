"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import { generateOrderNumber } from "@/lib/order-number-generator"

interface Customer {
  customer_id: string
  customer_full_name: string
  customer_short_name?: string
  payment_due_date?: string
  currency?: string
  customer_address?: string
  customer_phone?: string
  customer_fax?: string
  invoice_email?: string
  sales_representative?: string
  group_code?: string
  division_location?: string
  exchange_rate?: number
}

interface Product {
  id: string
  part_no: string
  component_name: string
  description: string
  is_assembly: boolean
  customer_id: string
  unit_price: number
  last_price: number
  sub_part_no: any
  factory_id: string
  currency: string
  customs_code: string
  order_requirements: string
  customer_drawing: any
  customer_drawing_version: string
  specification: string
}

interface OrderItem {
  id: string
  productKey: string
  productName: string
  productPartNo: string
  quantity: number
  unit: string
  unitPrice: number
  isAssembly: boolean
  shipmentBatches: any[]
  specifications?: string
  remarks?: string
  currency: string
  discount?: number
  taxRate?: number
  product?: Product
}

interface ExchangeRate {
  id: number
  currency_code: string
  currency_name: string
  rate_to_usd: number
  is_base_currency: boolean
  is_active: boolean
}

export const useOrderForm = () => {
  const [productUnits, setProductUnits] = useState<
    Array<{
      id: number
      code: string
      name: string
      value: string
    }>
  >([])

  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])

  // 基本狀態
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 客戶相關
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // 訂單基本資訊
  const [orderNumber, setOrderNumber] = useState<string>("")
  const [poNumber, setPoNumber] = useState<string>("")
  const [paymentTerm, setPaymentTerm] = useState<string>("")
  const [deliveryTerms, setDeliveryTerms] = useState<string>("")

  // 訂單編號相關
  const [isLoadingOrderNumber, setIsLoadingOrderNumber] = useState(false)
  const [customOrderNumber, setCustomOrderNumber] = useState<string>("")
  const [useCustomOrderNumber, setUseCustomOrderNumber] = useState(false)
  const [isCheckingOrderNumber, setIsCheckingOrderNumber] = useState(false)
  const [orderNumberStatus, setOrderNumberStatus] = useState<string>("")
  const [orderNumberMessage, setOrderNumberMessage] = useState<string>("")

  // 產品相關
  const [regularProducts, setRegularProducts] = useState<Product[]>([])
  const [assemblyProducts, setAssemblyProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [selectedProductPartNo, setSelectedProductPartNo] = useState<string>("")
  const [productSelectionTab, setProductSelectionTab] = useState("regular")
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [loadingSelectedProducts, setLoadingSelectedProducts] = useState(false)

  // 工作流程狀態
  const [isProductSettingsConfirmed, setIsProductSettingsConfirmed] = useState(false)
  const [isProcurementSettingsConfirmed, setIsProcurementSettingsConfirmed] = useState(false)
  const [isProcurementReady, setIsProcurementReady] = useState(false)
  const [activeTab, setActiveTab] = useState("products")
  const [isSplitView, setIsSplitView] = useState(false)

  // 其他狀態
  const [customerCurrency, setCustomerCurrency] = useState("USD")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCreatingPurchaseOrder, setIsCreatingPurchaseOrder] = useState(false)
  const [isManagingBatches, setIsManagingBatches] = useState(false)
  const [currentItemForBatch, setCurrentItemForBatch] = useState<OrderItem | null>(null)
  const [orderInfo, setOrderInfo] = useState<any>({})
  const [remarks, setRemarks] = useState("")
  const [procurementItems, setProcurementItems] = useState<any[]>([])

  // 初始化載入數據
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      try {
        await Promise.all([loadCustomers(), loadProductUnits(), loadExchangeRates(), generateNewOrderNumber()])
      } catch (error) {
        console.error("初始化數據失敗:", error)
        setError("載入數據失敗，請重新整理頁面")
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [])

  // 載入客戶列表
  const loadCustomers = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("customers").select("*").order("customer_full_name")

      if (error) {
        console.error("載入客戶失敗:", error)
        return
      }

      setCustomers(data || [])
    } catch (error) {
      console.error("載入客戶失敗:", error)
    }
  }

  // 載入產品單位
  const loadProductUnits = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("static_parameters")
        .select("*")
        .eq("category", "product_unit")
        .eq("is_active", true)
        .order("sort_order")

      if (error) {
        console.error("載入產品單位失敗:", error)
        return
      }

      setProductUnits(data || [])
    } catch (error) {
      console.error("載入產品單位失敗:", error)
    }
  }

  // 載入匯率數據
  const loadExchangeRates = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("exchange_rates")
        .select("*")
        .eq("is_active", true)
        .order("currency_code")

      if (error) {
        console.error("載入匯率失敗:", error)
        return
      }

      setExchangeRates(data || [])
    } catch (error) {
      console.error("載入匯率失敗:", error)
    }
  }

  // 生成新訂單編號
  const generateNewOrderNumber = async () => {
    if (useCustomOrderNumber) return

    setIsLoadingOrderNumber(true)
    try {
      const newOrderNumber = await generateOrderNumber()
      setOrderNumber(newOrderNumber)
    } catch (error) {
      console.error("生成訂單編號失敗:", error)
      setError("生成訂單編號失敗")
    } finally {
      setIsLoadingOrderNumber(false)
    }
  }

  // 當選擇客戶時載入相關數據
  useEffect(() => {
    if (selectedCustomerId) {
      const customer = customers.find((c) => c.customer_id === selectedCustomerId)
      if (customer) {
        setSelectedCustomer(customer)
        setPaymentTerm(customer.payment_due_date || "")
        setDeliveryTerms("") // customers 表中沒有 delivery_terms 欄位
        setCustomerCurrency(customer.currency || "USD")
        loadCustomerProducts(selectedCustomerId)
      }
    } else {
      setSelectedCustomer(null)
      setPaymentTerm("")
      setDeliveryTerms("")
      setCustomerCurrency("USD")
      setRegularProducts([])
      setAssemblyProducts([])
      // 重置產品相關狀態
      setOrderItems([])
      setSelectedProducts([])
      setIsProductSettingsConfirmed(false)
      setIsProcurementReady(false)
      setIsProcurementSettingsConfirmed(false)
    }
  }, [selectedCustomerId, customers])

  // 載入客戶對應的產品
  const loadCustomerProducts = async (customerId: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("products2")
        .select("*")
        .eq("customer_id", customerId)
        .order("part_no")

      if (error) {
        console.error("載入產品失敗:", error)
        return
      }

      const products = data || []
      const regular = products.filter((p) => !p.is_assembly)
      const assembly = products.filter((p) => p.is_assembly)

      setRegularProducts(regular)
      setAssemblyProducts(assembly)
    } catch (error) {
      console.error("載入產品失敗:", error)
    }
  }

  const getUnitDisplayName = (unitValue: string) => {
    const unit = productUnits.find((u) => u.value === unitValue)
    return unit ? unit.code : `${unitValue}PCS`
  }

  // 計算單位換算係數
  const getUnitMultiplier = (unit: string) => {
    const unitLower = unit.toLowerCase()
    if (unitLower.includes("mpcs") || unitLower.includes("1000pcs")) {
      return 1000
    }
    if (unitLower.includes("100pcs")) {
      return 100
    }
    if (unitLower.includes("10pcs")) {
      return 10
    }
    // 默認為1 (pcs, set等)
    return 1
  }

  // 計算實際數量（考慮單位換算）
  const calculateActualQuantity = (quantity: number, unit: string) => {
    return quantity * getUnitMultiplier(unit)
  }

  // 計算實際單價（考慮單位換算）
  const calculateActualUnitPrice = (unitPrice: number, unit: string) => {
    return unitPrice * getUnitMultiplier(unit)
  }

  const getCurrentItem = () => {
    return currentItemForBatch
  }

  const handleItemChange = (id: string, field: string, value: any) => {
    setOrderItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleRemoveProduct = (id: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== id))

    // 如果沒有產品了，解鎖客戶選擇
    if (orderItems.length <= 1) {
      setIsProductSettingsConfirmed(false)
      setIsProcurementReady(false)
      setIsProcurementSettingsConfirmed(false)
    }
  }

  const calculateItemTotal = (item: OrderItem) => {
    const actualUnitPrice = calculateActualUnitPrice(item.unitPrice, item.unit)
    return item.quantity * actualUnitPrice
  }

  const openBatchManagement = (item: OrderItem) => {
    setCurrentItemForBatch(item)
    setIsManagingBatches(true)
  }

  const handleClearAllProducts = () => {
    setOrderItems([])
    setIsProductSettingsConfirmed(false)
    setIsProcurementReady(false)
    setIsProcurementSettingsConfirmed(false)
    setSelectedProducts([])
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + calculateItemTotal(item), 0)
  }

  const confirmProductsReady = () => {
    setIsProductSettingsConfirmed(!isProductSettingsConfirmed)
    if (!isProductSettingsConfirmed) {
      // 確認產品設定時，準備進入採購設定階段
      setIsProcurementReady(true)
    } else {
      // 取消確認時，重置採購相關狀態
      setIsProcurementReady(false)
      setIsProcurementSettingsConfirmed(false)
    }
  }

  const confirmProcurementSettings = () => {
    setIsProcurementSettingsConfirmed(!isProcurementSettingsConfirmed)
  }

  const handleSubmitOrder = async (createPurchaseOrder = false) => {
    console.log("提交訂單...")
    // TODO: 實現訂單提交邏輯
  }

  const createPurchaseOrders = async (orderId: string) => {
    console.log("創建採購單:", orderId)
    // TODO: 實現採購單創建邏輯
  }

  const getOrderData = async (skipValidation = false) => {
    return {}
  }

  const handleProcurementDataChange = (data: any) => {
    setProcurementItems(data)
  }

  const checkOrderNumberDuplicate = async (orderNumber: string) => {
    // TODO: 實現訂單編號重複檢查
  }

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.customer_id === customerId)
    return customer?.customer_full_name || customer?.customer_short_name || ""
  }

  const isProductSelected = (partNo: string) => {
    return selectedProducts.includes(partNo)
  }

  const toggleProductSelection = (partNo: string) => {
    setSelectedProducts((prev) => {
      if (prev.includes(partNo)) {
        return prev.filter((p) => p !== partNo)
      } else {
        return [...prev, partNo]
      }
    })
  }

  const clearAllSelections = () => {
    setSelectedProducts([])
  }

  // Check if a product is already added to the order
  const checkIsProductAdded = (partNo: string) => {
    return orderItems.some((item) => item.productPartNo === partNo)
  }

  const handleAddSelectedProducts = () => {
    if (selectedProducts.length === 0) return

    setLoadingSelectedProducts(true)

    try {
      const newItems: OrderItem[] = []

      selectedProducts.forEach((partNo) => {
        // 使用 part_no 來查找產品，而不是 id
        const product = [...regularProducts, ...assemblyProducts].find((p) => p.part_no === partNo)
        if (product && !checkIsProductAdded(partNo)) {
          const defaultUnit = productUnits.length > 0 ? productUnits[0].value : "PCS"
          const newItem: OrderItem = {
            id: `${Date.now()}-${Math.random()}`,
            productKey: `${product.customer_id}-${product.part_no}`,
            productName: product.component_name || product.part_no,
            productPartNo: product.part_no,
            quantity: 1,
            unit: defaultUnit,
            unitPrice: product.unit_price || product.last_price || 0,
            isAssembly: product.is_assembly || false,
            shipmentBatches: [
              {
                id: `batch-${Date.now()}`,
                batchNumber: 1,
                quantity: 1,
                plannedShipDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30天後
                status: "pending",
              },
            ],
            specifications: product.specification || "",
            currency: product.currency || customerCurrency || "USD",
            product: product,
          }
          newItems.push(newItem)
        }
      })

      if (newItems.length > 0) {
        setOrderItems((prev) => [...prev, ...newItems])
        setSelectedProducts([])
        console.log(`成功添加 ${newItems.length} 個產品`)
      }
    } catch (error) {
      console.error("添加產品失敗:", error)
    } finally {
      setLoadingSelectedProducts(false)
    }
  }

  const handleAddAssemblyProduct = () => {
    if (!selectedProductPartNo) return

    const product = assemblyProducts.find((p) => p.part_no === selectedProductPartNo)
    if (product && !checkIsProductAdded(selectedProductPartNo)) {
      const defaultUnit = productUnits.length > 0 ? productUnits[0].value : "PCS"
      const newItem: OrderItem = {
        id: `${Date.now()}-${Math.random()}`,
        productKey: `${product.customer_id}-${product.part_no}`,
        productName: product.component_name || product.part_no,
        productPartNo: product.part_no,
        quantity: 1,
        unit: defaultUnit,
        unitPrice: product.unit_price || product.last_price || 0,
        isAssembly: true,
        shipmentBatches: [
          {
            id: `batch-${Date.now()}`,
            batchNumber: 1,
            quantity: 1,
            plannedShipDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30天後
            status: "pending",
          },
        ],
        specifications: product.specification || "",
        currency: product.currency || customerCurrency || "USD",
        product: product,
      }

      setOrderItems((prev) => [...prev, newItem])
      setSelectedProductPartNo("")
      console.log("成功添加組件產品:", product.part_no)
    }
  }

  const getProductPartNo = (product: Product) => {
    return product.part_no || ""
  }

  const getProductName = (product: Product) => {
    return product.component_name || product.part_no || ""
  }

  const isProductAssembly = (product: Product) => {
    return product.is_assembly || false
  }

  const parseSubPartNo = (product: Product) => {
    if (!product.sub_part_no) return []

    try {
      // If it's already an array, return it
      if (Array.isArray(product.sub_part_no)) {
        return product.sub_part_no
      }

      // If it's a string, try to parse it as JSON
      if (typeof product.sub_part_no === "string") {
        const parsed = JSON.parse(product.sub_part_no)
        return Array.isArray(parsed) ? parsed : []
      }

      // If it's an object, wrap it in an array
      if (typeof product.sub_part_no === "object") {
        return [product.sub_part_no]
      }

      return []
    } catch (error) {
      console.error("Error parsing sub_part_no:", error)
      return []
    }
  }

  return {
    productUnits,
    exchangeRates,
    getUnitDisplayName,
    getUnitMultiplier,
    calculateActualQuantity,
    calculateActualUnitPrice,
    loading,
    error,
    customers,
    selectedCustomerId,
    setSelectedCustomerId,
    selectedCustomer,
    poNumber,
    setPoNumber,
    paymentTerm,
    setPaymentTerm,
    deliveryTerms,
    setDeliveryTerms,
    orderNumber,
    setOrderNumber,
    isLoadingOrderNumber,
    customOrderNumber,
    setCustomOrderNumber,
    useCustomOrderNumber,
    setUseCustomOrderNumber,
    isCheckingOrderNumber,
    orderNumberStatus,
    orderNumberMessage,
    checkOrderNumberDuplicate,
    isProductSettingsConfirmed,
    isProcurementSettingsConfirmed,
    isProcurementReady,
    getCustomerName,
    setOrderNumberStatus,
    setOrderNumberMessage,
    orderItems,
    setOrderItems,
    activeTab,
    setActiveTab,
    isSplitView,
    setIsSplitView,
    regularProducts,
    assemblyProducts,
    productSelectionTab,
    setProductSelectionTab,
    productSearchTerm,
    setProductSearchTerm,
    selectedProducts,
    selectedProductPartNo,
    setSelectedProductPartNo,
    customerCurrency,
    checkIsProductAdded,
    isProductSelected,
    toggleProductSelection,
    clearAllSelections,
    handleAddSelectedProducts,
    handleAddAssemblyProduct,
    loadingSelectedProducts,
    getProductPartNo,
    getProductName,
    isProductAssembly,
    parseSubPartNo,
    handleItemChange,
    handleRemoveProduct,
    calculateItemTotal,
    openBatchManagement,
    handleClearAllProducts,
    calculateTotal,
    confirmProductsReady,
    confirmProcurementSettings,
    handleSubmitOrder,
    createPurchaseOrders,
    getOrderData,
    handleProcurementDataChange,
    isSubmitting,
    isCreatingPurchaseOrder,
    isManagingBatches,
    setIsManagingBatches,
    getCurrentItem,
    orderInfo,
    setOrderInfo,
    remarks,
    setRemarks,
    procurementItems,
    setIsProcurementReady,
    generateNewOrderNumber,
  }
}
