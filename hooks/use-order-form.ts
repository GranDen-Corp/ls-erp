"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase-client"
import { addDays, format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { generateOrderNumber } from "@/lib/order-number-generator"
import { createPurchasesFromProcurementItems } from "@/lib/services/purchase-service"
import { generateOrderBatchId, generateProductIndex } from "@/lib/order-batch-utils"
import { createOrderBatchItems, type OrderBatchItem } from "@/lib/services/order-batch-service"
import { convertCurrency } from "@/lib/currency-utils"

// 定義類型
export interface Customer {
  id: string
  customer_id?: string
  name?: string
  customer_name?: string
  customer_full_name?: string
  customer_short_name?: string
  payment_term?: string
  delivery_terms?: string
  packing_condition?: string
  qty_allowance_percent?: string
  forwarder_agent?: string
  shipping_agent?: string
  sales_representative?: string
  sales_email?: string
  [key: string]: any
}

export interface Product {
  id: string
  part_no: string
  component_name?: string
  description?: string
  is_assembly?: boolean
  customer_id?: string
  unit_price?: number
  last_price?: number
  sub_part_no?: any
  factory_id?: string
  currency?: string
  customs_code?: string
  order_requirements?: string
  customer_drawing?: {
    filename?: string
    path?: string
  }
  customer_drawing_version?: string
  specification?: string
  [key: string]: any
}

export interface ShipmentBatch {
  id: string
  productPartNo: string // 關聯的產品編號
  batchNumber: number
  plannedShipDate: Date | undefined
  quantity: number // 批次數量
  notes?: string
  status?: string // 批次狀態
  trackingNumber?: string // 追蹤號碼
  actualShipDate?: Date // 實際出貨日期
  estimatedArrivalDate?: Date // 預計到達日期
  customsInfo?: {
    clearanceDate?: Date
    customsNumber?: string
    customsFees?: number
  } // 海關資訊
}

export interface OrderItem {
  id: string
  productKey: string // 使用 customer_id + part_no 作為唯一標識
  productName: string
  productPartNo: string
  quantity: number
  unitPrice: number
  isAssembly: boolean
  shipmentBatches: ShipmentBatch[] // 每個產品的批次列表
  specifications?: string // 產品規格
  remarks?: string // 產品備註
  currency: string // 貨幣
  discount?: number // 折扣
  taxRate?: number // 稅率
  product?: Product // 產品完整資料
}

export interface ProcurementItem {
  id: string
  productPartNo: string
  productName: string
  quantity: number
  purchasePrice: number
  deliveryDate?: Date
  isSelected: boolean
  factoryId?: string
  factoryName?: string
  paymentTerm?: string
  deliveryTerm?: string
  notes?: string
  [key: string]: any
}

// 使用表單邏輯的 Hook
export function useOrderForm() {
  // 狀態管理
  const [orderNumber, setOrderNumber] = useState<string>("")
  const [isLoadingOrderNumber, setIsLoadingOrderNumber] = useState<boolean>(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const [customerProducts, setCustomerProducts] = useState<Product[]>([])
  const [regularProducts, setRegularProducts] = useState<Product[]>([])
  const [assemblyProducts, setAssemblyProducts] = useState<Product[]>([])
  const [selectedProductPartNo, setSelectedProductPartNo] = useState<string>("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [poNumber, setPoNumber] = useState<string>("")
  const [paymentTerm, setPaymentTerm] = useState<string>("")
  const [deliveryTerms, setDeliveryTerms] = useState<string>("")
  const [remarks, setRemarks] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [productSelectionTab, setProductSelectionTab] = useState<string>("regular")
  const [customOrderNumber, setCustomOrderNumber] = useState<string>("")
  const [useCustomOrderNumber, setUseCustomOrderNumber] = useState<boolean>(false)
  const [isCheckingOrderNumber, setIsCheckingOrderNumber] = useState<boolean>(false)
  const [orderNumberStatus, setOrderNumberStatus] = useState<"idle" | "valid" | "invalid" | "checking">("idle")
  const [orderNumberMessage, setOrderNumberMessage] = useState<string>("")
  const [productSearchTerm, setProductSearchTerm] = useState<string>("")
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]) // 使用 part_no 作為標識
  const [loadingSelectedProducts, setLoadingSelectedProducts] = useState<boolean>(false)
  const [customerDebugInfo, setCustomerDebugInfo] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("products")
  const [procurementItems, setProcurementItems] = useState<ProcurementItem[]>([])
  const [isCreatingPurchaseOrder, setIsCreatingPurchaseOrder] = useState<boolean>(false)
  const [isProductsReady, setIsProductsReady] = useState<boolean>(false)
  const [isSplitView, setIsSplitView] = useState<boolean>(false)
  const [orderInfo, setOrderInfo] = useState<string>("")
  const [createdOrder, setCreatedOrder] = useState<any>(null)
  const [isProcurementReady, setIsProcurementReady] = useState<boolean>(false)
  const [isProductSettingsConfirmed, setIsProductSettingsConfirmed] = useState<boolean>(false)
  const [isProcurementSettingsConfirmed, setIsProcurementSettingsConfirmed] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [customerCurrency, setCustomerCurrency] = useState<string>("USD")
  const [formattedDate, setFormattedDate] = useState<string>("")
  const [isTestingSubmit, setIsTestingSubmit] = useState<boolean>(false)
  const [testData, setTestData] = useState<string>("")

  // 批次管理相關狀態
  const [isManagingBatches, setIsManagingBatches] = useState<boolean>(false)
  const [currentManagingProductPartNo, setCurrentManagingProductPartNo] = useState<string>("")
  const [batchManagementTab, setBatchManagementTab] = useState<string>("basic")

  // Track if the component is mounted to prevent state updates after unmount
  const isMounted = useRef(true)
  const formRef = useRef(null)
  const initialLoadComplete = useRef(false)
  const orderNumberInitialized = useRef(false)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  // 獲取訂單編號 - only run once
  useEffect(() => {
    if (orderNumberInitialized.current) return

    const updateDateTime = () => {
      if (!isMounted.current) return
      const now = new Date()
      setFormattedDate(format(now, "yyyy/MM/dd HH:mm:ss", { locale: zhTW }))
    }

    const interval = setInterval(updateDateTime, 1000)

    // 獲取訂單編號
    const fetchOrderNumber = async () => {
      if (!isMounted.current) return
      try {
        setIsLoadingOrderNumber(true)
        const newOrderNumber = await generateOrderNumber()
        if (isMounted.current) {
          setOrderNumber(newOrderNumber)
          orderNumberInitialized.current = true
        }
      } catch (err) {
        console.error("獲取訂單編號失敗:", err)
        if (isMounted.current) {
          setOrderNumber("L-YYMMXXXXX (生成失敗)")
          orderNumberInitialized.current = true
        }
      } finally {
        if (isMounted.current) {
          setIsLoadingOrderNumber(false)
        }
      }
    }

    fetchOrderNumber()

    return () => clearInterval(interval)
  }, [])

  // 當系統生成的訂單編號變更時，更新自定義訂單編號的初始值 - only run when orderNumber changes
  useEffect(() => {
    if (orderNumber && !customOrderNumber) {
      setCustomOrderNumber(orderNumber)
    }
  }, [orderNumber, customOrderNumber])

  // 獲取客戶和產品資料 - only run once
  useEffect(() => {
    if (initialLoadComplete.current) return

    const fetchData = async () => {
      if (!isMounted.current) return
      setLoading(true)
      setError(null)

      try {
        const supabase = createClient()

        // 獲取客戶資料
        const { data: customersData, error: customersError } = await supabase
          .from("customers")
          .select("*")
          .order("customer_full_name", { ascending: true })

        if (customersError) {
          console.error("獲取客戶資料失敗:", customersError)
          throw new Error(`獲取客戶資料失敗: ${customersError.message}`)
        }

        // 處理客戶資料，確保有正確的ID和名稱欄位
        const processedCustomers = (customersData || []).map((customer) => {
          // 確保每個客戶都有一個有效的ID和名稱
          const processedCustomer = {
            ...customer,
            // 統一使用 customer_id 作為主要ID
            id: customer.customer_id || "",
            // 使用 customer_full_name 作為主要名稱，如果沒有則依序嘗試其他欄位
            name:
              customer.customer_full_name ||
              customer.name ||
              customer.customer_short_name ||
              customer.customer_name ||
              `客戶 ${customer.customer_id}`,
          }

          return processedCustomer
        })

        console.log("已載入客戶資料:", processedCustomers.length, "筆")
        console.log(
          "客戶資料範例:",
          processedCustomers.slice(0, 3).map((c) => ({
            id: c.id,
            customer_id: c.customer_id,
            name: c.name,
          })),
        )

        // 設置調試信息
        const debugInfo = `已載入 ${processedCustomers.length} 筆客戶資料。
前3筆客戶: ${processedCustomers
          .slice(0, 3)
          .map((c) => `${c.name} (ID: ${c.customer_id})`)
          .join(", ")}`

        if (isMounted.current) {
          setCustomerDebugInfo(debugInfo)
          setCustomers(processedCustomers)
        }

        // 獲取產品資料
        const { data: productsData, error: productsError } = await supabase.from("products").select("*")

        if (productsError) {
          console.error("獲取產品資料失敗:", productsError)
          throw new Error(`獲取產品資料失敗: ${productsError.message}`)
        }

        // 確保每個產品都有 part_no
        const processedProducts = (productsData || []).filter((product) => product.part_no)

        if (isMounted.current) {
          setProducts(processedProducts)
          initialLoadComplete.current = true
        }

        console.log("已載入產品資料:", processedProducts.length, "筆")
      } catch (err: any) {
        console.error("獲取資料失敗:", err)
        if (isMounted.current) {
          setError(err.message || "獲取資料失敗")
        }
      } finally {
        if (isMounted.current) {
          setLoading(false)
        }
      }
    }

    fetchData()
  }, [])

  // 當客戶變更時，更新可選產品列表和客戶預設值 - only run when selectedCustomerId, products, or customers change
  useEffect(() => {
    if (!selectedCustomerId) {
      setCustomerProducts([])
      setRegularProducts([])
      setAssemblyProducts([])
      setPaymentTerm("")
      setDeliveryTerms("")
      setCustomerCurrency("USD")

      // 重置產品選擇
      setSelectedProductPartNo("")
      setProductSearchTerm("")
      setSelectedProducts([]) // 清空已選產品
      return
    }

    // 查找選定的客戶
    const selectedCustomer = customers.find((customer) => customer.customer_id === selectedCustomerId)

    // 設置客戶相關的默認值
    if (selectedCustomer) {
      console.log("已選擇客戶:", selectedCustomer)
      setPaymentTerm(selectedCustomer.payment_term || "")
      setDeliveryTerms(selectedCustomer.delivery_terms || "")
      setCustomerCurrency(selectedCustomer.currency || "USD") // 設置客戶貨幣
    } else {
      console.warn("找不到選擇的客戶:", selectedCustomerId)
    }

    // 過濾該客戶的產品
    const filteredProducts = products.filter((product) => {
      const productCustomerId = product.customer_id
      return productCustomerId === selectedCustomerId
    })

    // 分離普通產品和組件產品
    const regular = filteredProducts.filter((p) => !isProductAssembly(p))
    const assembly = filteredProducts.filter((p) => isProductAssembly(p))

    setCustomerProducts(filteredProducts)
    setRegularProducts(regular)
    setAssemblyProducts(assembly)

    console.log(`客戶 ${selectedCustomerId} 的產品:`, filteredProducts.length, "筆")
    console.log("普通產品:", regular.length, "筆")
    console.log("組件產品:", assembly.length, "筆")

    // 重置產品選擇
    setSelectedProductPartNo("")
    setProductSearchTerm("")
    setSelectedProducts([]) // 清空已選產品
  }, [selectedCustomerId, products, customers])

  // 輔助函數 - use useCallback to prevent recreating these functions on every render
  const isProductAssembly = useCallback((product: Product) => {
    return product.is_assembly === true
  }, [])

  const getCustomerId = useCallback((customer: Customer) => {
    // 優先使用 customer_id，如果沒有則使用 id
    const id = customer.customer_id || customer.id || ""
    return id
  }, [])

  const getCustomerName = useCallback((customer: Customer) => {
    // 優先使用 customer_full_name，然後是 customer_short_name，然後是 name 或 customer_name
    const name =
      customer.customer_full_name ||
      customer.name ||
      customer.customer_short_name ||
      customer.customer_name ||
      `客戶 ${customer.customer_id || customer.id}`

    return name
  }, [])

  const getProductName = useCallback((product: Product) => {
    return product.component_name || product.description || `產品 ${product.part_no || product.id}`
  }, [])

  const getProductPartNo = useCallback((product: Product) => {
    return product.part_no || ""
  }, [])

  // 生成產品的唯一鍵 (customer_id + part_no)
  const getProductKey = useCallback((product: Product) => {
    const customerId = product.customer_id || ""
    const partNo = product.part_no || ""
    return `${customerId}:${partNo}`
  }, [])

  // 檢查產品是否已添加到訂單中
  const isProductAdded = useCallback(
    (partNo: string) => {
      return orderItems.some((item) => item.productPartNo === partNo)
    },
    [orderItems],
  )

  // 檢查產品是否已被選中
  const isProductSelected = useCallback(
    (partNo: string) => {
      return selectedProducts.includes(partNo)
    },
    [selectedProducts],
  )

  // 切換產品選擇狀態
  const toggleProductSelection = useCallback((partNo: string) => {
    setSelectedProducts((prev) => {
      if (prev.includes(partNo)) {
        return prev.filter((pn) => pn !== partNo)
      } else {
        return [...prev, partNo]
      }
    })
  }, [])

  // 清除所有選擇
  const clearAllSelections = useCallback(() => {
    setSelectedProducts([])
  }, [])

  // 創建默認批次
  const createDefaultBatch = useCallback((productPartNo: string, quantity: number): ShipmentBatch => {
    return {
      id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productPartNo,
      batchNumber: 1,
      plannedShipDate: addDays(new Date(), 30), // 預設30天後交期
      quantity, // 默認批次數量等於產品總數量
      notes: "",
      status: "pending", // 默認狀態
    }
  }, [])

  // 處理添加組件產品
  const handleAddAssemblyProduct = useCallback(() => {
    if (!selectedProductPartNo) return

    const product = assemblyProducts.find((p) => p.part_no === selectedProductPartNo)
    if (!product) return

    // 檢查產品是否已添加
    if (isProductAdded(product.part_no)) {
      alert(`產品 ${getProductPartNo(product)} 已添加到訂單中`)
      return
    }

    // 如果已經有組件產品，先移除它們
    setOrderItems((prevItems) => {
      const nonAssemblyItems = prevItems.filter((item) => !item.isAssembly)

      // 默認數量
      const defaultQuantity = 1

      const newItem: OrderItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productKey: getProductKey(product),
        productName: getProductName(product),
        productPartNo: getProductPartNo(product),
        quantity: defaultQuantity,
        unitPrice: product.last_price || product.unit_price || 0,
        isAssembly: true,
        shipmentBatches: [createDefaultBatch(product.part_no, defaultQuantity)],
        currency: product.currency || customerCurrency, // 使用產品貨幣或客戶貨幣
        product: product, // 保存完整產品資料
      }

      return [...nonAssemblyItems, newItem]
    })

    setSelectedProductPartNo("")
    setIsProductsReady(false) // 重置產品準備狀態
  }, [
    selectedProductPartNo,
    assemblyProducts,
    isProductAdded,
    getProductPartNo,
    getProductKey,
    getProductName,
    createDefaultBatch,
    customerCurrency,
  ])

  // 處理添加選中的產品
  const handleAddSelectedProducts = useCallback(async () => {
    // 如果沒有選中的產品，直接返回
    if (selectedProducts.length === 0) return

    setLoadingSelectedProducts(true)

    try {
      const supabase = createClient()

      // 從Supabase獲取選中產品的詳細資訊
      // 使用 customer_id 和 part_no 的複合條件查詢
      const { data: selectedProductsData, error } = await supabase
        .from("products")
        .select("*")
        .eq("customer_id", selectedCustomerId)
        .in("part_no", selectedProducts)

      if (error) {
        throw new Error(`獲取產品詳細資訊失敗: ${error.message}`)
      }

      console.log("獲取到的產品詳細資訊:", selectedProductsData)

      if (!selectedProductsData || selectedProductsData.length === 0) {
        alert("未找到符合條件的產品")
        return
      }

      // 將獲取到的產品添加到訂單中
      setOrderItems((prevItems) => {
        const newItems = selectedProductsData
          .filter((product) => !isProductAdded(product.part_no))
          .map((product) => {
            // 默認數量
            const defaultQuantity = 1

            // 在添加產品到訂單項目時，處理 orderRequirements 中的換行符號
            if (product.order_requirements && typeof product.order_requirements === "string") {
              // 將 \n 換行符號替換為實際換行
              const formattedRequirements = product.order_requirements.replace(/\\n/g, "\n")

              // 更新訂單資訊
              const newOrderInfo = orderInfo ? orderInfo + "\n\n" + formattedRequirements : formattedRequirements
              setOrderInfo(newOrderInfo)
            }

            return {
              id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${product.part_no}`,
              productKey: getProductKey(product),
              productName: getProductName(product),
              productPartNo: getProductPartNo(product),
              quantity: defaultQuantity,
              unitPrice: product.last_price || product.unit_price || 0,
              isAssembly: isProductAssembly(product),
              shipmentBatches: [createDefaultBatch(product.part_no, defaultQuantity)],
              currency: product.currency || customerCurrency, // 使用產品貨幣或客戶貨幣
              specifications: product.specifications || "",
              product: product, // 保存完整產品資料
            }
          })

        if (newItems.length > 0) {
          // 清空選擇
          setSelectedProducts([])
          return [...prevItems, ...newItems]
        }

        return prevItems
      })
    } catch (err: any) {
      console.error("添加產品失敗:", err)
      alert(`添加產品失敗: ${err.message}`)
    } finally {
      setLoadingSelectedProducts(false)
      setIsProductsReady(false) // 重置產品準備狀態
    }
  }, [
    selectedProducts,
    selectedCustomerId,
    isProductAdded,
    getProductKey,
    getProductName,
    getProductPartNo,
    isProductAssembly,
    createDefaultBatch,
    customerCurrency,
    orderInfo,
  ])

  const handleRemoveProduct = useCallback((itemId: string) => {
    setOrderItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
    setIsProductsReady(false) // 重置產品準備狀態
  }, [])

  const handleItemChange = useCallback((itemId: string, field: keyof OrderItem, value: any) => {
    setOrderItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          // 如果修改的是數量，同時更新批次數量
          if (field === "quantity") {
            // 獲取當前總批次數量
            const currentTotalBatchQuantity = item.shipmentBatches.reduce((sum, batch) => sum + batch.quantity, 0)

            // 如果只有一個批次，直接更新批次數量
            if (item.shipmentBatches.length === 1) {
              return {
                ...item,
                [field]: value,
                shipmentBatches: [
                  {
                    ...item.shipmentBatches[0],
                    quantity: value,
                  },
                ],
              }
            }

            // 如果有多個批次，保持批次數量比例不變
            if (currentTotalBatchQuantity > 0) {
              const ratio = value / currentTotalBatchQuantity
              const updatedBatches = item.shipmentBatches.map((batch) => ({
                ...batch,
                quantity: Math.round(batch.quantity * ratio),
              }))

              // 確保批次總數量等於產品數量
              const totalBatchQuantity = updatedBatches.reduce((sum, batch) => sum + batch.quantity, 0)
              if (totalBatchQuantity !== value) {
                const diff = value - totalBatchQuantity
                updatedBatches[0].quantity += diff
              }

              return {
                ...item,
                [field]: value,
                shipmentBatches: updatedBatches,
              }
            }
          }

          return { ...item, [field]: value }
        }
        return item
      }),
    )
    setIsProductsReady(false) // 重置產品準備狀態
  }, [])

  // 計算單個產品項目的總價
  const calculateItemTotal = useCallback(
    (item: OrderItem) => {
      // 先計算原始貨幣的總價
      const basePrice = item.quantity * item.unitPrice
      const discountAmount = item.discount ? basePrice * (item.discount / 100) : 0
      const priceAfterDiscount = basePrice - discountAmount
      const taxAmount = item.taxRate ? priceAfterDiscount * (item.taxRate / 100) : 0
      const totalInOriginalCurrency = priceAfterDiscount + taxAmount

      // 如果貨幣與客戶貨幣不同，進行轉換
      if (item.currency !== customerCurrency) {
        return convertCurrency(totalInOriginalCurrency, item.currency, customerCurrency)
      }

      return totalInOriginalCurrency
    },
    [customerCurrency],
  )

  // 計算訂單總價
  const calculateTotal = useCallback(() => {
    return orderItems.reduce((total, item) => total + calculateItemTotal(item), 0)
  }, [orderItems, calculateItemTotal])

  // 批次管理相關函數
  const openBatchManagement = useCallback((productPartNo: string) => {
    setCurrentManagingProductPartNo(productPartNo)
    setBatchManagementTab("basic") // 重置為基本信息標籤
    setIsManagingBatches(true)
  }, [])

  // 獲取當前管理的產品項目
  const getCurrentItem = useCallback(() => {
    return orderItems.find((item) => item.productPartNo === currentManagingProductPartNo)
  }, [orderItems, currentManagingProductPartNo])

  // 獲取當前產品的批次列表
  const getCurrentBatches = useCallback(() => {
    const item = getCurrentItem()
    return item ? item.shipmentBatches : []
  }, [getCurrentItem])

  // 添加批次
  const addBatch = useCallback(() => {
    const item = getCurrentItem()
    if (!item) return

    setOrderItems((prevItems) => {
      return prevItems.map((orderItem) => {
        if (orderItem.id === item.id) {
          const batches = [...orderItem.shipmentBatches]
          const nextBatchNumber = batches.length > 0 ? Math.max(...batches.map((b) => b.batchNumber)) + 1 : 1

          // 計算剩餘可分配數量
          const allocatedQuantity = batches.reduce((sum, batch) => sum + batch.quantity, 0)
          const remainingQuantity = Math.max(0, orderItem.quantity - allocatedQuantity)

          const newBatch: ShipmentBatch = {
            id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            productPartNo: orderItem.productPartNo,
            batchNumber: nextBatchNumber,
            plannedShipDate: addDays(new Date(), 30), // 預設30天後交期
            quantity: remainingQuantity,
            notes: "",
            status: "pending", // 默認狀態
          }

          return {
            ...orderItem,
            shipmentBatches: [...batches, newBatch],
          }
        }
        return orderItem
      })
    })

    setIsProductsReady(false) // 重置產品準備狀態
  }, [getCurrentItem])

  // 移除批次
  const removeBatch = useCallback(
    (batchId: string) => {
      const item = getCurrentItem()
      if (!item) return

      setOrderItems((prevItems) => {
        return prevItems.map((orderItem) => {
          if (orderItem.id === item.id) {
            // 獲取要刪除的批次
            const batchToRemove = orderItem.shipmentBatches.find((batch) => batch.id === batchId)
            if (!batchToRemove) return orderItem

            // 計算剩餘批次
            const remainingBatches = orderItem.shipmentBatches.filter((batch) => batch.id !== batchId)

            // 如果刪除後沒有批次，創建一個新的默認批次
            if (remainingBatches.length === 0) {
              remainingBatches.push(createDefaultBatch(orderItem.productPartNo, orderItem.quantity))
            } else if (remainingBatches.length === 1) {
              // 如果只剩一個批次，將刪除批次的數量添加到剩餘批次
              remainingBatches[0].quantity += batchToRemove.quantity
            }

            return {
              ...orderItem,
              shipmentBatches: remainingBatches,
            }
          }
          return orderItem
        })
      })

      setIsProductsReady(false) // 重置產品準備狀態
    },
    [getCurrentItem, createDefaultBatch],
  )

  // 更新批次
  const updateBatch = useCallback(
    (batchId: string, field: keyof ShipmentBatch, value: any) => {
      const item = getCurrentItem()
      if (!item) return

      setOrderItems((prevItems) => {
        return prevItems.map((orderItem) => {
          if (orderItem.id === item.id) {
            return {
              ...orderItem,
              shipmentBatches: orderItem.shipmentBatches.map((batch) => {
                if (batch.id === batchId) {
                  if (field === "customsInfo") {
                    // 處理嵌套對象
                    return {
                      ...batch,
                      customsInfo: {
                        ...batch.customsInfo,
                        ...value,
                      },
                    }
                  }
                  return { ...batch, [field]: value }
                }
                return batch
              }),
            }
          }
          return orderItem
        })
      })

      setIsProductsReady(false) // 重置產品準備狀態
    },
    [getCurrentItem],
  )

  // 計算已分配的數量
  const calculateAllocatedQuantity = useCallback(() => {
    const item = getCurrentItem()
    if (!item) return 0

    return item.shipmentBatches.reduce((sum, batch) => sum + batch.quantity, 0)
  }, [getCurrentItem])

  // 計算剩餘可分配數量
  const calculateRemainingQuantity = useCallback(() => {
    const item = getCurrentItem()
    if (!item) return 0

    const allocatedQuantity = calculateAllocatedQuantity()
    return Math.max(0, item.quantity - allocatedQuantity)
  }, [getCurrentItem, calculateAllocatedQuantity])

  // 檢查產品是否已準備好
  const checkProductsReady = useCallback(() => {
    // 檢查是否有產品
    if (orderItems.length === 0) {
      return false
    }

    // 檢查每個產品是否都有批次設置
    const itemsWithoutBatches = orderItems.filter((item) => item.shipmentBatches.length === 0)
    if (itemsWithoutBatches.length > 0) {
      return false
    }

    // 檢查批次數量是否等於產品數量
    for (const item of orderItems) {
      const totalBatchQuantity = item.shipmentBatches.reduce((sum, batch) => sum + batch.quantity, 0)
      if (totalBatchQuantity !== item.quantity) {
        return false
      }
    }

    return true
  }, [orderItems])

  // 生成訂單資訊
  const generateOrderInfo = useCallback(
    (items: OrderItem[]) => {
      if (!items || items.length === 0) return ""

      return items
        .map((item, index) => {
          const product = item.product || {}
          const customerDrawing = product.customer_drawing || {}
          const filename = customerDrawing.filename || ""
          const drawingVersion = product.customer_drawing_version || ""
          const drawingInfo =
            filename || drawingVersion ? `As per point ${filename}${drawingVersion ? `, ${drawingVersion}` : ""}` : ""

          // 處理 order_requirements 中的換行符號 - 只在顯示時處理，不修改原始數據
          let orderRequirements = ""
          if (product.order_requirements) {
            // 檢查是否已經包含實際換行符，如果是，則直接使用
            if (product.order_requirements.includes("\n")) {
              orderRequirements = product.order_requirements
            } else {
              // 否則，替換 \n 為實際換行
              orderRequirements = product.order_requirements.replace(/\\n/g, "\n")
            }
          }

          return `PART# ${product.part_no || item.productPartNo || ""}
LOT NO. 訂單 ${useCustomOrderNumber ? customOrderNumber : orderNumber}
${product.component_name || item.productName || ""}
HS Code: ${product.customs_code || ""}
${orderRequirements}
${drawingInfo}
${product.specification || ""}
${item.quantity} PCS / CTN`
        })
        .join("\n\n")
    },
    [useCustomOrderNumber, customOrderNumber, orderNumber],
  )

  // Generate formatted remarks according to the specified format
  const generateFormattedRemarks = useCallback(() => {
    if (!selectedCustomerId || orderItems.length === 0) return ""

    // Find the selected customer
    const customer = customers.find((c) => c.customer_id === selectedCustomerId)
    if (!customer) return ""

    // Get the first batch delivery date from the first product
    let firstBatchDate = ""
    if (orderItems.length > 0 && orderItems[0].shipmentBatches.length > 0) {
      const firstBatch = orderItems[0].shipmentBatches[0]
      if (firstBatch.plannedShipDate) {
        const date = new Date(firstBatch.plannedShipDate)
        // Format as MM/DD/YYYY (using English month abbreviation)
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
        firstBatchDate = `${monthNames[date.getMonth()]}/${date.getDate()}/${date.getFullYear()}`
      }
    }

    // Build the delivery section with product details
    let deliverySection = "1. DELIVERY:\n"
    orderItems.forEach((item) => {
      item.shipmentBatches.forEach((batch) => {
        if (batch.plannedShipDate) {
          const date = new Date(batch.plannedShipDate)
          const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
          const etdDate = `${monthNames[date.getMonth()]}/${date.getDate()}/${date.getFullYear()}`
          deliverySection += `${item.productPartNo} : ${batch.quantity} PCS ETD ${etdDate}    ${item.productName}\n`
        }
      })
    })

    // Format the complete remarks
    const formattedRemarks = `${deliverySection}
2. PAYMENT : ${customer.payment_term || "BY T/T AFTER RECEIVED COPY OF B/L BY FAX"}

3. PACKING : ${customer.packing_condition || "BY EXPORT CARTON THEN PALLETIZED - 18KG/CTN MAX"}

4. QUANTITY ALLOWANCE PLUS ${customer.qty_allowance_percent || "10"}% / MINUS ${customer.qty_allowance_percent || "10"}%

5. FORWARDER AGENT: ${customer.forwarder_agent || ""}

6. MATERIAL CERTS, INSPECTED REPORT REQUIRED

7. TOOLING CHARGE REFUNDABLE AFTER 

8. SHIPPING AGENT: ${customer.shipping_agent || ""}

9. ORDER BY - ${customer.sales_representative || ""} ${customer.sales_email ? `<${customer.sales_email}>` : ""}`

    return formattedRemarks
  }, [selectedCustomerId, orderItems, customers])

  const confirmProductsReady = useCallback(() => {
    if (!isProductSettingsConfirmed) {
      if (!checkProductsReady()) {
        alert("請確保所有產品都已設置批次，且批次數量等於產品數量")
        return
      }

      // Generate order info
      const generatedOrderInfo = generateOrderInfo(orderItems)
      setOrderInfo(generatedOrderInfo)

      // Generate formatted remarks
      const formattedRemarks = generateFormattedRemarks()
      setRemarks(formattedRemarks)

      setIsProductsReady(true)
      setIsProductSettingsConfirmed(true)
    } else {
      // Cancel confirmation, allow editing again
      setIsProductSettingsConfirmed(false)
    }
  }, [isProductSettingsConfirmed, checkProductsReady, generateOrderInfo, orderItems, generateFormattedRemarks])

  // Add a new function to confirm procurement settings
  const confirmProcurementSettings = useCallback(() => {
    setIsProcurementSettingsConfirmed((prev) => !prev)
  }, [])

  // 解析組合產品的部件
  const parseSubPartNo = useCallback((product: Product) => {
    if (!product.sub_part_no) return null

    try {
      let subParts = product.sub_part_no
      if (typeof subParts === "string") {
        subParts = JSON.parse(subParts)
      }

      if (Array.isArray(subParts) && subParts.length > 0) {
        return subParts.map((part) => ({
          productPN: part.productPN || part.part_no,
          productName: part.productName || part.component_name,
        }))
      }
    } catch (err) {
      console.error("解析sub_part_no失敗:", err)
    }

    return null
  }, [])

  // 獲取產品的批次數量
  const getProductBatchesCount = useCallback(
    (productPartNo: string) => {
      const item = orderItems.find((item) => item.productPartNo === productPartNo)
      return item ? item.shipmentBatches.length : 0
    },
    [orderItems],
  )

  // 創建採購單
  const createPurchaseOrders = useCallback(
    async (orderId: string) => {
      // 檢查是否有選中的項目
      const selectedItems = procurementItems.filter((item) => item.isSelected)
      if (selectedItems.length === 0) {
        throw new Error("請至少選擇一個採購項目")
      }

      // 檢查是否所有選中的項目都有供應商
      const itemsWithoutSupplier = selectedItems.filter((item) => !item.factoryId)
      if (itemsWithoutSupplier.length > 0) {
        throw new Error(`有 ${itemsWithoutSupplier.length} 個項目未選擇供應商`)
      }

      try {
        console.log("正在創建採購單，使用訂單ID:", orderId)
        const result = await createPurchasesFromProcurementItems(procurementItems, orderId)

        if (!result.success) {
          throw new Error(result.error || "創建採購單失敗")
        }

        return result
      } catch (error: any) {
        console.error("創建採購單時出錯:", error)
        throw error
      }
    },
    [procurementItems],
  )

  // 檢查訂單編號是否重複
  const checkOrderNumberDuplicate = useCallback(async () => {
    if (!customOrderNumber) {
      setOrderNumberStatus("invalid")
      setOrderNumberMessage("請輸入訂單編號")
      return
    }

    setIsCheckingOrderNumber(true)
    setOrderNumberStatus("checking")
    setOrderNumberMessage("正在檢查訂單編號...")

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("orders")
        .select("order_id")
        .eq("order_id", customOrderNumber)
        .limit(1)

      if (error) {
        throw new Error(`檢查訂單編號失敗: ${error.message}`)
      }

      if (data && data.length > 0) {
        setOrderNumberStatus("invalid")
        setOrderNumberMessage("此訂單編號已存在，請使用其他編號")
      } else {
        setOrderNumberStatus("valid")
        setOrderNumberMessage("此訂單編號可以使用")
      }
    } catch (err: any) {
      console.error("檢查訂單編號失敗:", err)
      setOrderNumberStatus("invalid")
      setOrderNumberMessage(`檢查失敗: ${err.message}`)
    } finally {
      setIsCheckingOrderNumber(false)
    }
  }, [customOrderNumber])

  const handleSubmitOrder = useCallback(
    async (createPurchaseOrder = false) => {
      setIsSubmitting(true)
      try {
        if (!selectedCustomerId) {
          throw new Error("請選擇客戶")
        }

        if (orderItems.length === 0) {
          throw new Error("請至少添加一個產品")
        }

        if (!poNumber) {
          throw new Error("請輸入客戶PO編號")
        }

        // 檢查每個產品是否都有批次設置
        const itemsWithoutBatches = orderItems.filter((item) => item.shipmentBatches.length === 0)
        if (itemsWithoutBatches.length > 0) {
          throw new Error(
            `以下產品沒有設置批次出貨: ${itemsWithoutBatches.map((item) => item.productPartNo).join(", ")}`,
          )
        }

        // 檢查批次數量是否等於產品數量
        for (const item of orderItems) {
          const totalBatchQuantity = item.shipmentBatches.reduce((sum, batch) => sum + batch.quantity, 0)
          if (totalBatchQuantity !== item.quantity) {
            throw new Error(
              `產品 ${item.productPartNo} 的批次總數量 (${totalBatchQuantity}) 不等於產品數量 (${item.quantity})`,
            )
          }
        }

        // 檢查訂單編號
        if (useCustomOrderNumber) {
          if (!customOrderNumber) {
            throw new Error("請輸入自定義訂單編號")
          }

          if (orderNumberStatus === "invalid") {
            throw new Error(`訂單編號無效: ${orderNumberMessage}`)
          }

          // 如果尚未檢查訂單編號，先檢查一次
          if (orderNumberStatus === "idle") {
            try {
              const supabase = createClient()
              const { data, error } = await supabase
                .from("orders")
                .select("order_id")
                .eq("order_id", customOrderNumber)
                .limit(1)

              if (error) {
                throw new Error(`檢查訂單編號失敗: ${error.message}`)
              }

              if (data && data.length > 0) {
                throw new Error("此訂單編號已存在，請使用其他編號")
              }
            } catch (err: any) {
              console.error("檢查訂單編號失敗:", err)
              throw err
            }
          }
        } else if (isLoadingOrderNumber || !orderNumber || orderNumber.includes("生成失敗")) {
          throw new Error("訂單編號生成失敗，請重新整理頁面")
        }

        try {
          const supabase = createClient()

          // 準備訂單資料
          const orderData: any = {
            order_id: useCustomOrderNumber ? customOrderNumber : orderNumber, // 使用自定義或生成的訂單編號
            customer_id: selectedCustomerId,
            po_id: poNumber,
            payment_term: paymentTerm,
            delivery_terms: deliveryTerms,
            status: 0, // 初始狀態為待確認
            remarks: remarks,
            order_info: orderInfo, // 添加訂單資訊
            created_at: new Date().toISOString(), // 添加創建時間
          }

          // 處理產品資料
          if (orderItems.some((item) => item.isAssembly)) {
            // 如果有組件產品，使用part_no_assembly
            const assemblyItem = orderItems.find((item) => item.isAssembly)
            if (assemblyItem) {
              orderData.part_no_assembly = assemblyItem.productPartNo
            }
          }

          // 處理產品和批次資料 - 優化的JSONB結構
          const partsList = orderItems.map((item) => {
            // 處理批次資料 - 增強的批次資訊
            const batchesList = item.shipmentBatches.map((batch) => ({
              batch_number: batch.batchNumber,
              planned_ship_date: batch.plannedShipDate ? batch.plannedShipDate.toISOString() : null,
              quantity: batch.quantity,
              notes: batch.notes || null,
              status: batch.status || "pending", // 默認狀態為待處理
              tracking_number: batch.trackingNumber || null,
              actual_ship_date: batch.actualShipDate ? batch.actualShipDate.toISOString() : null,
              estimated_arrival_date: batch.estimatedArrivalDate ? batch.estimatedArrivalDate.toISOString() : null,
              customs_info: batch.customsInfo || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }))

            // 返回產品完整資訊
            return {
              part_no: item.productPartNo,
              description: item.productName,
              quantity: item.quantity,
              unit_price: item.unitPrice,
              is_assembly: item.isAssembly,
              specifications: item.specifications || null,
              remarks: item.remarks || null,
              currency: item.currency || "USD",
              discount: item.discount || 0,
              tax_rate: item.taxRate || 0,
              total_price: calculateItemTotal(item),
              shipment_batches: batchesList,
              metadata: {
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                version: "1.0",
              },
            }
          })

          orderData.part_no_list = JSON.stringify(partsList)

          // 提交訂單
          const { data, error } = await supabase.from("orders").insert(orderData).select()

          if (error) throw new Error(`提交訂單失敗: ${error.message}`)

          // 保存創建的訂單
          setCreatedOrder(data[0])

          // 處理訂單批次項目
          try {
            // 準備批次項目數據
            const batchItems: OrderBatchItem[] = []
            const batchIds: string[] = [] // 用於存儲批次ID

            // 遍歷所有產品項目
            orderItems.forEach((item, productIndex) => {
              const productIndexLetter = generateProductIndex(productIndex)

              // 遍歷每個產品的批次
              item.shipmentBatches.forEach((batch) => {
                const batchId = generateOrderBatchId(data[0].order_id, productIndexLetter, batch.batchNumber)
                batchIds.push(batchId) // 添加到批次ID列表

                batchItems.push({
                  order_batch_id: batchId,
                  order_id: data[0].order_id,
                  product_index: productIndexLetter,
                  batch_number: batch.batchNumber,
                  part_no: item.productPartNo,
                  description: item.productName,
                  quantity: batch.quantity,
                  unit_price: item.unitPrice,
                  currency: item.currency || "USD",
                  is_assembly: item.isAssembly,
                  specifications: item.specifications,
                  remarks: item.remarks,
                  discount: item.discount || 0,
                  tax_rate: item.taxRate || 0,
                  total_price: calculateItemTotal(item),
                  planned_ship_date: batch.plannedShipDate,
                  status: batch.status || "pending",
                  tracking_number: batch.trackingNumber,
                  actual_ship_date: batch.actualShipDate,
                  estimated_arrival_date: batch.estimatedArrivalDate,
                  customs_info: batch.customsInfo,
                  metadata: {
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    version: "1.0",
                  },
                })
              })
            })

            // 創建批次項目
            const batchResult = await createOrderBatchItems(batchItems)

            if (!batchResult.success) {
              console.error("創建訂單批次項目失敗:", batchResult.error)
              // 不中斷流程，僅記錄錯誤
            }

            // 更新訂單表中的 order_batch_ids 欄位
            const { error: updateError } = await supabase
              .from("orders")
              .update({ order_batch_ids: batchIds })
              .eq("order_id", data[0].order_id)

            if (updateError) {
              console.error("更新訂單批次ID失敗:", updateError)
              // 不中斷流程，僅記錄錯誤
            }
          } catch (batchError: any) {
            console.error("處理訂批次項目時出錯:", batchError)
            // 不中斷流程，僅記錄錯誤
          }

          // 如果需要同時創建採購單
          if (createPurchaseOrder && isProcurementSettingsConfirmed) {
            try {
              const purchaseResult = await createPurchaseOrders(data[0].order_id)
              console.log("採購單創建結果:", purchaseResult)
            } catch (purchaseError: any) {
              console.error("創建採購單失敗:", purchaseError)
              // 不中斷流程，僅記錄錯誤
            }
          }

          return data
        } catch (err: any) {
          console.error("提交訂單失敗:", err)
          throw err
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      selectedCustomerId,
      orderItems,
      poNumber,
      useCustomOrderNumber,
      customOrderNumber,
      orderNumberStatus,
      orderNumberMessage,
      isLoadingOrderNumber,
      orderNumber,
      paymentTerm,
      deliveryTerms,
      remarks,
      orderInfo,
      calculateItemTotal,
      isProcurementSettingsConfirmed,
      createPurchaseOrders,
    ],
  )

  const getOrderData = useCallback(
    async (skipValidation = false) => {
      // 檢查表單資料但不提交
      if (!skipValidation) {
        if (!selectedCustomerId) {
          throw new Error("請選擇客戶")
        }

        if (orderItems.length === 0) {
          throw new Error("請至少添加一個產品")
        }

        if (!poNumber) {
          throw new Error("請輸入客戶PO編號")
        }

        // 檢查每個產品是否都有批次設置
        const itemsWithoutBatches = orderItems.filter((item) => item.shipmentBatches.length === 0)
        if (itemsWithoutBatches.length > 0) {
          throw new Error(
            `以下產品沒有設置批次出貨: ${itemsWithoutBatches.map((item) => item.productPartNo).join(", ")}`,
          )
        }

        // 檢查批次數量是否等於產品數量
        for (const item of orderItems) {
          const totalBatchQuantity = item.shipmentBatches.reduce((sum, batch) => sum + batch.quantity, 0)
          if (totalBatchQuantity !== item.quantity) {
            throw new Error(
              `產品 ${item.productPartNo} 的批次總數量 (${totalBatchQuantity}) 不等於產品數量 (${item.quantity})`,
            )
          }
        }

        // 檢查訂單編號
        if (useCustomOrderNumber) {
          if (!customOrderNumber) {
            throw new Error("請輸入自定義訂單編號")
          }

          if (orderNumberStatus === "invalid") {
            throw new Error(`訂單編號無效: ${orderNumberMessage}`)
          }
        } else if (isLoadingOrderNumber || !orderNumber || orderNumber.includes("生成失敗")) {
          throw new Error("訂單編號生成失敗，請重新整理頁面")
        }
      }

      // 準備訂單資料
      const orderData: any = {
        order_id: useCustomOrderNumber ? customOrderNumber : orderNumber, // 使用自定義或生成的訂單編號
        customer_id: selectedCustomerId,
        po_id: poNumber,
        payment_term: paymentTerm,
        delivery_terms: deliveryTerms,
        status: 0, // 初始狀態為待確認
        remarks: remarks,
        order_info: orderInfo, // 添加訂單資訊
        created_at: new Date().toISOString(), // 添加創建時間
      }

      // 處理產品資料
      if (orderItems.some((item) => item.isAssembly)) {
        // 如果有組件產品，使用part_no_assembly
        const assemblyItem = orderItems.find((item) => item.isAssembly)
        if (assemblyItem) {
          orderData.part_no_assembly = assemblyItem.productPartNo
        }
      }

      // 處理產品和批次資料 - 優化的JSONB結構
      const partsList = orderItems.map((item) => {
        // 處理批次資料 - 增強的批次資訊
        const batchesList = item.shipmentBatches.map((batch) => ({
          batch_number: batch.batchNumber,
          planned_ship_date: batch.plannedShipDate ? batch.plannedShipDate.toISOString() : null,
          quantity: batch.quantity,
          notes: batch.notes || null,
          status: batch.status || "pending", // 默認狀態為待處理
          tracking_number: batch.trackingNumber || null,
          actual_ship_date: batch.actualShipDate ? batch.actualShipDate.toISOString() : null,
          estimated_arrival_date: batch.estimatedArrivalDate ? batch.estimatedArrivalDate.toISOString() : null,
          customs_info: batch.customsInfo || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))

        // 返回產品完整資訊
        return {
          part_no: item.productPartNo,
          description: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          is_assembly: item.isAssembly,
          specifications: item.specifications || null,
          remarks: item.remarks || null,
          currency: item.currency || "USD",
          discount: item.discount || 0,
          tax_rate: item.taxRate || 0,
          total_price: calculateItemTotal(item),
          shipment_batches: batchesList,
          metadata: {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            version: "1.0",
          },
        }
      })

      // 為了測試目的，即使沒有產品也返回一個空數組
      orderData.part_no_list = JSON.stringify(partsList)

      // 為了測試目的，添加原始訂單項目數據
      orderData.order_items = orderItems

      // 添加採購資料
      orderData.procurement_items = procurementItems

      return orderData
    },
    [
      selectedCustomerId,
      orderItems,
      poNumber,
      useCustomOrderNumber,
      customOrderNumber,
      orderNumberStatus,
      orderNumberMessage,
      isLoadingOrderNumber,
      orderNumber,
      paymentTerm,
      deliveryTerms,
      remarks,
      orderInfo,
      calculateItemTotal,
      procurementItems,
    ],
  )

  const handleProcurementDataChange = useCallback((items: ProcurementItem[]) => {
    setProcurementItems(items)
  }, [])

  return {
    // 狀態和變更函數
    orderNumber,
    isLoadingOrderNumber,
    customers,
    products,
    selectedCustomerId,
    setSelectedCustomerId,
    customerProducts,
    regularProducts,
    assemblyProducts,
    selectedProductPartNo,
    setSelectedProductPartNo,
    orderItems,
    setOrderItems,
    poNumber,
    setPoNumber,
    paymentTerm,
    setPaymentTerm,
    deliveryTerms,
    setDeliveryTerms,
    remarks,
    setRemarks,
    loading,
    error,
    productSelectionTab,
    setProductSelectionTab,
    customOrderNumber,
    setCustomOrderNumber,
    useCustomOrderNumber,
    setUseCustomOrderNumber,
    isCheckingOrderNumber,
    orderNumberStatus,
    orderNumberMessage,
    productSearchTerm,
    setProductSearchTerm,
    selectedProducts,
    loadingSelectedProducts,
    customerDebugInfo,
    activeTab,
    setActiveTab,
    procurementItems,
    isCreatingPurchaseOrder,
    isProductsReady,
    isSplitView,
    setIsSplitView,
    orderInfo,
    setOrderInfo,
    createdOrder,
    isProcurementReady,
    isProductSettingsConfirmed,
    isProcurementSettingsConfirmed,
    isSubmitting,
    customerCurrency,
    formattedDate,
    isTestingSubmit,
    testData,
    isManagingBatches,
    setIsManagingBatches,
    currentManagingProductPartNo,
    batchManagementTab,
    setBatchManagementTab,
    setOrderNumberStatus,
    setOrderNumberMessage,

    // 輔助函數和工具
    getCustomerId,
    getCustomerName,
    getProductName,
    getProductPartNo,
    isProductAssembly,
    isProductAdded,
    isProductSelected,
    toggleProductSelection,
    clearAllSelections,
    checkOrderNumberDuplicate,
    handleAddAssemblyProduct,
    handleAddSelectedProducts,
    handleRemoveProduct,
    handleItemChange,
    calculateItemTotal,
    calculateTotal,
    openBatchManagement,
    getCurrentItem,
    getCurrentBatches,
    addBatch,
    removeBatch,
    updateBatch,
    calculateAllocatedQuantity,
    calculateRemainingQuantity,
    parseSubPartNo,
    getProductBatchesCount,
    confirmProductsReady,
    confirmProcurementSettings,
    handleProcurementDataChange,
    handleSubmitOrder,
    getOrderData,
    createPurchaseOrders,
  }
}
