import type { ProcessRecord } from "@/types/product-form-types"

// 預設製程資料
const defaultProcesses = [
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
    vendor: "岡岩",
    capacity: "",
    requirements: "",
    report: "",
  },
  {
    id: "proc_3",
    process: "搓牙",
    vendor: "岡岩",
    capacity: "",
    requirements: "",
    report: "",
  },
  {
    id: "proc_4",
    process: "熱處理",
    vendor: "力大",
    capacity: "",
    requirements: "硬度HRC 28-32，拉力800Mpa，降伏640",
    report: "硬度，拉力",
  },
  {
    id: "proc_5",
    process: "電鍍",
    vendor: "頂上興",
    capacity: "",
    requirements: "三價鉻鋅SUM MIN，鹽測12/48",
    report: "膜厚，鹽測，除氫",
  },
  {
    id: "proc_6",
    process: "篩選",
    vendor: "聖鼎",
    capacity: "",
    requirements: "50 PPM：混料、總長",
    report: "篩選報告",
  },
]

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
    safetyPart: false,
    automotivePart: false,
    CBAMPart: false,
    clockRequirement: false,
  },
  // Edit notes related fields
  editNotes: [],
  // Process data related fields
  processData: defaultProcesses,
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
