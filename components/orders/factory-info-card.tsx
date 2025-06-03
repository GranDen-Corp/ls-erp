"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Factory, Phone, Mail, MapPin, Check } from "lucide-react"

interface FactoryInfoCardProps {
  factory: any
  onSelect: () => void
  isSelected: boolean
}

export function FactoryInfoCard({ factory: factory, onSelect, isSelected }: FactoryInfoCardProps) {
  // 使用動態欄位名稱，確保能夠顯示供應商資料
  const id = factory.factory_id || factory.id || ""
  const name = factory.factory_name || factory.name || `供應商 ${id}`
  const fullName = factory.factory_full_name || name
  const contactPerson = factory.quality_contact1 || factory.contact_person || factory.contact_name || ""
  const phone = factory.factory_phone || factory.contact_phone || factory.phone || ""
  const email = factory.contact_email || factory.email || ""
  const address = factory.factory_address || factory.address || ""
  const paymentTerm = factory.payment_term || ""
  const deliveryTerm = factory.delivery_term || ""
  const notes = factory.legacy_notes || factory.notes || ""

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
