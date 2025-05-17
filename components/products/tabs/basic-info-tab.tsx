"use client"

import type React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BasicInfoTabProps {
  product: any
  handleInputChange: (field: string, value: any) => void
  customersData: any[]
  factories: any[]
  productTypes: any[]
  setProduct: React.Dispatch<React.SetStateAction<any>>
}

export function BasicInfoTab({
  product,
  handleInputChange,
  customersData,
  factories,
  productTypes,
  setProduct,
}: BasicInfoTabProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-6">
        {/* Left column fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="componentName" className="flex items-center">
                <span className="text-red-500 mr-1">*</span>零件名稱
              </Label>
              <Input
                id="componentName"
                value={product.componentName || ""}
                onChange={(e) => handleInputChange("componentName", e.target.value)}
                placeholder="輸入零件名稱"
              />
            </div>

            {/* New English component name field */}
            <div className="space-y-2">
              <Label htmlFor="componentNameEn" className="flex items-center">
                <span className="text-red-500 mr-1">*</span>零件名稱 (英文)
              </Label>
              <Input
                id="componentNameEn"
                value={product.componentNameEn || ""}
                onChange={(e) => handleInputChange("componentNameEn", e.target.value)}
                placeholder="Enter component name in English"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partNo" className="flex items-center">
                <span className="text-red-500 mr-1">*</span>Part No.
              </Label>
              <Input
                id="partNo"
                value={product.partNo || ""}
                onChange={(e) => handleInputChange("partNo", e.target.value)}
                placeholder="輸入產品料號"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customsCode">海關碼</Label>
              <Input
                id="customsCode"
                value={product.customsCode || ""}
                onChange={(e) => handleInputChange("customsCode", e.target.value)}
                placeholder="輸入海關編碼"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endCustomer">終端客戶</Label>
              <Input
                id="endCustomer"
                value={product.endCustomer || ""}
                onChange={(e) => handleInputChange("endCustomer", e.target.value)}
                placeholder="輸入終端客戶"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerCode" className="flex items-center">
                <span className="text-red-500 mr-1">*</span>客戶編號
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={product.customerName?.id || ""}
                  onValueChange={(value) => {
                    const selectedCustomer = customersData.find((c) => c.id === value)
                    if (selectedCustomer) {
                      setProduct((prev: any) => ({
                        ...prev,
                        customerName: {
                          id: selectedCustomer.id,
                          name: selectedCustomer.name,
                          code: selectedCustomer.code,
                        },
                      }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇客戶編號" />
                  </SelectTrigger>
                  <SelectContent>
                    {customersData.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>{" "}
                <Input value={product.customerName?.name || ""} readOnly placeholder="客戶名稱將自動顯示" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="factoryCode">供應商編號</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={product.factoryName?.id || ""}
                  onValueChange={(value) => {
                    const selectedFactory = factories.find((f) => f.id === value)
                    if (selectedFactory) {
                      setProduct((prev: any) => ({
                        ...prev,
                        factoryName: {
                          id: selectedFactory.id,
                          name: selectedFactory.name,
                          code: selectedFactory.code,
                        },
                      }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇供應商編號" />
                  </SelectTrigger>
                  <SelectContent>
                    {factories.map((factory) => (
                      <SelectItem key={factory.id} value={factory.id}>
                        {factory.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input value={product.factoryName?.name || ""} readOnly placeholder="供應商名稱將自動顯示" />
              </div>
            </div>
          </div>
        </div>

        {/* Right column fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specification">規格</Label>
              <Input
                id="specification"
                value={product.specification || ""}
                onChange={(e) => handleInputChange("specification", e.target.value)}
                placeholder="輸入產品規格"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productType">產品類別</Label>
              <Select
                value={product.productType || ""}
                onValueChange={(value) => handleInputChange("productType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇產品類別" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type: any) => (
                    <SelectItem key={type.id} value={type.type_code}>
                      {type.type_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="classificationCode">今湛分類碼</Label>
              <Input
                id="classificationCode"
                value={product.classificationCode || ""}
                onChange={(e) => handleInputChange("classificationCode", e.target.value)}
                placeholder="輸入分類代碼"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleDrawingNo">車廠圖號</Label>
              <Input
                id="vehicleDrawingNo"
                value={product.vehicleDrawingNo || ""}
                onChange={(e) => handleInputChange("vehicleDrawingNo", e.target.value)}
                placeholder="輸入車廠圖號"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerDrawingNo">客戶圖號</Label>
              <Input
                id="customerDrawingNo"
                value={product.customerDrawingNo || ""}
                onChange={(e) => handleInputChange("customerDrawingNo", e.target.value)}
                placeholder="輸入客戶圖號"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productPeriod">產品別稱</Label>
              <Input
                id="productPeriod"
                value={product.productPeriod || ""}
                onChange={(e) => handleInputChange("productPeriod", e.target.value)}
                placeholder="輸入產品期稿"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product description */}
      <div className="space-y-2 pt-4">
        <Label htmlFor="description">產品描述</Label>
        <Textarea
          id="description"
          value={product.description || ""}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={3}
          placeholder="輸入產品詳細描述"
          className="w-full min-h-[80px]"
        />
      </div>
    </div>
  )
}
