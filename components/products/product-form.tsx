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
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Plus, Upload, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// 產品表單屬性
interface ProductFormProps {
  productId?: string
  isClone?: boolean
  onSubmit?: (data: any) => void
  initialValues?: any
  isSubmitting?: boolean
  isAssembly?: boolean
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

// 文件記錄類型
interface DocumentRecord {
  document: string
  filename: string
}

// 符合性狀態類型
interface ComplianceStatus {
  status: string
  substances: string
  reason: string
  document: string
  filename: string
}

// 備註類型
interface Note {
  content: string
  date: string
  user: string
}

// 訂單歷史記錄類型
interface OrderHistoryRecord {
  orderNumber: string
  quantity: number
}

// 產品規格類型
interface ProductSpecification {
  name: string
  value: string
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

export function ProductForm({
  productId,
  isClone = false,
  onSubmit,
  initialValues,
  isSubmitting = false,
  isAssembly = false,
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
    customerDrawingVersion: "",
    factoryDrawingVersion: "",
    images: [],
    isAssembly: isAssembly || false,
    components: [],
    assemblyTime: 30,
    assemblyCostPerHour: 10,
    additionalCosts: 0,
    // 符合性要求相關欄位
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
    // 重要文件相關欄位
    importantDocuments: {
      PPAP: emptyDocumentRecord,
      PSW: emptyDocumentRecord,
      capacityAnalysis: emptyDocumentRecord,
    },
    // 零件管理特性相關欄位
    partManagement: {
      safetyPart: false,
      automotivePart: false,
      CBAMPart: false,
      clockRequirement: false,
    },
    // 編輯備註相關欄位
    editNotes: [],
    // 製程資料相關欄位
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
    // 訂單和採購單要求
    orderRequirements: "",
    purchaseRequirements: "",
    specialRequirements: [],
    processNotes: [],
    // 商業條款
    moq: 0,
    leadTime: "",
    packagingRequirements: "",
    // 履歷資料
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

  const [product, setProduct] = useState(safeInitialProduct)
  const [activeTab, setActiveTab] = useState("basic")
  const [newNote, setNewNote] = useState({ content: "", date: "", user: "" })
  const [newProcess, setNewProcess] = useState<ProcessRecord>({
    id: "",
    process: "",
    vendor: "",
    capacity: "",
    requirements: "",
    report: "",
  })
  const [newSpecialReq, setNewSpecialReq] = useState({ content: "", date: "", user: "" })
  const [newProcessNote, setNewProcessNote] = useState({ content: "", date: "", user: "" })
  const [newOrderHistory, setNewOrderHistory] = useState({ orderNumber: "", quantity: 0 })
  const [newResumeNote, setNewResumeNote] = useState({ content: "", date: "", user: "" })
  const [newSpec, setNewSpec] = useState<ProductSpecification>({ name: "", value: "" })

  // 對話框狀態
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false)
  const [isSpecialReqDialogOpen, setIsSpecialReqDialogOpen] = useState(false)
  const [isProcessNoteDialogOpen, setIsProcessNoteDialogOpen] = useState(false)
  const [isOrderHistoryDialogOpen, setIsOrderHistoryDialogOpen] = useState(false)
  const [isResumeNoteDialogOpen, setIsResumeNoteDialogOpen] = useState(false)

  // 資料載入狀態
  const [customersData, setCustomersData] = useState<Customer[]>([])
  const [factories, setFactories] = useState<Supplier[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const supabase = createClientComponentClient()

  // 當initialValues變更時更新product
  useEffect(() => {
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

  // 載入客戶和供應商資料
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

  // 處理輸入變更
  const handleInputChange = (field: string, value: any) => {
    setProduct((prev) => ({ ...prev, [field]: value }))
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

  // 處理添加特殊要求
  const handleAddSpecialReq = () => {
    if (newSpecialReq.content && newSpecialReq.user) {
      const date = newSpecialReq.date || new Date().toLocaleDateString("zh-TW")
      setProduct((prev) => ({
        ...prev,
        specialRequirements: [
          ...(prev.specialRequirements || []),
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

  // 處理添加製程備註
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

  // 處理添加履歷備註
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

  // 處理添加規格
  const handleAddSpecification = () => {
    if (newSpec.name && newSpec.value) {
      setProduct((prev) => ({
        ...prev,
        specifications: [...(prev.specifications || []), { ...newSpec }],
      }))
      setNewSpec({ name: "", value: "" })
    }
  }

  // 處理刪除規格
  const handleRemoveSpecification = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      specifications: (prev.specifications || []).filter((_, i) => i !== index),
    }))
  }

  // 生成訂單和採購單要求
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

  // 提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!product.componentName || !product.partNo || !product.customerName.id || !product.factoryName.id) {
      toast({
        title: "錯誤",
        description: "請填寫必要欄位：零件名稱、Part No.、客戶代碼和工廠代碼",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // 準備要插入的資料
      const productData = {
        // 組合主鍵欄位
        customer_id: product.customerName.id,
        part_no: product.partNo,
        factory_id: product.factoryName.id,

        // 基本資訊
        component_name: product.componentName,
        specification: product.specification,
        customs_code: product.customsCode,
        end_customer: product.endCustomer,
        product_type: product.productType,
        classification_code: product.classificationCode,
        vehicle_drawing_no: product.vehicleDrawingNo,
        customer_drawing_no: product.customerDrawingNo,
        product_period: product.productPeriod,
        description: product.description,
        status: product.status,
        created_date: product.createdDate || new Date().toISOString().split("T")[0],
        last_order_date: product.lastOrderDate,
        last_price: product.lastPrice,
        currency: product.currency,

        // 產品規格
        specifications: product.specifications,
        sample_status: product.sampleStatus,
        sample_date: product.sampleDate,

        // 圖面資訊
        original_drawing_version: product.originalDrawingVersion,
        drawing_version: product.drawingVersion,
        customer_original_drawing: product.customerOriginalDrawing,
        jinzhan_drawing: product.jinzhanDrawing,
        customer_drawing: product.customerDrawing,
        factory_drawing: product.factoryDrawing,
        customer_drawing_version: product.customerDrawingVersion,
        factory_drawing_version: product.factoryDrawingVersion,

        // 產品圖片
        images: product.images,

        // 組裝資訊
        is_assembly: product.isAssembly,
        components: product.components,
        assembly_time: product.assemblyTime,
        assembly_cost_per_hour: product.assemblyCostPerHour,
        additional_costs: product.additionalCosts,

        // 文件與認證
        important_documents: product.importantDocuments,
        part_management: product.partManagement,
        compliance_status: product.complianceStatus,
        edit_notes: product.editNotes,

        // 製程資料
        process_data: product.processData,
        order_requirements: product.orderRequirements,
        purchase_requirements: product.purchaseRequirements,
        special_requirements: product.specialRequirements,
        process_notes: product.processNotes,

        // 履歷資料
        has_mold: product.hasMold,
        mold_cost: product.moldCost,
        refundable_mold_quantity: product.refundableMoldQuantity,
        mold_returned: product.moldReturned,
        accounting_note: product.accountingNote,
        quality_notes: product.qualityNotes,
        order_history: product.orderHistory,
        resume_notes: product.resumeNotes,

        // 商業條款
        moq: product.moq,
        lead_time: product.leadTime,
        packaging_requirements: product.packagingRequirements,
      }

      // 使用 upsert 方法，如果記錄已存在則更新，否則插入新記錄
      const { data, error } = await supabase.from("products").upsert(productData, {
        onConflict: "customer_id,part_no,factory_id",
        returning: "minimal",
      })

      if (error) {
        console.error("保存產品時出錯:", error)
        toast({
          title: "錯誤",
          description: `保存產品失敗: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "成功",
        description: "產品已成功保存",
      })

      // 如果有提供onSubmit回調，則調用它
      if (onSubmit) {
        onSubmit(productData)
      } else {
        // 否則導航到產品列表頁面
        router.push("/products/all")
      }
    } catch (error) {
      console.error("保存產品時出錯:", error)
      toast({
        title: "錯誤",
        description: "保存產品時出錯，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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

        {/* 基本資訊頁籤 */}
        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-6">
            {/* 左側欄位 */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="componentName">零件名稱</Label>
                  <Input
                    id="componentName"
                    value={product.componentName || ""}
                    onChange={(e) => handleInputChange("componentName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specification">規格</Label>
                  <Input
                    id="specification"
                    value={product.specification || ""}
                    onChange={(e) => handleInputChange("specification", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customsCode">海關碼</Label>
                  <Input
                    id="customsCode"
                    value={product.customsCode || ""}
                    onChange={(e) => handleInputChange("customsCode", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endCustomer">終端客戶</Label>
                  <Input
                    id="endCustomer"
                    value={product.endCustomer || ""}
                    onChange={(e) => handleInputChange("endCustomer", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerCode">客戶代碼</Label>
                  <div className="grid grid-cols-2 gap-2">
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
                      <SelectTrigger>
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
                      <SelectTrigger>
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
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="factoryCode">工廠代碼</Label>
                  <div className="grid grid-cols-2 gap-2">
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
                      <SelectTrigger>
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
                      <SelectTrigger>
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
                  </div>
                </div>
              </div>
            </div>

            {/* 右側欄位 */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productType">產品類別</Label>
                  <Input
                    id="productType"
                    value={product.productType || ""}
                    onChange={(e) => handleInputChange("productType", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partNo">Part No.</Label>
                  <Input
                    id="partNo"
                    value={product.partNo || ""}
                    onChange={(e) => handleInputChange("partNo", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="classificationCode">今湛分類碼</Label>
                  <Input
                    id="classificationCode"
                    value={product.classificationCode || ""}
                    onChange={(e) => handleInputChange("classificationCode", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleDrawingNo">車廠圖號</Label>
                  <Input
                    id="vehicleDrawingNo"
                    value={product.vehicleDrawingNo || ""}
                    onChange={(e) => handleInputChange("vehicleDrawingNo", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerDrawingNo">客戶圖號</Label>
                  <Input
                    id="customerDrawingNo"
                    value={product.customerDrawingNo || ""}
                    onChange={(e) => handleInputChange("customerDrawingNo", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productPeriod">產品期稿</Label>
                  <Input
                    id="productPeriod"
                    value={product.productPeriod || ""}
                    onChange={(e) => handleInputChange("productPeriod", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 組裝產品開關 */}
          <div className="space-y-2 pt-4">
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
          <div className="space-y-2 pt-4">
            <Label htmlFor="description">產品描述</Label>
            <Textarea
              id="description"
              value={product.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>
        </TabsContent>

        {/* 產品圖片頁籤 */}
        <TabsContent value="images" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">產品圖片</h3>
                    <Button type="button" size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      添加圖片
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {product.images && product.images.length > 0 ? (
                      product.images.map((image, index) => (
                        <div key={index} className="relative border rounded-md overflow-hidden">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.alt || `產品圖片 ${index + 1}`}
                            className="w-full h-40 object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => {
                              setProduct((prev) => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== index),
                              }))
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 flex flex-col items-center justify-center border border-dashed rounded-md p-6">
                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">尚未添加產品圖片</p>
                        <p className="text-xs text-gray-400">點擊"添加圖片"按鈕上傳產品圖片</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 文件與認證頁籤 */}
        <TabsContent value="documents" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-6">
            {/* 圖面資訊 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">圖面資訊</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="originalDrawingVersion">原圖版次</Label>
                      <Input
                        id="originalDrawingVersion"
                        value={product.originalDrawingVersion || ""}
                        onChange={(e) => handleInputChange("originalDrawingVersion", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerOriginalDrawing">客戶原圖</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          id="customerOriginalDrawing"
                          onChange={(e) => handleFileUpload(e, "customerOriginalDrawing")}
                          className="hidden"
                        />
                        <Input
                          readOnly
                          value={product.customerOriginalDrawing?.filename || "未選擇圖面"}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("customerOriginalDrawing")?.click()}
                        >
                          選擇圖面連結
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">發單製作</h4>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-center">客戶圖</h4>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-center">工廠圖</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="drawingVersion">繪圖版次</Label>
                      <Input
                        id="drawingVersion"
                        value={product.drawingVersion || ""}
                        onChange={(e) => handleInputChange("drawingVersion", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerDrawingVersion">客戶圖版次</Label>
                      <Input
                        id="customerDrawingVersion"
                        value={product.customerDrawingVersion || ""}
                        onChange={(e) => handleInputChange("customerDrawingVersion", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="factoryDrawingVersion">工廠圖版次</Label>
                      <Input
                        id="factoryDrawingVersion"
                        value={product.factoryDrawingVersion || ""}
                        onChange={(e) => handleInputChange("factoryDrawingVersion", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jinzhanDrawing">今湛繪圖</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          id="jinzhanDrawing"
                          onChange={(e) => handleFileUpload(e, "jinzhanDrawing")}
                          className="hidden"
                        />
                        <Input readOnly value={product.jinzhanDrawing?.filename || "未選擇圖面"} className="flex-1" />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("jinzhanDrawing")?.click()}
                        >
                          選擇圖面連結
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerDrawing">客戶圖</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          id="customerDrawing"
                          onChange={(e) => handleFileUpload(e, "customerDrawing")}
                          className="hidden"
                        />
                        <Input readOnly value={product.customerDrawing?.filename || "未選擇圖面"} className="flex-1" />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("customerDrawing")?.click()}
                        >
                          選擇圖面連結
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="factoryDrawing">工廠圖</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          id="factoryDrawing"
                          onChange={(e) => handleFileUpload(e, "factoryDrawing")}
                          className="hidden"
                        />
                        <Input readOnly value={product.factoryDrawing?.filename || "未選擇圖面"} className="flex-1" />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("factoryDrawing")?.click()}
                        >
                          選擇圖面連結
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 重要文件 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">重要文件</h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="PPAP">PPAP認可資料夾</Label>
                      <div className="flex items-center gap-2">
                        <Input type="file" id="PPAP" onChange={(e) => handleFileUpload(e, "PPAP")} className="hidden" />
                        <Input
                          readOnly
                          value={product.importantDocuments?.PPAP?.filename || "未選擇文件"}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("PPAP")?.click()}
                        >
                          選擇文件連結
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="PSW">PSW報告</Label>
                      <div className="flex items-center gap-2">
                        <Input type="file" id="PSW" onChange={(e) => handleFileUpload(e, "PSW")} className="hidden" />
                        <Input
                          readOnly
                          value={product.importantDocuments?.PSW?.filename || "未選擇文件"}
                          className="flex-1"
                        />
                        <Button type="button" variant="outline" onClick={() => document.getElementById("PSW")?.click()}>
                          選擇文件連結
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="capacityAnalysis">產能分析</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          id="capacityAnalysis"
                          onChange={(e) => handleFileUpload(e, "capacityAnalysis")}
                          className="hidden"
                        />
                        <Input
                          readOnly
                          value={product.importantDocuments?.capacityAnalysis?.filename || "未選擇文件"}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("capacityAnalysis")?.click()}
                        >
                          選擇文件連結
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 零件管理特性 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">零件管理特性</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <Label>特性名稱</Label>
                      </div>
                      <div className="text-right">
                        <Label>狀態</Label>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                      <div className="col-span-2">
                        <Label htmlFor="safetyPart">安全件</Label>
                      </div>
                      <div className="flex justify-end">
                        <Checkbox
                          id="safetyPart"
                          checked={product.partManagement?.safetyPart || false}
                          onCheckedChange={(checked) => handlePartManagementChange("safetyPart", checked === true)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                      <div className="col-span-2">
                        <Label htmlFor="automotivePart">汽車件</Label>
                      </div>
                      <div className="flex justify-end">
                        <Checkbox
                          id="automotivePart"
                          checked={product.partManagement?.automotivePart || false}
                          onCheckedChange={(checked) => handlePartManagementChange("automotivePart", checked === true)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                      <div className="col-span-2">
                        <Label htmlFor="CBAMPart">CBAM零件</Label>
                      </div>
                      <div className="flex justify-end">
                        <Checkbox
                          id="CBAMPart"
                          checked={product.partManagement?.CBAMPart || false}
                          onCheckedChange={(checked) => handlePartManagementChange("CBAMPart", checked === true)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                      <div className="col-span-2">
                        <Label htmlFor="clockRequirement">時鐘要求</Label>
                      </div>
                      <div className="flex justify-end">
                        <Checkbox
                          id="clockRequirement"
                          checked={product.partManagement?.clockRequirement || false}
                          onCheckedChange={(checked) =>
                            handlePartManagementChange("clockRequirement", checked === true)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 符合性要求 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">符合性要求</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-5 gap-4">
                      <div>
                        <Label>法規</Label>
                      </div>
                      <div className="text-center">
                        <Label>符合狀態</Label>
                      </div>
                      <div className="text-center">
                        <Label>含有物質</Label>
                      </div>
                      <div className="text-center">
                        <Label>理由</Label>
                      </div>
                      <div className="text-center">
                        <Label>文件</Label>
                      </div>
                    </div>

                    {["RoHS", "REACh", "EUPOP", "TSCA", "CP65", "PFAS", "CMRT", "EMRT"].map((regulation) => (
                      <div key={regulation} className="grid grid-cols-5 gap-4 items-center border-b pb-2">
                        <div>
                          <Label>{regulation}</Label>
                        </div>
                        <div className="text-center">
                          <RadioGroup
                            value={product.complianceStatus?.[regulation]?.status || ""}
                            onValueChange={(value) => handleComplianceStatusChange(regulation, value)}
                            className="flex justify-center space-x-4"
                          >
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="符合" id={`${regulation}-comply`} />
                              <Label htmlFor={`${regulation}-comply`} className="text-sm">
                                符合
                              </Label>
                            </div>
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="不符" id={`${regulation}-not-comply`} />
                              <Label htmlFor={`${regulation}-not-comply`} className="text-sm">
                                不符
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <div>
                          <Input
                            value={product.complianceStatus?.[regulation]?.substances || ""}
                            onChange={(e) => handleComplianceFieldChange(regulation, "substances", e.target.value)}
                            placeholder="含有物質"
                          />
                        </div>
                        <div>
                          <Input
                            value={product.complianceStatus?.[regulation]?.reason || ""}
                            onChange={(e) => handleComplianceFieldChange(regulation, "reason", e.target.value)}
                            placeholder="理由"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            id={`compliance_${regulation}`}
                            onChange={(e) => handleFileUpload(e, `compliance_${regulation}`)}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => document.getElementById(`compliance_${regulation}`)?.click()}
                          >
                            選擇文件連結
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 編輯備註 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">編輯備註</h3>
                    <Button type="button" size="sm" variant="outline" onClick={() => setIsNoteDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      添加備註
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>備註內容</Label>
                    </div>
                    <div className="text-center">
                      <Label>日期</Label>
                    </div>
                    <div className="text-center">
                      <Label>使用者</Label>
                    </div>
                  </div>

                  {product.editNotes && product.editNotes.length > 0 ? (
                    product.editNotes.map((note, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                        <div>
                          <p className="text-sm">{note.content}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm">{note.date}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm">{note.user}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">尚未添加任何備註</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 製程資料頁籤 */}
        <TabsContent value="process" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-6">
            {/* 製程資料 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">製程資料</h3>
                    <Button type="button" size="sm" variant="outline" onClick={() => setIsProcessDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      新增製程
                    </Button>
                  </div>

                  <div className="grid grid-cols-6 gap-4">
                    <div>
                      <Label>製程</Label>
                    </div>
                    <div>
                      <Label>廠商</Label>
                    </div>
                    <div>
                      <Label>產能(SH)</Label>
                    </div>
                    <div>
                      <Label>要求</Label>
                    </div>
                    <div>
                      <Label>報告</Label>
                    </div>
                    <div className="text-center">
                      <Label>操作</Label>
                    </div>
                  </div>

                  {product.processData && product.processData.length > 0 ? (
                    product.processData.map((process) => (
                      <div key={process.id} className="grid grid-cols-6 gap-4 items-center border-b pb-2">
                        <div>
                          <Input
                            value={process.process}
                            onChange={(e) => handleProcessFieldChange(process.id, "process", e.target.value)}
                          />
                        </div>
                        <div>
                          <Input
                            value={process.vendor}
                            onChange={(e) => handleProcessFieldChange(process.id, "vendor", e.target.value)}
                          />
                        </div>
                        <div>
                          <Input
                            value={process.capacity}
                            onChange={(e) => handleProcessFieldChange(process.id, "capacity", e.target.value)}
                          />
                        </div>
                        <div>
                          <Input
                            value={process.requirements}
                            onChange={(e) => handleProcessFieldChange(process.id, "requirements", e.target.value)}
                          />
                        </div>
                        <div>
                          <Input
                            value={process.report}
                            onChange={(e) => handleProcessFieldChange(process.id, "report", e.target.value)}
                          />
                        </div>
                        <div className="text-center">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveProcess(process.id)}
                          >
                            刪除
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">尚未添加任何製程資料</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 訂單零件要求 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">訂單零件要求</h3>
                  <Textarea
                    value={product.orderRequirements || ""}
                    onChange={(e) => handleInputChange("orderRequirements", e.target.value)}
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 採購零件要求 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">採購零件要求</h3>
                  <Textarea
                    value={product.purchaseRequirements || ""}
                    onChange={(e) => handleInputChange("purchaseRequirements", e.target.value)}
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 特殊要求/測試 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">特殊要求/測試</h3>
                    <Button type="button" size="sm" variant="outline" onClick={() => setIsSpecialReqDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      添加特殊要求
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>要求內容</Label>
                    </div>
                    <div className="text-center">
                      <Label>日期</Label>
                    </div>
                    <div className="text-center">
                      <Label>使用者</Label>
                    </div>
                  </div>

                  {product.specialRequirements && product.specialRequirements.length > 0 ? (
                    product.specialRequirements.map((req, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                        <div>
                          <p className="text-sm">{req.content}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm">{req.date}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm">{req.user}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">尚未添加任何特殊要求</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 製程備註 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">製程備註</h3>
                    <Button type="button" size="sm" variant="outline" onClick={() => setIsProcessNoteDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      添加備註
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>備註內容</Label>
                    </div>
                    <div className="text-center">
                      <Label>日期</Label>
                    </div>
                    <div className="text-center">
                      <Label>使用者</Label>
                    </div>
                  </div>

                  {product.processNotes && product.processNotes.length > 0 ? (
                    product.processNotes.map((note, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                        <div>
                          <p className="text-sm">{note.content}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm">{note.date}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm">{note.user}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">尚未添加任何製程備註</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 履歷資料頁籤 */}
        <TabsContent value="resume" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-6">
            {/* 模具資訊 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">模具資訊</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasMold"
                          checked={product.hasMold || false}
                          onCheckedChange={(checked) => handleInputChange("hasMold", checked === true)}
                        />
                        <Label htmlFor="hasMold">有無開模具</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="moldReturned"
                          checked={product.moldReturned || false}
                          onCheckedChange={(checked) => handleInputChange("moldReturned", checked === true)}
                          disabled={!product.hasMold}
                        />
                        <Label htmlFor="moldReturned">已退模</Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="moldCost">模具費</Label>
                      <Input
                        id="moldCost"
                        type="number"
                        value={product.moldCost || ""}
                        onChange={(e) => handleInputChange("moldCost", e.target.value)}
                        disabled={!product.hasMold}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="refundableMoldQuantity">可退模數量</Label>
                      <Input
                        id="refundableMoldQuantity"
                        type="number"
                        value={product.refundableMoldQuantity || ""}
                        onChange={(e) => handleInputChange("refundableMoldQuantity", e.target.value)}
                        disabled={!product.hasMold}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountingNote">會計註記</Label>
                    <Textarea
                      id="accountingNote"
                      value={product.accountingNote || ""}
                      onChange={(e) => handleInputChange("accountingNote", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 訂單歷史 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">訂單歷史</h3>
                    <Button type="button" size="sm" variant="outline" onClick={() => setIsOrderHistoryDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      添加訂單記錄
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <Label>已出貨數量</Label>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="font-bold">
                          {product.orderHistory?.reduce((sum, order) => sum + (order.quantity || 0), 0) || 0}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>訂單號碼</Label>
                      </div>
                      <div className="text-center">
                        <Label>訂單數量</Label>
                      </div>
                    </div>

                    {product.orderHistory && product.orderHistory.length > 0 ? (
                      product.orderHistory.map((order, index) => (
                        <div key={index} className="grid grid-cols-2 gap-4 items-center border-b pb-2">
                          <div>
                            <Input
                              value={order.orderNumber}
                              onChange={(e) => handleOrderHistoryChange(index, "orderNumber", e.target.value)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={order.quantity}
                              onChange={(e) =>
                                handleOrderHistoryChange(index, "quantity", Number.parseInt(e.target.value) || 0)
                              }
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => handleRemoveOrderHistory(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">尚未添加任何訂單歷史</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 履歷備註 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">履歷備註</h3>
                    <Button type="button" size="sm" variant="outline" onClick={() => setIsResumeNoteDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      添加備註
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>備註內容</Label>
                    </div>
                    <div className="text-center">
                      <Label>日期</Label>
                    </div>
                    <div className="text-center">
                      <Label>使用者</Label>
                    </div>
                  </div>

                  {product.resumeNotes && product.resumeNotes.length > 0 ? (
                    product.resumeNotes.map((note, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                        <div>
                          <p className="text-sm">{note.content}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm">{note.date}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm">{note.user}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">尚未添加任何履歷備註</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 商業條款頁籤 */}
        <TabsContent value="commercial" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">商業條款</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="moq">最小訂購量 (MOQ)</Label>
                      <Input
                        id="moq"
                        type="number"
                        value={product.moq || ""}
                        onChange={(e) => handleInputChange("moq", Number.parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="leadTime">交貨時間</Label>
                      <Input
                        id="leadTime"
                        value={product.leadTime || ""}
                        onChange={(e) => handleInputChange("leadTime", e.target.value)}
                        placeholder="例如: 30天"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="packagingRequirements">包裝要求</Label>
                    <Textarea
                      id="packagingRequirements"
                      value={product.packagingRequirements || ""}
                      onChange={(e) => handleInputChange("packagingRequirements", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 組裝資訊頁籤 */}
        <TabsContent value="assembly" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">組裝資訊</h3>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is-assembly-tab"
                        checked={product.isAssembly || false}
                        onCheckedChange={(checked) => handleInputChange("isAssembly", checked)}
                      />
                      <Label htmlFor="is-assembly-tab">這是一個組裝產品</Label>
                    </div>
                  </div>

                  {product.isAssembly ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="assemblyTime">組裝時間 (分鐘)</Label>
                          <Input
                            id="assemblyTime"
                            type="number"
                            value={product.assemblyTime || 0}
                            onChange={(e) => handleInputChange("assemblyTime", Number.parseInt(e.target.value) || 0)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="assemblyCostPerHour">組裝人工成本 (每小時)</Label>
                          <Input
                            id="assemblyCostPerHour"
                            type="number"
                            value={product.assemblyCostPerHour || 0}
                            onChange={(e) =>
                              handleInputChange("assemblyCostPerHour", Number.parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="additionalCosts">額外成本</Label>
                          <Input
                            id="additionalCosts"
                            type="number"
                            value={product.additionalCosts || 0}
                            onChange={(e) =>
                              handleInputChange("additionalCosts", Number.parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>組件清單</Label>
                          <Button type="button" variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            添加組件
                          </Button>
                        </div>

                        {product.components && product.components.length > 0 ? (
                          <div className="border rounded-md overflow-hidden">
                            <div className="grid grid-cols-5 gap-4 bg-gray-100 p-2">
                              <div>
                                <Label>組件名稱</Label>
                              </div>
                              <div>
                                <Label>Part No.</Label>
                              </div>
                              <div>
                                <Label>工廠</Label>
                              </div>
                              <div className="text-center">
                                <Label>數量</Label>
                              </div>
                              <div className="text-center">
                                <Label>單價</Label>
                              </div>
                            </div>

                            {product.components.map((component, index) => (
                              <div key={index} className="grid grid-cols-5 gap-4 p-2 border-t">
                                <div>
                                  <p>{component.productName}</p>
                                </div>
                                <div>
                                  <p>{component.productPN}</p>
                                </div>
                                <div>
                                  <p>{component.factoryName}</p>
                                </div>
                                <div className="text-center">
                                  <Input
                                    type="number"
                                    value={component.quantity}
                                    onChange={(e) => {
                                      const newComponents = [...product.components]
                                      newComponents[index].quantity = Number.parseInt(e.target.value) || 1
                                      handleInputChange("components", newComponents)
                                    }}
                                    className="w-20 mx-auto text-center"
                                  />
                                </div>
                                <div className="text-center">
                                  <p>{component.unitPrice.toFixed(2)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 border rounded-md text-gray-500">尚未添加任何組件</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <p>此產品未設定為組裝產品</p>
                      <p className="text-sm">請開啟上方的組裝產品開關以啟用組裝資訊設定</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => router.push("/products/all")}>
          取消
        </Button>
        <Button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            "保存產品"
          )}
        </Button>
      </div>
    </form>
  )
}

// 生成訂單和採購單要求的函數
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

export default ProductForm
