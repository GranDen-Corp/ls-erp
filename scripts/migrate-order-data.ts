import { createClient } from "@supabase/supabase-js"

// 初始化 Supabase 客戶端
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

interface OrderMigrationOptions {
  batchSize?: number
  dryRun?: boolean
  startDate?: string
  endDate?: string
}

interface MigrationResult {
  success: boolean
  migratedCount: number
  errorCount: number
  errors: string[]
}

export async function migrateOrderData(options: OrderMigrationOptions = {}): Promise<MigrationResult> {
  const { batchSize = 100, dryRun = false, startDate, endDate } = options

  const result: MigrationResult = {
    success: false,
    migratedCount: 0,
    errorCount: 0,
    errors: [],
  }

  try {
    console.log("開始訂單資料遷移...")
    console.log("選項:", { batchSize, dryRun, startDate, endDate })

    // 構建查詢條件
    let query = supabase.from("orders").select("*")

    if (startDate) {
      query = query.gte("created_at", startDate)
    }

    if (endDate) {
      query = query.lte("created_at", endDate)
    }

    // 獲取需要遷移的訂單
    const { data: orders, error: fetchError } = await query.order("created_at", { ascending: true }).limit(batchSize)

    if (fetchError) {
      result.errors.push(`獲取訂單資料失敗: ${fetchError.message}`)
      return result
    }

    if (!orders || orders.length === 0) {
      console.log("沒有找到需要遷移的訂單")
      result.success = true
      return result
    }

    console.log(`找到 ${orders.length} 筆訂單需要遷移`)

    // 處理每筆訂單
    for (const order of orders) {
      try {
        if (dryRun) {
          console.log(`[DRY RUN] 將遷移訂單: ${order.order_number}`)
          result.migratedCount++
        } else {
          // 執行實際的遷移邏輯
          await migrateOrderRecord(order)
          result.migratedCount++
          console.log(`成功遷移訂單: ${order.order_number}`)
        }
      } catch (error) {
        const errorMessage = `遷移訂單 ${order.order_number} 失敗: ${error instanceof Error ? error.message : String(error)}`
        result.errors.push(errorMessage)
        result.errorCount++
        console.error(errorMessage)
      }
    }

    result.success = result.errorCount === 0
    console.log(`遷移完成: 成功 ${result.migratedCount} 筆, 失敗 ${result.errorCount} 筆`)

    return result
  } catch (error) {
    const errorMessage = `訂單資料遷移過程中發生錯誤: ${error instanceof Error ? error.message : String(error)}`
    result.errors.push(errorMessage)
    console.error(errorMessage)
    return result
  }
}

async function migrateOrderRecord(order: any): Promise<void> {
  // 這裡實現具體的訂單遷移邏輯
  // 例如：更新欄位格式、修正資料結構等

  const updates: any = {}

  // 示例：標準化訂單狀態
  if (order.status && typeof order.status === "string") {
    updates.status = order.status.toLowerCase().trim()
  }

  // 示例：確保日期格式正確
  if (order.order_date && !order.order_date.includes("T")) {
    updates.order_date = new Date(order.order_date).toISOString()
  }

  // 示例：更新產品資料結構
  if (order.products && Array.isArray(order.products)) {
    updates.products = order.products.map((product: any) => ({
      ...product,
      // 添加缺少的欄位或修正格式
      unit_price: Number.parseFloat(product.unit_price) || 0,
      quantity: Number.parseInt(product.quantity) || 0,
    }))
  }

  // 如果有需要更新的欄位，執行更新
  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from("orders").update(updates).eq("id", order.id)

    if (error) {
      throw new Error(`更新訂單失敗: ${error.message}`)
    }
  }
}

// 導出額外的輔助函數
export async function validateOrderData(): Promise<{ valid: number; invalid: number; issues: string[] }> {
  const result = { valid: 0, invalid: 0, issues: [] as string[] }

  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, order_number, status, order_date, products")

    if (error) {
      result.issues.push(`獲取訂單資料失敗: ${error.message}`)
      return result
    }

    for (const order of orders || []) {
      let isValid = true

      // 檢查必要欄位
      if (!order.order_number) {
        result.issues.push(`訂單 ${order.id} 缺少訂單編號`)
        isValid = false
      }

      if (!order.status) {
        result.issues.push(`訂單 ${order.order_number || order.id} 缺少狀態`)
        isValid = false
      }

      if (!order.order_date) {
        result.issues.push(`訂單 ${order.order_number || order.id} 缺少訂單日期`)
        isValid = false
      }

      if (isValid) {
        result.valid++
      } else {
        result.invalid++
      }
    }
  } catch (error) {
    result.issues.push(`驗證過程中發生錯誤: ${error instanceof Error ? error.message : String(error)}`)
  }

  return result
}

export default migrateOrderData
