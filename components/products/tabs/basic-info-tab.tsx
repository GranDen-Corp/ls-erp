"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandList, CommandGroup, CommandInput, CommandItem, CommandEmpty } from "@/components/ui/command"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface BasicInfoTabProps {
  product: any
  handleInputChange: (field: string, value: any) => void
  customersData: any[]
  factories: any[]
  productTypes: any[]
  isReadOnly?: boolean
}

export function BasicInfoTab({
  product,
  handleInputChange,
  customersData,
  factories,
  productTypes,
  isReadOnly = false,
}: BasicInfoTabProps) {
  const [open, setOpen] = useState(false)
  const [factoryOpen, setFactoryOpen] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [factoryName, setFactoryName] = useState("")
  const supabase = createClientComponentClient()

  // 初始化時從資料庫獲取客戶和供應商名稱
  useEffect(() => {
    async function fetchNames() {
      try {
        //console.log("Fetching names for product:", product)

        // 獲取客戶名稱
        if (product.customer_id) {
          //console.log("Fetching customer name for ID:", product.customer_id)
          const { data: customerData, error: customerError } = await supabase
            .from("customers")
            .select("customer_short_name")
            .eq("customer_id", product.customer_id)
            .single()

          if (!customerError && customerData) {
            //console.log("Found customer data:", customerData)
            setCustomerName(customerData.customer_short_name)
          } else {
            console.error("Error fetching customer name:", customerError)
          }
        }

        // 獲取供應商名稱
        if (product.factory_id) {
          //console.log("Fetching factory name for ID:", product.factory_id)
          const { data: factoryData, error: factoryError } = await supabase
            .from("factories")
            .select("factory_name")
            .eq("factory_id", product.factory_id)
            .single()

          if (!factoryError && factoryData) {
            //console.log("Found factory data:", factoryData)
            setFactoryName(factoryData.factory_name)
          } else {
            console.error("Error fetching factory name:", factoryError)
          }
        }
      } catch (error) {
        //console.error("Error in fetchNames:", error)
      }
    }

    fetchNames()
  }, [product, supabase])

  // 處理客戶選擇
  const handleCustomerSelect = async (customerId: string) => {
    try {
      //console.log("Selected customer ID:", customerId)

      // 從資料庫獲取客戶名稱
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("customer_short_name")
        .eq("customer_id", customerId)
        .single()

      if (customerError) {
        console.error("Error fetching customer data:", customerError)
        return
      }

      if (customerData) {
        const customerShortName = customerData.customer_short_name
        //console.log("Found customer name:", customerShortName)

        // 更新客戶名稱狀態
        setCustomerName(customerShortName)

        // 更新產品資料
        handleInputChange("customer_id", customerId)
      }

      setOpen(false)
    } catch (error) {
      console.error("Error in handleCustomerSelect:", error)
    }
  }

  // 處理供應商選擇
  const handleFactorySelect = async (factoryId: string) => {
    try {
      //console.log("Selected factory ID:", factoryId)

      // 從資料庫獲取供應商名稱
      const { data: factoryData, error: factoryError } = await supabase
        .from("factories")
        .select("factory_name")
        .eq("factory_id", factoryId)
        .single()

      if (factoryError) {
        console.error("Error fetching factory data:", factoryError)
        return
      }

      if (factoryData) {
        const factoryName = factoryData.factory_name
        //console.log("Found factory name:", factoryName)

        // 更新供應商名稱狀態
        setFactoryName(factoryName)

        // 更新產品資料
        handleInputChange("factory_id", factoryId)
      }

      setFactoryOpen(false)
    } catch (error) {
      console.error("Error in handleFactorySelect:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* 基本信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div key="componentName" className="space-y-2">
          <Label htmlFor="componentName">零件名稱</Label>
          <Input
            id="componentName"
            value={product.componentName || ""}
            onChange={(e) => handleInputChange("componentName", e.target.value)}
            placeholder="輸入零件名稱"
            readOnly={isReadOnly}
            className={isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}
          />
        </div>

        <div key="componentNameEn" className="space-y-2">
          <Label htmlFor="componentNameEn">零件名稱 (英文)</Label>
          <Input
            id="componentNameEn"
            value={product.componentNameEn || ""}
            onChange={(e) => handleInputChange("componentNameEn", e.target.value)}
            placeholder="輸入英文零件名稱"
            readOnly={isReadOnly}
            className={isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}
          />
        </div>

        <div key="partNo" className="space-y-2">
          <Label htmlFor="partNo">Part No.</Label>
          <Input
            id="partNo"
            value={product.partNo || ""}
            onChange={(e) => handleInputChange("partNo", e.target.value)}
            placeholder="輸入PN"
            readOnly={isReadOnly}
            className={isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}
          />
        </div>

        <div key="customsCode" className="space-y-2">
          <Label htmlFor="customsCode">海關碼</Label>
          <Input
            id="customsCode"
            value={product.customsCode || ""}
            onChange={(e) => handleInputChange("customsCode", e.target.value)}
            placeholder="輸入海關碼"
            readOnly={isReadOnly}
            className={isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}
          />
        </div>

        <div key="endCustomer" className="space-y-2">
          <Label htmlFor="endCustomer">終端客戶</Label>
          <Input
            id="endCustomer"
            value={product.endCustomer || ""}
            onChange={(e) => handleInputChange("endCustomer", e.target.value)}
            placeholder="輸入終端客戶"
            readOnly={isReadOnly}
            className={isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}
          />
        </div>

        <div key="productType" className="space-y-2">
          <Label htmlFor="productType">產品類別</Label>
          <Select
            value={product.productType || ""}
            onValueChange={(value) => handleInputChange("productType", value)}
            disabled={isReadOnly}
          >
            <SelectTrigger className={isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}>
              <SelectValue>
                {product.productType || "選擇產品類別"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {productTypes.map((type, index) => {
                const uniqueKey = type.type_id ? `type-${type.type_id}` : `type-${type.type_name}-${index}`
                return (
                  <SelectItem key={uniqueKey} value={type.type_name}>
                    {type.type_name}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        <div key="classificationCode" className="space-y-2">
          <Label htmlFor="classificationCode">今湛分類碼</Label>
          <Input
            id="classificationCode"
            value={product.classificationCode || ""}
            onChange={(e) => handleInputChange("classificationCode", e.target.value)}
            placeholder="輸入今湛分類碼"
            readOnly={isReadOnly}
            className={isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}
          />
        </div>

        <div key="vehicleDrawingNo" className="space-y-2">
          <Label htmlFor="vehicleDrawingNo">車廠圖號</Label>
          <Input
            id="vehicleDrawingNo"
            value={product.vehicleDrawingNo || ""}
            onChange={(e) => handleInputChange("vehicleDrawingNo", e.target.value)}
            placeholder="輸入車廠圖號"
            readOnly={isReadOnly}
            className={isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}
          />
        </div>

        <div key="customerDrawingNo" className="space-y-2">
          <Label htmlFor="customerDrawingNo">客戶圖號</Label>
          <Input
            id="customerDrawingNo"
            value={product.customerDrawingNo || ""}
            onChange={(e) => handleInputChange("customerDrawingNo", e.target.value)}
            placeholder="輸入客戶圖號"
            readOnly={isReadOnly}
            className={isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}
          />
        </div>

        <div key="status" className="space-y-2">
          <Label htmlFor="status">狀態</Label>
          <Select
            value={product.status || ""}
            onValueChange={(value) => handleInputChange("status", value)}
            disabled={isReadOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="選擇狀態" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">活躍</SelectItem>
              <SelectItem value="inactive">非活躍</SelectItem>
              <SelectItem value="discontinued">已停產</SelectItem>
              <SelectItem value="development">開發中</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isReadOnly ? (
          <div className="space-y-2">
            <Label htmlFor="customerNameDisplay">客戶編號</Label>
            <Input
              id="customerNameDisplay"
              value={product.customer_id || ""}
              readOnly
              className="bg-gray-50 cursor-not-allowed"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="customerName">客戶編號</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  disabled={isReadOnly}
                >
                  {product.customer_id || "選擇客戶"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="搜索客戶..." />
                  <CommandList>
                    <CommandEmpty>沒有找到客戶</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                      {customersData.map((customer) => (
                        <CommandItem
                          key={`customer-${customer.customer_id || customer.id || Math.random()}`}
                          value={customer.customer_id || customer.id}
                          onSelect={() => handleCustomerSelect(customer.customer_id || customer.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              product.customer_id === (customer.customer_id || customer.id)
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {customer.customer_id || customer.id} - {customer.customer_short_name || customer.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="customerNameDisplay">客戶名稱</Label>
          <Input
            id="customerNameDisplay"
            value={customerName || ""}
            readOnly
            disabled
            className={isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}
          />
        </div>

        {isReadOnly ? (
          <div className="space-y-2">
            <Label htmlFor="factoryNameDisplay">供應商編號</Label>
            <Input
              id="factoryNameDisplay"
              value={product.factory_id || ""}
              readOnly
              className="bg-gray-50 cursor-not-allowed"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="factoryName">供應商編號</Label>
            <Popover open={factoryOpen} onOpenChange={setFactoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={factoryOpen}
                  className="w-full justify-between"
                  disabled={isReadOnly}
                >
                  {product.factory_id || "選擇供應商"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="搜索供應商..." />
                  <CommandList>
                    <CommandEmpty>沒有找到供應商</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                      {factories.map((factory) => (
                        <CommandItem
                          key={`factory-${factory.factory_id || factory.id || Math.random()}`}
                          value={factory.factory_id || factory.id}
                          onSelect={() => handleFactorySelect(factory.factory_id || factory.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              product.factory_id === (factory.factory_id || factory.id) ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {factory.factory_id || factory.id} - {factory.factory_name || factory.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="factoryNameDisplay">供應商名稱</Label>
          <Input
            id="factoryNameDisplay"
            value={factoryName || ""}
            readOnly
            disabled
            className={isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}
          />
        </div>
      </div>

      {/* 描述 */}
      <div className="space-y-2">
        <Label htmlFor="description">描述</Label>
        <Textarea
          id="description"
          value={product.description || ""}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="輸入產品描述"
          rows={4}
          readOnly={isReadOnly}
          className={isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}
        />
      </div>
    </div>
  )
}
