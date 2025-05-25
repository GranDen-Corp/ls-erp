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
