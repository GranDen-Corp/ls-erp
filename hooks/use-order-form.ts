"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase-client"
import { generateOrderNumber, validateOrderNumber } from "@/lib/order-number-generator"

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
  port_of_discharge_default?: string
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
  mold_cost?: number
  refundable_mold_quantity?: number
  accounting_note?: string
}

interface Factory {
  factory_id: string
  factory_name: string
  factory_trade_terms?: string
  factory_payment_terms?: string
  quality_contact1?: string
  quality_contact2?: string
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
  expectedDeliveryDate?: string
}

interface ExchangeRate {
  id: number
  currency_code: string
  currency_name: string
  rate_to_usd: number
  is_base_currency: boolean
  is_active: boolean
}

interface ProductUnit {
  id: number
  category: string
  code: string
  name: string
  value: string
  is_active: boolean
  is_default: boolean
  sort_order: number
}

interface ProductTableItem {
  part_no: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
  unit: string
}

export interface PurchaseItem {
  product_part_no: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  expected_delivery_date?: string
  notes?: string
  status?: string
}

export interface Purchase {
  purchase_id?: string
  order_id?: string
  factory_id: string
  factory_name: string
  status?: string
  issue_date?: string
  expected_delivery_date?: string
  payment_term?: string
  delivery_term?: string
  currency?: string
  total_amount: number
  notes?: string
  items: PurchaseItem[]
}

// 輔助函數：獲取單位乘數（需要根據實際的單位系統調整）
function getUnitMultiplier(unit: string): number {
  switch (unit) {
    case "KPCS":
      return 1000
    case "HPCS":
      return 100
    case "TPCS":
      return 10
    case "PCS":
    case "MPCS":
    default:
      return 1
  }
}

// 輔助函數：檢查訂單編號是否已存在
async function checkOrderNumberExists(orderNumber: string): Promise<boolean> {
  const supabase = createClient()
  const { data, error } = await supabase.from("orders").select("*").eq("order_id", orderNumber)

  if (error) {
    console.error("Error checking order number existence:", error)
    return false
  }

  return data && data.length > 0
}

export function useOrderForm() {
  // Basic state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add this line with other state declarations

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

  // 新增交貨日期狀態
  const [deliveryDate, setDeliveryDate] = useState<Date>(new Date())

  // 移除這些舊的狀態
  // const [purchaseRemarks, setPurchaseRemarks] = useState<string>("")
  // const [cartonMarkInfo, setCartonMarkInfo] = useState<string>("")
  // const [palletMarkInfo, setPalletMarkInfo] = useState<string>("")
  // const [jinzhanLabelInfo, setJinzhanLabelInfo] = useState<string>("")
  // const [isJinzhanLabelDisabled, setIsJinzhanLabelDisabled] = useState<boolean>(false)
  // const [isCartonMarkDisabled, setIsCartonMarkDisabled] = useState<boolean>(false)

  // 添加新的狀態
  const [productProcurementInfo, setProductProcurementInfo] = useState<
    Record<
      string,
      {
        productPartNo: string
        procurementRemarks: string
        cartonMarkInfo: string
        palletMarkInfo: string
        jinzhanLabelInfo: string
        purchaseOrderInfo: string
      }
    >
  >({})

  // 在現有狀態後添加
  const [portOfLoading, setPortOfLoading] = useState<string>("TWKHH") // 預設為高雄港的UN/LOCODE
  const [portOfDischarge, setPortOfDischarge] = useState<string>("")
  const [ports, setPorts] = useState<
    Array<{ un_locode: string; port_name_en: string; port_name_zh: string; port_type?: string }>
  >([])
  const [orderCreated, setOrderCreated] = useState<boolean>(false)
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false)
  const [createdOrderId, setCreatedOrderId] = useState<string>("")

  // Data arrays
  const [customers, setCustomers] = useState<Customer[]>([])
  const [factories, setFactories] = useState<Factory[]>([])
  const [regularProducts, setRegularProducts] = useState<Product[]>([])
  const [assemblyProducts, setAssemblyProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [procurementItems, setProcurementItems] = useState<any[]>([])
  const [productUnits, setProductUnits] = useState<ProductUnit[]>([])
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

  // Load initial data and generate order number
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        console.log("開始載入初始資料...")

        const supabase = createClient()

        // Load data from correct tables - include port_type for ports
        const [customersRes, factoriesRes, unitsRes, ratesRes, portsRes] = await Promise.all([
          supabase.from("customers").select("*").order("customer_full_name"),
          supabase.from("factories").select("*").order("factory_name"),
          supabase
            .from("unit_setting")
            .select("*")
            .eq("category", "product_unit")
            .eq("is_active", true)
            .order("sort_order"),
          supabase.from("exchange_rates").select("*").eq("is_active", true).order("currency_code"),
          supabase.from("ports").select("un_locode, port_name_en, port_name_zh, port_type").order("port_name_en"),
        ])

        if (customersRes.error) throw customersRes.error
        if (factoriesRes.error) throw factoriesRes.error
        if (unitsRes.error) throw unitsRes.error
        if (ratesRes.error) throw portsRes.error

        setCustomers(customersRes.data || [])
        setFactories(factoriesRes.data || [])
        setProductUnits(unitsRes.data || [])
        setExchangeRates(ratesRes.data || [])
        setPorts(portsRes.data || [])

        console.log("載入的產品單位:", unitsRes.data)
        console.log("載入的港口資料:", portsRes.data)
        console.log("載入的工廠資料:", factoriesRes.data)

        // 自動生成初始訂單編號
        console.log("開始生成初始訂單編號...")
        setIsLoadingOrderNumber(true)
        const newOrderNumber = await generateOrderNumber()
        console.log("生成的訂單編號:", newOrderNumber)
        setOrderNumber(newOrderNumber || "")
        setIsLoadingOrderNumber(false)

        console.log("初始資料載入完成")
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
          packaging_requirements,
          mold_cost,
          refundable_mold_quantity,
          accounting_note
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

          // Set default port of discharge if available
          if (customer.port_of_discharge_default) {
            setPortOfDischarge(customer.port_of_discharge_default)
          }

          loadCustomerProducts(customerId)
        }
      } else {
        setPaymentTerms("")
        setTradeTerms("")
        setPortOfDischarge("")
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

  // Get default unit
  const defaultUnit = useMemo(() => {
    const defaultUnitItem = productUnits.find((u) => u.is_default === true)
    return defaultUnitItem?.code || (productUnits.length > 0 ? productUnits[0].code : "PCS")
  }, [productUnits])

  // Utility functions
  const getUnitDisplayName = useCallback(
    (unitCode: string) => {
      const unit = productUnits.find((u) => u.code === unitCode)
      return unit ? unit.code : unitCode
    },
    [productUnits],
  )

  const calculateItemTotal = useCallback((item: OrderItem) => {
    const actualQuantityInPcs = item.quantity * getUnitMultiplier(item.unit)
    return actualQuantityInPcs * item.unitPrice
  }, [])

  const calculateTotal = useCallback(() => {
    return orderItems.reduce((total, item) => total + calculateItemTotal(item), 0)
  }, [orderItems, calculateItemTotal])

  const calculateActualQuantity = useCallback((quantity: number, unit: string) => {
    return quantity * getUnitMultiplier(unit)
  }, [])

  const calculateActualUnitPrice = useCallback((unitPrice: number, unit: string) => {
    return unitPrice * getUnitMultiplier(unit)
  }, [])

  // Generate new order number function
  const generateNewOrderNumber = useCallback(async () => {
    if (useCustomOrderNumber) return

    setIsLoadingOrderNumber(true)
    try {
      console.log("手動生成新訂單編號...")
      const newOrderNumber = await generateOrderNumber()
      console.log("手動生成的訂單編號:", newOrderNumber)
      setOrderNumber(newOrderNumber || "")
    } catch (error) {
      console.error("生成訂單編號失敗:", error)
      setError("生成訂單編號失敗")
    } finally {
      setIsLoadingOrderNumber(false)
    }
  }, [useCustomOrderNumber])

  // Other methods remain the same...
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
          const defaultQuantity = 1000 // 修改為預設1000個
          const actualQuantityInPcs = defaultQuantity * getUnitMultiplier(defaultUnit)

          // 設定預設交貨日期為30天後
          const defaultDeliveryDate = new Date()
          defaultDeliveryDate.setDate(defaultDeliveryDate.getDate() + 30)

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
                batchNumber: 1,
                quantity: actualQuantityInPcs,
                plannedShipDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: "pending",
                notes: "",
              },
            ],
            specifications: product.specification || "",
            currency: customerCurrency,
            product: product,
            expectedDeliveryDate: defaultDeliveryDate.toISOString().split("T")[0],
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
  }, [selectedProducts, regularProducts, assemblyProducts, checkIsProductAdded, defaultUnit, customerCurrency])

  const handleAddAssemblyProduct = useCallback(() => {
    if (!selectedProductPartNo) return

    const product = assemblyProducts.find((p) => p.part_no === selectedProductPartNo)
    if (product && !checkIsProductAdded(selectedProductPartNo)) {
      // 設定預設交貨日期為30天後
      const defaultDeliveryDate = new Date()
      defaultDeliveryDate.setDate(defaultDeliveryDate.getDate() + 30)

      const newItem: OrderItem = {
        id: `${Date.now()}-${Math.random()}`,
        productKey: `${product.customer_id}-${product.part_no}`,
        productName: product.component_name || product.part_no,
        productPartNo: product.part_no,
        quantity: 1000, // 修改為預設1000個
        unit: defaultUnit,
        unitPrice: product.unit_price || product.last_price || 0,
        isAssembly: true,
        shipmentBatches: [
          {
            id: `batch-${Date.now()}`,
            batchNumber: 1,
            quantity: 1000,
            plannedShipDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            status: "pending",
          },
        ],
        specifications: product.specification || "",
        currency: customerCurrency,
        product: product,
        expectedDeliveryDate: defaultDeliveryDate.toISOString().split("T")[0],
      }

      setOrderItems((prev) => [...prev, newItem])
      setSelectedProductPartNo("")
      console.log("成功添加組件產品:", product.part_no)
    }
  }, [selectedProductPartNo, assemblyProducts, checkIsProductAdded, defaultUnit, customerCurrency])

  // Form submission
  const handleSubmitOrder = useCallback(
    async (createPurchaseOrder = false) => {
      try {
        setIsSubmitting(true)

        // Validate required fields
        if (!selectedCustomerId) throw new Error("請選擇客戶")
        if (!poNumber) throw new Error("請輸入客戶PO編號")
        if (orderItems.length === 0) throw new Error("請至少添加一個產品")

        const finalOrderNumber = useCustomOrderNumber ? customOrderNumber : orderNumber

        // 使用更新後的驗證函數
        if (!validateOrderNumber(finalOrderNumber)) {
          throw new Error("訂單編號格式不正確，應為 L-YYMMXXXXX 格式")
        }

        // 檢查訂單編號是否已存在
        const exists = await checkOrderNumberExists(finalOrderNumber)
        if (exists) {
          throw new Error(`訂單編號 ${finalOrderNumber} 已存在，請使用其他編號`)
        }

        const supabase = createClient()

        // Prepare order data
        const orderData = {
          order_id: finalOrderNumber,
          customer_id: selectedCustomerId,
          po_id: poNumber,
          port_of_loading: portOfLoading,
          port_of_discharge: portOfDischarge,
          payment_terms: paymentTerms || "",
          trade_terms: tradeTerms || "",
          estimated_delivery_date: deliveryDate.toISOString().split("T")[0], // 格式化為 YYYY-MM-DD
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
      portOfLoading,
      portOfDischarge,
      paymentTerms,
      tradeTerms,
      remarks,
      orderInfo,
      deliveryDate,
    ],
  )

  // 其他處理程序
  const createInitialOrder = useCallback(async () => {
    try {
      setIsCreatingOrder(true)

      // 驗證必填欄位
      if (!selectedCustomerId) throw new Error("請選擇客戶")
      if (!poNumber.trim()) throw new Error("請輸入客戶PO編號")
      if (!portOfLoading) throw new Error("請選擇出貨港")
      if (!portOfDischarge) throw new Error("請選擇到貨港")
      if (!paymentTerms.trim()) throw new Error("請輸入付款條件")
      if (!tradeTerms.trim()) throw new Error("請輸入交貨條件")

      const finalOrderNumber = useCustomOrderNumber ? customOrderNumber : orderNumber
      if (!finalOrderNumber.trim()) throw new Error("請設定訂單編號")

      // 使用更新後的驗證函數
      if (!validateOrderNumber(finalOrderNumber)) {
        throw new Error("訂單編號格式不正確，應為 L-YYMMXXXXX 格式")
      }

      // 檢查訂單編號是否已存在
      const exists = await checkOrderNumberExists(finalOrderNumber)
      if (exists) {
        throw new Error(`訂單編號 ${finalOrderNumber} 已存在，請使用其他編號`)
      }

      const supabase = createClient()

      // 準備訂單基本資料
      const orderData = {
        order_id: finalOrderNumber,
        customer_id: selectedCustomerId,
        po_id: poNumber.trim(),
        port_of_loading: portOfLoading, // 這裡存儲的是un_locode
        port_of_discharge: portOfDischarge, // 這裡存儲的是un_locode
        payment_terms: paymentTerms.trim(),
        trade_terms: tradeTerms.trim(),
        estimated_delivery_date: deliveryDate.toISOString().split("T")[0], // 格式化為 YYYY-MM-DD
        status: 0,
        created_at: new Date().toISOString(),
      }

      // 插入訂單
      const { data, error } = await supabase.from("orders").insert([orderData]).select().single()

      if (error) throw error

      setOrderCreated(true)
      setCreatedOrderId(finalOrderNumber)
      console.log("訂單已成功建立:", data)

      return data
    } catch (err: any) {
      console.error("建立訂單失敗:", err)
      throw err
    } finally {
      setIsCreatingOrder(false)
    }
  }, [
    selectedCustomerId,
    poNumber,
    portOfLoading,
    portOfDischarge,
    paymentTerms,
    tradeTerms,
    useCustomOrderNumber,
    customOrderNumber,
    orderNumber,
    deliveryDate,
  ])

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
    if (isProductSettingsConfirmed) {
      // 如果已確認，則重置為可編輯狀態
      setIsProductSettingsConfirmed(false)
      setIsProcurementReady(false)
      setIsProcurementSettingsConfirmed(false)
      setActiveTab("products")
      console.log("重置為產品編輯狀態")
      return
    }

    if (orderItems.length === 0) {
      alert("請先添加產品到訂單中")
      return
    }

    console.log("確認產品設定完成，訂單項目:", orderItems)

    // 生成訂單備註
    const generatedRemarks = generateOrderRemarks()
    setRemarks(generatedRemarks)

    setIsProductSettingsConfirmed(true)
    console.log("產品設定已確認")
  }, [orderItems, generateOrderRemarks, isProductSettingsConfirmed])

  const handleOrderTableDataChange = useCallback((tableData: ProductTableItem[]) => {
    setOrderTableData(tableData)
    setOrderInfo((prev) => ({
      ...prev,
      product_table: tableData,
    }))
  }, [])

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
        setSelectedProducts([])
        setOrderTableData([])
      }
    },
    [orderItems],
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

  const getPortDisplayName = useCallback(
    (unLocode: string) => {
      const port = ports.find((p) => p.un_locode === unLocode)
      return port ? port.port_name_en : unLocode
    },
    [ports],
  )

  // Define generateCartonMarkInfo before it's used in confirmProcurementSettings
  // 生成紙箱嘜頭資訊
  const generateCartonMarkInfo = useCallback(
    (productPartNo: string) => {
      const portName = getPortDisplayName(portOfDischarge)

      return `紙箱：

PO ${poNumber}
${portName}
C/NO.
MADE IN TAIWAN
R.O.C.`
    },
    [poNumber, portOfDischarge, getPortDisplayName],
  )

  // 生成棧板嘜頭資訊
  const generatePalletMarkInfo = useCallback(
    (productPartNo: string) => {
      const portName = getPortDisplayName(portOfDischarge)

      return `棧板：

PO ${poNumber}
${portName}
P/NO.
MADE IN TAIWAN
R.O.C.`
    },
    [poNumber, portOfDischarge, getPortDisplayName],
  )

  // 生成今湛標籤資訊
  const generateJinzhanLabelInfo = useCallback(
    (productPartNo: string) => {
      const selectedCustomer = customers.find((c) => c.customer_id === selectedCustomerId)
      const customerName = selectedCustomer?.customer_short_name || selectedCustomer?.customer_full_name || ""

      return `今湛標籤：

${customerName}
${productPartNo}
PO ${poNumber}`
    },
    [customers, selectedCustomerId, poNumber],
  )

  // 生成採購單資訊
  const generatePurchaseOrderInfo = useCallback(
    (productPartNo: string) => {
      const orderItem = orderItems.find((item) => item.productPartNo === productPartNo)
      const product = orderItem?.product

      if (!product) return ""

      const finalOrderNumber = useCustomOrderNumber ? customOrderNumber : orderNumber

      // 處理 purchase_requirements 的換行
      const purchaseRequirements = product.order_requirements || ""
      const formattedRequirements = purchaseRequirements.replace(/\\n/g, "\n")

      return `PART# ${product.part_no}
LOT NO. ${finalOrderNumber}
${product.component_name || ""}
HS Code: ${product.customs_code || ""}

${formattedRequirements}

As per print ${product.customer_drawing || ""} ${product.customer_drawing_version || ""}`
    },
    [orderItems, useCustomOrderNumber, customOrderNumber, orderNumber],
  )

  // 生成採購備註
  const generateProcurementRemarks = useCallback(
    (productPartNo: string) => {
      const orderItem = orderItems.find((item) => item.productPartNo === productPartNo)
      const product = orderItem?.product
      const selectedCustomer = customers.find((c) => c.customer_id === selectedCustomerId)

      if (!product || !selectedCustomer) return ""

      // 獲取工廠資訊
      const factory = factories.find((f) => f.factory_id === product.factory_id)

      // 格式化交貨日期
      const deliveryDate = orderItem.expectedDeliveryDate || new Date().toISOString().split("T")[0]
      const formattedDeliveryDate = new Date(deliveryDate).toLocaleDateString("zh-TW")

      // 模具費資訊
      const moldCostInfo = product.mold_cost
        ? `模具費NTD ${product.mold_cost}，出貨數量達"${product.refundable_mold_quantity || 0}" PCS退還`
        : ""

      // 會計備註
      const accountingNote = product.accounting_note || ""

      // TODO: 歷史採購單號及採購數量列表 - 需要從歷史資料中獲取
      const historicalPurchases = "" // 暫時為空，需要實際查詢歷史資料

      return `1.交貨日期： ${formattedDeliveryDate}

2.成交條件：${factory?.factory_trade_terms || ""}

3.付款條件：${factory?.factory_payment_terms || ""}
4.包裝：${selectedCustomer.packaging_details || ""}
5.QUANTITY ALLOWANCE PLUS ${selectedCustomer.qty_allowance_percent || "10"}% / MINUS ${selectedCustomer.qty_allowance_percent || "10"}%

6.${moldCostInfo}
${accountingNote}
${historicalPurchases}

7.樣品.出貨時請附XXX

8.出貨請與${factory?.quality_contact1 || ""}或${factory?.quality_contact2 || ""}聯絡


 *** PPAP 訂單 - 請做生產流程控管 - 將首件樣品、所有製程報告完整保存；
加工體系 確定後不可更改-若要更改 要事先告知 徵得客戶同意 ***`
    },
    [orderItems, customers, selectedCustomerId, factories],
  )

  // Update the confirmProcurementSettings function to generate carton mark info
  const confirmProcurementSettings = useCallback(() => {
    const newSettingsState = !isProcurementSettingsConfirmed
    setIsProcurementSettingsConfirmed(newSettingsState)

    // 當確認採購設定時，自動生成所有產品的嘜頭資訊和採購單資訊
    if (newSettingsState && orderItems.length > 0) {
      const newProcurementInfo: Record<string, any> = {}

      orderItems.forEach((item) => {
        const cartonInfo = generateCartonMarkInfo(item.productPartNo)
        const palletInfo = generatePalletMarkInfo(item.productPartNo)
        const jinzhanInfo = generateJinzhanLabelInfo(item.productPartNo)
        const purchaseInfo = generatePurchaseOrderInfo(item.productPartNo)
        const procurementRemarks = generateProcurementRemarks(item.productPartNo)

        newProcurementInfo[item.productPartNo] = {
          productPartNo: item.productPartNo,
          procurementRemarks: procurementRemarks,
          purchaseOrderInfo: purchaseInfo,
          cartonMarkInfo: cartonInfo,
          palletMarkInfo: palletInfo,
          jinzhanLabelInfo: jinzhanInfo,
        }
      })

      setProductProcurementInfo(newProcurementInfo)
      console.log("已自動生成所有產品的嘜頭資訊、採購單資訊和採購備註:", newProcurementInfo)
    }
  }, [
    isProcurementSettingsConfirmed,
    orderItems,
    generateCartonMarkInfo,
    generatePalletMarkInfo,
    generateJinzhanLabelInfo,
    generatePurchaseOrderInfo,
    generateProcurementRemarks,
    productProcurementInfo,
  ])

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
    deliveryDate, // 新增
    // 移除舊的返回項目
    // purchaseRemarks,
    // setPurchaseRemarks,
    // cartonMarkInfo,
    // palletMarkInfo,
    // jinzhanLabelInfo,
    // isJinzhanLabelDisabled,
    // setCartonMarkInfo,
    // setPalletMarkInfo,
    // setJinzhanLabelInfo,
    // setIsJinzhanLabelDisabled,
    // palletMarkInfo,
    // jinzhanLabelInfo,
    // isJinzhanLabelDisabled,
    // setCartonMarkInfo,
    // setPalletMarkInfo,
    // setJinzhanLabelInfo,
    // setIsJinzhanLabelDisabled,
    // isCartonMarkDisabled,
    // setIsCartonMarkDisabled,

    // 添加新的返回項目
    productProcurementInfo,
    setProductProcurementInfo,
    customers,
    factories,
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
    defaultUnit,

    // 新增的港口相關狀態
    portOfLoading,
    setPortOfLoading,
    portOfDischarge,
    setPortOfDischarge,
    ports,
    orderCreated,
    setOrderCreated,
    isCreatingOrder,
    createdOrderId,

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
    setDeliveryDate, // 新增
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
    getPortDisplayName,

    // 新增的方法
    createInitialOrder,

    // 新增的嘜頭生成函數
    generateCartonMarkInfo,
    generatePalletMarkInfo,
    generateJinzhanLabelInfo,
    generatePurchaseOrderInfo,
    generateProcurementRemarks,
  }
}
