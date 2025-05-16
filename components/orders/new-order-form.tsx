"use client"

import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  XCircle,
  Search,
  X,
  Clock,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Customer {
  id: string
  customer_id?: string
  name?: string
  customer_name?: string
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
  sub_part_no?: any
  [key: string]: any
}

interface ShipmentBatch {
  id: string
  productPartNo: string // 關聯的產品編號
  batchNumber: number
  plannedShipDate: Date | undefined
  quantity: number // 批次數量
  notes?: string
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
}

interface NewOrderFormProps {
  orderNumber: string
  isLoadingOrderNumber: boolean
  onSubmit: (formData: any) => void
}

export const NewOrderForm = forwardRef<any, NewOrderFormProps>(
  ({ orderNumber, isLoadingOrderNumber, onSubmit }, ref) => {
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

    // 批次管理相關狀態
    const [isManagingBatches, setIsManagingBatches] = useState<boolean>(false)
    const [currentManagingProductPartNo, setCurrentManagingProductPartNo] = useState<string>("")

    // 當系統生成的訂單編號變更時，更新自定義訂單編號的初始值
    useEffect(() => {
      if (orderNumber && !customOrderNumber) {
        setCustomOrderNumber(orderNumber)
      }
    }, [orderNumber])

    // 暴露submitOrder方法給父組件
    useImperativeHandle(ref, () => ({
      submitOrder: async () => {
        return await handleSubmitOrder()
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

        // 處理產品和批次資料
        const partsList = orderItems.map((item) => {
          // 處理批次資料
          const batchesList = item.shipmentBatches.map((batch) => ({
            batch_number: batch.batchNumber,
            planned_ship_date: batch.plannedShipDate ? batch.plannedShipDate.toISOString() : null,
            quantity: batch.quantity,
            notes: batch.notes,
          }))

          return {
            part_no: item.productPartNo,
            description: item.productName,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            is_assembly: item.isAssembly,
            shipment_batches: batchesList,
          }
        })

        // 為了測試目的，即使沒有產品也返回一個空數組
        orderData.part_no_list = JSON.stringify(partsList)

        // 為了測試目的，添加原始訂單項目數據
        orderData.order_items = orderItems

        return orderData
      },
    }))

    // 獲取客戶和產品資料
    useEffect(() => {
      const fetchData = async () => {
        setLoading(true)
        setError(null)

        try {
          const supabase = createClient()

          // 獲取客戶資料
          const { data: customersData, error: customersError } = await supabase.from("customers").select("*")

          if (customersError) throw new Error(`獲取客戶資料失敗: ${customersError.message}`)

          // 獲取產品資料
          const { data: productsData, error: productsError } = await supabase.from("products").select("*")

          if (productsError) throw new Error(`獲取產品資料失敗: ${productsError.message}`)

          // 處理客戶資料，確保有正確的ID和名稱欄位
          const processedCustomers = (customersData || []).map((customer) => {
            // 確保每個客戶都有一個有效的ID
            const id = customer.customer_id || customer.id || ""
            // 確保每個客戶都有一個顯示名稱
            const name = customer.name || customer.customer_name || `客戶 ${id}`

            return {
              ...customer,
              id: id,
              name: name,
            }
          })

          // 確保每個產品都有 part_no
          const processedProducts = (productsData || []).filter((product) => product.part_no)

          setCustomers(processedCustomers)
          setProducts(processedProducts)

          console.log("已載入客戶資料:", processedCustomers.length, "筆")
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
        // 過濾該客戶的產品
        const filteredProducts = products.filter((product) => {
          const productCustomerId = product.customer_id || product.customerId
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

        // 設置客戶預設值
        const selectedCustomer = customers.find((c) => {
          const customerId = c.id || c.customer_id
          return customerId === selectedCustomerId
        })

        if (selectedCustomer) {
          setPaymentTerm(selectedCustomer.payment_term || "")
          setDeliveryTerms(selectedCustomer.delivery_terms || "")
        }
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
    }, [selectedCustomerId, customers, products])

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

    const getCustomerName = (customer: Customer) => {
      return customer.name || customer.customer_name || `客戶 ${customer.id}`
    }

    const getCustomerId = (customer: Customer) => {
      return customer.id || customer.customer_id || ""
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
        unitPrice: product.unit_price || 0,
        isAssembly: true,
        shipmentBatches: [createDefaultBatch(product.part_no, defaultQuantity)],
      }

      setOrderItems([...nonAssemblyItems, newItem])
      setSelectedProductPartNo("")
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
              unitPrice: product.unit_price || 0,
              isAssembly: isProductAssembly(product),
              shipmentBatches: [createDefaultBatch(product.part_no, defaultQuantity)],
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
      }
    }

    const handleRemoveProduct = (itemId: string) => {
      setOrderItems(orderItems.filter((item) => item.id !== itemId))
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
    }

    const calculateTotal = () => {
      return orderItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
    }

    // 批次管理相關函數
    const openBatchManagement = (productPartNo: string) => {
      setCurrentManagingProductPartNo(productPartNo)
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
                  return { ...batch, [field]: value }
                }
                return batch
              }),
            }
          }
          return orderItem
        }),
      )
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

    const handleSubmitOrder = async () => {
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
        throw new Error(`以下產品沒有設置批次出貨: ${itemsWithoutBatches.map((item) => item.productPartNo).join(", ")}`)
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

        // 處理產品和批次資料
        const partsList = orderItems.map((item) => {
          // 處理批次資料
          const batchesList = item.shipmentBatches.map((batch) => ({
            batch_number: batch.batchNumber,
            planned_ship_date: batch.plannedShipDate ? batch.plannedShipDate.toISOString() : null,
            quantity: batch.quantity,
            notes: batch.notes,
          }))

          return {
            part_no: item.productPartNo,
            description: item.productName,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            is_assembly: item.isAssembly,
            shipment_batches: batchesList,
          }
        })

        orderData.part_no_list = JSON.stringify(partsList)

        // 提交訂單
        const { data, error } = await supabase.from("orders").insert(orderData).select()

        if (error) throw new Error(`提交訂單失敗: ${error.message}`)

        return data
      } catch (err: any) {
        console.error("提交訂單失敗:", err)
        throw err
      }
    }

    if (loading) {
      return <div className="flex justify-center p-4">載入中...</div>
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
                  disabled={isCheckingOrderNumber}
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer">客戶</Label>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="選擇客戶" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={getCustomerId(customer)} value={getCustomerId(customer)}>
                    {getCustomerName(customer)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentTerm">付款條件</Label>
            <Input
              id="paymentTerm"
              value={paymentTerm}
              onChange={(e) => setPaymentTerm(e.target.value)}
              placeholder="付款條件"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deliveryTerms">交貨條件</Label>
            <Input
              id="deliveryTerms"
              value={deliveryTerms}
              onChange={(e) => setDeliveryTerms(e.target.value)}
              placeholder="交貨條件"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <Tabs value={productSelectionTab} onValueChange={setProductSelectionTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="regular" className="flex items-center">
                <Package className="mr-2 h-4 w-4" />
                普通產品 ({regularProducts.length})
              </TabsTrigger>
              <TabsTrigger value="assembly" className="flex items-center">
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
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllSelections}
                    disabled={selectedProducts.length === 0}
                  >
                    <X className="h-4 w-4 mr-1" />
                    清除選擇
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddSelectedProducts}
                    disabled={selectedProducts.length === 0 || loadingSelectedProducts}
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
                          onClick={() => !isAdded && toggleProductSelection(partNo)}
                          style={{ cursor: isAdded ? "default" : "pointer" }}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleProductSelection(partNo)}
                            disabled={isAdded}
                            className="mt-1 mr-2"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{partNo}</div>
                            <div className="text-sm">{getProductName(product)}</div>
                            {parseSubPartNo(product)}
                            <div className="text-xs text-muted-foreground">單價: {product.unit_price || 0} USD</div>
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
                  <Select
                    value={selectedProductPartNo}
                    onValueChange={setSelectedProductPartNo}
                    disabled={!selectedCustomerId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedCustomerId ? "選擇組件產品" : "請先選擇客戶"} />
                    </SelectTrigger>
                    <SelectContent>
                      {assemblyProducts
                        .filter((product) => !isProductAdded(product.part_no))
                        .map((product) => (
                          <SelectItem key={product.part_no} value={product.part_no}>
                            {getProductPartNo(product)} - {getProductName(product)}
                          </SelectItem>
                        ))}
                      {assemblyProducts.length > 0 &&
                        assemblyProducts.filter((product) => !isProductAdded(product.part_no)).length === 0 && (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">所有組件產品已添加</div>
                        )}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddAssemblyProduct} disabled={!selectedProductPartNo} className="w-32">
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
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                        className="w-20 text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                        className="w-24 text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right">{(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openBatchManagement(item.productPartNo)}
                        className="h-8 px-2"
                      >
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        批次 ({item.shipmentBatches.length})
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(item.id)}>
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

          <div className="flex justify-end items-center">
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
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="remarks">備註</Label>
          <Textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
            placeholder="訂單備註"
          />
        </div>

        {/* 批次管理對話框 */}
        <Dialog open={isManagingBatches} onOpenChange={(open) => !open && setIsManagingBatches(false)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>管理批次出貨 - {currentManagingProductPartNo}</DialogTitle>
              <DialogDescription>設置產品的批次出貨計劃</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex justify-between items-center">
                    <span>批次列表</span>
                    <div className="text-sm font-normal flex items-center gap-2">
                      <span>總數量: {getCurrentItem()?.quantity || 0}</span>
                      <span>已分配: {calculateAllocatedQuantity()}</span>
                      <span>剩餘: {calculateRemainingQuantity()}</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>批次編號</TableHead>
                        <TableHead>數量</TableHead>
                        <TableHead>計劃出貨日</TableHead>
                        <TableHead>備註</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getCurrentBatches().map((batch) => (
                        <TableRow key={batch.id}>
                          <TableCell>{batch.batchNumber}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={batch.quantity}
                              onChange={(e) => updateBatch(batch.id, "quantity", Number.parseInt(e.target.value) || 1)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <DatePicker
                              date={batch.plannedShipDate}
                              setDate={(date) => updateBatch(batch.id, "plannedShipDate", date)}
                              placeholder="選擇出貨日期"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={batch.notes || ""}
                              onChange={(e) => updateBatch(batch.id, "notes", e.target.value)}
                              placeholder="備註"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeBatch(batch.id)}
                              disabled={getCurrentBatches().length === 1} // 至少保留一個批次
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Button onClick={addBatch} className="w-full" disabled={calculateRemainingQuantity() <= 0}>
                <Plus className="mr-2 h-4 w-4" />
                新增批次
              </Button>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsManagingBatches(false)}>
                取消
              </Button>
              <Button onClick={() => setIsManagingBatches(false)}>確認</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  },
)

NewOrderForm.displayName = "NewOrderForm"
