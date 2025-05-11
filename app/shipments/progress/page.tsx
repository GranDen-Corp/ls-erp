import type { Metadata } from "next"
import { ShipmentProgressTable } from "@/components/shipments/shipment-progress-table"

// 模擬從API獲取出貨進度數據
async function getShipmentProgress() {
  // 這裡應該是從API獲取數據
  return [
    {
      id: "ship-1",
      orderId: "order-1",
      orderNumber: "ORD-2023-1001",
      batchNumber: 1,
      customerName: "ABC Electronics Co., Ltd.",
      productName: "Wireless Headphones",
      quantity: 150,
      deliveryDate: "2023-01-30",
      purchaseDeliveryDate: "2023-01-25",
      customerUpdatedDeliveryDate: null,
      factoryActualDeliveryDate: "2023-01-30",
      status: "delivered",
      isDelayed: false,
    },
    {
      id: "ship-2",
      orderId: "order-1",
      orderNumber: "ORD-2023-1001",
      batchNumber: 2,
      customerName: "ABC Electronics Co., Ltd.",
      productName: "Wireless Headphones",
      quantity: 150,
      deliveryDate: "2023-03-30",
      purchaseDeliveryDate: "2023-03-25",
      customerUpdatedDeliveryDate: "2023-04-15",
      factoryActualDeliveryDate: null,
      status: "pending",
      isDelayed: true,
    },
    {
      id: "ship-3",
      orderId: "order-2",
      orderNumber: "ORD-2023-1002",
      batchNumber: 1,
      customerName: "XYZ Tech Solutions",
      productName: "Bluetooth Speakers",
      quantity: 200,
      deliveryDate: "2023-02-15",
      purchaseDeliveryDate: "2023-02-10",
      customerUpdatedDeliveryDate: null,
      factoryActualDeliveryDate: "2023-02-12",
      status: "delivered",
      isDelayed: false,
    },
  ]
}

export const metadata: Metadata = {
  title: "Shipment Progress",
  description: "Track and manage shipment progress",
}

export default async function ShipmentProgressPage() {
  const shipments = await getShipmentProgress()

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">出貨進度管理</h1>
      </div>

      <div className="rounded-md border">
        <ShipmentProgressTable shipments={shipments} />
      </div>
    </div>
  )
}
