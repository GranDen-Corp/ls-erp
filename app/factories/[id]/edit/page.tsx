import { FactoryForm } from "@/components/factories/factory-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

// 模擬工廠數據獲取函數
function getFactory(id: string) {
  return {
    id: "FAC001",
    name: "台灣精密製造廠",
    contactPerson: "王大明",
    email: "contact@twprecision.com",
    phone: "04-2345-6789",
    address: "台中市西屯區工業區路123號",
    country: "台灣",
    type: "assembly",
    status: "active",
    createdAt: "2023-01-10",
    taxId: "12345678",
    website: "https://www.twprecision.com",
    capacity: "每月5000單位",
    certifications: ["ISO 9001", "ISO 14001"],
    notes: "主要負責高精密零件組裝",
  }
}

export default function EditFactoryPage({ params }: { params: { id: string } }) {
  const factory = getFactory(params.id)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href={`/factories/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">編輯工廠: {factory.name}</h1>
      </div>
      <FactoryForm factory={factory} />
    </div>
  )
}
