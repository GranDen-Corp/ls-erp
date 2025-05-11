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
  groupTag?: string // 新增集團標籤字段
  notes?: string
  createdAt: string
  updatedAt: string
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
  groupTag?: string // 新增集團標籤字段
  notes?: string
}
