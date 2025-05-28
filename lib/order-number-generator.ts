import { createClient } from "@/lib/supabase-client"

/**
 * 生成訂單編號：L-YYMMXXXXX
 * 每月1日重置編號
 */
export async function generateOrderNumber(): Promise<string> {
  try {
    const supabase = createClient()
    const now = new Date()

    // 獲取台北時間 (UTC+8)
    const taipeiTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
    const year = taipeiTime.getUTCFullYear()
    const shortYear = year.toString().slice(-2) // 取年份的最後兩位數字
    const month = String(taipeiTime.getUTCMonth() + 1).padStart(2, "0")
    const yearMonth = `${shortYear}${month}` // YYMM 格式

    // 計算當月的1日 (台北時間)
    const startOfMonth = new Date(year, taipeiTime.getUTCMonth(), 1)
    const startOfMonthISO = startOfMonth.toISOString()

    console.log("訂單編號生成 - 當月開始日期:", startOfMonthISO)

    // 查詢當月已有的訂單數量
    const { data: monthlyOrders, error: monthlyError } = await supabase
      .from("orders")
      .select("order_id")
      .gte("created_at", startOfMonthISO)
      .like("order_id", `L-${yearMonth}%`)
      .order("order_id", { ascending: false })

    if (monthlyError) {
      console.error("查詢當月訂單失敗:", monthlyError)
      // 如果查詢失敗，使用時間戳作為備用方案
      const timestamp = now.getTime().toString().slice(-5)
      return `L-${yearMonth}${timestamp}`
    }

    // 計算下一個序號
    let nextSequence = 1
    if (monthlyOrders && monthlyOrders.length > 0) {
      // 從最新的訂單編號中提取序號
      const latestOrderId = monthlyOrders[0].order_id
      const sequencePart = latestOrderId.substring(latestOrderId.length - 5)
      const currentSequence = Number.parseInt(sequencePart, 10)
      nextSequence = currentSequence + 1
    }

    // 確保序號是5位數，不足前面補0
    const formattedSequence = String(nextSequence).padStart(5, "0")

    // 生成最終的訂單編號
    const newOrderNumber = `L-${yearMonth}${formattedSequence}`
    console.log("生成的訂單編號:", newOrderNumber)

    return newOrderNumber
  } catch (error) {
    console.error("生成訂單編號失敗:", error)
    // 備用方案：使用時間戳
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, "0")
    const timestamp = now.getTime().toString().slice(-5)
    return `L-${year}${month}${timestamp}`
  }
}
