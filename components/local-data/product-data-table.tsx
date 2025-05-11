"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, FileText, Download, Filter } from "lucide-react"
import { supabaseClient } from "@/lib/supabase-client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// 定義產品類型
type Product = {
  customer_id: string
  part_no: string
  factory_id: string
  component_name: string
  specification: string
  customs_code: string
  end_customer: string
  product_type: string
  classification_code: string
  vehicle_drawing_no: string
  customer_drawing_no: string
  product_period: string
  description: string
  status: string
  created_date: string
  last_order_date: string
  last_price: number
  currency: string
  material: string
  dimensions: string
  weight: string
  surface_finish: string
  hardness: string
  tensile_strength: string
  tolerances: string
  original_drawing_version: string
  drawing_version: string
  customer_drawing_version: string
  factory_drawing_version: string
  manufacturing_process: string
  inspection_method: string
  production_capacity: string
  setup_time: string
  cycle_time: string
  certifications: string
  quality_standards: string
  regulatory_compliance: string
  environmental_standards: string
  safety_standards: string
  moq: number
  lead_time: string
  packaging_type: string
  customizable: boolean
  customer?: {
    customer_short_name: string
  }
  factory?: {
    factory_name: string
  }
}

export function ProductDataTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  // 匯出相關狀態
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [selectedExportOption, setSelectedExportOption] = useState<string>("basic")
  const [exportFormat, setExportFormat] = useState<string>("csv")

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true)
        setError(null)

        // 從Supabase獲取產品資料，並關聯客戶和供應商資料
        const { data, error } = await supabaseClient.from("products").select(`
            *,
            customer:customers(customer_short_name),
            factory:suppliers(factory_name)
          `)

        if (error) {
          throw new Error(`獲取產品資料時出錯: ${error.message}`)
        }

        setProducts(data || [])
      } catch (err) {
        console.error("獲取產品資料時出錯:", err)
        setError(err instanceof Error ? err.message : "獲取產品資料時出錯")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // 根據搜索詞過濾產品
  const filteredProducts = products.filter(
    (product) =>
      product.part_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.component_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.specification?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.customer?.customer_short_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.factory?.factory_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setIsDialogOpen(true)
  }

  // 處理匯出功能
  const handleExport = () => {
    // 匯出功能實現
    console.log("匯出格式:", exportFormat)
    console.log("匯出選項:", selectedExportOption)
    setIsExportDialogOpen(false)
  }

  // 渲染產品詳細資訊對話框
  const renderProductDetailsDialog = () => {
    if (!selectedProduct) return null

    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedProduct.component_name} ({selectedProduct.part_no})
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="details">基本資訊</TabsTrigger>
              <TabsTrigger value="specs">技術規格</TabsTrigger>
              <TabsTrigger value="process">製程資訊</TabsTrigger>
              <TabsTrigger value="compliance">認證與合規</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">料號</p>
                  <p>{selectedProduct.part_no}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">產品名稱</p>
                  <p>{selectedProduct.component_name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">規格</p>
                  <p>{selectedProduct.specification}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">產品類型</p>
                  <p>{selectedProduct.product_type}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">客戶</p>
                  <p>{selectedProduct.customer?.customer_short_name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">供應商</p>
                  <p>{selectedProduct.factory?.factory_name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">海關碼</p>
                  <p>{selectedProduct.customs_code}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">終端客戶</p>
                  <p>{selectedProduct.end_customer}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">分類碼</p>
                  <p>{selectedProduct.classification_code}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">車廠圖號</p>
                  <p>{selectedProduct.vehicle_drawing_no}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">客戶圖號</p>
                  <p>{selectedProduct.customer_drawing_no}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">產品期稿</p>
                  <p>{selectedProduct.product_period}</p>
                </div>
                <div className="space-y-2 col-span-2">
                  <p className="text-sm font-medium">產品描述</p>
                  <p>{selectedProduct.description}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">狀態</p>
                  <Badge variant={selectedProduct.status === "活躍" ? "default" : "secondary"}>
                    {selectedProduct.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">最小訂購量</p>
                  <p>{selectedProduct.moq}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">交貨時間</p>
                  <p>{selectedProduct.lead_time}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">包裝類型</p>
                  <p>{selectedProduct.packaging_type}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">可定制</p>
                  <p>{selectedProduct.customizable ? "是" : "否"}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">材質</p>
                  <p>{selectedProduct.material}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">尺寸</p>
                  <p>{selectedProduct.dimensions}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">重量</p>
                  <p>{selectedProduct.weight}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">表面處理</p>
                  <p>{selectedProduct.surface_finish}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">硬度</p>
                  <p>{selectedProduct.hardness}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">抗拉強度</p>
                  <p>{selectedProduct.tensile_strength}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">公差</p>
                  <p>{selectedProduct.tolerances}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">原圖版次</p>
                  <p>{selectedProduct.original_drawing_version}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">圖面版次</p>
                  <p>{selectedProduct.drawing_version}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">客戶圖版次</p>
                  <p>{selectedProduct.customer_drawing_version}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">工廠圖版次</p>
                  <p>{selectedProduct.factory_drawing_version}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="process" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">製造工藝</p>
                  <p>{selectedProduct.manufacturing_process}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">檢驗方法</p>
                  <p>{selectedProduct.inspection_method}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">生產能力</p>
                  <p>{selectedProduct.production_capacity}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">設置時間</p>
                  <p>{selectedProduct.setup_time}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">循環時間</p>
                  <p>{selectedProduct.cycle_time}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">認證</p>
                  <p>{selectedProduct.certifications}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">品質標準</p>
                  <p>{selectedProduct.quality_standards}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">法規合規</p>
                  <p>{selectedProduct.regulatory_compliance}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">環境標準</p>
                  <p>{selectedProduct.environmental_standards}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">安全標準</p>
                  <p>{selectedProduct.safety_standards}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    )
  }

  // 渲染匯出對話框
  const renderExportDialog = () => {
    return (
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>匯出產品資料</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">選擇匯出格式</h4>
              <div className="flex space-x-2">
                <Button
                  variant={exportFormat === "csv" ? "default" : "outline"}
                  onClick={() => setExportFormat("csv")}
                  size="sm"
                >
                  CSV
                </Button>
                <Button
                  variant={exportFormat === "excel" ? "default" : "outline"}
                  onClick={() => setExportFormat("excel")}
                  size="sm"
                >
                  Excel
                </Button>
                <Button
                  variant={exportFormat === "json" ? "default" : "outline"}
                  onClick={() => setExportFormat("json")}
                  size="sm"
                >
                  JSON
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">選擇匯出內容</h4>
              <div className="flex flex-col space-y-2">
                <Button
                  variant={selectedExportOption === "basic" ? "default" : "outline"}
                  onClick={() => setSelectedExportOption("basic")}
                  size="sm"
                  className="justify-start"
                >
                  基本資訊
                </Button>
                <Button
                  variant={selectedExportOption === "detailed" ? "default" : "outline"}
                  onClick={() => setSelectedExportOption("detailed")}
                  size="sm"
                  className="justify-start"
                >
                  詳細資訊
                </Button>
                <Button
                  variant={selectedExportOption === "technical" ? "default" : "outline"}
                  onClick={() => setSelectedExportOption("technical")}
                  size="sm"
                  className="justify-start"
                >
                  技術規格
                </Button>
                <Button
                  variant={selectedExportOption === "all" ? "default" : "outline"}
                  onClick={() => setSelectedExportOption("all")}
                  size="sm"
                  className="justify-start"
                >
                  全部資料
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleExport}>匯出</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>產品資料表</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <p>載入中...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>產品資料表</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <p className="text-red-500">錯誤: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>產品資料表</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜尋產品..."
              className="w-[200px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>全部產品</DropdownMenuItem>
              <DropdownMenuItem>活躍產品</DropdownMenuItem>
              <DropdownMenuItem>停產產品</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="icon" onClick={() => setIsExportDialogOpen(true)}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>料號</TableHead>
                <TableHead>產品名稱</TableHead>
                <TableHead>客戶</TableHead>
                <TableHead>供應商</TableHead>
                <TableHead>規格</TableHead>
                <TableHead>材質</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    沒有找到符合條件的產品
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={`${product.customer_id}-${product.part_no}-${product.factory_id}`}>
                    <TableCell className="font-medium">{product.part_no}</TableCell>
                    <TableCell>{product.component_name}</TableCell>
                    <TableCell>{product.customer?.customer_short_name}</TableCell>
                    <TableCell>{product.factory?.factory_name}</TableCell>
                    <TableCell>{product.specification}</TableCell>
                    <TableCell>{product.material}</TableCell>
                    <TableCell>
                      <Badge variant={product.status === "活躍" ? "default" : "secondary"}>{product.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(product)}>
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">共 {filteredProducts.length} 筆產品資料</div>
      </CardFooter>

      {renderProductDetailsDialog()}
      {renderExportDialog()}
    </Card>
  )
}
