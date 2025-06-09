import type { ProcessRecord } from "@/types/product-form-types"

// 預設製程資料
const defaultProcesses: ProcessRecord[] = []

// Default empty file object
export const emptyFileObject = {
  path: "",
  filename: "",
}

// Default empty compliance status
export const emptyComplianceStatus = {
  regulation: "",
  regulationType: "",
  status: false,
  substances: "",
  reason: "",
  document: "",
  filename: "",
}

// Default empty document record
export const emptyDocumentRecord = {
  document: "",
  filename: "",
}

// Generate order and purchase requirements from process data
export const generateRequirements = (processData: ProcessRecord[]) => {
  // Order part requirements - all process requirements
  const orderReqs = processData
    .filter((proc) => proc.requirements)
    .map((proc) => `${proc.process}：${proc.requirements}`)
    .join("\n")

  // Purchase order part requirements - also includes all process requirements
  const purchaseReqs = processData
    .filter((proc) => proc.requirements)
    .map((proc) => `${proc.process}：${proc.requirements}`)
    .join("\n")

  return {
    orderReqs,
    purchaseReqs,
  }
}

// Default product data
export const getDefaultProduct = (isAssembly = false) => ({
  componentName: "",
  componentNameEn: "",
  specification: "",
  customsCode: "",
  endCustomer: "",
  customer_id: "",
  factory_id: "",
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
  // Compliance requirements related fields
  complianceStatus:[],
  // Important document related fields
  importantDocuments: {
    PPAP: emptyDocumentRecord,
    PSW: emptyDocumentRecord,
    capacityAnalysis: emptyDocumentRecord,
  },
  // Part management characteristics related fields
  partManagement: {
    "安全件": false,
    "汽車件": false,
    "CBAM件": false,
    "熔鑄地要求": false,
  },
  // Edit notes related fields
  editNotes: [],
  // Process data related fields
  processData: [],
  // Order and purchase order requirements
  orderRequirements: "",
  purchaseRequirements: "",
  specialRequirements: [],
  processNotes: [],
  // Commercial terms
  moq: 0,
  leadTime: "",
  packagingRequirements: "",
  // Resume data
  hasMold: false,
  moldCost: "",
  refundableMoldQuantity: "",
  moldReturned: false,
  accountingNote: "",
  qualityNotes: [],
  resumeNotes: [],
  orderHistory: [],
})
