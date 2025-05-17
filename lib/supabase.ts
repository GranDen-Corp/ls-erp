import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Supabase URL和匿名密鑰
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 客戶端Supabase實例
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)
