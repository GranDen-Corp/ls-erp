"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase-client"
import { generateOrderNumber } from "@/lib/order-number-generator"

interface Customer {
  customer_id: string
  customer_full_name: string
  customer_short_name?: string
  payment_due_date?: string
  payment_terms_specification?: string
  trade_terms_specification?: string
  currency?: string
  customer_address?: string
  customer_phone?: string
  customer_fax?: string
  invoice_email?: string
  sales_representative?: string
  group_code?: string
  division_location?: string
  exchange_rate?: number
  packaging_details?: string
  qty_allowance_percent?: string
  client_contact_person?: string
  client_contact_person_email?: string
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
  product_type?: string
  customer_original_drawing?: string
  drawing_version?: string
  packaging_requirements?: string
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

interface ProductTableItem {
  part_no: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
  unit: string
}

export function useOrderForm() {
  // Basic state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form data with proper string initialization
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const [poNumber, setPoNumber] = useState<string>("")
  const [orderNumber, setOrderNumber] = useState<string>("")
  const [customOrderNumber, setCustomOrderNumber] = useState<string>("")
  const [useCustomOrderNumber, setUseCustomOrderNumber] = useState<boolean>(false)
  const [paymentTerms, setPaymentTerms] = useState<string>("")
  const [tradeTerms, setTradeTerms] = useState<string>("")
  const [remarks, setRemarks] = useState<string>("")
  const [orderInfo, setOrderInfo] = useState<Record<string, any>>({})
  const [purchaseInfo, setPurchaseInfo] = useState<string>("")
  const [purchaseRemarks, setPurchaseRemarks] = useState<string>("")

  // Data arrays
  const [customers, setCustomers] = useState<Customer[]>([])
  const [regularProducts, setRegularProducts] = useState<Product[]>([])
  const [assemblyProducts, setAssemblyProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [procurementItems, setProcurementItems] = useState<any[]>([])
  const [productUnits, setProductUnits] = useState<any[]>([])
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [orderTableData, setOrderTableData] = useState<ProductTableItem[]>([])

  // UI state
  const [activeTab, setActiveTab] = useState<string>("products")
  const [productSelectionTab, setProductSelectionTab] = useState<string>("regular")
  const [productSearchTerm, setProductSearchTerm] = useState<string>("")
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [selectedProductPartNo, setSelectedProductPartNo] = useState<string>("")
  const [isProductSettingsConfirmed, setIsProductSettingsConfirmed] = useState<boolean>(false)
  const [isProcurementSettingsConfirmed, setIsProcurementSettingsConfirmed] = useState<boolean>(false)
  const [isProcurementReady, setIsProcurementReady] = useState<boolean>(false)
  const [isSplitView, setIsSplitView] = useState<boolean>(false)
  const [isManagingBatches, setIsManagingBatches] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isCreatingPurchaseOrder, setIsCreatingPurchaseOrder] = useState<boolean>(false)
  const [isLoadingOrderNumber, setIsLoadingOrderNumber] = useState<boolean>(false)
  const [loadingSelectedProducts, setLoadingSelectedProducts] = useState<boolean>(false)
  const [currentItemForBatch, setCurrentItemForBatch] = useState<OrderItem | null>(null)
  const [orderNumberStatus, setOrderNumberStatus] = useState<string>("")
  const [orderNumberMessage, setOrderNumberMessage] = useState<string>("")
  const [isCheckingOrderNumber, setIsCheckingOrderNumber] = useState<boolean>(false)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

        // Load data from correct tables
        const [customersRes, unitsRes, ratesRes] = await Promise.all([
          supabase.from("customers").select("*").order("customer_full_name"),
          supabase
            .from("unit_setting")
            .select("*")
            .eq("category", "product_unit")
            .eq("is_active", true)
            .order("sort_order"),
          supabase.from("exchange_rates").select("*").eq("is_active", true).order("currency_code"),
        ])

        if (customersRes.error) throw customersRes.error
        if (unitsRes.error) throw unitsRes.error
        if (ratesRes.error) throw ratesRes.error

        setCustomers(customersRes.data || [])
        setProductUnits(unitsRes.data || [])
        setExchangeRates(ratesRes.data || [])

        // Generate initial order number
        const newOrderNumber = await generateOrderNumber()
        setOrderNumber(newOrderNumber || "")
      } catch (err: any) {
        console.error("Error loading data:", err)
        setError(err.message || "載入資料時發生錯誤")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Load customer products when customer is selected
  const loadCustomerProducts = useCallback(async (customerId: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_type,
          customer_original_drawing,
          drawing_version,
          packaging_requirements
        `)
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
  }, [])

  // Customer selection handler
  const handleCustomerSelection = useCallback(
    (customerId: string) => {
      setSelectedCustomerId(customerId)

      if (customerId) {
        const customer = customers.find((c) => c.customer_id === customerId)
        if (customer) {
          // Ensure we always set strings, never null/undefined
          setPaymentTerms(customer.payment_terms_specification || customer.payment_due_date || "")
          setTradeTerms(customer.trade_terms_specification || "")
          loadCustomerProducts(customerId)
        }
      } else {
        setPaymentTerms("")
        setTradeTerms("")
        setRegularProducts([])
        setAssemblyProducts([])
        setOrderItems([])
        setSelectedProducts([])
        setIsProductSettingsConfirmed(false)
        setIsProcurementReady(false)
        setIsProcurementSettingsConfirmed(false)
        setOrderTableData([])
      }
    },
    [customers, loadCustomerProducts],
  )

  // Get customer currency
  const customerCurrency = useMemo(() => {
    const customer = customers.find((c) => c.customer_id === selectedCustomerId)
    return customer?.currency || "USD"
  }, [customers, selectedCustomerId])

  // Get selected customer
  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.customer_id === selectedCustomerId) || null
  }, [customers, selectedCustomerId])

  // Utility functions
  const getUnitDisplayName = useCallback(
    (unitValue: string) => {
      const unit = productUnits.find((u) => u.value === unitValue)
      return unit ? unit.code : `${unitValue}PCS`
    },
    [productUnits],
  )

  const getUnitMultiplier = useCallback((unit: string) => {
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
    return 1
  }, [])

  const calculateItemTotal = useCallback(
    (item: OrderItem) => {
      const actualQuantityInPcs = item.quantity * getUnitMultiplier(item.unit)
      return actualQuantityInPcs * item.unitPrice
    },
    [getUnitMultiplier],
  )

  const calculateTotal = useCallback(() => {
    return orderItems.reduce((total, item) => total + calculateItemTotal(item), 0)
  }, [orderItems, calculateItemTotal])

  const calculateActualQuantity = useCallback(
    (quantity: number, unit: string) => {
      return quantity * getUnitMultiplier(unit)
    },
    [getUnitMultiplier],
  )

  const calculateActualUnitPrice = useCallback(
    (unitPrice: number, unit: string) => {
      return unitPrice * getUnitMultiplier(unit)
    },
    [getUnitMultiplier],
  )

  // Product management
  const checkIsProductAdded = useCallback(
    (partNo: string) => {
      return orderItems.some((item) => item.productPartNo === partNo)
    },
    [orderItems],
  )

  const isProductSelected = useCallback(
    (partNo: string) => {
      return selectedProducts.includes(partNo)
    },
    [selectedProducts],
  )

  const toggleProductSelection = useCallback((partNo: string) => {
    setSelectedProducts((prev) => {
      if (prev.includes(partNo)) {
        return prev.filter((p) => p !== partNo)
      } else {
        return [...prev, partNo]
      }
    })
  }, [])

  const clearAllSelections = useCallback(() => {
    setSelectedProducts([])
  }, [])

  const handleAddSelectedProducts = useCallback(() => {
    if (selectedProducts.length === 0) return

    setLoadingSelectedProducts(true)

    try {
      const newItems: OrderItem[] = []

      selectedProducts.forEach((partNo) => {
        const product = [...regularProducts, ...assemblyProducts].find((p) => p.part_no === partNo)
        if (product && !checkIsProductAdded(partNo)) {
          const defaultUnit = productUnits.length > 0 ? productUnits[0].value : "PCS"
          const defaultQuantity = 1
          const actualQuantityInPcs = defaultQuantity * getUnitMultiplier(defaultUnit)

          const newItem: OrderItem = {
            id: `${Date.now()}-${Math.random()}`,
            productKey: `${product.customer_id}-${product.part_no}`,
            productName: product.component_name || product.part_no,
            productPartNo: product.part_no,
            quantity: defaultQuantity,
            unit: defaultUnit,
            unitPrice: product.unit_price || product.last_price || 0,
            isAssembly: product.is_assembly || false,
            shipmentBatches: [
              {
                id: `batch-${Date.now()}`,
                productPartNo: product.part_no,
                batchNumber: 1,
                quantity: actualQuantityInPcs,
                unit: "PCS",
                unitMultiplier: 1,
                plannedShipDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: "pending",
                notes: "",
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
  }, [
    selectedProducts,
    regularProducts,
    assemblyProducts,
    checkIsProductAdded,
    productUnits,
    getUnitMultiplier,
    customerCurrency,
  ])

  const handleAddAssemblyProduct = useCallback(() => {
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
            plannedShipDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
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
  }, [selectedProductPartNo, assemblyProducts, checkIsProductAdded, productUnits, customerCurrency])

  // Form submission
  const handleSubmitOrder = useCallback(
    async (createPurchaseOrder = false) => {
      try {
        setIsSubmitting(true)

        // Validate required fields
        if (!selectedCustomerId) throw new Error("請選擇客戶")
        if (!poNumber) throw new Error("請輸入客戶PO編號")
        if (orderItems.length === 0) throw new Error("請至少添加一個產品")

        const supabase = createClient()

        // Prepare order data
        const orderData = {
          order_id: useCustomOrderNumber ? customOrderNumber : orderNumber,
          customer_id: selectedCustomerId,
          po_id: poNumber,
          payment_terms: paymentTerms || "",
          trade_terms: tradeTerms || "",
          remarks: remarks || "",
          order_info: orderInfo,
          status: 0,
          created_at: new Date().toISOString(),
          order_items: orderItems.map((item) => ({
            product_part_no: item.productPartNo,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            currency: item.currency,
            unit: item.unit,
            is_assembly: item.isAssembly,
            shipment_batches: item.shipmentBatches || [],
          })),
        }

        // Insert order
        const { data, error } = await supabase.from("orders").insert([orderData]).select()

        if (error) throw error

        return data
      } catch (err: any) {
        console.error("Error submitting order:", err)
        throw err
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      selectedCustomerId,
      poNumber,
      orderItems,
      useCustomOrderNumber,
      customOrderNumber,
      orderNumber,
      paymentTerms,
      tradeTerms,
      remarks,
      orderInfo,
    ],
  )

  // Other handlers
  const generateOrderRemarks = useCallback(() => {
    const selectedCustomer = customers.find((c) => c.customer_id === selectedCustomerId)
    if (!selectedCustomer || orderItems.length === 0) return ""

    // 1. DELIVERY 部分
    const deliveryLines = orderItems.map((item) => {
      const etdDate = new Date()
      etdDate.setDate(etdDate.getDate() + 30) // 預設30天後
      const etdString = etdDate.toISOString().split("T")[0].replace(/-/g, "/")

      return `${item.productPartNo}: ${item.quantity} ${getUnitDisplayName(item.unit)} ETD ${etdString} XXX`
    })

    const remarks = `1. DELIVERY:
${deliveryLines.join("\n")}

2. PAYMENT: ${selectedCustomer.payment_terms_specification || "TBD"}

3. PACKING: ${selectedCustomer.packaging_details || "Standard Export Packing"}

4. QUANTITY ALLOWANCE PLUS ${selectedCustomer.qty_allowance_percent || "10"}% / MINUS ${selectedCustomer.qty_allowance_percent || "10"}%

5. FORWARDER AGENT: -

6. MATERIAL CERTS, INSPECTED REPORT REQUIRED

7. ORDER BY - ${selectedCustomer.client_contact_person || "TBD"} <${selectedCustomer.client_contact_person_email || "TBD"}>


`

    return remarks
  }, [customers, selectedCustomerId, orderItems, getUnitDisplayName])

  const confirmProductsReady = useCallback(() => {
    if (orderItems.length === 0) {
      alert("請先添加產品到訂單中")
      return
    }

    // 生成訂單備註
    const generatedRemarks = generateOrderRemarks()
    setRemarks(generatedRemarks)

    setIsProductSettingsConfirmed(true)
  }, [orderItems.length, generateOrderRemarks])

  const handleOrderTableDataChange = useCallback((tableData: ProductTableItem[]) => {
    setOrderTableData(tableData)
    setOrderInfo((prev) => ({
      ...prev,
      product_table: tableData,
    }))
  }, [])

  const generateNewOrderNumber = useCallback(async () => {
    if (useCustomOrderNumber) return

    setIsLoadingOrderNumber(true)
    try {
      const newOrderNumber = await generateOrderNumber()
      setOrderNumber(newOrderNumber || "")
    } catch (error) {
      console.error("生成訂單編號失敗:", error)
      setError("生成訂單編號失敗")
    } finally {
      setIsLoadingOrderNumber(false)
    }
  }, [useCustomOrderNumber])

  const handleItemChange = useCallback((id: string, field: string, value: any) => {
    setOrderItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }, [])

  const handleRemoveProduct = useCallback(
    (id: string) => {
      setOrderItems((prev) => prev.filter((item) => item.id !== id))

      if (orderItems.length <= 1) {
        setIsProductSettingsConfirmed(false)
        setIsProcurementReady(false)
        setIsProcurementSettingsConfirmed(false)
        setOrderTableData([])
      }
    },
    [orderItems.length],
  )

  const openBatchManagement = useCallback((item: OrderItem) => {
    setCurrentItemForBatch(item)
    setIsManagingBatches(true)
  }, [])

  const getCurrentItem = useCallback(() => {
    return currentItemForBatch
  }, [currentItemForBatch])

  const handleClearAllProducts = useCallback(() => {
    setOrderItems([])
    setIsProductSettingsConfirmed(false)
    setIsProcurementReady(false)
    setIsProcurementSettingsConfirmed(false)
    setSelectedProducts([])
    setOrderTableData([])
  }, [])

  const getProductPartNo = useCallback((product: Product) => {
    return product.part_no || ""
  }, [])

  const getProductName = useCallback((product: Product) => {
    return product.component_name || product.part_no || ""
  }, [])

  const isProductAssembly = useCallback((product: Product) => {
    return product.is_assembly || false
  }, [])

  const parseSubPartNo = useCallback((product: Product) => {
    if (!product.sub_part_no) return []

    try {
      if (Array.isArray(product.sub_part_no)) {
        return product.sub_part_no
      }

      if (typeof product.sub_part_no === "string") {
        const parsed = JSON.parse(product.sub_part_no)
        return Array.isArray(parsed) ? parsed : []
      }

      if (typeof product.sub_part_no === "object") {
        return [product.sub_part_no]
      }

      return []
    } catch (error) {
      console.error("Error parsing sub_part_no:", error)
      return []
    }
  }, [])

  const handleProcurementDataChange = useCallback((data: any) => {
    setProcurementItems(data)
  }, [])

  const createPurchaseOrders = useCallback(async (orderId: string) => {
    console.log("創建採購單:", orderId)
    return []
  }, [])

  const confirmProcurementSettings = useCallback(() => {
    setIsProcurementSettingsConfirmed(!isProcurementSettingsConfirmed)
  }, [isProcurementSettingsConfirmed])

  const getOrderData = useCallback(
    async (skipValidation = false) => {
      return {
        order_id: useCustomOrderNumber ? customOrderNumber : orderNumber,
        customer_id: selectedCustomerId,
        po_id: poNumber,
        payment_terms: paymentTerms,
        trade_terms: tradeTerms,
        remarks: remarks,
        order_info: orderInfo,
        order_items: orderItems,
        created_at: new Date().toISOString(),
        status: 0,
      }
    },
    [
      useCustomOrderNumber,
      customOrderNumber,
      orderNumber,
      selectedCustomerId,
      poNumber,
      paymentTerms,
      tradeTerms,
      remarks,
      orderInfo,
      orderItems,
    ],
  )

  const getCustomerName = useCallback(
    (customerId: string) => {
      const customer = customers.find((c) => c.customer_id === customerId)
      return customer?.customer_full_name || customer?.customer_short_name || ""
    },
    [customers],
  )

  const checkOrderNumberDuplicate = useCallback(async (orderNumber: string) => {
    // TODO: 實現訂單編號重複檢查
  }, [])

  return {
    // State
    loading,
    error,
    selectedCustomerId,
    selectedCustomer,
    poNumber,
    orderNumber,
    customOrderNumber,
    useCustomOrderNumber,
    paymentTerms,
    tradeTerms,
    remarks,
    orderInfo,
    purchaseInfo,
    purchaseRemarks,
    customers,
    regularProducts,
    assemblyProducts,
    orderItems,
    procurementItems,
    productUnits,
    exchangeRates,
    orderTableData,
    activeTab,
    productSelectionTab,
    productSearchTerm,
    selectedProducts,
    selectedProductPartNo,
    isProductSettingsConfirmed,
    isProcurementSettingsConfirmed,
    isProcurementReady,
    isSplitView,
    isManagingBatches,
    isSubmitting,
    isCreatingPurchaseOrder,
    isLoadingOrderNumber,
    loadingSelectedProducts,
    currentItemForBatch,
    orderNumberStatus,
    orderNumberMessage,
    isCheckingOrderNumber,
    customerCurrency,

    // Setters
    setSelectedCustomerId: handleCustomerSelection,
    setPoNumber,
    setOrderNumber,
    setCustomOrderNumber,
    setUseCustomOrderNumber,
    setPaymentTerms,
    setTradeTerms,
    setRemarks,
    setOrderInfo,
    setPurchaseInfo,
    setPurchaseRemarks,
    setOrderItems,
    setActiveTab,
    setProductSelectionTab,
    setProductSearchTerm,
    setSelectedProductPartNo,
    setIsProductSettingsConfirmed,
    setIsProcurementSettingsConfirmed,
    setIsProcurementReady,
    setIsSplitView,
    setIsManagingBatches,
    setIsSubmitting,
    setIsCreatingPurchaseOrder,
    setIsLoadingOrderNumber,
    setLoadingSelectedProducts,
    setOrderNumberStatus,
    setOrderNumberMessage,

    // Methods
    getUnitDisplayName,
    getUnitMultiplier,
    calculateItemTotal,
    calculateTotal,
    calculateActualQuantity,
    calculateActualUnitPrice,
    checkIsProductAdded,
    isProductSelected,
    toggleProductSelection,
    clearAllSelections,
    handleSubmitOrder,
    confirmProductsReady,
    handleOrderTableDataChange,
    generateNewOrderNumber,
    handleItemChange,
    handleRemoveProduct,
    openBatchManagement,
    getCurrentItem,
    handleClearAllProducts,
    handleAddSelectedProducts,
    handleAddAssemblyProduct,
    getProductPartNo,
    getProductName,
    isProductAssembly,
    parseSubPartNo,
    handleProcurementDataChange,
    createPurchaseOrders,
    confirmProcurementSettings,
    getOrderData,
    getCustomerName,
    checkOrderNumberDuplicate,
    generateOrderRemarks,
  }
}
