"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderConfirmation } from "@/components/orders/order-confirmation"
import { ArrowLeft, Printer, Upload } from "lucide-react"
import Link from "next/link"

interface OrderConfirmationPageProps {
  params: {
    id: string
  }
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { id } = params

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/orders/${id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">訂單確認書 - {id}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            列印
          </Button>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            上傳已簽回確認書
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardHeader className="print:pb-0">
          <CardTitle>訂單確認書</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderConfirmation orderId={id} />
        </CardContent>
      </Card>
    </div>
  )
}
