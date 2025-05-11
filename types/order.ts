// 訂單相關類型定義
export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface ShipmentBatch {
  id: string
  orderId: string
  batchNumber: number
  quantity: number
  plannedShipDate: string
  actualShipDate?: string
  status: "pending" | "shipped" | "delivered" | "delayed"
  customerUpdatedDeliveryDate?: string
  factoryActualDeliveryDate?: string
  isDelayed: boolean
  trackingNumber?: string
  notes?: string
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  orderDate: string
  deliveryDate: string
  status: string
  totalAmount: number
  items: OrderItem[]
  shipmentBatches?: ShipmentBatch[]
  notes?: string
}

export interface OrderStatus {
  id: string
  name: string
  color: string
  description: string
  isDefault: boolean
  nextStatuses: string[]
}

export interface OrderStatusHistory {
  id: string
  orderId: string
  status: string
  timestamp: string
  userId: string
  userName: string
  notes?: string
}
