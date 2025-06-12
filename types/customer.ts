export interface Customer {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  country: string
  paymentTerms: string
  creditLimit: number
  currency: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  notes?: string

  // 基本資訊
  customer_id?: string
  customer_short_name?: string
  customer_full_name?: string
  group_code?: string
  division_location?: string
  use_group_setting?: boolean

  // 聯絡資訊
  customer_phone?: string
  customer_fax?: string
  report_email?: string
  invoice_email?: string
  customer_address?: string
  invoice_address?: string
  ship_to_address?: string
  client_lead_person?: string
  client_contact_person?: string
  client_contact_person_email?: string
  client_procurement?: string
  client_sales?: string
  sales_representative?: string
  represent_sales?: string
  logistics_coordinator?: string

  // 財務資訊
  exchange_rate?: number
  payment_due_date?: string
  payment_term?: string
  payment_condition?: string
  delivery_terms?: string

  // 包裝與出貨
  group_packaging_default?: string
  order_packaging_display?: string
  customer_packaging?: string
  packaging_details?: string
  packing_info?: string
  pallet_format?: string
  carton_format?: string
  max_carton_weight?: number
  sc_shipping_mark?: string
  labels?: string
  port_of_discharge_default?: string

  // 品質與報告
  qty_allowance_percent?: number
  acceptance_percent?: number
  report_type?: string
  require_report?: boolean
  cbam_note?: string
  legacy_system_note?: string

  // 新增欄位
  forwarder?: string
  remarks?: string
}

export interface CustomerFormData {
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  country: string
  paymentTerms: string
  creditLimit: number
  currency: string
  status: "active" | "inactive"
  groupTag?: string
  notes?: string
}
