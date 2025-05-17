"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash, Layers } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ProductImagePreview } from "@/components/products/product-image-preview"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatProcessesForOrderRemarks } from "@/lib/translation-service"

// 模擬客戶數據
const customers = [
  { id: "1", name: "台灣電子", code: "TE" },
  { id: "2", name: "新竹科技", code: "HT" },
  { id: "3", name: "台北工業", code: "TI" },
  { id: "4", name: "高雄製造", code: "KM" },
  { id: "5", name: "台中電子", code: "TC" },
]

// 模擬產品數據
const products = [
  {
    id: "1",
    pn: "LCD-15-HD",
    name: "15吋 HD LCD面板",
    customer: "1",
    factory: { id: "1", name: "深圳電子廠", code: "SZE" },
    lastPrice: 45.0,
    isAssembly: false,
    images: [
      {
        id: "1",
        url: "/placeholder.svg?height=100&width=100",
        alt: "LCD-15-HD",
        isThumbnail: true,
      },
    ],
  },
  {
    id: "2",
    pn: "LCD-17-FHD",
    name: "17吋 FHD LCD面板",
    customer: "1",
    factory: { id: "1", name: "深圳電子廠", code: "SZE" },
    lastPrice: 58.5,
    isAssembly: false,
    images: [
      {
        id: "1",
        url: "/placeholder.svg?height=100&width=100",
        alt: "LCD-17-FHD",
        isThumbnail: true,
      },
    ],
  },
  {
    id: "3",
    pn: "CAP-104-SMD",
    name: "104 SMD電容",
    customer: "2",
    factory: { id: "2", name: "上海科技廠", code: "SHT" },
    lastPrice: 0.05,
    isAssembly: false,
    images: [
      {
        id: "1",
        url: "/placeholder.svg?height=100&width=100",
        alt: "CAP-104-SMD",
        isThumbnail: true,
      },
    ],
  },
  {
    id: "4",
    pn: "RES-103-SMD",
    name: "103 SMD電阻",
    customer: "3",
    factory: { id: "3", name: "東莞工業廠", code: "DGI" },
    lastPrice: 0.03,
    isAssembly: false,
    images: [
      {
        id: "1",
        url: "/placeholder.svg?height=100&width=100",
        alt: "RES-103-SMD",
        isThumbnail: true,
      },
    ],
  },
  {
    id: "5",
    pn: "IC-CPU-8086",
    name: "8086 CPU晶片",
    customer: "4",
    factory: { id: "4", name: "廣州製造廠", code: "GZM" },
    lastPrice: 12.5,
    isAssembly: false,
    images: [
      {
        id: "1",
        url: "/placeholder.svg?height=100&width=100",
        alt: "IC-CPU-8086",
        isThumbnail: true,
      },
    ],
  },
  {
    id: "ASSY-001",
    pn: "ASSY-MONITOR-15",
    name: "15吋顯示器組裝品",
    customer: "1",
    factory: { id: "1", name: "深圳電子廠", code: "SZE" },
    lastPrice: 72.5,
    isAssembly: true,
    components: [
      {
        id: "comp-1",
        productId: "1",
        productName: "15吋 HD LCD面板",
        productPN: "LCD-15-HD",
        quantity: 1,
        unitPrice: 40.5,
        factoryId: "1",
        factoryName: "深圳電子廠",
      },
      {
        id: "comp-2",
        productId: "2",
        productName: "主板 PCB V1",
        productPN: "PCB-MAIN-V1",
        quantity: 1,
        unitPrice: 15.75,
        factoryId: "2",
        factoryName: "上海科技廠",
      },
      {
        id: "comp-3",
        productId: "6",
        productName: "塑膠外殼",
        productPN: "CASE-PLASTIC",
        quantity: 1,
        unitPrice: 5.25,
        factoryId: "5",
        factoryName: "蘇州電子廠",
      },
    ],
    images: [
      {
        id: "1",
        url: "/placeholder.svg?height=100&width=100",
        alt: "ASSY-MONITOR-15",
        isThumbnail: true,
      },
    ],
  },
]

interface OrderItem {
  id: string
  productId: string
  productName: string
  productPN: string
  quantity: number
  unitPrice: number
  deliveryDate: string
  factory: {
    id: string
    name: string
    code: string
  }
  isAssembly: boolean
  components?: any[]
  productImage?: {
    id: string
    url: string
    alt: string
    isThumbnail: boolean
  }
}

export function OrderForm({ productData }) {
  const [orderNumber, setOrderNumber] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [customerPO, setCustomerPO] = useState("")
  const [deliveryTerms, setDeliveryTerms] = useState("FOB Taipei")
  const [paymentTerms, setPaymentTerms] = useState("T/T 30 days after shipment")
  const [remarks, setRemarks] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [customerProducts, setCustomerProducts] = useState<typeof products>([])
  const [showComponents, setShowComponents] = useState<Record<string, boolean>>({})

  // 當客戶變更時，更新可選產品列表
  useEffect(() => {
    if (customerId) {
      const filteredProducts = products.filter((product) => product.customer === customerId)
      setCustomerProducts(filteredProducts)
      setSelectedProductId("")
    } else {
      setCustomerProducts([])
    }
  }, [customerId])

  // 生成訂單編號
  useEffect(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")

    setOrderNumber(`ORD-${year}${month}${day}-${randomNum}`)
  }, [])

  // 當產品數據變更時，更新備註
  useEffect(() => {
    let isMounted = true
    let isProcessing = false

    async function updateRemarks() {
      // 避免重複處理
      if (isProcessing) return
      isProcessing = true

      if (productData?.processes?.length > 0) {
        try {
          // 獲取翻譯後的製程描述
          const processRemarks = await formatProcessesForOrderRemarks(productData.processes)

          // 確保組件仍然掛載
          if (isMounted) {
            // 檢查備註是否已包含製程描述，避免重複添加
            if (!remarks.includes("MANUFACTURING PROCESS:")) {
              setRemarks((prevRemarks) => {
                // 如果已有備註，則添加到末尾
                if (prevRemarks) {
                  return `${prevRemarks}\n\n${processRemarks}`
                }
                return processRemarks
              })
            }
          }
        } catch (error) {
          console.error("更新製程備註失敗:", error)
        }
      }

      isProcessing = false
    }

    updateRemarks()

    return () => {
      isMounted = false
    }
  }, [productData]) // 只依賴 productData，不依賴 remarks

  const handleAddProduct = () => {
    if (!selectedProductId) return

    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return

    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productPN: product.pn,
      quantity: 1,
      unitPrice: product.lastPrice,
      deliveryDate: "",
      factory: product.factory,
      isAssembly: product.isAssembly,
      components: product.isAssembly ? product.components : undefined,
      productImage: product.images[0],
    }

    setOrderItems([...orderItems, newItem])
    setSelectedProductId("")
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

  const toggleComponentsView = (itemId: string) => {
    setShowComponents((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="orderNumber">訂單編號</Label>
          <Input id="orderNumber" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerPO">客戶PO編號</Label>
          <Input id="customerPO" value={customerPO} onChange={(e) => setCustomerPO(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer">客戶</Label>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger>
              <SelectValue placeholder="選擇客戶" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name} ({customer.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deliveryTerms">交貨條件</Label>
          <Input id="deliveryTerms" value={deliveryTerms} onChange={(e) => setDeliveryTerms(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentTerms">付款條件</Label>
          <Input id="paymentTerms" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-end gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="product">選擇產品</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId} disabled={!customerId}>
              <SelectTrigger>
                <SelectValue placeholder={customerId ? "選擇產品" : "請先選擇客戶"} />
              </SelectTrigger>
              <SelectContent>
                {customerProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.pn} - {product.name}
                    {product.isAssembly && " (組裝產品)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddProduct} disabled={!selectedProductId}>
            <Plus className="mr-2 h-4 w-4" />
            新增產品
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>產品編號</TableHead>
                <TableHead>產品名稱</TableHead>
                <TableHead>工廠</TableHead>
                <TableHead className="text-right">數量</TableHead>
                <TableHead className="text-right">單價 (USD)</TableHead>
                <TableHead className="text-right">金額 (USD)</TableHead>
                <TableHead>交期</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems.map((item) => (
                <>
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.productImage && <ProductImagePreview images={[item.productImage]} thumbnailSize="small" />}
                    </TableCell>
                    <TableCell>
                      {item.productPN}
                      {item.isAssembly && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                className="ml-2 bg-purple-500 text-white cursor-pointer"
                                onClick={() => toggleComponentsView(item.id)}
                              >
                                <Layers className="h-3 w-3 mr-1" />
                                組裝
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>點擊查看組件詳情</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>
                      {item.factory.name} ({item.factory.code})
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
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
                    <TableCell>
                      <Input
                        type="date"
                        value={item.deliveryDate}
                        onChange={(e) => handleItemChange(item.id, "deliveryDate", e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(item.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  {item.isAssembly && item.components && showComponents[item.id] && (
                    <TableRow className="bg-gray-50">
                      <TableCell colSpan={9} className="p-0">
                        <div className="p-4">
                          <h4 className="text-sm font-medium mb-2">組件清單</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>組件編號</TableHead>
                                <TableHead>組件名稱</TableHead>
                                <TableHead>工廠</TableHead>
                                <TableHead className="text-right">數量</TableHead>
                                <TableHead className="text-right">單價 (USD)</TableHead>
                                <TableHead className="text-right">金額 (USD)</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {item.components.map((component) => (
                                <TableRow key={component.id}>
                                  <TableCell>{component.productPN}</TableCell>
                                  <TableCell>{component.productName}</TableCell>
                                  <TableCell>{component.factoryName}</TableCell>
                                  <TableCell className="text-right">{component.quantity * item.quantity}</TableCell>
                                  <TableCell className="text-right">{component.unitPrice.toFixed(2)}</TableCell>
                                  <TableCell className="text-right">
                                    {(component.quantity * component.unitPrice * item.quantity).toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
              {orderItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    尚未新增產品
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
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
        <Textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={4} />
      </div>
    </div>
  )
}
