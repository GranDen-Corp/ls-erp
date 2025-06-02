export interface StaticParameterFormData {
  category: string
  code: string
  name_zh: string
  name_en?: string
  multiplier?: number
  sort_order?: number
  is_default?: boolean
  is_active?: boolean
}

export interface ExchangeRateFormData {
  currency_code: string
  currency_name: string
  exchange_rate: number
  is_base_currency?: boolean
  is_active?: boolean
}

export interface TradeTermFormData {
  code: string
  name_zh: string
  name_en?: string
  description?: string
  sort_order?: number
  is_active?: boolean
}

export interface PaymentTermFormData {
  code: string
  name_zh: string
  name_en?: string
  days?: number
  description?: string
  sort_order?: number
  is_active?: boolean
}

export interface OrderStatusFormData {
  code: string
  name_zh: string
  name_en?: string
  color?: string
  sort_order?: number
  is_active?: boolean
}
