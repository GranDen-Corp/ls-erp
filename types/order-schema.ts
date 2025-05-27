export interface OrderItemSchema {
  product_id: string
  quantity: number
  price: number
}

export interface OrderSchema {
  order_id: string
  customer_id: string
  order_date: string
  trade_terms: string
  payment_terms: string
  order_items: OrderItemSchema[]
  order_info: {
    notes?: string
    shipping_address?: string
  }
  total_amount: number
  status: string
}

export interface CreateOrderSchema {
  customer_id: string
  trade_terms: string
  payment_terms: string
  order_items: OrderItemSchema[]
  order_info: {
    notes?: string
    shipping_address?: string
  }
}

export interface UpdateOrderSchema {
  trade_terms?: string
  payment_terms?: string
  order_items?: OrderItemSchema[]
  order_info?: {
    notes?: string
    shipping_address?: string
  }
  status?: string
}
