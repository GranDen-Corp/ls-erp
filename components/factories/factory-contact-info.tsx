"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Factory {
  factory_id: string
  factory_name: string
  quality_contact1?: string
  quality_contact2?: string
  factory_phone?: string
  factory_fax?: string
  [key: string]: any
}

export function FactoryContactInfo({ factory }: { factory: Factory }) {
  // 從 factory 物件中提取聯絡人資訊
  const contacts = []

  // 如果有 quality_contact1，添加為主要聯絡人
  if (factory.quality_contact1) {
    contacts.push({
      name: factory.quality_contact1,
      title: "品質主管",
      email: factory.quality_email1 || "-",
      phone: factory.quality_phone1 || factory.factory_phone || "-",
      primary: true,
    })
  }

  // 如果有 quality_contact2，添加為次要聯絡人
  if (factory.quality_contact2) {
    contacts.push({
      name: factory.quality_contact2,
      title: "品質工程師",
      email: factory.quality_email2 || "-",
      phone: factory.quality_phone2 || factory.factory_phone || "-",
      primary: false,
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {contacts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">沒有聯絡人資訊</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>職稱</TableHead>
                <TableHead>電子郵件</TableHead>
                <TableHead>電話</TableHead>
                <TableHead>狀態</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.title}</TableCell>
                  <TableCell>
                    <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                      {contact.email}
                    </a>
                  </TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>{contact.primary && <Badge>主要聯絡人</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
