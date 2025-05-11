"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { ComplaintEditForm } from "@/components/complaints/complaint-edit-form"
import { useRouter } from "next/navigation"

interface ComplaintEditPageProps {
  params: {
    id: string
  }
}

export default function ComplaintEditPage({ params }: ComplaintEditPageProps) {
  const { id } = params
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // 模擬API請求
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 實際應用中應該調用API更新客訴

    setIsSubmitting(false)

    // 導航到客訴詳情頁面
    router.push(`/complaints/${id}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/complaints/${id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">編輯客訴</h1>
        </div>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "儲存中..." : "儲存變更"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>客訴資訊</CardTitle>
        </CardHeader>
        <CardContent>
          <ComplaintEditForm complaintId={id} />
        </CardContent>
      </Card>
    </div>
  )
}
