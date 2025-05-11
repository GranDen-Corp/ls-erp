export interface Factory {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  country: string
  specialization: string[]
  capacity: number
  capacityUnit: string
  qualityRating: number
  status: "active" | "inactive"
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface FactoryFormData {
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  country: string
  specialization: string[]
  capacity: number
  capacityUnit: string
  qualityRating: number
  status: "active" | "inactive"
  notes?: string
}
