"use client"

import React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, FileJson, RefreshCw, Eye, Download, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"

// 定義產品類型
type ProductSpecification = {
  name: string
  value: string
}

type ProductImage = {
  id: string
  url: string
  alt: string
  isThumbnail: boolean
}

type DrawingFile = {
  path: string
  filename: string
}

type ImportantDocument = {
  document: string
  filename: string
}

type ImportantDocuments = {
  PPAP: ImportantDocument
  PSW: ImportantDocument
  capacityAnalysis: ImportantDocument
}

type PartManagement = {
  safetyPart: boolean
  automotivePart: boolean
  CBAMPart: boolean
  clockRequirement: boolean
}

type ComplianceStatus = {
  status: string
  substances: string
  reason: string
  document: string
  filename: string
}

type ComplianceStatuses = {
  RoHS: ComplianceStatus
  REACh: ComplianceStatus
  EUPOP: ComplianceStatus
  TSCA: ComplianceStatus
  CP65: ComplianceStatus
  PFAS: ComplianceStatus
  CMRT: ComplianceStatus
  EMRT: ComplianceStatus
}

type Note = {
  content: string
  date: string
  user: string
}

type ProcessRecord = {
  id: string
  process: string
  vendor: string
  capacity: string
  requirements: string
  report: string
}

type QualityNote = {
  id: string
  title: string
  customer: string
  status: string
  date: string
}

type OrderHistoryRecord = {
  orderNumber: string
  quantity: number
}

type ProductComponent = {
  id: string
  productId: string
  productName: string
  productPN: string
  quantity: number
  unitPrice: number
  factoryId: string
  factoryName: string
}

type Product = {
  id: string
  componentName: string
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
  drawingVersion: string
  customerOriginalDrawing: DrawingFile
  jinzhanDrawing: DrawingFile
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
  complianceStatus: ComplianceStatuses
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
}

// 模擬產品資料
const productData: Product[] = [
  {
    id: "P001",
    componentName: "螺栓 M8x30mm",
    specification: "六角頭",
    customsCode: "7318.15.90",
    endCustomer: "台灣汽車",
    customerName: {
      id: "C001",
      name: "台灣電子",
      code: "TE",
    },
    factoryName: {
      id: "F001",
      name: "深圳電子廠",
      code: "SZE",
    },
    productType: "螺絲",
    partNo: "HB-M8-30-304",
    classificationCode: "FS-001",
    vehicleDrawingNo: "TA-2023-001",
    customerDrawingNo: "TE-HB-001",
    productPeriod: "2023-Q2",
    description: "304不鏽鋼六角螺栓，適用於戶外及潮濕環境，具有良好的防腐蝕性能。",
    status: "active",
    createdDate: "2023-01-15",
    lastOrderDate: "2023-06-20",
    lastPrice: 2.5,
    currency: "TWD",
    specifications: [
      { name: "材質", value: "304不鏽鋼" },
      { name: "標準", value: "DIN933/ISO4017" },
      { name: "尺寸", value: "M8x30mm" },
      { name: "表面處理", value: "素面" },
      { name: "等級", value: "A2-70" },
      { name: "螺紋類型", value: "粗牙" },
    ],
    sampleStatus: "已確認",
    sampleDate: "2022-12-10",
    originalDrawingVersion: "V1.0",
    drawingVersion: "V1.2",
    customerOriginalDrawing: {
      path: "\\\\server\\drawings\\customer\\TE-HB-001-V1.0.pdf",
      filename: "TE-HB-001-V1.0.pdf",
    },
    jinzhanDrawing: {
      path: "\\\\server\\drawings\\jinzhan\\JZ-HB-001-V1.2.pdf",
      filename: "JZ-HB-001-V1.2.pdf",
    },
    customerDrawing: {
      path: "\\\\server\\drawings\\customer\\TE-HB-001-SPEC.pdf",
      filename: "TE-HB-001-SPEC.pdf",
    },
    factoryDrawing: {
      path: "\\\\server\\drawings\\factory\\SZE-HB-001-SPEC.pdf",
      filename: "SZE-HB-001-SPEC.pdf",
    },
    customerDrawingVersion: "V1.0",
    factoryDrawingVersion: "V1.0",
    images: [
      {
        id: "1",
        url: "/hex-bolt.png",
        alt: "六角螺栓圖片",
        isThumbnail: true,
      },
      {
        id: "2",
        url: "/placeholder.svg?height=400&width=400",
        alt: "產品圖片2",
        isThumbnail: false,
      },
    ],
    isAssembly: false,
    components: [],
    assemblyTime: 0,
    assemblyCostPerHour: 0,
    additionalCosts: 0,
    importantDocuments: {
      PPAP: { document: "\\\\server\\documents\\PPAP\\HB-M8-30-304-PPAP.pdf", filename: "HB-M8-30-304-PPAP.pdf" },
      PSW: { document: "\\\\server\\documents\\PSW\\HB-M8-30-304-PSW.pdf", filename: "HB-M8-30-304-PSW.pdf" },
      capacityAnalysis: {
        document: "\\\\server\\documents\\capacity\\HB-M8-30-304-CAP.pdf",
        filename: "HB-M8-30-304-CAP.pdf",
      },
    },
    partManagement: {
      safetyPart: false,
      automotivePart: true,
      CBAMPart: false,
      clockRequirement: false,
    },
    complianceStatus: {
      RoHS: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      REACh: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      EUPOP: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      TSCA: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      CP65: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      PFAS: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      CMRT: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      EMRT: { status: "符合", substances: "", reason: "", document: "", filename: "" },
    },
    editNotes: [
      {
        content: "初始產品資料建立",
        date: "2023/01/15",
        user: "王小明",
      },
    ],
    processData: [
      {
        id: "proc_1",
        process: "材料",
        vendor: "中鋼",
        capacity: "10000/日",
        requirements: "304不鏽鋼",
        report: "材質證明",
      },
      {
        id: "proc_2",
        process: "成型",
        vendor: "固岩",
        capacity: "5000/日",
        requirements: "六角頭",
        report: "",
      },
      {
        id: "proc_3",
        process: "搓牙",
        vendor: "固岩",
        capacity: "5000/日",
        requirements: "M8粗牙",
        report: "",
      },
    ],
    orderRequirements: "材料：304不鏽鋼\n成型：六角頭\n搓牙：M8粗牙",
    purchaseRequirements: "材料：304不鏽鋼",
    specialRequirements: [],
    processNotes: [
      {
        content: "標準製程，無特殊要求",
        date: "2023/01/15",
        user: "王小明",
      },
    ],
    hasMold: false,
    moldCost: "",
    refundableMoldQuantity: "",
    moldReturned: false,
    accountingNote: "",
    qualityNotes: [],
    orderHistory: [
      {
        orderNumber: "ORD-2023-001",
        quantity: 5000,
      },
      {
        orderNumber: "ORD-2023-045",
        quantity: 3000,
      },
    ],
    resumeNotes: [],
    moq: 1000,
    leadTime: "7-10天",
    packagingRequirements: "單獨防靜電包裝，外箱標示產品型號和批次",
  },
  {
    id: "P002",
    componentName: "自攻螺絲 ST4.2x16mm",
    specification: "盤頭",
    customsCode: "7318.14.10",
    endCustomer: "新竹科技",
    customerName: {
      id: "C002",
      name: "新竹科技",
      code: "HT",
    },
    factoryName: {
      id: "F002",
      name: "東莞工業廠",
      code: "DGI",
    },
    productType: "螺絲",
    partNo: "ST-4.2-16-ZN",
    classificationCode: "FS-002",
    vehicleDrawingNo: "",
    customerDrawingNo: "HT-ST-001",
    productPeriod: "2023-Q1",
    description: "鍍鋅自攻螺絲，適用於薄板金屬、塑料等材料的固定，安裝方便快捷。",
    status: "active",
    createdDate: "2023-02-10",
    lastOrderDate: "2023-07-05",
    lastPrice: 0.3,
    currency: "TWD",
    specifications: [
      { name: "材質", value: "鍍鋅碳鋼" },
      { name: "標準", value: "DIN7981/ISO7049" },
      { name: "尺寸", value: "ST4.2x16mm" },
      { name: "表面處理", value: "鍍鋅" },
      { name: "等級", value: "4.8" },
      { name: "螺紋類型", value: "自攻牙" },
    ],
    sampleStatus: "已確認",
    sampleDate: "2023-01-15",
    originalDrawingVersion: "V1.0",
    drawingVersion: "V1.0",
    customerOriginalDrawing: {
      path: "\\\\server\\drawings\\customer\\HT-ST-001-V1.0.pdf",
      filename: "HT-ST-001-V1.0.pdf",
    },
    jinzhanDrawing: {
      path: "\\\\server\\drawings\\jinzhan\\JZ-ST-001-V1.0.pdf",
      filename: "JZ-ST-001-V1.0.pdf",
    },
    customerDrawing: {
      path: "\\\\server\\drawings\\customer\\HT-ST-001-SPEC.pdf",
      filename: "HT-ST-001-SPEC.pdf",
    },
    factoryDrawing: {
      path: "\\\\server\\drawings\\factory\\DGI-ST-001-SPEC.pdf",
      filename: "DGI-ST-001-SPEC.pdf",
    },
    customerDrawingVersion: "V1.0",
    factoryDrawingVersion: "V1.0",
    images: [
      {
        id: "1",
        url: "/placeholder.svg?key=zar5e",
        alt: "自攻螺絲圖片",
        isThumbnail: true,
      },
    ],
    isAssembly: false,
    components: [],
    assemblyTime: 0,
    assemblyCostPerHour: 0,
    additionalCosts: 0,
    importantDocuments: {
      PPAP: { document: "\\\\server\\documents\\PPAP\\ST-4.2-16-ZN-PPAP.pdf", filename: "ST-4.2-16-ZN-PPAP.pdf" },
      PSW: { document: "\\\\server\\documents\\PSW\\ST-4.2-16-ZN-PSW.pdf", filename: "ST-4.2-16-ZN-PSW.pdf" },
      capacityAnalysis: {
        document: "\\\\server\\documents\\capacity\\ST-4.2-16-ZN-CAP.pdf",
        filename: "ST-4.2-16-ZN-CAP.pdf",
      },
    },
    partManagement: {
      safetyPart: false,
      automotivePart: false,
      CBAMPart: false,
      clockRequirement: false,
    },
    complianceStatus: {
      RoHS: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      REACh: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      EUPOP: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      TSCA: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      CP65: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      PFAS: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      CMRT: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      EMRT: { status: "符合", substances: "", reason: "", document: "", filename: "" },
    },
    editNotes: [
      {
        content: "初始產品資料建立",
        date: "2023/02/10",
        user: "李小華",
      },
    ],
    processData: [
      {
        id: "proc_1",
        process: "材料",
        vendor: "寶鋼",
        capacity: "20000/日",
        requirements: "碳鋼",
        report: "材質證明",
      },
      {
        id: "proc_2",
        process: "成型",
        vendor: "東莞工業",
        capacity: "10000/日",
        requirements: "盤頭",
        report: "",
      },
      {
        id: "proc_3",
        process: "搓牙",
        vendor: "東莞工業",
        capacity: "10000/日",
        requirements: "自攻牙",
        report: "",
      },
      {
        id: "proc_4",
        process: "電鍍",
        vendor: "恒吉興",
        capacity: "15000/日",
        requirements: "鍍鋅",
        report: "膜厚報告",
      },
    ],
    orderRequirements: "材料：碳鋼\n成型：盤頭\n搓牙：自攻牙\n電鍍：鍍鋅",
    purchaseRequirements: "材料：碳鋼\n電鍍：鍍鋅",
    specialRequirements: [],
    processNotes: [
      {
        content: "標準製程，無特殊要求",
        date: "2023/02/10",
        user: "李小華",
      },
    ],
    hasMold: false,
    moldCost: "",
    refundableMoldQuantity: "",
    moldReturned: false,
    accountingNote: "",
    qualityNotes: [],
    orderHistory: [
      {
        orderNumber: "ORD-2023-015",
        quantity: 10000,
      },
      {
        orderNumber: "ORD-2023-078",
        quantity: 15000,
      },
    ],
    resumeNotes: [],
    moq: 5000,
    leadTime: "5-7天",
    packagingRequirements: "散裝，每箱5000pcs",
  },
  {
    id: "P003",
    componentName: "內六角螺絲 M6x20mm",
    specification: "圓柱頭",
    customsCode: "7318.15.90",
    endCustomer: "台北工業",
    customerName: {
      id: "C003",
      name: "台北工業",
      code: "TI",
    },
    factoryName: {
      id: "F003",
      name: "嘉興螺絲廠",
      code: "JXS",
    },
    productType: "螺絲",
    partNo: "SH-M6-20-129",
    classificationCode: "FS-003",
    vehicleDrawingNo: "",
    customerDrawingNo: "TI-SH-001",
    productPeriod: "2023-Q1",
    description: "12.9級高強度內六角螺絲，適用於高強度、高負荷的連接場合。",
    status: "active",
    createdDate: "2023-03-05",
    lastOrderDate: "2023-08-15",
    lastPrice: 1.8,
    currency: "TWD",
    specifications: [
      { name: "材質", value: "合金鋼" },
      { name: "標準", value: "DIN912/ISO4762" },
      { name: "尺寸", value: "M6x20mm" },
      { name: "表面處理", value: "黑色氧化" },
      { name: "等級", value: "12.9" },
      { name: "螺紋類型", value: "粗牙" },
    ],
    sampleStatus: "已確認",
    sampleDate: "2023-02-20",
    originalDrawingVersion: "V1.0",
    drawingVersion: "V1.1",
    customerOriginalDrawing: {
      path: "\\\\server\\drawings\\customer\\TI-SH-001-V1.0.pdf",
      filename: "TI-SH-001-V1.0.pdf",
    },
    jinzhanDrawing: {
      path: "\\\\server\\drawings\\jinzhan\\JZ-SH-001-V1.1.pdf",
      filename: "JZ-SH-001-V1.1.pdf",
    },
    customerDrawing: {
      path: "\\\\server\\drawings\\customer\\TI-SH-001-SPEC.pdf",
      filename: "TI-SH-001-SPEC.pdf",
    },
    factoryDrawing: {
      path: "\\\\server\\drawings\\factory\\JXS-SH-001-SPEC.pdf",
      filename: "JXS-SH-001-SPEC.pdf",
    },
    customerDrawingVersion: "V1.0",
    factoryDrawingVersion: "V1.0",
    images: [
      {
        id: "1",
        url: "/socket-head-cap-screw.png",
        alt: "內六角螺絲圖片",
        isThumbnail: true,
      },
    ],
    isAssembly: false,
    components: [],
    assemblyTime: 0,
    assemblyCostPerHour: 0,
    additionalCosts: 0,
    importantDocuments: {
      PPAP: { document: "\\\\server\\documents\\PPAP\\SH-M6-20-129-PPAP.pdf", filename: "SH-M6-20-129-PPAP.pdf" },
      PSW: { document: "\\\\server\\documents\\PSW\\SH-M6-20-129-PSW.pdf", filename: "SH-M6-20-129-PSW.pdf" },
      capacityAnalysis: {
        document: "\\\\server\\documents\\capacity\\SH-M6-20-129-CAP.pdf",
        filename: "SH-M6-20-129-CAP.pdf",
      },
    },
    partManagement: {
      safetyPart: true,
      automotivePart: true,
      CBAMPart: false,
      clockRequirement: false,
    },
    complianceStatus: {
      RoHS: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      REACh: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      EUPOP: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      TSCA: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      CP65: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      PFAS: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      CMRT: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      EMRT: { status: "符合", substances: "", reason: "", document: "", filename: "" },
    },
    editNotes: [
      {
        content: "初始產品資料建立",
        date: "2023/03/05",
        user: "張小龍",
      },
      {
        content: "更新圖面版本至V1.1",
        date: "2023/05/10",
        user: "張小龍",
      },
    ],
    processData: [
      {
        id: "proc_1",
        process: "材料",
        vendor: "鞍鋼",
        capacity: "8000/日",
        requirements: "合金鋼SCM440",
        report: "材質證明",
      },
      {
        id: "proc_2",
        process: "成型",
        vendor: "嘉興螺絲",
        capacity: "5000/日",
        requirements: "圓柱頭",
        report: "",
      },
      {
        id: "proc_3",
        process: "搓牙",
        vendor: "嘉興螺絲",
        capacity: "5000/日",
        requirements: "M6粗牙",
        report: "",
      },
      {
        id: "proc_4",
        process: "熱處理",
        vendor: "力大",
        capacity: "10000/日",
        requirements: "硬度HRC 39-44",
        report: "硬度報告",
      },
      {
        id: "proc_5",
        process: "表面處理",
        vendor: "嘉興螺絲",
        capacity: "8000/日",
        requirements: "黑色氧化",
        report: "",
      },
    ],
    orderRequirements: "材料：合金鋼SCM440\n成型：圓柱頭\n搓牙：M6粗牙\n熱處理：硬度HRC 39-44\n表面處理：黑色氧化",
    purchaseRequirements: "材料：合金鋼SCM440\n熱處理：硬度HRC 39-44",
    specialRequirements: [
      {
        content: "需提供硬度測試報告",
        date: "2023/03/05",
        user: "張小龍",
      },
    ],
    processNotes: [
      {
        content: "熱處理後需進行100%硬度檢測",
        date: "2023/03/05",
        user: "張小龍",
      },
    ],
    hasMold: false,
    moldCost: "",
    refundableMoldQuantity: "",
    moldReturned: false,
    accountingNote: "",
    qualityNotes: [],
    orderHistory: [
      {
        orderNumber: "ORD-2023-032",
        quantity: 3000,
      },
      {
        orderNumber: "ORD-2023-089",
        quantity: 5000,
      },
    ],
    resumeNotes: [],
    moq: 2000,
    leadTime: "7-10天",
    packagingRequirements: "防鏽紙包裝，每箱1000pcs",
  },
  {
    id: "P004",
    componentName: "深溝球軸承 6204ZZ",
    specification: "雙面金屬蓋板",
    customsCode: "8482.10.00",
    endCustomer: "高雄製造",
    customerName: {
      id: "C004",
      name: "高雄製造",
      code: "KM",
    },
    factoryName: {
      id: "F004",
      name: "上海軸承廠",
      code: "SHB",
    },
    productType: "軸承",
    partNo: "BB-6204-ZZ",
    classificationCode: "BR-001",
    vehicleDrawingNo: "",
    customerDrawingNo: "KM-BB-001",
    productPeriod: "2023-Q2",
    description: "6204ZZ深溝球軸承，雙面金屬蓋板設計，適用於電機、泵、傳動設備等。",
    status: "active",
    createdDate: "2023-04-20",
    lastOrderDate: "2023-09-10",
    lastPrice: 35,
    currency: "TWD",
    specifications: [
      { name: "內徑", value: "20mm" },
      { name: "外徑", value: "47mm" },
      { name: "厚度", value: "14mm" },
      { name: "材質", value: "軸承鋼" },
      { name: "精度等級", value: "ABEC-3" },
      { name: "間隙", value: "C3" },
    ],
    sampleStatus: "已確認",
    sampleDate: "2023-04-05",
    originalDrawingVersion: "V1.0",
    drawingVersion: "V1.0",
    customerOriginalDrawing: {
      path: "\\\\server\\drawings\\customer\\KM-BB-001-V1.0.pdf",
      filename: "KM-BB-001-V1.0.pdf",
    },
    jinzhanDrawing: {
      path: "\\\\server\\drawings\\jinzhan\\JZ-BB-001-V1.0.pdf",
      filename: "JZ-BB-001-V1.0.pdf",
    },
    customerDrawing: {
      path: "\\\\server\\drawings\\customer\\KM-BB-001-SPEC.pdf",
      filename: "KM-BB-001-SPEC.pdf",
    },
    factoryDrawing: {
      path: "\\\\server\\drawings\\factory\\SHB-BB-001-SPEC.pdf",
      filename: "SHB-BB-001-SPEC.pdf",
    },
    customerDrawingVersion: "V1.0",
    factoryDrawingVersion: "V1.0",
    images: [
      {
        id: "1",
        url: "/ball-bearing.png",
        alt: "深溝球軸承圖片",
        isThumbnail: true,
      },
    ],
    isAssembly: false,
    components: [],
    assemblyTime: 0,
    assemblyCostPerHour: 0,
    additionalCosts: 0,
    importantDocuments: {
      PPAP: { document: "\\\\server\\documents\\PPAP\\BB-6204-ZZ-PPAP.pdf", filename: "BB-6204-ZZ-PPAP.pdf" },
      PSW: { document: "\\\\server\\documents\\PSW\\BB-6204-ZZ-PSW.pdf", filename: "BB-6204-ZZ-PSW.pdf" },
      capacityAnalysis: {
        document: "\\\\server\\documents\\capacity\\BB-6204-ZZ-CAP.pdf",
        filename: "BB-6204-ZZ-CAP.pdf",
      },
    },
    partManagement: {
      safetyPart: false,
      automotivePart: true,
      CBAMPart: false,
      clockRequirement: false,
    },
    complianceStatus: {
      RoHS: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      REACh: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      EUPOP: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      TSCA: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      CP65: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      PFAS: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      CMRT: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      EMRT: { status: "符合", substances: "", reason: "", document: "", filename: "" },
    },
    editNotes: [
      {
        content: "初始產品資料建立",
        date: "2023/04/20",
        user: "陳小明",
      },
    ],
    processData: [
      {
        id: "proc_1",
        process: "材料",
        vendor: "上海鋼鐵",
        capacity: "5000/日",
        requirements: "軸承鋼GCr15",
        report: "材質證明",
      },
      {
        id: "proc_2",
        process: "車削",
        vendor: "上海軸承",
        capacity: "3000/日",
        requirements: "內徑20mm，外徑47mm，厚度14mm",
        report: "",
      },
      {
        id: "proc_3",
        process: "熱處理",
        vendor: "上海軸承",
        capacity: "5000/日",
        requirements: "硬度HRC 60-65",
        report: "硬度報告",
      },
      {
        id: "proc_4",
        process: "組裝",
        vendor: "上海軸承",
        capacity: "3000/日",
        requirements: "雙面金屬蓋板",
        report: "",
      },
      {
        id: "proc_5",
        process: "潤滑",
        vendor: "上海軸承",
        capacity: "5000/日",
        requirements: "標準潤滑脂",
        report: "",
      },
    ],
    orderRequirements:
      "材料：軸承鋼GCr15\n車削：內徑20mm，外徑47mm，厚度14mm\n熱處理：硬度HRC 60-65\n組裝：雙面金屬蓋板\n潤滑：標準潤滑脂",
    purchaseRequirements: "材料：軸承鋼GCr15\n熱處理：硬度HRC 60-65",
    specialRequirements: [
      {
        content: "需提供噪音測試報告",
        date: "2023/04/20",
        user: "陳小明",
      },
    ],
    processNotes: [
      {
        content: "組裝前需進行100%尺寸檢測",
        date: "2023/04/20",
        user: "陳小明",
      },
    ],
    hasMold: false,
    moldCost: "",
    refundableMoldQuantity: "",
    moldReturned: false,
    accountingNote: "",
    qualityNotes: [],
    orderHistory: [
      {
        orderNumber: "ORD-2023-056",
        quantity: 500,
      },
      {
        orderNumber: "ORD-2023-102",
        quantity: 800,
      },
    ],
    resumeNotes: [],
    moq: 100,
    leadTime: "10-15天",
    packagingRequirements: "單獨防靜電包裝，每箱50pcs",
  },
  {
    id: "P005",
    componentName: "圓錐滾子軸承 30205",
    specification: "開放式",
    customsCode: "8482.20.00",
    endCustomer: "台中電子",
    customerName: {
      id: "C005",
      name: "台中電子",
      code: "TC",
    },
    factoryName: {
      id: "F005",
      name: "寧波軸承廠",
      code: "NBB",
    },
    productType: "軸承",
    partNo: "TB-30205",
    classificationCode: "BR-002",
    vehicleDrawingNo: "",
    customerDrawingNo: "TC-TB-001",
    productPeriod: "2023-Q2",
    description: "30205圓錐滾子軸承，適用於承受徑向和軸向複合載荷的應用場合，如汽車變速箱、差速器等。",
    status: "active",
    createdDate: "2023-05-15",
    lastOrderDate: "2023-10-05",
    lastPrice: 65,
    currency: "TWD",
    specifications: [
      { name: "內徑", value: "25mm" },
      { name: "外徑", value: "52mm" },
      { name: "厚度", value: "16.25mm" },
      { name: "材質", value: "軸承鋼" },
      { name: "精度等級", value: "P5" },
      { name: "間隙", value: "標準" },
    ],
    sampleStatus: "已確認",
    sampleDate: "2023-05-01",
    originalDrawingVersion: "V1.0",
    drawingVersion: "V1.0",
    customerOriginalDrawing: {
      path: "\\\\server\\drawings\\customer\\TC-TB-001-V1.0.pdf",
      filename: "TC-TB-001-V1.0.pdf",
    },
    jinzhanDrawing: {
      path: "\\\\server\\drawings\\jinzhan\\JZ-TB-001-V1.0.pdf",
      filename: "JZ-TB-001-V1.0.pdf",
    },
    customerDrawing: {
      path: "\\\\server\\drawings\\customer\\TC-TB-001-SPEC.pdf",
      filename: "TC-TB-001-SPEC.pdf",
    },
    factoryDrawing: {
      path: "\\\\server\\drawings\\factory\\NBB-TB-001-SPEC.pdf",
      filename: "NBB-TB-001-SPEC.pdf",
    },
    customerDrawingVersion: "V1.0",
    factoryDrawingVersion: "V1.0",
    images: [
      {
        id: "1",
        url: "/tapered-roller-bearing.png",
        alt: "圓錐滾子軸承圖片",
        isThumbnail: true,
      },
    ],
    isAssembly: false,
    components: [],
    assemblyTime: 0,
    assemblyCostPerHour: 0,
    additionalCosts: 0,
    importantDocuments: {
      PPAP: { document: "\\\\server\\documents\\PPAP\\TB-30205-PPAP.pdf", filename: "TB-30205-PPAP.pdf" },
      PSW: { document: "\\\\server\\documents\\PSW\\TB-30205-PSW.pdf", filename: "TB-30205-PSW.pdf" },
      capacityAnalysis: {
        document: "\\\\server\\documents\\capacity\\TB-30205-CAP.pdf",
        filename: "TB-30205-CAP.pdf",
      },
    },
    partManagement: {
      safetyPart: true,
      automotivePart: true,
      CBAMPart: false,
      clockRequirement: false,
    },
    complianceStatus: {
      RoHS: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      REACh: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      EUPOP: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      TSCA: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      CP65: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      PFAS: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      CMRT: { status: "符合", substances: "", reason: "", document: "", filename: "" },
      EMRT: { status: "符合", substances: "", reason: "", document: "", filename: "" },
    },
    editNotes: [
      {
        content: "初始產品資料建立",
        date: "2023/05/15",
        user: "林小華",
      },
    ],
    processData: [
      {
        id: "proc_1",
        process: "材料",
        vendor: "寧波鋼鐵",
        capacity: "3000/日",
        requirements: "軸承鋼GCr15",
        report: "材質證明",
      },
      {
        id: "proc_2",
        process: "車削",
        vendor: "寧波軸承",
        capacity: "2000/日",
        requirements: "內徑25mm，外徑52mm，厚度16.25mm",
        report: "",
      },
      {
        id: "proc_3",
        process: "熱處理",
        vendor: "寧波軸承",
        capacity: "3000/日",
        requirements: "硬度HRC 60-65",
        report: "硬度報告",
      },
      {
        id: "proc_4",
        process: "組裝",
        vendor: "寧波軸承",
        capacity: "2000/日",
        requirements: "開放式",
        report: "",
      },
      {
        id: "proc_5",
        process: "潤滑",
        vendor: "寧波軸承",
        capacity: "3000/日",
        requirements: "標準潤滑脂",
        report: "",
      },
    ],
    orderRequirements:
      "材料：軸承鋼GCr15\n車削：內徑25mm，外徑52mm，厚度16.25mm\n熱處理：硬度HRC 60-65\n組裝：開放式\n潤滑：標準潤滑脂",
    purchaseRequirements: "材料：軸承鋼GCr15\n熱處理：硬度HRC 60-65",
    specialRequirements: [
      {
        content: "需提供壽命測試報告",
        date: "2023/05/15",
        user: "林小華",
      },
    ],
    processNotes: [
      {
        content: "組裝前需進行100%尺寸檢測",
        date: "2023/05/15",
        user: "林小華",
      },
    ],
    hasMold: false,
    moldCost: "",
    refundableMoldQuantity: "",
    moldReturned: false,
    accountingNote: "",
    qualityNotes: [],
    orderHistory: [
      {
        orderNumber: "ORD-2023-068",
        quantity: 200,
      },
      {
        orderNumber: "ORD-2023-115",
        quantity: 300,
      },
    ],
    resumeNotes: [],
    moq: 50,
    leadTime: "10-15天",
    packagingRequirements: "單獨防靜電包裝，每箱20pcs",
  },
]

export function ProductDataTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  // 根據搜索詞過濾產品
  const filteredProducts = productData.filter(
    (product) =>
      product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.componentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.partNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.specification.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜尋產品..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileJson className="h-4 w-4 mr-2" />
            查看原始資料
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            重新整理
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            匯出資料
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            新增產品
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>產品編號</TableHead>
              <TableHead>產品名稱</TableHead>
              <TableHead>類型</TableHead>
              <TableHead>規格</TableHead>
              <TableHead>客戶</TableHead>
              <TableHead>工廠</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  沒有找到產品
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.partNo}</TableCell>
                  <TableCell>{product.componentName}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        product.productType === "螺絲"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-green-50 text-green-700 border-green-200"
                      }
                    >
                      {product.productType}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.specification}</TableCell>
                  <TableCell>{product.customerName.name}</TableCell>
                  <TableCell>{product.factoryName.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        product.status === "active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }
                    >
                      {product.status === "active" ? "活躍" : "停用"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(product)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>產品詳細資料</DialogTitle>
            <DialogDescription>
              {selectedProduct?.partNo} - {selectedProduct?.componentName}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="details">基本資訊</TabsTrigger>
              <TabsTrigger value="specs">技術規格</TabsTrigger>
              <TabsTrigger value="process">製程資料</TabsTrigger>
              <TabsTrigger value="docs">文件與認證</TabsTrigger>
              <TabsTrigger value="history">履歷資料</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[60vh] pr-4">
              {selectedProduct && (
                <>
                  <TabsContent value="details" className="mt-0">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="col-span-1 flex flex-col items-center justify-start">
                        <div className="w-40 h-40 relative mb-4 border rounded-md overflow-hidden">
                          <Image
                            src={selectedProduct.images[0]?.url || "/placeholder.svg"}
                            alt={selectedProduct.images[0]?.alt || selectedProduct.componentName}
                            fill
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                        <div className="text-center">
                          <h4 className="font-medium">{selectedProduct.componentName}</h4>
                          <p className="text-sm text-muted-foreground">{selectedProduct.partNo}</p>
                        </div>
                      </div>

                      <div className="col-span-2 space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">基本資訊</h3>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm text-muted-foreground">產品類型</div>
                            <div>{selectedProduct.productType}</div>
                            <div className="text-sm text-muted-foreground">規格</div>
                            <div>{selectedProduct.specification}</div>
                            <div className="text-sm text-muted-foreground">海關碼</div>
                            <div>{selectedProduct.customsCode}</div>
                            <div className="text-sm text-muted-foreground">終端客戶</div>
                            <div>{selectedProduct.endCustomer}</div>
                            <div className="text-sm text-muted-foreground">客戶名稱</div>
                            <div>
                              {selectedProduct.customerName.name} ({selectedProduct.customerName.code})
                            </div>
                            <div className="text-sm text-muted-foreground">工廠名稱</div>
                            <div>
                              {selectedProduct.factoryName.name} ({selectedProduct.factoryName.code})
                            </div>
                            <div className="text-sm text-muted-foreground">今湛分類碼</div>
                            <div>{selectedProduct.classificationCode}</div>
                            <div className="text-sm text-muted-foreground">車廠圖號</div>
                            <div>{selectedProduct.vehicleDrawingNo || "無"}</div>
                            <div className="text-sm text-muted-foreground">客戶圖號</div>
                            <div>{selectedProduct.customerDrawingNo}</div>
                            <div className="text-sm text-muted-foreground">產品期稿</div>
                            <div>{selectedProduct.productPeriod}</div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-2">商業條款</h3>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm text-muted-foreground">最小訂購量</div>
                            <div>{selectedProduct.moq}</div>
                            <div className="text-sm text-muted-foreground">交貨時間</div>
                            <div>{selectedProduct.leadTime}</div>
                            <div className="text-sm text-muted-foreground">最後訂單日期</div>
                            <div>{selectedProduct.lastOrderDate || "無"}</div>
                            <div className="text-sm text-muted-foreground">最後價格</div>
                            <div>
                              {selectedProduct.lastPrice} {selectedProduct.currency}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-2">產品描述</h3>
                          <p className="text-sm">{selectedProduct.description}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="specs" className="mt-0">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">產品規格</h3>
                        <div className="grid grid-cols-2 gap-2 border rounded-md p-4">
                          {selectedProduct.specifications.map((spec, index) => (
                            <React.Fragment key={index}>
                              <div className="text-sm text-muted-foreground">{spec.name}</div>
                              <div>{spec.value}</div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">圖面資訊</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border rounded-md p-4">
                            <h4 className="font-medium mb-2">原圖資訊</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="text-sm text-muted-foreground">原圖版次</div>
                              <div>{selectedProduct.originalDrawingVersion}</div>
                              <div className="text-sm text-muted-foreground">客戶原圖</div>
                              <div className="truncate text-sm text-blue-600">
                                {selectedProduct.customerOriginalDrawing.filename}
                              </div>
                            </div>
                          </div>

                          <div className="border rounded-md p-4">
                            <h4 className="font-medium mb-2">繪圖資訊</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="text-sm text-muted-foreground">繪圖版次</div>
                              <div>{selectedProduct.drawingVersion}</div>
                              <div className="text-sm text-muted-foreground">今湛繪圖</div>
                              <div className="truncate text-sm text-blue-600">
                                {selectedProduct.jinzhanDrawing.filename}
                              </div>
                              <div className="text-sm text-muted-foreground">客戶圖版次</div>
                              <div>{selectedProduct.customerDrawingVersion}</div>
                              <div className="text-sm text-muted-foreground">客戶圖</div>
                              <div className="truncate text-sm text-blue-600">
                                {selectedProduct.customerDrawing.filename}
                              </div>
                              <div className="text-sm text-muted-foreground">工廠圖版次</div>
                              <div>{selectedProduct.factoryDrawingVersion}</div>
                              <div className="text-sm text-muted-foreground">工廠圖</div>
                              <div className="truncate text-sm text-blue-600">
                                {selectedProduct.factoryDrawing.filename}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">樣品資訊</h3>
                        <div className="grid grid-cols-2 gap-2 border rounded-md p-4">
                          <div className="text-sm text-muted-foreground">樣品狀態</div>
                          <div>{selectedProduct.sampleStatus || "無"}</div>
                          <div className="text-sm text-muted-foreground">樣品日期</div>
                          <div>{selectedProduct.sampleDate || "無"}</div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">組裝資訊</h3>
                        <div className="border rounded-md p-4">
                          <div className="flex items-center mb-4">
                            <Checkbox checked={selectedProduct.isAssembly} disabled />
                            <span className="ml-2">這是一個組裝產品</span>
                          </div>
                          {selectedProduct.isAssembly && (
                            <>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="text-sm text-muted-foreground">組裝時間</div>
                                <div>{selectedProduct.assemblyTime} 分鐘</div>
                                <div className="text-sm text-muted-foreground">組裝人工成本</div>
                                <div>{selectedProduct.assemblyCostPerHour} 元/小時</div>
                                <div className="text-sm text-muted-foreground">額外成本</div>
                                <div>{selectedProduct.additionalCosts} 元</div>
                              </div>
                              {selectedProduct.components.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="font-medium mb-2">組件清單</h4>
                                  <div className="border rounded-md">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>組件名稱</TableHead>
                                          <TableHead>料號</TableHead>
                                          <TableHead>數量</TableHead>
                                          <TableHead>單價</TableHead>
                                          <TableHead>工廠</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {selectedProduct.components.map((component) => (
                                          <TableRow key={component.id}>
                                            <TableCell>{component.productName}</TableCell>
                                            <TableCell>{component.productPN}</TableCell>
                                            <TableCell>{component.quantity}</TableCell>
                                            <TableCell>{component.unitPrice}</TableCell>
                                            <TableCell>{component.factoryName}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          {!selectedProduct.isAssembly && (
                            <p className="text-sm text-muted-foreground">此產品不是組裝產品</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="process" className="mt-0">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">製程資料</h3>
                        <div className="border rounded-md">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>製程</TableHead>
                                <TableHead>廠商</TableHead>
                                <TableHead>產能</TableHead>
                                <TableHead>要求</TableHead>
                                <TableHead>報告</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedProduct.processData.map((process) => (
                                <TableRow key={process.id}>
                                  <TableCell>{process.process}</TableCell>
                                  <TableCell>{process.vendor}</TableCell>
                                  <TableCell>{process.capacity}</TableCell>
                                  <TableCell>{process.requirements}</TableCell>
                                  <TableCell>{process.report}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">訂單零件要求</h3>
                          <div className="border rounded-md p-4 whitespace-pre-line">
                            {selectedProduct.orderRequirements || "無特殊要求"}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">採購單零件要求</h3>
                          <div className="border rounded-md p-4 whitespace-pre-line">
                            {selectedProduct.purchaseRequirements || "無特殊要求"}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">特殊要求/測試</h3>
                        {selectedProduct.specialRequirements.length > 0 ? (
                          <div className="border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>要求內容</TableHead>
                                  <TableHead>日期</TableHead>
                                  <TableHead>使用者</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedProduct.specialRequirements.map((req, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{req.content}</TableCell>
                                    <TableCell>{req.date}</TableCell>
                                    <TableCell>{req.user}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">無特殊要求</p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">製程備註</h3>
                        {selectedProduct.processNotes.length > 0 ? (
                          <div className="border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>備註內容</TableHead>
                                  <TableHead>日期</TableHead>
                                  <TableHead>使用者</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedProduct.processNotes.map((note, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{note.content}</TableCell>
                                    <TableCell>{note.date}</TableCell>
                                    <TableCell>{note.user}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">無製程備註</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="docs" className="mt-0">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">重要文件</h3>
                        <div className="border rounded-md p-4">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm text-muted-foreground">PPAP檔案資料夾</div>
                            <div className="truncate text-sm text-blue-600">
                              {selectedProduct.importantDocuments.PPAP.filename || "無文件"}
                            </div>
                            <div className="text-sm text-muted-foreground">PSW回答</div>
                            <div className="truncate text-sm text-blue-600">
                              {selectedProduct.importantDocuments.PSW.filename || "無文件"}
                            </div>
                            <div className="text-sm text-muted-foreground">產能分析表</div>
                            <div className="truncate text-sm text-blue-600">
                              {selectedProduct.importantDocuments.capacityAnalysis.filename || "無文件"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">零件管理特性</h3>
                        <div className="border rounded-md p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center">
                              <Checkbox checked={selectedProduct.partManagement.safetyPart} disabled />
                              <span className="ml-2">安全件</span>
                            </div>
                            <div className="flex items-center">
                              <Checkbox checked={selectedProduct.partManagement.automotivePart} disabled />
                              <span className="ml-2">汽車件</span>
                            </div>
                            <div className="flex items-center">
                              <Checkbox checked={selectedProduct.partManagement.CBAMPart} disabled />
                              <span className="ml-2">CBAM零件</span>
                            </div>
                            <div className="flex items-center">
                              <Checkbox checked={selectedProduct.partManagement.clockRequirement} disabled />
                              <span className="ml-2">時鐘地要求</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">符合性要求</h3>
                        <div className="border rounded-md">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>法規</TableHead>
                                <TableHead>零件狀態</TableHead>
                                <TableHead>含有物質</TableHead>
                                <TableHead>理由</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Object.entries(selectedProduct.complianceStatus).map(([regulation, status]) => (
                                <TableRow key={regulation}>
                                  <TableCell>{regulation}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className={
                                        status.status === "符合"
                                          ? "bg-green-50 text-green-700 border-green-200"
                                          : status.status === "不符"
                                            ? "bg-red-50 text-red-700 border-red-200"
                                            : "bg-gray-50 text-gray-700 border-gray-200"
                                      }
                                    >
                                      {status.status || "未設定"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{status.substances || "無"}</TableCell>
                                  <TableCell>{status.reason || "無"}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">編輯備註</h3>
                        {selectedProduct.editNotes.length > 0 ? (
                          <div className="border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>備註內容</TableHead>
                                  <TableHead>日期</TableHead>
                                  <TableHead>使用者</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedProduct.editNotes.map((note, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{note.content}</TableCell>
                                    <TableCell>{note.date}</TableCell>
                                    <TableCell>{note.user}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">無編輯備註</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="mt-0">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">模具資訊</h3>
                        <div className="border rounded-md p-4">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm text-muted-foreground">有無開模具</div>
                            <div className="flex items-center">
                              <Checkbox checked={selectedProduct.hasMold} disabled />
                              <span className="ml-2">{selectedProduct.hasMold ? "有" : "無"}</span>
                            </div>
                            {selectedProduct.hasMold && (
                              <>
                                <div className="text-sm text-muted-foreground">模具費</div>
                                <div>{selectedProduct.moldCost || "無"}</div>
                                <div className="text-sm text-muted-foreground">可退模具費數量</div>
                                <div>{selectedProduct.refundableMoldQuantity || "無"}</div>
                                <div className="text-sm text-muted-foreground">已退模</div>
                                <div className="flex items-center">
                                  <Checkbox checked={selectedProduct.moldReturned} disabled />
                                  <span className="ml-2">{selectedProduct.moldReturned ? "是" : "否"}</span>
                                </div>
                              </>
                            )}
                            <div className="text-sm text-muted-foreground">會計註記</div>
                            <div>{selectedProduct.accountingNote || "無"}</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">訂單歷史</h3>
                        {selectedProduct.orderHistory.length > 0 ? (
                          <div className="border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>訂單號碼</TableHead>
                                  <TableHead>訂單數量</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedProduct.orderHistory.map((order, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{order.orderNumber}</TableCell>
                                    <TableCell>{order.quantity}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">無訂單歷史</p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">品質註記</h3>
                        {selectedProduct.qualityNotes.length > 0 ? (
                          <div className="border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>標題</TableHead>
                                  <TableHead>客戶</TableHead>
                                  <TableHead>狀態</TableHead>
                                  <TableHead>日期</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedProduct.qualityNotes.map((note) => (
                                  <TableRow key={note.id}>
                                    <TableCell>{note.title}</TableCell>
                                    <TableCell>{note.customer}</TableCell>
                                    <TableCell>
                                      <Badge
                                        variant="outline"
                                        className={
                                          note.status === "pending"
                                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                            : note.status === "processing"
                                              ? "bg-blue-50 text-blue-700 border-blue-200"
                                              : note.status === "resolved"
                                                ? "bg-green-50 text-green-700 border-green-200"
                                                : "bg-gray-50 text-gray-700 border-gray-200"
                                        }
                                      >
                                        {note.status === "pending"
                                          ? "待處理"
                                          : note.status === "processing"
                                            ? "處理中"
                                            : note.status === "resolved"
                                              ? "已解決"
                                              : note.status === "closed"
                                                ? "已結案"
                                                : note.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{note.date}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">無品質註記</p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">履歷備註</h3>
                        {selectedProduct.resumeNotes.length > 0 ? (
                          <div className="border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>備註內容</TableHead>
                                  <TableHead>日期</TableHead>
                                  <TableHead>使用者</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedProduct.resumeNotes.map((note, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{note.content}</TableCell>
                                    <TableCell>{note.date}</TableCell>
                                    <TableCell>{note.user}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">無履歷備註</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </>
              )}
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
