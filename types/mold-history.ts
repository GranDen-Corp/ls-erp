export interface MoldMaintenanceRecord {
  id: string
  date: string
  type: "maintenance" | "repair" | "modification" | "inspection"
  description: string
  cost: number
  performedBy: string
  result: "passed" | "failed" | "pending" | "completed"
}

export interface MoldUsageRecord {
  id: string
  date: string
  orderNumber: string
  productQuantity: number
  cycleCount: number
  operator: string
  notes: string
}

export interface MoldHistoryRecord {
  id: string
  date: string
  type: "creation" | "modification" | "maintenance" | "usage" | "return" | "retirement"
  description: string
  performedBy: string
  cost?: number
  documents?: string[]
}

export interface MoldData {
  id: string
  productId: string
  moldNumber: string
  manufacturer: string
  creationDate: string
  material: string
  cavities: number
  dimensions: string
  weight: number
  location: string
  status: "active" | "maintenance" | "retired" | "returned"
  cost: number
  refundableQuantity: number
  returnedDate?: string
  expectedLifespan: number
  currentCycleCount: number
  maxCycleCount: number
  maintenanceRecords: MoldMaintenanceRecord[]
  usageRecords: MoldUsageRecord[]
  historyRecords: MoldHistoryRecord[]
  notes: string
}
