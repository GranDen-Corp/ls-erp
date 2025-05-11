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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

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

  const handleSubmit = (e: React.FormEvent) => {
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

    onSubmit(submitData)
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
                <div className="border rounded-md">
                  <div className="grid grid-cols-1 gap-0">
                    <div className="grid grid-cols-3 border-b">
                      <div className="bg-gray-100 p-3 border-r font-medium">零件名稱</div>
                      <div className="col-span-2 p-2">
                        <Input
                          id="componentName"
                          value={product.componentName}
                          onChange={(e) => handleInputChange("componentName", e.target.value)}
                          className="border-0 shadow-none focus-visible:ring-0 h-8"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 border-b">
                      <div className="bg-gray-100 p-3 border-r font-medium">規格</div>
                      <div className="col-span-2 p-2">
                        <Input
                          id="specification"
                          value={product.specification}
                          onChange={(e) => handleInputChange("specification", e.target.value)}
                          className="border-0 shadow-none focus-visible:ring-0 h-8"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 border-b">
                      <div className="bg-gray-100 p-3 border-r font-medium">海關碼</div>
                      <div className="col-span-2 p-2">
                        <Input
                          id="customsCode"
                          value={product.customsCode}
                          onChange={(e) => handleInputChange("customsCode", e.target.value)}
                          className="border-0 shadow-none focus-visible:ring-0 h-8"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 border-b">
                      <div className="bg-gray-100 p-3 border-r font-medium">終端客戶</div>
                      <div className="col-span-2 p-2">
                        <Input
                          id="endCustomer"
                          value={product.endCustomer}
                          onChange={(e) => handleInputChange("endCustomer", e.target.value)}
                          className="border-0 shadow-none focus-visible:ring-0 h-8"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 border-b">
                      <div className="bg-gray-100 p-3 border-r font-medium">客戶名稱</div>
                      <div className="col-span-2 grid grid-cols-2">
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
                    </div>
                    <div className="grid grid-cols-3">
                      <div className="bg-gray-100 p-3 border-r font-medium">工廠名稱</div>
                      <div className="col-span-2 grid grid-cols-2">
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
                    </div>
                  </div>
                </div>
              </div>

              {/* 右欄 */}
              <div className="space-y-4">
                <div className="border rounded-md">
                  <div className="grid grid-cols-1 gap-0">
                    <div className="grid grid-cols-3 border-b">
                      <div className="bg-gray-100 p-3 border-r font-medium">產品型別</div>
                      <div className="col-span-2 p-2">
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
                      </div>
                    </div>
                    <div className="grid grid-cols-3 border-b">
                      <div className="bg-gray-100 p-3 border-r font-medium">Part No.</div>
                      <div className="col-span-2 p-2">
                        <Input
                          id="partNo"
                          value={product.partNo}
                          onChange={(e) => handleInputChange("partNo", e.target.value)}
                          className="border-0 shadow-none focus-visible:ring-0 h-8"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 border-b">
                      <div className="bg-gray-100 p-3 border-r font-medium">今湛分類碼</div>
                      <div className="col-span-2 p-2">
                        <Input
                          id="classificationCode"
                          value={product.classificationCode}
                          onChange={(e) => handleInputChange("classificationCode", e.target.value)}
                          className="border-0 shadow-none focus-visible:ring-0 h-8"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 border-b">
                      <div className="bg-gray-100 p-3 border-r font-medium">車廠圖號</div>
                      <div className="col-span-2 p-2">
                        <Input
                          id="vehicleDrawingNo"
                          value={product.vehicleDrawingNo}
                          onChange={(e) => handleInputChange("vehicleDrawingNo", e.target.value)}
                          className="border-0 shadow-none focus-visible:ring-0 h-8"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 border-b">
                      <div className="bg-gray-100 p-3 border-r font-medium">客戶圖號</div>
                      <div className="col-span-2 p-2">
                        <Input
                          id="customerDrawingNo"
                          value={product.customerDrawingNo}
                          onChange={(e) => handleInputChange("customerDrawingNo", e.target.value)}
                          className="border-0 shadow-none focus-visible:ring-0 h-8"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3">
                      <div className="bg-gray-100 p-3 border-r font-medium">產品期稿</div>
                      <div className="col-span-2 p-2">
                        <Input
                          id="productPeriod"
                          value={product.productPeriod}
                          onChange={(e) => handleInputChange("productPeriod", e.target.value)}
                          className="border-0 shadow-none focus-visible:ring-0 h-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
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
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="bg-gray-100 p-3 border-r border-b font-medium w-1/3">原圖版次</td>
                        <td className="p-2 border-b bg-yellow-50">
                          <Input
                            value={product.originalDrawingVersion}
                            onChange={(e) => handleInputChange("originalDrawingVersion", e.target.value)}
                            className="border-0 shadow-none focus-visible:ring-0 h-8"
                            placeholder="輸入原圖版次"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="bg-gray-100 p-3 border-r font-medium">客戶原圖</td>
                        <td className="p-2 bg-yellow-50">
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
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 第二個表格 - 發單製作、客戶圖、工廠圖 */}
                <div className="border rounded-md overflow-hidden mt-6">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="w-1/3 bg-gray-100 p-2 text-left font-medium border-r border-b">發單製作</th>
                        <th className="w-1/3 bg-gray-100 p-2 text-center border-r border-b">客戶圖</th>
                        <th className="w-1/3 bg-gray-100 p-2 text-center border-b">工廠圖</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="bg-gray-100 p-3 border-r border-b font-medium">繪圖版次</td>
                        <td className="p-2 border-r border-b">
                          <Input
                            value={product.customerDrawingVersion}
                            onChange={(e) => handleInputChange("customerDrawingVersion", e.target.value)}
                            className="border-0 shadow-none focus-visible:ring-0 h-8"
                            placeholder="客戶圖版次"
                          />
                        </td>
                        <td className="p-2 border-b">
                          <Input
                            value={product.factoryDrawingVersion}
                            onChange={(e) => handleInputChange("factoryDrawingVersion", e.target.value)}
                            className="border-0 shadow-none focus-visible:ring-0 h-8"
                            placeholder="工廠圖版次"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="bg-gray-100 p-3 border-r font-medium">今湛繪圖</td>
                        <td className="p-2 border-r bg-yellow-50">
                          <div className="flex items-center gap-4">
                            {product.customerDrawing.path ? (
                              <div className="flex-shrink-0 w-16 h-16 bg-gray-100 border flex items-center justify-center">
                                <FileText className="h-8 w-8 text-gray-400" />
                              </div>
                            ) : null}
                            <div className="flex-1">
                              <div className="truncate text-sm">{product.customerDrawing.filename || "未選擇圖面"}</div>
                              {product.customerDrawing.path && (
                                <div className="text-xs text-gray-500 truncate mt-1">
                                  {product.customerDrawing.path}
                                </div>
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
                        </td>
                        <td className="p-2 bg-yellow-50">
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
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

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
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="bg-gray-100 p-2 text-left font-medium border-b">
                          <div className="flex items-center justify-between">
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
                        </th>
                        <th className="w-1/3 bg-gray-100 p-2 text-center font-medium border-b">文件</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border-r border-b">
                          <span>PPAP檔案資料夾</span>
                        </td>
                        <td className="p-2 border-b text-center">
                          <label htmlFor="ppap-upload" className="cursor-pointer text-blue-600 hover:underline">
                            選擇文件連結
                            <input
                              id="ppap-upload"
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, "PPAP")}
                            />
                          </label>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-b">
                          <span>PSW回答</span>
                        </td>
                        <td className="p-2 border-b text-center">
                          <label htmlFor="psw-upload" className="cursor-pointer text-blue-600 hover:underline">
                            選擇文件連結
                            <input
                              id="psw-upload"
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, "PSW")}
                            />
                          </label>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-b">
                          <span>產能分析表</span>
                        </td>
                        <td className="p-2 border-b text-center">
                          <label htmlFor="capacity-upload" className="cursor-pointer text-blue-600 hover:underline">
                            選擇文件連結
                            <input
                              id="capacity-upload"
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, "capacityAnalysis")}
                            />
                          </label>
                        </td>
                      </tr>
                      {customDocuments.map((doc) => (
                        <tr key={doc.id}>
                          <td className="p-2 border-r border-b flex items-center justify-between">
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
                          </td>
                          <td className="p-2 border-b text-center">
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 表格B - 零件管理特性 */}
                <div className="border rounded-md overflow-hidden mt-6">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="bg-gray-100 p-2 text-left font-medium border-b">
                          <div className="flex items-center justify-between">
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
                        </th>
                        <th className="w-1/4 bg-gray-100 p-2 text-center font-medium border-b">狀態</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border-r border-b">
                          <span>安全件</span>
                        </td>
                        <td className="p-2 border-b text-center">
                          <Checkbox
                            checked={product.partManagement.safetyPart}
                            onCheckedChange={(checked) => handlePartManagementChange("safetyPart", checked === true)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-b">
                          <span>汽車件</span>
                        </td>
                        <td className="p-2 border-b text-center">
                          <Checkbox
                            checked={product.partManagement.automotivePart}
                            onCheckedChange={(checked) =>
                              handlePartManagementChange("automotivePart", checked === true)
                            }
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-b">
                          <span>CBAM零件</span>
                        </td>
                        <td className="p-2 border-b text-center">
                          <Checkbox
                            checked={product.partManagement.CBAMPart}
                            onCheckedChange={(checked) => handlePartManagementChange("CBAMPart", checked === true)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-b">
                          <span>時鐘地要求</span>
                        </td>
                        <td className="p-2 border-b text-center">
                          <Checkbox
                            checked={product.partManagement.clockRequirement}
                            onCheckedChange={(checked) =>
                              handlePartManagementChange("clockRequirement", checked === true)
                            }
                          />
                        </td>
                      </tr>
                      {customPartFeatures.map((feature) => (
                        <tr key={feature.id}>
                          <td className="p-2 border-r border-b flex items-center justify-between">
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
                          </td>
                          <td className="p-2 border-b text-center">
                            <Checkbox
                              checked={feature.status}
                              onCheckedChange={(checked) => handlePartFeatureStatusChange(feature.id, checked === true)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 表格C - 符合性要求 */}
                <div className="border rounded-md overflow-hidden mt-6">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th colSpan={5} className="bg-gray-100 p-2 text-center font-medium border-b">
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
                        </th>
                      </tr>
                      <tr>
                        <th className="w-1/6 bg-gray-100 p-2 text-left font-medium border-r border-b">法規</th>
                        <th className="w-1/6 bg-gray-100 p-2 text-center font-medium border-r border-b">零件狀態</th>
                        <th className="w-1/4 bg-gray-100 p-2 text-left font-medium border-r border-b">含有物質</th>
                        <th className="w-1/4 bg-gray-100 p-2 text-left font-medium border-r border-b">理由</th>
                        <th className="w-1/6 bg-gray-100 p-2 text-center font-medium border-b">文件</th>
                      </tr>
                    </thead>
                    <tbody>
                      {["RoHS", "REACh", "EUPOP", "TSCA", "CP65", "PFAS", "CMRT", "EMRT"].map((regulation) => (
                        <tr key={regulation}>
                          <td className="p-2 border-r border-b">{regulation}</td>
                          <td className="p-2 border-r border-b">
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
                          </td>
                          <td className="p-2 border-r border-b">
                            <Input
                              value={
                                product.complianceStatus[regulation as keyof typeof product.complianceStatus].substances
                              }
                              onChange={(e) => handleComplianceFieldChange(regulation, "substances", e.target.value)}
                              className="border-0 shadow-none focus-visible:ring-0 h-8"
                            />
                          </td>
                          <td className="p-2 border-r border-b">
                            <Input
                              value={
                                product.complianceStatus[regulation as keyof typeof product.complianceStatus].reason
                              }
                              onChange={(e) => handleComplianceFieldChange(regulation, "reason", e.target.value)}
                              className="border-0 shadow-none focus-visible:ring-0 h-8"
                            />
                          </td>
                          <td className="p-2 border-b text-center">
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
                          </td>
                        </tr>
                      ))}
                      {customCompliances.map((compliance) => (
                        <tr key={compliance.id}>
                          <td className="p-2 border-r border-b flex items-center justify-between">
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
                          </td>
                          <td className="p-2 border-r border-b">
                            <div className="flex items-center justify-center gap-4">
                              <div className="flex items-center gap-1">
                                <RadioGroup
                                  value={compliance.status}
                                  onValueChange={(value) =>
                                    handleCustomComplianceChange(compliance.id, "status", value)
                                  }
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
                          </td>
                          <td className="p-2 border-r border-b">
                            <Input
                              value={compliance.substances}
                              onChange={(e) =>
                                handleCustomComplianceChange(compliance.id, "substances", e.target.value)
                              }
                              className="border-0 shadow-none focus-visible:ring-0 h-8"
                            />
                          </td>
                          <td className="p-2 border-r border-b">
                            <Input
                              value={compliance.reason}
                              onChange={(e) => handleCustomComplianceChange(compliance.id, "reason", e.target.value)}
                              className="border-0 shadow-none focus-visible:ring-0 h-8"
                            />
                          </td>
                          <td className="p-2 border-b text-center">
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 表格D - 編輯備註 */}
                <div className="border rounded-md overflow-hidden mt-6">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="w-2/3 bg-gray-100 p-2 text-left font-medium border-r border-b">
                          <div className="flex items-center justify-between">
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
                        </th>
                        <th className="w-1/6 bg-gray-100 p-2 text-center font-medium border-r border-b">日期</th>
                        <th className="w-1/6 bg-gray-100 p-2 text-center font-medium border-b">使用者</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.editNotes.map((note, index) => (
                        <tr key={index}>
                          <td className="p-2 border-r border-b">{note.content}</td>
                          <td className="p-2 border-r border-b text-center">{note.date}</td>
                          <td className="p-2 border-b text-center">{note.user}</td>
                        </tr>
                      ))}
                      {product.editNotes.length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-gray-500">
                            尚未添加任何備註
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 添加備註對話框 */}
                <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>添加編輯備註</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="note-content" className="text-right">
                          備註內容
                        </Label>
                        <Textarea
                          id="note-content"
                          value={newNote.content}
                          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                          className="col-span-3"
                          rows={3}
                          placeholder="輸入備註內容"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="note-date" className="text-right">
                          日期
                        </Label>
                        <Input
                          id="note-date"
                          value={newNote.date || new Date().toLocaleDateString("zh-TW")}
                          onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                          className="col-span-3"
                          placeholder="YYYY/MM/DD"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="note-user" className="text-right">
                          使用者
                        </Label>
                        <Input
                          id="note-user"
                          value={newNote.user}
                          onChange={(e) => setNewNote({ ...newNote, user: e.target.value })}
                          className="col-span-3"
                          placeholder="輸入使用者名稱"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        onClick={() => {
                          if (
                            newNote.content &&
                            (newNote.date || new Date().toLocaleDateString("zh-TW")) &&
                            newNote.user
                          ) {
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
                        }}
                        disabled={!newNote.content || !newNote.user}
                      >
                        添加備註
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 新增製程資料頁 */}
        <TabsContent value="process" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th colSpan={5} className="bg-gray-100 p-2 text-center font-medium border-b">
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
                        </th>
                      </tr>
                      <tr>
                        <th className="w-1/6 bg-gray-100 p-2 text-center font-medium border-r border-b">製程</th>
                        <th className="w-1/6 bg-gray-100 p-2 text-center font-medium border-r border-b">廠商</th>
                        <th className="w-1/6 bg-gray-100 p-2 text-center font-medium border-r border-b">產能(SH)</th>
                        <th className="w-1/3 bg-gray-100 p-2 text-center font-medium border-r border-b">要求</th>
                        <th className="w-1/6 bg-gray-100 p-2 text-center font-medium border-b">報告</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.processData.map((proc) => (
                        <tr key={proc.id} className={proc.id === "proc_1" ? "bg-yellow-50" : ""}>
                          <td className="p-2 border-r border-b">
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
                          </td>
                          <td className="p-2 border-r border-b">
                            <Input
                              value={proc.vendor}
                              onChange={(e) => handleProcessFieldChange(proc.id, "vendor", e.target.value)}
                              className="border-0 shadow-none focus-visible:ring-0 h-8"
                            />
                          </td>
                          <td className="p-2 border-r border-b">
                            <Input
                              value={proc.capacity}
                              onChange={(e) => handleProcessFieldChange(proc.id, "capacity", e.target.value)}
                              className="border-0 shadow-none focus-visible:ring-0 h-8"
                            />
                          </td>
                          <td className="p-2 border-r border-b">
                            <Input
                              value={proc.requirements}
                              onChange={(e) => handleProcessFieldChange(proc.id, "requirements", e.target.value)}
                              className="border-0 shadow-none focus-visible:ring-0 h-8"
                            />
                          </td>
                          <td className="p-2 border-b">
                            <Input
                              value={proc.report}
                              onChange={(e) => handleProcessFieldChange(proc.id, "report", e.target.value)}
                              className="border-0 shadow-none focus-visible:ring-0 h-8"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 添加製程對話框 */}
                <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>添加製程資料</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="process-name" className="text-right">
                          製程
                        </Label>
                        <Input
                          id="process-name"
                          value={newProcess.process}
                          onChange={(e) => setNewProcess({ ...newProcess, process: e.target.value })}
                          className="col-span-3"
                          placeholder="輸入製程名稱"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="process-vendor" className="text-right">
                          廠商
                        </Label>
                        <Input
                          id="process-vendor"
                          value={newProcess.vendor}
                          onChange={(e) => setNewProcess({ ...newProcess, vendor: e.target.value })}
                          className="col-span-3"
                          placeholder="輸入廠商名稱"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="process-capacity" className="text-right">
                          產能(SH)
                        </Label>
                        <Input
                          id="process-capacity"
                          value={newProcess.capacity}
                          onChange={(e) => setNewProcess({ ...newProcess, capacity: e.target.value })}
                          className="col-span-3"
                          placeholder="輸入產能"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="process-requirements" className="text-right">
                          要求
                        </Label>
                        <Input
                          id="process-requirements"
                          value={newProcess.requirements}
                          onChange={(e) => setNewProcess({ ...newProcess, requirements: e.target.value })}
                          className="col-span-3"
                          placeholder="輸入要求"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="process-report" className="text-right">
                          報告
                        </Label>
                        <Input
                          id="process-report"
                          value={newProcess.report}
                          onChange={(e) => setNewProcess({ ...newProcess, report: e.target.value })}
                          className="col-span-3"
                          placeholder="輸入報告"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" onClick={handleAddProcess} disabled={!newProcess.process}>
                        添加製程
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* 在製程資料表格後添加訂單和採購單要求表格 */}
                <div className="border rounded-md overflow-hidden mt-6">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="w-1/2 bg-gray-100 p-2 text-center font-medium border-r border-b">
                          訂單零件要求
                        </th>
                        <th className="w-1/2 bg-gray-100 p-2 text-center font-medium border-b">採購單零件要求</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-4 border-r align-top bg-yellow-50">
                          <Textarea
                            value={product.orderRequirements}
                            onChange={(e) => handleInputChange("orderRequirements", e.target.value)}
                            className="border-0 shadow-none focus-visible:ring-0 min-h-[200px] bg-transparent"
                          />
                        </td>
                        <td className="p-4 align-top bg-yellow-50">
                          <Textarea
                            value={product.purchaseRequirements}
                            onChange={(e) => handleInputChange("purchaseRequirements", e.target.value)}
                            className="border-0 shadow-none focus-visible:ring-0 min-h-[200px] bg-transparent"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* 特殊要求/測試表格 */}
                <div className="border rounded-md overflow-hidden mt-6">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="w-2/3 bg-gray-100 p-2 text-left font-medium border-b">
                          <div className="flex items-center justify-between">
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
                        </th>
                        <th className="w-1/6 bg-gray-100 p-2 text-center font-medium border-r border-b">日期</th>
                        <th className="w-1/6 bg-gray-100 p-2 text-center font-medium border-b">使用者</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.specialRequirements.map((req, index) => (
                        <tr key={index}>
                          <td className="p-2 border-r border-b">{req.content}</td>
                          <td className="p-2 border-r border-b text-center">{req.date}</td>
                          <td className="p-2 border-b text-center">{req.user}</td>
                        </tr>
                      ))}
                      {product.specialRequirements.length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-gray-500">
                            尚未添加任何特殊要求
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 添加特殊要求對話框 */}
                <Dialog open={isSpecialReqDialogOpen} onOpenChange={setIsSpecialReqDialogOpen}>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>添加特殊要求/測試</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="special-req-content" className="text-right">
                          要求內容
                        </Label>
                        <Textarea
                          id="special-req-content"
                          value={newSpecialReq.content}
                          onChange={(e) => setNewSpecialReq({ ...newSpecialReq, content: e.target.value })}
                          className="col-span-3"
                          rows={3}
                          placeholder="輸入特殊要求或測試內容"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="special-req-date" className="text-right">
                          日期
                        </Label>
                        <Input
                          id="special-req-date"
                          value={newSpecialReq.date || new Date().toLocaleDateString("zh-TW")}
                          onChange={(e) => setNewSpecialReq({ ...newSpecialReq, date: e.target.value })}
                          className="col-span-3"
                          placeholder="YYYY/MM/DD"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="special-req-user" className="text-right">
                          使用者
                        </Label>
                        <Input
                          id="special-req-user"
                          value={newSpecialReq.user}
                          onChange={(e) => setNewSpecialReq({ ...newSpecialReq, user: e.target.value })}
                          className="col-span-3"
                          placeholder="輸入使用者名稱"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        onClick={handleAddSpecialReq}
                        disabled={!newSpecialReq.content || !newSpecialReq.user}
                      >
                        添加要求
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* 編輯備註表格 */}
                <div className="border rounded-md overflow-hidden mt-6">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="w-2/3 bg-gray-100 p-2 text-left font-medium border-r border-b">
                          <div className="flex items-center justify-between">
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
                        </th>
                        <th className="w-1/6 bg-gray-100 p-2 text-center font-medium border-r border-b">日期</th>
                        <th className="w-1/6 bg-gray-100 p-2 text-center font-medium border-b">使用者</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.processNotes.map((note, index) => (
                        <tr key={index}>
                          <td className="p-2 border-r border-b">{note.content}</td>
                          <td className="p-2 border-r border-b text-center">{note.date}</td>
                          <td className="p-2 border-b text-center">{note.user}</td>
                        </tr>
                      ))}
                      {product.processNotes.length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-gray-500">
                            尚未添加任何備註
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 添加製程備註對話框 */}
                <Dialog open={isProcessNoteDialogOpen} onOpenChange={setIsProcessNoteDialogOpen}>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>添加編輯備註</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="process-note-content" className="text-right">
                          備註內容
                        </Label>
                        <Textarea
                          id="process-note-content"
                          value={newProcessNote.content}
                          onChange={(e) => setNewProcessNote({ ...newProcessNote, content: e.target.value })}
                          className="col-span-3"
                          rows={3}
                          placeholder="輸入備註內容"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="process-note-date" className="text-right">
                          日期
                        </Label>
                        <Input
                          id="process-note-date"
                          value={newProcessNote.date || new Date().toLocaleDateString("zh-TW")}
                          onChange={(e) => setNewProcessNote({ ...newProcessNote, date: e.target.value })}
                          className="col-span-3"
                          placeholder="YYYY/MM/DD"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="process-note-user" className="text-right">
                          使用者
                        </Label>
                        <Input
                          id="process-note-user"
                          value={newProcessNote.user}
                          onChange={(e) => setNewProcessNote({ ...newProcessNote, user: e.target.value })}
                          className="col-span-3"
                          placeholder="輸入使用者名稱"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        onClick={handleAddProcessNote}
                        disabled={!newProcessNote.content || !newProcessNote.user}
                      >
                        添加備註
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resume" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* 模具資訊表格 */}
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="bg-gray-100 p-2 text-left font-medium border-b">模具資訊</th>
                        <th className="bg-gray-100 p-2 text-center font-medium border-b"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border-r border-b bg-gray-50">有無開模具</td>
                        <td className="p-2 border-b">
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
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-b bg-gray-50">模具費</td>
                        <td className="p-2 border-b">
                          <Input
                            type="number"
                            value={product.moldCost || ""}
                            onChange={(e) =>
                              handleInputChange("moldCost", e.target.value ? Number(e.target.value) : "")
                            }
                            className="border-0 shadow-none focus-visible:ring-0 h-8"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r bg-gray-50">可退模具費數量</td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={product.refundableMoldQuantity || ""}
                            onChange={(e) =>
                              handleInputChange("refundableMoldQuantity", e.target.value ? Number(e.target.value) : "")
                            }
                            className="border-0 shadow-none focus-visible:ring-0 h-8"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-b bg-gray-50">已退模</td>
                        <td className="p-2 border-b">
                          <Checkbox
                            checked={product.moldReturned}
                            onCheckedChange={(checked) => handleInputChange("moldReturned", checked === true)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-b bg-gray-50">會計註記</td>
                        <td className="p-2 border-b">
                          <Textarea
                            value={product.accountingNote || ""}
                            onChange={(e) => handleInputChange("accountingNote", e.target.value)}
                            className="border-0 shadow-none focus-visible:ring-0 min-h-[80px]"
                            placeholder="輸入會計相關註記..."
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r bg-gray-50">品質註記</td>
                        <td className="p-2">
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
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 訂單歷史表格 */}
                <div className="border rounded-md overflow-hidden mt-6">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th colSpan={2} className="bg-gray-100 p-2 text-center font-medium border-b">
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
                        </th>
                      </tr>
                      <tr>
                        <td className="w-1/2 bg-gray-100 p-2 text-left font-medium border-r border-b">已出貨數量</td>
                        <td className="w-1/2 bg-gray-100 p-2 text-center font-medium border-b">
                          {product.orderHistory ? product.orderHistory.length : 0}
                        </td>
                      </tr>
                      <tr>
                        <th className="w-1/2 bg-gray-100 p-2 text-center font-medium border-r border-b">訂單號碼</th>
                        <th className="w-1/2 bg-gray-100 p-2 text-center font-medium border-b">訂單數量</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.orderHistory && product.orderHistory.length > 0 ? (
                        product.orderHistory.map((order, index) => (
                          <tr key={index}>
                            <td className="p-2 border-r border-b">
                              <Input
                                value={order.orderNumber}
                                onChange={(e) => handleOrderHistoryChange(index, "orderNumber", e.target.value)}
                                className="border-0 shadow-none focus-visible:ring-0 h-8"
                              />
                            </td>
                            <td className="p-2 border-b">
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
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="p-4 text-center text-gray-500">
                            尚未添加任何訂單歷史
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 添加訂單歷史對話框 */}
                <Dialog open={isOrderHistoryDialogOpen} onOpenChange={setIsOrderHistoryDialogOpen}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>添加訂單歷史</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="order-number" className="text-right">
                          訂單號碼
                        </Label>
                        <Input
                          id="order-number"
                          value={newOrderHistory.orderNumber}
                          onChange={(e) => setNewOrderHistory({ ...newOrderHistory, orderNumber: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="order-quantity" className="text-right">
                          訂單數量
                        </Label>
                        <Input
                          id="order-quantity"
                          type="number"
                          value={newOrderHistory.quantity || ""}
                          onChange={(e) => setNewOrderHistory({ ...newOrderHistory, quantity: Number(e.target.value) })}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" onClick={handleAddOrderHistory}>
                        添加訂單
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                {/* 編輯備註表格 */}
                <div className="border rounded-md overflow-hidden mt-6">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="w-2/3 bg-gray-100 p-2 text-left font-medium border-r border-b">
                          <div className="flex items-center justify-between">
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
                        </th>
                        <th className="w-1/6 bg-gray-100 p-2 text-center font-medium border-r border-b">日期</th>
                        <th className="w-1/6 bg-gray-100 p-2 text-center font-medium border-b">使用者</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.resumeNotes.map((note, index) => (
                        <tr key={index}>
                          <td className="p-2 border-r border-b">{note.content}</td>
                          <td className="p-2 border-r border-b text-center">{note.date}</td>
                          <td className="p-2 border-b text-center">{note.user}</td>
                        </tr>
                      ))}
                      {product.resumeNotes.length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-gray-500">
                            尚未添加任何備註
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 添加履歷備註對話框 */}
                <Dialog open={isResumeNoteDialogOpen} onOpenChange={setIsResumeNoteDialogOpen}>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>添加編輯備註</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="resume-note-content" className="text-right">
                          備註內容
                        </Label>
                        <Textarea
                          id="resume-note-content"
                          value={newResumeNote.content}
                          onChange={(e) => setNewResumeNote({ ...newResumeNote, content: e.target.value })}
                          className="col-span-3"
                          rows={3}
                          placeholder="輸入備註內容"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="resume-note-date" className="text-right">
                          日期
                        </Label>
                        <Input
                          id="resume-note-date"
                          value={newResumeNote.date || new Date().toLocaleDateString("zh-TW")}
                          onChange={(e) => setNewResumeNote({ ...newResumeNote, date: e.target.value })}
                          className="col-span-3"
                          placeholder="YYYY/MM/DD"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="resume-note-user" className="text-right">
                          使用者
                        </Label>
                        <Input
                          id="resume-note-user"
                          value={newResumeNote.user}
                          onChange={(e) => setNewResumeNote({ ...newResumeNote, user: e.target.value })}
                          className="col-span-3"
                          placeholder="輸入使用者名稱"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        onClick={handleAddResumeNote}
                        disabled={!newResumeNote.content || !newResumeNote.user}
                      >
                        添加備註
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
