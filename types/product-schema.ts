export interface Product {
  id: string
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
  specifications: {
    name: string
    value: string
  }[]
  sampleStatus?: string
  sampleDate?: string

  // 圖面資訊
  originalDrawingVersion: string
  drawingVersion: string
  customerOriginalDrawing: {
    path: string
    filename: string
  }
  jinzhanDrawing: {
    path: string
    filename: string
  }
  customerDrawing: {
    path: string
    filename: string
  }
  factoryDrawing: {
    path: string
    filename: string
  }
  customerDrawingVersion: string
  factoryDrawingVersion: string

  // 產品圖片
  images: {
    id: string
    url: string
    alt: string
    isThumbnail: boolean
  }[]

  // 組裝資訊
  isAssembly: boolean
  components: {
    id: string
    productId: string
    productName: string
    productPN: string
    quantity: number
    unitPrice: number
    factoryId: string
    factoryName: string
  }[]
  assemblyTime: number
  assemblyCostPerHour: number
  additionalCosts: number

  // 文件與認證
  importantDocuments: {
    PPAP: {
      document: string
      filename: string
    }
    PSW: {
      document: string
      filename: string
    }
    capacityAnalysis: {
      document: string
      filename: string
    }
  }
  partManagement: {
    safetyPart: boolean
    automotivePart: boolean
    CBAMPart: boolean
    clockRequirement: boolean
  }
  complianceStatus: {
    RoHS: {
      status: string
      substances: string
      reason: string
      document: string
      filename: string
    }
    REACh: {
      status: string
      substances: string
      reason: string
      document: string
      filename: string
    }
    EUPOP: {
      status: string
      substances: string
      reason: string
      document: string
      filename: string
    }
    TSCA: {
      status: string
      substances: string
      reason: string
      document: string
      filename: string
    }
    CP65: {
      status: string
      substances: string
      reason: string
      document: string
      filename: string
    }
    PFAS: {
      status: string
      substances: string
      reason: string
      document: string
      filename: string
    }
    CMRT: {
      status: string
      substances: string
      reason: string
      document: string
      filename: string
    }
    EMRT: {
      status: string
      substances: string
      reason: string
      document: string
      filename: string
    }
  }
  editNotes: {
    content: string
    date: string
    user: string
  }[]

  // 製程資料
  processData: {
    id: string
    process: string
    vendor: string
    capacity: string
    requirements: string
    report: string
  }[]
  orderRequirements: string
  purchaseRequirements: string
  specialRequirements: {
    content: string
    date: string
    user: string
  }[]
  processNotes: {
    content: string
    date: string
    user: string
  }[]

  // 履歷資料
  hasMold: boolean
  moldCost: string | number
  refundableMoldQuantity: string | number
  moldReturned: boolean
  accountingNote: string
  qualityNotes: {
    id: string
    title: string
    customer: string
    status: string
    date: string
  }[]
  orderHistory: {
    orderNumber: string
    quantity: number
  }[]
  resumeNotes: {
    content: string
    date: string
    user: string
  }[]

  // 商業條款
  moq: number
  leadTime: string
  packagingRequirements: string
  sub_part_no?:
    | {
        id: string
        productId: string
        productName: string
        productPN: string
        quantity: number
        unitPrice: number
        factoryId: string
        factoryName: string
      }[]
    | string
}
