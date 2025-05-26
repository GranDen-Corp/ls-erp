export interface Customer {
  customer_id: string
  use_group_setting: boolean | string
  group_packaging_default: string
  order_packaging_display: string
  customer_short_name: string
  report_email: string
  customer_packaging: string
  group_code: string
  sales_representative: string
  division_location: string
  currency: string
  customer_full_name: string
  exchange_rate: number
  customer_address: string
  payment_due_date: string
  customer_phone: string
  invoice_address: string
  customer_fax: string
  invoice_email: string
  supplier_phone: string
  supplier_fax: string
  client_lead_person: string
  client_contact_person: string
  supplier_contact_person: string
  client_procurement: string
  client_sales: string
  logistics_coordinator: string
  labels: string
  pallet_format: string
  cbam_note: string
  sc_shipping_mark: string
  carton_format: string
  ship_to_address: string
  max_carton_weight: number
  payment_terms: string
  delivery_terms: string
  packing_info: string
  payment_condition: string
  qty_allowance_percent: number
  packaging_details: string
  report_type: string
  acceptance_percent: number
  require_report: boolean | string
  legacy_system_note: string
  payment_method: string
  delivery_method: string
}
