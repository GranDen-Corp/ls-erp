"use server"

import { createServerSupabaseClient } from "@/lib/supabase-client"
import { revalidatePath } from "next/cache"
import type { Department, TeamMember, TeamMemberWithRelations } from "@/types/team-matrix"

// 獲取所有部門
export async function getDepartments(): Promise<Department[]> {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("departments").select("*").eq("is_active", true).order("sort_order")

    if (error) {
      console.error("Error fetching departments:", error)
      // Return mock data if departments table doesn't exist
      return [
        { id: 1, department_code: "ADMIN", department_name: "管理部", description: "系統管理", is_active: true },
        { id: 2, department_code: "SALES", department_name: "業務部", description: "業務銷售", is_active: true },
        { id: 3, department_code: "QC", department_name: "品管部", description: "品質管理", is_active: true },
        { id: 4, department_code: "SHIPPING", department_name: "出貨部", description: "出貨管理", is_active: true },
      ]
    }

    return data || []
  } catch (error) {
    console.error("Error in getDepartments:", error)
    return []
  }
}

// 獲取所有團隊成員及其關聯資料
export async function getAllTeamMembers(): Promise<TeamMemberWithRelations[]> {
  try {
    const supabase = createServerSupabaseClient()

    // 獲取團隊成員
    const { data: members, error: membersError } = await supabase
      .from("team_members")
      .select("*")
      .order("ls_employee_id")

    if (membersError) {
      console.error("Error fetching team members:", membersError)
      // Return empty array if team_members table doesn't exist
      return []
    }

    if (!members || members.length === 0) {
      return []
    }

    // 獲取所有客戶 - 修改為使用 sales_representative
    let customers: any[] = []
    try {
      const { data: customersData, error: customersErr } = await supabase
        .from("customers")
        .select("customer_id, customer_short_name, sales_representative, logistics_coordinator")

      if (customersErr) {
        console.warn("sales_representative column not found, trying fallback")
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("customers")
          .select("customer_id, customer_short_name, represent_sales, logistics_coordinator")

        if (!fallbackError) {
          customers = fallbackData || []
        }
      } else {
        customers = customersData || []
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
    }

    // 獲取所有供應商/工廠
    let factories: any[] = []
    try {
      const { data: factoriesData, error: factoriesErr } = await supabase
        .from("factories")
        .select("factory_id, factory_name, factory_short_name, quality_contact1, quality_contact2")

      if (factoriesErr) {
        console.warn("factory columns not found, trying alternative names")
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("factories")
          .select("id, name, short_name, quality_contact1, quality_contact2")

        if (!fallbackError) {
          factories = fallbackData || []
        }
      } else {
        factories = factoriesData || []
      }
    } catch (error) {
      console.error("Error fetching factories:", error)
    }

    // 組合資料
    const membersWithRelations: TeamMemberWithRelations[] = members.map((member) => {
      const assignedCustomersData =
        customers?.filter((customer) => member.assigned_customers?.includes(customer.customer_id)) || []

      const assignedFactoriesData =
      factories?.filter((factory) => member.assigned_factories?.includes(factory.factory_id || factory.id)) || []

      // 業務部門：透過 sales_representative 關聯的客戶
      const salesCustomers =
        customers?.filter(
          (customer) =>
            customer.sales_representative === member.ls_employee_id ||
            customer.represent_sales === member.ls_employee_id,
        ) || []

      // 出貨部門：透過 logistics_coordinator 關聯的客戶
      const shippingCustomers =
        customers?.filter((customer) => customer.logistics_coordinator === member.ls_employee_id) || []

      // 品管部門：透過 quality_contact1/2 關聯的工廠
      const qcFactories =
      factories?.filter(
          (factory) =>
            factory.quality_contact1 === member.ls_employee_id || factory.quality_contact2 === member.ls_employee_id,
        ) || []

      return {
        ...member,
        assigned_customers_data: assignedCustomersData,
        assigned_factories_data: assignedFactoriesData,
        sales_customers: salesCustomers,
        shipping_customers: shippingCustomers, // 新增出貨客戶
        qc_factories: qcFactories,
      }
    })

    return membersWithRelations
  } catch (error) {
    console.error("Error in getAllTeamMembers:", error)
    return []
  }
}

// 根據部門代碼獲取團隊成員
export async function getTeamMembersByDepartment(departmentCode: string): Promise<TeamMemberWithRelations[]> {
  const allMembers = await getAllTeamMembers()

  // 確保正確的部門篩選邏輯
  const filteredMembers = allMembers.filter((member) => {
    // 支援多種比較方式
    const memberRole = member.role?.toLowerCase()
    const memberDepartment = member.department?.toLowerCase()
    const targetDepartment = departmentCode.toLowerCase()

    return (
      memberRole === targetDepartment ||
      memberDepartment === targetDepartment ||
      memberRole === targetDepartment.replace("_", "") ||
      memberDepartment === targetDepartment.replace("_", "")
    )
  })

  console.log(`篩選部門 ${departmentCode}:`, {
    總成員數: allMembers.length,
    篩選後成員數: filteredMembers.length,
    篩選條件: departmentCode,
    成員角色: allMembers.map((m) => ({ name: m.name, role: m.role, department: m.department })),
  })

  return filteredMembers
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
  try {
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
  } catch (error) {
    console.error("Error in createTeamMember:", error)
    return { success: false, error: "Failed to create team member" }
  }
}

// 更新團隊成員
export async function updateTeamMember(
  id: number,
  data: Partial<TeamMember>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("team_members").update(data).eq("id", id)

    if (error) {
      console.error("Error updating team member:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Error in updateTeamMember:", error)
    return { success: false, error: "Failed to update team member" }
  }
}

// 刪除團隊成員
export async function deleteTeamMember(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("team_members").delete().eq("id", id)

    if (error) {
      console.error("Error deleting team member:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteTeamMember:", error)
    return { success: false, error: "Failed to delete team member" }
  }
}

// 獲取所有客戶（用於分配）
export async function getCustomersForAssignment() {
  try {
    const supabase = createServerSupabaseClient()

    let data: any[] = []
    const { data: customersData, error: customersErr } = await supabase
      .from("customers")
      .select("customer_id, customer_short_name, sales_representative, logistics_coordinator")
      .order("customer_short_name")

    if (customersErr) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("customers")
        .select("customer_id, customer_short_name, represent_sales, logistics_coordinator")
        .order("customer_short_name")

      if (!fallbackError) {
        data = fallbackData || []
      }
    } else {
      data = customersData || []
    }

    return data
  } catch (error) {
    console.error("Error fetching customers for assignment:", error)
    return []
  }
}

// 獲取所有工廠（用於分配）
export async function getFactoriesForAssignment() {
  try {
    const supabase = createServerSupabaseClient()

    let data: any[] = []
    const { data: factoriesData, error: factoriesErr } = await supabase
      .from("factories")
      .select("factory_id, factory_name, factory_short_name, quality_contact1, quality_contact2")
      .order("factory_short_name")

    if (factoriesErr) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("factories")
        .select("id, name, short_name, quality_contact1, quality_contact2")
        .order("short_name")

      if (!fallbackError) {
        data = fallbackData || []
      }
    } else {
      data = factoriesData || []
    }

    return data
  } catch (error) {
    console.error("Error fetching factories for assignment:", error)
    return []
  }
}

// 更新團隊成員的客戶分配
export async function updateTeamMemberCustomers(
  teamMemberId: number,
  customerIds: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
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
  } catch (error) {
    console.error("Error in updateTeamMemberCustomers:", error)
    return { success: false, error: "Failed to update team member customers" }
  }
}

// 更新團隊成員的工廠分配
export async function updateTeamMemberFactories(
  teamMemberId: number,
  factoryIds: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
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
  } catch (error) {
    console.error("Error in updateTeamMemberFactories:", error)
    return { success: false, error: "Failed to update team member factories" }
  }
}

// 更新客戶的業務負責人 - 修改為使用 sales_representative
export async function updateCustomerRepresentSales(
  customerId: string,
  employeeId: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    let error: any = null
    const { error: updateError } = await supabase
      .from("customers")
      .update({ sales_representative: employeeId })
      .eq("customer_id", customerId)

    if (updateError) {
      console.log("Trying fallback field 'represent_sales'")
      const { error: fallbackError } = await supabase
        .from("customers")
        .update({ represent_sales: employeeId })
        .eq("customer_id", customerId)

      if (fallbackError) {
        error = fallbackError
      }
    }

    if (error) {
      console.error("Error updating customer represent sales:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Error in updateCustomerRepresentSales:", error)
    return { success: false, error: "Failed to update customer represent sales" }
  }
}

// 更新客戶的出貨負責人
export async function updateCustomerLogisticsCoordinator(
  customerId: string,
  employeeId: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from("customers")
      .update({ logistics_coordinator: employeeId })
      .eq("customer_id", customerId)

    if (error) {
      console.error("Error updating customer logistics coordinator:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Error in updateCustomerLogisticsCoordinator:", error)
    return { success: false, error: "Failed to update customer logistics coordinator" }
  }
}

// 更新供應商的品管負責人
export async function updateFactoryQualityContact(
  factoryId: string,
  contactType: "quality_contact1" | "quality_contact2",
  employeeId: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    let error: any = null
    const { error: updateError } = await supabase
      .from("factories")
      .update({ [contactType]: employeeId })
      .eq("factory_id", factoryId)

    if (updateError) {
      const { error: fallbackError } = await supabase
        .from("factories")
        .update({ [contactType]: employeeId })
        .eq("id", factoryId)

      if (fallbackError) {
        error = fallbackError
      }
    }

    if (error) {
      console.error("Error updating factory quality contact:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Error in updateFactoryQualityContact:", error)
    return { success: false, error: "Failed to update factory quality contact" }
  }
}
