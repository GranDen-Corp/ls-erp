export interface Department {
  id: number
  department_code: string
  department_name: string
  department_name_en?: string
  description?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: number
  ls_employee_id: string
  name: string
  role: string
  department: string
  assigned_customers?: string[] // 分配的客戶ID陣列
  assigned_factories?: string[] // 分配的工廠ID陣列
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Customer {
  customer_id: string
  customer_name?: string
  customer_short_name?: string
  client_sales?: string // 關聯到 team_members.ls_employee_id
}

export interface Supplier {
  id: number
  supplier_name?: string
  supplier_short_name?: string
  quality_contact1?: string // 關聯到 team_members.ls_employee_id
  quality_contact2?: string // 關聯到 team_members.ls_employee_id
}

export interface TeamMemberWithRelations extends TeamMember {
  assigned_customers_data: Customer[] // 透過 assigned_customers 關聯的客戶
  assigned_factories_data: Supplier[] // 透過 assigned_factories 關聯的工廠
  sales_customers: Customer[] // 透過 client_sales 關聯的客戶 (1對1)
  qc_factories: Supplier[] // 透過 quality_contact1/2 關聯的工廠 (1對1)
}
