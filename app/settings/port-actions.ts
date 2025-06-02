"use server"

import { createServerSupabaseClient } from "@/lib/supabase-client"
import { revalidatePath } from "next/cache"
import type { Port } from "@/types/port"

export async function getPorts(): Promise<Port[]> {
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

export async function addPort(
  portData: Omit<Port, "id" | "created_at" | "updated_at">,
): Promise<{ success: boolean; data?: Port; error?: string }> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("ports").insert([portData]).select().single()

  if (error) {
    console.error("Error adding port:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true, data }
}

export async function updatePort(
  id: string,
  portData: Omit<Port, "id" | "created_at" | "updated_at">,
): Promise<{ success: boolean; data?: Port; error?: string }> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("ports")
    .update({
      ...portData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating port:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true, data }
}

export async function deletePort(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("ports").delete().eq("id", id)

  if (error) {
    console.error("Error deleting port:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function searchPorts(query: string): Promise<Port[]> {
  const supabase = createServerSupabaseClient()

  if (!query.trim()) {
    return getPorts()
  }

  const { data, error } = await supabase
    .from("ports")
    .select("*")
    .or(
      `port_name_zh.ilike.%${query}%,port_name_en.ilike.%${query}%,un_locode.ilike.%${query}%,region.ilike.%${query}%`,
    )
    .order("region", { ascending: true })
    .order("port_name_zh", { ascending: true })

  if (error) {
    console.error("Error searching ports:", error)
    return []
  }

  return data || []
}
