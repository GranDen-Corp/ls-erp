"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"

interface PackingListProps {
  shipmentId: string
}

export function PackingList({ shipmentId }: PackingListProps) {
  // 模擬裝箱單數據 - 實際應用中應從API獲取
  const packing = {
    id: `PL-${shipmentId}`,
    date: "2023-04-20",
    shipmentId: shipmentId,
    invoiceId: `INV-${shipmentId}`,
    customer: {
      name: "台灣電子股份有限公司",
      address: "台北市內湖區電子路123號",
    },
    shipmentInfo: {
      destination: "台北",
      vessel: "海運一號",
      so: "SO-12345",
      etd: "2023-04-25",
      eta: "2023-05-05",
    },
    packages: [
      {
        id: 1,
        packageNo: "PKG-001",
        dimensions: "120 x 80 x 60 cm",
        grossWeight: "125 kg",
        netWeight: "120 kg",
        items: [
          {
            productCode: "LCD-15-HD",
            description: "15吋 HD LCD面板",
            quantity: 150,
            unit: "片",
          },
          {
            productCode: "LCD-17-FHD",
            description: "17吋 FHD LCD面板",
            quantity: 100,
            unit: "片",
          },
        ],
      },
      {
        id: 2,
        packageNo: "PKG-002",
        dimensions: "120 x 80 x 60 cm",
        grossWeight: "125 kg",
        netWeight: "120 kg",
        items: [
          {
            productCode: "LCD-15-HD",
            description: "15吋 HD LCD面板",
            quantity: 150,
            unit: "片",
          },
          {
            productCode: "LCD-17-FHD",
            description: "17吋 FHD LCD面板",
            quantity: 100,
            unit: "片",
          },
        ],
      },
    ],
    totalPackages: 2,
    totalGrossWeight: "250 kg",
    totalNetWeight: "240 kg",
    totalVolume: "1.152 m³",
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h2 className="text-xl font-bold">LS Trading Co., Ltd.</h2>
          <p>台北市信義區貿易路456號8樓</p>
          <p>電話: 02-8765-4321</p>
          <p>Email: info@lstrading.com</p>
        </div>
        <div className="text-right">
          <Image src="/placeholder.svg" alt="LS Trading Logo" width={150} height={60} className="mb-2" />
          <h3 className="text-xl font-bold">裝箱單 / Packing List</h3>
          <p>裝箱單編號: {packing.id}</p>
          <p>日期: {packing.date}</p>
          <p>發票編號: {packing.invoiceId}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <h3 className="font-semibold">客戶資訊:</h3>
          <p>{packing.customer.name}</p>
          <p>{packing.customer.address}</p>
        </div>
        <div className="space-y-1">
          <p>
            <span className="font-semibold">目的地:</span> {packing.shipmentInfo.destination}
          </p>
          <p>
            <span className="font-semibold">船名/航班:</span> {packing.shipmentInfo.vessel}
          </p>
          <p>
            <span className="font-semibold">S/O編號:</span> {packing.shipmentInfo.so}
          </p>
          <p>
            <span className="font-semibold">預計出發日:</span> {packing.shipmentInfo.etd}
          </p>
          <p>
            <span className="font-semibold">預計到達日:</span> {packing.shipmentInfo.eta}
          </p>
        </div>
      </div>

      {packing.packages.map((pkg) => (
        <div key={pkg.id} className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">包裝 #{pkg.packageNo}</h3>
            <div className="text-right">
              <p>
                <span className="font-semibold">尺寸:</span> {pkg.dimensions}
              </p>
              <p>
                <span className="font-semibold">毛重:</span> {pkg.grossWeight}
              </p>
              <p>
                <span className="font-semibold">淨重:</span> {pkg.netWeight}
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>產品編號</TableHead>
                <TableHead>產品描述</TableHead>
                <TableHead className="text-right">數量</TableHead>
                <TableHead className="text-right">單位</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pkg.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.productCode}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.unit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}

      <div className="border-t pt-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p>
              <span className="font-semibold">總包裝數:</span> {packing.totalPackages}
            </p>
          </div>
          <div>
            <p>
              <span className="font-semibold">總毛重:</span> {packing.totalGrossWeight}
            </p>
            <p>
              <span className="font-semibold">總淨重:</span> {packing.totalNetWeight}
            </p>
          </div>
          <div>
            <p>
              <span className="font-semibold">總體積:</span> {packing.totalVolume}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-8">
        <div>
          <p className="font-semibold mb-12">LS Trading Co., Ltd.</p>
          <div className="border-t border-black pt-1">
            <p>授權簽名 / Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  )
}
