import { createClient } from "@/lib/supabase-client"

/**
 * 生成訂單編號：L-YYYYMMDD-XXXXX
 * 每年1月1日重置編號
 */
export async function generateOrderNumber(): Promise<string> {
  const supabase = createClient()
  const now = new Date()

  // 獲取台北時間 (UTC+8)
  const taipeiTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  const year = taipeiTime.getUTCFullYear()
  const month = String(taipeiTime.getUTCMonth() + 1).padStart(2, "0")
  const day = String(taipeiTime.getUTCDate()).padStart(2, "0")
  const dateString = `${year}${month}${day}`

  // 計算當年的1月1日 (台北時間)
  const startOfYear = new Date(Date.UTC(year, 0, 1, -8, 0, 0, 0)) // UTC-8 = 台北時間的1月1日00:00

  // 查詢當年的第一個訂單的 order_sid
  const { data: firstOrderOfYear, error: firstOrderError } = await supabase
    .from("orders")
    .select("order_sid")
    .gte("created_at", startOfYear.toISOString())
    .order("order_sid", { ascending: true })
    .limit(1)
    .single()

  if (firstOrderError && firstOrderError.code !== "PGRST116") {
    // PGRST116 是 "結果為空" 的錯誤碼
    console.error("獲取年度第一個訂單失敗:", firstOrderError)
    throw new Error(`獲取年度第一個訂單失敗: ${firstOrderError.message}`)
  }

  // 獲取最新的訂單 order_sid
  const { data: latestOrder, error: latestOrderError } = await supabase
    .from("orders")
    .select("order_sid")
    .order("order_sid", { ascending: false })
    .limit(1)
    .single()

  if (latestOrderError) {
    console.error("獲取最新訂單失敗:", latestOrderError)
    throw new Error(`獲取最新訂單失敗: ${latestOrderError.message}`)
  }

  let sequenceNumber = 1 // 默認從1開始

  if (firstOrderOfYear) {
    // 如果當年有訂單，計算當前訂單在本年度的序號
    const firstSidOfYear = firstOrderOfYear.order_sid
    const latestSid = latestOrder.order_sid
    sequenceNumber = latestSid - firstSidOfYear + 2 // +2 是因為我們要的是下一個編號，而且從1開始計數
  }

  // 確保序號是5位數，不足前面補0
  const formattedSequence = String(sequenceNumber).padStart(5, "0")

  // 生成最終的訂單編號
  return `L-${dateString}-${formattedSequence}`
}

/**
 * 從訂單編號解析出年份
 */
export function getYearFromOrderNumber(orderNumber: string): number | null {
  const match = orderNumber.match(/L-(\d{4})(\d{2})(\d{2})-\d+/)
  if (match) {
    return Number.parseInt(match[1], 10)
  }
  return null
}

/**
 * 從訂單編號解析出序號
 */
export function getSequenceFromOrderNumber(orderNumber: string): number | null {
  const match = orderNumber.match(/L-\d{8}-(\d+)/)
  if (match) {
    return Number.parseInt(match[1], 10)
  }
  return null
}
