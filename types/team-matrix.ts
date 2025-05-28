export interface Department {
  id: number
  department_code: string
  department_name: string
  description?: string
  is_active: boolean
  sort_order?: number
  created_at?: string
  updated_at?: string
}

export interface TeamMember {
  id: number
  ls_employee_id: string
  name: string
  role: string
  department: string
  assigned_customers?: string[]
  assigned_factories?: string[]
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Customer {
  customer_id: string
  customer_short_name?: string
  customer_name?: string
  represent_sales?: string
  client_sales?: string
}

export interface Supplier {
  id?: string
  factory_id?: string
  name?: string
  factory_name?: string
  supplier_name?: string
  short_name?: string
  factory_short_name?: string
  supplier_short_name?: string
  quality_contact1?: string
  quality_contact2?: string
}

export interface TeamMemberWithRelations extends TeamMember {
  assigned_customers_data: Customer[]
  assigned_factories_data: Supplier[]
  sales_customers: Customer[]
  qc_factories: Supplier[]
}
