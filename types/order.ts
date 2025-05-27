export interface Order {
  id: string
  order_number: string
  customer_id: string
  order_date: string
  trade_terms?: string
  payment_terms?: string
  delivery_date?: string
  order_info?: Record<string, any> | null
  items: OrderItem[]
  total_amount: number
  status: string
  created_at?: string
  updated_at?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  total_amount: number
  created_at?: string
  updated_at?: string
}
