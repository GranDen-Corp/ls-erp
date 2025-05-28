export interface TeamMember {
  id: number
  created_at: string
  updated_at: string
  name: string
  email: string
  phone: string
  title: string
  department: string
  location: string
  status: string
  role: string
}

export interface TeamMemberWithRelations extends TeamMember {
  assigned_customers_data: any[]
  assigned_factories_data: any[]
  sales_customers: any[]
  shipping_customers: any[]
  qc_factories: any[]
}
