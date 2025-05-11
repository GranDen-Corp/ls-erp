"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, FileJson, RefreshCw, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Product } from "@/types/product"

// 模擬產品資料
const productData: Product[] = [
  {
    id: "P001",
    componentName: "15吋 HD LCD面板",
    specification: "15吋高清",
    customsCode: "8471.60.00",
    endCustomer: "台灣汽車",
    customerName: {
      id: "1",
      name: "台灣電子",
      code: "TE",
    },
    factoryName: {
      id: "1",
      name: "深圳電子廠",
      code: "SZE",
    },
    productType: "面板",
    partNo: "LCD-15-HD-001",
    classificationCode: "EL-001",
    vehicleDrawingNo: "TA-2023-001",
    customerDrawingNo: "TE-LCD-001",
    productPeriod: "2023-Q2",
    description: "15吋高清LCD顯示面板，解析度1366x768，亮度250nits，對比度1000:1",
    status: "active",
    createdDate: "2022-01-15",
    lastOrderDate: "2023-04-15",
    lastPrice: 45.0,
    currency: "USD",
    specifications: [
      { name: "尺寸", value: "15吋" },
      { name: "解析度", value: "1366x768" },
      { name: "亮度", value: "250nits" },
      { name: "對比度", value: "1000:1" },
      { name: "反應時間", value: "5ms" },
      { name: "接口", value: "LVDS" },
      { name: "工作溫度", value: "0~50°C" },
      { name: "儲存溫度", value: "-20~60°C" },
    ],
    sampleStatus: "已確認",
    sampleDate: "2022-02-10",
    originalDrawingVersion: "V1.0",
    drawingVersion: "V1.2",
    customerOriginalDrawing: {
      path: "\\\\server\\drawings\\customer\\TE-LCD-001-V1.0.pdf",
      filename: "TE-LCD-001-V1.0.pdf",
    },
    jinzhanDrawing: {
      path: "\\\\server\\drawings\\jinzhan\\JZ-LCD-001-V1.2.pdf",
      filename: "JZ-LCD-001-V1.2.pdf",
    },
    customerDrawing: {
      path: "\\\\server\\drawings\\customer\\TE-LCD-001-SPEC.pdf",
      filename: "TE-LCD-001-SPEC.pdf",
    },
    factoryDrawing: {
      path: "\\\\server\\drawings\\factory\\SZE-LCD-001-SPEC.pdf",
      filename: "SZE-LCD-001-SPEC.pdf",
    },
    images: [
      {
        id: "1",
        url: "/placeholder.svg?height=400&width=400",
        alt: "產品圖片1",
        isThumbnail: true,
      },
      {
        id: "2",
        url: "/placeholder.svg?height=400&width=400",
        alt: "產品圖片2",
        isThumbnail: false,
      },
    ],
    isAssembly: false,
    components: [],
    assemblyTime: 30,
    assemblyCostPerHour: 10,
    additionalCosts: 0,
    customerDrawingVersion: "V1.0",
    factoryDrawingVersion: "V1.0",
    complianceStatus: {
      RoHS: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      REACh: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      EUPOP: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      TSCA: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      CP65: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      PFAS: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      CMRT: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      EMRT: { status: "符合", substances: "", reason: "", document: "", filename: "" },
    },
    importantDocuments: {
      PPAP: { document: "", filename: "" },
      PSW: { document: "", filename: "" },
      capacityAnalysis: { document: "", filename: "" },
    },
    partManagement: {
      safetyPart: false,
      automotivePart: true,
      CBAMPart: false,
      clockRequirement: false,
    },
    editNotes: [
      {
        content: "初始產品資料建立",
        date: "2022/01/15",
        user: "Alun",
      },
    ],
    processData: [
      {
        id: "proc_1",
        process: "材料",
        vendor: "中鋼",
        capacity: "",
        requirements: "SAE 10B21",
        report: "材證",
      },
      {
        id: "proc_2",
        process: "成型",
        vendor: "固岩",
        capacity: "",
        requirements: "",
        report: "",
      },
    ],
    orderRequirements: "材料：SAE 10B21",
    purchaseRequirements: "材料：SAE 10B21",
    specialRequirements: [
      {
        content: "必須要用白布擦拭測試，確保磷酸鹽不會掉色",
        date: "2022/01/15",
        user: "Alun",
      },
    ],
    processNotes: [
      {
        content: "任何新增修改都須註記人員、日期與內容",
        date: "2022/01/15",
        user: "Alun",
      },
    ],
    hasMold: true,
    moldCost: "5000",
    refundableMoldQuantity: "10000",
    moldReturned: false,
    accountingNote: "模具費用已於2022年1月支付",
    qualityNotes: [],
    resumeNotes: [],
    orderHistory: [
      {
        orderNumber: "ORD-2022-001",
        quantity: 500,
      },
      {
        orderNumber: "ORD-2022-002",
        quantity: 1000,
      },
    ],
    moq: 100,
    leadTime: "30-45天",
    packagingRequirements: "單獨防靜電包裝，外箱標示產品型號和批次",
  },
  {
    id: "P002",
    componentName: "17吋 FHD LCD面板",
    specification: "17吋全高清",
    customsCode: "8471.60.00",
    endCustomer: "新竹科技",
    customerName: {
      id: "2",
      name: "新竹科技",
      code: "HT",
    },
    factoryName: {
      id: "2",
      name: "上海科技廠",
      code: "SHT",
    },
    productType: "面板",
    partNo: "LCD-17-FHD-001",
    classificationCode: "EL-002",
    vehicleDrawingNo: "",
    customerDrawingNo: "HT-LCD-001",
    productPeriod: "2023-Q3",
    description: "17吋全高清LCD顯示面板，解析度1920x1080，亮度300nits，對比度1200:1",
    status: "active",
    createdDate: "2022-03-20",
    lastOrderDate: "2023-05-10",
    lastPrice: 58.5,
    currency: "USD",
    specifications: [
      { name: "尺寸", value: "17吋" },
      { name: "解析度", value: "1920x1080" },
      { name: "亮度", value: "300nits" },
      { name: "對比度", value: "1200:1" },
      { name: "反應時間", value: "4ms" },
      { name: "接口", value: "HDMI" },
      { name: "工作溫度", value: "0~50°C" },
      { name: "儲存溫度", value: "-20~60°C" },
    ],
    sampleStatus: "已確認",
    sampleDate: "2022-04-05",
    originalDrawingVersion: "V1.0",
    drawingVersion: "V1.1",
    customerOriginalDrawing: {
      path: "\\\\server\\drawings\\customer\\HT-LCD-001-V1.0.pdf",
      filename: "HT-LCD-001-V1.0.pdf",
    },
    jinzhanDrawing: {
      path: "\\\\server\\drawings\\jinzhan\\JZ-LCD-002-V1.1.pdf",
      filename: "JZ-LCD-002-V1.1.pdf",
    },
    customerDrawing: {
      path: "\\\\server\\drawings\\customer\\HT-LCD-001-SPEC.pdf",
      filename: "HT-LCD-001-SPEC.pdf",
    },
    factoryDrawing: {
      path: "\\\\server\\drawings\\factory\\SHT-LCD-001-SPEC.pdf",
      filename: "SHT-LCD-001-SPEC.pdf",
    },
    images: [
      {
        id: "1",
        url: "/placeholder.svg?height=400&width=400",
        alt: "產品圖片1",
        isThumbnail: true,
      },
    ],
    isAssembly: false,
    components: [],
    assemblyTime: 30,
    assemblyCostPerHour: 10,
    additionalCosts: 0,
    customerDrawingVersion: "V1.0",
    factoryDrawingVersion: "V1.0",
    complianceStatus: {
      RoHS: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      REACh: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      EUPOP: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      TSCA: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      CP65: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      PFAS: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      CMRT: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      EMRT: { status: "符合", substances: "", reason: "", document: "", filename: "" },
    },
    importantDocuments: {
      PPAP: { document: "", filename: "" },
      PSW: { document: "", filename: "" },
      capacityAnalysis: { document: "", filename: "" },
    },
    partManagement: {
      safetyPart: false,
      automotivePart: false,
      CBAMPart: false,
      clockRequirement: false,
    },
    editNotes: [
      {
        content: "初始產品資料建立",
        date: "2022/03/20",
        user: "Alun",
      },
    ],
    processData: [
      {
        id: "proc_1",
        process: "材料",
        vendor: "上海材料",
        capacity: "",
        requirements: "高透光率玻璃",
        report: "材質報告",
      },
    ],
    orderRequirements: "材料：高透光率玻璃",
    purchaseRequirements: "材料：高透光率玻璃",
    specialRequirements: [],
    processNotes: [],
    hasMold: false,
    moldCost: "",
    refundableMoldQuantity: "",
    moldReturned: false,
    accountingNote: "",
    qualityNotes: [],
    resumeNotes: [],
    orderHistory: [
      {
        orderNumber: "ORD-2022-010",
        quantity: 300,
      },
    ],
    moq: 50,
    leadTime: "20-30天",
    packagingRequirements: "防靜電包裝，每10片一盒",
  },
  {
    id: "P003",
    componentName: "104 SMD電容",
    specification: "104 0805",
    customsCode: "8532.24.00",
    endCustomer: "台北工業",
    customerName: {
      id: "3",
      name: "台北工業",
      code: "TI",
    },
    factoryName: {
      id: "3",
      name: "東莞工業廠",
      code: "DGI",
    },
    productType: "電子元件",
    partNo: "CAP-104-SMD",
    classificationCode: "EC-001",
    vehicleDrawingNo: "",
    customerDrawingNo: "",
    productPeriod: "2023-Q1",
    description: "104 SMD電容，0805封裝，耐壓50V",
    status: "active",
    createdDate: "2022-02-10",
    lastOrderDate: "2023-06-05",
    lastPrice: 0.05,
    currency: "USD",
    specifications: [
      { name: "容值", value: "0.1uF" },
      { name: "封裝", value: "0805" },
      { name: "耐壓", value: "50V" },
      { name: "誤差", value: "±10%" },
      { name: "工作溫度", value: "-40~85°C" },
    ],
    sampleStatus: "已確認",
    sampleDate: "2022-02-15",
    originalDrawingVersion: "V1.0",
    drawingVersion: "V1.0",
    customerOriginalDrawing: {
      path: "",
      filename: "",
    },
    jinzhanDrawing: {
      path: "\\\\server\\drawings\\jinzhan\\JZ-CAP-001-V1.0.pdf",
      filename: "JZ-CAP-001-V1.0.pdf",
    },
    customerDrawing: {
      path: "",
      filename: "",
    },
    factoryDrawing: {
      path: "\\\\server\\drawings\\factory\\DGI-CAP-001-SPEC.pdf",
      filename: "DGI-CAP-001-SPEC.pdf",
    },
    images: [
      {
        id: "1",
        url: "/placeholder.svg?height=400&width=400",
        alt: "產品圖片1",
        isThumbnail: true,
      },
    ],
    isAssembly: false,
    components: [],
    assemblyTime: 0,
    assemblyCostPerHour: 0,
    additionalCosts: 0,
    customerDrawingVersion: "",
    factoryDrawingVersion: "V1.0",
    complianceStatus: {
      RoHS: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      REACh: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      EUPOP: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      TSCA: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      CP65: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      PFAS: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      CMRT: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      EMRT: { status: "符合", substances: "", reason: "", document: "", filename: "" },
    },
    importantDocuments: {
      PPAP: { document: "", filename: "" },
      PSW: { document: "", filename: "" },
      capacityAnalysis: { document: "", filename: "" },
    },
    partManagement: {
      safetyPart: false,
      automotivePart: false,
      CBAMPart: false,
      clockRequirement: false,
    },
    editNotes: [
      {
        content: "初始產品資料建立",
        date: "2022/02/10",
        user: "Alun",
      },
    ],
    processData: [],
    orderRequirements: "",
    purchaseRequirements: "",
    specialRequirements: [],
    processNotes: [],
    hasMold: false,
    moldCost: "",
    refundableMoldQuantity: "",
    moldReturned: false,
    accountingNote: "",
    qualityNotes: [],
    resumeNotes: [],
    orderHistory: [
      {
        orderNumber: "ORD-2022-005",
        quantity: 10000,
      },
      {
        orderNumber: "ORD-2022-015",
        quantity: 15000,
      },
      {
        orderNumber: "ORD-2023-003",
        quantity: 20000,
      },
    ],
    moq: 5000,
    leadTime: "7-14天",
    packagingRequirements: "捲帶包裝，防潮袋密封",
  },
]

export function ProductDataTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [products] = useState<Product[]>(productData)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  // 根據搜索詞過濾產品
  const filteredProducts = products.filter(
    (product) =>
      product.componentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.partNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.customerName.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setShowDetails(true)
    setActiveTab("basic")
  }

  // 渲染產品詳情對話框
  const renderProductDetails = () => {
    if (!selectedProduct) return null

    return (
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>產品詳情: {selectedProduct.componentName}</DialogTitle>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="basic">基本資訊</TabsTrigger>
              <TabsTrigger value="images">產品圖片</TabsTrigger>
              <TabsTrigger value="documents">文件與認證</TabsTrigger>
              <TabsTrigger value="process">製程資料</TabsTrigger>
              <TabsTrigger value="resume">履歷資料</TabsTrigger>
              <TabsTrigger value="commercial">商業條款</TabsTrigger>
              <TabsTrigger value="assembly">組裝資訊</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[60vh] mt-2">
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>基本資訊</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">零件名稱:</div>
                          <div>{selectedProduct.componentName}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">規格:</div>
                          <div>{selectedProduct.specification}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">海關碼:</div>
                          <div>{selectedProduct.customsCode}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">終端客戶:</div>
                          <div>{selectedProduct.endCustomer}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">客戶名稱:</div>
                          <div>
                            {selectedProduct.customerName.name} ({selectedProduct.customerName.code})
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">工廠名稱:</div>
                          <div>
                            {selectedProduct.factoryName.name} ({selectedProduct.factoryName.code})
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">產品型別:</div>
                          <div>{selectedProduct.productType}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">Part No.:</div>
                          <div>{selectedProduct.partNo}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">今湛分類碼:</div>
                          <div>{selectedProduct.classificationCode}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">車廠圖號:</div>
                          <div>{selectedProduct.vehicleDrawingNo || "-"}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">客戶圖號:</div>
                          <div>{selectedProduct.customerDrawingNo || "-"}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">產品期稿:</div>
                          <div>{selectedProduct.productPeriod}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm font-medium">狀態:</div>
                          <div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {selectedProduct.status === "active" ? "活躍" : "非活躍"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>產品規格</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedProduct.specifications.map((spec, index) => (
                          <div key={index} className="grid grid-cols-2 gap-2">
                            <div className="text-sm font-medium">{spec.name}:</div>
                            <div>{spec.value}</div>
                          </div>
                        ))}
                        {selectedProduct.specifications.length === 0 && (
                          <div className="text-sm text-gray-500">無規格資料</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>產品描述</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{selectedProduct.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="images" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>圖面資訊</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">原圖版次</h4>
                          <p>{selectedProduct.originalDrawingVersion || "-"}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">客戶原圖</h4>
                          <p className="text-sm truncate">
                            {selectedProduct.customerOriginalDrawing.filename || "無檔案"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <h4 className="font-medium mb-2">繪圖版次</h4>
                          <p>{selectedProduct.drawingVersion || "-"}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">客戶圖版次</h4>
                          <p>{selectedProduct.customerDrawingVersion || "-"}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">工廠圖版次</h4>
                          <p>{selectedProduct.factoryDrawingVersion || "-"}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="font-medium mb-2">客戶圖</h4>
                          <p className="text-sm truncate">{selectedProduct.customerDrawing.filename || "無檔案"}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">工廠圖</h4>
                          <p className="text-sm truncate">{selectedProduct.factoryDrawing.filename || "無檔案"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>產品圖片</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedProduct.images.map((image) => (
                        <div key={image.id} className="border rounded-md p-2">
                          <div className="aspect-square relative">
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt={image.alt}
                              className="object-cover w-full h-full rounded-md"
                            />
                            {image.isThumbnail && <Badge className="absolute top-2 right-2 bg-blue-500">主圖</Badge>}
                          </div>
                          <p className="text-sm mt-2 text-center">{image.alt}</p>
                        </div>
                      ))}
                      {selectedProduct.images.length === 0 && (
                        <div className="col-span-3 text-center py-8 text-gray-500">無產品圖片</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>重要文件</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">PPAP檔案資料夾:</div>
                        <div>{selectedProduct.importantDocuments.PPAP.filename || "無檔案"}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">PSW回答:</div>
                        <div>{selectedProduct.importantDocuments.PSW.filename || "無檔案"}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">產能分析表:</div>
                        <div>{selectedProduct.importantDocuments.capacityAnalysis.filename || "無檔案"}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>零件管理特性</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">安全件:</div>
                        <div>{selectedProduct.partManagement.safetyPart ? "是" : "否"}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">汽車件:</div>
                        <div>{selectedProduct.partManagement.automotivePart ? "是" : "否"}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">CBAM零件:</div>
                        <div>{selectedProduct.partManagement.CBAMPart ? "是" : "否"}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">時鐘地要求:</div>
                        <div>{selectedProduct.partManagement.clockRequirement ? "是" : "否"}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>符合性要求</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>法規</TableHead>
                          <TableHead>零件狀態</TableHead>
                          <TableHead>含有物質</TableHead>
                          <TableHead>理由</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(selectedProduct.complianceStatus).map(([regulation, status]) => (
                          <TableRow key={regulation}>
                            <TableCell>{regulation}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  status.status === "符合"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                }
                              >
                                {status.status || "-"}
                              </Badge>
                            </TableCell>
                            <TableCell>{status.substances || "-"}</TableCell>
                            <TableCell>{status.reason || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>編輯備註</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>備註內容</TableHead>
                          <TableHead>日期</TableHead>
                          <TableHead>使用者</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProduct.editNotes.map((note, index) => (
                          <TableRow key={index}>
                            <TableCell>{note.content}</TableCell>
                            <TableCell>{note.date}</TableCell>
                            <TableCell>{note.user}</TableCell>
                          </TableRow>
                        ))}
                        {selectedProduct.editNotes.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center">
                              無編輯備註
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="process" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>製程資料</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>製程</TableHead>
                          <TableHead>廠商</TableHead>
                          <TableHead>產能(SH)</TableHead>
                          <TableHead>要求</TableHead>
                          <TableHead>報告</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProduct.processData.map((proc) => (
                          <TableRow key={proc.id}>
                            <TableCell>{proc.process}</TableCell>
                            <TableCell>{proc.vendor}</TableCell>
                            <TableCell>{proc.capacity || "-"}</TableCell>
                            <TableCell>{proc.requirements || "-"}</TableCell>
                            <TableCell>{proc.report || "-"}</TableCell>
                          </TableRow>
                        ))}
                        {selectedProduct.processData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center">
                              無製程資料
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>訂單零件要求</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="whitespace-pre-wrap text-sm">
                        {selectedProduct.orderRequirements || "無訂單零件要求"}
                      </pre>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>採購單零件要求</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="whitespace-pre-wrap text-sm">
                        {selectedProduct.purchaseRequirements || "無採購單零件要求"}
                      </pre>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>特殊要求/測試</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>要求內容</TableHead>
                          <TableHead>日期</TableHead>
                          <TableHead>使用者</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProduct.specialRequirements.map((req, index) => (
                          <TableRow key={index}>
                            <TableCell>{req.content}</TableCell>
                            <TableCell>{req.date}</TableCell>
                            <TableCell>{req.user}</TableCell>
                          </TableRow>
                        ))}
                        {selectedProduct.specialRequirements.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center">
                              無特殊要求
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>編輯備註</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>備註內容</TableHead>
                          <TableHead>日期</TableHead>
                          <TableHead>使用者</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProduct.processNotes.map((note, index) => (
                          <TableRow key={index}>
                            <TableCell>{note.content}</TableCell>
                            <TableCell>{note.date}</TableCell>
                            <TableCell>{note.user}</TableCell>
                          </TableRow>
                        ))}
                        {selectedProduct.processNotes.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center">
                              無編輯備註
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resume" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>模具資訊</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">有無開模具:</div>
                        <div>{selectedProduct.hasMold ? "有" : "無"}</div>
                      </div>
                      {selectedProduct.hasMold && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm font-medium">模具費:</div>
                            <div>{selectedProduct.moldCost || "-"}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm font-medium">可退模具費數量:</div>
                            <div>{selectedProduct.refundableMoldQuantity || "-"}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm font-medium">已退模:</div>
                            <div>{selectedProduct.moldReturned ? "是" : "否"}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm font-medium">會計註記:</div>
                            <div>{selectedProduct.accountingNote || "-"}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>訂單歷史</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>訂單號碼</TableHead>
                          <TableHead className="text-right">訂單數量</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProduct.orderHistory.map((order, index) => (
                          <TableRow key={index}>
                            <TableCell>{order.orderNumber}</TableCell>
                            <TableCell className="text-right">{order.quantity}</TableCell>
                          </TableRow>
                        ))}
                        {selectedProduct.orderHistory.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center">
                              無訂單歷史
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>編輯備註</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>備註內容</TableHead>
                          <TableHead>日期</TableHead>
                          <TableHead>使用者</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProduct.resumeNotes.map((note, index) => (
                          <TableRow key={index}>
                            <TableCell>{note.content}</TableCell>
                            <TableCell>{note.date}</TableCell>
                            <TableCell>{note.user}</TableCell>
                          </TableRow>
                        ))}
                        {selectedProduct.resumeNotes.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center">
                              無編輯備註
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="commercial" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>商業條款</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">最小訂購量 (MOQ):</div>
                        <div>{selectedProduct.moq}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">交貨時間:</div>
                        <div>{selectedProduct.leadTime}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">包裝要求:</div>
                        <div>{selectedProduct.packagingRequirements}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">最後訂單日期:</div>
                        <div>{selectedProduct.lastOrderDate || "-"}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">最後價格:</div>
                        <div>
                          {selectedProduct.lastPrice ? `${selectedProduct.lastPrice} ${selectedProduct.currency}` : "-"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assembly" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>組裝資訊</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium">是否為組裝產品:</div>
                        <div>{selectedProduct.isAssembly ? "是" : "否"}</div>
                      </div>
                      {selectedProduct.isAssembly && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm font-medium">組裝時間 (分鐘):</div>
                            <div>{selectedProduct.assemblyTime}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm font-medium">組裝人工成本 (每小時):</div>
                            <div>{selectedProduct.assemblyCostPerHour}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm font-medium">額外成本:</div>
                            <div>{selectedProduct.additionalCosts}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {selectedProduct.isAssembly && (
                  <Card>
                    <CardHeader>
                      <CardTitle>組件清單</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>產品名稱</TableHead>
                            <TableHead>產品編號</TableHead>
                            <TableHead className="text-right">數量</TableHead>
                            <TableHead className="text-right">單價</TableHead>
                            <TableHead>工廠</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedProduct.components.map((component) => (
                            <TableRow key={component.id}>
                              <TableCell>{component.productName}</TableCell>
                              <TableCell>{component.productPN}</TableCell>
                              <TableCell className="text-right">{component.quantity}</TableCell>
                              <TableCell className="text-right">{component.unitPrice}</TableCell>
                              <TableCell>{component.factoryName}</TableCell>
                            </TableRow>
                          ))}
                          {selectedProduct.components.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center">
                                無組件資料
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜尋產品..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileJson className="h-4 w-4 mr-2" />
            查看原始資料
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            重新整理
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            新增產品
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>產品編號</TableHead>
              <TableHead>產品名稱</TableHead>
              <TableHead>類別</TableHead>
              <TableHead>客戶</TableHead>
              <TableHead className="text-right">價格</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  沒有找到產品
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.partNo}</TableCell>
                  <TableCell>{product.componentName}</TableCell>
                  <TableCell>{product.productType}</TableCell>
                  <TableCell>{product.customerName.name}</TableCell>
                  <TableCell className="text-right">
                    {product.lastPrice ? `${product.lastPrice} ${product.currency}` : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {product.status === "active" ? "活躍" : "非活躍"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(product)}>
                      <Eye className="h-4 w-4 mr-1" />
                      詳情
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {renderProductDetails()}
    </div>
  )
}
