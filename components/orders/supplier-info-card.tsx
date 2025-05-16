"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Factory, Phone, Mail, MapPin, Check } from "lucide-react"

interface SupplierInfoCardProps {
  supplier: any
  onSelect: () => void
  isSelected: boolean
}

export function SupplierInfoCard({ supplier, onSelect, isSelected }: SupplierInfoCardProps) {
  // 使用動態欄位名稱，確保能夠顯示供應商資料
  const id = supplier.factory_id || supplier.supplier_id || supplier.id || ""
  const name = supplier.factory_name || supplier.supplier_name || supplier.name || `供應商 ${id}`
  const fullName = supplier.factory_full_name || supplier.supplier_full_name || supplier.full_name || name
  const contactPerson = supplier.quality_contact1 || supplier.contact_person || supplier.contact_name || ""
  const phone = supplier.factory_phone || supplier.contact_phone || supplier.phone || ""
  const email = supplier.contact_email || supplier.email || ""
  const address = supplier.factory_address || supplier.address || ""
  const paymentTerm = supplier.payment_term || ""
  const deliveryTerm = supplier.delivery_term || ""
  const notes = supplier.legacy_notes || supplier.notes || ""

  return (
    <Card className={`overflow-hidden transition-all ${isSelected ? "border-primary" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            {fullName !== name && <CardDescription>{fullName}</CardDescription>}
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Factory className="h-3 w-3 mr-1" />
            {id}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2 text-sm">
        <div className="space-y-1">
          {contactPerson && (
            <div className="flex items-center text-muted-foreground">
              <span className="font-medium mr-2">聯絡人:</span>
              <span>{contactPerson}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center text-muted-foreground">
              <Phone className="h-3 w-3 mr-1" />
              <span>{phone}</span>
            </div>
          )}
          {email && (
            <div className="flex items-center text-muted-foreground">
              <Mail className="h-3 w-3 mr-1" />
              <span>{email}</span>
            </div>
          )}
          {address && (
            <div className="flex items-start text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1 mt-1 flex-shrink-0" />
              <span className="line-clamp-2">{address}</span>
            </div>
          )}
          {(paymentTerm || deliveryTerm) && (
            <div className="flex flex-wrap gap-1 mt-1">
              {paymentTerm && (
                <Badge variant="outline" className="text-xs">
                  付款: {paymentTerm}
                </Badge>
              )}
              {deliveryTerm && (
                <Badge variant="outline" className="text-xs">
                  交貨: {deliveryTerm}
                </Badge>
              )}
            </div>
          )}
          {notes && (
            <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
              <span className="font-medium">備註:</span> {notes}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button onClick={onSelect} variant={isSelected ? "default" : "outline"} className="w-full" size="sm">
          {isSelected ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              已選擇
            </>
          ) : (
            "選擇此供應商"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
