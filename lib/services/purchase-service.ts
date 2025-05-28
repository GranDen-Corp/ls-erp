import { createClient } from "@/lib/supabase-client"

export interface PurchaseItem {
  product_part_no: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  expected_delivery_date?: string
  notes?: string
  status?: string
}

export interface Purchase {
  purchase_id?: string
  order_id?: string
  supplier_id: string
  supplier_name: string
  status?: string
  issue_date?: string
  expected_delivery_date?: string
  payment_term?: string
  delivery_term?: string
  currency?: string
  total_amount: number
  notes?: string
  items: PurchaseItem[]
}

/**
 * 檢查訂單是否存在
 */
async function checkOrderExists(orderId: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("orders").select("order_id").eq("order_id", orderId).limit(1)

    if (error) {
      console.error("檢查訂單存在時出錯:", error)
      return false
    }

    return data && data.length > 0
  } catch (error) {
    console.error("檢查訂單存在時出錯:", error)
    return false
  }
}

/**
 * 創建新的採購單
 */
export async function createPurchase(purchase: Purchase) {
  try {
    // 檢查訂單ID是否存在
    if (purchase.order_id) {
      const orderExists = await checkOrderExists(purchase.order_id)
      if (!orderExists) {
        console.warn(`訂單 ${purchase.order_id} 不存在，將設置為 null`)
        purchase.order_id = null // 如果訂單不存在，設置為 null
      }
    }

    const supabase = createClient()

    // 1. 插入採購單主表數據
    const { data: purchaseData, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        purchase_id: purchase.purchase_id, // 如果為空，觸發器會自動生成
        order_id: purchase.order_id,
        supplier_id: purchase.supplier_id,
        supplier_name: purchase.supplier_name,
        status: purchase.status || "pending",
        issue_date: purchase.issue_date || new Date().toISOString().split("T")[0],
        expected_delivery_date: purchase.expected_delivery_date,
        payment_term: purchase.payment_term,
        delivery_term: purchase.delivery_term,
        currency: purchase.currency || "USD",
        total_amount: purchase.total_amount,
        notes: purchase.notes,
      })
      .select("purchase_sid, purchase_id")
      .single()

    if (purchaseError) {
      throw new Error(`創建採購單失敗: ${purchaseError.message}`)
    }

    // 2. 插入採購單明細
    if (purchase.items && purchase.items.length > 0) {
      const purchaseItems = purchase.items.map((item) => ({
        purchase_sid: purchaseData.purchase_sid,
        product_part_no: item.product_part_no,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        expected_delivery_date: item.expected_delivery_date || purchase.expected_delivery_date,
        status: item.status || "pending",
        notes: item.notes,
      }))

      const { error: itemsError } = await supabase.from("purchase_items").insert(purchaseItems)

      if (itemsError) {
        throw new Error(`創建採購單明細失敗: ${itemsError.message}`)
      }
    }

    return {
      success: true,
      purchase_id: purchaseData.purchase_id,
      purchase_sid: purchaseData.purchase_sid,
    }
  } catch (error: any) {
    console.error("創建採購單時出錯:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * 獲取採購單列表
 */
export async function getPurchases(filters?: {
  status?: string
  supplier_id?: string
  order_id?: string
  from_date?: string
  to_date?: string
}) {
  try {
    const supabase = createClient()
    let query = supabase.from("purchases").select("*")

    // 應用過濾條件
    if (filters) {
      if (filters.status) {
        query = query.eq("status", filters.status)
      }
      if (filters.supplier_id) {
        query = query.eq("supplier_id", filters.supplier_id)
      }
      if (filters.order_id) {
        query = query.eq("order_id", filters.order_id)
      }
      if (filters.from_date) {
        query = query.gte("issue_date", filters.from_date)
      }
      if (filters.to_date) {
        query = query.lte("issue_date", filters.to_date)
      }
    }

    // 按創建時間降序排序
    query = query.order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) {
      throw new Error(`獲取採購單列表失敗: ${error.message}`)
    }

    return {
      success: true,
      data,
    }
  } catch (error: any) {
    console.error("獲取採購單列表時出錯:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * 獲取採購單詳情，包括明細
 */
export async function getPurchaseDetails(purchaseId: string) {
  try {
    const supabase = createClient()

    // 1. 獲取採購單主表數據
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .select("*")
      .eq("purchase_id", purchaseId)
      .single()

    if (purchaseError) {
      throw new Error(`獲取採購單詳情失敗: ${purchaseError.message}`)
    }

    // 2. 獲取採購單明細
    const { data: items, error: itemsError } = await supabase
      .from("purchase_items")
      .select("*")
      .eq("purchase_sid", purchase.purchase_sid)
      .order("item_sid", { ascending: true })

    if (itemsError) {
      throw new Error(`獲取採購單明細失敗: ${itemsError.message}`)
    }

    return {
      success: true,
      data: {
        ...purchase,
        items: items || [],
      },
    }
  } catch (error: any) {
    console.error("獲取採購單詳情時出錯:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * 更新採購單狀態
 */
export async function updatePurchaseStatus(purchaseId: string, status: string, notes?: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("purchases")
      .update({
        status,
        notes: notes ? `${notes}\n[${new Date().toISOString()}] 狀態更新為: ${status}` : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("purchase_id", purchaseId)
      .select("purchase_sid")
      .single()

    if (error) {
      throw new Error(`更新採購單狀態失敗: ${error.message}`)
    }

    return {
      success: true,
      purchase_sid: data.purchase_sid,
    }
  } catch (error: any) {
    console.error("更新採購單狀態時出錯:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * 從採購資料編輯器數據創建採購單
 */
export async function createPurchasesFromProcurementItems(procurementItems: any[], orderId: string) {
  try {
    // 檢查訂單ID是否存在
    const orderExists = await checkOrderExists(orderId)
    if (!orderExists) {
      console.warn(`訂單 ${orderId} 不存在，將創建不關聯訂單的採購單`)
      orderId = null // 如果訂單不存在，設置為 null
    }

    // 按供應商分組
    const itemsBySupplier: Record<string, any[]> = {}

    procurementItems.forEach((item) => {
      if (!item.isSelected || !item.factoryId) return

      if (!itemsBySupplier[item.factoryId]) {
        itemsBySupplier[item.factoryId] = []
      }

      itemsBySupplier[item.factoryId].push(item)
    })

    const results = []

    // 為每個供應商創建採購單
    for (const supplierId in itemsBySupplier) {
      const items = itemsBySupplier[supplierId]
      const firstItem = items[0]

      // 計算總金額
      const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0)

      // 準備採購單數據
      const purchase: Purchase = {
        order_id: orderId,
        supplier_id: supplierId,
        supplier_name: firstItem.factoryName,
        status: "pending",
        issue_date: new Date().toISOString().split("T")[0],
        expected_delivery_date: firstItem.deliveryDate
          ? new Date(firstItem.deliveryDate).toISOString().split("T")[0]
          : undefined,
        payment_term: firstItem.paymentTerm,
        delivery_term: firstItem.deliveryTerm,
        currency: "USD",
        total_amount: totalAmount,
        notes: orderId ? `從訂單 ${orderId} 自動生成的採購單` : "自動生成的採購單",
        items: items.map((item) => ({
          product_part_no: item.productPartNo,
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.purchasePrice,
          total_price: item.quantity * item.purchasePrice,
          expected_delivery_date: item.deliveryDate
            ? new Date(item.deliveryDate).toISOString().split("T")[0]
            : undefined,
          notes: item.notes,
          status: "pending",
        })),
      }

      // 創建採購單
      const result = await createPurchase(purchase)
      results.push(result)
    }

    return {
      success: true,
      results,
    }
  } catch (error: any) {
    console.error("從採購資料創建採購單時出錯:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * 從新的採購產品列表創建採購單
 */
export async function createPurchasesFromProcurementProductItems(procurementProductItems: any[], orderId: string) {
  try {
    // 檢查訂單ID是否存在
    const orderExists = await checkOrderExists(orderId)
    if (!orderExists) {
      console.warn(`訂單 ${orderId} 不存在，將創建不關聯訂單的採購單`)
      orderId = null
    }

    // 按供應商分組
    const itemsBySupplier: Record<string, any[]> = {}

    procurementProductItems.forEach((item) => {
      if (!item.isSelected || !item.supplierId) return

      if (!itemsBySupplier[item.supplierId]) {
        itemsBySupplier[item.supplierId] = []
      }

      itemsBySupplier[item.supplierId].push(item)
    })

    const results = []

    // 為每個供應商創建採購單
    for (const supplierId in itemsBySupplier) {
      const items = itemsBySupplier[supplierId]
      const firstItem = items[0]

      // 計算總金額
      const totalAmount = items.reduce((sum, item) => {
        const actualQuantity = item.procurementQuantity * getUnitMultiplier(item.procurementUnit)
        return sum + (actualQuantity * item.procurementUnitPrice)
      }, 0)

      // 準備採購單數據
      const purchase: Purchase = {
        order_id: orderId,
        supplier_id: supplierId,
        supplier_name: firstItem.supplierName,
        status: "pending",
        issue_date: new Date().toISOString().split("T")[0],
        expected_delivery_date: firstItem.expectedDeliveryDate
          ? new Date(firstItem.expectedDeliveryDate).toISOString().split("T")[0]
          : undefined,
        currency: firstItem.procurementCurrency || "USD",
        total_amount: totalAmount,
        notes: orderId ? `從訂單 ${orderId} 自動生成的採購單` : "自動生成的採購單",
        items: items.map((item) => {
          const actualQuantity = item.procurementQuantity * getUnitMultiplier(item.procurementUnit)
          return {
            product_part_no: item.productPartNo,
            product_name: item.productName,
            quantity: actualQuantity, // 使用實際數量（PCS）
            unit_price: item.procurementUnitPrice,
            total_price: actualQuantity * item.procurementUnitPrice,
            expected_delivery_date: item.expectedDeliveryDate
              ? new Date(item.expectedDeliveryDate).toISOString().split("T")[0]
              : undefined,
            notes: item.notes,
            status: "pending",
          }
        }),
      }

      // 創建採購單
      const result = await createPurchase(purchase)
      results.push(result)
    }

    return {
      success: true,
      results,
    }
  } catch (error: any) {
    console.error("從採購產品列表創建採購單時出錯:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// 輔助函數：獲取單位乘數（需要根據實際的單位系統調整）
function getUnitMultiplier(unit: string): number {
  switch (unit) {
    case "KPCS":
      return 1000
    case "HPCS":
      return 100
    case "TPCS":
      return 10
    case "PCS":
    case "MPCS":
    default:
      return 1
  }
}

/**
 * 創建採購訂單 (alias for createPurchase for backward compatibility)
 */
export const createPurchaseOrder = createPurchase
