"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, FileJson, RefreshCw, Eye, Download, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabaseClient } from "@/lib/supabase-client"
import { Skeleton } from "@/components/ui/skeleton"

// 定義供應商類型
type Supplier = {
  factory_id: string
  factory_name: string
  factory_full_name: string
  supplier_type: string
  factory_address: string
  factory_phone: string
  factory_fax: string
  tax_id: string
  category1: string
  category2: string
  category3: string
  invoice_address: string
  direct_relation_3yrs: string
  disabled_reason: string
  approval_note: string
  quality_contact1: string
  quality_contact2: string
  legacy_notes: string

  // 認證相關
  iso9001_certified: string
  iso9001_expiry: string
  iatf16949_certified: string
  iatf16949_expiry: string
  iso17025_certified: string
  iso17025_expiry: string
  cqi9_certified: string
  cqi9_expiry: string
  cqi11_certified: string
  cqi11_expiry: string
  cqi12_certified: string
  cqi12_expiry: string

  // 合規相關
  rohs_compliance: string
  pfas_compliance: string
  reach_compliance: string
  cmrt_provided: string
  tsca_compliance: string
  emrt_provided: string
  cp65_compliance: string
  eu_pop_compliance: string

  // 其他
  po_reminder_note: string
  created_at?: string
  updated_at?: string
}

// 認證狀態徽章組件
const CertificationStatus = ({ status, expiry }: { status: string; expiry: string }) => {
  // 檢查認證是否有效
  const isValid = status === "是" || status === "符合" || status === "已提供"

  // 檢查是否過期
  const isExpired = expiry && new Date(expiry) < new Date()

  // 決定顯示狀態
  let displayStatus = "未知"
  let badgeClass = "bg-gray-50 text-gray-700 border-gray-200"

  if (isValid) {
    if (isExpired) {
      displayStatus = "已過期"
      badgeClass = "bg-red-50 text-red-700 border-red-200"
    } else {
      displayStatus = "有效"
      badgeClass = "bg-green-50 text-green-700 border-green-200"
    }
  } else if (status === "否" || status === "不符合" || status === "未提供") {
    displayStatus = "無"
    badgeClass = "bg-yellow-50 text-yellow-700 border-yellow-200"
  } else if (status === "審核中") {
    displayStatus = "審核中"
    badgeClass = "bg-blue-50 text-blue-700 border-blue-200"
  }

  return (
    <Badge variant="outline" className={badgeClass}>
      {displayStatus}
    </Badge>
  )
}

export function SupplierDataTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 從Supabase獲取供應商資料
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabaseClient
          .from("suppliers")
          .select("*")
          .order("factory_name", { ascending: true })

        if (error) {
          throw error
        }

        setSuppliers(data || [])
      } catch (err) {
        console.error("Error fetching suppliers:", err)
        setError("獲取供應商資料時發生錯誤")
      } finally {
        setLoading(false)
      }
    }

    fetchSuppliers()
  }, [])

  // 根據搜索詞過濾供應商
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.factory_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.factory_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.supplier_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.category1?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsDialogOpen(true)
  }

  // 刷新資料
  const handleRefresh = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabaseClient
        .from("suppliers")
        .select("*")
        .order("factory_name", { ascending: true })

      if (error) {
        throw error
      }

      setSuppliers(data || [])
    } catch (err) {
      console.error("Error refreshing suppliers:", err)
      setError("刷新供應商資料時發生錯誤")
    } finally {
      setLoading(false)
    }
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
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>供應商編號</TableHead>
              <TableHead>供應商名稱</TableHead>
              <TableHead>類型</TableHead>
              <TableHead>主要分類</TableHead>
              <TableHead>ISO 9001</TableHead>
              <TableHead>IATF 16949</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-24" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  沒有找到供應商
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.factory_id}>
                  <TableCell className="font-medium">{supplier.factory_id}</TableCell>
                  <TableCell>{supplier.factory_name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        supplier.supplier_type === "製造商"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : supplier.supplier_type === "加工商"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-green-50 text-green-700 border-green-200"
                      }
                    >
                      {supplier.supplier_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{supplier.category1}</TableCell>
                  <TableCell>
                    <CertificationStatus status={supplier.iso9001_certified} expiry={supplier.iso9001_expiry} />
                  </TableCell>
                  <TableCell>
                    <CertificationStatus status={supplier.iatf16949_certified} expiry={supplier.iatf16949_expiry} />
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
              {selectedSupplier?.factory_id} - {selectedSupplier?.factory_name}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="details">基本資訊</TabsTrigger>
              <TabsTrigger value="certifications">認證資訊</TabsTrigger>
              <TabsTrigger value="compliance">合規狀況</TabsTrigger>
              <TabsTrigger value="notes">備註資訊</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[60vh] pr-4">
              {selectedSupplier && (
                <>
                  <TabsContent value="details" className="mt-0">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">基本資訊</h3>
                        <div className="grid grid-cols-2 gap-2 border rounded-md p-4">
                          <div className="text-sm text-muted-foreground">供應商編號</div>
                          <div>{selectedSupplier.factory_id}</div>
                          <div className="text-sm text-muted-foreground">供應商簡稱</div>
                          <div>{selectedSupplier.factory_name}</div>
                          <div className="text-sm text-muted-foreground">供應商全名</div>
                          <div>{selectedSupplier.factory_full_name}</div>
                          <div className="text-sm text-muted-foreground">供應商類型</div>
                          <div>{selectedSupplier.supplier_type}</div>
                          <div className="text-sm text-muted-foreground">統一編號</div>
                          <div>{selectedSupplier.tax_id}</div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">聯絡資訊</h3>
                        <div className="grid grid-cols-2 gap-2 border rounded-md p-4">
                          <div className="text-sm text-muted-foreground">地址</div>
                          <div>{selectedSupplier.factory_address}</div>
                          <div className="text-sm text-muted-foreground">發票地址</div>
                          <div>{selectedSupplier.invoice_address || selectedSupplier.factory_address}</div>
                          <div className="text-sm text-muted-foreground">電話</div>
                          <div>{selectedSupplier.factory_phone}</div>
                          <div className="text-sm text-muted-foreground">傳真</div>
                          <div>{selectedSupplier.factory_fax}</div>
                          <div className="text-sm text-muted-foreground">品管聯絡人</div>
                          <div>{selectedSupplier.quality_contact1}</div>
                          <div className="text-sm text-muted-foreground">備用品管聯絡人</div>
                          <div>{selectedSupplier.quality_contact2}</div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">分類資訊</h3>
                        <div className="grid grid-cols-2 gap-2 border rounded-md p-4">
                          <div className="text-sm text-muted-foreground">主要分類</div>
                          <div>{selectedSupplier.category1}</div>
                          <div className="text-sm text-muted-foreground">次要分類</div>
                          <div>{selectedSupplier.category2}</div>
                          <div className="text-sm text-muted-foreground">第三分類</div>
                          <div>{selectedSupplier.category3}</div>
                          <div className="text-sm text-muted-foreground">三年內直接/間接往來</div>
                          <div>{selectedSupplier.direct_relation_3yrs}</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="certifications" className="mt-0">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">認證資訊</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">ISO 9001</h4>
                            <CertificationStatus
                              status={selectedSupplier.iso9001_certified}
                              expiry={selectedSupplier.iso9001_expiry}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">認證狀態</div>
                            <div>{selectedSupplier.iso9001_certified}</div>
                            <div className="text-muted-foreground">有效期至</div>
                            <div>{selectedSupplier.iso9001_expiry || "未提供"}</div>
                          </div>
                        </div>

                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">IATF 16949</h4>
                            <CertificationStatus
                              status={selectedSupplier.iatf16949_certified}
                              expiry={selectedSupplier.iatf16949_expiry}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">認證狀態</div>
                            <div>{selectedSupplier.iatf16949_certified}</div>
                            <div className="text-muted-foreground">有效期至</div>
                            <div>{selectedSupplier.iatf16949_expiry || "未提供"}</div>
                          </div>
                        </div>

                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">ISO 17025</h4>
                            <CertificationStatus
                              status={selectedSupplier.iso17025_certified}
                              expiry={selectedSupplier.iso17025_expiry}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">認證狀態</div>
                            <div>{selectedSupplier.iso17025_certified}</div>
                            <div className="text-muted-foreground">有效期至</div>
                            <div>{selectedSupplier.iso17025_expiry || "未提供"}</div>
                          </div>
                        </div>

                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">CQI-9 (熱處理)</h4>
                            <CertificationStatus
                              status={selectedSupplier.cqi9_certified}
                              expiry={selectedSupplier.cqi9_expiry}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">認證狀態</div>
                            <div>{selectedSupplier.cqi9_certified}</div>
                            <div className="text-muted-foreground">有效期至</div>
                            <div>{selectedSupplier.cqi9_expiry || "未提供"}</div>
                          </div>
                        </div>

                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">CQI-11 (電鍍)</h4>
                            <CertificationStatus
                              status={selectedSupplier.cqi11_certified}
                              expiry={selectedSupplier.cqi11_expiry}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">認證狀態</div>
                            <div>{selectedSupplier.cqi11_certified}</div>
                            <div className="text-muted-foreground">有效期至</div>
                            <div>{selectedSupplier.cqi11_expiry || "未提供"}</div>
                          </div>
                        </div>

                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">CQI-12 (塗裝)</h4>
                            <CertificationStatus
                              status={selectedSupplier.cqi12_certified}
                              expiry={selectedSupplier.cqi12_expiry}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">認證狀態</div>
                            <div>{selectedSupplier.cqi12_certified}</div>
                            <div className="text-muted-foreground">有效期至</div>
                            <div>{selectedSupplier.cqi12_expiry || "未提供"}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="compliance" className="mt-0">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">合規狀況</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">RoHS</h4>
                            <CertificationStatus status={selectedSupplier.rohs_compliance} expiry="" />
                          </div>
                          <div className="text-sm">
                            <div className="text-muted-foreground">合規狀態</div>
                            <div>{selectedSupplier.rohs_compliance || "未提供"}</div>
                          </div>
                        </div>

                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">REACH</h4>
                            <CertificationStatus status={selectedSupplier.reach_compliance} expiry="" />
                          </div>
                          <div className="text-sm">
                            <div className="text-muted-foreground">合規狀態</div>
                            <div>{selectedSupplier.reach_compliance || "未提供"}</div>
                          </div>
                        </div>

                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">PFAS</h4>
                            <CertificationStatus status={selectedSupplier.pfas_compliance} expiry="" />
                          </div>
                          <div className="text-sm">
                            <div className="text-muted-foreground">合規狀態</div>
                            <div>{selectedSupplier.pfas_compliance || "未提供"}</div>
                          </div>
                        </div>

                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">CMRT</h4>
                            <CertificationStatus status={selectedSupplier.cmrt_provided} expiry="" />
                          </div>
                          <div className="text-sm">
                            <div className="text-muted-foreground">提供狀態</div>
                            <div>{selectedSupplier.cmrt_provided || "未提供"}</div>
                          </div>
                        </div>

                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">TSCA</h4>
                            <CertificationStatus status={selectedSupplier.tsca_compliance} expiry="" />
                          </div>
                          <div className="text-sm">
                            <div className="text-muted-foreground">合規狀態</div>
                            <div>{selectedSupplier.tsca_compliance || "未提供"}</div>
                          </div>
                        </div>

                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">EMRT</h4>
                            <CertificationStatus status={selectedSupplier.emrt_provided} expiry="" />
                          </div>
                          <div className="text-sm">
                            <div className="text-muted-foreground">提供狀態</div>
                            <div>{selectedSupplier.emrt_provided || "未提供"}</div>
                          </div>
                        </div>

                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">CP65</h4>
                            <CertificationStatus status={selectedSupplier.cp65_compliance} expiry="" />
                          </div>
                          <div className="text-sm">
                            <div className="text-muted-foreground">合規狀態</div>
                            <div>{selectedSupplier.cp65_compliance || "未提供"}</div>
                          </div>
                        </div>

                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">EU POP</h4>
                            <CertificationStatus status={selectedSupplier.eu_pop_compliance} expiry="" />
                          </div>
                          <div className="text-sm">
                            <div className="text-muted-foreground">合規狀態</div>
                            <div>{selectedSupplier.eu_pop_compliance || "未提供"}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="notes" className="mt-0">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">備註資訊</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="border rounded-md p-4">
                            <h4 className="font-medium mb-2">採購單備註提醒</h4>
                            <div className="text-sm bg-gray-50 p-2 rounded">
                              {selectedSupplier.po_reminder_note || "無備註"}
                            </div>
                          </div>

                          <div className="border rounded-md p-4">
                            <h4 className="font-medium mb-2">合格供應商清單備註</h4>
                            <div className="text-sm bg-gray-50 p-2 rounded">
                              {selectedSupplier.approval_note || "無備註"}
                            </div>
                          </div>

                          <div className="border rounded-md p-4">
                            <h4 className="font-medium mb-2">停用原因</h4>
                            <div className="text-sm bg-gray-50 p-2 rounded">
                              {selectedSupplier.disabled_reason || "未停用"}
                            </div>
                          </div>

                          <div className="border rounded-md p-4">
                            <h4 className="font-medium mb-2">舊訂單系統備註</h4>
                            <div className="text-sm bg-gray-50 p-2 rounded">
                              {selectedSupplier.legacy_notes || "無備註"}
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
