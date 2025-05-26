export interface StaticParameter {
  id: number
  category: string
  code: string
  name: string
  value: string
  description?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ExchangeRate {
  id: number
  currency_code: string
  currency_name: string
  currency_name_zh: string
  rate_to_usd: number
  is_base_currency: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TradeTerm {
  id: number
  code: string
  name_en: string
  name_zh: string
  description?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PaymentTerm {
  id: number
  code: string
  name_en: string
  name_zh: string
  description?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface OrderStatus {
  id: number
  status_code: number
  name_zh: string
  description?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface StaticParameterFormData {
  category: string
  code: string
  name: string
  value: string
  description?: string
  is_active: boolean
  sort_order: number
}

export interface ExchangeRateFormData {
  currency_code: string
  currency_name: string
  currency_name_zh: string
  rate_to_usd: number
  is_base_currency: boolean
  is_active: boolean
}

export interface TradeTermFormData {
  code: string
  name_en: string
  name_zh: string
  description?: string
  is_active: boolean
  sort_order: number
}

export interface PaymentTermFormData {
  code: string
  name_en: string
  name_zh: string
  description?: string
  is_active: boolean
  sort_order: number
}

export interface OrderStatusFormData {
  status_code: number
  name_zh: string
  description?: string
  is_active: boolean
  sort_order: number
}
