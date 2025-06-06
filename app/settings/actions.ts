"use server"

import { createServerSupabaseClient } from "@/lib/supabase-client"
import { revalidatePath } from "next/cache"
import type {
  StaticParameterFormData,
  ExchangeRateFormData,
  TradeTermFormData,
  PaymentTermFormData,
  OrderStatusFormData,
} from "@/types/settings"

export async function getPorts() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("ports")
    .select("*")
    .order("region", { ascending: true })
    .order("port_name_zh", { ascending: true })

  if (error) {
    console.error("Error fetching ports:", error)
    return []
  }

  return data || []
}

// Static parameter CRUD operations
export async function getStaticParameters() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("unit_setting")
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

  // If setting as default unit, first set all other units to non-default
  if (formData.is_default && formData.category === "product_unit") {
    await supabase.from("unit_setting").update({ is_default: false }).eq("category", "product_unit")
  }

  const { error } = await supabase.from("unit_setting").insert([formData])

  if (error) {
    console.error("Error creating static parameter:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function updateStaticParameter(id: number, formData: StaticParameterFormData) {
  const supabase = createServerSupabaseClient()

  // If setting as default unit, first set all other units to non-default
  if (formData.is_default && formData.category === "product_unit") {
    await supabase.from("unit_setting").update({ is_default: false }).eq("category", "product_unit").neq("id", id)
  }

  const { error } = await supabase.from("unit_setting").update(formData).eq("id", id)

  if (error) {
    console.error("Error updating static parameter:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function deleteStaticParameter(id: number) {
  const supabase = createServerSupabaseClient()

  // Check if it's a default unit, don't allow deletion
  const { data } = await supabase.from("unit_setting").select("is_default").eq("id", id).single()
  if (data?.is_default) {
    return { success: false, error: "預設單位不能刪除，請先設置其他單位為預設" }
  }

  const { error } = await supabase.from("unit_setting").delete().eq("id", id)

  if (error) {
    console.error("Error deleting static parameter:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function toggleStaticParameterStatus(id: number, isActive: boolean) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("unit_setting").update({ is_active: isActive }).eq("id", id)

  if (error) {
    console.error("Error toggling static parameter status:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function setDefaultUnit(id: number) {
  const supabase = createServerSupabaseClient()

  try {
    // Clear all default units first
    const { error: clearError } = await supabase
      .from("unit_setting")
      .update({ is_default: false })
      .eq("category", "product_unit")

    if (clearError) {
      console.error("Error clearing default units:", clearError)
      return { success: false, error: clearError.message }
    }

    // Set the specified unit as default
    const { error: setError } = await supabase.from("unit_setting").update({ is_default: true }).eq("id", id)

    if (setError) {
      console.error("Error setting default unit:", setError)
      return { success: false, error: setError.message }
    }

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error in setDefaultUnit:", error)
    return { success: false, error: "發生未知錯誤" }
  }
}

// Exchange rate CRUD operations
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

  // If setting as base currency, clear other base currencies
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

  // If setting as base currency, clear other base currencies
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

  // Clear all base currencies first
  await supabase.from("exchange_rates").update({ is_base_currency: false })

  // Set the specified currency as base
  const { error } = await supabase.from("exchange_rates").update({ is_base_currency: true }).eq("id", id)

  if (error) {
    console.error("Error setting base currency:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

// Trade terms CRUD operations
export async function getTradeTerms() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("trade_terms").select("*").order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching trade terms:", error)
    return []
  }

  return data
}

export async function createTradeTerm(formData: TradeTermFormData) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("trade_terms").insert([formData])

  if (error) {
    console.error("Error creating trade term:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function updateTradeTerm(id: number, formData: TradeTermFormData) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("trade_terms").update(formData).eq("id", id)

  if (error) {
    console.error("Error updating trade term:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function deleteTradeTerm(id: number) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("trade_terms").delete().eq("id", id)

  if (error) {
    console.error("Error deleting trade term:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function toggleTradeTermStatus(id: number, isActive: boolean) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("trade_terms").update({ is_active: !isActive }).eq("id", id)

  if (error) {
    console.error("Error toggling trade term status:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

// Payment terms CRUD operations
export async function getPaymentTerms() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("payment_terms").select("*").order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching payment terms:", error)
    return []
  }

  return data
}

export async function createPaymentTerm(formData: PaymentTermFormData) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("payment_terms").insert([formData])

  if (error) {
    console.error("Error creating payment term:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function updatePaymentTerm(id: number, formData: PaymentTermFormData) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("payment_terms").update(formData).eq("id", id)

  if (error) {
    console.error("Error updating payment term:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function deletePaymentTerm(id: number) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("payment_terms").delete().eq("id", id)

  if (error) {
    console.error("Error deleting payment term:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function togglePaymentTermStatus(id: number, isActive: boolean) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("payment_terms").update({ is_active: !isActive }).eq("id", id)

  if (error) {
    console.error("Error toggling payment term status:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

// Order status CRUD operations
export async function getOrderStatuses() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("order_statuses").select("*").order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching order statuses:", error)
    return []
  }

  return data
}

export async function createOrderStatus(formData: OrderStatusFormData) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("order_statuses").insert([formData])

  if (error) {
    console.error("Error creating order status:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function updateOrderStatus(id: number, formData: OrderStatusFormData) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("order_statuses").update(formData).eq("id", id)

  if (error) {
    console.error("Error updating order status:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function deleteOrderStatus(id: number) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("order_statuses").delete().eq("id", id)

  if (error) {
    console.error("Error deleting order status:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function toggleOrderStatusStatus(id: number, isActive: boolean) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("order_statuses").update({ is_active: !isActive }).eq("id", id)

  if (error) {
    console.error("Error toggling order status status:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}
