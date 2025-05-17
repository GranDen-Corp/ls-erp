"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Plus, X, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Add Dialog imports
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

// 產品表單屬性
interface ProductFormProps {
  productId?: string
  isClone?: boolean
  onSubmit?: (data: any) => void
  initialValues?: any
  isSubmitting?: boolean
  isAssembly?: boolean
  defaultTab?: string
}

// 產品類別類型
interface ProductType {
  id: number
  type_code: string
  type_name: string
  description: string
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

// 產品部件類型
interface ProductComponent {
  part_no: string
  description: string
}

// 產品類型
interface Product {
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
  specifications: ProductSpecification[]
  sample_status: string
  sample_date: string
  original_drawing_version: string
  drawing_version: string
  customer_original_drawing: DocumentRecord
  jinzhan_drawing: DocumentRecord
  customer_drawing: DocumentRecord
  factory_drawing: DocumentRecord
  customer_drawing_version: string
  factory_drawing_version: string
  images: string[]
  is_assembly: boolean
  components: string[]
  assembly_time: number
  assembly_cost_per_hour: number
  additional_costs: number
  important_documents: {
    PPAP: DocumentRecord
    PSW: DocumentRecord
    capacityAnalysis: DocumentRecord
  }
  part_management: {
    safetyPart: boolean
    automotivePart: boolean
    CBAMPart: boolean
    clockRequirement: boolean
  }
  compliance_status: {
    RoHS: ComplianceStatus
    REACh: ComplianceStatus
    EUPOP: ComplianceStatus
    TSCA: ComplianceStatus
    CP65: ComplianceStatus
    PFAS: ComplianceStatus
    CMRT: ComplianceStatus
    EMRT: ComplianceStatus
  }
  edit_notes: Note[]
  process_data: ProcessRecord[]
  order_requirements: string
  purchase_requirements: string
  special_requirements: Note[]
  process_notes: Note[]
  has_mold: boolean
  mold_cost: string
  refundable_mold_quantity: string
  mold_returned: boolean
  accounting_note: string
  quality_notes: Note[]
  order_history: OrderHistoryRecord[]
  resume_notes: Note[]
  moq: number
  lead_time: string
  packaging_requirements: string
  sub_part_no?: ProductComponent[] | string
}

// 產品表單值類型
interface ProductFormValues {
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
  specifications: ProductSpecification[]
  sample_status: string
  sample_date: string
  original_drawing_version: string
  drawing_version: string
  customer_original_drawing: DocumentRecord
  jinzhan_drawing: DocumentRecord
  customer_drawing: DocumentRecord
  factory_drawing: DocumentRecord
  customer_drawing_version: string
  factory_drawing_version: string
  images: string[]
  isAssembly: boolean
  subPartNo?: any
  components?: any[]
  assembly_time: number
  assembly_cost_per_hour: number
  additional_costs: number
  important_documents: {
    PPAP: DocumentRecord
    PSW: DocumentRecord
    capacityAnalysis: DocumentRecord
  }
  part_management: {
    safetyPart: boolean
    automotivePart: boolean
    CBAMPart: boolean
    clockRequirement: boolean
  }
  compliance_status: {
    RoHS: ComplianceStatus
    REACh: ComplianceStatus
    EUPOP: ComplianceStatus
    TSCA: ComplianceStatus
    CP65: ComplianceStatus
    PFAS: ComplianceStatus
    CMRT: ComplianceStatus
    EMRT: ComplianceStatus
  }
  edit_notes: Note[]
  process_data: ProcessRecord[]
  order_requirements: string
  purchase_requirements: string
  special_requirements: Note[]
  process_notes: Note[]
  has_mold: boolean
  mold_cost: string
  refundable_mold_quantity: string
  mold_returned: boolean
  accounting_note: string
  quality_notes: Note[]
  order_history: OrderHistoryRecord[]
  resume_notes: Note[]
  moq: number
  lead_time: string
  packaging_requirements: string
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

// 生成訂單和採購單要求的函數
const generateRequirements = (processData: ProcessRecord[]) => {
  // 訂單零件要求 - 所有製程的要求
  const orderReqs = processData
    .filter((proc) => proc.requirements)
    .map((proc) => `${proc.process}：${proc.requirements}`)
    .join("\n")

  // 採購單零件要求 - 也包含所有製程的要求
  const purchaseReqs = processData
    .filter((proc) => proc.requirements)
    .map((proc) => `${proc.process}：${proc.requirements}`)
    .join("\n")

  return {
    orderReqs,
    purchaseReqs,
  }
}

// Export the component as a named export
export function ProductForm({
  productId,
  isClone = false,
  onSubmit,
  initialValues,
  isSubmitting = false,
  isAssembly = false,
  defaultTab = "basic",
}: ProductFormProps) {
  // 初始化默認產品數據
  const defaultProduct = {
    componentName: "",
    componentNameEn: "", // 新增英文零件名稱欄位
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
    customerOriginalDrawing: emptyFileObject,
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
  const [activeTab, setActiveTab] = useState(defaultTab || "basic")
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
  const [isPartManagementDialogOpen, setIsPartManagementDialogOpen] = useState(false)
  const [isComplianceDialogOpen, setIsComplianceDialogOpen] = useState(false)
  const [newPartManagement, setNewPartManagement] = useState({ name: "", value: false })
  const [newCompliance, setNewCompliance] = useState({
    regulation: "",
    status: "",
    substances: "",
    reason: "",
    document: "",
    filename: "",
  })

  // 資料載入狀態
  const [customersData, setCustomersData] = useState<Customer[]>([])
  const [factories, setFactories] = useState<Supplier[]>([])
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const supabase = createClientComponentClient()

  // 新增組合產品相關狀態
  const [isCompositeProduct, setIsCompositeProduct] = useState(initialValues?.is_assembly || isAssembly || false)
  const [selectedComponents, setSelectedComponents] = useState<ProductComponent[]>([])
  const [isComponentSelectorOpen, setIsComponentSelectorOpen] = useState(false)
  const [componentSearchTerm, setComponentSearchTerm] = useState("")
  const [availableComponents, setAvailableComponents] = useState<Product[]>([])
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([])
  const [loadingComponents, setLoadingComponents] = useState(false)
  const [componentDetails, setComponentDetails] = useState<{ [key: string]: string }>({})

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
      setIsCompositeProduct(initialValues.is_assembly || false)

      // 初始化訂單和採購單要求
      const { orderReqs, purchaseReqs } = generateRequirements(updatedProduct.processData || [])
      setProduct((prev) => ({
        ...prev,
        orderRequirements: prev.orderRequirements || orderReqs,
        purchaseRequirements: prev.purchaseReqs,
      }))
    } else {
      // 如果沒有初始值，也要根據默認製程資料生成要求
      const { orderReqs, purchaseReqs } = generateRequirements(defaultProduct.processData || [])
      setProduct((prev) => ({
        ...prev,
        orderRequirements: prev.orderRequirements || orderReqs,
        purchaseRequirements: prev.purchaseReqs,
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

        // 獲取產品類別數據
        try {
          const { data: productTypesData, error: productTypesError } = await supabase
            .from("product_types")
            .select("*")
            .order("type_name")

          if (productTypesError) throw new Error(`獲取產品類別數據失敗: ${productTypesError.message}`)

          setProductTypes(productTypesData || [])
        } catch (productTypesError) {
          console.warn("獲取產品類別數據失敗:", productTypesError)
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

  // 初始化組合產品部件
  useEffect(() => {
    // 如果是組合產品，自動勾選 checkbox
    if (initialValues?.isAssembly || initialValues?.is_assembly) {
      setIsCompositeProduct(true)

      // 如果有部件資料，解析並顯示
      if (initialValues?.subPartNo || initialValues?.sub_part_no) {
        try {
          let components: ProductComponent[] = []
          const subPartNoData = initialValues?.subPartNo || initialValues?.sub_part_no

          // 處理不同格式的 sub_part_no
          if (typeof subPartNoData === "string") {
            try {
              // 嘗試解析JSON字符串
              components = JSON.parse(subPartNoData)
            } catch (e) {
              console.error("解析 sub_part_no 字符串時出錯:", e)
              // 如果解析失敗，可能是逗號分隔的字符串
              if (typeof subPartNoData === "string" && subPartNoData.includes(",")) {
                components = subPartNoData.split(",").map((part) => ({
                  part_no: part.trim(),
                  description: "",
                }))
              }
            }
          } else if (Array.isArray(subPartNoData)) {
            components = subPartNoData
          }

          if (Array.isArray(components) && components.length > 0) {
            // 格式化部件資料
            const formattedComponents = components
              .map((comp): ProductComponent => {
                if (typeof comp === "object") {
                  return {
                    part_no: comp.part_no || comp.part_number || "",
                    description: comp.description || comp.component_name || "",
                  }
                } else if (typeof comp === "string") {
                  return {
                    part_no: comp,
                    description: "",
                  }
                }
                return {
                  part_no: "",
                  description: "",
                }
              })
              .filter((comp) => comp.part_no)

            setSelectedComponents(formattedComponents)

            // 獲取部件詳情
            const customerId = initialValues.customerName?.id || initialValues.customer_id
            if (customerId && formattedComponents.length > 0) {
              fetchComponentDetails(formattedComponents, customerId)
            }
          }
        } catch (e) {
          console.error("解析組合產品部件時出錯:", e)
        }
      }
    }
  }, [initialValues])

  // 獲取部件詳情
  const fetchComponentDetails = async (components: ProductComponent[], customerId: string) => {
    if (!components.length || !customerId) return

    try {
      // 獲取所有部件的 part_no
      const partNos = components.map((comp) => comp.part_no).filter(Boolean)

      if (partNos.length === 0) return

      // 查詢產品名稱
      const { data, error } = await supabase
        .from("products")
        .select("part_no, component_name")
        .eq("customer_id", customerId)
        .in("part_no", partNos)

      if (error) {
        console.error("獲取部件詳情時出錯:", error)
        return
      }

      if (data && data.length > 0) {
        // 建立 part_no 到 component_name 的映射
        const detailsMap: { [key: string]: string } = {}
        data.forEach((item) => {
          if (item.part_no && item.component_name) {
            detailsMap[item.part_no] = item.component_name
          }
        })

        // 更新組件詳情
        setComponentDetails(detailsMap)

        // 更新已選擇的組件描述
        setSelectedComponents((prev) =>
          prev.map((comp) => ({
            ...comp,
            description: detailsMap[comp.part_no] || comp.description,
          })),
        )
      }
    } catch (error) {
      console.error("獲取部件詳情時出錯:", error)
    }
  }

  // 載入可用的組件產品
  const loadAvailableComponents = useCallback(async () => {
    if (!product.customerName?.id) {
      toast({
        title: "請先選擇客戶",
        description: "需要先選擇客戶才能查詢可用組件",
        variant: "destructive",
      })
      return
    }

    setLoadingComponents(true)
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("customer_id", product.customerName.id)
        .eq("is_assembly", false)
        .ilike("part_no", `%${componentSearchTerm}%`)
        .order("part_no")
        .limit(50)

      if (error) throw error
      setAvailableComponents(data || [])
    } catch (error) {
      console.error("載入可用組件時出錯:", error)
      toast({
        title: "錯誤",
        description: "載入可用組件時出錯",
        variant: "destructive",
      })
    } finally {
      setLoadingComponents(false)
    }
  }, [componentSearchTerm, product.customerName?.id, toast])

  // 當搜尋詞變更時載入組件
  useEffect(() => {
    if (isComponentSelectorOpen) {
      loadAvailableComponents()
    }
  }, [isComponentSelectorOpen, loadAvailableComponents])

  // 打開組件選擇器
  const openComponentSelector = () => {
    setComponentSearchTerm("")
    setSelectedComponentIds([])
    setIsComponentSelectorOpen(true)
  }

  // 選擇組件
  const toggleComponentSelection = (component: Product) => {
    setSelectedComponentIds((prev) => {
      if (prev.includes(component.part_no)) {
        return prev.filter((id) => id !== component.part_no)
      } else {
        return [...prev, component.part_no]
      }
    })
  }

  // 確認選擇組件
  const confirmComponentSelection = () => {
    const newComponents = selectedComponentIds.map((partNo) => {
      const component = availableComponents.find((c) => c.part_no === partNo)
      return {
        part_no: partNo,
        description: component?.component_name || "",
      }
    })

    setSelectedComponents((prev) => {
      // 合併現有和新選擇的組件，避免重複
      const existingPartNos = prev.map((p) => p.part_no)
      const uniqueNewComponents = newComponents.filter((c) => !existingPartNos.includes(c.part_no))
      return [...prev, ...uniqueNewComponents]
    })

    // 更新部件詳情
    const newDetailsMap = { ...componentDetails }
    newComponents.forEach((comp) => {
      const component = availableComponents.find((c) => c.part_no === comp.part_no)
      if (component) {
        newDetailsMap[comp.part_no] = component.component_name
      }
    })
    setComponentDetails(newDetailsMap)

    setSelectedComponentIds([])
    setIsComponentSelectorOpen(false)
  }

  // 移除已選擇的組件
  const removeComponent = (partNo: string) => {
    setSelectedComponents((prev) => prev.filter((comp) => comp.part_no !== partNo))
  }

  // Dialog components for popup forms
  const EditNoteDialog = () => {
    const [open, setOpen] = useState(false)
    return (
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>添加編輯備註</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="noteContent">備註內容</Label>
              <Textarea
                id="noteContent"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                rows={3}
                placeholder="輸入備註內容"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="noteUser">使用者</Label>
              <Input
                id="noteUser"
                value={newNote.user}
                onChange={(e) => setNewNote({ ...newNote, user: e.target.value })}
                placeholder="輸入使用者名稱"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="noteDate">日期 (選填)</Label>
              <Input
                id="noteDate"
                value={newNote.date}
                onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                placeholder={new Date().toLocaleDateString("zh-TW")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
              取消
            </Button>
            <Button type="button" onClick={handleAddEditNote}>
              新增備註
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const ProcessDialog = () => {
    // 使用本地狀態來管理表單輸入，避免父組件狀態更新導致重新渲染
    const [localProcess, setLocalProcess] = useState<Omit<ProcessRecord, "id">>({
      process: newProcess.process,
      vendor: newProcess.vendor,
      capacity: newProcess.capacity,
      requirements: newProcess.requirements,
      report: newProcess.report,
    })

    // 當對話框打開時，同步外部狀態到本地狀態
    useEffect(() => {
      if (isProcessDialogOpen) {
        setLocalProcess({
          process: newProcess.process,
          vendor: newProcess.vendor,
          capacity: newProcess.capacity,
          requirements: newProcess.requirements,
          report: newProcess.report,
        })
      }
    }, [
      isProcessDialogOpen,
      newProcess.process,
      newProcess.vendor,
      newProcess.capacity,
      newProcess.requirements,
      newProcess.report,
    ])

    // 處理本地表單提交
    const handleLocalSubmit = () => {
      // 更新外部狀態
      setNewProcess({
        id: "",
        process: localProcess.process,
        vendor: localProcess.vendor,
        capacity: localProcess.capacity,
        requirements: localProcess.requirements,
        report: localProcess.report,
      })

      // 調用添加製程函數
      handleAddProcess()
    }

    const [open, setOpen] = useState(false)
    return (
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>新增製程</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="processName">製程</Label>
              <Input
                id="processName"
                value={localProcess.process}
                onChange={(e) => setLocalProcess((prev) => ({ ...prev, process: e.target.value }))}
                placeholder="輸入製程名稱"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="processVendor">廠商</Label>
              <Input
                id="processVendor"
                value={localProcess.vendor}
                onChange={(e) => setLocalProcess((prev) => ({ ...prev, vendor: e.target.value }))}
                placeholder="輸入廠商名稱"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="processCapacity">產能(SH)</Label>
              <Input
                id="processCapacity"
                value={localProcess.capacity}
                onChange={(e) => setLocalProcess((prev) => ({ ...prev, capacity: e.target.value }))}
                placeholder="輸入產能數值"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="processRequirements">要求</Label>
              <Input
                id="processRequirements"
                value={localProcess.requirements}
                onChange={(e) => setLocalProcess((prev) => ({ ...prev, requirements: e.target.value }))}
                placeholder="輸入製程要求"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="processReport">報告</Label>
              <Input
                id="processReport"
                value={localProcess.report}
                onChange={(e) => setLocalProcess((prev) => ({ ...prev, report: e.target.value }))}
                placeholder="輸入報告名稱"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
              取消
            </Button>
            <Button type="button" onClick={handleLocalSubmit}>
              新增製程
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const SpecialReqDialog = () => {
    const [open, setOpen] = useState(false)
    return (
      <Dialog open={isSpecialReqDialogOpen} onOpenChange={setIsSpecialReqDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>添加特殊要求</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="specialReqContent">要求內容</Label>
              <Textarea
                id="specialReqContent"
                value={newSpecialReq.content}
                onChange={(e) => setNewSpecialReq({ ...newSpecialReq, content: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialReqUser">使用者</Label>
              <Input
                id="specialReqUser"
                value={newSpecialReq.user}
                onChange={(e) => setNewSpecialReq({ ...newSpecialReq, user: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialReqDate">日期 (選填)</Label>
              <Input
                id="specialReqDate"
                value={newSpecialReq.date}
                onChange={(e) => setNewSpecialReq({ ...newSpecialReq, date: e.target.value })}
                placeholder={new Date().toLocaleDateString("zh-TW")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsSpecialReqDialogOpen(false)}>
              取消
            </Button>
            <Button type="button" onClick={handleAddSpecialReq}>
              新增特殊要求
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const ProcessNoteDialog = () => {
    const [open, setOpen] = useState(false)
    return (
      <Dialog open={isProcessNoteDialogOpen} onOpenChange={setIsProcessNoteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>添加製程備註</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="processNoteContent">備註內容</Label>
              <Textarea
                id="processNoteContent"
                value={newProcessNote.content}
                onChange={(e) => setNewProcessNote({ ...newProcessNote, content: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="processNoteUser">使用者</Label>
              <Input
                id="processNoteUser"
                value={newProcessNote.user}
                onChange={(e) => setNewProcessNote({ ...newProcessNote, user: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="processNoteDate">日期 (選填)</Label>
              <Input
                id="processNoteDate"
                value={newProcessNote.date}
                onChange={(e) => setNewProcessNote({ ...newProcessNote, date: e.target.value })}
                placeholder={new Date().toLocaleDateString("zh-TW")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsProcessNoteDialogOpen(false)}>
              取消
            </Button>
            <Button type="button" onClick={handleAddProcessNote}>
              新增備註
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const OrderHistoryDialog = () => {
    const [open, setOpen] = useState(false)
    return (
      <Dialog open={isOrderHistoryDialogOpen} onOpenChange={setIsOrderHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>添加訂單記錄</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="orderNumber">訂單號碼</Label>
              <Input
                id="orderNumber"
                value={newOrderHistory.orderNumber}
                onChange={(e) => setNewOrderHistory({ ...newOrderHistory, orderNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderQuantity">訂單數量</Label>
              <Input
                id="orderQuantity"
                type="number"
                value={newOrderHistory.quantity}
                onChange={(e) =>
                  setNewOrderHistory({ ...newOrderHistory, quantity: Number.parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOrderHistoryDialogOpen(false)}>
              取消
            </Button>
            <Button type="button" onClick={handleAddOrderHistory}>
              新增訂單記錄
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const ResumeNoteDialog = () => {
    const [open, setOpen] = useState(false)
    return (
      <Dialog open={isResumeNoteDialogOpen} onOpenChange={setIsResumeNoteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>添加履歷備註</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resumeNoteContent">備註內容</Label>
              <Textarea
                id="resumeNoteContent"
                value={newResumeNote.content}
                onChange={(e) => setNewResumeNote({ ...newResumeNote, content: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resumeNoteUser">使用者</Label>
              <Input
                id="resumeNoteUser"
                value={newResumeNote.user}
                onChange={(e) => setNewResumeNote({ ...newResumeNote, user: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resumeNoteDate">日期 (選填)</Label>
              <Input
                id="resumeNoteDate"
                value={newResumeNote.date}
                onChange={(e) => setNewResumeNote({ ...newResumeNote, date: e.target.value })}
                placeholder={new Date().toLocaleDateString("zh-TW")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsResumeNoteDialogOpen(false)}>
              取消
            </Button>
            <Button type="button" onClick={handleAddResumeNote}>
              新增備註
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const PartManagementDialog = () => {
    const [open, setOpen] = useState(false)
    return (
      <Dialog open={isPartManagementDialogOpen} onOpenChange={setIsPartManagementDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>添加零件管理特性</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="partManagementName">特性名稱</Label>
              <Input
                id="partManagementName"
                value={newPartManagement.name}
                onChange={(e) => setNewPartManagement({ ...newPartManagement, name: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="partManagementValue"
                checked={newPartManagement.value}
                onCheckedChange={(checked) => setNewPartManagement({ ...newPartManagement, value: checked === true })}
              />
              <Label htmlFor="partManagementValue">啟用</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsPartManagementDialogOpen(false)}>
              取消
            </Button>
            <Button type="button" onClick={handleAddPartManagement}>
              新增特性
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const ComplianceDialog = () => {
    const [open, setOpen] = useState(false)
    const [regulationType, setRegulationType] = useState<string>("standard") // "standard" or "containment"

    return (
      <Dialog open={isComplianceDialogOpen} onOpenChange={setIsComplianceDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>添加符合性要求</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="complianceRegulation">法規名稱</Label>
              <Input
                id="complianceRegulation"
                value={newCompliance.regulation}
                onChange={(e) => setNewCompliance({ ...newCompliance, regulation: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>法規類型</Label>
              <RadioGroup value={regulationType} onValueChange={setRegulationType} className="flex space-x-4">
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="standard" id="type-standard" />
                  <Label htmlFor="type-standard" className="text-sm">
                    標準法規 (符合/不符)
                  </Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="containment" id="type-containment" />
                  <Label htmlFor="type-containment" className="text-sm">
                    含有物質法規 (含有/不含有)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complianceStatus">符合狀態</Label>
              {regulationType === "standard" ? (
                <RadioGroup
                  value={newCompliance.status}
                  onValueChange={(value) => setNewCompliance({ ...newCompliance, status: value })}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="符合" id="comply" />
                    <Label htmlFor="comply" className="text-sm">
                      符合
                    </Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="不符" id="not-comply" />
                    <Label htmlFor="not-comply" className="text-sm">
                      不符
                    </Label>
                  </div>
                </RadioGroup>
              ) : (
                <RadioGroup
                  value={newCompliance.status}
                  onValueChange={(value) => setNewCompliance({ ...newCompliance, status: value })}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="含有" id="has" />
                    <Label htmlFor="has" className="text-sm">
                      含有
                    </Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="不含有" id="not-has" />
                    <Label htmlFor="not-has" className="text-sm">
                      不含有
                    </Label>
                  </div>
                </RadioGroup>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="complianceSubstances">含有物質</Label>
              <Input
                id="complianceSubstances"
                value={newCompliance.substances}
                onChange={(e) => setNewCompliance({ ...newCompliance, substances: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complianceReason">理由</Label>
              <Input
                id="complianceReason"
                value={newCompliance.reason}
                onChange={(e) => setNewCompliance({ ...newCompliance, reason: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsComplianceDialogOpen(false)}>
              取消
            </Button>
            <Button type="button" onClick={handleAddCompliance}>
              新增法規
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // 處理移動製程資料
  const handleMoveProcess = (id: string, direction: "up" | "down") => {
    setProduct((prev) => {
      const processData = [...(prev.processData || [])]
      const index = processData.findIndex((proc) => proc.id === id)

      if (index === -1) return prev

      if (direction === "up" && index > 0) {
        // 向上移動
        const temp = processData[index]
        processData[index] = processData[index - 1]
        processData[index - 1] = temp
      } else if (direction === "down" && index < processData.length - 1) {
        // 向下移動
        const temp = processData[index]
        processData[index] = processData[index + 1]
        processData[index + 1] = temp
      } else {
        // 無法移動
        return prev
      }

      // 生成更新後的要求
      const { orderReqs, purchaseReqs } = generateRequirements(processData)

      return {
        ...prev,
        processData,
        orderRequirements: orderReqs,
        purchaseRequirements: purchaseReqs,
      }
    })
  }

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

    // First add the process data
    setProduct((prev) => {
      const updatedProcessData = [...(prev.processData || []), processRecord]

      // Then generate requirements
      const { orderReqs, purchaseReqs } = generateRequirements(updatedProcessData)

      return {
        ...prev,
        processData: updatedProcessData,
        orderRequirements: orderReqs,
        purchaseRequirements: purchaseReqs,
      }
    })

    // Reset the new process form
    setNewProcess({
      id: "",
      process: "",
      vendor: "",
      capacity: "",
      requirements: "",
      report: "",
    })

    // Close the dialog
    setIsProcessDialogOpen(false)
  }

  // 處理刪除製程資料
  const handleRemoveProcess = (id: string) => {
    setProduct((prev) => {
      const updatedProcessData = (prev.processData || []).filter((proc) => proc.id !== id)

      // Generate requirements after removal
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
    // Only update the process data without regenerating requirements
    setProduct((prev) => {
      const updatedProcessData = (prev.processData || []).map((proc) => {
        if (proc.id === id) {
          return { ...proc, [field]: value }
        }
        return proc
      })

      return {
        ...prev,
        processData: updatedProcessData,
      }
    })
  }

  // Now, let's add a new function to manually regenerate requirements
  // Add this function after handleProcessFieldChange:
  const regenerateRequirements = () => {
    setProduct((prev) => {
      const { orderReqs, purchaseReqs } = generateRequirements(prev.processData || [])
      return {
        ...prev,
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

  // 處理添加零件管理特性
  const handleAddPartManagement = () => {
    if (newPartManagement.name) {
      setProduct((prev) => ({
        ...prev,
        partManagement: {
          ...(prev.partManagement || {}),
          [newPartManagement.name]: newPartManagement.value,
        },
      }))
      setNewPartManagement({ name: "", value: false })
      setIsPartManagementDialogOpen(false)
    }
  }

  // 處理添加符合性要求
  const handleAddCompliance = () => {
    if (newCompliance.regulation) {
      setProduct((prev) => ({
        ...prev,
        complianceStatus: {
          ...(prev.complianceStatus || {}),
          [newCompliance.regulation]: {
            status: newCompliance.status,
            substances: newCompliance.substances,
            reason: newCompliance.reason,
            document: newCompliance.document,
            filename: newCompliance.filename,
          },
        },
      }))
      setNewCompliance({
        regulation: "",
        status: "",
        substances: "",
        reason: "",
        document: "",
        filename: "",
      })
      setIsComplianceDialogOpen(false)
    }
  }

  // 處理組合產品狀態變更
  const handleCompositeProductChange = (checked: boolean) => {
    setIsCompositeProduct(checked)

    // 如果變更為組合產品且已有部件，則獲取部件詳情
    if (checked && selectedComponents.length > 0 && product.customerName?.id) {
      fetchComponentDetails(selectedComponents, product.customerName.id)
    }
  }

  // 修改提交處理函數，添加組合產品相關邏輯
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!product.componentName) {
      toast({
        title: "錯誤",
        description: "請填寫零件名稱",
        variant: "destructive",
      })
      setActiveTab("basic")
      return
    }

    if (!product.componentNameEn) {
      toast({
        title: "錯誤",
        description: "請填寫零件名稱 (英文)",
        variant: "destructive",
      })
      setActiveTab("basic")
      return
    }

    if (!product.partNo) {
      toast({
        title: "錯誤",
        description: "請填寫 Part No.",
        variant: "destructive",
      })
      setActiveTab("basic")
      return
    }

    if (!product.customerName.id) {
      toast({
        title: "錯誤",
        description: "請選擇客戶編號",
        variant: "destructive",
      })
      setActiveTab("basic")
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
        component_name_en: product.componentNameEn, // 新增英文零件名稱欄位
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
        customer_original_drawing: product.customerOriginalDrawing,
        customer_drawing: product.customerDrawing,
        factory_drawing: product.factoryDrawing,
        customer_drawing_version: product.customerDrawingVersion,
        factory_drawing_version: product.factoryDrawingVersion,

        // 產品圖片
        images: product.images,

        // 組裝資訊
        is_assembly: isCompositeProduct,
        components: product.components,
        assembly_time: product.assemblyTime,
        assembly_cost_per_hour: product.assemblyCostPerHour,
        additional_costs: product.additionalCosts,

        // 文件與認證
        important_documents: product.importantDocuments,
        part_management: product.partManagement,
        compliance_status: product.complianceStatus,
        edit_notes: product.edit_notes,

        // 製程資料
        process_data: product.processData,
        order_requirements: product.orderRequirements,
        purchase_requirements: product.purchaseRequirements,
        special_requirements: product.specialRequirements,
        process_notes: product.processNotes,

        // 履歷資料
        has_mold: product.hasMold,
        mold_cost: product.moldCost,
        refundableMoldQuantity: product.refundableMoldQuantity,
        mold_returned: product.moldReturned,
        accounting_note: product.accountingNote,
        quality_notes: product.qualityNotes,
        order_history: product.orderHistory,
        resume_notes: product.resumeNotes,

        // 商業條款
        moq: product.moq,
        lead_time: product.leadTime,
        packaging_requirements: product.packagingRequirements,

        // 組合產品相關欄位
        sub_part_no: isCompositeProduct ? selectedComponents : null,
      }

      // 使用 upsert 方法，如果記錄已存在則更新，否則插入新記錄
      const { data, error } = await supabase.from("products").upsert(productData, {
        onConflict: "customer_id,part_no",
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

  // 組件選擇器對話框
  const ComponentSelectorDialog = () => {
    const [open, setOpen] = useState(false)
    return (
      <Dialog open={isComponentSelectorOpen} onOpenChange={setIsComponentSelectorOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>選擇組件產品</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="搜尋產品編號或名稱..."
                value={componentSearchTerm}
                onChange={(e) => setComponentSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="button" onClick={loadAvailableComponents} disabled={loadingComponents}>
                {loadingComponents ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            <ScrollArea className="h-[300px] border rounded-md p-2">
              {loadingComponents ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : availableComponents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">沒有找到符合條件的產品</div>
              ) : (
                <div className="space-y-2">
                  {availableComponents.map((component) => (
                    <div
                      key={component.part_no}
                      className={`flex items-center justify-between p-2 rounded-md ${
                        selectedComponentIds.includes(component.part_no) ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{component.part_no}</div>
                        <div className="text-sm text-gray-500">{component.component_name}</div>
                      </div>
                      <Checkbox
                        checked={selectedComponentIds.includes(component.part_no)}
                        onCheckedChange={() => toggleComponentSelection(component)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsComponentSelectorOpen(false)}>
              取消
            </Button>
            <Button type="button" onClick={confirmComponentSelection} disabled={selectedComponentIds.length === 0}>
              確認選擇 ({selectedComponentIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // 客戶和供應商數據加載完成後，設置名稱
  useEffect(() => {
    if (customersData.length > 0 && (product.customerName?.id || product.customer_id) && !product.customerName?.name) {
      const customerId = product.customerName?.id || product.customer_id
      const selectedCustomer = customersData.find((c) => c.id === customerId)
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
    }

    if (factories.length > 0 && (product.factoryName?.id || product.factory_id) && !product.factoryName?.name) {
      const factoryId = product.factoryName?.id || product.factory_id
      const selectedFactory = factories.find((f) => f.id === factoryId)
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
    }
  }, [
    customersData,
    factories,
    product.customerName?.id,
    product.customer_id,
    product.factoryName?.id,
    product.factory_id,
  ])

  useEffect(() => {
    // 如果有初始客戶ID，查找對應的客戶名稱
    if (initialValues?.customerName?.id || initialValues?.customer_id) {
      const customerId = initialValues?.customerName?.id || initialValues?.customer_id
      // 下一次數據加載完成後會自動顯示名稱
    }

    // 如果有初始供應商ID，查找對應的供應商名稱
    if (initialValues?.factoryName?.id || initialValues?.factory_id) {
      const factoryId = initialValues?.factoryName?.id || initialValues?.factory_id
      // 下一次數據加載完成後會自動顯示名稱
    }
  }, [initialValues])

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
          <TabsTrigger value="composite">組合產品</TabsTrigger>
          <TabsTrigger value="images">產品圖片</TabsTrigger>
          <TabsTrigger value="documents">文件與認證</TabsTrigger>
          <TabsTrigger value="process">製程資料</TabsTrigger>
          <TabsTrigger value="resume">履歷資料</TabsTrigger>
          <TabsTrigger value="commercial">商業條款</TabsTrigger>
        </TabsList>

        {/* 基本資訊頁籤 */}
        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-6">
            {/* 左側欄位 */}
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

                {/* 新增英文零件名稱欄位 */}
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

            {/* 右側欄位 */}
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
                    onChange={(e) => handleInputChange("productType", e.target.value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇產品類別" />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes.map((type) => (
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

          {/* 產品描述 */}
          <div className="space-y-2 pt-4">
            <Label htmlFor="description">產品描述</Label>
            <Textarea
              id="description"
              value={product.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              placeholder="輸入產品詳細描述"
            />
          </div>
        </TabsContent>

        {/* 組合產品頁籤 */}
        <TabsContent value="composite" className="space-y-6 pt-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">組件產品列表</h3>
                  <Button type="button" onClick={openComponentSelector}>
                    <Plus className="h-4 w-4 mr-2" />
                    選擇組件
                  </Button>
                </div>

                {selectedComponents.length === 0 ? (
                  <div className="text-center py-8 border rounded-md text-gray-500">尚未選擇任何組件產品</div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">產品編號</th>
                          <th className="px-4 py-2 text-left">產品名稱</th>
                          <th className="px-4 py-2 text-center w-20">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedComponents.map((component, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2 font-medium">{component.part_no}</td>
                            <td className="px-4 py-2">
                              {componentDetails[component.part_no] || component.description || ""}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeComponent(component.part_no)}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  注意：組合產品將由上述選擇的組件組成。請確保所有必要的組件都已添加。
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 其他頁籤保持原有內容 */}
        <TabsContent value="images" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-6">
            {/* 圖面資訊 */}

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">圖面資訊</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* 左側：原圖版次和客戶原圖 */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="originalDrawingVersion">原圖版次</Label>
                        <Input
                          id="originalDrawingVersion"
                          value={product.originalDrawingVersion || ""}
                          onChange={(e) => handleInputChange("originalDrawingVersion", e.target.value)}
                          placeholder="輸入原圖版次"
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
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("customerOriginalDrawing")?.click()}
                            className="w-full"
                          >
                            選擇圖面連結
                          </Button>
                        </div>

                        {product.customerOriginalDrawing?.filename && (
                          <div className="mt-4 border rounded-md p-4">
                            <p className="text-center font-medium mb-2">
                              {product.customerOriginalDrawing.filename.split(".").slice(0, -1).join(".")}
                            </p>
                            {product.customerOriginalDrawing.path && (
                              <div className="flex justify-center mb-2">
                                <img
                                  src={product.customerOriginalDrawing.path || "/placeholder.svg"}
                                  alt="客戶原圖預覽"
                                  className="max-h-40 object-contain"
                                  onError={(e) => {
                                    ;(e.target as HTMLImageElement).style.display = "none"
                                    ;(e.target as HTMLImageElement).nextElementSibling!.style.display = "block"
                                  }}
                                />
                                <div className="hidden text-center text-gray-500 py-4">無法預覽此文件格式</div>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 break-all">{product.customerOriginalDrawing.path}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 右側：車廠圖號和客戶圖號（從基本資訊同步） */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="syncedVehicleDrawingNo">車廠圖號</Label>
                        <Input
                          id="syncedVehicleDrawingNo"
                          value={product.vehicleDrawingNo || ""}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="syncedCustomerDrawingNo">客戶圖號</Label>
                        <Input
                          id="syncedCustomerDrawingNo"
                          value={product.customerDrawingNo || ""}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-center">今湛客圖</h4>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-center">今湛工廠圖</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerDrawingVersion">客戶圖版次</Label>
                      <Input
                        id="customerDrawingVersion"
                        value={product.customerDrawingVersion || ""}
                        onChange={(e) => handleInputChange("customerDrawingVersion", e.target.value)}
                        placeholder="輸入客戶圖版次"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="factoryDrawingVersion">工廠圖版次</Label>
                      <Input
                        id="factoryDrawingVersion"
                        value={product.factoryDrawingVersion || ""}
                        onChange={(e) => handleInputChange("factoryDrawingVersion", e.target.value)}
                        placeholder="輸入工廠圖版次"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerDrawing">今湛客圖</Label>
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
                      <Label htmlFor="factoryDrawing">今湛工廠圖</Label>
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
          </div>
        </TabsContent>

        {/* 文件與認證頁籤 */}
        <TabsContent value="documents" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-6">
            {/* 重要文件 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">重要文件</h3>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newDocKey = `customDoc_${Date.now()}`
                        setProduct((prev) => ({
                          ...prev,
                          importantDocuments: {
                            ...(prev.importantDocuments || {}),
                            [newDocKey]: { document: "", filename: "", title: "新文件" },
                          },
                        }))
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      新增文件
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* 標準文件 */}
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

                    {/* 自定義文件 */}
                    {product.importantDocuments &&
                      Object.entries(product.importantDocuments).map(([key, doc]) => {
                        if (key === "PPAP" || key === "PSW" || key === "capacityAnalysis") return null

                        return (
                          <div key={key} className="space-y-2 border-t pt-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Input
                                  value={(doc as any).title || key}
                                  onChange={(e) => {
                                    setProduct((prev) => ({
                                      ...prev,
                                      importantDocuments: {
                                        ...(prev.importantDocuments || {}),
                                        [key]: {
                                          ...((prev.importantDocuments || {})[key] || {}),
                                          title: e.target.value,
                                        },
                                      },
                                    }))
                                  }}
                                  className="w-48"
                                  placeholder="文件標題"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setProduct((prev) => {
                                    const newDocs = { ...(prev.importantDocuments || {}) }
                                    delete newDocs[key]
                                    return {
                                      ...prev,
                                      importantDocuments: newDocs,
                                    }
                                  })
                                }}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                id={`customDoc_${key}`}
                                onChange={(e) => {
                                  const files = e.target.files
                                  if (!files || files.length === 0) return

                                  const file = files[0]
                                  const fileData = {
                                    path: URL.createObjectURL(file),
                                    filename: file.name,
                                  }

                                  setProduct((prev) => ({
                                    ...prev,
                                    importantDocuments: {
                                      ...(prev.importantDocuments || {}),
                                      [key]: {
                                        ...((prev.importantDocuments || {})[key] || {}),
                                        document: fileData.path,
                                        filename: fileData.filename,
                                      },
                                    }))

                                  e.target.value = ""
                                }}
                                className="hidden"
                              />
                              <Input readOnly value={(doc as any).filename || "未選擇文件"} className="flex-1" />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById(`customDoc_${key}`)?.click()}
                              >
                                選擇文件連結
                              </Button>
                            </div>
                          </div>
                        )
                      })}
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
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setIsPartManagementDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      新增特性
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>特性名稱</Label>
                      </div>
                      <div className="text-right"></div>
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
                        <Label htmlFor="clockRequirement">熔鑄地要求</Label>
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
                  <div className="flex justify-between items-center\">
                    <h3 className=\"text-lg font-medium\">符合性要求</h3>
                    <Button type="button" size="sm" variant="outline" onClick={() => setIsComplianceDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      新增法規
                    </Button>
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
                        {regulation === "PFAS" || regulation === "CMRT" || regulation === "EMRT" ? (
                          <RadioGroup
                            value={product.complianceStatus?.[regulation]?.status || ""}
                            onValueChange={(value) => handleComplianceStatusChange(regulation, value)}
                            className="flex justify-center space-x-4"
                          >
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="含有" id={`${regulation}-has`} />
                              <Label htmlFor={`${regulation}-has`} className="text-sm">
                                含有
                              </Label>
                            </div>
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="不含有" id={`${regulation}-not-has`} />
                              <Label htmlFor={`${regulation}-not-has`} className="text-sm">
                                不含有
                              </Label>
                            </div>
                          </RadioGroup>
                        ) : (
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
                        )}
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
                    <div>
                      <Label>使用者</Label>
                    </div>
                    <div>
                      <Label>日期</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {product.editNotes &&\
                      product.editNotes.map((note, index) => (\
                        <div key={index} className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                          <div>{note.content}</div>
                          <div>{note.user}</div>
                          <div>{note.date}</div>
                        </div>
                      ))}\
                  </div>
                </div>
              </CardContent>\
            </Card>
          </div>
        </TabsContent>

        {/* 製程資料頁籤 */}
        <TabsContent value="process" className="space-y-4 pt-4">
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

                <div className="grid grid-cols-1 gap-4">\
                  <div className="grid grid-cols-6 gap-4">
                    <div>\
                      <Label>製程</Label>
                    </div>
                    <div>
                      <Label>廠商</Label>
                    </div>
                    <div>
                      <Label>產能(SH)</Label>
                    </div>
                    <div>\
                      <Label>要求</Label>
                    </div>
                    <div>\
                      <Label>報告</Label>
                    </div>
                    <div>
                      <Label>操作</Label>
                    </div>
                  </div>

                  {product.processData &&
                    product.processData.map((process, index) => (
                      <div key={process.id} className="grid grid-cols-6 gap-4 items-center border-b pb-2">
                        <div>
                          <Input
                            value={process.process}
                            onChange={(e) => handleProcessFieldChange(process.id, "process", e.target.value)}
                            placeholder="製程名稱"
                          />
                        </div>
                        <div>
                          <Input
                            value={process.vendor}
                            onChange={(e) => handleProcessFieldChange(process.id, "vendor", e.target.value)}
                            placeholder="廠商名稱"
                          />
                        </div>
                        <div>
                          <Input\
                            value={process.capacity}\
                            onChange={(e) => handleProcessFieldChange(process.id, \"capacity\", e.target.value)}
                            placeholder="產能數值"
                          />
                        </div>
                        <div>
                          <Input
                            value={process.requirements}
                            onChange={(e) => handleProcessFieldChange(process.id, "requirements", e.target.value)}\
                            placeholder="製程要求"
                          />
                        </div>
                        <div>
                          <Input
                            value={process.report}
                            onChange={(e) => handleProcessFieldChange(process.id, "report", e.target.value)}
                            placeholder="報告名稱"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveProcess(process.id, "up")}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-arrow-up"
                            >
                              <path d="m12 5 9 9-9 9" />
                            </svg>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveProcess(process.id, "down")}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-arrow-down"
                            >
                              <path d="m12 19-9-9 9-9" />
                            </svg>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProcess(process.id)}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderRequirements">訂單零件要求</Label>
                  <Textarea
                    id="orderRequirements"
                    value={product.orderRequirements || ""}
                    onChange={(e) => handleInputChange("orderRequirements", e.target.value)}
                    rows={3}
                    placeholder="輸入訂單零件要求"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchaseRequirements">採購單零件要求</Label>
                  <Textarea
                    id="purchaseRequirements"
                    value={product.purchaseRequirements || ""}
                    onChange={(e) => handleInputChange("purchaseRequirements", e.target.value)}
                    rows={3}
                    placeholder="輸入採購單零件要求"
                  />
                </div>

                <Button type="button" variant="secondary" onClick={regenerateRequirements}>
                  重新生成要求
                </Button>

                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">特殊要求</h3>
                  <Button type="button" size="sm" variant="outline" onClick={() => setIsSpecialReqDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加特殊要求
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>要求內容</Label>
                  </div>
                  <div>
                    <Label>使用者</Label>
                  </div>
                  <div>
                    <Label>日期</Label>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {product.specialRequirements &&
                    product.specialRequirements.map((req, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                        <div>{req.content}</div>
                        <div>{req.user}</div>
                        <div>{req.date}</div>
                      </div>
                    ))}
                </div>

                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">製程備註</h3>
                  <Button type="button" size="sm" variant="outline" onClick={() => setIsProcessNoteDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加製程備註
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>備註內容</Label>
                  </div>
                  <div>
                    <Label>使用者</Label>
                  </div>
                  <div>
                    <Label>日期</Label>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {product.processNotes &&
                    product.processNotes.map((note, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                        <div>{note.content}</div>
                        <div>{note.user}</div>
                        <div>{note.date}</div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 履歷資料頁籤 */}
        <TabsContent value="resume" className="space-y-4 pt-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hasMold">是否有模具</Label>
                    <Checkbox
                      id="hasMold"
                      checked={product.hasMold || false}
                      onCheckedChange={(checked) => handleInputChange("hasMold", checked === true)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="moldCost">模具費用</Label>
                    <Input
                      id="moldCost"
                      type="number"
                      value={product.moldCost || ""}
                      onChange={(e) => handleInputChange("moldCost", e.target.value)}
                      placeholder="輸入模具費用"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="refundableMoldQuantity">可退模具數量</Label>
                    <Input
                      id="refundableMoldQuantity"
                      type="number"
                      value={product.refundableMoldQuantity || ""}
                      onChange={(e) => handleInputChange("refundableMoldQuantity", e.target.value)}
                      placeholder="輸入可退模具數量"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="moldReturned">模具是否已退還</Label>
                    <Checkbox
                      id="moldReturned"
                      checked={product.moldReturned || false}
                      onCheckedChange={(checked) => handleInputChange("moldReturned", checked === true)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountingNote">會計備註</Label>
                  <Textarea
                    id="accountingNote"
                    value={product.accountingNote || ""}
                    onChange={(e) => handleInputChange("accountingNote", e.target.value)}
                    rows={3}
                    placeholder="輸入會計備註"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">品質備註</h3>
                  <Button type="button" size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    添加品質備註
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>備註內容</Label>
                  </div>
                  <div>
                    <Label>使用者</Label>
                  </div>
                  <div>
                    <Label>日期</Label>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">訂單歷史記錄</h3>
                  <Button type="button" size="sm" variant="outline" onClick={() => setIsOrderHistoryDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加訂單記錄
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>訂單號碼</Label>
                  </div>
                  <div>
                    <Label>訂單數量</Label>
                  </div>
                  <div>
                    <Label>操作</Label>
                  </div>
                </div>

                {product.orderHistory &&
                  product.orderHistory.map((order, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                      <div>
                        <Input
                          value={order.orderNumber || ""}
                          onChange={(e) => handleOrderHistoryChange(index, "orderNumber", e.target.value)}
                          placeholder="訂單號碼"
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          value={order.quantity || 0}
                          onChange={(e) =>
                            handleOrderHistoryChange(index, "quantity", Number.parseInt(e.target.value) || 0)
                          }
                          placeholder="訂單數量"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveOrderHistory(index)}>
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}

                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">履歷備註</h3>
                  <Button type="button" size="sm" variant="outline" onClick={() => setIsResumeNoteDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加履歷備註
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>備註內容</Label>
                  </div>
                  <div>
                    <Label>使用者</Label>
                  </div>
                  <div>
                    <Label>日期</Label>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {product.resumeNotes &&
                    product.resumeNotes.map((note, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                        <div>{note.content}</div>
                        <div>{note.user}</div>
                        <div>{note.date}</div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 商業條款頁籤 */}
        <TabsContent value="commercial" className="space-y-4 pt-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="moq">最小訂購量 (MOQ)</Label>
                    <Input
                      id="moq"
                      type="number"
                      value={product.moq || 0}
                      onChange={(e) => handleInputChange("moq", Number.parseInt(e.target.value) || 0)}
                      placeholder="輸入最小訂購量"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leadTime">交貨時間</Label>
                    <Input
                      id="leadTime"
                      value={product.leadTime || ""}
                      onChange={(e) => handleInputChange("leadTime", e.target.value)}
                      placeholder="輸入交貨時間"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="packagingRequirements">包裝要求</Label>
                    <Input
                      id="packagingRequirements"
                      value={product.packagingRequirements || ""}
                      onChange={(e) => handleInputChange("packagingRequirements", e.target.value)}
                      placeholder="輸入包裝要求"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting || isLoading ? (
            <>
              保存中...
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            </>
          ) : (
            "保存產品"
          )}
        </Button>
      </div>

      <EditNoteDialog />
      <ProcessDialog />
      <SpecialReqDialog />
      <ProcessNoteDialog />
      <OrderHistoryDialog />
      <ResumeNoteDialog />
      <PartManagementDialog />
      <ComplianceDialog />
      <ComponentSelectorDialog />
    </form>
  )
}
// Add a default export that points to the same component\
//export default ProductForm;
