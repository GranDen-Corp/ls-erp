export interface ProductImage {
  id: string
  url: string
  alt: string
  isThumbnail: boolean
}

export interface DrawingFile {
  path: string
  filename: string
}

export interface ImportantDocument {
  document: string
  filename: string
}

export interface ImportantDocuments {
  PPAP: ImportantDocument
  PSW: ImportantDocument
  capacityAnalysis: ImportantDocument
}

export interface PartManagement {
  safetyPart: boolean
  automotivePart: boolean
  CBAMPart: boolean
  clockRequirement: boolean
}

export interface ComplianceStatus {
  status: string
  substances: string
  reason: string
  document: string
  filename: string
}

export interface ComplianceStatuses {
  RoHS: ComplianceStatus
  REACh: ComplianceStatus
  EUPOP: ComplianceStatus
  TSCA: ComplianceStatus
  CP65: ComplianceStatus
  PFAS: ComplianceStatus
  CMRT: ComplianceStatus
  EMRT: ComplianceStatus
}

export interface Note {
  content: string
  date: string
  user: string
}

export interface ProcessRecord {
  id: string
  process: string
  vendor: string
  capacity: string
  requirements: string
  report: string
}

export interface QualityNote {
  id: string
  title: string
  customer: string
  status: string
  date: string
}

export interface OrderHistoryRecord {
  orderNumber: string
  quantity: number
}

export interface ProductComponent {
  id: string
  productId: string
  productName: string
  productPN: string
  quantity: number
  unitPrice: number
  factoryId: string
  factoryName: string
}

export interface ProductSpecification {
  name: string
  value: string
}

export interface Product {
  id?: string
  componentName: string
  componentNameEn: string
  specification: string
  customsCode: string
  endCustomer: string
  customerName: {
    id: string
    name: string
    code: string
  }
  factoryName: {
    id: string
    name: string
    code: string
  }
  productType: string
  partNo: string
  classificationCode: string
  vehicleDrawingNo: string
  customerDrawingNo: string
  productPeriod: string
  description: string
  status: string
  createdDate?: string
  lastOrderDate?: string
  lastPrice?: number
  currency?: string

  // 產品規格
  specifications: ProductSpecification[]
  sampleStatus?: string
  sampleDate?: string

  // 圖面資訊
  originalDrawingVersion: string
  customerOriginalDrawing: DrawingFile
  customerDrawing: DrawingFile
  factoryDrawing: DrawingFile
  customerDrawingVersion: string
  factoryDrawingVersion: string

  // 產品圖片
  images: ProductImage[]

  // 組裝資訊
  isAssembly: boolean
  components: ProductComponent[]
  assemblyTime: number
  assemblyCostPerHour: number
  additionalCosts: number

  // 文件與認證
  importantDocuments: ImportantDocuments
  partManagement: PartManagement
  complianceStatus: Record<string, ComplianceStatus>
  editNotes: Note[]

  // 製程資料
  processData: ProcessRecord[]
  orderRequirements: string
  purchaseRequirements: string
  specialRequirements: Note[]
  processNotes: Note[]

  // 履歷資料
  hasMold: boolean
  moldCost: string | number
  refundableMoldQuantity: string | number
  moldReturned: boolean
  accountingNote: string
  qualityNotes: QualityNote[]
  orderHistory: OrderHistoryRecord[]
  resumeNotes: Note[]

  // 商業條款
  moq: number
  leadTime: string
  packagingRequirements: string
  sub_part_no?: ProductComponent[] | string
}
