"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MoreHorizontal, ArrowUpDown, Loader2, FileEdit, Eye, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { supabaseClient } from "@/lib/supabase-client"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// 供應商資料類型 - 對應 factories 表
interface Factory {
  factory_id: string
  factory_name: string
  factory_full_name: string
  factory_type: string
  factory_address?: string
  factory_phone?: string
  factory_fax?: string
  tax_id?: string
  category1?: string
  category2?: string
  category3?: string
  iso9001_certified?: string
  iatf16949_certified?: string
  iso17025_certified?: string
  cqi9_certified?: string
  cqi11_certified?: string
  cqi12_certified?: string
  status?: boolean
  location?: string
  city?: string
  contact_person?: string
  contact_phone?: string
  contact_email?: string
  website?: string
  notes?: string
  created_at?: string
  updated_at?: string
  iso9001_expiry?: string
  iatf16949_expiry?: string
  iso17025_expiry?: string
  cqi9_expiry?: string
  cqi11_expiry?: string
  cqi12_expiry?: string
  quality_contact1?: string
  quality_contact2?: string
  invoice_address?: string
}

// 團隊成員類型
interface TeamMember {
  ls_employee_id: string
  name: string
}

type SortField = keyof Factory | ""
type SortDirection = "asc" | "desc"

export function FactoriesTable() {
  const [factories, setFactories] = useState<Factory[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>("factory_id")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null)
  const { toast } = useToast()

  // 從Supabase獲取供應商資料和團隊成員資料
  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // 並行獲取供應商和團隊成員資料
      const [factoriesResult, teamMembersResult] = await Promise.all([
        supabaseClient.from("factories").select("*").order("factory_id", { ascending: true }),
        supabaseClient.from("team_members").select("ls_employee_id, name"),
      ])

      if (factoriesResult.error) {
        throw new Error(`獲取供應商資料時出錯: ${factoriesResult.error.message}`)
      }

      if (teamMembersResult.error) {
        console.warn("獲取團隊成員資料時出錯:", teamMembersResult.error.message)
      }

      setFactories(factoriesResult.data || [])
      setTeamMembers(teamMembersResult.data || [])
    } catch (err) {
      console.error("獲取資料時出錯:", err)
      setError(err instanceof Error ? err.message : "獲取資料時出錯")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 根據員工ID獲取員工姓名
  const getEmployeeName = (employeeId: string | undefined) => {
    if (!employeeId) return ""
    const member = teamMembers.find((m) => m.ls_employee_id === employeeId)
    return member ? member.name : employeeId
  }

  // 處理排序
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // 排序供應商
  const sortedFactories = [...factories].sort((a, b) => {
    if (!sortField) return 0

    const fieldA = a[sortField as keyof Factory]
    const fieldB = b[sortField as keyof Factory]

    if (fieldA === undefined || fieldA === null) return sortDirection === "asc" ? -1 : 1
    if (fieldB === undefined || fieldB === null) return sortDirection === "asc" ? 1 : -1

    if (typeof fieldA === "string" && typeof fieldB === "string") {
      return sortDirection === "asc" ? fieldA.localeCompare(fieldB, "zh-TW") : fieldB.localeCompare(fieldA, "zh-TW")
    }

    if (typeof fieldA === "boolean" && typeof fieldB === "boolean") {
      return sortDirection === "asc"
        ? fieldA === fieldB
          ? 0
          : fieldA
            ? 1
            : -1
        : fieldA === fieldB
          ? 0
          : fieldA
            ? -1
            : 1
    }

    return sortDirection === "asc"
      ? fieldA < fieldB
        ? -1
        : fieldA > fieldB
          ? 1
          : 0
      : fieldA > fieldB
        ? -1
        : fieldA < fieldB
          ? 1
          : 0
  })

  // 切換供應商狀態
  const toggleFactoryStatus = async (factoryId: string, currentStatus: boolean | undefined) => {
    try {
      setStatusUpdating(factoryId)

      const newStatus = !currentStatus

      const { error } = await supabaseClient
        .from("factories")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("factory_id", factoryId)

      if (error) {
        throw new Error(`更新供應商狀態時出錯: ${error.message}`)
      }

      // 更新本地狀態
      setFactories((prev) =>
        prev.map((factory) => (factory.factory_id === factoryId ? { ...factory, status: newStatus } : factory)),
      )

      toast({
        title: "狀態更新成功",
        description: `供應商已${newStatus ? "啟用" : "停用"}`,
      })
    } catch (err) {
      console.error("更新供應商狀態時出錯:", err)
      toast({
        title: "狀態更新失敗",
        description: err instanceof Error ? err.message : "更新供應商狀態時出錯",
        variant: "destructive",
      })
    } finally {
      setStatusUpdating(null)
    }
  }

  // 渲染狀態徽章
  const renderStatusBadge = (factory: Factory) => {
    const isActive = factory.status === true
    const isUpdating = statusUpdating === factory.factory_id

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFactoryStatus(factory.factory_id, factory.status)}
              disabled={isUpdating}
              className="h-auto p-1"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Badge
                  variant={isActive ? "default" : "secondary"}
                  className={`cursor-pointer ${
                    isActive
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }`}
                >
                  {isActive ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      啟用
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      停用
                    </>
                  )}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>點擊切換狀態</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // 渲染品管聯絡人（顯示姓名）
  const renderQualityContacts = (factory: Factory) => {
    const contacts = []
    if (factory.quality_contact1) {
      const name = getEmployeeName(factory.quality_contact1)
      contacts.push(name)
    }
    if (factory.quality_contact2) {
      const name = getEmployeeName(factory.quality_contact2)
      contacts.push(name)
    }

    return (
      <div className="text-sm">
        {contacts.length > 0 ? (
          <div className="space-y-1">
            {contacts.map((contact, index) => (
              <div key={index} className="text-gray-700">
                {contact}
              </div>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">未設定</span>
        )}
      </div>
    )
  }

  // 渲染供應商類型
  const renderFactoryType = (type: string) => {
    const typeMap = {
      assembly: "組裝廠",
      production: "生產廠",
      parts: "零件廠",
      material: "材料供應商",
      service: "服務供應商",
    }
    return typeMap[type as keyof typeof typeMap] || type || "未分類"
  }

  // 渲染認證徽章
  const renderCertificationBadges = (factory: Factory) => {
    const certifications = [
      {
        key: "iso9001",
        label: "ISO 9001",
        certified: factory.iso9001_certified,
        expiry: factory.iso9001_expiry,
      },
      {
        key: "iatf16949",
        label: "IATF 16949",
        certified: factory.iatf16949_certified,
        expiry: factory.iatf16949_expiry,
      },
      {
        key: "iso17025",
        label: "ISO 17025",
        certified: factory.iso17025_certified,
        expiry: factory.iso17025_expiry,
      },
      {
        key: "cqi9",
        label: "CQI-9",
        certified: factory.cqi9_certified,
        expiry: factory.cqi9_expiry,
      },
      {
        key: "cqi11",
        label: "CQI-11",
        certified: factory.cqi11_certified,
        expiry: factory.cqi11_expiry,
      },
      {
        key: "cqi12",
        label: "CQI-12",
        certified: factory.cqi12_certified,
        expiry: factory.cqi12_expiry,
      },
    ]

    const validCertifications = certifications.filter((cert) => cert.certified === "Y" || cert.certified === "是")

    const isExpiringSoon = (expiryDate: string) => {
      if (!expiryDate) return false
      const expiry = new Date(expiryDate)
      const today = new Date()
      const threeMonthsFromNow = new Date()
      threeMonthsFromNow.setMonth(today.getMonth() + 3)
      return expiry <= threeMonthsFromNow && expiry >= today
    }

    const isExpired = (expiryDate: string) => {
      if (!expiryDate) return false
      const expiry = new Date(expiryDate)
      const today = new Date()
      return expiry < today
    }

    const formatExpiryDate = (expiryDate: string) => {
      if (!expiryDate) return ""
      try {
        return new Date(expiryDate).toLocaleDateString("zh-TW", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
      } catch {
        return expiryDate
      }
    }

    return (
      <div className="flex flex-col gap-1 max-w-[200px]">
        {validCertifications.length > 0 ? (
          validCertifications.map((cert) => {
            const expired = isExpired(cert.expiry)
            const expiringSoon = isExpiringSoon(cert.expiry)

            let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "default"
            let badgeClass = "text-xs"

            if (expired) {
              badgeVariant = "destructive"
              badgeClass += " bg-red-100 text-red-800"
            } else if (expiringSoon) {
              badgeVariant = "outline"
              badgeClass += " bg-yellow-100 text-yellow-800 border-yellow-300"
            } else {
              badgeVariant = "default"
              badgeClass += " bg-green-100 text-green-800"
            }

            return (
              <TooltipProvider key={cert.key}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant={badgeVariant} className={badgeClass}>
                      {cert.label}
                      {cert.expiry && (
                        <span className="ml-1 text-xs opacity-75">
                          {expired ? "已過期" : expiringSoon ? "即將到期" : "有效"}
                        </span>
                      )}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <div className="font-semibold">{cert.label}</div>
                      <div className="text-sm">狀態: {expired ? "已過期" : expiringSoon ? "即將到期" : "有效"}</div>
                      {cert.expiry && <div className="text-sm">到期日: {formatExpiryDate(cert.expiry)}</div>}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })
        ) : (
          <span className="text-xs text-gray-400">無認證</span>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">載入供應商資料中...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchData} variant="outline">
          重新載入
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button variant="ghost" onClick={() => handleSort("factory_id")} className="h-auto p-0 font-semibold">
                  供應商ID
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("factory_name")} className="h-auto p-0 font-semibold">
                  供應商名稱
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("factory_type")} className="h-auto p-0 font-semibold">
                  類型
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("location")} className="h-auto p-0 font-semibold">
                  國家/地區
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[150px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("quality_contact1")}
                  className="h-auto p-0 font-semibold"
                >
                  負責品管
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("factory_phone")}
                  className="h-auto p-0 font-semibold"
                >
                  連絡電話
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[200px]">認證狀態</TableHead>
              <TableHead className="text-center">
                <Button variant="ghost" onClick={() => handleSort("status")} className="h-auto p-0 font-semibold">
                  狀態
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedFactories.map((factory) => (
              <TableRow key={factory.factory_id}>
                <TableCell className="font-medium">{factory.factory_id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{factory.factory_name}</div>
                    {factory.factory_full_name && factory.factory_full_name !== factory.factory_name && (
                      <div className="text-sm text-gray-500">{factory.factory_full_name}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    {renderFactoryType(factory.factory_type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{factory.location || "未設定"}</div>
                </TableCell>
                <TableCell>{renderQualityContacts(factory)}</TableCell>
                <TableCell>
                  <div className="text-sm">{factory.factory_phone || "未設定"}</div>
                </TableCell>
                <TableCell>{renderCertificationBadges(factory)}</TableCell>
                <TableCell className="text-center">{renderStatusBadge(factory)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">開啟選單</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>操作</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/factories/all/${factory.factory_id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          查看詳情
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/factories/all/${factory.factory_id}/edit`}>
                          <FileEdit className="mr-2 h-4 w-4" />
                          編輯
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => toggleFactoryStatus(factory.factory_id, factory.status)}
                        disabled={statusUpdating === factory.factory_id}
                      >
                        {factory.status ? (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            停用供應商
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            啟用供應商
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {sortedFactories.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">目前沒有供應商資料</p>
        </div>
      )}
    </div>
  )
}
