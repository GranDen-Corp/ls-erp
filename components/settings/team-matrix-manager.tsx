"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Users, Settings, ChevronDown, ChevronRight } from "lucide-react"
import { TeamMemberDialog } from "./team-member-dialog"
import { AssignmentDialog } from "./assignment-dialog"
import { DepartmentManagementDialog } from "./department-management-dialog"
import {
  getDepartments,
  getAllTeamMembers,
  getTeamMembersByDepartment,
  deleteTeamMember,
} from "@/app/settings/team-matrix-actions"
import type { Department, TeamMemberWithRelations } from "@/types/team-matrix"
import { useToast } from "@/hooks/use-toast"

export function TeamMatrixManager() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [teamMembers, setTeamMembers] = useState<TeamMemberWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [memberDialogOpen, setMemberDialogOpen] = useState(false)
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMemberWithRelations | null>(null)
  const [selectedMember, setSelectedMember] = useState<TeamMemberWithRelations | null>(null)
  const [expandedCustomers, setExpandedCustomers] = useState<Set<number>>(new Set())
  const [expandedFactories, setExpandedFactories] = useState<Set<number>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    loadDepartments()
  }, [])

  useEffect(() => {
    if (departments.length > 0) {
      loadMembers()
    }
  }, [departments, selectedDepartment])

  const loadDepartments = async () => {
    try {
      const data = await getDepartments()
      setDepartments(data)
    } catch (error) {
      toast({
        title: "錯誤",
        description: "無法載入部門資料",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async () => {
    try {
      let data: TeamMemberWithRelations[]
      if (selectedDepartment === "all") {
        data = await getAllTeamMembers()
      } else {
        data = await getTeamMembersByDepartment(selectedDepartment)
      }
      setTeamMembers(data)
    } catch (error) {
      toast({
        title: "錯誤",
        description: "無法載入團隊成員資料",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMember = async (id: number) => {
    if (!confirm("確定要刪除此團隊成員嗎？")) return

    const result = await deleteTeamMember(id)
    if (result.success) {
      toast({
        title: "成功",
        description: "團隊成員已刪除",
      })
      loadMembers()
    } else {
      toast({
        title: "錯誤",
        description: result.error || "刪除失敗",
        variant: "destructive",
      })
    }
  }

  const handleEditMember = (member: TeamMemberWithRelations) => {
    setEditingMember(member)
    setMemberDialogOpen(true)
  }

  const handleManageAssignment = (member: TeamMemberWithRelations) => {
    setSelectedMember(member)
    setAssignmentDialogOpen(true)
  }

  const handleDialogClose = () => {
    setMemberDialogOpen(false)
    setAssignmentDialogOpen(false)
    setEditingMember(null)
    setSelectedMember(null)
    loadMembers()
  }

  const getCurrentDepartment = () => {
    return departments.find((dept) => dept.department_code === selectedDepartment.toUpperCase())
  }

  const handleDepartmentManagementClose = () => {
    setDepartmentDialogOpen(false)
    loadDepartments()
  }

  const toggleCustomersExpanded = (memberId: number) => {
    const newExpanded = new Set(expandedCustomers)
    if (newExpanded.has(memberId)) {
      newExpanded.delete(memberId)
    } else {
      newExpanded.add(memberId)
    }
    setExpandedCustomers(newExpanded)
  }

  const toggleFactoriesExpanded = (memberId: number) => {
    const newExpanded = new Set(expandedFactories)
    if (newExpanded.has(memberId)) {
      newExpanded.delete(memberId)
    } else {
      newExpanded.add(memberId)
    }
    setExpandedFactories(newExpanded)
  }

  const shouldShowCustomers = (role: string) => {
    return role === "admin" || role === "sales"
  }

  const shouldShowFactories = (role: string) => {
    return role === "admin" || role === "shipping" || role === "qc"
  }

  if (loading) {
    return <div className="flex justify-center p-8">載入中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
        <Button variant="outline" onClick={() => setDepartmentDialogOpen(true)}>
          <Settings className="h-4 w-4 mr-2" />
          管理部門
        </Button>
      </div>

      <Tabs value={selectedDepartment} onValueChange={setSelectedDepartment}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">所有成員</TabsTrigger>
          {departments.map((dept) => (
            <TabsTrigger key={dept.department_code} value={dept.department_code}>
              {dept.department_name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">所有團隊成員</h3>
            <Button onClick={() => setMemberDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              新增成員
            </Button>
          </div>
          <MemberTable
            members={teamMembers}
            onEdit={handleEditMember}
            onDelete={handleDeleteMember}
            onManageAssignment={handleManageAssignment}
            expandedCustomers={expandedCustomers}
            expandedFactories={expandedFactories}
            onToggleCustomers={toggleCustomersExpanded}
            onToggleFactories={toggleFactoriesExpanded}
            shouldShowCustomers={shouldShowCustomers}
            shouldShowFactories={shouldShowFactories}
          />
        </TabsContent>

        {departments.map((dept) => (
          <TabsContent key={dept.department_code} value={dept.department_code} className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{dept.department_name}</h3>
                <p className="text-sm text-muted-foreground">{dept.description}</p>
              </div>
              <Button onClick={() => setMemberDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                新增成員
              </Button>
            </div>
            <MemberTable
              members={teamMembers}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
              onManageAssignment={handleManageAssignment}
              expandedCustomers={expandedCustomers}
              expandedFactories={expandedFactories}
              onToggleCustomers={toggleCustomersExpanded}
              onToggleFactories={toggleFactoriesExpanded}
              shouldShowCustomers={shouldShowCustomers}
              shouldShowFactories={shouldShowFactories}
            />
          </TabsContent>
        ))}
      </Tabs>

      <TeamMemberDialog
        open={memberDialogOpen}
        onClose={handleDialogClose}
        member={editingMember}
        department={getCurrentDepartment()}
      />

      <AssignmentDialog open={assignmentDialogOpen} onClose={handleDialogClose} member={selectedMember} />

      <DepartmentManagementDialog open={departmentDialogOpen} onClose={handleDepartmentManagementClose} />
    </div>
  )
}

interface MemberTableProps {
  members: TeamMemberWithRelations[]
  onEdit: (member: TeamMemberWithRelations) => void
  onDelete: (id: number) => void
  onManageAssignment: (member: TeamMemberWithRelations) => void
  expandedCustomers: Set<number>
  expandedFactories: Set<number>
  onToggleCustomers: (memberId: number) => void
  onToggleFactories: (memberId: number) => void
  shouldShowCustomers: (role: string) => boolean
  shouldShowFactories: (role: string) => boolean
}

function MemberTable({
  members,
  onEdit,
  onDelete,
  onManageAssignment,
  expandedCustomers,
  expandedFactories,
  onToggleCustomers,
  onToggleFactories,
  shouldShowCustomers,
  shouldShowFactories,
}: MemberTableProps) {
  // Helper function to get supplier display name
  const getSupplierDisplayName = (supplier: any) => {
    return (
      supplier.factory_name ||
      supplier.supplier_name ||
      supplier.name ||
      supplier.factory_short_name ||
      supplier.supplier_short_name ||
      supplier.short_name ||
      supplier.factory_id ||
      "未知工廠"
    )
  }

  // Helper function to get supplier ID
  const getSupplierId = (supplier: any) => {
    return supplier.factory_id || supplier.id
  }

  return (
    <div className="border rounded-lg">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-3 font-medium">員工編號</th>
            <th className="text-left p-3 font-medium">姓名</th>
            <th className="text-left p-3 font-medium">角色</th>
            <th className="text-left p-3 font-medium">部門</th>
            <th className="text-left p-3 font-medium">負責客戶</th>
            <th className="text-left p-3 font-medium">負責工廠</th>
            <th className="text-left p-3 font-medium">狀態</th>
            <th className="text-left p-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            // 合併所有客戶資料（assigned_customers + sales_customers）
            const allCustomers = [
              ...member.assigned_customers_data,
              ...member.sales_customers.map((c) => ({ ...c, type: "sales" as const })),
            ]

            // 合併所有工廠資料（assigned_factories + qc_factories）
            const allFactories = [
              ...member.assigned_factories_data,
              ...member.qc_factories.map((f) => ({ ...f, type: "qc" as const })),
            ]

            return (
              <tr key={member.id} className="border-t">
                <td className="p-3 font-mono text-sm">{member.ls_employee_id}</td>
                <td className="p-3 font-medium">{member.name}</td>
                <td className="p-3">{member.role}</td>
                <td className="p-3">{member.department}</td>
                <td className="p-3">
                  {shouldShowCustomers(member.role) ? (
                    <div className="space-y-1">
                      {allCustomers.length > 0 ? (
                        <>
                          <div className="flex flex-wrap gap-1">
                            {(expandedCustomers.has(member.id) ? allCustomers : allCustomers.slice(0, 2)).map(
                              (customer, index) => (
                                <Badge
                                  key={`${customer.customer_id}-${index}`}
                                  variant={customer.type === "sales" ? "default" : "outline"}
                                  className="text-xs"
                                >
                                  {customer.customer_short_name || customer.customer_name || customer.customer_id}
                                  {customer.type === "sales" && <span className="ml-1">(業務)</span>}
                                </Badge>
                              ),
                            )}
                          </div>
                          {allCustomers.length > 2 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => onToggleCustomers(member.id)}
                            >
                              {expandedCustomers.has(member.id) ? (
                                <>
                                  <ChevronDown className="h-3 w-3 mr-1" />
                                  收起
                                </>
                              ) : (
                                <>
                                  <ChevronRight className="h-3 w-3 mr-1" />+{allCustomers.length - 2} 更多
                                </>
                              )}
                            </Button>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground text-sm">未分配</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </td>
                <td className="p-3">
                  {shouldShowFactories(member.role) ? (
                    <div className="space-y-1">
                      {allFactories.length > 0 ? (
                        <>
                          <div className="flex flex-wrap gap-1">
                            {(expandedFactories.has(member.id) ? allFactories : allFactories.slice(0, 2)).map(
                              (factory, index) => (
                                <Badge
                                  key={`${getSupplierId(factory)}-${index}`}
                                  variant={factory.type === "qc" ? "default" : "outline"}
                                  className="text-xs"
                                >
                                  {getSupplierDisplayName(factory)}
                                  {factory.type === "qc" && <span className="ml-1">(品管)</span>}
                                </Badge>
                              ),
                            )}
                          </div>
                          {allFactories.length > 2 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => onToggleFactories(member.id)}
                            >
                              {expandedFactories.has(member.id) ? (
                                <>
                                  <ChevronDown className="h-3 w-3 mr-1" />
                                  收起
                                </>
                              ) : (
                                <>
                                  <ChevronRight className="h-3 w-3 mr-1" />+{allFactories.length - 2} 更多
                                </>
                              )}
                            </Button>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground text-sm">未分配</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </td>
                <td className="p-3">
                  <Badge variant={member.is_active ? "default" : "secondary"}>
                    {member.is_active ? "啟用" : "停用"}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => onManageAssignment(member)} title="管理分配">
                      <Users className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onEdit(member)} title="編輯">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDelete(member.id)} title="刪除">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
          {members.length === 0 && (
            <tr>
              <td colSpan={8} className="p-8 text-center text-muted-foreground">
                尚無團隊成員資料
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
