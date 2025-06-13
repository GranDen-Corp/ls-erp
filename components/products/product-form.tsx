"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Import types
import type {
  ProductFormProps,
  ProcessRecord,
  Note,
  ProductSpecification,
  ProductComponent,
  Product,
} from "@/types/product-form-types"

// Import utilities
import { getDefaultProduct, emptyComplianceStatus, emptyFileObject } from "@/lib/product-form-utils"

// Import dialog components
import { EditNoteDialog } from "./dialogs/edit-note-dialog"
import { ProcessDialog } from "./dialogs/process-dialog"
import { SpecialReqDialog } from "./dialogs/special-req-dialog"
import { ProcessNoteDialog } from "./dialogs/process-note-dialog"
import { OrderHistoryDialog } from "./dialogs/order-history-dialog"
import { ResumeNoteDialog } from "./dialogs/resume-note-dialog"
import { PartManagementDialog } from "./dialogs/part-management-dialog"
import { ComplianceDialog } from "./dialogs/compliance-dialog"
import { ComponentSelectorDialog } from "./dialogs/component-selector-dialog"

// Import tab content components
import { BasicInfoTab } from "./tabs/basic-info-tab"
import { CompositeProductTab } from "./tabs/composite-product-tab"

// Import other tab components
import { ImagesTab } from "./tabs/images-tab"
import { DocumentsTab } from "./tabs/documents-tab"
import { ProcessTab, defaultProcesses } from "./tabs/process-tab"
import { ResumeTab } from "./tabs/resume-tab"

import { saveProduct } from "@/app/actions/product-actions"

export function ProductForm({
  productId,
  onSubmit,
  initialValues,
  isSubmitting = false,
  //isAssembly = false,
  defaultTab = "basic",
}: ProductFormProps) {
  // Initialize default product data
  const defaultProduct = getDefaultProduct(initialValues?.productType === "組合件")

  // If there are initial values, use them, otherwise use default values
  const initialProduct = initialValues || (productId ? { ...defaultProduct, id: productId } : defaultProduct)

  // 在初始化時處理製程資料
  const processDataInitialized = useMemo(() => {
    // 如果初始產品已有製程資料，則使用它
    if (initialProduct.processData && initialProduct.processData.length > 0) {
      return initialProduct.processData
    }
    // 否則使用默認製程資料
    return [...defaultProcesses]
  }, [initialProduct.processData])

  // Ensure all necessary objects exist
  const safeInitialProduct = {
    ...defaultProduct,
    ...initialProduct,
    customerOriginalDrawing: initialProduct.customerOriginalDrawing || emptyFileObject,
    customerDrawing: initialProduct.customerDrawing || emptyFileObject,
    factoryDrawing: initialProduct.factoryDrawing || emptyFileObject,
    complianceStatus: Array.isArray(initialProduct.complianceStatus)
    ? initialProduct.complianceStatus
    : [], // 或是進一步轉換舊格式
    importantDocuments: {
      ...defaultProduct.importantDocuments,
      ...(initialProduct.importantDocuments || {}),
    },
    partManagement: {
      ...defaultProduct.partManagement,
      ...(initialProduct.partManagement || {}),
    },
    // 使用已初始化的製程資料
    processData: processDataInitialized,
  }

  const [product, setProduct] = useState(safeInitialProduct)
  const [activeTab, setActiveTab] = useState(defaultTab || "basic")
  const [newNote, setNewNote] = useState<Note>({ content: "", date: "", user: "" })
  const [newProcess, setNewProcess] = useState<ProcessRecord>({
    id: "",
    process: "",
    vendor: "",
    capacity: "",
    requirements: "",
    report: "",
  })
  const [newSpecialReq, setNewSpecialReq] = useState<Note>({ content: "", date: "", user: "" })
  const [newProcessNote, setNewProcessNote] = useState<Note>({ content: "", date: "", user: "" })
  const [newOrderHistory, setNewOrderHistory] = useState({ orderNumber: "", quantity: 0 })
  const [newResumeNote, setNewResumeNote] = useState<Note>({ content: "", date: "", user: "" })
  const [newSpec, setNewSpec] = useState<ProductSpecification>({ name: "", value: "" })

  // Dialog states - all initialized to false to prevent auto-opening
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
    regulationType: "",
    status: false,
    substances: "",
    reason: "",
    document: "",
  })

  // Data loading states
  const [customersData, setCustomersData] = useState([])
  const [factories, setFactories] = useState([])
  const [productTypes, setProductTypes] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const supabase = createClientComponentClient()

  // Composite product related states
  const [isCompositeProduct, setIsCompositeProduct] = useState(initialValues?.productType === "組合件" || false)
  const [selectedComponents, setSelectedComponents] = useState<ProductComponent[]>([])
  const [isComponentSelectorOpen, setIsComponentSelectorOpen] = useState(false)
  const [componentSearchTerm, setComponentSearchTerm] = useState("")
  const [availableComponents, setAvailableComponents] = useState<Product[]>([])
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([])
  const [loadingComponents, setLoadingComponents] = useState(false)
  const [componentDetails, setComponentDetails] = useState<{ [key: string]: string }>({})

  // 追蹤客戶和供應商ID的變更
  const prevCustomerId = useRef<string | null>(null)
  const prevFactoryId = useRef<string | null>(null)

  // fixed by ChatGPT
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!hasInitialized.current && initialValues) {
      const processData =
        initialValues.processData && initialValues.processData.length > 0
          ? initialValues.processData
          : [...defaultProcesses]

      const updatedProduct = {
        ...defaultProduct,
        ...initialValues,
        customerOriginalDrawing: initialValues.customerOriginalDrawing || emptyFileObject,
        customerDrawing: initialValues.customerDrawing || emptyFileObject,
        factoryDrawing: initialValues.factoryDrawing || emptyFileObject,
        complianceStatus: Array.isArray(initialValues.complianceStatus)
        ? initialValues.complianceStatus
        : [],
        importantDocuments: {
          ...defaultProduct.importantDocuments,
          ...(initialValues.importantDocuments || {}),
        },
        partManagement: {
          ...defaultProduct.partManagement,
          ...(initialValues.partManagement || {}),
        },
        processData: processData,
      }

      // 初始化客戶和供應商名稱顯示
      if (initialValues.customer_id) {
        const customer = customersData.find((c) => c.id === initialValues.customer_id)
        if (customer) {
          updatedProduct.customer_id = customer.id
        }
      }

      if (initialValues.factory_id) {
        const factory = factories.find((f) => f.id === initialValues.factory_id)
        if (factory) {
          updatedProduct.factory_id = factory.id
        }
      }

      setProduct(updatedProduct)
      setIsCompositeProduct(initialValues.productType === "組合件" || false)

      prevCustomerId.current = initialValues.customer_id || null
      prevFactoryId.current = initialValues.factory_id || null

      hasInitialized.current = true
    }
  }, [initialValues, customersData, factories])

  // 確保新產品有默認製程資料
  useEffect(() => {
    if (!initialValues && !productId && !product.processData?.length) {
      console.log("Setting default processes for new product")
      setProduct((prev: Product) => ({
        ...prev,
        processData: [...defaultProcesses],
      }))
    }
  }, [initialValues, productId, product.processData?.length])

  // 監控客戶ID和供應商ID的變更
  useEffect(() => {
    const currentCustomerId = product.customer_id
    const currentFactoryId = product.factory_id

    // 如果客戶ID變更，清除組合產品選擇
    if (currentCustomerId && currentCustomerId !== prevCustomerId.current) {
      setSelectedComponents([])
      setComponentDetails({})
      setSelectedComponentIds([])
      setIsCompositeProduct(false)
      prevCustomerId.current = currentCustomerId
    }

    // 如果供應商ID變更，也清除組合產品選擇
    if (currentFactoryId && currentFactoryId !== prevFactoryId.current) {
      setSelectedComponents([])
      setComponentDetails({})
      setSelectedComponentIds([])
      setIsCompositeProduct(false)
      prevFactoryId.current = currentFactoryId
    }
  }, [product.customer_id, product.factory_id])

  // 監控產品類型的變更
  useEffect(() => {
    if (product.productType !== "組合件") {
      // 清空組合件相關資料
      setSelectedComponents([])
      setComponentDetails({})
      setSelectedComponentIds([])
      setIsCompositeProduct(false)
      
      // 更新產品資料
      setProduct((prev: Product) => ({
        ...prev,
        subPartNo: [],
        sub_part_no: []
      }))
    } else {
      setIsCompositeProduct(true)
    }
  }, [product.productType])

  // 監控selectedComponents
  useEffect(() => {
    if (selectedComponents.length > 0 && product.productType !== "組合件") {
      handleInputChange("productType", "組合件")
    }
  }, [selectedComponents])

  // Load customer and factory data
  useEffect(() => {
    async function fetchOptions() {
      setDataLoading(true)
      setDataError(null)

      try {
        // Get customer data
        const { data: customers, error: customersError } = await supabase
          .from("customers")
          .select("customer_id, customer_short_name")
          .order("customer_id")

        if (customersError) throw new Error(`Failed to get customer data: ${customersError.message}`)

        // Convert data to the format needed by the component
        const formattedCustomers =
          customers?.map((customer) => ({
            id: customer.customer_id,
            name: customer.customer_short_name,
            code: customer.customer_id || "",
          })) || []

        // Try to get factory data
        let formattedFactories = []
        try {
          const { data: factoriesData, error: factoriesError } = await supabase
            .from("factories")
            .select("factory_id, factory_name")
            .order("factory_id")

          if (!factoriesError && factoriesData) {
            formattedFactories = factoriesData.map((factory) => ({
              id: factory.factory_id,
              name: factory.factory_name,
              code: factory.factory_id || "",
            }))
          }
        } catch (factoryError) {
          console.warn("Failed to get factory data, using empty array as fallback:", factoryError)
        }

        // Get product type data
        try {
          const { data: productTypesData, error: productTypesError } = await supabase
            .from("product_types")
            .select("*")
            .order("type_name")

          if (productTypesError) throw new Error(`Failed to get product type data: ${productTypesError.message}`)

          setProductTypes(productTypesData || [])
        } catch (productTypesError) {
          console.warn("Failed to get product type data:", productTypesError)
        }

        setCustomersData(formattedCustomers)
        setFactories(formattedFactories)
      } catch (err) {
        console.error("Failed to get option data:", err)
        setDataError(err instanceof Error ? err.message : "Unknown error occurred while getting data")
      } finally {
        setDataLoading(false)
      }
    }

    fetchOptions()
  }, [supabase])

  // Initialize composite product components
  useEffect(() => {
    // If it's a composite product, automatically check the checkbox
    if (initialValues?.productType === "組合件" || initialValues?.product_type === "組合件") {
      setIsCompositeProduct(true)

      // If there is component data, parse and display it
      if (initialValues?.subPartNo || initialValues?.sub_part_no) {
        try {
          let components: ProductComponent[] = []
          const subPartNoData = initialValues?.subPartNo || initialValues?.sub_part_no

          // Handle different formats of sub_part_no
          if (typeof subPartNoData === "string") {
            try {
              // Try to parse JSON string
              components = JSON.parse(subPartNoData)
            } catch (e) {
              console.error("Error parsing sub_part_no string:", e)
              // If parsing fails, it might be a comma-separated string
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
            // Format component data
            const formattedComponents = components
              .map((comp): ProductComponent => {
                if (typeof comp === "object") {
                  return {
                    part_no: comp.part_no || "",
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

            // Get component details
            const customerId = initialValues.customer_id
            if (customerId && formattedComponents.length > 0) {
              fetchComponentDetails(formattedComponents, customerId)
            }
          }
        } catch (e) {
          console.error("Error parsing composite product components:", e)
        }
      }
    }
  }, [initialValues])

  // Get component details
  const fetchComponentDetails = async (components: ProductComponent[], customerId: string) => {
    if (!components.length || !customerId) return

    try {
      // Get all component part_no
      const partNos = components.map((comp) => comp.part_no).filter(Boolean)

      if (partNos.length === 0) return

      // Query product names
      const { data, error } = await supabase
        .from("products")
        .select("part_no, component_name")
        .eq("customer_id", customerId)
        .in("part_no", partNos)

      if (error) {
        console.error("Error getting component details:", error)
        return
      }

      if (data && data.length > 0) {
        // Build part_no to component_name mapping
        const detailsMap: { [key: string]: string } = {}
        data.forEach((item) => {
          if (item.part_no && item.component_name) {
            detailsMap[item.part_no] = item.component_name
          }
        })

        // Update component details
        setComponentDetails(detailsMap)

        // Update selected component descriptions
        setSelectedComponents((prev) =>
          prev.map((comp) => ({
            ...comp,
            description: detailsMap[comp.part_no] || comp.description,
          })),
        )
      }
    } catch (error) {
      console.error("Error getting component details:", error)
    }
  }

  // Load available component products
  const loadAvailableComponents = useCallback(async () => {
    if (!product.customer_id) {
      toast({
        title: "Please select a customer first",
        description: "You need to select a customer before querying available components",
        variant: "destructive",
      })
      return
    }

    setLoadingComponents(true)
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("customer_id", product.customer_id)
        .eq("product_type", "組合件")
        .ilike("part_no", `%${componentSearchTerm}%`)
        .order("part_no")
        .limit(50)

      if (error) throw error
      setAvailableComponents(data || [])
    } catch (error) {
      console.error("Error loading available components:", error)
      toast({
        title: "Error",
        description: "Error loading available components",
        variant: "destructive",
      })
    } finally {
      setLoadingComponents(false)
    }
  }, [componentSearchTerm, product.customer_id, supabase, toast])

  // When search term changes, load components
  useEffect(() => {
    if (isComponentSelectorOpen) {
      loadAvailableComponents()
    }
  }, [isComponentSelectorOpen, loadAvailableComponents])

  // Open component selector
  const openComponentSelector = () => {
    setComponentSearchTerm("")
    setSelectedComponentIds([])
    setIsComponentSelectorOpen(true)
  }

  // Select component
  const toggleComponentSelection = (component: Product) => {
    setSelectedComponentIds((prev) => {
      if (prev.includes(component.part_no)) {
        return prev.filter((id) => id !== component.part_no)
      } else {
        return [...prev, component.part_no]
      }
    })
  }

  // Confirm component selection
  const confirmComponentSelection = () => {
    const newComponents = selectedComponentIds.map((partNo) => {
      const component = availableComponents.find((c) => c.part_no === partNo)
      return {
        part_no: partNo,
        description: component?.component_name || "",
      }
    })

    setSelectedComponents((prev) => {
      // Merge existing and newly selected components, avoiding duplicates
      const existingPartNos = prev.map((p) => p.part_no)
      const uniqueNewComponents = newComponents.filter((c) => !existingPartNos.includes(c.part_no))
      return [...prev, ...uniqueNewComponents]
    })

    // Update component details
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

  // Remove selected component
  const removeComponent = (partNo: string) => {
    setSelectedComponents((prev) => prev.filter((comp) => comp.part_no !== partNo))
  }

  // Handle input change with deep equality check
  const handleInputChange = useCallback((field: string, value: any) => {
    //console.log("prev:",product.customer_id,"field:",field,"value:",value);
    setProduct((prev) => {
      // 如果字段不存在於先前的狀態中，直接更新
      if (!(field in prev)) {
        //console.log(`如果字段不存在於先前的狀態中，直接更新:${field}:${value}`);
        return { ...prev, [field]: value }
      }

      // 對於字符串、數字和布爾值，直接比較
      if (typeof prev[field] === "string" || typeof prev[field] === "number" || typeof prev[field] === "boolean") {
        if (prev[field] === value) {
          //console.log(`值沒有變化，不更新 ${field}:${value}`);
          return prev // 值沒有變化，不更新
        }
        //console.log(`值有變化，更新:${field}:${value}`);
        return { ...prev, [field]: value }
      }

      // 對於對象和數組，使用 JSON.stringify 進行深度比較
      try {
        if (JSON.stringify(prev[field]) === JSON.stringify(value)) {
          //console.log(`值沒有變化，不更新2 ${field}:${value}`);
          return prev // 值沒有變化，不更新
        }
      } catch (e) {
        // 如果 JSON.stringify 失敗（例如循環引用），則假設值已更改
        console.warn(`JSON.stringify failed for field ${field}:`, e)
      }

      //console.log(`返回更新後的對象: ${field}:${value}`);
      // 返回更新後的對象
      return { ...prev, [field]: value }
    })
  }, [])

  // Handle add edit note
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

  // Handle add process
  const handleAddProcess = (processData: any) => {
    console.log("handleAddProcess called with:", processData)

    if (!processData.process) {
      console.warn("Process name is required")
      return
    }

    setProduct((prev) => {
      // Make sure processData exists and is an array
      const currentProcessData = Array.isArray(prev.processData) ? [...prev.processData] : []

      // Add new process
      return {
        ...prev,
        processData: [
          ...currentProcessData,
          {
            id: processData.id || `proc_${Date.now()}`,
            process: processData.process,
            vendor: processData.vendor,
            capacity: processData.capacity,
            requirements: processData.requirements,
            report: processData.report,
          },
        ],
      }
    })

    // Reset form state
    setNewProcess({
      id: "",
      process: "",
      vendor: "",
      capacity: "",
      requirements: "",
      report: "",
    })

    // Close dialog
    setIsProcessDialogOpen(false)

    // Show success toast
    toast({
      title: "製程已新增",
      description: `製程 "${processData.process}" 已成功新增`,
    })
  }

  // Handle add special requirement
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

  // Handle add process note
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

  // Handle add order history
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

  // Handle add resume note
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

  // Handle add part management
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

      // 顯示成功提示
      toast({
        title: "零件管理特性已新增",
        description: `特性 "${newPartManagement.name}" 已成功新增`,
      })
    }
  }

  // Handle add compliance
  const handleAddCompliance = () => {
    if (newCompliance.regulation) {
      setProduct((prev) => ({
        ...prev,
        complianceStatus: [
          ...(prev.complianceStatus || []),
          {
            regulation: newCompliance.regulation,
            regulationType: newCompliance.regulationType,
            status: newCompliance.status,
            substances: newCompliance.substances,
            reason: newCompliance.reason,
            document: newCompliance.document,
          },
        ],
      }))
  
      setNewCompliance({
        regulation: "",
        regulationType: "",
        status: false,
        substances: "",
        reason: "",
        document: "",
      })
  
      setIsComplianceDialogOpen(false)
  
      toast({
        title: "符合性要求已新增",
        description: `法規 "${newCompliance.regulation}" 已成功新增`,
      })
    }
  }

  // 使用 useMemo 來記憶化處理製程字段的函數，避免不必要的重新創建
  const processFieldHandlers = useMemo(() => {
    return {
      handleProcessFieldChange: (id: string, field: string, value: string) => {
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
      },
      handleRemoveProcess: (id: string) => {
        setProduct((prev) => ({
          ...prev,
          processData: (prev.processData || []).filter((proc) => proc.id !== id),
        }))
      },
      handleMoveProcess: (id: string, direction: "up" | "down") => {
        setProduct((prev) => {
          const processData = [...(prev.processData || [])]
          const index = processData.findIndex((proc) => proc.id === id)

          if (index === -1) return prev

          if (direction === "up" && index > 0) {
            // Move up
            const temp = processData[index]
            processData[index] = processData[index - 1]
            processData[index - 1] = temp
          } else if (direction === "down" && index < processData.length - 1) {
            // Move down
            const temp = processData[index]
            processData[index] = processData[index + 1]
            processData[index + 1] = temp
          } else {
            // Cannot move
            return prev
          }

          return {
            ...prev,
            processData,
          }
        })
      },
    }
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!product.componentName) {
      toast({
        title: "Error",
        description: "Please fill in the component name",
        variant: "destructive",
      })
      setActiveTab("basic")
      return
    }

    if (!product.componentNameEn) {
      toast({
        title: "Error",
        description: "Please fill in the component name (English)",
        variant: "destructive",
      })
      setActiveTab("basic")
      return
    }

    if (!product.partNo) {
      toast({
        title: "Error",
        description: "Please fill in the Part No.",
        variant: "destructive",
      })
      setActiveTab("basic")
      return
    }

    if (!product.customer_id) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive",
      })
      setActiveTab("basic")
      return
    }

    if (!product.factory_id) {
      toast({
        title: "Error",
        description: "Please select a factory",
        variant: "destructive",
      })
      setActiveTab("basic")
      return
    }

    setIsLoading(true)

    try {
      // 準備要插入的資料
      const productData = {
        // Composite key fields
        customer_id: product.customer_id,
        partNo: product.partNo,
        factory_id: product.factory_id,

        // Basic information
        componentName: product.componentName,
        componentNameEn: product.componentNameEn,
        specification: product.specification,
        customsCode: product.customsCode,
        endCustomer: product.endCustomer,
        productType: product.productType,
        classificationCode: product.classificationCode,
        vehicleDrawingNo: product.vehicleDrawingNo,
        customerDrawingNo: product.customerDrawingNo,
        productPeriod: product.productPeriod,
        description: product.description,
        status: product.status,
        createdDate: product.createdDate || new Date().toISOString().split("T")[0],
        lastOrderDate: product.lastOrderDate,
        lastPrice: product.lastPrice,
        currency: product.currency,

        // Product specifications
        specifications: product.specifications,
        sampleStatus: product.sampleStatus,
        sampleDate: product.sampleDate,

        // Drawing information
        originalDrawingVersion: product.originalDrawingVersion,
        drawingVersion: product.drawingVersion,
        customerOriginalDrawing: product.customerOriginalDrawing,
        customerDrawing: product.customerDrawing,
        factoryDrawing: product.factoryDrawing,
        customerDrawingVersion: product.customerDrawingVersion,
        factoryDrawingVersion: product.factoryDrawingVersion,

        // Product images
        images: product.images,

        // Assembly information
        //isAssembly: isCompositeProduct,
        components: product.components,
        assemblyTime: product.assemblyTime,
        assemblyCostPerHour: product.assemblyCostPerHour,
        additionalCosts: product.additionalCosts,

        // Documents and certifications
        importantDocuments: product.importantDocuments,
        partManagement: product.partManagement,
        complianceStatus: product.complianceStatus,
        editNotes: product.editNotes,

        // Process data
        processData: product.processData,
        orderRequirements: product.orderRequirements,
        purchaseRequirements: product.purchaseRequirements,
        specialRequirements: product.specialRequirements,
        processNotes: product.processNotes,

        // Resume data
        hasMold: product.hasMold,
        moldCost: product.moldCost,
        refundableMoldQuantity: product.refundableMoldQuantity,
        moldReturned: product.moldReturned,
        accountingNote: product.accountingNote,
        qualityNotes: product.qualityNotes,
        orderHistory: product.orderHistory,
        resumeNotes: product.resumeNotes,

        // Commercial terms
        moq: product.moq,
        leadTime: product.leadTime,
        packagingRequirements: product.packagingRequirements,

        // Composite product related fields
        subPartNo: isCompositeProduct ? selectedComponents : null,
        alias_name: product.alias_name,
      }

      //console.log("Saving product with data:", productData)

      // 使用 Server Action
      const result = await saveProduct(productData)

      //console.log("Save product response:", result)

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Error saving product",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Product saved successfully",
      })

      if (onSubmit) {
        onSubmit(productData)
      } else {
        router.push("/products/all")
      }
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: "Error saving product, please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If loading product data, show loading state
  if (isLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
          <p className="text-gray-500">載入產品資料中...</p>
        </div>
      </div>
    )
  }

  // 確保所有必要的資料都已載入
  if (!customersData.length || !factories.length || !productTypes.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-gray-500">載入必要資料中...</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          // Prevent any dialogs from automatically opening when changing tabs
          setIsNoteDialogOpen(false)
          setIsProcessDialogOpen(false)
          setIsSpecialReqDialogOpen(false)
          setIsProcessNoteDialogOpen(false)
          setIsOrderHistoryDialogOpen(false)
          setIsResumeNoteDialogOpen(false)
          setIsPartManagementDialogOpen(false)
          setIsComplianceDialogOpen(false)

          // Then set the active tab
          setActiveTab(value)
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">基本資訊</TabsTrigger>
          <TabsTrigger value="composite">組合產品</TabsTrigger>
          <TabsTrigger value="images">產品圖片</TabsTrigger>
          <TabsTrigger value="documents">文件與認證</TabsTrigger>
          <TabsTrigger value="process">製程資料</TabsTrigger>
          <TabsTrigger value="resume">履歷資料</TabsTrigger>
        </TabsList>

        {/* Basic info tab */}
        <TabsContent value="basic">
          {!dataLoading && (
            <BasicInfoTab
              product={product}
              handleInputChange={handleInputChange}
              customersData={customersData}
              factories={factories}
              productTypes={productTypes}
            />
          )}
        </TabsContent>

        {/* Composite product tab */}
        <TabsContent value="composite">
          <CompositeProductTab
            selectedComponents={selectedComponents}
            componentDetails={componentDetails}
            openComponentSelector={openComponentSelector}
            removeComponent={removeComponent}
          />
        </TabsContent>

        {/* Other tabs */}
        <TabsContent value="images">
          <ImagesTab product={product} handleInputChange={handleInputChange} setProduct={setProduct} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsTab
            product={product}
            setProduct={setProduct}
            setIsNoteDialogOpen={setIsNoteDialogOpen}
            setIsPartManagementDialogOpen={setIsPartManagementDialogOpen}
            setIsComplianceDialogOpen={setIsComplianceDialogOpen}
            handlePartManagementChange={(field, value) => {
              setProduct((prev) => ({
                ...prev,
                partManagement: {
                  ...(prev.partManagement || {}),
                  [field]: value,
                },
              }))
            }}
            
            handleComplianceStatusChange={(regulation, status) => {
              setProduct((prev) => {
                const newComplianceStatus = prev.complianceStatus.map((item) => {
                  if (item.regulation === regulation) {
                    return { ...item, status }
                  }
                  return item
                })
                return {
                  ...prev,
                  complianceStatus: newComplianceStatus
                }
              })
            }}
            
            handleComplianceFieldChange={(regulation, field, value) => {
              setProduct((prev) => {
                const exists = (prev.complianceStatus || []).some((item: any) => item.regulation === regulation)
                return {
                  ...prev,
                  complianceStatus: exists
                    ? prev.complianceStatus.map((item: any) =>
                        item.regulation === regulation ? { ...item, [field]: value } : item
                      )
                    : [...(prev.complianceStatus || []), { regulation, [field]: value, regulationType: "standard" }],
                }
              })
            }}

          />
        </TabsContent>

        <TabsContent value="process">
          <ProcessTab
            product={product}
            setProduct={setProduct}
            handleInputChange={handleInputChange}
            formData={{}}
            updateFormData={() => {}}
            readOnly={false}
          />
        </TabsContent>

        <TabsContent value="resume">
          <ResumeTab
            product={product}
            handleInputChange={handleInputChange}
            setIsOrderHistoryDialogOpen={setIsOrderHistoryDialogOpen}
            setIsResumeNoteDialogOpen={setIsResumeNoteDialogOpen}
            handleOrderHistoryChange={(index, field, value) => {
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
            }}
            handleRemoveOrderHistory={(index) => {
              setProduct((prev) => {
                const updatedOrderHistory = [...(prev.orderHistory || [])]
                updatedOrderHistory.splice(index, 1)
                return {
                  ...prev,
                  orderHistory: updatedOrderHistory,
                }
              })
            }}
          />
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

      {/* Dialogs */}
      <EditNoteDialog
        isOpen={isNoteDialogOpen}
        onOpenChange={setIsNoteDialogOpen}
        newNote={newNote}
        setNewNote={setNewNote}
        onAddNote={handleAddEditNote}
      />

      <ProcessDialog
        isOpen={isProcessDialogOpen}
        onClose={() => setIsProcessDialogOpen(false)}
        onSave={handleAddProcess}
        initialData={newProcess}
      />

      <SpecialReqDialog
        isOpen={isSpecialReqDialogOpen}
        onOpenChange={setIsSpecialReqDialogOpen}
        newSpecialReq={newSpecialReq}
        setNewSpecialReq={setNewSpecialReq}
        onAddSpecialReq={handleAddSpecialReq}
      />

      <ProcessNoteDialog
        isOpen={isProcessNoteDialogOpen}
        onClose={() => setIsProcessNoteDialogOpen(false)}
        onSave={handleAddProcessNote}
        initialData={newProcessNote}
      />

      <OrderHistoryDialog
        isOpen={isOrderHistoryDialogOpen}
        onOpenChange={setIsOrderHistoryDialogOpen}
        newOrderHistory={newOrderHistory}
        setNewOrderHistory={setNewOrderHistory}
        onAddOrderHistory={handleAddOrderHistory}
      />

      <ResumeNoteDialog
        isOpen={isResumeNoteDialogOpen}
        onOpenChange={setIsResumeNoteDialogOpen}
        newResumeNote={newResumeNote}
        setNewResumeNote={setNewResumeNote}
        onAddResumeNote={handleAddResumeNote}
      />

      <PartManagementDialog
        isOpen={isPartManagementDialogOpen}
        onOpenChange={setIsPartManagementDialogOpen}
        newPartManagement={newPartManagement}
        setNewPartManagement={setNewPartManagement}
        onAddPartManagement={handleAddPartManagement}
      />

      <ComplianceDialog
        isOpen={isComplianceDialogOpen}
        onOpenChange={setIsComplianceDialogOpen}
        newCompliance={newCompliance}
        setNewCompliance={setNewCompliance}
        onAddCompliance={handleAddCompliance}
      />

      <ComponentSelectorDialog
        isOpen={isComponentSelectorOpen}
        onOpenChange={setIsComponentSelectorOpen}
        componentSearchTerm={componentSearchTerm}
        setComponentSearchTerm={setComponentSearchTerm}
        availableComponents={availableComponents}
        selectedComponentIds={selectedComponentIds}
        toggleComponentSelection={toggleComponentSelection}
        confirmComponentSelection={confirmComponentSelection}
        loadAvailableComponents={loadAvailableComponents}
        loadingComponents={loadingComponents}
      />
    </form>
  )
}
