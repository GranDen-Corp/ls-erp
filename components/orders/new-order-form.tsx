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
  CalendarDays,
  Search,
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
  part_no?: string
  component_name?: string
  description?: string
  is_assembly?: boolean
  customer_id?: string
  unit_price?: number
  [key: string]: any
}

interface ShipmentBatch {
  id: string
  batchNumber: number
  plannedShipDate: Date | undefined
  notes?: string
}

interface OrderItem {
  id: string
  productId: string
  productName: string
  productPartNo: string
  quantity: number
  unitPrice: number
  isAssembly: boolean
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
    const [selectedProductId, setSelectedProductId] = useState<string>("")
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

    // 批次管理相關狀態
    const [isManagingBatches, setIsManagingBatches] = useState<boolean>(false)
    const [shipmentBatches, setShipmentBatches] = useState<ShipmentBatch[]>([
      {
        id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        batchNumber: 1,
        plannedShipDate: addDays(new Date(), 30),
        notes: "",
      },
    ])

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

          setCustomers(processedCustomers)
          setProducts(productsData || [])

          console.log("已載入客戶資料:", processedCustomers.length, "筆")
          console.log("已載入產品資料:", productsData?.length || 0, "筆")
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
      setSelectedProductId("")
      setProductSearchTerm("")
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

    const isProductAssembly = (product: Product) => {
      return product.is_assembly === true
    }

    // 檢查產品是否已添加到訂單中
    const isProductAdded = (productId: string) => {
      return orderItems.some((item) => item.productId === productId)
    }

    // 過濾搜索結果
    const filteredRegularProducts = regularProducts.filter((product) => {
      if (!productSearchTerm) return true

      const partNo = getProductPartNo(product).toLowerCase()
      const name = getProductName(product).toLowerCase()
      const searchTerm = productSearchTerm.toLowerCase()

      return partNo.includes(searchTerm) || name.includes(searchTerm)
    })

    const handleAddAssemblyProduct = () => {
      if (!selectedProductId) return

      const product = products.find((p) => p.id === selectedProductId)
      if (!product) return

      // 檢查產品是否已添加
      if (isProductAdded(product.id)) {
        alert(`產品 ${getProductPartNo(product)} 已添加到訂單中`)
        return
      }

      // 如果已經有組件產品，先移除它們
      const nonAssemblyItems = orderItems.filter((item) => !item.isAssembly)

      const newItem: OrderItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId: product.id,
        productName: getProductName(product),
        productPartNo: getProductPartNo(product),
        quantity: 1,
        unitPrice: product.unit_price || 0,
        isAssembly: true,
      }

      setOrderItems([...nonAssemblyItems, newItem])
      setSelectedProductId("")
    }

    // 處理單個產品選擇
    const handleAddRegularProduct = (productId: string) => {
      const product = products.find((p) => p.id === productId)
      if (!product) {
        console.error(`找不到產品 ID: ${productId}`)
        return
      }

      // 檢查產品是否已添加
      if (isProductAdded(product.id)) {
        alert(`產品 ${getProductPartNo(product)} 已添加到訂單中`)
        return
      }

      // 創建新的訂單項目
      const newItem: OrderItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId: product.id,
        productName: getProductName(product),
        productPartNo: getProductPartNo(product),
        quantity: 1,
        unitPrice: product.unit_price || 0,
        isAssembly: false,
      }

      setOrderItems([...orderItems, newItem])
    }

    const handleRemoveProduct = (itemId: string) => {
      setOrderItems(orderItems.filter((item) => item.id !== itemId))
    }

    const handleItemChange = (itemId: string, field: keyof OrderItem, value: any) => {
      setOrderItems(
        orderItems.map((item) => {
          if (item.id === itemId) {
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
    const openBatchManagement = () => {
      setIsManagingBatches(true)
    }

    const addBatch = () => {
      const nextBatchNumber =
        shipmentBatches.length > 0 ? Math.max(...shipmentBatches.map((b) => b.batchNumber)) + 1 : 1

      const newBatch: ShipmentBatch = {
        id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        batchNumber: nextBatchNumber,
        plannedShipDate: addDays(new Date(), 30), // 預設30天後交期
        notes: "",
      }

      setShipmentBatches([...shipmentBatches, newBatch])
    }

    const removeBatch = (batchId: string) => {
      setShipmentBatches(shipmentBatches.filter((batch) => batch.id !== batchId))
    }

    const updateBatch = (batchId: string, field: keyof ShipmentBatch, value: any) => {
      setShipmentBatches(
        shipmentBatches.map((batch) => {
          if (batch.id === batchId) {
            return { ...batch, [field]: value }
          }
          return batch
        }),
      )
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

      if (shipmentBatches.length === 0) {
        throw new Error("請至少設置一個出貨批次")
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
        const partsList = orderItems.map((item) => ({
          product_id: item.productId,
          part_no: item.productPartNo,
          description: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          is_assembly: item.isAssembly,
        }))

        orderData.part_no_list = JSON.stringify(partsList)

        // 處理批次資料
        const batchesList = shipmentBatches.map((batch) => ({
          batch_number: batch.batchNumber,
          planned_ship_date: batch.plannedShipDate ? batch.plannedShipDate.toISOString() : null,
          notes: batch.notes,
        }))

        orderData.shipment_batches = JSON.stringify(batchesList)

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
            <p className="text-xs text-muted-foreground">格式: L-YYYYMMDD-XXXXX</p>
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜尋產品編號或名稱..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="border rounded-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {filteredRegularProducts.length > 0 ? (
                    filteredRegularProducts.map((product) => {
                      const isAdded = isProductAdded(product.id)
                      return (
                        <div
                          key={product.id}
                          className={`flex items-center space-x-2 p-2 border rounded-md ${
                            isAdded ? "bg-gray-100 border-gray-300" : ""
                          }`}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{getProductPartNo(product)}</div>
                            <div className="text-sm">{getProductName(product)}</div>
                            <div className="text-xs text-muted-foreground">單價: {product.unit_price || 0} USD</div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddRegularProduct(product.id)}
                            disabled={isAdded}
                            className="h-8 text-xs"
                          >
                            {isAdded ? (
                              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                            ) : (
                              <Plus className="h-3 w-3 mr-1" />
                            )}
                            {isAdded ? "已添加" : "添加"}
                          </Button>
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
                  <Select value={selectedProductId} onValueChange={setSelectedProductId} disabled={!selectedCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedCustomerId ? "選擇組件產品" : "請先選擇客戶"} />
                    </SelectTrigger>
                    <SelectContent>
                      {assemblyProducts
                        .filter((product) => !isProductAdded(product.id))
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {getProductPartNo(product)} - {getProductName(product)}
                          </SelectItem>
                        ))}
                      {assemblyProducts.length > 0 &&
                        assemblyProducts.filter((product) => !isProductAdded(product.id)).length === 0 && (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">所有組件產品已添加</div>
                        )}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddAssemblyProduct} disabled={!selectedProductId} className="w-32">
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
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(item.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {orderItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      尚未新增產品
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={openBatchManagement} disabled={orderItems.length === 0}>
              <CalendarDays className="mr-2 h-4 w-4" />
              管理批次出貨 ({shipmentBatches.length})
            </Button>
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
              <DialogTitle>管理批次出貨</DialogTitle>
              <DialogDescription>設置訂單的批次出貨計劃</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">批次列表</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>批次編號</TableHead>
                        <TableHead>計劃出貨日</TableHead>
                        <TableHead>備註</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shipmentBatches.map((batch) => (
                        <TableRow key={batch.id}>
                          <TableCell>{batch.batchNumber}</TableCell>
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
                              disabled={shipmentBatches.length === 1} // 至少保留一個批次
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

              <Button onClick={addBatch} className="w-full">
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
