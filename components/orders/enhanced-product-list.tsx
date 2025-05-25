"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
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

interface EnhancedProductListProps {
  orderItems: OrderItem[]
  handleItemChange: (id: string, field: string, value: any) => void
  handleRemoveProduct: (id: string) => void
  calculateItemTotal: (item: OrderItem) => number
  openBatchManagement: (item: OrderItem) => void
  customerCurrency: string
  isProductSettingsConfirmed: boolean
  handleClearAllProducts: () => void
}

export const EnhancedProductList: React.FC<EnhancedProductListProps> = ({
  orderItems = [],
  handleItemChange,
  handleRemoveProduct,
  calculateItemTotal,
  openBatchManagement,
  customerCurrency = "USD",
  isProductSettingsConfirmed = false,
  handleClearAllProducts,
}) => {
  const [productUnits, setProductUnits] = useState<
    Array<{
      id: number
      code: string
      name: string
      value: string
    }>
  >([])

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

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity < 0) {
      toast.error("Quantity cannot be negative")
      return
    }
    handleItemChange(itemId, "quantity", quantity)
  }

  const handleUnitChange = (itemId: string, unit: string) => {
    handleItemChange(itemId, "unit", unit)
  }

  if (!orderItems || orderItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Selected Products</CardTitle>
          <CardDescription>No products selected yet. Please select products to continue.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Selected Products</CardTitle>
          <CardDescription>Adjust quantities and units for the selected products.</CardDescription>
        </div>
        {orderItems.length > 0 && !isProductSettingsConfirmed && (
          <Button variant="destructive" size="sm" onClick={handleClearAllProducts} className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Clear All Products
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-4">
            {orderItems.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Product</Label>
                  <p className="text-sm">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">{item.productPartNo}</p>
                </div>
                <div>
                  <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                  <Input
                    type="number"
                    id={`quantity-${item.id}`}
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, Number.parseInt(e.target.value) || 0)}
                    disabled={isProductSettingsConfirmed}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor={`unit-${item.id}`}>Unit</Label>
                  <Select
                    value={item.unit}
                    onValueChange={(value) => handleUnitChange(item.id, value)}
                    disabled={isProductSettingsConfirmed}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {productUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.value}>
                          {unit.code} ({unit.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <Label>Total Price</Label>
                    <p className="text-sm font-medium">
                      {item.quantity} x {getUnitDisplayName(item.unit)} x ${item.unitPrice} = $
                      {calculateItemTotal(item).toFixed(2)} {customerCurrency}
                    </p>
                  </div>
                  {!isProductSettingsConfirmed && (
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={() => openBatchManagement(item)}>
                        Manage Batches
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveProduct(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
