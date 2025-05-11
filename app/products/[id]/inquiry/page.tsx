"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Printer, Send } from "lucide-react"
import Link from "next/link"
import { ProductInquiryForm } from "@/components/products/product-inquiry-form"

interface ProductInquiryPageProps {
  params: {
    id: string
  }
}

export default function ProductInquiryPage({ params }: ProductInquiryPageProps) {
  const { id } = params

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/products/${id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">產品詢價單</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            列印
          </Button>
          <Button>
            <Send className="mr-2 h-4 w-4" />
            發送給工廠
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardHeader className="print:pb-0">
          <CardTitle>舊單詢價單</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductInquiryForm productId={id} />
        </CardContent>
      </Card>
    </div>
  )
}
