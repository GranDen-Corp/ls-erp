"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

// 定義產品類型（如果沒有types/product.ts文件）
type Product = {
  id: string
  productCode: string
  name: string
  category: string
  material: string
  price: number
  unit: string
  stockQuantity: number
  minimumOrderQuantity: number
  leadTime: number
  status: string
  description: string
  specifications: string
  dimensions: string
  weight: string
  certifications: string
  customizable: boolean
  supplier: string
  manufacturingProcess: string
  qualityStandards: string
  packagingType: string
  tensileStrength: string
  hardness: string
  surfaceFinish: string
  tolerances: string
  inspectionMethod: string
  productionCapacity: string
  setupTime: string
  cycleTime: string
  regulatoryCompliance: string
  environmentalStandards: string
  safetyStandards: string
  testReports: string
  complianceDocuments: string
}

export function ProductDataTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // 模擬從API獲取產品數據
    const mockProducts: Product[] = [
      {
        id: "P001",
        productCode: "HB-M8-30",
        name: "六角螺栓 M8x30mm",
        category: "緊固件",
        material: "不鏽鋼 304",
        price: 2.5,
        unit: "個",
        stockQuantity: 5000,
        minimumOrderQuantity: 100,
        leadTime: 7,
        status: "活躍",
        description: "標準六角頭螺栓，適用於各種工業應用",
        specifications: "DIN 933 / ISO 4017",
        dimensions: "M8 x 30mm",
        weight: "0.015kg",
        certifications: "ISO 9001, RoHS",
        customizable: true,
        supplier: "台灣緊固件有限公司",
        manufacturingProcess: "冷鍛成型",
        qualityStandards: "ISO 9001:2015",
        packagingType: "散裝",
        tensileStrength: "800 MPa",
        hardness: "HRC 30-35",
        surfaceFinish: "鍍鋅",
        tolerances: "±0.1mm",
        inspectionMethod: "目視檢查, 尺寸測量",
        productionCapacity: "10000/天",
        setupTime: "2小時",
        cycleTime: "5秒/個",
        regulatoryCompliance: "CE, REACH",
        environmentalStandards: "ISO 14001",
        safetyStandards: "OSHA",
        testReports: "可提供",
        complianceDocuments: "可提供",
      },
      {
        id: "P002",
        productCode: "BB-6205",
        name: "深溝球軸承 6205",
        category: "軸承",
        material: "軸承鋼",
        price: 35.8,
        unit: "個",
        stockQuantity: 1200,
        minimumOrderQuantity: 50,
        leadTime: 14,
        status: "活躍",
        description: "標準深溝球軸承，適用於中等負載應用",
        specifications: "ISO 15:2011",
        dimensions: "內徑25mm, 外徑52mm, 厚度15mm",
        weight: "0.12kg",
        certifications: "ISO 9001, ISO 14001",
        customizable: false,
        supplier: "精密軸承工業",
        manufacturingProcess: "精密加工",
        qualityStandards: "ISO 9001:2015",
        packagingType: "單個包裝",
        tensileStrength: "不適用",
        hardness: "HRC 60-65",
        surfaceFinish: "拋光",
        tolerances: "P6級",
        inspectionMethod: "尺寸測量, 噪音測試",
        productionCapacity: "5000/天",
        setupTime: "4小時",
        cycleTime: "3分鐘/個",
        regulatoryCompliance: "CE",
        environmentalStandards: "ISO 14001",
        safetyStandards: "ANSI/ABMA",
        testReports: "可提供",
        complianceDocuments: "可提供",
      },
    ]

    setProducts(mockProducts)
  }, [])

  const filteredProducts = products.filter(
    (product) =>
      product.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.material.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>產品資料表</CardTitle>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜尋產品..."
            className="w-[200px] pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>料號</TableHead>
                <TableHead>產品名稱</TableHead>
                <TableHead>類別</TableHead>
                <TableHead>材質</TableHead>
                <TableHead className="text-right">單價</TableHead>
                <TableHead className="text-right">庫存數量</TableHead>
                <TableHead>狀態</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    沒有找到符合條件的產品
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.productCode}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.material}</TableCell>
                    <TableCell className="text-right">
                      {product.price} {product.unit}
                    </TableCell>
                    <TableCell className="text-right">{product.stockQuantity}</TableCell>
                    <TableCell>
                      <Badge variant={product.status === "活躍" ? "default" : "secondary"}>{product.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
