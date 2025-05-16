import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Supabase URL和匿名密鑰
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 客戶端Supabase實例 - 保留這個導出以兼容現有代碼
export const supabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// 創建Supabase客戶端的函數 - 單例模式
let clientInstance: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (clientInstance) return clientInstance

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("缺少Supabase環境變量")
  }

  clientInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: true,
    },
  })

  return clientInstance
}

// 伺服器端Supabase實例（用於伺服器組件和Server Actions）
export const createServerSupabaseClient = () => {
  return createSupabaseClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
    },
  )
}
