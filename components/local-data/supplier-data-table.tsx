"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, FileJson, RefreshCw, Eye, Download, Edit, Trash2, Star, StarHalf } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"

// 定義供應商類型
type Supplier = {
  id: string
  name: string
  code: string
  type: string
  country: string
  address: string
  contact_person: string
  phone: string
  email: string
  website: string
  tax_id: string
  payment_terms: string
  currency: string
  status: "active" | "inactive" | "pending"
  rating: number
  established_year: number
  employee_count: number
  annual_revenue: string
  main_products: string[]
  certifications: {
    name: string
    status: "valid" | "expired" | "pending"
    expiry_date: string
    certificate_number: string
    issuing_body: string
    scope: string
    document_url: string
  }[]
  performance: {
    quality_score: number
    delivery_score: number
    price_score: number
    service_score: number
    overall_score: number
    last_evaluation_date: string
    evaluator: string
    comments: string
  }
  compliance: {
    code_of_conduct: boolean
    environmental_policy: boolean
    social_responsibility: boolean
    anti_corruption: boolean
    conflict_minerals: boolean
    last_audit_date: string
    audit_result: string
    corrective_actions: string
  }
  financial: {
    credit_rating: string
    credit_limit: number
    payment_history: string
    average_payment_days: number
    outstanding_balance: number
  }
  notes: string
  created_at: string
  updated_at: string
  logo_url: string
}

// 評分星星顯示組件
const RatingStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      ))}
      {hasHalfStar && <StarHalf className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
      {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      ))}
      <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  )
}

// 認證狀態徽章組件
const CertificationStatus = ({ status }: { status: "valid" | "expired" | "pending" }) => {
  return (
    <Badge
      variant="outline"
      className={
        status === "valid"
          ? "bg-green-50 text-green-700 border-green-200"
          : status === "expired"
            ? "bg-red-50 text-red-700 border-red-200"
            : "bg-yellow-50 text-yellow-700 border-yellow-200"
      }
    >
      {status === "valid" ? "有效" : status === "expired" ? "已過期" : "審核中"}
    </Badge>
  )
}

// 模擬供應商資料 - 螺絲軸承貿易公司的供應商
const supplierData: Supplier[] = [
  {
    id: "S001",
    name: "高雄螺絲廠",
    code: "KSF",
    type: "製造商",
    country: "台灣",
    address: "高雄市岡山區螺絲路123號",
    contact_person: "王大明",
    phone: "+886-7-123-4567",
    email: "contact@kaohsiungscrew.com",
    website: "www.kaohsiungscrew.com",
    tax_id: "12345678",
    payment_terms: "月結60天",
    currency: "TWD",
    status: "active",
    rating: 4.5,
    established_year: 1985,
    employee_count: 150,
    annual_revenue: "1億-5億TWD",
    main_products: ["六角螺栓", "自攻螺絲", "機械螺絲"],
    certifications: [
      {
        name: "ISO 9001",
        status: "valid",
        expiry_date: "2025-12-31",
        certificate_number: "ISO9001-KSF-2022",
        issuing_body: "SGS Taiwan",
        scope: "螺絲製造",
        document_url: "/documents/KSF-ISO9001.pdf",
      },
      {
        name: "IATF 16949",
        status: "valid",
        expiry_date: "2024-10-15",
        certificate_number: "IATF-KSF-2021",
        issuing_body: "TUV Rheinland",
        scope: "汽車零件製造",
        document_url: "/documents/KSF-IATF16949.pdf",
      },
      {
        name: "ISO 14001",
        status: "valid",
        expiry_date: "2025-08-20",
        certificate_number: "ISO14001-KSF-2022",
        issuing_body: "SGS Taiwan",
        scope: "環境管理系統",
        document_url: "/documents/KSF-ISO14001.pdf",
      },
    ],
    performance: {
      quality_score: 4.7,
      delivery_score: 4.3,
      price_score: 4.0,
      service_score: 4.5,
      overall_score: 4.4,
      last_evaluation_date: "2023-09-15",
      evaluator: "李小華",
      comments: "品質穩定，交期偶有延遲，但整體表現良好。",
    },
    compliance: {
      code_of_conduct: true,
      environmental_policy: true,
      social_responsibility: true,
      anti_corruption: true,
      conflict_minerals: true,
      last_audit_date: "2023-06-10",
      audit_result: "合格",
      corrective_actions: "無重大缺失",
    },
    financial: {
      credit_rating: "A",
      credit_limit: 2000000,
      payment_history: "良好",
      average_payment_days: 58,
      outstanding_balance: 850000,
    },
    notes: "長期合作夥伴，提供穩定的螺絲產品。",
    created_at: "2020-01-15",
    updated_at: "2023-10-20",
    logo_url: "/abstract-geometric-ksf.png",
  },
  {
    id: "S002",
    name: "東莞螺絲廠",
    code: "DSF",
    type: "製造商",
    country: "中國",
    address: "廣東省東莞市長安鎮工業區88號",
    contact_person: "張志強",
    phone: "+86-769-8765-4321",
    email: "info@dongguanscrew.com",
    website: "www.dongguanscrew.com",
    tax_id: "91441900MA53AB7X2B",
    payment_terms: "月結45天",
    currency: "USD",
    status: "active",
    rating: 3.8,
    established_year: 2005,
    employee_count: 300,
    annual_revenue: "500萬-1000萬USD",
    main_products: ["自攻螺絲", "木螺絲", "機械螺絲", "特殊螺絲"],
    certifications: [
      {
        name: "ISO 9001",
        status: "valid",
        expiry_date: "2024-05-20",
        certificate_number: "ISO9001-DSF-2021",
        issuing_body: "CQC",
        scope: "螺絲製造",
        document_url: "/documents/DSF-ISO9001.pdf",
      },
      {
        name: "RoHS",
        status: "valid",
        expiry_date: "2024-03-15",
        certificate_number: "RoHS-DSF-2021",
        issuing_body: "SGS China",
        scope: "有害物質限制",
        document_url: "/documents/DSF-RoHS.pdf",
      },
    ],
    performance: {
      quality_score: 3.5,
      delivery_score: 4.0,
      price_score: 4.8,
      service_score: 3.5,
      overall_score: 3.9,
      last_evaluation_date: "2023-08-05",
      evaluator: "王小明",
      comments: "價格具競爭力，但品質偶有波動，需加強檢驗。",
    },
    compliance: {
      code_of_conduct: true,
      environmental_policy: true,
      social_responsibility: false,
      anti_corruption: true,
      conflict_minerals: false,
      last_audit_date: "2023-04-18",
      audit_result: "有條件合格",
      corrective_actions: "需改善工人宿舍條件，加強環保措施。",
    },
    financial: {
      credit_rating: "B+",
      credit_limit: 500000,
      payment_history: "一般",
      average_payment_days: 48,
      outstanding_balance: 320000,
    },
    notes: "價格優勢明顯，適合大批量訂單，但需加強品質管控。",
    created_at: "2021-03-10",
    updated_at: "2023-09-05",
    logo_url: "/abstract-geometric-dsf.png",
  },
  {
    id: "S003",
    name: "嘉興螺絲廠",
    code: "JXS",
    type: "製造商",
    country: "中國",
    address: "浙江省嘉興市秀洲區工業園區66號",
    contact_person: "劉明輝",
    phone: "+86-573-8273-5698",
    email: "sales@jiaxingscrew.com",
    website: "www.jiaxingscrew.com",
    tax_id: "91330400MA28AH7Y1C",
    payment_terms: "月結30天",
    currency: "USD",
    status: "active",
    rating: 4.2,
    established_year: 2000,
    employee_count: 250,
    annual_revenue: "500萬-1000萬USD",
    main_products: ["內六角螺絲", "高強度螺栓", "特殊合金螺絲"],
    certifications: [
      {
        name: "ISO 9001",
        status: "valid",
        expiry_date: "2025-02-28",
        certificate_number: "ISO9001-JXS-2022",
        issuing_body: "TUV Nord",
        scope: "螺絲製造",
        document_url: "/documents/JXS-ISO9001.pdf",
      },
      {
        name: "IATF 16949",
        status: "valid",
        expiry_date: "2024-11-30",
        certificate_number: "IATF-JXS-2021",
        issuing_body: "Bureau Veritas",
        scope: "汽車零件製造",
        document_url: "/documents/JXS-IATF16949.pdf",
      },
      {
        name: "ISO 14001",
        status: "expired",
        expiry_date: "2023-05-15",
        certificate_number: "ISO14001-JXS-2020",
        issuing_body: "TUV Nord",
        scope: "環境管理系統",
        document_url: "/documents/JXS-ISO14001.pdf",
      },
    ],
    performance: {
      quality_score: 4.5,
      delivery_score: 4.0,
      price_score: 3.8,
      service_score: 4.3,
      overall_score: 4.2,
      last_evaluation_date: "2023-07-20",
      evaluator: "張小龍",
      comments: "高強度螺絲品質優良，技術支持及時，價格略高。",
    },
    compliance: {
      code_of_conduct: true,
      environmental_policy: true,
      social_responsibility: true,
      anti_corruption: true,
      conflict_minerals: true,
      last_audit_date: "2023-03-25",
      audit_result: "合格",
      corrective_actions: "需更新環境管理系統認證。",
    },
    financial: {
      credit_rating: "A-",
      credit_limit: 800000,
      payment_history: "良好",
      average_payment_days: 32,
      outstanding_balance: 450000,
    },
    notes: "專注高強度螺絲，技術實力強，適合高規格產品需求。",
    created_at: "2020-05-18",
    updated_at: "2023-08-15",
    logo_url: "/jxs-graffiti.png",
  },
  {
    id: "S004",
    name: "上海軸承廠",
    code: "SHB",
    type: "製造商",
    country: "中國",
    address: "上海市松江區工業區東區128號",
    contact_person: "陳建國",
    phone: "+86-21-5794-3268",
    email: "info@shanghaibearing.com",
    website: "www.shanghaibearing.com",
    tax_id: "91310117MA1J3TP9X7",
    payment_terms: "月結45天",
    currency: "USD",
    status: "active",
    rating: 4.0,
    established_year: 1998,
    employee_count: 280,
    annual_revenue: "1000萬-2000萬USD",
    main_products: ["深溝球軸承", "角接觸球軸承", "圓柱滾子軸承", "推力球軸承"],
    certifications: [
      {
        name: "ISO 9001",
        status: "valid",
        expiry_date: "2024-09-30",
        certificate_number: "ISO9001-SHB-2021",
        issuing_body: "SGS China",
        scope: "軸承製造",
        document_url: "/documents/SHB-ISO9001.pdf",
      },
      {
        name: "IATF 16949",
        status: "valid",
        expiry_date: "2024-07-15",
        certificate_number: "IATF-SHB-2021",
        issuing_body: "TUV Rheinland",
        scope: "汽車零件製造",
        document_url: "/documents/SHB-IATF16949.pdf",
      },
    ],
    performance: {
      quality_score: 4.2,
      delivery_score: 3.8,
      price_score: 3.5,
      service_score: 4.3,
      overall_score: 4.0,
      last_evaluation_date: "2023-06-28",
      evaluator: "陳小明",
      comments: "產品品質穩定，技術支持好，交期偶有延遲。",
    },
    compliance: {
      code_of_conduct: true,
      environmental_policy: true,
      social_responsibility: true,
      anti_corruption: true,
      conflict_minerals: false,
      last_audit_date: "2023-02-15",
      audit_result: "合格",
      corrective_actions: "需加強衝突礦產管理。",
    },
    financial: {
      credit_rating: "A",
      credit_limit: 1000000,
      payment_history: "良好",
      average_payment_days: 47,
      outstanding_balance: 580000,
    },
    notes: "專業軸承製造商，產品線齊全，技術支持良好。",
    created_at: "2020-03-20",
    updated_at: "2023-07-10",
    logo_url: "/abstract-geometric-shb.png",
  },
  {
    id: "S005",
    name: "寧波軸承廠",
    code: "NBB",
    type: "製造商",
    country: "中國",
    address: "浙江省寧波市北侖區經濟開發區88號",
    contact_person: "林志強",
    phone: "+86-574-8690-5321",
    email: "sales@ningbobearing.com",
    website: "www.ningbobearing.com",
    tax_id: "91330206MA2AH7N3X5",
    payment_terms: "月結60天",
    currency: "USD",
    status: "active",
    rating: 3.9,
    established_year: 2002,
    employee_count: 220,
    annual_revenue: "500萬-1000萬USD",
    main_products: ["圓錐滾子軸承", "調心滾子軸承", "推力軸承", "直線軸承"],
    certifications: [
      {
        name: "ISO 9001",
        status: "valid",
        expiry_date: "2025-03-15",
        certificate_number: "ISO9001-NBB-2022",
        issuing_body: "CQC",
        scope: "軸承製造",
        document_url: "/documents/NBB-ISO9001.pdf",
      },
      {
        name: "IATF 16949",
        status: "valid",
        expiry_date: "2024-05-20",
        certificate_number: "IATF-NBB-2021",
        issuing_body: "TUV Nord",
        scope: "汽車零件製造",
        document_url: "/documents/NBB-IATF16949.pdf",
      },
      {
        name: "ISO 14001",
        status: "valid",
        expiry_date: "2024-08-10",
        certificate_number: "ISO14001-NBB-2021",
        issuing_body: "CQC",
        scope: "環境管理系統",
        document_url: "/documents/NBB-ISO14001.pdf",
      },
    ],
    performance: {
      quality_score: 3.8,
      delivery_score: 4.0,
      price_score: 4.2,
      service_score: 3.5,
      overall_score: 3.9,
      last_evaluation_date: "2023-05-12",
      evaluator: "林小華",
      comments: "價格合理，品質尚可，服務需改進。",
    },
    compliance: {
      code_of_conduct: true,
      environmental_policy: true,
      social_responsibility: true,
      anti_corruption: true,
      conflict_minerals: true,
      last_audit_date: "2023-01-20",
      audit_result: "合格",
      corrective_actions: "無重大缺失",
    },
    financial: {
      credit_rating: "B+",
      credit_limit: 600000,
      payment_history: "一般",
      average_payment_days: 62,
      outstanding_balance: 420000,
    },
    notes: "圓錐滾子軸承專業製造商，性價比高。",
    created_at: "2020-07-25",
    updated_at: "2023-06-18",
    logo_url: "/placeholder.svg?height=100&width=100&query=NBB",
  },
]

export function SupplierDataTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  // 根據搜索詞過濾供應商
  const filteredSuppliers = supplierData.filter(
    (supplier) =>
      supplier.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.country.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜尋供應商..."
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
            新增供應商
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>供應商編號</TableHead>
              <TableHead>供應商名稱</TableHead>
              <TableHead>類型</TableHead>
              <TableHead>國家</TableHead>
              <TableHead>評分</TableHead>
              <TableHead>認證</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  沒有找到供應商
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.id}</TableCell>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        supplier.type === "製造商"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }
                    >
                      {supplier.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{supplier.country}</TableCell>
                  <TableCell>
                    <RatingStars rating={supplier.rating} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {supplier.certifications.slice(0, 2).map((cert, index) => (
                        <CertificationStatus key={index} status={cert.status} />
                      ))}
                      {supplier.certifications.length > 2 && (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          +{supplier.certifications.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        supplier.status === "active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : supplier.status === "inactive"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }
                    >
                      {supplier.status === "active" ? "活躍" : supplier.status === "inactive" ? "停用" : "審核中"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(supplier)}>
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
            <DialogTitle>供應商詳細資料</DialogTitle>
            <DialogDescription>
              {selectedSupplier?.id} - {selectedSupplier?.name}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="details">基本資訊</TabsTrigger>
              <TabsTrigger value="certifications">認證資訊</TabsTrigger>
              <TabsTrigger value="performance">績效評估</TabsTrigger>
              <TabsTrigger value="compliance">合規狀況</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[60vh] pr-4">
              {selectedSupplier && (
                <>
                  <TabsContent value="details" className="mt-0">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="col-span-1 flex flex-col items-center justify-start">
                        <div className="w-40 h-40 relative mb-4 border rounded-md overflow-hidden">
                          <Image
                            src={selectedSupplier.logo_url || "/placeholder.svg"}
                            alt={selectedSupplier.name}
                            fill
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                        <div className="text-center">
                          <h4 className="font-medium">{selectedSupplier.name}</h4>
                          <p className="text-sm text-muted-foreground">{selectedSupplier.code}</p>
                        </div>
                        <div className="mt-2">
                          <RatingStars rating={selectedSupplier.rating} />
                        </div>
                      </div>

                      <div className="col-span-2 space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">基本資訊</h3>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm text-muted-foreground">供應商類型</div>
                            <div>{selectedSupplier.type}</div>
                            <div className="text-sm text-muted-foreground">國家</div>
                            <div>{selectedSupplier.country}</div>
                            <div className="text-sm text-muted-foreground">地址</div>
                            <div>{selectedSupplier.address}</div>
                            <div className="text-sm text-muted-foreground">聯絡人</div>
                            <div>{selectedSupplier.contact_person}</div>
                            <div className="text-sm text-muted-foreground">電話</div>
                            <div>{selectedSupplier.phone}</div>
                            <div className="text-sm text-muted-foreground">電子郵件</div>
                            <div>{selectedSupplier.email}</div>
                            <div className="text-sm text-muted-foreground">網站</div>
                            <div>{selectedSupplier.website}</div>
                            <div className="text-sm text-muted-foreground">稅務編號</div>
                            <div>{selectedSupplier.tax_id}</div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-2">商業資訊</h3>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm text-muted-foreground">付款條件</div>
                            <div>{selectedSupplier.payment_terms}</div>
                            <div className="text-sm text-muted-foreground">貨幣</div>
                            <div>{selectedSupplier.currency}</div>
                            <div className="text-sm text-muted-foreground">成立年份</div>
                            <div>{selectedSupplier.established_year}</div>
                            <div className="text-sm text-muted-foreground">員工數量</div>
                            <div>{selectedSupplier.employee_count}</div>
                            <div className="text-sm text-muted-foreground">年營業額</div>
                            <div>{selectedSupplier.annual_revenue}</div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-2">主要產品</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedSupplier.main_products.map((product, index) => (
                              <Badge key={index} variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                {product}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-2">備註</h3>
                          <p className="text-sm">{selectedSupplier.notes}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="certifications" className="mt-0">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">認證資訊</h3>
                      {selectedSupplier.certifications.map((cert, index) => (
                        <div key={index} className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{cert.name}</h4>
                            <CertificationStatus status={cert.status} />
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">證書編號</div>
                            <div>{cert.certificate_number}</div>
                            <div className="text-muted-foreground">發證機構</div>
                            <div>{cert.issuing_body}</div>
                            <div className="text-muted-foreground">有效期至</div>
                            <div>{cert.expiry_date}</div>
                            <div className="text-muted-foreground">認證範圍</div>
                            <div>{cert.scope}</div>
                            <div className="text-muted-foreground">證書文件</div>
                            <div className="text-blue-600 hover:underline cursor-pointer">查看證書</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="performance" className="mt-0">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">績效評估</h3>
                        <div className="border rounded-md p-4">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="text-sm text-muted-foreground">品質評分</div>
                              <RatingStars rating={selectedSupplier.performance.quality_score} />
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm text-muted-foreground">交期評分</div>
                              <RatingStars rating={selectedSupplier.performance.delivery_score} />
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm text-muted-foreground">價格評分</div>
                              <RatingStars rating={selectedSupplier.performance.price_score} />
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm text-muted-foreground">服務評分</div>
                              <RatingStars rating={selectedSupplier.performance.service_score} />
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm text-muted-foreground">整體評分</div>
                              <RatingStars rating={selectedSupplier.performance.overall_score} />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">最後評估日期</div>
                              <div>{selectedSupplier.performance.last_evaluation_date}</div>
                              <div className="text-muted-foreground">評估人員</div>
                              <div>{selectedSupplier.performance.evaluator}</div>
                            </div>
                            <div className="mt-2">
                              <div className="text-sm text-muted-foreground mb-1">評估意見</div>
                              <div className="text-sm border rounded-md p-2 bg-gray-50">
                                {selectedSupplier.performance.comments}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">財務資訊</h3>
                        <div className="border rounded-md p-4">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">信用評級</div>
                            <div>{selectedSupplier.financial.credit_rating}</div>
                            <div className="text-muted-foreground">信用額度</div>
                            <div>
                              {selectedSupplier.financial.credit_limit.toLocaleString()} {selectedSupplier.currency}
                            </div>
                            <div className="text-muted-foreground">付款歷史</div>
                            <div>{selectedSupplier.financial.payment_history}</div>
                            <div className="text-muted-foreground">平均付款天數</div>
                            <div>{selectedSupplier.financial.average_payment_days} 天</div>
                            <div className="text-muted-foreground">未結餘額</div>
                            <div>
                              {selectedSupplier.financial.outstanding_balance.toLocaleString()}{" "}
                              {selectedSupplier.currency}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="compliance" className="mt-0">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">合規狀況</h3>
                        <div className="border rounded-md p-4">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center">
                              <Checkbox checked={selectedSupplier.compliance.code_of_conduct} disabled />
                              <span className="ml-2">行為準則</span>
                            </div>
                            <div className="flex items-center">
                              <Checkbox checked={selectedSupplier.compliance.environmental_policy} disabled />
                              <span className="ml-2">環境政策</span>
                            </div>
                            <div className="flex items-center">
                              <Checkbox checked={selectedSupplier.compliance.social_responsibility} disabled />
                              <span className="ml-2">社會責任</span>
                            </div>
                            <div className="flex items-center">
                              <Checkbox checked={selectedSupplier.compliance.anti_corruption} disabled />
                              <span className="ml-2">反貪腐政策</span>
                            </div>
                            <div className="flex items-center">
                              <Checkbox checked={selectedSupplier.compliance.conflict_minerals} disabled />
                              <span className="ml-2">衝突礦產政策</span>
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">最後稽核日期</div>
                              <div>{selectedSupplier.compliance.last_audit_date}</div>
                              <div className="text-muted-foreground">稽核結果</div>
                              <div>
                                <Badge
                                  variant="outline"
                                  className={
                                    selectedSupplier.compliance.audit_result === "合格"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : selectedSupplier.compliance.audit_result === "不合格"
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  }
                                >
                                  {selectedSupplier.compliance.audit_result}
                                </Badge>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="text-sm text-muted-foreground mb-1">改善措施</div>
                              <div className="text-sm border rounded-md p-2 bg-gray-50">
                                {selectedSupplier.compliance.corrective_actions}
                              </div>
                            </div>
                          </div>
                        </div>
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
