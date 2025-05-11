"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import type { ProductComponent } from "@/types/assembly-product"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { saveProduct } from "@/app/actions/product-actions"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

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
  initialValues?: any
  isSubmitting?: boolean
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

// 客戶類型
interface Customer {
  id: string
  name: string
  code: string
}

// 供應商類型
interface Supplier {
  id: string
  name: string
  code: string
}

// 默認的空文件對象
const emptyFileObject = {
  path: "",
  filename: "",
}

// 默認的空符合性狀態
const emptyComplianceStatus = {
  status: "",
  substances: "",
  reason: "",
  document: "",
  filename: "",
}

// 默認的空文件記錄
const emptyDocumentRecord = {
  document: "",
  filename: "",
}

// This is the component implementation
function ProductFormComponent({
  productId,
  isClone = false,
  onSubmit,
  initialValues,
  isSubmitting = false,
}: ProductFormProps) {
  // 初始化默認產品數據
  const defaultProduct = {
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
    customerOriginalDrawing: emptyFileObject,
    jinzhanDrawing: emptyFileObject,
    customerDrawing: emptyFileObject,
    factoryDrawing: emptyFileObject,
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
      RoHS: emptyComplianceStatus,
      REACh: emptyComplianceStatus,
      EUPOP: emptyComplianceStatus,
      TSCA: emptyComplianceStatus,
      CP65: emptyComplianceStatus,
      PFAS: emptyComplianceStatus,
      CMRT: emptyComplianceStatus,
      EMRT: emptyComplianceStatus,
    },
    // 新增重要文件相關欄位
    importantDocuments: {
      PPAP: emptyDocumentRecord,
      PSW: emptyDocumentRecord,
      capacityAnalysis: emptyDocumentRecord,
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
    ],
    // 添加新欄位
    orderRequirements: "",
    purchaseRequirements: "",
    moq: 0,
    leadTime: "",
    packagingRequirements: "",
    specialRequirements: [],
    processNotes: [],
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

  // 如果有初始值，使用初始值，否則使用默認值
  const initialProduct = initialValues || (productId ? { ...defaultProduct, id: productId } : defaultProduct)

  // 確保所有必要的對象都存在
  const safeInitialProduct = {
    ...defaultProduct,
    ...initialProduct,
    customerOriginalDrawing: initialProduct.customerOriginalDrawing || emptyFileObject,
    jinzhanDrawing: initialProduct.jinzhanDrawing || emptyFileObject,
    customerDrawing: initialProduct.customerDrawing || emptyFileObject,
    factoryDrawing: initialProduct.factoryDrawing || emptyFileObject,
    complianceStatus: {
      ...defaultProduct.complianceStatus,
      ...(initialProduct.complianceStatus || {}),
    },
    importantDocuments: {
      ...defaultProduct.importantDocuments,
      ...(initialProduct.importantDocuments || {}),
    },
    partManagement: {
      ...defaultProduct.partManagement,
      ...(initialProduct.partManagement || {}),
    },
    processData: initialProduct.processData || defaultProduct.processData,
  }

  // 添加在 useState 聲明後
  const [product, setProduct] = useState(safeInitialProduct)

  // 添加這段代碼
  useEffect(() => {
    // 當initialValues變更時更新product
    if (initialValues) {
      const updatedProduct = {
        ...defaultProduct,
        ...initialValues,
        customerOriginalDrawing: initialValues.customerOriginalDrawing || emptyFileObject,
        jinzhanDrawing: initialValues.jinzhanDrawing || emptyFileObject,
        customerDrawing: initialValues.customerDrawing || emptyFileObject,
        factoryDrawing: initialValues.factoryDrawing || emptyFileObject,
        complianceStatus: {
          ...defaultProduct.complianceStatus,
          ...(initialValues.complianceStatus || {}),
        },
        importantDocuments: {
          ...defaultProduct.importantDocuments,
          ...(initialValues.importantDocuments || {}),
        },
        partManagement: {
          ...defaultProduct.partManagement,
          ...(initialValues.partManagement || {}),
        },
        processData: initialValues.processData || defaultProduct.processData,
      }
      setProduct(updatedProduct)

      // 初始化訂單和採購單要求
      const { orderReqs, purchaseReqs } = generateRequirements(updatedProduct.processData || [])
      setProduct((prev) => ({
        ...prev,
        orderRequirements: prev.orderRequirements || orderReqs,
        purchaseRequirements: prev.purchaseRequirements || purchaseReqs,
      }))
    }
  }, [initialValues])

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

  const handleAddSpecification = () => {
    if (newSpec.name && newSpec.value) {
      setProduct((prev) => ({
        ...prev,
        specifications: [...(prev.specifications || []), { ...newSpec }],
      }))
      setNewSpec({ name: "", value: "" })
    }
  }

  const handleRemoveSpecification = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      specifications: (prev.specifications || []).filter((_, i) => i !== index),
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
      components: [...(prev.components || []), newComponent],
    }))
    setSelectedComponent("")
  }

  // 處理移除組件
  const handleRemoveComponent = (componentId: string) => {
    setProduct((prev) => ({
      ...prev,
      components: (prev.components || []).filter((c) => c.id !== componentId),
    }))
  }

  // 處理組件數量變更
  const handleComponentQuantityChange = (componentId: string, quantity: number) => {
    setProduct((prev) => ({
      ...prev,
      components: (prev.components || []).map((c) => {
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
    const componentsCost = (product.components || []).reduce((sum, component) => {
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
      const updatedProcessData = [...(prev.processData || []), processRecord]

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
      const updatedProcessData = (prev.processData || []).filter((proc) => proc.id !== id)

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
      const updatedProcessData = (prev.processData || []).map((proc) => {
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
            ...(prev.importantDocuments || {}),
            PPAP: { document: fileData.path, filename: fileData.filename },
          },
        }))
        break
      case "PSW":
        setProduct((prev) => ({
          ...prev,
          importantDocuments: {
            ...(prev.importantDocuments || {}),
            PSW: { document: fileData.path, filename: fileData.filename },
          },
        }))
        break
      case "capacityAnalysis":
        setProduct((prev) => ({
          ...prev,
          importantDocuments: {
            ...(prev.importantDocuments || {}),
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
              ...(prev.complianceStatus || {}),
              [regulation]: {
                ...(prev.complianceStatus?.[regulation as keyof typeof prev.complianceStatus] || emptyComplianceStatus),
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
        ...(prev.complianceStatus || {}),
        [regulation]: {
          ...(prev.complianceStatus?.[regulation as keyof typeof prev.complianceStatus] || emptyComplianceStatus),
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
        ...(prev.complianceStatus || {}),
        [regulation]: {
          ...(prev.complianceStatus?.[regulation as keyof typeof prev.complianceStatus] || emptyComplianceStatus),
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
        ...(prev.partManagement || {}),
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
          ...(prev.editNotes || []),
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
      customer_id: product.customerName?.id,
      factory_id: product.factoryName?.id,
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
          ...(prev.specialRequirements || []),
          {
            id: `req_${Date.now()}`,
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
          ...(prev.processNotes || []),
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
          ...(prev.resumeNotes || []),
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

  // 渲染備註對話框
  const renderNoteDialog = () => (
    <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
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
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="note-date" className="text-right">
              日期
            </Label>
            <Input
              id="note-date"
              type="date"
              value={newNote.date}
              onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
              className="col-span-3"
              placeholder={new Date().toLocaleDateString("zh-TW")}
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleAddEditNote} disabled={!newNote.content || !newNote.user}>
            添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // 渲染製程對話框
  const renderProcessDialog = () => (
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleAddProcess} disabled={!newProcess.process}>
            添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // 渲染特殊要求對話框
  const renderSpecialReqDialog = () => (
    <Dialog open={isSpecialReqDialogOpen} onOpenChange={setIsSpecialReqDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
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
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="special-req-date" className="text-right">
              日期
            </Label>
            <Input
              id="special-req-date"
              type="date"
              value={newSpecialReq.date}
              onChange={(e) => setNewSpecialReq({ ...newSpecialReq, date: e.target.value })}
              className="col-span-3"
              placeholder={new Date().toLocaleDateString("zh-TW")}
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleAddSpecialReq} disabled={!newSpecialReq.content || newSpecialReq.user}>
            添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // 渲染製程備註對話框
  const renderProcessNoteDialog = () => (
    <Dialog open={isProcessNoteDialogOpen} onOpenChange={setIsProcessNoteDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加製程備註</DialogTitle>
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
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="process-note-date" className="text-right">
              日期
            </Label>
            <Input
              id="process-note-date"
              type="date"
              value={newProcessNote.date}
              onChange={(e) => setNewProcessNote({ ...newProcessNote, date: e.target.value })}
              className="col-span-3"
              placeholder={new Date().toLocaleDateString("zh-TW")}
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleAddProcessNote}
            disabled={!newProcessNote.content || newProcessNote.user}
          >
            添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // 渲染履歷備註對話框
  const renderResumeNoteDialog = () => (
    <Dialog open={isResumeNoteDialogOpen} onOpenChange={setIsResumeNoteDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加履歷備註</DialogTitle>
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
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="resume-note-date" className="text-right">
              日期
            </Label>
            <Input
              id="resume-note-date"
              type="date"
              value={newResumeNote.date}
              onChange={(e) => setNewResumeNote({ ...newResumeNote, date: e.target.value })}
              className="col-span-3"
              placeholder={new Date().toLocaleDateString("zh-TW")}
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleAddResumeNote} disabled={!newResumeNote.content || newResumeNote.user}>
            添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // 在ProductForm組件內部，在return語句之前添加以下代碼
  const supabase = createClientComponentClient()
  const [customersData, setCustomersData] = useState<{ id: string; name: string; code: string }[]>([])
  const [factories, setFactories] = useState<{ id: string; name: string; code: string }[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchOptions() {
      setDataLoading(true)
      setDataError(null)

      try {
        // 獲取客戶數據
        const { data: customers, error: customersError } = await supabase
          .from("customers")
          .select("customer_id, customer_short_name")
          .order("customer_id")

        if (customersError) throw new Error(`獲取客戶數據失敗: ${customersError.message}`)

        // 將數據轉換為組件需要的格式
        const formattedCustomers =
          customers?.map((customer) => ({
            id: customer.customer_id,
            name: customer.customer_short_name,
            code: customer.customer_id || "",
          })) || []

        // 嘗試獲取供應商數據
        let formattedFactories = []
        try {
          const { data: factoriesData, error: factoriesError } = await supabase
            .from("suppliers")
            .select("factory_id, factory_name")
            .order("factory_id")

          if (!factoriesError && factoriesData) {
            formattedFactories = factoriesData.map((supplier) => ({
              id: supplier.factory_id,
              name: supplier.factory_name,
              code: supplier.factory_id || "",
            }))
          }
        } catch (factoryError) {
          console.warn("獲取工廠數據失敗，使用空數組作為後備:", factoryError)
          // 使用空數組作為後備，允許應用繼續運行
        }

        setCustomersData(formattedCustomers)
        setFactories(formattedFactories)
      } catch (err) {
        console.error("獲取選項數據失敗:", err)
        setDataError(err instanceof Error ? err.message : "獲取數據時發生未知錯誤")
      } finally {
        setDataLoading(false)
      }
    }

    fetchOptions()
  }, [])

  const handleRetry = () => {
    setDataLoading(true)
    setDataError(null)

    // 重新獲取數據的函數
    const fetchOptions = async () => {
      try {
        // 獲取客戶數據
        const { data: customers, error: customersError } = await supabase
          .from("customers")
          .select("id, name, code")
          .order("code")

        if (customersError) throw new Error(`獲取客戶數據失敗: ${customersError.message}`)

        // 將數據轉換為組件需要的格式
        const formattedCustomers =
          customers?.map((customer) => ({
            id: customer.id,
            name: customer.name,
            code: customer.code || "",
          })) || []

        // 獲取供應商數據
        const { data: factoriesData, error: factoriesError } = await supabase
          .from("suppliers")
          .select("supplier_id, supplier_name")
          .order("supplier_id")

        if (factoriesError) throw new Error(`獲取供應商數據失敗: ${factoriesError.message}`)

        // 將數據轉換為組件需要的格式
        const formattedFactories =
          factoriesData?.map((supplier) => ({
            id: supplier.supplier_id,
            name: supplier.supplier_name,
            code: supplier.supplier_id || "",
          })) || []

        setCustomersData(formattedCustomers)
        setFactories(formattedFactories)
        setDataLoading(false)
      } catch (err) {
        console.error("重試獲取選項數據失敗:", err)
        setDataError(err instanceof Error ? err.message : "重試獲取數據時發生未知錯誤")
        setDataLoading(false)
      }
    }

    fetchOptions()
  }

  // 如果正在加載產品數據，顯示加載狀態
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
          <p className="text-gray-500">正在載入產品資料...</p>
        </div>
      </div>
    )
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
                        value={product.componentName || ""}
                        onChange={(e) => handleInputChange("componentName", e.target.value)}
                        className="border-0 shadow-none focus-visible:ring-0 h-8"
                      />
                    </TableCell>
                    <TableCell label="規格">
                      <Input
                        id="specification"
                        value={product.specification || ""}
                        onChange={(e) => handleInputChange("specification", e.target.value)}
                        className="border-0 shadow-none focus-visible:ring-0 h-8"
                      />
                    </TableCell>
                    <TableCell label="海關碼">
                      <Input
                        id="customsCode"
                        value={product.customsCode || ""}
                        onChange={(e) => handleInputChange("customsCode", e.target.value)}
                        className="border-0 shadow-none focus-visible:ring-0 h-8"
                      />
                    </TableCell>
                    <TableCell label="終端客戶">
                      <Input
                        id="endCustomer"
                        value={product.endCustomer || ""}
                        onChange={(e) => handleInputChange("endCustomer", e.target.value)}
                        className="border-0 shadow-none focus-visible:ring-0 h-8"
                      />
                    </TableCell>
                    <TableCell label="客戶代碼">
                      <div className="grid grid-cols-2">
                        <div className="p-2 border-r">
                          {dataLoading ? (
                            <div className="flex items-center justify-center h-8">
                              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                            </div>
                          ) : dataError ? (
                            <div className="text-red-500 text-sm">{dataError}</div>
                          ) : (
                            <Select
                              value={product.customerName?.id || ""}
                              onValueChange={(value) => {
                                const selectedCustomer = customersData.find((c) => c.id === value)
                                if (selectedCustomer) {
                                  setProduct((prev) => ({
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
                              <SelectTrigger className="border-0 shadow-none focus:ring-0 h-8">
                                <SelectValue placeholder="選擇客戶代碼" />
                              </SelectTrigger>
                              <SelectContent>
                                {customersData.map((customer) => (
                                  <SelectItem key={customer.id} value={customer.id}>
                                    {customer.code}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        <div className="p-2 bg-gray-50">
                          {dataLoading ? (
                            <div className="flex items-center justify-center h-8">
                              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                            </div>
                          ) : dataError ? (
                            <div className="text-red-500 text-sm">{dataError}</div>
                          ) : (
                            <Select
                              value={product.customerName?.name || ""}
                              onValueChange={(value) => {
                                const selectedCustomer = customersData.find((c) => c.name === value)
                                if (selectedCustomer) {
                                  setProduct((prev) => ({
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
                              <SelectTrigger className="border-0 shadow-none focus:ring-0 h-8 bg-gray-50">
                                <SelectValue placeholder="選擇客戶名稱" />
                              </SelectTrigger>
                              <SelectContent>
                                {customersData.map((customer) => (
                                  <SelectItem key={customer.id} value={customer.name}>
                                    {customer.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell label="工廠代碼">
                      <div className="grid grid-cols-2">
                        <div className="p-2 border-r">
                          {dataLoading ? (
                            <div className="flex items-center justify-center h-8">
                              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                            </div>
                          ) : dataError ? (
                            <div className="text-red-500 text-sm">{dataError}</div>
                          ) : (
                            <Select
                              value={product.factoryName?.id || ""}
                              onValueChange={(value) => {
                                const selectedFactory = factories.find((f) => f.id === value)
                                if (selectedFactory) {
                                  setProduct((prev) => ({
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
                              <SelectTrigger className="border-0 shadow-none focus:ring-0 h-8">
                                <SelectValue placeholder="選擇工廠代碼" />
                              </SelectTrigger>
                              <SelectContent>
                                {factories.map((factory) => (
                                  <SelectItem key={factory.id} value={factory.id}>
                                    {factory.code}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        <div className="p-2 bg-gray-50">
                          {dataLoading ? (
                            <div className="flex items-center justify-center h-8">
                              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                            </div>
                          ) : dataError ? (
                            <div className="text-red-500 text-sm">{dataError}</div>
                          ) : (
                            <Select
                              value={product.factoryName?.name || ""}
                              onValueChange={(value) => {
                                const selectedFactory = factories.find((f) => f.name === value)
                                if (selectedFactory) {
                                  setProduct((prev) => ({
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
                              <SelectTrigger className="border-0 shadow-none focus:ring-0 h-8 bg-gray-50">
                                <SelectValue placeholder="選擇工廠名稱" />
                              </SelectTrigger>
                              <SelectContent>
                                {factories.map((factory) => (
                                  <SelectItem key={factory.id} value={factory.name}>
                                    {factory.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
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
                    <TableCell label="產品類別">
                      <Input
                        id="productType"
                        value={product.productType || ""}
                        onChange={(e) => handleInputChange("productType", e.target.value)}
                        className="border-0 shadow-none focus-visible:ring-0 h-8"
                      />
                    </TableCell>
                    <TableCell label="Part No.">
                      <Input
                        id="partNo"
                        value={product.partNo || ""}
                        onChange={(e) => handleInputChange("partNo", e.target.value)}
                        className="border-0 shadow-none focus-visible:ring-0 h-8"
                      />
                    </TableCell>
                    <TableCell label="今湛分類碼">
                      <Input
                        id="classificationCode"
                        value={product.classificationCode || ""}
                        onChange={(e) => handleInputChange("classificationCode", e.target.value)}
                        className="border-0 shadow-none focus-visible:ring-0 h-8"
                      />
                    </TableCell>
                    <TableCell label="車廠圖號">
                      <Input
                        id="vehicleDrawingNo"
                        value={product.vehicleDrawingNo || ""}
                        onChange={(e) => handleInputChange("vehicleDrawingNo", e.target.value)}
                        className="border-0 shadow-none focus-visible:ring-0 h-8"
                      />
                    </TableCell>
                    <TableCell label="客戶圖號">
                      <Input
                        id="customerDrawingNo"
                        value={product.customerDrawingNo || ""}
                        onChange={(e) => handleInputChange("customerDrawingNo", e.target.value)}
                        className="border-0 shadow-none focus-visible:ring-0 h-8"
                      />
                    </TableCell>
                    <TableCell label="產品期稿">
                      <Input
                        id="productPeriod"
                        value={product.productPeriod || ""}
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
                  checked={product.isAssembly || false}
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
                value={product.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </TabsContent>

        {/* 其他TabsContent保持不變 */}
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">
          取消
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            "保存產品"
          )}
        </Button>
      </div>

      {/* 渲染對話框 */}
      {renderNoteDialog()}
      {renderProcessDialog()}
      {renderSpecialReqDialog()}
      {renderProcessNoteDialog()}
      {renderResumeNoteDialog()}
      {renderAddCustomFieldDialog("importantDocuments")}
      {renderAddCustomFieldDialog("partManagement")}
      {renderAddCustomFieldDialog("compliance")}
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
