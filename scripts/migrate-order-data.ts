import { createClient } from "@/lib/supabase-client"
import { convertOldFormatToOrderBatchItems, createOrderBatchItems } from "@/lib/services/order-batch-service"

/**
 * 遷移訂單數據 - 將舊的JSON格式轉換為新的關聯式資料表結構
 */
export async function migrateOrderData() {
  try {
    const supabase = createClient()

    // 獲取所有訂單
    const { data: orders, error } = await supabase.from("orders").select("*").order("order_sid", { ascending: true })

    if (error) {
      console.error("獲取訂單失敗:", error)
      return { success: false, error: error.message }
    }

    if (!orders || orders.length === 0) {
      console.log("沒有訂單需要遷移")
      return { success: true, migrated: 0 }
    }

    console.log(`開始遷移 ${orders.length} 筆訂單數據...`)

    let migratedCount = 0
    let errorCount = 0

    // 遍歷每個訂單
    for (const order of orders) {
      try {
        // 檢查是否有part_no_list
        if (!order.part_no_list) {
          console.log(`訂單 ${order.order_id} 沒有part_no_list，跳過`)
          continue
        }

        // 解析part_no_list
        let partNoList
        try {
          partNoList = typeof order.part_no_list === "string" ? JSON.parse(order.part_no_list) : order.part_no_list
        } catch (parseError) {
          console.error(`解析訂單 ${order.order_id} 的part_no_list失敗:`, parseError)
          errorCount++
          continue
        }

        // 轉換為新格式
        const batchItems = convertOldFormatToOrderBatchItems(order.order_id, partNoList)

        if (batchItems.length === 0) {
          console.log(`訂單 ${order.order_id} 沒有有效的批次項目，跳過`)
          continue
        }

        // 創建批次項目
        const result = await createOrderBatchItems(batchItems)

        if (!result.success) {
          console.error(`創建訂單 ${order.order_id} 的批次項目失敗:`, result.error)
          errorCount++
          continue
        }

        migratedCount++
        console.log(`成功遷移訂單 ${order.order_id}，共 ${batchItems.length} 個批次項目`)
      } catch (orderError) {
        console.error(`處理訂單 ${order.order_id} 時出錯:`, orderError)
        errorCount++
      }
    }

    console.log(`遷移完成，成功: ${migratedCount}，失敗: ${errorCount}`)

    return {
      success: true,
      migrated: migratedCount,
      errors: errorCount,
    }
  } catch (err: any) {
    console.error("遷移訂單數據時出錯:", err)
    return { success: false, error: err.message }
  }
}

// 如果直接執行此腳本
if (typeof window === "undefined" && require.main === module) {
  migrateOrderData()
    .then((result) => {
      console.log("遷移結果:", result)
      process.exit(0)
    })
    .catch((err) => {
      console.error("遷移失敗:", err)
      process.exit(1)
    })
}
