"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Contact {
  name: string
  title: string
  email: string
  phone: string
  primary: boolean
}

export function FactoryContactInfo({ contacts }: { contacts: Contact[] }) {
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
