"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ProductImagePreview } from "@/components/products/product-image-preview"
import { ProductComponentsInfo } from "@/components/products/product-components-info"
import { ProductOrderHistory } from "@/components/products/product-order-history"
import { ProductComplaintHistory } from "@/components/products/product-complaint-history"
import { ProductPriceHistoryChart } from "@/components/products/product-price-history-chart"
import { ProductSpecifications } from "@/components/products/product-specifications"
import { useState } from "react"

interface ProductViewFormProps {
  productId: string
  initialValues: any
  isAssembly?: boolean
  defaultTab?: string
}

export function ProductViewForm({
  productId,
  initialValues,
  isAssembly = false,
  defaultTab = "basic",
}: ProductViewFormProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  // 處理產品圖片
  let productImages = []
  try {
    if (initialValues.images) {
      if (typeof initialValues.images === "string") {
        productImages = JSON.parse(initialValues.images)
      } else {
        productImages = initialValues.images
      }
    }
  } catch (e) {
    console.error("解析產品圖片時出錯:", e)
    productImages = []
  }

  if (productImages.length === 0) {
    productImages = [
      {
        id: "default",
        url: "/diverse-products-still-life.png",
        alt: initialValues.componentName || "產品圖片",
        isThumbnail: true,
      },
    ]
  }

  // 解析組合產品的部件列表
  let subPartsList = ""
  if (isAssembly && initialValues.subPartNo) {
    try {
      let subParts = []
      if (typeof initialValues.subPartNo === "string") {
        try {
          // 嘗試解析 JSON 字符串
          const parsed = JSON.parse(initialValues.subPartNo)
          if (Array.isArray(parsed)) {
            subParts = parsed
              .map((item) => {
                if (typeof item === "string") return item
                return item.part_no || item.part_number || ""
              })
              .filter(Boolean)
          } else if (parsed && typeof parsed === "object") {
            if (parsed.part_no) {
              subParts = [parsed.part_no]
            } else if (parsed.part_number) {
              subParts = [parsed.part_number]
            }
          }
        } catch (e) {
          // 如果不是 JSON 字符串，則假設它是單個部件編號或逗號分隔的列表
          if (initialValues.subPartNo.includes(",")) {
            subParts = initialValues.subPartNo.split(",").map((p) => p.trim())
          } else if (initialValues.subPartNo.trim()) {
            subParts = [initialValues.subPartNo.trim()]
          }
        }
      } else if (Array.isArray(initialValues.subPartNo)) {
        subParts = initialValues.subPartNo
          .map((item) => {
            if (typeof item === "string") return item
            return item.part_no || item.part_number || ""
          })
          .filter(Boolean)
      }

      subPartsList = subParts.join("; ")
    } catch (e) {
      console.error("解析部件列表時出錯:", e)
      subPartsList = ""
    }
  }

  // 渲染唯讀字段
  const renderField = (label: string, value: any, className = "") => {
    return (
      <div className={className}>
        <Label className="text-sm font-medium text-gray-500">{label}</Label>
        <div className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded-md min-h-[38px]">{value || "-"}</div>
      </div>
    )
  }

  return (
    <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="basic">基本資訊</TabsTrigger>
        <TabsTrigger value="technical">技術資訊</TabsTrigger>
        <TabsTrigger value="commercial">商業資訊</TabsTrigger>
        <TabsTrigger value="history">歷史記錄</TabsTrigger>
        <TabsTrigger value="documents">文件資料</TabsTrigger>
      </TabsList>

      {/* 基本資訊頁籤 */}
      <TabsContent value="basic">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>基本資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("產品編號", initialValues.partNo)}
                {renderField("產品名稱", initialValues.componentName)}
                {renderField("客戶", initialValues.customerName?.name || initialValues.customerName?.id)}
                {renderField("工廠", initialValues.factoryName?.name || initialValues.factoryName?.id)}
                {renderField("產品類型", initialValues.productType)}
                {renderField("狀態", initialValues.status)}
                {renderField("規格", initialValues.specification)}
                {renderField("海關碼", initialValues.customsCode)}
                {renderField("終端客戶", initialValues.endCustomer)}
                {renderField("分類碼", initialValues.classificationCode)}
                {renderField("車廠圖號", initialValues.vehicleDrawingNo)}
                {renderField("客戶圖號", initialValues.customerDrawingNo)}
                {renderField("產品期稿", initialValues.productPeriod)}
                {renderField("創建日期", initialValues.createdDate)}
                {isAssembly && renderField("組合產品", "是", "col-span-2")}
                {isAssembly && subPartsList && renderField("組件", subPartsList, "col-span-2")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>產品圖片</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductImagePreview images={productImages} />
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>產品描述</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-900 p-2 bg-gray-50 rounded-md min-h-[100px]">
              {initialValues.description || "無產品描述"}
            </div>
          </CardContent>
        </Card>

        {/* 組合產品部件資訊 - 只有當產品是組合產品時才顯示 */}
        {isAssembly && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>組合產品部件資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductComponentsInfo isAssembly={isAssembly} subPartNo={initialValues.subPartNo} />
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* 技術資訊頁籤 */}
      <TabsContent value="technical">
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>技術規格</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductSpecifications
                product={{
                  specifications: initialValues.specifications,
                  part_no: initialValues.partNo,
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>圖紙版本</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("原始圖紙版本", initialValues.originalDrawingVersion)}
                {renderField("圖紙版本", initialValues.drawingVersion)}
                {renderField("客戶圖紙版本", initialValues.customerDrawingVersion)}
                {renderField("工廠圖紙版本", initialValues.factoryDrawingVersion)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>工藝資料</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {renderField("工藝要求", initialValues.processData?.join(", ") || "-")}
                {renderField("工藝備註", initialValues.processNotes?.join(", ") || "-")}
                {renderField("特殊要求", initialValues.specialRequirements?.join(", ") || "-")}
              </div>
            </CardContent>
          </Card>

          {isAssembly && (
            <Card>
              <CardHeader>
                <CardTitle>組裝資訊</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField("組裝時間 (分鐘)", initialValues.assemblyTime)}
                  {renderField("每小時組裝成本", initialValues.assemblyCostPerHour)}
                  {renderField("額外成本", initialValues.additionalCosts)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>

      {/* 商業資訊頁籤 */}
      <TabsContent value="commercial">
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>價格與訂單資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField(
                  "最近價格",
                  initialValues.lastPrice ? `${initialValues.lastPrice} ${initialValues.currency || ""}` : "-",
                )}
                {renderField("最近訂單日期", initialValues.lastOrderDate)}
                {renderField("MOQ", initialValues.moq)}
                {renderField("交貨時間", initialValues.leadTime)}
                {renderField("包裝要求", initialValues.packagingRequirements)}
                {renderField("訂單要求", initialValues.orderRequirements)}
                {renderField("採購要求", initialValues.purchaseRequirements)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>模具資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("是否有模具", initialValues.hasMold ? "是" : "否")}
                {initialValues.hasMold && renderField("模具成本", initialValues.moldCost)}
                {initialValues.hasMold && renderField("可退款模具數量", initialValues.refundableMoldQuantity)}
                {initialValues.hasMold && renderField("模具是否已退還", initialValues.moldReturned ? "是" : "否")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>樣品資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("樣品狀態", initialValues.sampleStatus)}
                {renderField("樣品日期", initialValues.sampleDate)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>會計備註</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-900 p-2 bg-gray-50 rounded-md min-h-[100px]">
                {initialValues.accountingNote || "無會計備註"}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* 歷史記錄頁籤 */}
      <TabsContent value="history">
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>訂單歷史</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductOrderHistory productId={initialValues.partNo} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>價格歷史</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductPriceHistoryChart productId={initialValues.partNo} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>投訴記錄</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductComplaintHistory productId={initialValues.partNo} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>編輯記錄</CardTitle>
            </CardHeader>
            <CardContent>
              {initialValues.editNotes && initialValues.editNotes.length > 0 ? (
                <div className="space-y-4">
                  {initialValues.editNotes.map((note, index) => (
                    <div key={index} className="border-b pb-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{note.user || "未知用戶"}</span>
                        <span className="text-sm text-gray-500">{note.date || "未知日期"}</span>
                      </div>
                      <p className="text-sm mt-1">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">無編輯記錄</p>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* 文件資料頁籤 */}
      <TabsContent value="documents">
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>圖紙文件</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("客戶原始圖紙", initialValues.customerOriginalDrawing?.filename || "-")}
                {renderField("客戶圖紙", initialValues.customerDrawing?.filename || "-")}
                {renderField("工廠圖紙", initialValues.factoryDrawing?.filename || "-")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>合規狀態</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("RoHS", initialValues.complianceStatus?.rohs || "-")}
                {renderField("REACH", initialValues.complianceStatus?.reach || "-")}
                {renderField("其他合規", initialValues.complianceStatus?.other || "-")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>重要文件</CardTitle>
            </CardHeader>
            <CardContent>
              {initialValues.importantDocuments && Object.keys(initialValues.importantDocuments).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(initialValues.importantDocuments).map(([key, value]) => renderField(key, value, ""))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">無重要文件</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>品質備註</CardTitle>
            </CardHeader>
            <CardContent>
              {initialValues.qualityNotes && initialValues.qualityNotes.length > 0 ? (
                <div className="space-y-2">
                  {initialValues.qualityNotes.map((note, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded-md">
                      <p className="text-sm">{note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">無品質備註</p>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}
