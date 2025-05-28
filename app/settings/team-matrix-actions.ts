"use server"

import { createServerSupabaseClient } from "@/lib/supabase-client"
import { revalidatePath } from "next/cache"
import type { Department, TeamMember, TeamMemberWithRelations } from "@/types/team-matrix"

// 獲取所有部門
export async function getDepartments(): Promise<Department[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("departments").select("*").eq("is_active", true).order("sort_order")

  if (error) {
    console.error("Error fetching departments:", error)
    throw new Error("Failed to fetch departments")
  }

  return data || []
}

// 獲取所有團隊成員及其關聯資料
export async function getAllTeamMembers(): Promise<TeamMemberWithRelations[]> {
  const supabase = createServerSupabaseClient()

  // 獲取團隊成員
  const { data: members, error: membersError } = await supabase.from("team_members").select("*").order("ls_employee_id")

  if (membersError) {
    console.error("Error fetching team members:", membersError)
    throw new Error("Failed to fetch team members")
  }

  if (!members || members.length === 0) {
    return []
  }

  // 獲取所有客戶 - 使用正確的欄位名稱
  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("customer_id, customer_short_name, client_sales")

  if (customersError) {
    console.error("Error fetching customers:", customersError)
  }

  // 獲取所有供應商/工廠 - 使用正確的欄位名稱
  const { data: suppliers, error: suppliersError } = await supabase
    .from("suppliers")
    .select("factory_id, supplier_name, supplier_short_name, quality_contact1, quality_contact2")

  if (suppliersError) {
    console.error("Error fetching suppliers:", suppliersError)
  }

  // 組合資料
  const membersWithRelations: TeamMemberWithRelations[] = members.map((member) => {
    // 透過 assigned_customers 關聯的客戶 (1對多)
    const assignedCustomersData =
      customers?.filter((customer) => member.assigned_customers?.includes(customer.customer_id)) || []

    // 透過 assigned_factories 關聯的工廠 (1對多)
    const assignedFactoriesData =
      suppliers?.filter((supplier) => member.assigned_factories?.includes(supplier.factory_id)) || []

    // 透過 client_sales 關聯的客戶 (1對1)
    const salesCustomers = customers?.filter((customer) => customer.client_sales === member.ls_employee_id) || []

    // 透過 quality_contact1/2 關聯的工廠 (1對1)
    const qcFactories =
      suppliers?.filter(
        (supplier) =>
          supplier.quality_contact1 === member.ls_employee_id || supplier.quality_contact2 === member.ls_employee_id,
      ) || []

    return {
      ...member,
      assigned_customers_data: assignedCustomersData,
      assigned_factories_data: assignedFactoriesData,
      sales_customers: salesCustomers,
      qc_factories: qcFactories,
    }
  })

  return membersWithRelations
}

// 根據部門代碼獲取團隊成員
export async function getTeamMembersByDepartment(departmentCode: string): Promise<TeamMemberWithRelations[]> {
  const allMembers = await getAllTeamMembers()
  return allMembers.filter((member) => member.role === departmentCode.toLowerCase())
}

// 新增團隊成員
export async function createTeamMember(data: {
  ls_employee_id: string
  name: string
  role: string
  department: string
  assigned_customers?: string[]
  assigned_factories?: string[]
  is_active?: boolean
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("team_members").insert([
    {
      ...data,
      is_active: data.is_active ?? true,
    },
  ])

  if (error) {
    console.error("Error creating team member:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

// 更新團隊成員
export async function updateTeamMember(
  id: number,
  data: Partial<TeamMember>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("team_members").update(data).eq("id", id)

  if (error) {
    console.error("Error updating team member:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

// 刪除團隊成員
export async function deleteTeamMember(id: number): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("team_members").delete().eq("id", id)

  if (error) {
    console.error("Error deleting team member:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

// 獲取所有客戶（用於分配）- 修正欄位名稱
export async function getCustomersForAssignment() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("customers")
    .select("customer_id, customer_short_name, client_sales")
    .order("customer_short_name")

  if (error) {
    console.error("Error fetching customers:", error)
    throw new Error("Failed to fetch customers")
  }

  return data || []
}

// 獲取所有工廠（用於分配）- 修正使用 factory_id
export async function getFactoriesForAssignment() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("suppliers")
    .select("factory_id, supplier_name, supplier_short_name, quality_contact1, quality_contact2")
    .order("supplier_short_name")

  if (error) {
    console.error("Error fetching suppliers:", error)
    throw new Error("Failed to fetch suppliers")
  }

  return data || []
}

// 更新團隊成員的客戶分配
export async function updateTeamMemberCustomers(
  teamMemberId: number,
  customerIds: string[],
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from("team_members")
    .update({ assigned_customers: customerIds })
    .eq("id", teamMemberId)

  if (error) {
    console.error("Error updating team member customers:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

// 更新團隊成員的工廠分配 - 修正使用 factory_id
export async function updateTeamMemberFactories(
  teamMemberId: number,
  factoryIds: string[],
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from("team_members")
    .update({ assigned_factories: factoryIds })
    .eq("id", teamMemberId)

  if (error) {
    console.error("Error updating team member factories:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

// 更新客戶的業務負責人
export async function updateCustomerSales(
  customerId: string,
  employeeId: string | null,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("customers").update({ client_sales: employeeId }).eq("customer_id", customerId)

  if (error) {
    console.error("Error updating customer sales:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

// 更新供應商的品管負責人 - 修正使用 factory_id
export async function updateSupplierQualityContact(
  factoryId: string,
  contactType: "quality_contact1" | "quality_contact2",
  employeeId: string | null,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from("suppliers")
    .update({ [contactType]: employeeId })
    .eq("factory_id", factoryId)

  if (error) {
    console.error("Error updating supplier quality contact:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}
