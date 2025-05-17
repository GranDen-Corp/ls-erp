"use client"

import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Plus,
  Trash,
  Layers,
  AlertCircle,
  Package,
  Settings,
  Loader2,
  CheckCircle,
  Search,
  X,
  Clock,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  Save,
  XCircle,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase-client"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { addDays } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ProductCombobox } from "@/components/ui/product-combobox"
import { ProcurementDataEditor, type ProcurementItem } from "@/components/orders/procurement-data-editor"
import { createPurchasesFromProcurementItems } from "@/lib/services/purchase-service"
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea"

interface Customer {
  id: string
  customer_id?: string
  name?: string
  customer_name?: string
  customer_full_name?: string
  customer_short_name?: string
  payment_term?: string
  delivery_terms?: string
  [key: string]: any
}

interface Product {
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

interface ShipmentBatch {
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

interface OrderItem {
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
  currency?: string // 貨幣
  discount?: number // 折扣
  taxRate?: number // 稅率
  product?: Product // 產品完整資料
}

interface NewOrderFormProps {
  orderNumber: string
  isLoadingOrderNumber: boolean
  onSubmit: (formData: any) => void
  createdOrderId?: string
  currentStep?: number
  orderData?: any
}

export const NewOrderForm = forwardRef<any, NewOrderFormProps>(
  ({ orderNumber, isLoadingOrderNumber, onSubmit, createdOrderId, currentStep = 0, orderData }, ref) => {
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

    // 批次管理相關狀態
    const [isManagingBatches, setIsManagingBatches] = useState<boolean>(false)
    const [currentManagingProductPartNo, setCurrentManagingProductPartNo] = useState<string>("")
    const [batchManagementTab, setBatchManagementTab] = useState<string>("basic")

    // 當系統生成的訂單編號變更時，更新自定義訂單編號的初始值
    useEffect(() => {
      if (orderNumber && !customOrderNumber) {
        setCustomOrderNumber(orderNumber)
      }
    }, [orderNumber])

    // 當步驟變更時，更新UI
    useEffect(() => {
      if (currentStep === 1) {
        setActiveTab("procurement")
      }
    }, [currentStep])

    // 當訂單數據變更時，更新表單
    useEffect(() => {
      if (orderData) {
        setCreatedOrder(orderData)

        // 如果有訂單數據，則禁用編輯
        if (currentStep === 1) {
          // 在採購步驟中，只需要確保採購資料已準備好
          setIsProcurementReady(true)
        }
      }
    }, [orderData, currentStep])

    // 暴露submitOrder方法給父組件
    useImperativeHandle(ref, () => ({
      submitOrder: async (createPurchaseOrder = false) => {
        setIsCreatingPurchaseOrder(createPurchaseOrder)
        return await handleSubmitOrder(createPurchaseOrder)
      },
      createPurchaseOrdersOnly: async (orderId: string) => {
        // 只創建採購單，不創建訂單
        if (!orderId) {
          throw new Error("訂單ID不能為空")
        }

        return await createPurchaseOrders(orderId)
      },
      getOrderData: async (skipValidation = false) => {
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
    }))

    // 修改客戶資料獲取和處理邏輯，確保統一使用 customer_id 作為主鍵

    // 修改獲取客戶資料的部分
    useEffect(() => {
      const fetchData = async () => {
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

          // 記錄和設置數據
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
          setCustomerDebugInfo(debugInfo)

          setCustomers(processedCustomers)

          // 獲取產品資料
          const { data: productsData, error: productsError } = await supabase.from("products").select("*")

          if (productsError) {
            console.error("獲取產品資料失敗:", productsError)
            throw new Error(`獲取產品資料失敗: ${productsError.message}`)
          }

          // 確保每個產品都有 part_no
          const processedProducts = (productsData || []).filter((product) => product.part_no)

          setProducts(processedProducts)

          console.log("已載入產品資料:", processedProducts.length, "筆")
        } catch (err: any) {
          console.error("獲取資料失敗:", err)
          setError(err.message || "獲取資料失敗")
        } finally {
          setLoading(false)
        }
      }

      fetchData()
    }, [])

    // 當客戶變更時，更新可選產品列表和客戶預設值
    useEffect(() => {
      if (selectedCustomerId) {
        // 查找選定的客戶
        const selectedCustomer = customers.find((customer) => customer.customer_id === selectedCustomerId)

        // 設置客戶相關的默認值
        if (selectedCustomer) {
          console.log("已選擇客戶:", selectedCustomer)
          setPaymentTerm(selectedCustomer.payment_term || "")
          setDeliveryTerms(selectedCustomer.delivery_terms || "")
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
      } else {
        setCustomerProducts([])
        setRegularProducts([])
        setAssemblyProducts([])
        setPaymentTerm("")
        setDeliveryTerms("")
      }

      // 重置產品選擇
      setSelectedProductPartNo("")
      setProductSearchTerm("")
      setSelectedProducts([]) // 清空已選產品
    }, [selectedCustomerId, products, customers])

    // 檢查訂單編號是否重複
    const checkOrderNumberDuplicate = async () => {
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
    }

    // 修改 getCustomerName 函數，確保使用正確的名稱顯示
    const getCustomerId = (customer: Customer) => {
      // 優先使用 customer_id，如果沒有則使用 id
      const id = customer.customer_id || customer.id || ""
      return id
    }

    // 修改 getCustomerName 函數，確保使用正確的名稱顯示
    const getCustomerName = (customer: Customer) => {
      // 優先使用 customer_full_name，然後是 customer_short_name，然後是 name 或 customer_name
      const name =
        customer.customer_full_name ||
        customer.name ||
        customer.customer_short_name ||
        customer.customer_name ||
        `客戶 ${customer.customer_id || customer.id}`

      return name
    }

    const getProductName = (product: Product) => {
      return product.component_name || product.description || `產品 ${product.part_no || product.id}`
    }

    const getProductPartNo = (product: Product) => {
      return product.part_no || ""
    }

    // 生成產品的唯一鍵 (customer_id + part_no)
    const getProductKey = (product: Product) => {
      const customerId = product.customer_id || ""
      const partNo = product.part_no || ""
      return `${customerId}:${partNo}`
    }

    const isProductAssembly = (product: Product) => {
      return product.is_assembly === true
    }

    // 檢查產品是否已添加到訂單中
    const isProductAdded = (partNo: string) => {
      return orderItems.some((item) => item.productPartNo === partNo)
    }

    // 檢查產品是否已被選中
    const isProductSelected = (partNo: string) => {
      return selectedProducts.includes(partNo)
    }

    // 切換產品選擇狀態
    const toggleProductSelection = (partNo: string) => {
      if (isProductSelected(partNo)) {
        setSelectedProducts(selectedProducts.filter((pn) => pn !== partNo))
      } else {
        setSelectedProducts([...selectedProducts, partNo])
      }
    }

    // 清除所有選擇
    const clearAllSelections = () => {
      setSelectedProducts([])
    }

    // 過濾搜索結果
    const filteredRegularProducts = regularProducts.filter((product) => {
      if (!productSearchTerm) return true

      const partNo = getProductPartNo(product).toLowerCase()
      const name = getProductName(product).toLowerCase()
      const searchTerm = productSearchTerm.toLowerCase()

      return partNo.includes(searchTerm) || name.includes(searchTerm)
    })

    // 創建默認批次
    const createDefaultBatch = (productPartNo: string, quantity: number): ShipmentBatch => {
      return {
        id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productPartNo,
        batchNumber: 1,
        plannedShipDate: addDays(new Date(), 30), // 預設30天後交期
        quantity, // 默認批次數量等於產品總數量
        notes: "",
        status: "pending", // 默認狀態
      }
    }

    const handleAddAssemblyProduct = () => {
      if (!selectedProductPartNo) return

      const product = assemblyProducts.find((p) => p.part_no === selectedProductPartNo)
      if (!product) return

      // 檢查產品是否已添加
      if (isProductAdded(product.part_no)) {
        alert(`產品 ${getProductPartNo(product)} 已添加到訂單中`)
        return
      }

      // 如果已經有組件產品，先移除它們
      const nonAssemblyItems = orderItems.filter((item) => !item.isAssembly)

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
        currency: "USD", // 默認貨幣
        product: product, // 保存完整產品資料
      }

      setOrderItems([...nonAssemblyItems, newItem])
      setSelectedProductPartNo("")
      setIsProductsReady(false) // 重置產品準備狀態
    }

    // 處理添加選中的產品
    const handleAddSelectedProducts = async () => {
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
        const newItems = selectedProductsData
          .filter((product) => !isProductAdded(product.part_no))
          .map((product) => {
            // 默認數量
            const defaultQuantity = 1

            return {
              id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${product.part_no}`,
              productKey: getProductKey(product),
              productName: getProductName(product),
              productPartNo: getProductPartNo(product),
              quantity: defaultQuantity,
              unitPrice: product.last_price || product.unit_price || 0,
              isAssembly: isProductAssembly(product),
              shipmentBatches: [createDefaultBatch(product.part_no, defaultQuantity)],
              currency: "USD", // 默認貨幣
              specifications: product.specifications || "",
              product: product, // 保存完整產品資料
            }
          })

        if (newItems.length > 0) {
          setOrderItems([...orderItems, ...newItems])
          // 清空選擇
          setSelectedProducts([])
        }
      } catch (err: any) {
        console.error("添加產品失敗:", err)
        alert(`添加產品失敗: ${err.message}`)
      } finally {
        setLoadingSelectedProducts(false)
        setIsProductsReady(false) // 重置產品準備狀態
      }
    }

    const handleRemoveProduct = (itemId: string) => {
      setOrderItems(orderItems.filter((item) => item.id !== itemId))
      setIsProductsReady(false) // 重置產品準備狀態
    }

    const handleItemChange = (itemId: string, field: keyof OrderItem, value: any) => {
      setOrderItems(
        orderItems.map((item) => {
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
    }

    // 計算單個產品項目的總價
    const calculateItemTotal = (item: OrderItem) => {
      const basePrice = item.quantity * item.unitPrice
      const discountAmount = item.discount ? basePrice * (item.discount / 100) : 0
      const priceAfterDiscount = basePrice - discountAmount
      const taxAmount = item.taxRate ? priceAfterDiscount * (item.taxRate / 100) : 0
      return priceAfterDiscount + taxAmount
    }

    // 計算訂單總價
    const calculateTotal = () => {
      return orderItems.reduce((total, item) => total + calculateItemTotal(item), 0)
    }

    // 批次管理相關函數
    const openBatchManagement = (productPartNo: string) => {
      setCurrentManagingProductPartNo(productPartNo)
      setBatchManagementTab("basic") // 重置為基本信息標籤
      setIsManagingBatches(true)
    }

    // 獲取當前管理的產品項目
    const getCurrentItem = () => {
      return orderItems.find((item) => item.productPartNo === currentManagingProductPartNo)
    }

    // 獲取當前產品的批次列表
    const getCurrentBatches = () => {
      const item = getCurrentItem()
      return item ? item.shipmentBatches : []
    }

    // 添加批次
    const addBatch = () => {
      const item = getCurrentItem()
      if (!item) return

      const batches = [...item.shipmentBatches]
      const nextBatchNumber = batches.length > 0 ? Math.max(...batches.map((b) => b.batchNumber)) + 1 : 1

      // 計算剩餘可分配數量
      const allocatedQuantity = batches.reduce((sum, batch) => sum + batch.quantity, 0)
      const remainingQuantity = Math.max(0, item.quantity - allocatedQuantity)

      const newBatch: ShipmentBatch = {
        id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productPartNo: item.productPartNo,
        batchNumber: nextBatchNumber,
        plannedShipDate: addDays(new Date(), 30), // 預設30天後交期
        quantity: remainingQuantity,
        notes: "",
        status: "pending", // 默認狀態
      }

      // 更新產品的批次列表
      setOrderItems(
        orderItems.map((orderItem) => {
          if (orderItem.id === item.id) {
            return {
              ...orderItem,
              shipmentBatches: [...batches, newBatch],
            }
          }
          return orderItem
        }),
      )
      setIsProductsReady(false) // 重置產品準備狀態
    }

    // 移除批次
    const removeBatch = (batchId: string) => {
      const item = getCurrentItem()
      if (!item) return

      // 獲取要刪除的批次
      const batchToRemove = item.shipmentBatches.find((batch) => batch.id === batchId)
      if (!batchToRemove) return

      // 計算剩餘批次
      const remainingBatches = item.shipmentBatches.filter((batch) => batch.id !== batchId)

      // 如果刪除後沒有批次，創建一個新的默認批次
      if (remainingBatches.length === 0) {
        remainingBatches.push(createDefaultBatch(item.productPartNo, item.quantity))
      } else if (remainingBatches.length === 1) {
        // 如果只剩一個批次，將刪除批次的數量添加到剩餘批次
        remainingBatches[0].quantity += batchToRemove.quantity
      }

      // 更新產品的批次列表
      setOrderItems(
        orderItems.map((orderItem) => {
          if (orderItem.id === item.id) {
            return {
              ...orderItem,
              shipmentBatches: remainingBatches,
            }
          }
          return orderItem
        }),
      )
      setIsProductsReady(false) // 重置產品準備狀態
    }

    // 更新批次
    const updateBatch = (batchId: string, field: keyof ShipmentBatch, value: any) => {
      const item = getCurrentItem()
      if (!item) return

      // 更新產品的批次列表
      setOrderItems(
        orderItems.map((orderItem) => {
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
        }),
      )
      setIsProductsReady(false) // 重置產品準備狀態
    }

    // 計算已分配的數量
    const calculateAllocatedQuantity = () => {
      const item = getCurrentItem()
      if (!item) return 0

      return item.shipmentBatches.reduce((sum, batch) => sum + batch.quantity, 0)
    }

    // 計算剩餘可分配數量
    const calculateRemainingQuantity = () => {
      const item = getCurrentItem()
      if (!item) return 0

      const allocatedQuantity = calculateAllocatedQuantity()
      return Math.max(0, item.quantity - allocatedQuantity)
    }

    // 解析組合產品的部件
    const parseSubPartNo = (product: Product) => {
      if (!product.sub_part_no) return null

      try {
        let subParts = product.sub_part_no
        if (typeof subParts === "string") {
          subParts = JSON.parse(subParts)
        }

        if (Array.isArray(subParts) && subParts.length > 0) {
          return (
            <div className="text-xs text-muted-foreground mt-1">
              部件:{" "}
              {subParts
                .map((part) => `${part.productPN || part.part_no} (${part.productName || part.component_name})`)
                .join("; ")}
            </div>
          )
        }
      } catch (err) {
        console.error("解析sub_part_no失敗:", err)
      }

      return null
    }

    // 獲取產品的批次數量
    const getProductBatchesCount = (productPartNo: string) => {
      const item = orderItems.find((item) => item.productPartNo === productPartNo)
      return item ? item.shipmentBatches.length : 0
    }

    // 批次狀態選項
    const batchStatusOptions = [
      { value: "pending", label: "待處理" },
      { value: "scheduled", label: "已排程" },
      { value: "in_production", label: "生產中" },
      { value: "ready", label: "準備出貨" },
      { value: "shipped", label: "已出貨" },
      { value: "delivered", label: "已送達" },
      { value: "delayed", label: "延遲" },
      { value: "cancelled", label: "已取消" },
    ]

    // 獲取批次狀態顯示名稱
    const getBatchStatusLabel = (status: string) => {
      const option = batchStatusOptions.find((opt) => opt.value === status)
      return option ? option.label : status
    }

    // 獲取批次狀態顏色
    const getBatchStatusColor = (status: string) => {
      switch (status) {
        case "pending":
          return "bg-gray-500"
        case "scheduled":
          return "bg-blue-500"
        case "in_production":
          return "bg-indigo-500"
        case "ready":
          return "bg-green-500"
        case "shipped":
          return "bg-purple-500"
        case "delivered":
          return "bg-teal-500"
        case "delayed":
          return "bg-amber-500"
        case "cancelled":
          return "bg-red-500"
        default:
          return "bg-gray-500"
      }
    }

    // 處理採購資料變更
    const handleProcurementDataChange = (items: ProcurementItem[]) => {
      setProcurementItems(items)
    }

    // 檢查產品是否已準備好
    const checkProductsReady = () => {
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
    }

    const confirmProductsReady = () => {
      if (!isProductSettingsConfirmed) {
        if (!checkProductsReady()) {
          alert("請確保所有產品都已設置批次，且批次數量等於產品數量")
          return
        }

        // 生成訂單資訊
        const generatedOrderInfo = generateOrderInfo(orderItems)
        setOrderInfo(generatedOrderInfo)

        setIsProductsReady(true)
        setIsProductSettingsConfirmed(true)
      } else {
        // 取消確認，允許再次編輯
        setIsProductSettingsConfirmed(false)
      }
    }

    // Add a new function to confirm procurement settings
    const confirmProcurementSettings = () => {
      setIsProcurementSettingsConfirmed(!isProcurementSettingsConfirmed)
    }

    // 生成訂單資訊
    const generateOrderInfo = (items: OrderItem[]) => {
      if (!items || items.length === 0) return ""

      return items
        .map((item, index) => {
          const product = item.product || {}
          const customerDrawing = product.customer_drawing || {}
          const filename = customerDrawing.filename || ""
          const drawingVersion = product.customer_drawing_version || ""
          const drawingInfo =
            filename || drawingVersion ? `As per point ${filename}${drawingVersion ? `, ${drawingVersion}` : ""}` : ""

          return `PART# ${product.part_no || item.productPartNo || ""}
LOT NO. 訂單 ${useCustomOrderNumber ? customOrderNumber : orderNumber}
${product.component_name || item.productName || ""}
HS Code: ${product.customs_code || ""}
${product.order_requirements || ""}
${drawingInfo}
${product.specification || ""}
${item.quantity} PCS / CTN`
        })
        .join("\n\n")
    }

    // 創建採購單
    const createPurchaseOrders = async (orderId: string) => {
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
    }

    const handleSubmitOrder = async (createPurchaseOrder = false) => {
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

          // 提交成功後調用onSubmit
          if (onSubmit) {
            onSubmit(data[0])
          }

          return data
        } catch (err: any) {
          console.error("提交訂單失敗:", err)
          throw err
        }
      } finally {
        setIsSubmitting(false)
      }
    }

    // 根據當前步驟渲染不同的內容
    if (currentStep === 1) {
      // 採購資料確認步驟
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h3 className="text-lg font-medium text-blue-800 mb-2">訂單已成功建立</h3>
            <p className="text-blue-700">
              訂單編號: <span className="font-semibold">{createdOrderId || orderData?.order_id}</span>
            </p>
            <p className="text-blue-700 mt-1">請確認以下採購資料，並點擊「創建採購單」按鈕完成採購單創建。</p>
          </div>

          <ProcurementDataEditor
            orderItems={orderItems}
            onProcurementDataChange={handleProcurementDataChange}
            isCreatingPurchaseOrder={isCreatingPurchaseOrder}
            orderId={createdOrderId || orderData?.order_id}
            readOnly={false}
          />
        </div>
      )
    }

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-center text-muted-foreground">正在載入客戶和產品資料...</p>
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>錯誤</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    return (
      <div className="space-y-6">
        {/* 工作流程控制按鈕 */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{activeTab === "products" ? "產品選擇與設定" : "採購資料設定"}</h3>
          <div className="flex gap-2">
            {activeTab === "procurement" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("products")}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回產品設定
              </Button>
            )}
            {isProductSettingsConfirmed && isProcurementSettingsConfirmed && (
              <>
                <Button
                  onClick={() => handleSubmitOrder(false)}
                  disabled={isSubmitting || isCreatingPurchaseOrder}
                  variant="outline"
                >
                  <Save className="h-4 w-4 mr-2" />
                  僅建立訂單
                </Button>
                <Button
                  onClick={() => handleSubmitOrder(true)}
                  disabled={isSubmitting || isCreatingPurchaseOrder}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  儲存並同時建立訂單與採購單
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 基本訂單資訊區域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="orderId">訂單編號</Label>
            <div className="relative">
              <Input
                id="orderId"
                value={
                  useCustomOrderNumber ? customOrderNumber : isLoadingOrderNumber ? "正在生成訂單編號..." : orderNumber
                }
                onChange={(e) => setCustomOrderNumber(e.target.value)}
                readOnly={!useCustomOrderNumber || isLoadingOrderNumber}
                className={`${!useCustomOrderNumber ? "bg-gray-50" : ""} pr-10`}
                disabled={isProductSettingsConfirmed && isProcurementSettingsConfirmed}
              />
              {isLoadingOrderNumber && !useCustomOrderNumber && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {useCustomOrderNumber && orderNumberStatus === "checking" && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {useCustomOrderNumber && orderNumberStatus === "valid" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{orderNumberMessage}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {useCustomOrderNumber && orderNumberStatus === "invalid" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <XCircle className="h-4 w-4 text-red-500" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{orderNumberMessage}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useCustomOrderNumber"
                  checked={useCustomOrderNumber}
                  onCheckedChange={(checked) => {
                    setUseCustomOrderNumber(checked === true)
                    if (checked) {
                      setOrderNumberStatus("idle")
                      setOrderNumberMessage("")
                    }
                  }}
                  disabled={isProductSettingsConfirmed && isProcurementSettingsConfirmed}
                />
                <Label htmlFor="useCustomOrderNumber" className="text-sm font-normal cursor-pointer">
                  我想自行輸入訂單編號
                </Label>
              </div>
              {useCustomOrderNumber && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkOrderNumberDuplicate}
                  disabled={isCheckingOrderNumber || (isProductSettingsConfirmed && isProcurementSettingsConfirmed)}
                  className="h-7 text-xs"
                >
                  {isCheckingOrderNumber ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      檢查中...
                    </>
                  ) : (
                    "檢查重複編號"
                  )}
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">格式: L-YYMMDD-XXXXX</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="poNumber">客戶PO編號</Label>
            <Input
              id="poNumber"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="請輸入客戶PO編號"
              disabled={isProductSettingsConfirmed && isProcurementSettingsConfirmed}
            />
          </div>
          {/* 修改客戶選擇部分 */}
          <div className="space-y-2">
            <Label htmlFor="customer">客戶</Label>
            <select
              id="customer"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              disabled={isProductSettingsConfirmed && isProcurementSettingsConfirmed}
            >
              <option value="">選擇客戶...</option>
              {customers.map((customer) => (
                <option key={customer.customer_id} value={customer.customer_id}>
                  {getCustomerName(customer)}
                </option>
              ))}
            </select>
            {customers.length === 0 && !loading && (
              <Alert variant="warning" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>警告</AlertTitle>
                <AlertDescription>未能載入客戶資料。請確保您已連接到資料庫並且有權限訪問客戶資料表。</AlertDescription>
              </Alert>
            )}
          </div>
          {selectedCustomerId && customers.length > 0 && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md border text-sm">
              {(() => {
                const customer = customers.find(
                  (c) => c.customer_id === selectedCustomerId || c.id === selectedCustomerId,
                )
                if (!customer) return <p>找不到客戶資料</p>

                return (
                  <div className="space-y-1">
                    <div className="font-medium">{getCustomerName(customer)}</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                      <div>ID: {customer.customer_id || customer.id}</div>
                      {customer.customer_phone && <div>電話: {customer.customer_phone}</div>}
                      {customer.payment_term && <div>付款條件: {customer.payment_term}</div>}
                      {customer.delivery_terms && <div>交貨條件: {customer.delivery_terms}</div>}
                      {customer.customer_address && <div className="col-span-2">地址: {customer.customer_address}</div>}
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="paymentTerm">付款條件</Label>
            <Input
              id="paymentTerm"
              value={paymentTerm}
              onChange={(e) => setPaymentTerm(e.target.value)}
              placeholder="付款條件"
              disabled={isProductSettingsConfirmed && isProcurementSettingsConfirmed}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deliveryTerms">交貨條件</Label>
            <Input
              id="deliveryTerms"
              value={deliveryTerms}
              onChange={(e) => setDeliveryTerms(e.target.value)}
              placeholder="交貨條件"
              disabled={isProductSettingsConfirmed && isProcurementSettingsConfirmed}
            />
          </div>
        </div>

        <Separator />

        {/* 產品設定區域 */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <Tabs value={productSelectionTab} onValueChange={setProductSelectionTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="regular" className="flex items-center" disabled={isProductSettingsConfirmed}>
                  <Package className="mr-2 h-4 w-4" />
                  普通產品 ({regularProducts.length})
                </TabsTrigger>
                <TabsTrigger value="assembly" className="flex items-center" disabled={isProductSettingsConfirmed}>
                  <Settings className="mr-2 h-4 w-4" />
                  組件產品 ({assemblyProducts.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="regular" className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜尋產品編號或名稱..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="pl-10"
                      disabled={isProductSettingsConfirmed}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllSelections}
                      disabled={selectedProducts.length === 0 || isProductSettingsConfirmed}
                    >
                      <X className="h-4 w-4 mr-1" />
                      清除選擇
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddSelectedProducts}
                      disabled={selectedProducts.length === 0 || loadingSelectedProducts || isProductSettingsConfirmed}
                    >
                      {loadingSelectedProducts ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          處理中...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          添加選中產品 ({selectedProducts.length})
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {filteredRegularProducts.length > 0 ? (
                      filteredRegularProducts.map((product) => {
                        const partNo = getProductPartNo(product)
                        const isAdded = isProductAdded(partNo)
                        const isSelected = isProductSelected(partNo)
                        return (
                          <div
                            key={partNo}
                            className={`flex items-start space-x-2 p-2 border rounded-md ${
                              isAdded ? "bg-gray-100 border-gray-300" : isSelected ? "bg-blue-50 border-blue-300" : ""
                            }`}
                            onClick={() => !isAdded && !isProductSettingsConfirmed && toggleProductSelection(partNo)}
                            style={{ cursor: isAdded || isProductSettingsConfirmed ? "default" : "pointer" }}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleProductSelection(partNo)}
                              disabled={isAdded || isProductSettingsConfirmed}
                              className="mt-1 mr-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{partNo}</div>
                              <div className="text-sm">{getProductName(product)}</div>
                              {parseSubPartNo(product)}
                              <div className="text-xs text-muted-foreground">
                                前次單價: {product.last_price || product.unit_price || 0} {product.currency || "USD"}
                              </div>
                            </div>
                            {isAdded && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                已添加
                              </Badge>
                            )}
                            {isProductAssembly(product) && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                      <Layers className="h-3 w-3 mr-1" />
                                      組件
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>此產品是組合產品，包含多個部件</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <div className="col-span-full text-center text-gray-500 py-4">
                        {productSearchTerm
                          ? "沒有符合搜尋條件的產品"
                          : selectedCustomerId
                            ? "此客戶沒有普通產品"
                            : "請先選擇客戶"}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="assembly" className="space-y-4 pt-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="assemblyProduct">選擇組件產品</Label>
                    <ProductCombobox
                      options={assemblyProducts
                        .filter((product) => !isProductAdded(product.part_no))
                        .map((product) => ({
                          value: getProductPartNo(product),
                          label: getProductName(product),
                          description: product.description,
                          isAssembly: true,
                          price: product.last_price || product.unit_price,
                          priceLabel: `${product.last_price || product.unit_price || 0} ${product.currency || "USD"}`,
                          data: product,
                        }))}
                      value={selectedProductPartNo}
                      onValueChange={(value, data) => {
                        setSelectedProductPartNo(value)
                      }}
                      placeholder={selectedCustomerId ? "搜尋或選擇組件產品" : "請先選擇客戶"}
                      emptyMessage={assemblyProducts.length > 0 ? "找不到符合的組件產品" : "此客戶沒有組件產品"}
                      disabled={!selectedCustomerId || assemblyProducts.length === 0 || isProductSettingsConfirmed}
                    />
                  </div>
                  <Button
                    onClick={handleAddAssemblyProduct}
                    disabled={!selectedProductPartNo || isProductSettingsConfirmed}
                    className="w-32"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    新增組件
                  </Button>
                </div>
                {assemblyProducts.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    {selectedCustomerId ? "此客戶沒有組件產品" : "請先選擇客戶"}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>產品編號</TableHead>
                    <TableHead>產品名稱</TableHead>
                    <TableHead className="text-right">數量</TableHead>
                    <TableHead className="text-right">單價 (USD)</TableHead>
                    <TableHead className="text-right">金額 (USD)</TableHead>
                    <TableHead className="text-right">批次</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.productPartNo}
                        {item.isAssembly && (
                          <Badge className="ml-2 bg-purple-500 text-white">
                            <Layers className="h-3 w-3 mr-1" />
                            組件
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell className="text-right">
                        {isProductSettingsConfirmed ? (
                          item.quantity
                        ) : (
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(item.id, "quantity", Number.parseInt(e.target.value) || 1)
                            }
                            className="w-20 text-right"
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isProductSettingsConfirmed ? (
                          item.unitPrice.toFixed(2)
                        ) : (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemChange(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)
                            }
                            className="w-24 text-right"
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-right">{calculateItemTotal(item).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openBatchManagement(item.productPartNo)}
                          className="h-8 px-2"
                          disabled={isProductSettingsConfirmed}
                        >
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          批次 ({item.shipmentBatches.length})
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveProduct(item.id)}
                          disabled={isProductSettingsConfirmed}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {orderItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        尚未新增產品
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between items-center">
              <div className="w-72 space-y-1">
                <div className="flex justify-between">
                  <span>小計:</span>
                  <span>{calculateTotal().toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>總計:</span>
                  <span>{calculateTotal().toFixed(2)} USD</span>
                </div>
              </div>

              <div className="flex gap-2">
                {orderItems.length > 0 && (
                  <Button onClick={confirmProductsReady} variant={isProductSettingsConfirmed ? "outline" : "default"}>
                    {isProductSettingsConfirmed ? (
                      <>
                        <Settings className="h-4 w-4 mr-2" />
                        修改產品設定
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        確認產品設定完成
                      </>
                    )}
                  </Button>
                )}
                {orderItems.length > 0 && (
                  <Button
                    onClick={() => {
                      setActiveTab("procurement")
                      setIsSplitView(true) // 自動啟用分割視圖
                    }}
                    disabled={!isProductSettingsConfirmed}
                    className="gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    前往設定採購資料
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 採購資料設定區域 */}
        {activeTab === "procurement" && (
          <div className="space-y-6">
            {/* 訂單摘要卡片 */}
            <div className="bg-white border rounded-md p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h4 className="font-medium text-lg">訂單產品摘要</h4>
                  <p className="text-muted-foreground text-sm">請確認以下產品資料，再進行採購設定</p>
                </div>
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {orderItems.length} 項產品
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    總金額: {calculateTotal().toFixed(2)} USD
                  </Badge>
                </div>
              </div>

              {/* 產品資料表格 - 響應式設計 */}
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">產品編號</TableHead>
                      <TableHead>產品名稱</TableHead>
                      <TableHead className="text-center w-[80px]">數量</TableHead>
                      <TableHead className="text-right w-[100px]">單價 (USD)</TableHead>
                      <TableHead className="text-right w-[100px]">金額 (USD)</TableHead>
                      <TableHead className="text-center w-[80px]">批次</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.productPartNo}
                          {item.isAssembly && (
                            <Badge className="ml-2 bg-purple-500 text-white">
                              <Layers className="h-3 w-3 mr-1" />
                              組件
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">{item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">{calculateItemTotal(item).toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{item.shipmentBatches.length}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-bold">
                        訂單總金額:
                      </TableCell>
                      <TableCell className="text-right font-bold">{calculateTotal().toFixed(2)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* 採購資料設定 */}
            <div className="bg-white border rounded-md p-4">
              <div className="mb-4">
                <h4 className="font-medium text-lg">採購資料設定</h4>
                <p className="text-muted-foreground text-sm">
                  為訂單中的產品設定採購資料，包括供應商、採購價格、交期等
                </p>
              </div>

              <ProcurementDataEditor
                orderItems={orderItems}
                onProcurementDataChange={handleProcurementDataChange}
                isCreatingPurchaseOrder={isCreatingPurchaseOrder}
                orderId={createdOrderId}
                readOnly={isProcurementSettingsConfirmed}
                onConfirmSettings={confirmProcurementSettings}
                isSettingsConfirmed={isProcurementSettingsConfirmed}
              />
            </div>
          </div>
        )}

        <Separator />

        {/* 訂單資訊和備註 - 始終顯示在頁面底部 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="orderInfo">訂單資訊</Label>
            <AutoResizeTextarea
              id="orderInfo"
              value={orderInfo}
              onChange={(e) => setOrderInfo(e.target.value)}
              placeholder="請輸入訂單相關資訊"
              minRows={4}
              disabled={isProductSettingsConfirmed && isProcurementSettingsConfirmed}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">訂單備註</Label>
            <AutoResizeTextarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="請輸入訂單備註"
              minRows={4}
              disabled={isProductSettingsConfirmed && isProcurementSettingsConfirmed}
            />
          </div>
        </div>

        {/* 批次管理對話框 */}
        <Dialog open={isManagingBatches} onOpenChange={(open) => !open && setIsManagingBatches(false)}>
          {/* 保持原有的批次管理對話框內容不變 */}
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>管理批次出貨 - {currentManagingProductPartNo}</DialogTitle>
              <DialogDescription>設置產品的批次出貨計劃</DialogDescription>
            </DialogHeader>

            {/* 批次管理對話框內容保持不變 */}
            {/* ... */}
            <Tabs value={batchManagementTab} onValueChange={setBatchManagementTab}>
              <TabsList>
                <TabsTrigger value="basic">基本信息</TabsTrigger>
                <TabsTrigger value="batches">批次列表</TabsTrigger>
              </TabsList>
              <TabsContent value="basic">
                {/* 基本信息編輯表單 */}
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">
                      產品數量
                    </Label>
                    <Input
                      type="number"
                      id="quantity"
                      value={getCurrentItem()?.quantity || 0}
                      disabled
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="allocated" className="text-right">
                      已分配數量
                    </Label>
                    <Input
                      type="number"
                      id="allocated"
                      value={calculateAllocatedQuantity()}
                      disabled
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="remaining" className="text-right">
                      剩餘可分配數量
                    </Label>
                    <Input
                      type="number"
                      id="remaining"
                      value={calculateRemainingQuantity()}
                      disabled
                      className="col-span-3"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="batches">
                {/* 批次列表 */}
                <ScrollArea className="h-[400px] w-full rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>批號</TableHead>
                        <TableHead>計劃出貨日</TableHead>
                        <TableHead>數量</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getCurrentBatches().map((batch) => (
                        <TableRow key={batch.id}>
                          <TableCell>{batch.batchNumber}</TableCell>
                          <TableCell>
                            <DatePicker
                              date={batch.plannedShipDate ? new Date(batch.plannedShipDate) : undefined}
                              onDateChange={(date) => updateBatch(batch.id, "plannedShipDate", date)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={batch.quantity}
                              onChange={(e) => updateBatch(batch.id, "quantity", Number(e.target.value))}
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={batch.status}
                              onValueChange={(value) => updateBatch(batch.id, "status", value)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="選擇狀態" />
                              </SelectTrigger>
                              <SelectContent>
                                {batchStatusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => removeBatch(batch.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                <Button variant="outline" size="sm" onClick={addBatch} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  添加批次
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    )
  },
)
