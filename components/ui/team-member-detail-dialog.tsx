"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, Building, Loader2, AlertCircle } from "lucide-react"
import { supabaseClient } from "@/lib/supabase-client"

interface TeamMemberDetail {
  ls_employee_id: string
  name: string
  phone_no?: string
  email?: string
  department?: string
  role?: string
  is_active?: boolean
}

interface TeamMemberDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId: string | null
  title?: string
}

export function TeamMemberDetailDialog({
  open,
  onOpenChange,
  employeeId,
  title = "團隊成員詳情",
}: TeamMemberDetailDialogProps) {
  const [memberDetail, setMemberDetail] = useState<TeamMemberDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && employeeId) {
      fetchMemberDetail(employeeId)
    } else {
      setMemberDetail(null)
      setError(null)
    }
  }, [open, employeeId])

  const fetchMemberDetail = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabaseClient
        .from("team_members")
        .select("ls_employee_id, name, phone_no, email, department, role, is_active")
        .eq("ls_employee_id", id)
        .single()

      if (error) {
        throw new Error(`查詢團隊成員資料時出錯: ${error.message}`)
      }

      if (!data) {
        throw new Error("找不到該團隊成員資料")
      }

      setMemberDetail(data)
    } catch (err) {
      console.error("獲取團隊成員詳情時出錯:", err)
      setError(err instanceof Error ? err.message : "獲取團隊成員詳情時出錯")
    } finally {
      setLoading(false)
    }
  }

  const getRoleDisplayName = (role: string) => {
    const roleMap = {
      admin: "管理員",
      sales: "業務",
      shipping: "船務",
      qc: "品管",
      finance: "財務",
      manager: "經理",
    }
    return roleMap[role as keyof typeof roleMap] || role
  }

  const getDepartmentDisplayName = (department: string) => {
    const deptMap = {
      SALES: "業務部",
      SHIPPING: "船務部",
      QC: "品管部",
      FINANCE: "財務部",
      ADMIN: "管理部",
    }
    return deptMap[department as keyof typeof deptMap] || department
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>查看團隊成員的詳細聯絡資訊</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">載入中...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {memberDetail && !loading && !error && (
            <div className="space-y-4">
              {/* 基本資訊 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-lg">{memberDetail.name}</h4>
                  <Badge variant={memberDetail.is_active ? "default" : "secondary"}>
                    {memberDetail.is_active ? "啟用" : "停用"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">員工編號</span>
                    <div className="font-mono">{memberDetail.ls_employee_id}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">角色</span>
                    <div>{memberDetail.role ? getRoleDisplayName(memberDetail.role) : "未設定"}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 部門資訊 */}
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">部門</div>
                  <div className="font-medium">
                    {memberDetail.department ? getDepartmentDisplayName(memberDetail.department) : "未設定"}
                  </div>
                </div>
              </div>

              <Separator />

              {/* 聯絡資訊 */}
              <div className="space-y-3">
                <h5 className="font-medium">聯絡資訊</h5>

                <div className="space-y-3">
                  {/* 電子郵件 */}
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground">電子郵件</div>
                      {memberDetail.email ? (
                        <a href={`mailto:${memberDetail.email}`} className="text-blue-600 hover:underline font-medium">
                          {memberDetail.email}
                        </a>
                      ) : (
                        <div className="text-muted-foreground">未設定</div>
                      )}
                    </div>
                  </div>

                  {/* 電話號碼 */}
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground">電話號碼</div>
                      {memberDetail.phone_no ? (
                        <a href={`tel:${memberDetail.phone_no}`} className="text-blue-600 hover:underline font-medium">
                          {memberDetail.phone_no}
                        </a>
                      ) : (
                        <div className="text-muted-foreground">未設定</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
