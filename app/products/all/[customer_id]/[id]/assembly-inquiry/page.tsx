"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Printer, Send } from "lucide-react"
import Link from "next/link"
import { AssemblyProductInquiryForm } from "@/components/products/assembly-product-inquiry-form"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AssemblyProductInquiryPageProps {
  params: {
    id: string
  }
}

export default function AssemblyProductInquiryPage({ params }: AssemblyProductInquiryPageProps) {
  const id = decodeURIComponent(params.id)
  const [selectedFactory, setSelectedFactory] = useState<string | null>(null)

  // 模擬獲取組合產品數據
  // 實際應用中應該從API獲取
  const assemblyProduct = {
    id,
    pn: "ASSY-MONITOR-15",
    name: "15吋顯示器組裝品",
    description: "15吋顯示器完整組裝品，包含LCD面板、主板和塑膠外殼",
    customer: {
      id: "1",
      name: "台灣電子",
      code: "TE",
    },
    isAssembly: true,
    lastOrderDate: "2023-06-20",
    lastPrice: 72.5,
    currency: "USD",
    factories: [
      {
        id: "1",
        name: "深圳電子廠",
        code: "SZE",
        contact: "李經理",
        email: "li@szelec.com",
        phone: "+86-755-1234-5678",
      },
      {
        id: "2",
        name: "上海科技廠",
        code: "SHT",
        contact: "張經理",
        email: "zhang@shtec.com",
        phone: "+86-21-8765-4321",
      },
      {
        id: "5",
        name: "蘇州電子廠",
        code: "SZE2",
        contact: "王經理",
        email: "wang@szelec2.com",
        phone: "+86-512-9876-5432",
      },
    ],
    components: [
      {
        id: "comp-1",
        productId: "1",
        productName: "15吋 HD LCD面板",
        productPN: "LCD-15-HD",
        quantity: 1,
        unitPrice: 40.5,
        factoryId: "1",
        factoryName: "深圳電子廠",
        specifications: [
          { name: "尺寸", value: "15吋" },
          { name: "解析度", value: "1366x768" },
          { name: "亮度", value: "250nits" },
        ],
        lastOrderDate: "2023-05-15",
      },
      {
        id: "comp-2",
        productId: "2",
        productName: "主板 PCB V1",
        productPN: "PCB-MAIN-V1",
        quantity: 1,
        unitPrice: 15.75,
        factoryId: "2",
        factoryName: "上海科技廠",
        specifications: [
          { name: "尺寸", value: "120x80mm" },
          { name: "層數", value: "4層" },
          { name: "材質", value: "FR4" },
        ],
        lastOrderDate: "2023-04-20",
      },
      {
        id: "comp-3",
        productId: "6",
        productName: "塑膠外殼",
        productPN: "CASE-PLASTIC",
        quantity: 1,
        unitPrice: 5.25,
        factoryId: "5",
        factoryName: "蘇州電子廠",
        specifications: [
          { name: "材質", value: "ABS" },
          { name: "顏色", value: "黑色" },
          { name: "尺寸", value: "350x250x30mm" },
        ],
        lastOrderDate: "2023-06-05",
      },
    ],
  }

  // 按工廠分組組件
  const componentsByFactory = assemblyProduct.components.reduce(
    (acc, component) => {
      if (!acc[component.factoryId]) {
        acc[component.factoryId] = {
          factory: assemblyProduct.factories.find((f) => f.id === component.factoryId),
          components: [],
        }
      }
      acc[component.factoryId].components.push(component)
      return acc
    },
    {} as Record<string, { factory: any; components: any[] }>,
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/products/all/${encodeURIComponent(id)}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">組合產品詢價單</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            列印
          </Button>
          {selectedFactory && (
            <Button>
              <Send className="mr-2 h-4 w-4" />
              發送給工廠
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            組合產品: {assemblyProduct.name} ({assemblyProduct.pn})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">產品資訊</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>
                  <span className="font-medium">產品編號:</span> {assemblyProduct.pn}
                </p>
                <p>
                  <span className="font-medium">產品名稱:</span> {assemblyProduct.name}
                </p>
                <p>
                  <span className="font-medium">客戶:</span> {assemblyProduct.customer.name} (
                  {assemblyProduct.customer.code})
                </p>
              </div>
              <div>
                <p>
                  <span className="font-medium">最近訂單日期:</span> {assemblyProduct.lastOrderDate}
                </p>
                <p>
                  <span className="font-medium">最近價格:</span> {assemblyProduct.lastPrice} {assemblyProduct.currency}
                </p>
                <p>
                  <span className="font-medium">組件數量:</span> {assemblyProduct.components.length}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">工廠詢價單</h3>
            <p className="text-sm text-gray-500 mb-4">
              請選擇要生成詢價單的工廠。每個工廠的詢價單只包含該工廠負責的組件。
            </p>

            <Tabs defaultValue={Object.keys(componentsByFactory)[0]} onValueChange={setSelectedFactory}>
              <TabsList className="mb-4">
                {Object.entries(componentsByFactory).map(([factoryId, { factory }]) => (
                  <TabsTrigger key={factoryId} value={factoryId}>
                    {factory.name} ({factory.code})
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(componentsByFactory).map(([factoryId, { factory, components }]) => (
                <TabsContent key={factoryId} value={factoryId}>
                  <AssemblyProductInquiryForm
                    productId={id}
                    factory={factory}
                    components={components}
                    assemblyProduct={assemblyProduct}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
