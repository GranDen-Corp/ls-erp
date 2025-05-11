"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { FileText, Plus, X } from "lucide-react"
import type { ProductComponent } from "@/types/assembly-product"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { saveProduct } from "@/app/actions/product-actions"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

// 自定義表格樣式組件
const TableContainer = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`border rounded-md overflow-hidden ${className}`}>{children}</div>
)

const TableHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-gray-100 p-3 font-medium border-b ${className}`}>{children}</div>
)

const TableRow = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`grid grid-cols-1 ${className}`}>{children}</div>
)

const TableCell = ({
  children,
  label,
  highlight = false,
  className = "",
}: {
  children: React.ReactNode
  label?: string
  highlight?: boolean
  className?: string
}) => (
  <div className="grid grid-cols-3 border-b">
    {label && <div className="bg-gray-100 p-3 border-r font-medium">{label}</div>}
    <div className={`${label ? "col-span-2" : "col-span-3"} p-2 ${highlight ? "bg-yellow-50" : ""} ${className}`}>
      {children}
    </div>
  </div>
)

const TableGrid = ({
  children,
  cols = 1,
  className = "",
}: { children: React.ReactNode; cols?: number; className?: string }) => (
  <div className={`grid grid-cols-${cols} ${className}`}>{children}</div>
)

interface ProductFormProps {
  productId?: string
  isClone?: boolean
  onSubmit: (data: any) => void
}

// 自定義欄位類型
interface CustomField {
  id: string
  name: string
  value: string
  type: "text" | "file" | "checkbox"
}

// 文件記錄類型
interface DocumentRecord {
  id: string
  name: string
  document: string
  filename: string
}

// 零件特性記錄類型
interface PartFeatureRecord {
  id: string
  name: string
  status: boolean
}

// 符合性記錄類型
interface ComplianceRecord {
  id: string
  regulation: string
  status: string
  substances: string
  reason: string
  document: string
  filename: string
}

// 製程資料記錄類型
interface ProcessRecord {
  id: string
  process: string
  vendor: string
  capacity: string
  requirements: string
  report: string
}

// This is the component implementation
function ProductFormComponent({ productId, isClone = false, onSubmit }: ProductFormProps) {
  // All the existing component code...
  const initialProduct = productId
    ? {
        id: productId,
        componentName: isClone ? `${productId}-COPY` : "LCD-15-HD",
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
        // 新增符合性要求相關欄位
        complianceStatus: {
          RoHS: { status: "", substances: "", reason: "", document: "" },
          REACh: { status: "", substances: "", reason: "", document: "" },
          EUPOP: { status: "", substances: "", reason: "", document: "" },
          TSCA: { status: "", substances: "", reason: "", document: "" },
          CP65: { status: "", substances: "", reason: "", document: "" },
          PFAS: { status: "", substances: "", reason: "", document: "" },
          CMRT: { status: "", substances: "", reason: "", document: "" },
          EMRT: { status: "", substances: "", reason: "", document: "" },
        },
        // 新增重要文件相關欄位
        importantDocuments: {
          PPAP: { document: "", filename: "" },
          PSW: { document: "", filename: "" },
          capacityAnalysis: { document: "", filename: "" },
        },
        // 新增零件管理特性相關欄位
        partManagement: {
          safetyPart: false,
          automotivePart: false,
          CBAMPart: false,
          clockRequirement: false,
        },
        // 新增編輯備註相關欄位
        editNotes: [
          {
            content: "任何新增修改都須註記人員、日期與內容",
            date: "2024/1/1",
            user: "Alun",
          },
        ],
        // 新增製程資料相關欄位
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
          {
            id: "proc_3",
            process: "搓牙",
            vendor: "固岩",
            capacity: "",
            requirements: "",
            report: "",
          },
          {
            id: "proc_4",
            process: "熱處理",
            vendor: "力大",
            capacity: "",
            requirements: "硬度HRC 28-32，拉力800Mpa，降伏64，硬度，拉力",
            report: "",
          },
          {
            id: "proc_5",
            process: "電鍍",
            vendor: "恒吉興",
            capacity: "",
            requirements: "三價鋅SUM MIN，鹽測12/48",
            report: "膜厚，鹽測，除氫",
          },
          {
            id: "proc_6",
            process: "篩選",
            vendor: "聖鼎",
            capacity: "",
            requirements: "50 PPM：泡料，總長",
            report: "篩選報告",
          },
        ],
        // 添加新欄位
        orderRequirements: "",
        purchaseRequirements: "",
        moq: 100,
        leadTime: "30-45天",
        packagingRequirements: "單獨防靜電包裝，外箱標示產品型號和批次",
        specialRequirements: [
          {
            id: "req_1",
            content: "必須要用白布擦拭測試，確保磷酸鹽不會掉色",
            date: "2024/1/1",
            user: "Alun",
          },
        ],
        processNotes: [
          {
            content: "任何新增修改都須註記人員、日期與內容",
            date: "2024/1/1",
            user: "Alun",
          },
        ],
        // 在 initialProduct 中添加這些欄位
        hasMold: false,
        moldCost: "",
        refundableMoldQuantity: "",
        moldReturned: false,
        accountingNote: "",
        qualityNotes: [
          {
            id: "comp-2023-0001",
            title: "面板亮度不足",
            customer: "台灣電子",
            status: "resolved",
            date: "2023-05-10",
          },
        ],
        resumeNotes: [
          {
            content: "更新模具資訊",
            date: "2024/1/15",
            user: "Alun",
          },
        ],
        orderHistory: [],
      }
    : {
        componentName: "",
        specification: "",
        customsCode: "",
        endCustomer: "",
        customerName: { id: "", name: "", code: "" },
        factoryName: { id: "", name: "", code: "" },
        productType: "",
        partNo: "",
        classificationCode: "",
        vehicleDrawingNo: "",
        customerDrawingNo: "",
        productPeriod: "",
        description: "",
        status: "active",
        specifications: [],
        originalDrawingVersion: "",
        drawingVersion: "",
        customerOriginalDrawing: {
          path: "",
          filename: "",
        },
        jinzhanDrawing: {
          path: "",
          filename: "",
        },
        customerDrawing: {
          path: "",
          filename: "",
        },
        factoryDrawing: {
          path: "",
          filename: "",
        },
        images: [],
        isAssembly: false,
        components: [],
        assemblyTime: 30,
        assemblyCostPerHour: 10,
        additionalCosts: 0,
        customerDrawingVersion: "",
        factoryDrawingVersion: "",
        // 新增符合性要求相關欄位
        complianceStatus: {
          RoHS: { status: "", substances: "", reason: "", document: "" },
          REACh: { status: "", substances: "", reason: "", document: "" },
          EUPOP: { status: "", substances: "", reason: "", document: "" },
          TSCA: { status: "", substances: "", reason: "", document: "" },
          CP65: { status: "", substances: "", reason: "", document: "" },
          PFAS: { status: "", substances: "", reason: "", document: "" },
          CMRT: { status: "", substances: "", reason: "", document: "" },
          EMRT: { status: "", substances: "", reason: "", document: "" },
        },
        // 新增重要文件相關欄位
        importantDocuments: {
          PPAP: { document: "", filename: "" },
          PSW: { document: "", filename: "" },
          capacityAnalysis: { document: "", filename: "" },
        },
        // 新增零件管理特性相關欄位
        partManagement: {
          safetyPart: false,
          automotivePart: false,
          CBAMPart: false,
          clockRequirement: false,
        },
        // 新增編輯備註相關欄位
        editNotes: [],
        // 新增製程資料相關欄位
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
          {
            id: "proc_3",
            process: "搓牙",
            vendor: "固岩",
            capacity: "",
            requirements: "",
            report: "",
          },
          {
            id: "proc_4",
            process: "熱處理",
            vendor: "力大",
            capacity: "",
            requirements: "硬度HRC 28-32，拉力800Mpa，降伏64，硬度，拉力",
            report: "",
          },
          {
            id: "proc_5",
            process: "電鍍",
            vendor: "恒吉興",
            capacity: "",
            requirements: "三價鋅SUM MIN，鹽測12/48",
            report: "膜厚，鹽測，除氫",
          },
          {
            id: "proc_6",
            process: "篩選",
            vendor: "聖鼎",
            capacity: "",
            requirements: "50 PPM：泡料，總長",
            report: "篩選報告",
          },
        ],
        // 添加新欄位
        orderRequirements: "",
        purchaseRequirements: "",
        moq: 0,
        leadTime: "",
        packagingRequirements: "",
        specialRequirements: [],
        processNotes: [
          {
            content: "任何新增修改都須註記人員、日期與內容",
            date: "2024/1/1",
            user: "Alun",
          },
        ],
        // 在 initialProduct 中添加這些欄位
        hasMold: false,
        moldCost: "",
        refundableMoldQuantity: "",
        moldReturned: false,
        accountingNote: "",
        qualityNotes: [],
        resumeNotes: [],
        orderHistory: [],
      }

  // 添加在 useState 聲明後
  const [product, setProduct] = useState(initialProduct)
  // 添加這段代碼
  useEffect(() => {
    // 初始化訂單和採購單要求
    const { orderReqs, purchaseReqs } = generateRequirements(initialProduct.processData)
    setProduct((prev) => ({
      ...prev,
      orderRequirements: orderReqs,
      purchaseRequirements: purchaseReqs,
    }))
  }, [])

  const [newSpec, setNewSpec] = useState({ name: "", value: "" })
  const [activeTab, setActiveTab] = useState("basic")
  const [dragOver, setDragOver] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState("")
  const [previewFile, setPreviewFile] = useState<{ path: string; filename: string; type: string } | null>(null)
  const [newNote, setNewNote] = useState({ content: "", date: "", user: "" })
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
  const [newProcess, setNewProcess] = useState<ProcessRecord>({
    id: "",
    process: "",
    vendor: "",
    capacity: "",
    requirements: "",
    report: "",
  })
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false)
  const [newSpecialReq, setNewSpecialReq] = useState({ content: "", date: "", user: "" })
  const [isSpecialReqDialogOpen, setIsSpecialReqDialogOpen] = useState(false)
  const [newProcessNote, setNewProcessNote] = useState({ content: "", date: "", user: "" })
  const [isProcessNoteDialogOpen, setIsProcessNoteDialogOpen] = useState(false)
  const [isOrderHistoryDialogOpen, setIsOrderHistoryDialogOpen] = useState(false)
  const [newOrderHistory, setNewOrderHistory] = useState({ orderNumber: "", quantity: 0 })
  const [newResumeNote, setNewResumeNote] = useState({ content: "", date: "", user: "" })
  const [isResumeNoteDialogOpen, setIsResumeNoteDialogOpen] = useState(false)

  // 自定義欄位狀態
  const [customImportantDocuments, setCustomImportantDocuments] = useState<CustomField[]>([])
  const [customPartManagement, setCustomPartManagement] = useState<CustomField[]>([])
  const [customCompliance, setCustomCompliance] = useState<CustomField[]>([])
  const [newCustomField, setNewCustomField] = useState({ name: "", type: "text" as const })
  const [activeDialog, setActiveDialog] = useState<string | null>(null)

  // 文件記錄狀態
  const [customDocuments, setCustomDocuments] = useState<DocumentRecord[]>([])
  // 零件特性記錄狀態
  const [customPartFeatures, setCustomPartFeatures] = useState<PartFeatureRecord[]>([])
  // 符合性記錄狀態
  const [customCompliances, setCustomCompliances] = useState<ComplianceRecord[]>([])
  // 新文件名稱輸入
  const [newDocumentName, setNewDocumentName] = useState("")
  // 新零件特性名稱輸入
  const [newPartFeatureName, setNewPartFeatureName] = useState("")
  // 新符合性法規名稱輸入
  const [newComplianceName, setNewComplianceName] = useState("")

  // 模擬客戶和工廠數據
  const customers = [
    { id: "1", name: "台灣電子", code: "TE" },
    { id: "2", name: "新竹科技", code: "HT" },
    { id: "3", name: "台北工業", code: "TI" },
    { id: "4", name: "高雄製造", code: "KM" },
    { id: "5", name: "台中電子", code: "TC" },
  ]

  const factories = [
    { id: "1", name: "深圳電子廠", code: "SZE" },
    { id: "2", name: "上海科技廠", code: "SHT" },
    { id: "3", name: "東莞工業廠", code: "DGI" },
    { id: "4", name: "廣州製造廠", code: "GZM" },
    { id: "5", name: "蘇州電子廠", code: "SZE" },
  ]

  const productTypes = ["面板", "電子元件", "IC晶片", "PCB", "連接器", "組裝產品", "其他"]

  // 模擬可用的組件產品
  const availableComponents = [
    { id: "1", pn: "LCD-15-HD", name: "15吋 HD LCD面板", factoryId: "1", factoryName: "深圳電子廠", unitPrice: 40.5 },
    { id: "2", pn: "PCB-MAIN-V1", name: "主板 PCB V1", factoryId: "2", factoryName: "上海科技廠", unitPrice: 15.75 },
    { id: "3", pn: "CAP-104-SMD", name: "104 SMD電容", factoryId: "3", factoryName: "東莞工業廠", unitPrice: 0.05 },
    { id: "4", pn: "RES-103-SMD", name: "103 SMD電阻", factoryId: "3", factoryName: "東莞工業廠", unitPrice: 0.03 },
    { id: "5", pn: "IC-CPU-8086", name: "8086 CPU晶片", factoryId: "4", factoryName: "廣州製造廠", unitPrice: 12.5 },
    { id: "6", pn: "CASE-PLASTIC", name: "塑膠外殼", factoryId: "5", factoryName: "蘇州電子廠", unitPrice: 5.25 },
  ]

  const handleInputChange = (field: string, value: any) => {
    setProduct((prev) => ({ ...prev, [field]: value }))
  }

  const handleCustomerChange = (customerId: string) => {
    const selectedCustomer = customers.find((c) => c.id === customerId)
    if (selectedCustomer) {
      setProduct((prev) => ({
        ...prev,
        customerName: selectedCustomer,
      }))
    }
  }

  const handleFactoryChange = (factoryId: string) => {
    const selectedFactory = factories.find((f) => f.id === factoryId)
    if (selectedFactory) {
      setProduct((prev) => ({
        ...prev,
        factoryName: selectedFactory,
      }))
    }
  }

  const handleAddSpecification = () => {
    if (newSpec.name && newSpec.value) {
      setProduct((prev) => ({
        ...prev,
        specifications: [...prev.specifications, { ...newSpec }],
      }))
      setNewSpec({ name: "", value: "" })
    }
  }

  const handleRemoveSpecification = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }))
  }

  // 處理添加組件
  const handleAddComponent = () => {
    if (!selectedComponent) return

    const component = availableComponents.find((c) => c.id === selectedComponent)
    if (!component) return

    const newComponent: ProductComponent = {
      id: `comp-${Date.now()}`,
      productId: component.id,
      productName: component.name,
      productPN: component.pn,
      quantity: 1,
      unitPrice: component.unitPrice,
      factoryId: component.factoryId,
      factoryName: component.factoryName,
    }

    setProduct((prev) => ({
      ...prev,
      components: [...prev.components, newComponent],
    }))
    setSelectedComponent("")
  }

  // 處理移除組件
  const handleRemoveComponent = (componentId: string) => {
    setProduct((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.id !== componentId),
    }))
  }

  // 處理組件數量變更
  const handleComponentQuantityChange = (componentId: string, quantity: number) => {
    setProduct((prev) => ({
      ...prev,
      components: prev.components.map((c) => {
        if (c.id === componentId) {
          return { ...c, quantity }
        }
        return c
      }),
    }))
  }

  // 計算組裝產品總成本
  const calculateTotalCost = () => {
    // 組件成本
    const componentsCost = product.components.reduce((sum, component) => {
      return sum + component.quantity * component.unitPrice
    }, 0)

    // 組裝人工成本
    const laborCost = (product.assemblyTime / 60) * product.assemblyCostPerHour

    // 總成本 = 組件成本 + 人工成本 + 額外成本
    return componentsCost + laborCost + product.additionalCosts
  }

  // 處理添加文件記錄
  const handleAddDocument = () => {
    if (!newDocumentName) return

    const newDocument: DocumentRecord = {
      id: `doc_${Date.now()}`,
      name: newDocumentName,
      document: "",
      filename: "",
    }

    setCustomDocuments((prev) => [...prev, newDocument])
    setNewDocumentName("")
  }

  // 處理添加零件特性記錄
  const handleAddPartFeature = () => {
    if (!newPartFeatureName) return

    const newFeature: PartFeatureRecord = {
      id: `feature_${Date.now()}`,
      name: newPartFeatureName,
      status: false,
    }

    setCustomPartFeatures((prev) => [...prev, newFeature])
    setNewPartFeatureName("")
  }

  // 處理添加符合性記錄
  const handleAddCompliance = () => {
    if (!newComplianceName) return

    const newCompliance: ComplianceRecord = {
      id: `compliance_${Date.now()}`,
      regulation: newComplianceName,
      status: "",
      substances: "",
      reason: "",
      document: "",
      filename: "",
    }

    setCustomCompliances((prev) => [...prev, newCompliance])
    setNewComplianceName("")
  }

  // 處理添加製程資料
  const handleAddProcess = () => {
    if (!newProcess.process) return

    const processRecord: ProcessRecord = {
      id: `proc_${Date.now()}`,
      process: newProcess.process,
      vendor: newProcess.vendor,
      capacity: newProcess.capacity,
      requirements: newProcess.requirements,
      report: newProcess.report,
    }

    setProduct((prev) => {
      const updatedProcessData = [...prev.processData, processRecord]

      // 更新訂單和採購單要求
      const { orderReqs, purchaseReqs } = generateRequirements(updatedProcessData)

      return {
        ...prev,
        processData: updatedProcessData,
        orderRequirements: orderReqs,
        purchaseRequirements: purchaseReqs,
      }
    })

    setNewProcess({
      id: "",
      process: "",
      vendor: "",
      capacity: "",
      requirements: "",
      report: "",
    })
    setIsProcessDialogOpen(false)
  }

  // 處理刪除製程資料
  const handleRemoveProcess = (id: string) => {
    setProduct((prev) => {
      const updatedProcessData = prev.processData.filter((proc) => proc.id !== id)

      // 更新訂單和採購單要求
      const { orderReqs, purchaseReqs } = generateRequirements(updatedProcessData)

      return {
        ...prev,
        processData: updatedProcessData,
        orderRequirements: orderReqs,
        purchaseRequirements: purchaseReqs,
      }
    })
  }

  // 處理製程資料欄位變更
  const handleProcessFieldChange = (id: string, field: keyof ProcessRecord, value: string) => {
    setProduct((prev) => {
      const updatedProcessData = prev.processData.map((proc) => {
        if (proc.id === id) {
          return { ...proc, [field]: value }
        }
        return proc
      })

      // 更新訂單和採購單要求
      const { orderReqs, purchaseReqs } = generateRequirements(updatedProcessData)

      return {
        ...prev,
        processData: updatedProcessData,
        orderRequirements: orderReqs,
        purchaseRequirements: purchaseReqs,
      }
    })
  }

  // 處理文件上傳 (擴展現有函數)
  const handleCustomDocumentUpload = (id: string, file: File) => {
    const fileData = {
      path: URL.createObjectURL(file),
      filename: file.name,
    }

    setCustomDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, document: fileData.path, filename: fileData.filename } : doc)),
    )
  }

  // 處理刪除文件記錄
  const handleRemoveDocument = (id: string) => {
    setCustomDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  // 處理刪除零件特性記錄
  const handleRemovePartFeature = (id: string) => {
    setCustomPartFeatures((prev) => prev.filter((feature) => feature.id !== id))
  }

  // 處理刪除符合性記錄
  const handleRemoveCompliance = (id: string) => {
    setCustomCompliances((prev) => prev.filter((compliance) => compliance.id !== id))
  }

  // 處理零件特性狀態變更
  const handlePartFeatureStatusChange = (id: string, status: boolean) => {
    setCustomPartFeatures((prev) => prev.map((feature) => (feature.id === id ? { ...feature, status } : feature)))
  }

  // 處理符合性狀態變更
  const handleCustomComplianceChange = (id: string, field: string, value: string) => {
    setCustomCompliances((prev) =>
      prev.map((compliance) => (compliance.id === id ? { ...compliance, [field]: value } : compliance)),
    )
  }

  // 處理文件上傳
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldType: string) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // 在實際應用中，這裡應該上傳文件到服務器
    // 這裡我們只是模擬上傳過程
    const file = files[0]
    const fileData = {
      path: URL.createObjectURL(file),
      filename: file.name,
    }

    switch (fieldType) {
      case "customerOriginalDrawing":
        setProduct((prev) => ({
          ...prev,
          customerOriginalDrawing: fileData,
        }))
        break
      case "jinzhanDrawing":
        setProduct((prev) => ({
          ...prev,
          jinzhanDrawing: fileData,
        }))
        break
      case "customerDrawing":
        setProduct((prev) => ({
          ...prev,
          customerDrawing: fileData,
        }))
        break
      case "factoryDrawing":
        setProduct((prev) => ({
          ...prev,
          factoryDrawing: fileData,
        }))
        break
      case "PPAP":
        setProduct((prev) => ({
          ...prev,
          importantDocuments: {
            ...prev.importantDocuments,
            PPAP: { document: fileData.path, filename: fileData.filename },
          },
        }))
        break
      case "PSW":
        setProduct((prev) => ({
          ...prev,
          importantDocuments: {
            ...prev.importantDocuments,
            PSW: { document: fileData.path, filename: fileData.filename },
          },
        }))
        break
      case "capacityAnalysis":
        setProduct((prev) => ({
          ...prev,
          importantDocuments: {
            ...prev.importantDocuments,
            capacityAnalysis: { document: fileData.path, filename: fileData.filename },
          },
        }))
        break
      default:
        if (fieldType.startsWith("compliance_")) {
          const regulation = fieldType.split("_")[1]
          setProduct((prev) => ({
            ...prev,
            complianceStatus: {
              ...prev.complianceStatus,
              [regulation]: {
                ...prev.complianceStatus[regulation as keyof typeof prev.complianceStatus],
                document: fileData.path,
                filename: fileData.filename,
              },
            },
          }))
        } else if (fieldType.startsWith("custom_")) {
          const [_, category, id] = fieldType.split("_")

          if (category === "importantDocuments") {
            setCustomImportantDocuments((prev) =>
              prev.map((field) => (field.id === id ? { ...field, value: fileData.path } : field)),
            )
          } else if (category === "compliance") {
            setCustomCompliance((prev) =>
              prev.map((field) => (field.id === id ? { ...field, value: fileData.path } : field)),
            )
          }
        }
        break
    }

    // 重置input，以便可以再次選擇相同的文件
    e.target.value = ""
  }

  // 處理符合性狀態變更
  const handleComplianceStatusChange = (regulation: string, status: string) => {
    setProduct((prev) => ({
      ...prev,
      complianceStatus: {
        ...prev.complianceStatus,
        [regulation]: {
          ...prev.complianceStatus[regulation as keyof typeof prev.complianceStatus],
          status,
        },
      },
    }))
  }

  // 處理符合性欄位變更
  const handleComplianceFieldChange = (regulation: string, field: string, value: string) => {
    setProduct((prev) => ({
      ...prev,
      complianceStatus: {
        ...prev.complianceStatus,
        [regulation]: {
          ...prev.complianceStatus[regulation as keyof typeof prev.complianceStatus],
          [field]: value,
        },
      },
    }))
  }

  // 處理零件管理特性變更
  const handlePartManagementChange = (field: string, value: boolean) => {
    setProduct((prev) => ({
      ...prev,
      partManagement: {
        ...prev.partManagement,
        [field]: value,
      },
    }))
  }

  // 處理添加編輯備註
  const handleAddEditNote = () => {
    if (newNote.content && newNote.user) {
      const date = newNote.date || new Date().toLocaleDateString("zh-TW")
      setProduct((prev) => ({
        ...prev,
        editNotes: [
          ...prev.editNotes,
          {
            content: newNote.content,
            date: date,
            user: newNote.user,
          },
        ],
      }))
      setNewNote({ content: "", date: "", user: "" })
      setIsNoteDialogOpen(false)
    }
  }

  // 處理添加自定義欄位
  const handleAddCustomField = (category: string) => {
    if (!newCustomField.name) return

    const newField: CustomField = {
      id: `${category}_${Date.now()}`,
      name: newCustomField.name,
      value: "",
      type: newCustomField.type,
    }

    if (category === "importantDocuments") {
      setCustomImportantDocuments((prev) => [...prev, newField])
    } else if (category === "partManagement") {
      setCustomPartManagement((prev) => [...prev, newField])
    } else if (category === "compliance") {
      setCustomCompliance((prev) => [...prev, newField])
    }

    setNewCustomField({ name: "", type: "text" })
    setActiveDialog(null)
  }

  // 處理自定義欄位值變更
  const handleCustomFieldChange = (category: string, id: string, value: string | boolean) => {
    if (category === "importantDocuments") {
      setCustomImportantDocuments((prev) =>
        prev.map((field) => (field.id === id ? { ...field, value: value as string } : field)),
      )
    } else if (category === "partManagement") {
      setCustomPartManagement((prev) =>
        prev.map((field) => (field.id === id ? { ...field, value: String(value) } : field)),
      )
    } else if (category === "compliance") {
      setCustomCompliance((prev) =>
        prev.map((field) => (field.id === id ? { ...field, value: value as string } : field)),
      )
    }
  }

  // 處理刪除自定義欄位
  const handleRemoveCustomField = (category: string, id: string) => {
    if (category === "importantDocuments") {
      setCustomImportantDocuments((prev) => prev.filter((field) => field.id !== id))
    } else if (category === "partManagement") {
      setCustomPartManagement((prev) => prev.filter((field) => field.id !== id))
    } else if (category === "compliance") {
      setCustomCompliance((prev) => prev.filter((field) => field.id !== id))
    }
  }

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 將自定義欄位和記錄添加到提交數據中
    const submitData = {
      ...product,
      customImportantDocuments,
      customPartManagement,
      customCompliance,
      customDocuments,
      customPartFeatures,
      customCompliances,
    }

    try {
      // 使用 Server Action 保存產品
      const result = await saveProduct(submitData)

      if (result.success) {
        toast({
          title: "產品保存成功",
          description: `產品 ${product.partNo} 已成功保存到資料庫`,
        })

        // 如果是從新增產品頁面提交，則導航到產品列表
        if (onSubmit) {
          onSubmit(submitData)
        } else {
          router.push("/products")
        }
      } else {
        toast({
          title: "錯誤",
          description: `保存產品失敗: ${result.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("保存產品時出錯:", error)
      toast({
        title: "錯誤",
        description: "保存產品時出錯，請稍後再試",
        variant: "destructive",
      })
    }
  }

  // 添加生成訂單和採購單要求的函數
  const generateRequirements = (processData: ProcessRecord[]) => {
    // 訂單零件要求
    const orderReqs = processData
      .filter((proc) => proc.requirements)
      .map((proc) => `${proc.process}：${proc.requirements}`)
      .join("\n")

    // 採購單零件要求
    const materialProc = processData.find((proc) => proc.process === "材料")
    const heatTreatmentProc = processData.find((proc) => proc.process === "熱處理")
    const platingProc = processData.find((proc) => proc.process === "電鍍")
    const screeningProc = processData.find((proc) => proc.process === "篩選")

    const purchaseReqs = []

    if (materialProc && materialProc.requirements) {
      purchaseReqs.push(`材料：${materialProc.requirements}`)
    }

    if (heatTreatmentProc && heatTreatmentProc.requirements) {
      purchaseReqs.push(`熱處理：${heatTreatmentProc.requirements}`)
    }

    if (platingProc && platingProc.requirements) {
      purchaseReqs.push(`電鍍：${platingProc.requirements}`)
    }

    if (screeningProc && screeningProc.requirements) {
      purchaseReqs.push(`篩選：${screeningProc.requirements}`)
    }

    return {
      orderReqs,
      purchaseReqs: purchaseReqs.join("\n"),
    }
  }

  // 渲染添加自定義欄位對話框
  const renderAddCustomFieldDialog = (category: string) => (
    <Dialog open={activeDialog === category} onOpenChange={(open) => setActiveDialog(open ? category : null)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加自定義欄位</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="custom-field-name" className="text-right">
              欄位名稱
            </Label>
            <Input
              id="custom-field-name"
              value={newCustomField.name}
              onChange={(e) => setNewCustomField({ ...newCustomField, name: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="custom-field-type" className="text-right">
              欄位類型
            </Label>
            <Select
              value={newCustomField.type}
              onValueChange={(value: "text" | "file" | "checkbox") =>
                setNewCustomField({ ...newCustomField, type: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="選擇欄位類型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">文字</SelectItem>
                <SelectItem value="file">文件</SelectItem>
                <SelectItem value="checkbox">勾選框</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={() => handleAddCustomField(category)}>
            添加
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  const handleAddSpecialReq = () => {
    if (newSpecialReq.content && newSpecialReq.user) {
      const date = newSpecialReq.date || new Date().toLocaleDateString("zh-TW")
      setProduct((prev) => ({
        ...prev,
        specialRequirements: [
          ...prev.specialRequirements,
          {
            content: newSpecialReq.content,
            date: date,
            user: newSpecialReq.user,
          },
        ],
      }))
      setNewSpecialReq({ content: "", date: "", user: "" })
      setIsSpecialReqDialogOpen(false)
    }
  }

  const handleAddProcessNote = () => {
    if (newProcessNote.content && newProcessNote.user) {
      const date = newProcessNote.date || new Date().toLocaleDateString("zh-TW")
      setProduct((prev) => ({
        ...prev,
        processNotes: [
          ...prev.processNotes,
          {
            content: newProcessNote.content,
            date: date,
            user: newProcessNote.user,
          },
        ],
      }))
      setNewProcessNote({ content: "", date: "", user: "" })
      setIsProcessNoteDialogOpen(false)
    }
  }

  const handleAddResumeNote = () => {
    if (newResumeNote.content && newResumeNote.user) {
      const date = newResumeNote.date || new Date().toLocaleDateString("zh-TW")
      setProduct((prev) => ({
        ...prev,
        resumeNotes: [
          ...prev.resumeNotes,
          {
            content: newResumeNote.content,
            date: date,
            user: newResumeNote.user,
          },
        ],
      }))
      setNewResumeNote({ content: "", date: "", user: "" })
      setIsResumeNoteDialogOpen(false)
    }
  }

  // 處理添加訂單歷史
  const handleAddOrderHistory = () => {
    if (newOrderHistory.orderNumber) {
      setProduct((prev) => ({
        ...prev,
        orderHistory: [...(prev.orderHistory || []), { ...newOrderHistory }],
      }))
      setNewOrderHistory({ orderNumber: "", quantity: 0 })
      setIsOrderHistoryDialogOpen(false)
    }
  }

  // 處理訂單歷史欄位變更
  const handleOrderHistoryChange = (index: number, field: string, value: string | number) => {
    setProduct((prev) => {
      const updatedOrderHistory = [...(prev.orderHistory || [])]
      updatedOrderHistory[index] = {
        ...updatedOrderHistory[index],
        [field]: value,
      }
      return {
        ...prev,
        orderHistory: updatedOrderHistory,
      }
    })
  }

  // 處理刪除訂單歷史
  const handleRemoveOrderHistory = (index: number) => {
    setProduct((prev) => {
      const updatedOrderHistory = [...(prev.orderHistory || [])]
      updatedOrderHistory.splice(index, 1)
      return {
        ...prev,
        orderHistory: updatedOrderHistory,
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="basic">基本資訊</TabsTrigger>
          <TabsTrigger value="images">產品圖片</TabsTrigger>
          <TabsTrigger value="documents">文件與認證</TabsTrigger>
          <TabsTrigger value="process">製程資料</TabsTrigger>
          <TabsTrigger value="resume">履歷資料</TabsTrigger>
          <TabsTrigger value="commercial">商業條款</TabsTrigger>
          <TabsTrigger value="assembly">組裝資訊</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-4">
            {/* 左右兩欄佈局 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 左欄 */}
              <div className="space-y-4">
                <TableContainer>
                  <TableRow>
                    <TableCell label="零件名稱">
                      <Input
                        id="componentName"
                        value={product.componentName}
                        onChange={(e) => handleInputChange("componentName", e.target.value)}
                        className="border-0 shadow-none focus-visible:ring-0 h-8"
                      />
                    </TableCell>
                    <TableCell label="規格">
                      <Input
                        id="specification"
                        value={product.specification}
                        onChange={(e) => handleInputChange("specification", e.target.value)}
                        className="border-0 shadow-none focus-visible:ring-0 h-8"
                      />
                    </TableCell>
                    <TableCell label="海關碼">
                      <Input
                        id="customsCode"
                        value={product.customsCode}
                        onChange={(e) => handleInputChange("customsCode", e.target.value)}
                        className="border-0 shadow-none focus-visible:ring-0 h-8"
                      />
                    </TableCell>
                    <TableCell label="終端客戶">
                      <Input
                        id="endCustomer"
                        value={product.endCustomer}
                        onChange={(e) => handleInputChange("endCustomer", e.target.value)}
                        className="border-0 shadow-none focus-visible:ring-0 h-8"
                      />
                    </TableCell>
                    <TableCell label="客戶名稱">
                      <div className="grid grid-cols-2">
                        <div className="p-2 border-r">
                          <Select value={product.customerName.id} onValueChange={handleCustomerChange}>
                            <SelectTrigger className="border-0 shadow-none focus:ring-0 h-8">
                              <SelectValue placeholder="選擇客戶" />
                            </SelectTrigger>
                            <SelectContent>
                              {customers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="p-2 bg-gray-50">
                          <Input
                            value={product.customerName.code}
                            readOnly
                            className="border-0 shadow-none bg-gray-50 h-8"
                            placeholder="客戶代碼"
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell label="工廠名稱">
                      <div className="grid grid-cols-2">
                        <div className="p-2 border-r">
                          <Select value={product.factoryName.id} onValueChange={handleFactoryChange}>
                            <SelectTrigger className="border-0 shadow-none focus:ring-0 h-8">
                              <SelectValue placeholder="選擇工廠" />
                            </SelectTrigger>
                            <SelectContent>
                              {factories.map((factory) => (
                                <SelectItem key={factory.id} value={factory.id}>
                                  {factory.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="p-2 bg-gray-50">
                          <Input
                            value={product.factoryName.code}
                            readOnly
                            className="border-0 shadow-none bg-gray-50 h-8"
                            placeholder="工廠代碼"
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableContainer>
              </div>

              {/* 右欄 */}
              <div className="space-y-4">
                <TableContainer>
                  <TableRow>
                    <TableCell label="產品型別">
                      <Select
                        value={product.productType}
                        onValueChange={(value) => handleInputChange("productType", value)}
                      >
                        <SelectTrigger className="border-0 shadow-none focus:ring-0 h-8">
                          <SelectValue placeholder="選擇類別" />
                        </SelectTrigger>
                        <SelectContent>
                          {productTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell label="Part No.">
                      <Input
                        id="partNo"
                        value={product.partNo}
                        onChange={(e) => handleInputChange("partNo", e.target.value)}
                        className="border-0 shadow-none focus-visible:ring-0 h-8"
                      />
                    </TableCell>
                    <TableCell label="今湛分類碼">
                      <Input
                        id="classificationCode"
                        value={product.classificationCode}
                        onChange={(e) => handleInputChange("classificationCode", e.target.value)}
                        className="border-0 shadow-none focus-visible:ring-0 h-8"
                      />
                    </TableCell>
                    <TableCell label="車廠圖號">
                      <Input
                        id="vehicleDrawingNo"
                        value={product.vehicleDrawingNo}
                        onChange={(e) => handleInputChange("vehicleDrawingNo", e.target.value)}
                        className="border-0 shadow-none focus-visible:ring-0 h-8"
                      />
                    </TableCell>
                    <TableCell label="客戶圖號">
                      <Input
                        id="customerDrawingNo"
                        value={product.customerDrawingNo}
                        onChange={(e) => handleInputChange("customerDrawingNo", e.target.value)}
                        className="border-0 shadow-none focus-visible:ring-0 h-8"
                      />
                    </TableCell>
                    <TableCell label="產品期稿">
                      <Input
                        id="productPeriod"
                        value={product.productPeriod}
                        onChange={(e) => handleInputChange("productPeriod", e.target.value)}
                        className="border-0 shadow-none focus-visible:ring-0 h-8"
                      />
                    </TableCell>
                  </TableRow>
                </TableContainer>
              </div>
            </div>

            {/* 組裝產品開關 */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-assembly"
                  checked={product.isAssembly}
                  onCheckedChange={(checked) => handleInputChange("isAssembly", checked)}
                />
                <Label htmlFor="is-assembly">這是一個組裝產品</Label>
              </div>
              <p className="text-sm text-gray-500">
                組裝產品由多個組件組成，可能來自不同工廠。啟用此選項可以管理組件和計算組裝成本。
              </p>
            </div>

            {/* 產品描述 */}
            <div className="space-y-2">
              <Label htmlFor="description">產品描述</Label>
              <Textarea
                id="description"
                value={product.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="images" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* 第一個表格 - 原圖版次和客戶原圖 */}
                <TableContainer>
                  <TableRow>
                    <TableCell label="原圖版次" highlight={true}>
                      <Input
                        value={product.originalDrawingVersion}
                        onChange={(e) => handleInputChange("originalDrawingVersion", e.target.value)}
                        className="border-0 shadow-none focus-visible:ring-0 h-8"
                        placeholder="輸入原圖版次"
                      />
                    </TableCell>
                    <TableCell label="客戶原圖" highlight={true}>
                      <div className="flex items-center gap-4">
                        {product.customerOriginalDrawing.path ? (
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 border flex items-center justify-center">
                            <FileText className="h-8 w-8 text-gray-400" />
                          </div>
                        ) : null}
                        <div className="flex-1">
                          <div className="truncate text-sm">
                            {product.customerOriginalDrawing.filename || "未選擇圖面"}
                          </div>
                          {product.customerOriginalDrawing.path && (
                            <div className="text-xs text-gray-500 truncate mt-1">
                              {product.customerOriginalDrawing.path}
                            </div>
                          )}
                          <div className="mt-2">
                            <label
                              htmlFor="customer-original-upload"
                              className="cursor-pointer bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-sm flex items-center gap-1 inline-block"
                            >
                              選擇圖面連結
                              <input
                                id="customer-original-upload"
                                type="file"
                                accept=".pdf,.dwg,.dxf"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, "customerOriginalDrawing")}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableContainer>

                {/* 第二個表格 - 發單製作、客戶圖、工廠圖 */}
                <TableContainer className="mt-6">
                  <TableHeader>
                    <div className="grid grid-cols-3">
                      <div className="p-2 text-left border-r">發單製作</div>
                      <div className="p-2 text-center border-r">客戶圖</div>
                      <div className="p-2 text-center">工廠圖</div>
                    </div>
                  </TableHeader>
                  <TableRow>
                    <div className="grid grid-cols-3 border-b">
                      <div className="bg-gray-100 p-3 border-r font-medium">繪圖版次</div>
                      <div className="p-2 border-r">
                        <Input
                          value={product.customerDrawingVersion}
                          onChange={(e) => handleInputChange("customerDrawingVersion", e.target.value)}
                          className="border-0 shadow-none focus-visible:ring-0 h-8"
                          placeholder="客戶圖版次"
                        />
                      </div>
                      <div className="p-2">
                        <Input
                          value={product.factoryDrawingVersion}
                          onChange={(e) => handleInputChange("factoryDrawingVersion", e.target.value)}
                          className="border-0 shadow-none focus-visible:ring-0 h-8"
                          placeholder="工廠圖版次"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3">
                      <div className="bg-gray-100 p-3 border-r font-medium">今湛繪圖</div>
                      <div className="p-2 border-r bg-yellow-50">
                        <div className="flex items-center gap-4">
                          {product.customerDrawing.path ? (
                            <div className="flex-shrink-0 w-16 h-16 bg-gray-100 border flex items-center justify-center">
                              <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                          ) : null}
                          <div className="flex-1">
                            <div className="truncate text-sm">{product.customerDrawing.filename || "未選擇圖面"}</div>
                            {product.customerDrawing.path && (
                              <div className="text-xs text-gray-500 truncate mt-1">{product.customerDrawing.path}</div>
                            )}
                            <div className="mt-2">
                              <label
                                htmlFor="customer-drawing-upload"
                                className="cursor-pointer bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-sm flex items-center gap-1 inline-block"
                              >
                                選擇圖面連結
                                <input
                                  id="customer-drawing-upload"
                                  type="file"
                                  accept=".pdf,.dwg,.dxf"
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(e, "customerDrawing")}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-2 bg-yellow-50">
                        <div className="flex items-center gap-4">
                          {product.factoryDrawing.path ? (
                            <div className="flex-shrink-0 w-16 h-16 bg-gray-100 border flex items-center justify-center">
                              <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                          ) : null}
                          <div className="flex-1">
                            <div className="truncate text-sm">{product.factoryDrawing.filename || "未選擇圖面"}</div>
                            {product.factoryDrawing.path && (
                              <div className="text-xs text-gray-500 truncate mt-1">{product.factoryDrawing.path}</div>
                            )}
                            <div className="mt-2">
                              <label
                                htmlFor="factory-drawing-upload"
                                className="cursor-pointer bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-sm flex items-center gap-1 inline-block"
                              >
                                選擇圖面連結
                                <input
                                  id="factory-drawing-upload"
                                  type="file"
                                  accept=".pdf,.dwg,.dxf"
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(e, "factoryDrawing")}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TableRow>
                </TableContainer>

                {/* 文件預覽對話框 */}
                {previewFile && (
                  <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
                    <DialogContent className="sm:max-w-[800px] sm:max-h-[800px]">
                      <DialogHeader>
                        <DialogTitle>
                          {previewFile.type} - {previewFile.filename}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="h-[600px] overflow-auto border rounded-md p-4">
                        <div className="flex flex-col items-center justify-center h-full">
                          <FileText className="h-16 w-16 text-gray-400 mb-4" />
                          <p className="text-center text-gray-500">
                            文件路徑: {previewFile.path}
                            <br />
                            <span className="text-sm">(實際應用中，這裡會顯示文件預覽)</span>
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* 表格A - 重要文件 */}
                <TableContainer>
                  <TableHeader>
                    <div className="flex items-center justify-between px-4">
                      <span>重要文件</span>
                      <div className="flex items-center">
                        <Input
                          value={newDocumentName}
                          onChange={(e) => setNewDocumentName(e.target.value)}
                          placeholder="新文件名稱"
                          className="h-7 mr-2 w-40 text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={handleAddDocument}
                          disabled={!newDocumentName}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TableHeader>
                  <div className="grid grid-cols-3 border-b bg-gray-100">
                    <div className="col-span-2 p-2 text-left font-medium">文件名稱</div>
                    <div className="p-2 text-center font-medium">文件</div>
                  </div>
                  <TableRow>
                    <div className="grid grid-cols-3 border-b">
                      <div className="col-span-2 p-2 border-r">
                        <span>PPAP檔案資料夾</span>
                      </div>
                      <div className="p-2 text-center">
                        <label htmlFor="ppap-upload" className="cursor-pointer text-blue-600 hover:underline">
                          選擇文件連結
                          <input
                            id="ppap-upload"
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "PPAP")}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 border-b">
                      <div className="col-span-2 p-2 border-r">
                        <span>PSW回答</span>
                      </div>
                      <div className="p-2 text-center">
                        <label htmlFor="psw-upload" className="cursor-pointer text-blue-600 hover:underline">
                          選擇文件連結
                          <input
                            id="psw-upload"
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "PSW")}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 border-b">
                      <div className="col-span-2 p-2 border-r">
                        <span>產能分析表</span>
                      </div>
                      <div className="p-2 text-center">
                        <label htmlFor="capacity-upload" className="cursor-pointer text-blue-600 hover:underline">
                          選擇文件連結
                          <input
                            id="capacity-upload"
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "capacityAnalysis")}
                          />
                        </label>
                      </div>
                    </div>
                    {customDocuments.map((doc) => (
                      <div key={doc.id} className="grid grid-cols-3 border-b">
                        <div className="col-span-2 p-2 border-r flex items-center justify-between">
                          <span>{doc.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1 text-red-500"
                            onClick={() => handleRemoveDocument(doc.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="p-2 text-center">
                          <label
                            htmlFor={`doc-${doc.id}-upload`}
                            className="cursor-pointer text-blue-600 hover:underline"
                          >
                            選擇文件連結
                            <input
                              id={`doc-${doc.id}-upload`}
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  handleCustomDocumentUpload(doc.id, e.target.files[0])
                                }
                              }}
                            />
                          </label>
                          {doc.filename && <div className="text-xs text-gray-500 mt-1">{doc.filename}</div>}
                        </div>
                      </div>
                    ))}
                  </TableRow>
                </TableContainer>

                {/* 其他表格保持相同的修改模式，這裡只展示第一個表格的修改 */}
                {/* 其餘表格的修改方式類似，將table結構替換為我們的自定義組件 */}
                {/* 表格B - 零件管理特性 */}
                <TableContainer className="mt-6">
                  <TableHeader>
                    <div className="flex items-center justify-between px-4">
                      <span>零件管理特性</span>
                      <div className="flex items-center">
                        <Input
                          value={newPartFeatureName}
                          onChange={(e) => setNewPartFeatureName(e.target.value)}
                          placeholder="新特性名稱"
                          className="h-7 mr-2 w-40 text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={handleAddPartFeature}
                          disabled={!newPartFeatureName}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TableHeader>
                  <div className="grid grid-cols-4 border-b bg-gray-100">
                    <div className="col-span-3 p-2 text-left font-medium">特性名稱</div>
                    <div className="p-2 text-center font-medium">狀態</div>
                  </div>
                  <TableRow>
                    <div className="grid grid-cols-4 border-b">
                      <div className="col-span-3 p-2 border-r">
                        <span>安全件</span>
                      </div>
                      <div className="p-2 text-center">
                        <Checkbox
                          checked={product.partManagement.safetyPart}
                          onCheckedChange={(checked) => handlePartManagementChange("safetyPart", checked === true)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 border-b">
                      <div className="col-span-3 p-2 border-r">
                        <span>汽車件</span>
                      </div>
                      <div className="p-2 text-center">
                        <Checkbox
                          checked={product.partManagement.automotivePart}
                          onCheckedChange={(checked) => handlePartManagementChange("automotivePart", checked === true)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 border-b">
                      <div className="col-span-3 p-2 border-r">
                        <span>CBAM零件</span>
                      </div>
                      <div className="p-2 text-center">
                        <Checkbox
                          checked={product.partManagement.CBAMPart}
                          onCheckedChange={(checked) => handlePartManagementChange("CBAMPart", checked === true)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 border-b">
                      <div className="col-span-3 p-2 border-r">
                        <span>時鐘地要求</span>
                      </div>
                      <div className="p-2 text-center">
                        <Checkbox
                          checked={product.partManagement.clockRequirement}
                          onCheckedChange={(checked) =>
                            handlePartManagementChange("clockRequirement", checked === true)
                          }
                        />
                      </div>
                    </div>
                    {customPartFeatures.map((feature) => (
                      <div key={feature.id} className="grid grid-cols-4 border-b">
                        <div className="col-span-3 p-2 border-r flex items-center justify-between">
                          <span>{feature.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1 text-red-500"
                            onClick={() => handleRemovePartFeature(feature.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="p-2 text-center">
                          <Checkbox
                            checked={feature.status}
                            onCheckedChange={(checked) => handlePartFeatureStatusChange(feature.id, checked === true)}
                          />
                        </div>
                      </div>
                    ))}
                  </TableRow>
                </TableContainer>

                {/* 表格C - 符合性要求 */}
                <TableContainer className="mt-6">
                  <TableHeader>
                    <div className="flex items-center justify-center">
                      <span>符合性要求</span>
                      <div className="flex items-center ml-4">
                        <Input
                          value={newComplianceName}
                          onChange={(e) => setNewComplianceName(e.target.value)}
                          placeholder="新法規名稱"
                          className="h-7 mr-2 w-40 text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={handleAddCompliance}
                          disabled={!newComplianceName}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TableHeader>
                  <div className="grid grid-cols-5 border-b bg-gray-100">
                    <div className="p-2 text-left font-medium border-r">法規</div>
                    <div className="p-2 text-center font-medium border-r">零件狀態</div>
                    <div className="p-2 text-left font-medium border-r">含有物質</div>
                    <div className="p-2 text-left font-medium border-r">理由</div>
                    <div className="p-2 text-center font-medium">文件</div>
                  </div>
                  <TableRow>
                    {["RoHS", "REACh", "EUPOP", "TSCA", "CP65", "PFAS", "CMRT", "EMRT"].map((regulation) => (
                      <div key={regulation} className="grid grid-cols-5 border-b">
                        <div className="p-2 border-r">{regulation}</div>
                        <div className="p-2 border-r">
                          <div className="flex items-center justify-center gap-4">
                            <div className="flex items-center gap-1">
                              <RadioGroup
                                value={
                                  product.complianceStatus[regulation as keyof typeof product.complianceStatus].status
                                }
                                onValueChange={(value) => handleComplianceStatusChange(regulation, value)}
                                className="flex items-center gap-4"
                              >
                                <div className="flex items-center gap-1">
                                  <RadioGroupItem value="符合" id={`${regulation}-compliant`} />
                                  <Label htmlFor={`${regulation}-compliant`}>符合</Label>
                                </div>
                                <div className="flex items-center gap-1">
                                  <RadioGroupItem value="不符" id={`${regulation}-non-compliant`} />
                                  <Label htmlFor={`${regulation}-non-compliant`}>不符</Label>
                                </div>
                              </RadioGroup>
                            </div>
                          </div>
                        </div>
                        <div className="p-2 border-r">
                          <Input
                            value={
                              product.complianceStatus[regulation as keyof typeof product.complianceStatus].substances
                            }
                            onChange={(e) => handleComplianceFieldChange(regulation, "substances", e.target.value)}
                            className="border-0 shadow-none focus-visible:ring-0 h-8"
                          />
                        </div>
                        <div className="p-2 border-r">
                          <Input
                            value={product.complianceStatus[regulation as keyof typeof product.complianceStatus].reason}
                            onChange={(e) => handleComplianceFieldChange(regulation, "reason", e.target.value)}
                            className="border-0 shadow-none focus-visible:ring-0 h-8"
                          />
                        </div>
                        <div className="p-2 text-center">
                          <label
                            htmlFor={`compliance-${regulation}-upload`}
                            className="cursor-pointer text-blue-600 hover:underline"
                          >
                            選擇文件連結
                            <input
                              id={`compliance-${regulation}-upload`}
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, `compliance_${regulation}`)}
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                    {customCompliances.map((compliance) => (
                      <div key={compliance.id} className="grid grid-cols-5 border-b">
                        <div className="p-2 border-r flex items-center justify-between">
                          <span>{compliance.regulation}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1 text-red-500"
                            onClick={() => handleRemoveCompliance(compliance.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="p-2 border-r">
                          <div className="flex items-center justify-center gap-4">
                            <div className="flex items-center gap-1">
                              <RadioGroup
                                value={compliance.status}
                                onValueChange={(value) => handleCustomComplianceChange(compliance.id, "status", value)}
                                className="flex items-center gap-4"
                              >
                                <div className="flex items-center gap-1">
                                  <RadioGroupItem value="符合" id={`${compliance.id}-compliant`} />
                                  <Label htmlFor={`${compliance.id}-compliant`}>符合</Label>
                                </div>
                                <div className="flex items-center gap-1">
                                  <RadioGroupItem value="不符" id={`${compliance.id}-non-compliant`} />
                                  <Label htmlFor={`${compliance.id}-non-compliant`}>不符</Label>
                                </div>
                              </RadioGroup>
                            </div>
                          </div>
                        </div>
                        <div className="p-2 border-r">
                          <Input
                            value={compliance.substances}
                            onChange={(e) => handleCustomComplianceChange(compliance.id, "substances", e.target.value)}
                            className="border-0 shadow-none focus-visible:ring-0 h-8"
                          />
                        </div>
                        <div className="p-2 border-r">
                          <Input
                            value={compliance.reason}
                            onChange={(e) => handleCustomComplianceChange(compliance.id, "reason", e.target.value)}
                            className="border-0 shadow-none focus-visible:ring-0 h-8"
                          />
                        </div>
                        <div className="p-2 text-center">
                          <label
                            htmlFor={`compliance-${compliance.id}-upload`}
                            className="cursor-pointer text-blue-600 hover:underline"
                          >
                            選擇文件連結
                            <input
                              id={`compliance-${compliance.id}-upload`}
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  const file = e.target.files[0]
                                  const fileData = {
                                    path: URL.createObjectURL(file),
                                    filename: file.name,
                                  }
                                  handleCustomComplianceChange(compliance.id, "document", fileData.path)
                                  handleCustomComplianceChange(compliance.id, "filename", fileData.filename)
                                }
                              }}
                            />
                          </label>
                          {compliance.filename && (
                            <div className="text-xs text-gray-500 mt-1">{compliance.filename}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </TableRow>
                </TableContainer>

                {/* 表格D - 編輯備註 */}
                <TableContainer className="mt-6">
                  <TableHeader>
                    <div className="flex items-center justify-between px-4">
                      <span>編輯備註</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => setIsNoteDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableHeader>
                  <div className="grid grid-cols-3 border-b bg-gray-100">
                    <div className="col-span-1 p-2 text-left font-medium border-r">備註內容</div>
                    <div className="p-2 text-center font-medium border-r">日期</div>
                    <div className="p-2 text-center font-medium">使用者</div>
                  </div>
                  <TableRow>
                    {product.editNotes.map((note, index) => (
                      <div key={index} className="grid grid-cols-3 border-b">
                        <div className="col-span-1 p-2 border-r">{note.content}</div>
                        <div className="p-2 border-r text-center">{note.date}</div>
                        <div className="p-2 text-center">{note.user}</div>
                      </div>
                    ))}
                    {product.editNotes.length === 0 && (
                      <div className="p-4 text-center text-gray-500 col-span-3">尚未添加任何備註</div>
                    )}
                  </TableRow>
                </TableContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="process" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <TableContainer>
                  <TableHeader>
                    <div className="flex items-center justify-between px-4">
                      <span>製程資料</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => setIsProcessDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        新增製程
                      </Button>
                    </div>
                  </TableHeader>
                  <div className="grid grid-cols-5 border-b bg-gray-100">
                    <div className="p-2 text-center font-medium border-r">製程</div>
                    <div className="p-2 text-center font-medium border-r">廠商</div>
                    <div className="p-2 text-center font-medium border-r">產能(SH)</div>
                    <div className="p-2 text-center font-medium border-r">要求</div>
                    <div className="p-2 text-center font-medium">報告</div>
                  </div>
                  <TableRow>
                    {product.processData.map((proc) => (
                      <div
                        key={proc.id}
                        className={`grid grid-cols-5 border-b ${proc.id === "proc_1" ? "bg-yellow-50" : ""}`}
                      >
                        <div className="p-2 border-r">
                          <div className="flex items-center justify-between">
                            <Input
                              value={proc.process}
                              onChange={(e) => handleProcessFieldChange(proc.id, "process", e.target.value)}
                              className="border-0 shadow-none focus-visible:ring-0 h-8"
                            />
                            {proc.id !== "proc_1" &&
                              proc.id !== "proc_2" &&
                              proc.id !== "proc_3" &&
                              proc.id !== "proc_4" &&
                              proc.id !== "proc_5" &&
                              proc.id !== "proc_6" && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-1 text-red-500 ml-1"
                                  onClick={() => handleRemoveProcess(proc.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                          </div>
                        </div>
                        <div className="p-2 border-r">
                          <Input
                            value={proc.vendor}
                            onChange={(e) => handleProcessFieldChange(proc.id, "vendor", e.target.value)}
                            className="border-0 shadow-none focus-visible:ring-0 h-8"
                          />
                        </div>
                        <div className="p-2 border-r">
                          <Input
                            value={proc.capacity}
                            onChange={(e) => handleProcessFieldChange(proc.id, "capacity", e.target.value)}
                            className="border-0 shadow-none focus-visible:ring-0 h-8"
                          />
                        </div>
                        <div className="p-2 border-r">
                          <Input
                            value={proc.requirements}
                            onChange={(e) => handleProcessFieldChange(proc.id, "requirements", e.target.value)}
                            className="border-0 shadow-none focus-visible:ring-0 h-8"
                          />
                        </div>
                        <div className="p-2">
                          <Input
                            value={proc.report}
                            onChange={(e) => handleProcessFieldChange(proc.id, "report", e.target.value)}
                            className="border-0 shadow-none focus-visible:ring-0 h-8"
                          />
                        </div>
                      </div>
                    ))}
                  </TableRow>
                </TableContainer>

                {/* 其他表格保持相同的修改模式 */}
                {/* 在製程資料表格後添加訂單和採購單要求表格 */}
                <TableContainer className="mt-6">
                  <TableHeader>
                    <div className="grid grid-cols-2">
                      <div className="p-2 text-center font-medium border-r">訂單零件要求</div>
                      <div className="p-2 text-center font-medium">採購單零件要求</div>
                    </div>
                  </TableHeader>
                  <TableRow>
                    <div className="grid grid-cols-2">
                      <div className="p-4 border-r align-top bg-yellow-50">
                        <Textarea
                          value={product.orderRequirements}
                          onChange={(e) => handleInputChange("orderRequirements", e.target.value)}
                          className="border-0 shadow-none focus-visible:ring-0 min-h-[200px] bg-transparent"
                        />
                      </div>
                      <div className="p-4 align-top bg-yellow-50">
                        <Textarea
                          value={product.purchaseRequirements}
                          onChange={(e) => handleInputChange("purchaseRequirements", e.target.value)}
                          className="border-0 shadow-none focus-visible:ring-0 min-h-[200px] bg-transparent"
                        />
                      </div>
                    </div>
                  </TableRow>
                </TableContainer>

                {/* 特殊要求/測試表格 */}
                <TableContainer className="mt-6">
                  <TableHeader>
                    <div className="flex items-center justify-between px-4">
                      <span>特殊要求/測試</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => setIsSpecialReqDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableHeader>
                  <div className="grid grid-cols-3 border-b bg-gray-100">
                    <div className="col-span-1 p-2 text-left font-medium border-r">要求內容</div>
                    <div className="p-2 text-center font-medium border-r">日期</div>
                    <div className="p-2 text-center font-medium">使用者</div>
                  </div>
                  <TableRow>
                    {product.specialRequirements.map((req, index) => (
                      <div key={index} className="grid grid-cols-3 border-b">
                        <div className="col-span-1 p-2 border-r">{req.content}</div>
                        <div className="p-2 border-r text-center">{req.date}</div>
                        <div className="p-2 text-center">{req.user}</div>
                      </div>
                    ))}
                    {product.specialRequirements.length === 0 && (
                      <div className="p-4 text-center text-gray-500 col-span-3">尚未添加任何特殊要求</div>
                    )}
                  </TableRow>
                </TableContainer>

                {/* 編輯備註表格 */}
                <TableContainer className="mt-6">
                  <TableHeader>
                    <div className="flex items-center justify-between px-4">
                      <span>編輯備註</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => setIsProcessNoteDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableHeader>
                  <div className="grid grid-cols-3 border-b bg-gray-100">
                    <div className="col-span-1 p-2 text-left font-medium border-r">備註內容</div>
                    <div className="p-2 text-center font-medium border-r">日期</div>
                    <div className="p-2 text-center font-medium">使用者</div>
                  </div>
                  <TableRow>
                    {product.processNotes.map((note, index) => (
                      <div key={index} className="grid grid-cols-3 border-b">
                        <div className="col-span-1 p-2 border-r">{note.content}</div>
                        <div className="p-2 border-r text-center">{note.date}</div>
                        <div className="p-2 text-center">{note.user}</div>
                      </div>
                    ))}
                    {product.processNotes.length === 0 && (
                      <div className="p-4 text-center text-gray-500 col-span-3">尚未添加任何備註</div>
                    )}
                  </TableRow>
                </TableContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resume" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <TableContainer>
                  <TableHeader>模具資訊</TableHeader>
                  <TableRow>
                    <div className="grid grid-cols-2 border-b">
                      <div className="p-2 border-r bg-gray-50 font-medium">有無開模具</div>
                      <div className="p-2">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="has-mold-yes"
                              checked={product.hasMold === true}
                              onCheckedChange={(checked) => {
                                if (checked) handleInputChange("hasMold", true)
                              }}
                            />
                            <Label htmlFor="has-mold-yes">有</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="has-mold-no"
                              checked={product.hasMold === false}
                              onCheckedChange={(checked) => {
                                if (checked) handleInputChange("hasMold", false)
                              }}
                            />
                            <Label htmlFor="has-mold-no">無</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 border-b">
                      <div className="p-2 border-r bg-gray-50 font-medium">模具費</div>
                      <div className="p-2">
                        <Input
                          type="number"
                          value={product.moldCost || ""}
                          onChange={(e) => handleInputChange("moldCost", e.target.value ? Number(e.target.value) : "")}
                          className="border-0 shadow-none focus-visible:ring-0 h-8"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 border-b">
                      <div className="p-2 border-r bg-gray-50 font-medium">可退模具費數量</div>
                      <div className="p-2">
                        <Input
                          type="number"
                          value={product.refundableMoldQuantity || ""}
                          onChange={(e) =>
                            handleInputChange("refundableMoldQuantity", e.target.value ? Number(e.target.value) : "")
                          }
                          className="border-0 shadow-none focus-visible:ring-0 h-8"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 border-b">
                      <div className="p-2 border-r bg-gray-50 font-medium">已退模</div>
                      <div className="p-2">
                        <Checkbox
                          checked={product.moldReturned}
                          onCheckedChange={(checked) => handleInputChange("moldReturned", checked === true)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 border-b">
                      <div className="p-2 border-r bg-gray-50 font-medium">會計註記</div>
                      <div className="p-2">
                        <Textarea
                          value={product.accountingNote || ""}
                          onChange={(e) => handleInputChange("accountingNote", e.target.value)}
                          className="border-0 shadow-none focus-visible:ring-0 min-h-[80px]"
                          placeholder="輸入會計相關註記..."
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="p-2 border-r bg-gray-50 font-medium">品質註記</div>
                      <div className="p-2">
                        <div className="space-y-2 min-h-[80px]">
                          {product.qualityNotes && product.qualityNotes.length > 0 ? (
                            product.qualityNotes.map((note) => (
                              <div key={note.id} className="text-sm border-b pb-2">
                                <div className="flex justify-between">
                                  <span className="font-medium">{note.title}</span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs ${
                                      note.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : note.status === "processing"
                                          ? "bg-blue-100 text-blue-800"
                                          : note.status === "resolved"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {note.status === "pending"
                                      ? "待處理"
                                      : note.status === "processing"
                                        ? "處理中"
                                        : note.status === "resolved"
                                          ? "已解決"
                                          : note.status === "closed"
                                            ? "已結案"
                                            : note.status}
                                  </span>
                                </div>
                                <div className="text-gray-500 text-xs mt-1">
                                  客戶: {note.customer} | 日期: {note.date}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-500 text-sm">無相關客訴記錄</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableRow>
                </TableContainer>

                {/* 其他表格保持相同的修改模式 */}
                {/* 訂單歷史表格 */}
                <TableContainer className="mt-6">
                  <TableHeader>
                    <div className="flex items-center justify-between px-4">
                      <span>訂單歷史</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => setIsOrderHistoryDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        新增訂單
                      </Button>
                    </div>
                  </TableHeader>
                  <div className="grid grid-cols-2 border-b">
                    <div className="p-2 text-left font-medium border-r bg-gray-100">已出貨數量</div>
                    <div className="p-2 text-center font-medium bg-gray-100">
                      {product.orderHistory ? product.orderHistory.length : 0}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 border-b bg-gray-100">
                    <div className="p-2 text-center font-medium border-r">訂單號碼</div>
                    <div className="p-2 text-center font-medium">訂單數量</div>
                  </div>
                  <TableRow>
                    {product.orderHistory && product.orderHistory.length > 0 ? (
                      product.orderHistory.map((order, index) => (
                        <div key={index} className="grid grid-cols-2 border-b">
                          <div className="p-2 border-r">
                            <Input
                              value={order.orderNumber}
                              onChange={(e) => handleOrderHistoryChange(index, "orderNumber", e.target.value)}
                              className="border-0 shadow-none focus-visible:ring-0 h-8"
                            />
                          </div>
                          <div className="p-2">
                            <div className="flex items-center">
                              <Input
                                type="number"
                                value={order.quantity}
                                onChange={(e) => handleOrderHistoryChange(index, "quantity", Number(e.target.value))}
                                className="border-0 shadow-none focus-visible:ring-0 h-8"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1 text-red-500 ml-1"
                                onClick={() => handleRemoveOrderHistory(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 col-span-2">尚未添加任何訂單歷史</div>
                    )}
                  </TableRow>
                </TableContainer>

                {/* 編輯備註表格 */}
                <TableContainer className="mt-6">
                  <TableHeader>
                    <div className="flex items-center justify-between px-4">
                      <span>編輯備註</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => setIsResumeNoteDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableHeader>
                  <div className="grid grid-cols-3 border-b bg-gray-100">
                    <div className="col-span-1 p-2 text-left font-medium border-r">備註內容</div>
                    <div className="p-2 text-center font-medium border-r">日期</div>
                    <div className="p-2 text-center font-medium">使用者</div>
                  </div>
                  <TableRow>
                    {product.resumeNotes.map((note, index) => (
                      <div key={index} className="grid grid-cols-3 border-b">
                        <div className="col-span-1 p-2 border-r">{note.content}</div>
                        <div className="p-2 border-r text-center">{note.date}</div>
                        <div className="p-2 text-center">{note.user}</div>
                      </div>
                    ))}
                    {product.resumeNotes.length === 0 && (
                      <div className="p-4 text-center text-gray-500 col-span-3">尚未添加任何備註</div>
                    )}
                  </TableRow>
                </TableContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">
          取消
        </Button>
        <Button type="submit">保存產品</Button>
      </div>
    </form>
  )
}

// Export the component as both a named export and a default export
export { ProductFormComponent as ProductForm }

// 添加生成訂單和採購單要求的函數
const generateRequirements = (processData: ProcessRecord[]) => {
  // 訂單零件要求
  const orderReqs = processData
    .filter((proc) => proc.requirements)
    .map((proc) => `${proc.process}：${proc.requirements}`)
    .join("\n")

  // 採購單零件要求
  const materialProc = processData.find((proc) => proc.process === "材料")
  const heatTreatmentProc = processData.find((proc) => proc.process === "熱處理")
  const platingProc = processData.find((proc) => proc.process === "電鍍")
  const screeningProc = processData.find((proc) => proc.process === "篩選")

  const purchaseReqs = []

  if (materialProc && materialProc.requirements) {
    purchaseReqs.push(`材料：${materialProc.requirements}`)
  }

  if (heatTreatmentProc && heatTreatmentProc.requirements) {
    purchaseReqs.push(`熱處理：${heatTreatmentProc.requirements}`)
  }

  if (platingProc && platingProc.requirements) {
    purchaseReqs.push(`電鍍：${platingProc.requirements}`)
  }

  if (screeningProc && screeningProc.requirements) {
    purchaseReqs.push(`篩選：${screeningProc.requirements}`)
  }

  return {
    orderReqs,
    purchaseReqs: purchaseReqs.join("\n"),
  }
}

export default ProductFormComponent
