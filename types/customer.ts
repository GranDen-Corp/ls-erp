export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  notes?: string
  created_at: string
  updated_at: string
  payment_terms?: string
}
