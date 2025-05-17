import type { ProcessRecord } from "@/types/product-form-types"

// Default empty file object
export const emptyFileObject = {
  path: "",
  filename: "",
}

// Default empty compliance status
export const emptyComplianceStatus = {
  status: "",
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
  // Compliance requirements related fields
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
