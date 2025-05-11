import { createClient } from "@supabase/supabase-js"

// 創建單例模式的Supabase客戶端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 客戶端Supabase實例
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// 伺服器端Supabase實例（用於伺服器組件和Server Actions）
export const createServerSupabaseClient = () => {
  return createClient(
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
