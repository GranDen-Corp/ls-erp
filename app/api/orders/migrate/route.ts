import { type NextRequest, NextResponse } from "next/server"
import { migrateOrderData } from "@/scripts/migrate-order-data"

export async function POST(request: NextRequest) {
  try {
    // 執行遷移
    const result = await migrateOrderData()

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("遷移訂單數據時出錯:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
