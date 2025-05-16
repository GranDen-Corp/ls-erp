"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePicker } from "@/components/ui/date-picker"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ProductImagePreview } from "@/components/products/product-image-preview"
import { formatCurrency } from "@/lib/utils"
import { Check, X } from "lucide-react"

// 修改模擬工廠數據，確保使用factory_id作為主鍵
const factories = [
  { factory_id: "1", factory_name: "深圳電子廠", code: "SZE" },
  { factory_id: "2", factory_name: "上海科技廠", code: "SHT" },
  { factory_id: "3", factory_name: "東莞工業廠", code: "DGI" },
  { factory_id: "4", factory_name: "廣州製造廠", code: "GZM" },
  { factory_id: "5", factory_name: "蘇州電子廠", code: "SZE" },
]

// 修改模擬產品數據，確保使用factory_id作為工廠ID
const products = [
  {
    id: "1",
    pn: "LCD-15-HD",
    name: "15吋 HD LCD面板",
    customer: "1",
    factory: { factory_id: "1", factory_name: "深圳電子廠", code: "SZE" },
    lastPrice: 45.0,
    lastPurchasePrice: 38.5,
    currency: "USD",
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
    factory: { factory_id: "1", factory_name: "深圳電子廠", code: "SZE" },
    lastPrice: 58.5,
    lastPurchasePrice: 49.75,
    currency: "USD",
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
    factory: { factory_id: "2", factory_name: "上海科技廠", code: "SHT" },
    lastPrice: 0.05,
    lastPurchasePrice: 0.038,
    currency: "USD",
    images: [
      {
        id: "1",
        url: "/placeholder.svg?height=100&width=100",
        alt: "CAP-104-SMD",
        isThumbnail: true,
      },
    ],
  },
]

// 模擬匯率數據
const exchangeRates = {
  USD: 31.5, // 1 USD = 31.5 TWD
  CNY: 4.35, // 1 CNY = 4.35 TWD
  EUR: 34.2, // 1 EUR = 34.2 TWD
}

// 模擬客戶數據
const customers = [
  { id: "1", name: "客戶A", code: "CA" },
  { id: "2", name: "客戶B", code: "CB" },
]

interface QuickOrderFormProps {
  onValidationChange: (isValid: boolean, message: string | null, data: any | null) => void
}

export function QuickOrderForm({ onValidationChange }: QuickOrderFormProps) {
  // 訂單資訊
  const [orderNumber, setOrderNumber] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [customerPO, setCustomerPO] = useState("")
  const [orderCurrency, setOrderCurrency] = useState("USD")
  const [deliveryTerms, setDeliveryTerms] = useState("FOB Taipei")
  const [paymentTerms, setPaymentTerms] = useState("T/T 30 days after shipment")
  const [orderRemarks, setOrderRemarks] = useState("")
  const [orderDeliveryDate, setOrderDeliveryDate] = useState<Date | undefined>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  ) // 預設30天後

  // 採購單資訊
  const [poNumber, setPoNumber] = useState("")
  const [factoryId, setFactoryId] = useState("")
  const [poCurrency, setPoCurrency] = useState("USD")
  const [poDeliveryTerms, setPoDeliveryTerms] = useState("FOB Shenzhen")
  const [poPaymentTerms, setPoPaymentTerms] = useState("T/T 30 days after delivery")
  const [poRemarks, setPoRemarks] = useState("")
  const [poDeliveryDate, setPoDeliveryDate] = useState<Date | undefined>(
    new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
  ) // 預設20天後

  // 產品資訊
  const [selectedProductId, setSelectedProductId] = useState("")
  const [quantity, setQuantity] = useState(100)
  const [orderPrice, setOrderPrice] = useState(0)
  const [purchasePrice, setPurchasePrice] = useState(0)
  const [customerProducts, setCustomerProducts] = useState<typeof products>([])

  // 驗證狀態
  const [priceValid, setPriceValid] = useState(false)
  const [dateValid, setDateValid] = useState(false)
  const [validationMessage, setValidationMessage] = useState<string | null>(null)

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

  // 當產品變更時，更新價格和工廠
  useEffect(() => {
    if (selectedProductId) {
      const product = products.find((p) => p.id === selectedProductId)
      if (product) {
        setOrderPrice(product.lastPrice)
        setPurchasePrice(product.lastPurchasePrice)
        setFactoryId(product.factory.factory_id)
        setPoCurrency(product.currency)
        setOrderCurrency(product.currency)
      }
    }
  }, [selectedProductId])

  // 生成訂單編號和採購單編號
  useEffect(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")

    setOrderNumber(`ORD-${year}${month}${day}-${randomNum}`)
    setPoNumber(`PO-${year}${month}${day}-${randomNum}`)
  }, [])

  // 驗證價格和日期
  useEffect(() => {
    let priceValidation = false
    let dateValidation = false
    let message = null

    // 價格驗證
    if (orderPrice && purchasePrice) {
      // 將價格轉換為TWD進行比較
      const orderPriceTWD = orderPrice * exchangeRates[orderCurrency as keyof typeof exchangeRates]
      const purchasePriceTWD = purchasePrice * exchangeRates[poCurrency as keyof typeof exchangeRates]

      if (orderPriceTWD <= purchasePriceTWD) {
        message = "訂單價格必須大於採購價格（以TWD計算）"
      } else {
        priceValidation = true
      }
    }

    // 日期驗證
    if (orderDeliveryDate && poDeliveryDate) {
      if (orderDeliveryDate.getTime() <= poDeliveryDate.getTime()) {
        message = message || "訂單交期必須晚於採購交期"
      } else {
        dateValidation = true
      }
    }

    setPriceValid(priceValidation)
    setDateValid(dateValidation)
    setValidationMessage(message)

    // 如果兩項驗證都通過，則表單有效
    const isValid =
      priceValidation && dateValidation && !!customerId && !!factoryId && !!selectedProductId && quantity > 0

    // 準備訂單和採購單數據
    const orderData = isValid
      ? {
          order: {
            orderNumber,
            customerId,
            customerPO,
            currency: orderCurrency,
            deliveryTerms,
            paymentTerms,
            deliveryDate: orderDeliveryDate,
            remarks: orderRemarks,
            product: {
              id: selectedProductId,
              name: products.find((p) => p.id === selectedProductId)?.name,
              pn: products.find((p) => p.id === selectedProductId)?.pn,
              quantity,
              unitPrice: orderPrice,
              totalPrice: orderPrice * quantity,
            },
          },
          purchase: {
            poNumber,
            factoryId,
            factoryName: factories.find((f) => f.factory_id === factoryId)?.factory_name || "",
            currency: poCurrency,
            deliveryTerms: poDeliveryTerms,
            paymentTerms: poPaymentTerms,
            deliveryDate: poDeliveryDate,
            remarks: poRemarks,
            product: {
              id: selectedProductId,
              name: products.find((p) => p.id === selectedProductId)?.name,
              pn: products.find((p) => p.id === selectedProductId)?.pn,
              quantity,
              unitPrice: purchasePrice,
              totalPrice: purchasePrice * quantity,
            },
          },
        }
      : null

    onValidationChange(isValid, message, orderData)
  }, [
    orderPrice,
    purchasePrice,
    orderCurrency,
    poCurrency,
    orderDeliveryDate,
    poDeliveryDate,
    customerId,
    factoryId,
    selectedProductId,
    quantity,
    orderNumber,
    customerPO,
    deliveryTerms,
    paymentTerms,
    orderRemarks,
    poNumber,
    poDeliveryTerms,
    poPaymentTerms,
    poRemarks,
    onValidationChange,
  ])

  // 計算利潤
  const calculateProfit = () => {
    if (!orderPrice || !purchasePrice) return 0

    const orderPriceTWD = orderPrice * exchangeRates[orderCurrency as keyof typeof exchangeRates]
    const purchasePriceTWD = purchasePrice * exchangeRates[poCurrency as keyof typeof exchangeRates]
    return orderPriceTWD - purchasePriceTWD
  }

  const calculateProfitMargin = () => {
    if (!orderPrice) return 0

    const orderPriceTWD = orderPrice * exchangeRates[orderCurrency as keyof typeof exchangeRates]
    const purchasePriceTWD = purchasePrice * exchangeRates[poCurrency as keyof typeof exchangeRates]
    const profit = orderPriceTWD - purchasePriceTWD
    return (profit / orderPriceTWD) * 100
  }

  const profit = calculateProfit()
  const profitMargin = calculateProfitMargin()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">產品選擇</h3>
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
            <Label htmlFor="product">產品</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId} disabled={!customerId}>
              <SelectTrigger>
                <SelectValue placeholder={customerId ? "選擇產品" : "請先選擇客戶"} />
              </SelectTrigger>
              <SelectContent>
                {customerProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.pn} - {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProductId && (
            <div className="border rounded-md p-4 space-y-4">
              <div className="flex items-center space-x-4">
                <ProductImagePreview
                  images={products.find((p) => p.id === selectedProductId)?.images || []}
                  thumbnailSize="medium"
                />
                <div>
                  <h4 className="font-medium">
                    {products.find((p) => p.id === selectedProductId)?.pn} -{" "}
                    {products.find((p) => p.id === selectedProductId)?.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    工廠: {products.find((p) => p.id === selectedProductId)?.factory.factory_name}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">數量</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">價格與利潤</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderPrice">訂單單價</Label>
              <div className="flex">
                <Select value={orderCurrency} onValueChange={setOrderCurrency} disabled={!selectedProductId}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="幣別" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="CNY">CNY</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="orderPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={orderPrice}
                  onChange={(e) => setOrderPrice(Number.parseFloat(e.target.value) || 0)}
                  className="flex-1"
                  disabled={!selectedProductId}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchasePrice">採購單價</Label>
              <div className="flex">
                <Select value={poCurrency} onValueChange={setPoCurrency} disabled={!selectedProductId}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="幣別" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="CNY">CNY</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number.parseFloat(e.target.value) || 0)}
                  className="flex-1"
                  disabled={!selectedProductId}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderDeliveryDate">訂單交期</Label>
              <DatePicker date={orderDeliveryDate} setDate={setOrderDeliveryDate} disabled={!selectedProductId} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="poDeliveryDate">採購交期</Label>
              <DatePicker date={poDeliveryDate} setDate={setPoDeliveryDate} disabled={!selectedProductId} />
            </div>
          </div>

          {selectedProductId && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>訂單總金額:</span>
                    <span>
                      {formatCurrency(orderPrice * quantity, orderCurrency)} (
                      {formatCurrency(
                        orderPrice * quantity * exchangeRates[orderCurrency as keyof typeof exchangeRates],
                        "TWD",
                      )}
                      )
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>採購總金額:</span>
                    <span>
                      {formatCurrency(purchasePrice * quantity, poCurrency)} (
                      {formatCurrency(
                        purchasePrice * quantity * exchangeRates[poCurrency as keyof typeof exchangeRates],
                        "TWD",
                      )}
                      )
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>單件利潤:</span>
                    <span>{formatCurrency(profit, "TWD")}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>總利潤:</span>
                    <span>{formatCurrency(profit * quantity, "TWD")}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>利潤率:</span>
                    <span>{profitMargin.toFixed(2)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Badge variant={priceValid ? "outline" : "destructive"} className="h-6 px-2">
                {priceValid ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </Badge>
              <span className="text-sm">價格檢查</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={dateValid ? "outline" : "destructive"} className="h-6 px-2">
                {dateValid ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </Badge>
              <span className="text-sm">交期檢查</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="order">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="order">訂單詳情</TabsTrigger>
          <TabsTrigger value="purchase">採購單詳情</TabsTrigger>
        </TabsList>
        <TabsContent value="order" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderNumber">訂單編號</Label>
              <Input id="orderNumber" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPO">客戶PO編號</Label>
              <Input id="customerPO" value={customerPO} onChange={(e) => setCustomerPO(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryTerms">交貨條件</Label>
              <Input id="deliveryTerms" value={deliveryTerms} onChange={(e) => setDeliveryTerms(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">付款條件</Label>
              <Input id="paymentTerms" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderRemarks">備註</Label>
            <Textarea
              id="orderRemarks"
              value={orderRemarks}
              onChange={(e) => setOrderRemarks(e.target.value)}
              rows={4}
            />
          </div>
        </TabsContent>
        <TabsContent value="purchase" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="poNumber">採購單編號</Label>
              <Input id="poNumber" value={poNumber} onChange={(e) => setPoNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="factory">工廠</Label>
              <Select value={factoryId} onValueChange={setFactoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇工廠" />
                </SelectTrigger>
                <SelectContent>
                  {factories.map((factory) => (
                    <SelectItem key={factory.factory_id} value={factory.factory_id}>
                      {factory.factory_name} ({factory.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="poDeliveryTerms">交貨條件</Label>
              <Input
                id="poDeliveryTerms"
                value={poDeliveryTerms}
                onChange={(e) => setPoDeliveryTerms(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="poPaymentTerms">付款條件</Label>
              <Input id="poPaymentTerms" value={poPaymentTerms} onChange={(e) => setPoPaymentTerms(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="poRemarks">備註</Label>
            <Textarea id="poRemarks" value={poRemarks} onChange={(e) => setPoRemarks(e.target.value)} rows={4} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
