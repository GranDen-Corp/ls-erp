// Document record type
export interface DocumentRecord {
  document: string
  filename: string
  title?: string
}

// Compliance status type
export interface ComplianceStatus {
  regulation: string
  status: boolean
  regulationType: string
  substances: string
  reason: string
  document: string
}

// Note type
export interface Note {
  content: string
  date: string
  user: string
}

// Order history record type
export interface OrderHistoryRecord {
  orderNumber: string
  quantity: number
}

// Product specification type
export interface ProductSpecification {
  name: string
  value: string
}

// Process record type
export interface ProcessRecord {
  id: string
  process: string
  vendor: string
  capacity: string
  requirements: string
  report: string
}

// Product component type
export interface ProductComponent {
  part_no: string
  description: string
}

// Customer type
export interface Customer {
  id: string
  name: string
  code: string
}

// Factory type
export interface Factory {
  id: string
  name: string
  code: string
}

// Product type category
export interface ProductType {
  id: number
  type_code: string
  type_name: string
  description: string
}

// Product form props
export interface ProductFormProps {
  productId?: string
  customerId?: string
  onSubmit?: (data: any) => void
  initialValues?: any
  isSubmitting?: boolean
  isAssembly?: boolean
  defaultTab?: string
}

// Product type
export interface Product {
  customer_id: string
  part_no: string
  factory_id: string
  component_name: string
  component_name_en?: string
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
  customer_drawing: DocumentRecord
  factory_drawing: DocumentRecord
  customer_drawing_version: string
  factory_drawing_version: string
  images: string[]
  //is_assembly: boolean
  components: string[]
  assembly_time: number
  assembly_cost_per_hour: number
  additional_costs: number
  important_documents: {
    PPAP: DocumentRecord
    PSW: DocumentRecord
    capacityAnalysis: DocumentRecord
    [key: string]: DocumentRecord
  }
  part_management: {
    safetyPart: boolean
    automotivePart: boolean
    CBAMPart: boolean
    clockRequirement: boolean
    [key: string]: boolean
  }
  compliance_status: ComplianceStatus[]
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

// Product form values type
export interface ProductFormValues {
  customer_id: string
  part_no: string
  factory_id: string
  component_name: string
  component_name_en?: string
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
    [key: string]: DocumentRecord
  }
  part_management: {
    safetyPart: boolean
    automotivePart: boolean
    CBAMPart: boolean
    clockRequirement: boolean
    [key: string]: boolean
  }
  compliance_status: ComplianceStatus []
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

// Form state type for ProductForm
export interface ProductFormState {
  product: any
  activeTab: string
  newNote: Note
  newProcess: ProcessRecord
  newSpecialReq: Note
  newProcessNote: Note
  newOrderHistory: OrderHistoryRecord
  newResumeNote: Note
  newSpec: ProductSpecification
  isNoteDialogOpen: boolean
  isProcessDialogOpen: boolean
  isSpecialReqDialogOpen: boolean
  isProcessNoteDialogOpen: boolean
  isOrderHistoryDialogOpen: boolean
  isResumeNoteDialogOpen: boolean
  isPartManagementDialogOpen: boolean
  isComplianceDialogOpen: boolean
  newPartManagement: { name: string; value: boolean }
  newCompliance: {
    regulation: string
    status: string
    substances: string
    reason: string
    document: string
    filename: string
  }
  customersData: Customer[]
  factories: Factory[]
  productTypes: ProductType[]
  dataLoading: boolean
  dataError: string | null
  isLoading: boolean
  isCompositeProduct: boolean
  selectedComponents: ProductComponent[]
  isComponentSelectorOpen: boolean
  componentSearchTerm: string
  availableComponents: Product[]
  selectedComponentIds: string[]
  loadingComponents: boolean
  componentDetails: { [key: string]: string }
}
