"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { PlusCircle, Trash2, Upload, X } from "lucide-react"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ProductComponent } from "@/types/assembly-product"

interface ProductFormProps {
  productId?: string
  isClone?: boolean
  onSubmit: (data: any) => void
}

export function ProductForm({ productId, isClone = false, onSubmit }: ProductFormProps) {
  // 模擬從API獲取的產品數據
  // 實際應用中應該使用API獲取
  const initialProduct = productId
    ? {
        id: productId,
        pn: isClone ? `${productId}-COPY` : "LCD-15-HD",
        name: "15吋 HD LCD面板",
        description: "15吋高清LCD顯示面板，解析度1366x768，亮度250nits，對比度1000:1",
        customer: {
          id: "1",
          name: "台灣電子",
          code: "TE",
        },
        factory: {
          id: "1",
          name: "深圳電子廠",
          code: "SZE",
        },
        category: "面板",
        status: "active",
        createdDate: "2022-01-15",
        lastOrderDate: "2023-04-15",
        lastPrice: 45.0,
        currency: "USD",
        specifications: [
          { name: "尺寸", value: "15吋" },
          { name: "解析度", value: "1366x768" },
          { name: "亮度", value: "250nits" },
          { name: "對比度", value: "1000:1" },
          { name: "反應時間", value: "5ms" },
          { name: "接口", value: "LVDS" },
          { name: "工作溫度", value: "0~50°C" },
          { name: "儲存溫度", value: "-20~60°C" },
        ],
        sampleStatus: "已確認",
        sampleDate: "2022-02-10",
        remarks: "客戶指定使用A級面板，包裝需單獨防靜電包裝",
        moq: 100,
        leadTime: "30-45天",
        packagingRequirements: "單獨防靜電包裝，外箱標示產品型號和批次",
        certifications: ["RoHS", "REACH", "CE"],
        attachments: [
          { name: "產品規格書.pdf", url: "#" },
          { name: "測試報告.pdf", url: "#" },
        ],
        images: [
          {
            id: "1",
            url: "/placeholder.svg?height=400&width=400",
            alt: "產品圖片1",
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
        assemblyTime: 30,
        assemblyCostPerHour: 10,
        additionalCosts: 0,
      }
    : {
        pn: "",
        name: "",
        description: "",
        customer: { id: "", name: "", code: "" },
        factory: { id: "", name: "", code: "" },
        category: "",
        status: "active",
        specifications: [],
        remarks: "",
        moq: 0,
        leadTime: "",
        packagingRequirements: "",
        certifications: [],
        attachments: [],
        images: [],
        isAssembly: false,
        components: [],
        assemblyTime: 30,
        assemblyCostPerHour: 10,
        additionalCosts: 0,
      }

  const [product, setProduct] = useState(initialProduct)
  const [newSpec, setNewSpec] = useState({ name: "", value: "" })
  const [activeTab, setActiveTab] = useState("basic")
  const [dragOver, setDragOver] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState("")

  // 模擬客戶和工廠數據
  const customers = [
    { id: "1", name: "台灣電子", code: "TE" },
    { id: "2", name: "新竹科技", code: "HT" },
    { id: "3", name: "台北工業", code: "TI" },
    { id: "4", name: "高雄製造", code: "KM" },
    { id: "5", name: "台中電子", code: "TC" },
  ]

  const factories = [
    { id: "1", name: "深圳電子廠", code: "SZE" },
    { id: "2", name: "上海科技廠", code: "SHT" },
    { id: "3", name: "東莞工業廠", code: "DGI" },
    { id: "4", name: "廣州製造廠", code: "GZM" },
    { id: "5", name: "蘇州電子廠", code: "SZE" },
  ]

  const categories = ["面板", "電子元件", "IC晶片", "PCB", "連接器", "組裝產品", "其他"]

  // 模擬可用的組件產品
  const availableComponents = [
    { id: "1", pn: "LCD-15-HD", name: "15吋 HD LCD面板", factoryId: "1", factoryName: "深圳電子廠", unitPrice: 40.5 },
    { id: "2", pn: "PCB-MAIN-V1", name: "主板 PCB V1", factoryId: "2", factoryName: "上海科技廠", unitPrice: 15.75 },
    { id: "3", pn: "CAP-104-SMD", name: "104 SMD電容", factoryId: "3", factoryName: "東莞工業廠", unitPrice: 0.05 },
    { id: "4", pn: "RES-103-SMD", name: "103 SMD電阻", factoryId: "3", factoryName: "東莞工業廠", unitPrice: 0.03 },
    { id: "5", pn: "IC-CPU-8086", name: "8086 CPU晶片", factoryId: "4", factoryName: "廣州製造廠", unitPrice: 12.5 },
    { id: "6", pn: "CASE-PLASTIC", name: "塑膠外殼", factoryId: "5", factoryName: "蘇州電子廠", unitPrice: 5.25 },
  ]

  const handleInputChange = (field: string, value: any) => {
    setProduct((prev) => ({ ...prev, [field]: value }))
  }

  const handleCustomerChange = (customerId: string) => {
    const selectedCustomer = customers.find((c) => c.id === customerId)
    if (selectedCustomer) {
      setProduct((prev) => ({
        ...prev,
        customer: selectedCustomer,
      }))
    }
  }

  const handleFactoryChange = (factoryId: string) => {
    const selectedFactory = factories.find((f) => f.id === factoryId)
    if (selectedFactory) {
      setProduct((prev) => ({
        ...prev,
        factory: selectedFactory,
      }))
    }
  }

  const handleAddSpecification = () => {
    if (newSpec.name && newSpec.value) {
      setProduct((prev) => ({
        ...prev,
        specifications: [...prev.specifications, { ...newSpec }],
      }))
      setNewSpec({ name: "", value: "" })
    }
  }

  const handleRemoveSpecification = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }))
  }

  const handleAddCertification = (cert: string) => {
    if (!product.certifications.includes(cert)) {
      setProduct((prev) => ({
        ...prev,
        certifications: [...prev.certifications, cert],
      }))
    }
  }

  const handleRemoveCertification = (cert: string) => {
    setProduct((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c !== cert),
    }))
  }

  // 處理圖片上傳
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // 在實際應用中，這裡應該上傳文件到服務器
    // 這裡我們只是模擬上傳過程
    const newImages = Array.from(files).map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      alt: file.name,
      isThumbnail: product.images.length === 0, // 如果是第一張圖片，設為縮圖
    }))

    setProduct((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }))

    // 重置input，以便可以再次選擇相同的文件
    e.target.value = ""
  }

  // 處理拖放上傳
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    // 在實際應用中，這裡應該上傳文件到服務器
    // 這裡我們只是模擬上傳過程
    const newImages = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        alt: file.name,
        isThumbnail: product.images.length === 0, // 如果是第一張圖片，設為縮圖
      }))

    setProduct((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }))
  }

  // 設置縮圖
  const handleSetThumbnail = (imageId: string) => {
    setProduct((prev) => ({
      ...prev,
      images: prev.images.map((img) => ({
        ...img,
        isThumbnail: img.id === imageId,
      })),
    }))
  }

  // 刪除圖片
  const handleRemoveImage = (imageId: string) => {
    const isRemovingThumbnail = product.images.find((img) => img.id === imageId)?.isThumbnail

    setProduct((prev) => {
      const filteredImages = prev.images.filter((img) => img.id !== imageId)

      // 如果刪除的是縮圖，且還有其他圖片，則將第一張圖片設為縮圖
      if (isRemovingThumbnail && filteredImages.length > 0) {
        filteredImages[0].isThumbnail = true
      }

      return {
        ...prev,
        images: filteredImages,
      }
    })
  }

  // 處理添加組件
  const handleAddComponent = () => {
    if (!selectedComponent) return

    const component = availableComponents.find((c) => c.id === selectedComponent)
    if (!component) return

    const newComponent: ProductComponent = {
      id: `comp-${Date.now()}`,
      productId: component.id,
      productName: component.name,
      productPN: component.pn,
      quantity: 1,
      unitPrice: component.unitPrice,
      factoryId: component.factoryId,
      factoryName: component.factoryName,
    }

    setProduct((prev) => ({
      ...prev,
      components: [...prev.components, newComponent],
    }))
    setSelectedComponent("")
  }

  // 處理移除組件
  const handleRemoveComponent = (componentId: string) => {
    setProduct((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.id !== componentId),
    }))
  }

  // 處理組件數量變更
  const handleComponentQuantityChange = (componentId: string, quantity: number) => {
    setProduct((prev) => ({
      ...prev,
      components: prev.components.map((c) => {
        if (c.id === componentId) {
          return { ...c, quantity }
        }
        return c
      }),
    }))
  }

  // 計算組裝產品總成本
  const calculateTotalCost = () => {
    // 組件成本
    const componentsCost = product.components.reduce((sum, component) => {
      return sum + component.quantity * component.unitPrice
    }, 0)

    // 組裝人工成本
    const laborCost = (product.assemblyTime / 60) * product.assemblyCostPerHour

    // 總成本 = 組件成本 + 人工成本 + 額外成本
    return componentsCost + laborCost + product.additionalCosts
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(product)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">基本資訊</TabsTrigger>
          <TabsTrigger value="images">產品圖片</TabsTrigger>
          <TabsTrigger value="specifications">產品規格</TabsTrigger>
          <TabsTrigger value="commercial">商業條款</TabsTrigger>
          <TabsTrigger value="documents">文檔與認證</TabsTrigger>
          <TabsTrigger value="assembly">組裝資訊</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pn">產品編號 *</Label>
              <Input id="pn" value={product.pn} onChange={(e) => handleInputChange("pn", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">產品名稱 *</Label>
              <Input
                id="name"
                value={product.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer">客戶 *</Label>
              <Select value={product.customer.id} onValueChange={handleCustomerChange}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇客戶" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="factory">工廠 *</Label>
              <Select value={product.factory.id} onValueChange={handleFactoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇工廠" />
                </SelectTrigger>
                <SelectContent>
                  {factories.map((factory) => (
                    <SelectItem key={factory.id} value={factory.id}>
                      {factory.name} ({factory.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">類別 *</Label>
              <Select value={product.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇類別" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">狀態 *</Label>
              <Select value={product.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">活躍</SelectItem>
                  <SelectItem value="sample">樣品階段</SelectItem>
                  <SelectItem value="discontinued">已停產</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-assembly"
                  checked={product.isAssembly}
                  onCheckedChange={(checked) => handleInputChange("isAssembly", checked)}
                />
                <Label htmlFor="is-assembly">這是一個組裝產品</Label>
              </div>
              <p className="text-sm text-gray-500">
                組裝產品由多個組件組成，可能來自不同工廠。啟用此選項可以管理組件和計算組裝成本。
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">產品描述</Label>
              <Textarea
                id="description"
                value={product.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="remarks">備註</Label>
              <Textarea
                id="remarks"
                value={product.remarks}
                onChange={(e) => handleInputChange("remarks", e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="images" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    dragOver ? "border-primary bg-primary/5" : "border-gray-300"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="h-10 w-10 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">上傳產品圖片</h3>
                  <p className="text-sm text-gray-500 mb-4">拖放圖片文件到此處，或點擊下方按鈕選擇文件</p>
                  <div className="flex justify-center">
                    <Label
                      htmlFor="image-upload"
                      className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
                    >
                      選擇圖片
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>已上傳圖片</Label>
                  {product.images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {product.images.map((image) => (
                        <div key={image.id} className="relative group">
                          <div className="aspect-square relative rounded-md overflow-hidden border">
                            <Image
                              src={image.url || "/placeholder.svg"}
                              alt={image.alt}
                              fill
                              className="object-cover"
                            />
                            {image.isThumbnail && (
                              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md">
                                縮圖
                              </div>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {!image.isThumbnail && (
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => handleSetThumbnail(image.id)}
                              >
                                設為縮圖
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="h-8 w-8"
                              onClick={() => handleRemoveImage(image.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">尚未上傳任何圖片</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="spec-name">規格名稱</Label>
                    <Input
                      id="spec-name"
                      value={newSpec.name}
                      onChange={(e) => setNewSpec({ ...newSpec, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spec-value">規格值</Label>
                    <Input
                      id="spec-value"
                      value={newSpec.value}
                      onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={handleAddSpecification} className="w-full">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      添加規格
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>已添加規格</Label>
                  {product.specifications.length > 0 ? (
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left">規格名稱</th>
                            <th className="px-4 py-2 text-left">規格值</th>
                            <th className="px-4 py-2 text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.specifications.map((spec, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-2">{spec.name}</td>
                              <td className="px-4 py-2">{spec.value}</td>
                              <td className="px-4 py-2 text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveSpecification(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">尚未添加任何規格</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commercial" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="moq">最小訂購量 (MOQ)</Label>
              <Input
                id="moq"
                type="number"
                value={product.moq}
                onChange={(e) => handleInputChange("moq", Number.parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leadTime">生產交期</Label>
              <Input
                id="leadTime"
                value={product.leadTime}
                onChange={(e) => handleInputChange("leadTime", e.target.value)}
                placeholder="例如: 30-45天"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="packagingRequirements">包裝要求</Label>
              <Textarea
                id="packagingRequirements"
                value={product.packagingRequirements}
                onChange={(e) => handleInputChange("packagingRequirements", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>認證</Label>
                  <div className="flex flex-wrap gap-2">
                    {["RoHS", "REACH", "CE", "FCC", "UL", "CCC"].map((cert) => (
                      <div key={cert} className="flex items-center space-x-2">
                        <Switch
                          id={`cert-${cert}`}
                          checked={product.certifications.includes(cert)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleAddCertification(cert)
                            } else {
                              handleRemoveCertification(cert)
                            }
                          }}
                        />
                        <Label htmlFor={`cert-${cert}`}>{cert}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>文檔上傳</Label>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="dropzone-file"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                            />
                          </svg>
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">點擊上傳</span> 或拖放文件
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PDF, DOCX, XLSX, JPG, PNG (最大 10MB)
                          </p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                {product.attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label>已上傳文檔</Label>
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left">文檔名稱</th>
                            <th className="px-4 py-2 text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.attachments.map((attachment, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-2">
                                <a href={attachment.url} className="text-blue-600 hover:underline">
                                  {attachment.name}
                                </a>
                              </td>
                              <td className="px-4 py-2 text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setProduct((prev) => ({
                                      ...prev,
                                      attachments: prev.attachments.filter((_, i) => i !== index),
                                    }))
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assembly" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">組裝產品資訊</h3>
                  <p className="text-sm text-gray-500">
                    如果這是一個組裝產品，請在此處添加組件和組裝相關資訊。組裝成本將根據組件成本、組裝時間和額外成本自動計算。
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assemblyTime">組裝時間 (分鐘)</Label>
                    <Input
                      id="assemblyTime"
                      type="number"
                      min="0"
                      value={product.assemblyTime}
                      onChange={(e) => handleInputChange("assemblyTime", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assemblyCostPerHour">組裝人工成本 (USD/小時)</Label>
                    <Input
                      id="assemblyCostPerHour"
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.assemblyCostPerHour}
                      onChange={(e) => handleInputChange("assemblyCostPerHour", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="additionalCosts">額外成本 (USD)</Label>
                    <Input
                      id="additionalCosts"
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.additionalCosts}
                      onChange={(e) => handleInputChange("additionalCosts", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="component">選擇組件</Label>
                      <Select value={selectedComponent} onValueChange={setSelectedComponent}>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇組件產品" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableComponents.map((component) => (
                            <SelectItem key={component.id} value={component.id}>
                              {component.pn} - {component.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddComponent} disabled={!selectedComponent}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      添加組件
                    </Button>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>產品編號</TableHead>
                          <TableHead>產品名稱</TableHead>
                          <TableHead>工廠</TableHead>
                          <TableHead className="text-right">數量</TableHead>
                          <TableHead className="text-right">單價 (USD)</TableHead>
                          <TableHead className="text-right">金額 (USD)</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.components.map((component) => (
                          <TableRow key={component.id}>
                            <TableCell>{component.productPN}</TableCell>
                            <TableCell>{component.productName}</TableCell>
                            <TableCell>{component.factoryName}</TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min="1"
                                value={component.quantity}
                                onChange={(e) =>
                                  handleComponentQuantityChange(component.id, Number.parseInt(e.target.value) || 1)
                                }
                                className="w-20 text-right"
                              />
                            </TableCell>
                            <TableCell className="text-right">{component.unitPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              {(component.quantity * component.unitPrice).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveComponent(component.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {product.components.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              尚未添加任何組件
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex justify-end">
                    <div className="w-72 space-y-1">
                      <div className="flex justify-between">
                        <span>組件成本:</span>
                        <span>
                          {product.components
                            .reduce((sum, component) => sum + component.quantity * component.unitPrice, 0)
                            .toFixed(2)}{" "}
                          USD
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>組裝人工成本:</span>
                        <span>{((product.assemblyTime / 60) * product.assemblyCostPerHour).toFixed(2)} USD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>額外成本:</span>
                        <span>{product.additionalCosts.toFixed(2)} USD</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>總成本:</span>
                        <span>{calculateTotalCost().toFixed(2)} USD</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">
          取消
        </Button>
        <Button type="submit">保存產品</Button>
      </div>
    </form>
  )
}
