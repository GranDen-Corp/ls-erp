"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tag, Mail, Phone, MapPin, CreditCard, Banknote } from "lucide-react"
import type { Customer } from "@/types/customer"

interface CustomerContactInfoProps {
  customer: Customer
}

export default function CustomerContactInfo({ customer }: CustomerContactInfoProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>聯絡資訊</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{customer.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{customer.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{customer.address}</span>
          </div>
          {customer.groupTag && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="px-2 py-1">
                {customer.groupTag}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>財務資訊</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span>付款條件: {customer.paymentTerms}</span>
          </div>
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-muted-foreground" />
            <span>
              信用額度: {customer.creditLimit.toLocaleString()} {customer.currency}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={customer.status === "active" ? "default" : "secondary"}>
              {customer.status === "active" ? "活躍" : "非活躍"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
