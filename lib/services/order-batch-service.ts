import { createClient } from "@/lib/supabase-client"

export interface OrderBatchItem {
  order_batch_id: string
  order_id: string
  product_index: string
  batch_number: number
  part_no: string
  description?: string
  quantity: number
  unit_price: number
  currency?: string
  is_assembly?: boolean
  specifications?: string
  remarks?: string
  discount?: number
  tax_rate?: number
  total_price?: number
  planned_ship_date?: Date | string
  status?: string
  tracking_number?: string
  actual_ship_date?: Date | string
  estimated_arrival_date?: Date | string
  customs_info?: any
  metadata?: any
}

/**
 * 創建訂單批次項目
 * @param items 訂單批次項目列表
 * @returns 成功/失敗結果
 */
export async function createOrderBatchItems(items: OrderBatchItem[]): Promise<{ success: boolean; error?: string }> {
  try {
    if (!items || items.length === 0) {
      return { success: true } // 沒有項目，視為成功
    }

    const supabase = createClient()

    // 準備插入的數據
    const insertData = items.map((item) => {
      // 確保日期格式正確
      const formattedItem: any = { ...item }

      if (formattedItem.planned_ship_date instanceof Date) {
        formattedItem.planned_ship_date = formattedItem.planned_ship_date.toISOString()
      }

      if (formattedItem.actual_ship_date instanceof Date) {
        formattedItem.actual_ship_date = formattedItem.actual_ship_date.toISOString()
      }

      if (formattedItem.estimated_arrival_date instanceof Date) {
        formattedItem.estimated_arrival_date = formattedItem.estimated_arrival_date.toISOString()
      }

      return formattedItem
    })

    // 插入數據
    const { error } = await supabase.from("order_batch").insert(insertData)

    if (error) {
      console.error("創建訂單批次項目失敗:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error("創建訂單批次項目時出錯:", err)
    return { success: false, error: err.message }
  }
}

/**
 * 獲取訂單的所有批次項目
 * @param orderId 訂單ID
 * @returns 訂單批次項目列表
 */
export async function getOrderBatchItemsByOrderId(
  orderId: string,
): Promise<{ success: boolean; data?: OrderBatchItem[]; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("order_batch")
      .select("*")
      .eq("order_id", orderId)
      .order("product_index", { ascending: true })
      .order("batch_number", { ascending: true })

    if (error) {
      console.error("獲取訂單批次項目失敗:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as OrderBatchItem[] }
  } catch (err: any) {
    console.error("獲取訂單批次項目時出錯:", err)
    return { success: false, error: err.message }
  }
}

/**
 * 更新訂單批次項目
 * @param orderBatchId 訂單批次項目ID
 * @param updates 更新的欄位
 * @returns 成功/失敗結果
 */
export async function updateOrderBatchItem(
  orderBatchId: string,
  updates: Partial<OrderBatchItem>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    // 確保日期格式正確
    const formattedUpdates: any = { ...updates }

    if (formattedUpdates.planned_ship_date instanceof Date) {
      formattedUpdates.planned_ship_date = formattedUpdates.planned_ship_date.toISOString()
    }

    if (formattedUpdates.actual_ship_date instanceof Date) {
      formattedUpdates.actual_ship_date = formattedUpdates.actual_ship_date.toISOString()
    }

    if (formattedUpdates.estimated_arrival_date instanceof Date) {
      formattedUpdates.estimated_arrival_date = formattedUpdates.estimated_arrival_date.toISOString()
    }

    const { error } = await supabase.from("order_batch").update(formattedUpdates).eq("order_batch_id", orderBatchId)

    if (error) {
      console.error("更新訂單批次項目失敗:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error("更新訂單批次項目時出錯:", err)
    return { success: false, error: err.message }
  }
}

/**
 * 刪除訂單批次項目
 * @param orderBatchId 訂單批次項目ID
 * @returns 成功/失敗結果
 */
export async function deleteOrderBatchItem(orderBatchId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("order_batch").delete().eq("order_batch_id", orderBatchId)

    if (error) {
      console.error("刪除訂單批次項目失敗:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error("刪除訂單批次項目時出錯:", err)
    return { success: false, error: err.message }
  }
}

/**
 * 將舊格式的 part_no_list 轉換為新的 order_batch 項目
 * @param orderId 訂單ID
 * @param partNoList 舊格式的 part_no_list
 * @returns 轉換後的 order_batch 項目列表
 */
export function convertOldFormatToOrderBatchItems(orderId: string, partNoList: any[]): OrderBatchItem[] {
  const batchItems: OrderBatchItem[] = []

  if (Array.isArray(partNoList)) {
    partNoList.forEach((item, productIndex) => {
      const productIndexLetter = String.fromCharCode(65 + productIndex) // A, B, C, ...

      // 檢查是否有批次信息
      if (item.shipment_batches && Array.isArray(item.shipment_batches)) {
        item.shipment_batches.forEach((batch: any, batchIndex: number) => {
          const batchNumber = batch.batch_number || batchIndex + 1

          batchItems.push({
            order_batch_id: `LS-${orderId}${productIndexLetter}-${batchNumber}`,
            order_id: orderId,
            product_index: productIndexLetter,
            batch_number: batchNumber,
            part_no: item.part_no || "",
            description: item.description || "",
            quantity: batch.quantity || 0,
            unit_price: item.unit_price || 0,
            currency: item.currency || "USD",
            is_assembly: item.is_assembly || false,
            specifications: item.specifications || null,
            remarks: item.remarks || null,
            discount: item.discount || 0,
            tax_rate: item.tax_rate || 0,
            total_price: item.total_price || 0,
            planned_ship_date: batch.planned_ship_date || null,
            status: batch.status || "pending",
            tracking_number: batch.tracking_number || null,
            actual_ship_date: batch.actual_ship_date || null,
            estimated_arrival_date: batch.estimated_arrival_date || null,
            customs_info: batch.customs_info || null,
            metadata: item.metadata || null,
          })
        })
      } else {
        // 如果沒有批次信息，創建一個默認批次
        batchItems.push({
          order_batch_id: `LS-${orderId}${productIndexLetter}-1`,
          order_id: orderId,
          product_index: productIndexLetter,
          batch_number: 1,
          part_no: item.part_no || "",
          description: item.description || "",
          quantity: item.quantity || 0,
          unit_price: item.unit_price || 0,
          currency: item.currency || "USD",
          is_assembly: item.is_assembly || false,
          specifications: item.specifications || null,
          remarks: item.remarks || null,
          discount: item.discount || 0,
          tax_rate: item.tax_rate || 0,
          total_price: item.total_price || 0,
          status: "pending",
          metadata: item.metadata || null,
        })
      }
    })
  }

  return batchItems
}
