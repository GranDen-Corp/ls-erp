"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Eye, MoreHorizontal, Pencil, Loader2, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface Factory {
  id: string | number
  factory_id: string
  factory_name: string
  factory_type?: string
  location?: string
  quality_contact1?: string
  quality_contact2?: string
  factory_phone?: string
  status?: boolean
  created_at?: string
  updated_at?: string
  [key: string]: any
}

interface TeamMember {
  ls_employee_id: string
  name: string
}

interface FactoriesTableProps {
  data: Factory[]
  isLoading?: boolean
  visibleColumns?: string[]
  columnOrder?: string[]
  onStatusUpdate?: (factoryId: string, newStatus: boolean) => void
}

export function FactoriesTable({
  data = [],
  isLoading = false,
  visibleColumns = [],
  columnOrder = [],
  onStatusUpdate,
}: FactoriesTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isTeamLoading, setIsTeamLoading] = useState(true)
  const supabase = createClientComponentClient()

  // 獲取團隊成員資料
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setIsTeamLoading(true)
        const { data: teamData, error } = await supabase.from("team_members").select("ls_employee_id, name")

        if (error) {
          console.error("獲取團隊成員資料失敗:", error)
        } else {
          setTeamMembers(teamData || [])
        }
      } catch (err) {
        console.error("獲取團隊成員資料時出錯:", err)
      } finally {
        setIsTeamLoading(false)
      }
    }

    fetchTeamMembers()
  }, [])

  // 根據員工ID獲取員工姓名
  const getEmployeeName = (employeeId: string | undefined) => {
    if (!employeeId) return ""
    const member = teamMembers.find((m) => m.ls_employee_id === employeeId)
    return member ? member.name : employeeId
  }

  // 定義欄位渲染函數
  const columnRenderers: Record<string, (factory: Factory) => React.ReactNode> = {
    factory_id: (factory) => (
      <Link
        href={`/factories/all/${factory.factory_id}`}
        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
      >
        {factory.factory_id}
      </Link>
    ),
    factory_name: (factory) => (
      <div>
        <div className="font-medium">{factory.factory_name}</div>
        {factory.factory_full_name && factory.factory_full_name !== factory.factory_name && (
          <div className="text-sm text-gray-500">{factory.factory_full_name}</div>
        )}
      </div>
    ),
    factory_type: (factory) => {
      const typeMap: Record<string, string> = {
        assembly: "組裝廠",
        production: "生產廠",
        parts: "零件廠",
        material: "材料供應商",
        service: "服務供應商",
      }
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          {typeMap[factory.factory_type || ""] || factory.factory_type || "-"}
        </Badge>
      )
    },
    location: (factory) => factory.location || "-",
    quality_contacts: (factory) => {
      const contacts = []
      if (factory.quality_contact1) {
        const name = getEmployeeName(factory.quality_contact1)
        contacts.push(name || factory.quality_contact1)
      }
      if (factory.quality_contact2) {
        const name = getEmployeeName(factory.quality_contact2)
        contacts.push(name || factory.quality_contact2)
      }

      return (
        <div className="text-sm">
          {contacts.length > 0 ? (
            <div className="space-y-1">
              {contacts.map((contact, index) => (
                <div key={index} className="text-blue-600">
                  {contact}
                </div>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">未設定</span>
          )}
        </div>
      )
    },
    factory_phone: (factory) => factory.factory_phone || "-",
    status: (factory) => (
      <div className="flex items-center space-x-2">
        <Switch
          checked={factory.status === true}
          onCheckedChange={(checked) => {
            if (onStatusUpdate) {
              onStatusUpdate(factory.factory_id, checked)
            }
          }}
        />
        <Badge variant={factory.status ? "default" : "secondary"} className="text-xs">
          {factory.status ? (
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
      </div>
    ),
    created_at: (factory) => {
      if (!factory.created_at) return "-"
      try {
        const date = new Date(factory.created_at)
        return date.toLocaleDateString("zh-TW")
      } catch (e) {
        return factory.created_at
      }
    },
    updated_at: (factory) => {
      if (!factory.updated_at) return "-"
      try {
        const date = new Date(factory.updated_at)
        return date.toLocaleDateString("zh-TW")
      } catch (e) {
        return factory.updated_at
      }
    },
    factory_full_name: (factory) => factory.factory_full_name || "-",
    city: (factory) => factory.city || "-",
    factory_address: (factory) => factory.factory_address || "-",
    factory_fax: (factory) => factory.factory_fax || "-",
    tax_id: (factory) => factory.tax_id || "-",
    contact_person: (factory) => factory.contact_person || "-",
    contact_email: (factory) => factory.contact_email || "-",
    website: (factory) => factory.website || "-",
    invoice_address: (factory) => factory.invoice_address || "-",
    category1: (factory) => factory.category1 || "-",
    category2: (factory) => factory.category2 || "-",
    category3: (factory) => factory.category3 || "-",
    iso9001_certified: (factory) => factory.iso9001_certified || "-",
    iatf16949_certified: (factory) => factory.iatf16949_certified || "-",
    iso17025_certified: (factory) => factory.iso17025_certified || "-",
    cqi9_certified: (factory) => factory.cqi9_certified || "-",
    cqi11_certified: (factory) => factory.cqi11_certified || "-",
    cqi12_certified: (factory) => factory.cqi12_certified || "-",
    iso9001_expiry: (factory) => factory.iso9001_expiry || "-",
    iatf16949_expiry: (factory) => factory.iatf16949_expiry || "-",
    iso17025_expiry: (factory) => factory.iso17025_expiry || "-",
    cqi9_expiry: (factory) => factory.cqi9_expiry || "-",
    cqi11_expiry: (factory) => factory.cqi11_expiry || "-",
    cqi12_expiry: (factory) => factory.cqi12_expiry || "-",
    notes: (factory) => factory.notes || "-",
  }

  // 欄位標籤映射
  const columnLabels: Record<string, string> = {
    factory_id: "供應商編號",
    factory_name: "供應商名稱",
    factory_type: "供應商類型",
    location: "國家/地區",
    quality_contacts: "品管人員",
    factory_phone: "連絡電話",
    status: "狀態",
    created_at: "建立時間",
    updated_at: "更新時間",
    factory_full_name: "供應商全名",
    city: "城市",
    factory_address: "供應商地址",
    factory_fax: "傳真",
    tax_id: "統一編號",
    contact_person: "聯絡人",
    contact_email: "聯絡人Email",
    website: "網站",
    invoice_address: "發票地址",
    category1: "產品類別1",
    category2: "產品類別2",
    category3: "產品類別3",
    iso9001_certified: "ISO 9001認證",
    iatf16949_certified: "IATF 16949認證",
    iso17025_certified: "ISO 17025認證",
    cqi9_certified: "CQI-9認證",
    cqi11_certified: "CQI-11認證",
    cqi12_certified: "CQI-12認證",
    iso9001_expiry: "ISO 9001到期日",
    iatf16949_expiry: "IATF 16949到期日",
    iso17025_expiry: "ISO 17025到期日",
    cqi9_expiry: "CQI-9到期日",
    cqi11_expiry: "CQI-11到期日",
    cqi12_expiry: "CQI-12到期日",
    notes: "備註",
  }

  // 根據 columnOrder 和 visibleColumns 決定要顯示的欄位及其順序
  const displayColumns = columnOrder
    .filter((columnId) => visibleColumns.includes(columnId))
    .filter((columnId) => columnRenderers[columnId] && columnLabels[columnId])

  // 分頁計算
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, data.length)
  const paginatedData = data.slice(startIndex, endIndex)

  if (isLoading || isTeamLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p>載入供應商資料中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {displayColumns.map((columnId) => (
                <TableHead key={columnId}>{columnLabels[columnId]}</TableHead>
              ))}
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={displayColumns.length + 1} className="text-center py-8">
                  沒有找到符合條件的供應商
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((factory, index) => (
                <TableRow key={factory.id || index} className={index % 2 === 1 ? "bg-muted/50" : ""}>
                  {displayColumns.map((columnId) => (
                    <TableCell key={columnId}>{columnRenderers[columnId](factory)}</TableCell>
                  ))}
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
                        <DropdownMenuItem>
                          <Link href={`/factories/all/${factory.factory_id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            查看詳情
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Link href={`/factories/all/${factory.factory_id}/edit`} className="flex items-center">
                            <Pencil className="mr-2 h-4 w-4" />
                            編輯供應商
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            顯示 {startIndex + 1} 到 {endIndex} 筆，共 {data.length} 筆資料
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">每頁顯示</p>
              <Select
                value={`${itemsPerPage}`}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={itemsPerPage} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm font-medium">筆</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 px-2 lg:px-3"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">上一頁</span>
              </Button>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                第 {currentPage} 頁，共 {totalPages} 頁
              </div>
              <Button
                variant="outline"
                className="h-8 px-2 lg:px-3"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">下一頁</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
