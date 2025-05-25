"use server"

import { createServerSupabaseClient } from "@/lib/supabase-client"
import { revalidatePath } from "next/cache"
import type { StaticParameterFormData, ExchangeRateFormData } from "@/types/settings"

// 靜態參數相關操作
export async function getStaticParameters() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("static_parameters")
    .select("*")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching static parameters:", error)
    return []
  }

  return data
}

export async function createStaticParameter(formData: StaticParameterFormData) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("static_parameters").insert([formData])

  if (error) {
    console.error("Error creating static parameter:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function updateStaticParameter(id: number, formData: StaticParameterFormData) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("static_parameters").update(formData).eq("id", id)

  if (error) {
    console.error("Error updating static parameter:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function deleteStaticParameter(id: number) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("static_parameters").delete().eq("id", id)

  if (error) {
    console.error("Error deleting static parameter:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function toggleStaticParameterStatus(id: number, isActive: boolean) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("static_parameters").update({ is_active: isActive }).eq("id", id)

  if (error) {
    console.error("Error toggling static parameter status:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

// 匯率相關操作
export async function getExchangeRates() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("exchange_rates").select("*").order("currency_code", { ascending: true })

  if (error) {
    console.error("Error fetching exchange rates:", error)
    return []
  }

  return data
}

export async function createExchangeRate(formData: ExchangeRateFormData) {
  const supabase = createServerSupabaseClient()

  // 如果設置為基準貨幣，先將其他貨幣的基準狀態設為 false
  if (formData.is_base_currency) {
    await supabase
      .from("exchange_rates")
      .update({ is_base_currency: false })
      .neq("currency_code", formData.currency_code)
  }

  const { error } = await supabase.from("exchange_rates").insert([formData])

  if (error) {
    console.error("Error creating exchange rate:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function updateExchangeRate(id: number, formData: ExchangeRateFormData) {
  const supabase = createServerSupabaseClient()

  // 如果設置為基準貨幣，先將其他貨幣的基準狀態設為 false
  if (formData.is_base_currency) {
    await supabase.from("exchange_rates").update({ is_base_currency: false }).neq("id", id)
  }

  const { error } = await supabase.from("exchange_rates").update(formData).eq("id", id)

  if (error) {
    console.error("Error updating exchange rate:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function deleteExchangeRate(id: number) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("exchange_rates").delete().eq("id", id)

  if (error) {
    console.error("Error deleting exchange rate:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function toggleExchangeRateStatus(id: number, isActive: boolean) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("exchange_rates").update({ is_active: isActive }).eq("id", id)

  if (error) {
    console.error("Error toggling exchange rate status:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function setBaseCurrency(id: number) {
  const supabase = createServerSupabaseClient()

  // 先將所有貨幣的基準狀態設為 false
  await supabase.from("exchange_rates").update({ is_base_currency: false })

  // 然後設置指定貨幣為基準貨幣
  const { error } = await supabase.from("exchange_rates").update({ is_base_currency: true }).eq("id", id)

  if (error) {
    console.error("Error setting base currency:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}
