"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"

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
  product?: any
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

  // Add all the state variables that the NewOrderForm expects
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const [poNumber, setPoNumber] = useState<string>("")
  const [paymentTerm, setPaymentTerm] = useState<string>("")
  const [deliveryTerms, setDeliveryTerms] = useState<string>("")
  const [orderNumber, setOrderNumber] = useState<string>("")
  const [isLoadingOrderNumber, setIsLoadingOrderNumber] = useState(false)
  const [customOrderNumber, setCustomOrderNumber] = useState<string>("")
  const [useCustomOrderNumber, setUseCustomOrderNumber] = useState(false)
  const [isCheckingOrderNumber, setIsCheckingOrderNumber] = useState(false)
  const [orderNumberStatus, setOrderNumberStatus] = useState<string>("")
  const [orderNumberMessage, setOrderNumberMessage] = useState<string>("")
  const [isProductSettingsConfirmed, setIsProductSettingsConfirmed] = useState(false)
  const [isProcurementSettingsConfirmed, setIsProcurementSettingsConfirmed] = useState(false)
  const [activeTab, setActiveTab] = useState("products")
  const [isSplitView, setIsSplitView] = useState(false)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [regularProducts, setRegularProducts] = useState<any[]>([])
  const [assemblyProducts, setAssemblyProducts] = useState<any[]>([])
  const [productSelectionTab, setProductSelectionTab] = useState("regular")
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [selectedProductPartNo, setSelectedProductPartNo] = useState<string>("")
  const [customerCurrency, setCustomerCurrency] = useState("USD")
  const [isProductAdded, setIsProductAdded] = useState(false)
  const [loadingSelectedProducts, setLoadingSelectedProducts] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCreatingPurchaseOrder, setIsCreatingPurchaseOrder] = useState(false)
  const [isManagingBatches, setIsManagingBatches] = useState(false)
  const [currentItemForBatch, setCurrentItemForBatch] = useState<OrderItem | null>(null)
  const [orderInfo, setOrderInfo] = useState<any>({})
  const [remarks, setRemarks] = useState("")
  const [procurementItems, setProcurementItems] = useState<any[]>([])

  useEffect(() => {
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
          console.error("Error loading product units:", error)
          return
        }

        setProductUnits(data || [])
      } catch (error) {
        console.error("Error loading product units:", error)
      }
    }

    loadProductUnits()
  }, [])

  const getUnitDisplayName = (unitValue: string) => {
    const unit = productUnits.find((u) => u.value === unitValue)
    return unit ? unit.code : `${unitValue}PCS`
  }

  // Add all the methods that NewOrderForm expects
  const getCurrentItem = () => {
    return currentItemForBatch
  }

  const handleItemChange = (id: string, field: string, value: any) => {
    setOrderItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleRemoveProduct = (id: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== id))
  }

  const calculateItemTotal = (item: OrderItem) => {
    return item.quantity * item.unitPrice
  }

  const openBatchManagement = (item: OrderItem) => {
    setCurrentItemForBatch(item)
    setIsManagingBatches(true)
  }

  const handleClearAllProducts = () => {
    setOrderItems([])
    setIsProductSettingsConfirmed(false)
    // Reset other related states
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + calculateItemTotal(item), 0)
  }

  const confirmProductsReady = () => {
    setIsProductSettingsConfirmed(!isProductSettingsConfirmed)
  }

  const confirmProcurementSettings = () => {
    setIsProcurementSettingsConfirmed(!isProcurementSettingsConfirmed)
  }

  const handleSubmitOrder = async (createPurchaseOrder = false) => {
    // Implementation for submitting order
    console.log("Submitting order...")
  }

  const createPurchaseOrders = async (orderId: string) => {
    // Implementation for creating purchase orders
    console.log("Creating purchase orders for:", orderId)
  }

  const getOrderData = async (skipValidation = false) => {
    // Implementation for getting order data
    return {}
  }

  const handleProcurementDataChange = (data: any) => {
    setProcurementItems(data)
  }

  const checkOrderNumberDuplicate = async (orderNumber: string) => {
    // Implementation for checking order number duplicates
  }

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    return customer?.name || ""
  }

  const isProductSelected = (productId: string) => {
    return selectedProducts.has(productId)
  }

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const clearAllSelections = () => {
    setSelectedProducts(new Set())
  }

  const handleAddSelectedProducts = () => {
    // Implementation for adding selected products
  }

  const handleAddAssemblyProduct = () => {
    // Implementation for adding assembly product
  }

  const getProductPartNo = (product: any) => {
    return product.part_no || ""
  }

  const getProductName = (product: any) => {
    return product.component_name || product.name || ""
  }

  const isProductAssembly = (product: any) => {
    return product.is_assembly || false
  }

  const parseSubPartNo = (subPartNo: any) => {
    return subPartNo || []
  }

  const setIsProcurementReady = (ready: boolean) => {
    // Implementation for setting procurement ready state
  }

  return {
    productUnits,
    getUnitDisplayName,
    loading,
    error,
    customers,
    selectedCustomerId,
    setSelectedCustomerId,
    poNumber,
    setPoNumber,
    paymentTerm,
    setPaymentTerm,
    deliveryTerms,
    setDeliveryTerms,
    orderNumber,
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
    isProductAdded,
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
  }
}
