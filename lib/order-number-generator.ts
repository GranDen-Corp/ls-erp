import { createClient } from "@/lib/supabase-client"

/**
 * 生成訂單編號：YYMMXXXXX
 * 每月1日由00001開始續編，每月重新計算
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
      .order("order_id", { ascending: false })
      .limit(1)

    if (monthlyError) {
      console.error("查詢當月訂單失敗:", monthlyError)
      // 如果查詢失敗，使用時間戳作為備用方案
      const timestamp = now.getTime().toString().slice(-5)
      return `${yearMonth}${timestamp}`
    }

    // 計算下一個序號
    let nextSequence = 1
    if (monthlyOrders && monthlyOrders.length > 0) {
      // 嘗試從訂單編號中提取序號
      const latestOrderId = monthlyOrders[0].order_id
      console.log("最新訂單編號:", latestOrderId)

      // 檢查是否符合 YYMMXXXXX 格式
      const match = latestOrderId.match(/^(\d{4})(\d{5})$/)
      if (match && match[1] === yearMonth) {
        const currentSequence = Number.parseInt(match[2], 10)
        if (!isNaN(currentSequence)) {
          nextSequence = currentSequence + 1
          console.log("提取的序號:", currentSequence, "下一個序號:", nextSequence)
        }
      } else {
        console.log("訂單編號格式不符合 YYMMXXXXX，使用預設序號 1")
      }
    } else {
      console.log("當月無訂單，使用序號 1")
    }

    // 確保序號是5位數，不足前面補0
    const formattedSequence = String(nextSequence).padStart(5, "0")

    // 生成最終的訂單編號
    const newOrderNumber = `${yearMonth}${formattedSequence}`
    console.log("生成的訂單編號:", newOrderNumber)

    return newOrderNumber
  } catch (error) {
    console.error("生成訂單編號失敗:", error)
    // 備用方案：使用時間戳
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, "0")
    const timestamp = now.getTime().toString().slice(-5)
    return `${year}${month}${timestamp}`
  }
}

/**
 * 驗證訂單編號格式
 * @param orderNumber 訂單編號
 * @returns 是否符合格式
 */
export function validateOrderNumber(orderNumber: string): boolean {
  // 檢查是否為 YYMMXXXXX 格式 (9位數字)
  const regex = /^\d{4}\d{5}$/
  return regex.test(orderNumber)
}

/**
 * 檢查訂單編號是否已存在
 * @param orderNumber 訂單編號
 * @returns 是否已存在
 */
export async function checkOrderNumberExists(orderNumber: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("orders").select("order_id").eq("order_id", orderNumber).limit(1)

    if (error) {
      console.error("檢查訂單編號失敗:", error)
      return false
    }

    return data && data.length > 0
  } catch (error) {
    console.error("檢查訂單編號失敗:", error)
    return false
  }
}
