"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Specification {
  name: string
  value: string
}

interface ProductSpecificationsProps {
  specifications: Specification[]
}

export function ProductSpecifications({ specifications }: ProductSpecificationsProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">規格名稱</TableHead>
            <TableHead>規格值</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {specifications.map((spec, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{spec.name}</TableCell>
              <TableCell>{spec.value}</TableCell>
            </TableRow>
          ))}
          {specifications.length === 0 && (
            <TableRow>
              <TableCell colSpan={2} className="h-24 text-center">
                沒有規格資料
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
