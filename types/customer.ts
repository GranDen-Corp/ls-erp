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
  groupTag?: string
  createdAt: string
  updatedAt: string
  notes?: string
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
