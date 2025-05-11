import type { Metadata } from "next"
import { GenerateShipmentManual } from "@/scripts/generate-shipment-manual"

export const metadata: Metadata = {
  title: "生成使用手冊 | 貿易ERP系統",
  description: "生成PDF版本的出貨管理系統使用手冊",
}

export default function GenerateManualPage() {
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">生成使用手冊</h1>
        <p className="text-muted-foreground">生成PDF版本的出貨管理系統使用手冊並添加到文件管理系統</p>
      </div>
      <div className="max-w-md mx-auto w-full mt-8">
        <GenerateShipmentManual />
      </div>
    </div>
  )
}
