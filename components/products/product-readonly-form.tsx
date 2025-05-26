"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { BasicInfoTab } from "./tabs/basic-info-tab"
import { ProcessTab } from "./tabs/process-tab"
import { ResumeTab } from "./tabs/resume-tab"
import { ImagesTab } from "./tabs/images-tab"
import { DocumentsTab } from "./tabs/documents-tab"

// 產品表單屬性
interface ProductReadOnlyFormProps {
  productId?: string
  initialValues?: any
  isAssembly?: boolean
  defaultTab?: string
}

// 製程資料記錄類型
interface ProcessRecord {
  id: string
  process: string
  vendor: string
  capacity: string
  requirements: string
  report: string
}

// 客戶類型
interface Customer {
  id: string
  name: string
  code: string
}

// 供應商類型
interface Supplier {
  id: string
  name: string
  code: string
}

// 文件記錄類型
interface DocumentRecord {
  document: string
  filename: string
}

// 符合性狀態類型
interface ComplianceStatus {
  status: string
  substances: string
  reason: string
  document: string
  filename: string
}

// 備註類型
interface Note {
  content: string
  date: string
  user: string
}

// 訂單歷史記錄類型
interface OrderHistoryRecord {
  orderNumber: string
  quantity: number
}

// 產品規格類型
interface ProductSpecification {
  name: string
  value: string
}

// 產品部件類型
interface ProductComponent {
  part_no: string
  description: string
}

// 默認的空文件對象
const emptyFileObject = {
  path: "",
  filename: "",
}

// 默認的空符合性狀態
const emptyComplianceStatus = {
  status: "",
  substances: "",
  reason: "",
  document: "",
  filename: "",
}

// 默認的空文件記錄
const emptyDocumentRecord = {
  document: "",
  filename: "",
}

// 產品類別映射
const productTypeMap: Record<string, string> = {}

export function ProductReadOnlyForm({
  productId,
  initialValues,
  isAssembly = false,
  defaultTab = "basic",
}: ProductReadOnlyFormProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || "basic")
  const [product, setProduct] = useState(initialValues || {})
  const [customersData, setCustomersData] = useState<Customer[]>([])
  const [factories, setFactories] = useState<Supplier[]>([])
  const [componentDetails, setComponentDetails] = useState<{ [key: string]: string }>({})
  const [selectedComponents, setSelectedComponents] = useState<ProductComponent[]>([])
  const [isCompositeProduct, setIsCompositeProduct] = useState(initialValues?.is_assembly || isAssembly || false)
  const [productTypeMapState, setProductTypeMapState] = useState<Record<string, string>>(productTypeMap)

  const supabase = createClientComponentClient()

  // 當initialValues變更時更新product
  useEffect(() => {
    if (initialValues && JSON.stringify(initialValues) !== JSON.stringify(product)) {
      setProduct(initialValues)
      setIsCompositeProduct(initialValues.is_assembly || false)
    }
  }, [initialValues, product])

  // 客戶和供應商數據加載完成後，設置名稱
  useEffect(() => {
    if (customersData.length > 0 && product.customer_id) {
      const customerId = product.customer_id
      const selectedCustomer = customersData.find((c) => c.id === customerId)
      if (selectedCustomer) {
        setProduct((prev) => ({
          ...prev,
          customer_id: selectedCustomer.id,
        }))
      }
    }

    if (factories.length > 0 && product.factory_id) {
      const factoryId = product.factory_id
      const selectedFactory = factories.find((f) => f.id === factoryId)
      if (selectedFactory) {
        setProduct((prev) => ({
          ...prev,
          factory_id: selectedFactory.id,
        }))
      }
    }
  }, [customersData, factories, product.customer_id, product.factory_id])

  // 載入客戶和供應商資料
  useEffect(() => {
    async function fetchOptions() {
      try {
        // 獲取客戶數據
        const { data: customers, error: customersError } = await supabase
          .from("customers")
          .select("customer_id, customer_short_name")
          .order("customer_id")

        if (customersError) throw new Error(`獲取客戶數據失敗: ${customersError.message}`)

        // 將數據轉換為組件需要的格式
        const formattedCustomers =
          customers?.map((customer) => ({
            id: customer.customer_id,
            name: customer.customer_short_name,
            code: customer.customer_id || "",
          })) || []

        // 嘗試獲取供應商數據
        let formattedFactories = []
        try {
          const { data: factoriesData, error: factoriesError } = await supabase
            .from("suppliers")
            .select("factory_id, factory_name")
            .order("factory_id")

          if (!factoriesError && factoriesData) {
            formattedFactories = factoriesData.map((supplier) => ({
              id: supplier.factory_id,
              name: supplier.factory_name,
              code: supplier.factory_id || "",
            }))
          }
        } catch (factoryError) {
          console.warn("獲取工廠數據失敗，使用空數組作為後備:", factoryError)
        }

        setCustomersData(formattedCustomers)
        setFactories(formattedFactories)
      } catch (err) {
        console.error("獲取選項數據失敗:", err)
      }
    }

    fetchOptions()
  }, [])

  // 獲取產品類別數據
  useEffect(() => {
    async function fetchProductTypes() {
      try {
        const { data, error } = await supabase.from("product_types").select("type_code, type_name")

        if (error) throw error

        const typeMap: Record<string, string> = {}
        data?.forEach((type) => {
          typeMap[type.type_code] = type.type_name
        })

        setProductTypeMapState(typeMap)
      } catch (error) {
        console.error("獲取產品類別失敗:", error)
      }
    }

    fetchProductTypes()
  }, [])

  // 初始化組合產品部件
  useEffect(() => {
    // 如果是組合產品，處理部件資料
    if (initialValues?.isAssembly || initialValues?.is_assembly) {
      setIsCompositeProduct(true)

      // 如果有部件資料，解析並顯示
      if (initialValues?.subPartNo || initialValues?.sub_part_no) {
        try {
          let components: ProductComponent[] = []
          const subPartNoData = initialValues?.subPartNo || initialValues?.sub_part_no

          // 處理不同格式的 sub_part_no
          if (typeof subPartNoData === "string") {
            try {
              // 嘗試解析JSON字符串
              components = JSON.parse(subPartNoData)
            } catch (e) {
              console.error("解析 sub_part_no 字符串時出錯:", e)
              // 如果解析失敗，可能是逗號分隔的字符串
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
            // 格式化部件資料
            const formattedComponents = components
              .map((comp): ProductComponent => {
                if (typeof comp === "object") {
                  return {
                    part_no: comp.part_no || comp.part_number || "",
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

            // 獲取部件詳情
            const customerId = initialValues.customer_id
            if (customerId && formattedComponents.length > 0) {
              fetchComponentDetails(formattedComponents, customerId)
            }
          }
        } catch (e) {
          console.error("解析組合產品部件時出錯:", e)
        }
      }
    }
  }, [initialValues])

  // 獲取部件詳情
  const fetchComponentDetails = async (components: ProductComponent[], customerId: string) => {
    if (!components.length || !customerId) return

    try {
      // 獲取所有部件的 part_no
      const partNos = components.map((comp) => comp.part_no).filter(Boolean)

      if (partNos.length === 0) return

      // 查詢產品名稱
      const { data, error } = await supabase
        .from("products")
        .select("part_no, component_name")
        .eq("customer_id", customerId)
        .in("part_no", partNos)

      if (error) {
        console.error("獲取部件詳情時出錯:", error)
        return
      }

      if (data && data.length > 0) {
        // 建立 part_no 到 component_name 的映射
        const detailsMap: { [key: string]: string } = {}
        data.forEach((item) => {
          if (item.part_no && item.component_name) {
            detailsMap[item.part_no] = item.component_name
          }
        })

        // 更新組件詳情
        setComponentDetails(detailsMap)

        // 更新已選擇的組件描述
        setSelectedComponents((prev) =>
          prev.map((comp) => ({
            ...comp,
            description: detailsMap[comp.part_no] || comp.description,
          })),
        )
      }
    } catch (error) {
      console.error("獲取部件詳情時出錯:", error)
    }
  }

  // 創建唯讀版本的輸入欄位
  const ReadOnlyInput = ({ label, value }: { label: string; value: string | number | undefined | null }) => (
    <div className="space-y-2">
      <Label htmlFor={`readonly-${label}`}>{label}</Label>
      <Input id={`readonly-${label}`} value={value || ""} readOnly className="bg-gray-50 cursor-not-allowed" />
    </div>
  )

  // 創建唯讀版本的文本區域
  const ReadOnlyTextarea = ({ label, value }: { label: string; value: string | undefined | null }) => {
    // 處理換行符號
    const formattedValue = value ? value.replace(/\\n/g, "\n") : ""

    return (
      <div className="space-y-2">
        <Label htmlFor={`readonly-${label}`}>{label}</Label>
        <div className="p-2 border rounded-md bg-gray-50 min-h-[100px] whitespace-pre-wrap">{formattedValue}</div>
      </div>
    )
  }

  // 創建唯讀版本的選擇器
  const ReadOnlySelect = ({ label, value }: { label: string; value: string | undefined | null }) => (
    <div className="space-y-2">
      <Label htmlFor={`readonly-${label}`}>{label}</Label>
      <Input id={`readonly-${label}`} value={value || ""} readOnly className="bg-gray-50 cursor-not-allowed" />
    </div>
  )

  // 創建唯讀版本的複選框
  const ReadOnlyCheckbox = ({ label, checked }: { label: string; checked: boolean }) => (
    <div className="flex items-center space-x-2">
      <Checkbox id={`readonly-${label}`} checked={checked} disabled className="cursor-not-allowed" />
      <Label htmlFor={`readonly-${label}`} className="cursor-not-allowed">
        {label}
      </Label>
    </div>
  )

  // 創建唯讀版本的單選按鈕組
  const ReadOnlyRadioGroup = ({ label, value }: { label: string; value: string | undefined | null }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="p-2 border rounded-md bg-gray-50">{value || "-"}</div>
    </div>
  )

  // 創建圖面預覽組件
  const DrawingPreview = ({ drawing, label }: { drawing: any; label: string }) => {
    if (!drawing || !drawing.filename) return <div className="p-2 border rounded-md bg-gray-50">未上傳圖面</div>

    // 獲取文件名（不含副檔名）
    const fileName = drawing.filename.split(".").slice(0, -1).join(".")

    return (
      <div className="mt-4 border rounded-md p-4">
        <p className="text-center font-medium mb-2">{fileName}</p>
        {drawing.path && (
          <div className="flex justify-center mb-2">
            <img
              src={drawing.path || "/placeholder.svg"}
              alt={`${label}預覽`}
              className="max-h-40 object-contain"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = "none"
                ;(e.target as HTMLImageElement).nextElementSibling!.style.display = "block"
              }}
            />
            <div className="hidden text-center text-gray-500 py-4">無法預覽此文件格式</div>
          </div>
        )}
        <p className="text-xs text-gray-500 break-all">{drawing.path}</p>
      </div>
    )
  }

  // 在 ProductReadonlyForm 組件中，確保 tabs 數組與 product-form.tsx 一致，但移除商業條款頁籤
  const tabs = [
    {
      id: "basic-info",
      label: "基本資料",
      content: <BasicInfoTab formData={product} onFormDataChange={() => {}} productTypes={productTypeMapState} isReadOnly={true} />,
    },
    {
      id: "process",
      label: "製程資料",
      content: <ProcessTab product={product} readOnly={true} formData={{}} updateFormData={() => {}} />,
    },
    {
      id: "resume",
      label: "履歷資料",
      content: <ResumeTab resumeData={product.resume_data || {}} onResumeDataChange={() => {}} isReadOnly={true} />,
    },
    {
      id: "images",
      label: "圖片資料",
      content: <ImagesTab imageData={product.image_data || {}} onImageDataChange={() => {}} isReadOnly={true} />,
    },
    {
      id: "documents",
      label: "文件與認證",
      content: (
        <DocumentsTab documentData={product.document_data || {}} onDocumentDataChange={() => {}} isReadOnly={true} />
      ),
    },
  ]

  return (
    <form className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          // Set the active tab without opening any dialogs
          setActiveTab(value)
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="basic">基本資訊</TabsTrigger>
          <TabsTrigger value="composite">組合產品</TabsTrigger>
          <TabsTrigger value="images">產品圖片</TabsTrigger>
          <TabsTrigger value="documents">文件與認證</TabsTrigger>
          <TabsTrigger value="process">製程資料</TabsTrigger>
          <TabsTrigger value="resume">履歷資料</TabsTrigger>
        </TabsList>

        {/* 基本資訊頁籤 */}
        <TabsContent value="basic" className="space-y-4 pt-4">
          <BasicInfoTab
            product={product}
            handleInputChange={() => {}}
            customersData={customersData}
            factories={factories}
            productTypes={[]}
            isReadOnly={true}
          />
        </TabsContent>

        {/* 組合產品頁籤 */}
        <TabsContent value="composite" className="space-y-6 pt-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <ReadOnlyCheckbox label="此為組合產品" checked={isCompositeProduct} />
                </div>

                {isCompositeProduct && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">組件產品列表</h3>
                    </div>

                    {selectedComponents.length === 0 ? (
                      <div className="text-center py-8 border rounded-md text-gray-500">尚未選擇任何組件產品</div>
                    ) : (
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left">產品編號</th>
                              <th className="px-4 py-2 text-left">產品名稱</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedComponents.map((component, index) => (
                              <tr key={index} className="border-t">
                                <td className="px-4 py-2 font-medium">{component.part_no}</td>
                                <td className="px-4 py-2">
                                  {componentDetails[component.part_no] || component.description || ""}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 圖片頁籤 */}
        <TabsContent value="images" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-6">
            {/* 圖面資訊 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">圖面資訊</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* 左側：原圖版次和客戶原圖 */}
                    <div className="space-y-4">
                      <ReadOnlyInput label="原圖版次" value={product.originalDrawingVersion} />

                      <div className="space-y-2">
                        <Label>客戶原圖</Label>
                        <DrawingPreview drawing={product.customerOriginalDrawing} label="客戶原圖" />
                      </div>
                    </div>

                    {/* 右側：車廠圖號和客戶圖號（從基本資訊同步） */}
                    <div className="space-y-4">
                      <ReadOnlyInput label="車廠圖號" value={product.vehicleDrawingNo} />
                      <ReadOnlyInput label="客戶圖號" value={product.customerDrawingNo} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-center">今湛客圖</h4>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-center">今湛工廠圖</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <ReadOnlyInput label="客戶圖版次" value={product.customerDrawingVersion} />
                    <ReadOnlyInput label="工廠圖版次" value={product.factoryDrawingVersion} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>今湛客圖</Label>
                      <DrawingPreview drawing={product.customerDrawing} label="今湛客圖" />
                    </div>

                    <div className="space-y-2">
                      <Label>今湛工廠圖</Label>
                      <DrawingPreview drawing={product.factoryDrawing} label="今湛工廠圖" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 文件與認證頁籤 */}
        <TabsContent value="documents" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-6">
            {/* 重要文件 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">重要文件</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* 標準文件 */}
                    <div className="space-y-2">
                      <Label>PPAP認可資料夾</Label>
                      <Input
                        value={product.importantDocuments?.PPAP?.filename || "未選擇文件"}
                        readOnly
                        className="bg-gray-50 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>PSW報告</Label>
                      <Input
                        value={product.importantDocuments?.PSW?.filename || "未選擇文件"}
                        readOnly
                        className="bg-gray-50 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>產能分析</Label>
                      <Input
                        value={product.importantDocuments?.capacityAnalysis?.filename || "未選擇文件"}
                        readOnly
                        className="bg-gray-50 cursor-not-allowed"
                      />
                    </div>

                    {/* 自定義文件 */}
                    {product.importantDocuments &&
                      Object.entries(product.importantDocuments).map(([key, doc]) => {
                        if (key === "PPAP" || key === "PSW" || key === "capacityAnalysis") return null

                        return (
                          <div key={key} className="space-y-2 border-t pt-4">
                            <div className="flex justify-between items-center">
                              <Input
                                value={(doc as any).title || key}
                                readOnly
                                className="w-48 bg-gray-50 cursor-not-allowed"
                              />
                            </div>
                            <Input
                              value={(doc as any).filename || "未選擇文件"}
                              readOnly
                              className="bg-gray-50 cursor-not-allowed"
                            />
                          </div>
                        )
                      })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 零件管理特性 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">零件管理特性</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>特性名稱</Label>
                      </div>
                      <div className="text-right"></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                      <div className="col-span-2">
                        <Label>安全件</Label>
                      </div>
                      <div className="flex justify-end">
                        <ReadOnlyCheckbox label="" checked={product.partManagement?.safetyPart || false} />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                      <div className="col-span-2">
                        <Label>汽車件</Label>
                      </div>
                      <div className="flex justify-end">
                        <ReadOnlyCheckbox label="" checked={product.partManagement?.automotivePart || false} />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                      <div className="col-span-2">
                        <Label>CBAM零件</Label>
                      </div>
                      <div className="flex justify-end">
                        <ReadOnlyCheckbox label="" checked={product.partManagement?.CBAMPart || false} />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                      <div className="col-span-2">
                        <Label>熔鑄地要求</Label>
                      </div>
                      <div className="flex justify-end">
                        <ReadOnlyCheckbox label="" checked={product.partManagement?.clockRequirement || false} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 符合性要求 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">符合性要求</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-5 gap-4">
                      <div>
                        <Label>法規</Label>
                      </div>
                      <div className="text-center">
                        <Label>符合狀態</Label>
                      </div>
                      <div className="text-center">
                        <Label>含有物質</Label>
                      </div>
                      <div className="text-center">
                        <Label>理由</Label>
                      </div>
                      <div className="text-center">
                        <Label>文件</Label>
                      </div>
                    </div>

                    {["RoHS", "REACh", "EUPOP", "TSCA", "CP65", "PFAS", "CMRT", "EMRT"].map((regulation) => (
                      <div key={regulation} className="grid grid-cols-5 gap-4 items-center border-b pb-2">
                        <div>
                          <Label>{regulation}</Label>
                        </div>
                        <div className="text-center">
                          <Input
                            value={product.complianceStatus?.[regulation]?.status || ""}
                            readOnly
                            className="bg-gray-50 cursor-not-allowed text-center"
                          />
                        </div>
                        <div>
                          <Input
                            value={product.complianceStatus?.[regulation]?.substances || ""}
                            readOnly
                            className="bg-gray-50 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <Input
                            value={product.complianceStatus?.[regulation]?.reason || ""}
                            readOnly
                            className="bg-gray-50 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <Input
                            value={product.complianceStatus?.[regulation]?.filename || "未上傳文件"}
                            readOnly
                            className="bg-gray-50 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 編輯備註 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">編輯備註</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>備註內容</Label>
                    </div>
                    <div className="text-center">
                      <Label>日期</Label>
                    </div>
                    <div className="text-center">
                      <Label>使用者</Label>
                    </div>
                  </div>

                  {product.editNotes && product.editNotes.length > 0 ? (
                    product.editNotes.map((note, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                        <div>
                          <p className="text-sm">{note.content}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm">{note.date}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm">{note.user}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">尚未添加任何備註</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 製程資料頁籤 */}
        <TabsContent value="process" className="space-y-4 pt-4">
          <ProcessTab product={product} readOnly={true} formData={{}} updateFormData={() => {}} />
        </TabsContent>

        {/* 履歷資料頁籤 */}
        <TabsContent value="resume" className="space-y-4 pt-4">
          <ResumeTab product={product} handleInputChange={() => {}} isReadOnly={true} />
        </TabsContent>
      </Tabs>
    </form>
  )
}
