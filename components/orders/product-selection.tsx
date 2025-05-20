"use client"
import { Search, X, Plus, Loader2, CheckCircle, Layers, Package, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { ProductCombobox } from "@/components/ui/product-combobox"
import type { Product } from "@/hooks/use-order-form"

interface ProductSelectionProps {
  regularProducts: Product[]
  assemblyProducts: Product[]
  selectedCustomerId: string
  isProductSettingsConfirmed: boolean
  productSelectionTab: string
  setProductSelectionTab: (tab: string) => void
  productSearchTerm: string
  setProductSearchTerm: (term: string) => void
  selectedProducts: string[]
  selectedProductPartNo: string
  setSelectedProductPartNo: (partNo: string) => void
  customerCurrency: string
  isProductAdded: (partNo: string) => boolean
  isProductSelected: (partNo: string) => boolean
  toggleProductSelection: (partNo: string) => void
  clearAllSelections: () => void
  handleAddSelectedProducts: () => void
  handleAddAssemblyProduct: () => void
  loadingSelectedProducts: boolean
  getProductPartNo: (product: Product) => string
  getProductName: (product: Product) => string
  isProductAssembly: (product: Product) => boolean
  parseSubPartNo: (product: Product) => any
}

export function ProductSelection({
  regularProducts,
  assemblyProducts,
  selectedCustomerId,
  isProductSettingsConfirmed,
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
}: ProductSelectionProps) {
  // 過濾搜索結果
  const filteredRegularProducts = regularProducts.filter((product) => {
    if (!productSearchTerm) return true

    const partNo = getProductPartNo(product).toLowerCase()
    const name = getProductName(product).toLowerCase()
    const searchTerm = productSearchTerm.toLowerCase()

    return partNo.includes(searchTerm) || name.includes(searchTerm)
  })

  return (
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
                      {parseSubPartNo(product) && (
                        <div className="text-xs text-muted-foreground mt-1">
                          部件:{" "}
                          {parseSubPartNo(product)
                            .map((part: any) => `${part.productPN} (${part.productName})`)
                            .join("; ")}
                        </div>
                      )}
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
  )
}
