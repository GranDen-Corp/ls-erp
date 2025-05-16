// 訂單資料結構的類型定義

// 批次資訊
export interface ShipmentBatchSchema {
  batch_number: number
  planned_ship_date: string | null
  quantity: number
  notes: string | null
  status: string
  tracking_number: string | null
  actual_ship_date: string | null
  estimated_arrival_date: string | null
  customs_info: {
    clearance_date?: string
    customs_number?: string
    customs_fees?: number
  } | null
  created_at: string
  updated_at: string
}

// 產品項目
export interface OrderItemSchema {
  part_no: string
  description: string
  quantity: number
  unit_price: number
  is_assembly: boolean
  specifications: string | null
  remarks: string | null
  currency: string
  discount: number
  tax_rate: number
  total_price: number
  shipment_batches: ShipmentBatchSchema[]
  metadata: {
    created_at: string
    updated_at: string
    version: string
  }
}

// 完整訂單資料結構
export interface OrderSchema {
  order_sid: number
  order_id: string
  customer_id: string
  po_id: string
  payment_term: string | null
  delivery_terms: string | null
  status: number
  remarks: string | null
  created_at: string
  part_no_assembly?: string
  part_no_list: OrderItemSchema[]
}
