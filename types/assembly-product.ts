// 組合產品相關類型定義
export interface ProductComponent {
  id: string
  productId: string
  productName: string
  productPN: string
  quantity: number
  unitPrice: number
  factoryId: string
  factoryName: string
  specifications?: Array<{ name: string; value: string }>
}

export interface AssemblyProduct {
  id: string
  productId: string
  isAssembly: boolean
  components: ProductComponent[]
  assemblyTime: number // 以分鐘為單位
  assemblyCostPerHour: number
  packagingCost: number
  additionalCosts: number
  profitMargin: number // 以百分比表示
}

export interface AssemblyCostBreakdown {
  componentsCost: number
  laborCost: number
  packagingCost: number
  otherCosts: number
  totalCost: number
  suggestedPrice: number
}
