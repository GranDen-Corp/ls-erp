"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PackingList } from "@/components/shipments/packing-list"
import { ArrowLeft, Printer } from "lucide-react"
import Link from "next/link"

interface PackingListPageProps {
  params: {
    id: string
  }
}

export default function PackingListPage({ params }: PackingListPageProps) {
  const { id } = params

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/shipments/${id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">裝箱單 - {id}</h1>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          列印
        </Button>
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardHeader className="print:pb-0">
          <CardTitle>裝箱單 / Packing List</CardTitle>
        </CardHeader>
        <CardContent>
          <PackingList shipmentId={id} />
        </CardContent>
      </Card>
    </div>
  )
}
