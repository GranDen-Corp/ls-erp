"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Customer } from "@/types/customer"

export default function CustomerTable() {
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    const loadData = async () => {
      const data = (await fetch("/customers_data-5FdaRqZJo5tbbahz89jgDNsfkYnUZa.json").then((res) =>
        res.json(),
      )) as Customer[]
      setCustomers(data)
    }
    loadData()
  }, [])

  if (!customers.length) {
    return <div>Loading...</div>
  }

  const headers = Object.keys(customers[0])

  return (
    <ScrollArea>
      <Table>
        <TableCaption>A preview of the customer data in the database.</TableCaption>
        <TableHeader>
          {headers.map((header) => (
            <TableHead key={header}>{header}</TableHead>
          ))}
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer["客戶編號"]}>
              {headers.map((header) => (
                <TableCell key={`${customer["客戶編號"]}-${header}`}>
                  {String(customer[header as keyof Customer])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}
