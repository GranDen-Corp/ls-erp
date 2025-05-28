"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CustomerCombobox } from "@/components/ui/customer-combobox"
import { Switch } from "@/components/ui/switch"
import { RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabaseClient } from "@/lib/supabase-client"

interface Customer {
  customer_id: string
  customer_full_name: string
  customer_short_name?: string
  payment_terms_specification?: string
  trade_terms_specification?: string
  currency?: string
  sales_representative?: string
}

interface TeamMember {
  id: number
  ls_employee_id: string
  name: string
  role?: string
  department?: string
  is_active?: boolean
}

interface CustomerSelectionProps {
  customers: Customer[]
  selectedCustomerId: string
  setSelectedCustomerId: (customerId: string) => void
  poNumber: string
  setPoNumber: (poNumber: string) => void
  orderNumber: string
  setOrderNumber: (orderNumber: string) => void
  customOrderNumber: string
  setCustomOrderNumber: (customOrderNumber: string) => void
  useCustomOrderNumber: boolean
  setUseCustomOrderNumber: (useCustom: boolean) => void
  isProductSettingsConfirmed: boolean
  setOrderNumberStatus: (status: string) => void
  setOrderNumberMessage: (message: string) => void
  orderItems: any[]
  paymentTerms: string
  setPaymentTerms: (terms: string) => void
  tradeTerms: string
  setTradeTerms: (terms: string) => void
  isLoadingOrderNumber: boolean
  generateNewOrderNumber: () => Promise<void>
}

export default function CustomerSelection({
  customers,
  selectedCustomerId,
  setSelectedCustomerId,
  poNumber,
  setPoNumber,
  orderNumber,
  setOrderNumber,
  customOrderNumber,
  setCustomOrderNumber,
  useCustomOrderNumber,
  setUseCustomOrderNumber,
  isProductSettingsConfirmed,
  setOrderNumberStatus,
  setOrderNumberMessage,
  orderItems,
  paymentTerms,
  setPaymentTerms,
  tradeTerms,
  setTradeTerms,
  isLoadingOrderNumber,
  generateNewOrderNumber,
}: CustomerSelectionProps) {
  const [teamMembers, setTeamMembers] = useState<Record<string, string>>({})
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(true)

  // 獲取團隊成員資料
  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        setLoadingTeamMembers(true)
        const { data, error } = await supabaseClient.from("team_members").select("ls_employee_id, name")

        if (error) {
          console.error("Error fetching team members:", error)
          return
        }

        const teamMemberMap: Record<string, string> = {}
        data.forEach((member) => {
          if (member.ls_employee_id && member.name) {
            teamMemberMap[member.ls_employee_id] = member.name
          }
        })

        setTeamMembers(teamMemberMap)
      } catch (error) {
        console.error("Failed to fetch team members:", error)
      } finally {
        setLoadingTeamMembers(false)
      }
    }

    fetchTeamMembers()
  }, [])

  const selectedCustomer = customers.find((c) => c.customer_id === selectedCustomerId)

  // 獲取業務代表名稱
  const getSalesRepresentativeName = (customer: Customer) => {
    if (!customer.sales_representative) return "-"

    const memberName = teamMembers[customer.sales_representative]
    if (memberName) {
      return `${memberName} (${customer.sales_representative})`
    }

    return customer.sales_representative
  }

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId)

    // 當選擇客戶時，自動填入付款和交貨條件
    const customer = customers.find((c) => c.customer_id === customerId)
    if (customer) {
      setPaymentTerms(customer.payment_terms_specification || "")
      setTradeTerms(customer.trade_terms_specification || "")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>基本訂單資訊</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 客戶選擇 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer">客戶 *</Label>
            <CustomerCombobox
              customers={customers}
              selectedCustomerId={selectedCustomerId}
              onCustomerChange={handleCustomerChange}
              disabled={isProductSettingsConfirmed}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="poNumber">客戶PO編號 *</Label>
            <Input
              id="poNumber"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="請輸入客戶PO編號"
              disabled={isProductSettingsConfirmed}
              required
            />
          </div>
        </div>

        {/* 客戶資訊顯示 */}
        {selectedCustomer && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">客戶資訊</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">客戶全名:</span>
                <p className="text-blue-800">{selectedCustomer.customer_full_name}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">客戶簡稱:</span>
                <p className="text-blue-800">{selectedCustomer.customer_short_name || "-"}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">業務代表:</span>
                <p className="text-blue-800">
                  {loadingTeamMembers ? "載入中..." : getSalesRepresentativeName(selectedCustomer)}
                </p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">幣別:</span>
                <p className="text-blue-800">{selectedCustomer.currency || "USD"}</p>
              </div>
            </div>
          </div>
        )}

        {/* 訂單編號設定 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="orderNumber">訂單編號</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="useCustomOrderNumber"
                checked={useCustomOrderNumber}
                onCheckedChange={setUseCustomOrderNumber}
                disabled={isProductSettingsConfirmed}
              />
              <Label htmlFor="useCustomOrderNumber" className="text-sm">
                使用自訂編號
              </Label>
            </div>
          </div>

          {useCustomOrderNumber ? (
            <div className="space-y-2">
              <Input
                id="customOrderNumber"
                value={customOrderNumber}
                onChange={(e) => setCustomOrderNumber(e.target.value)}
                placeholder="請輸入自訂訂單編號"
                disabled={isProductSettingsConfirmed}
              />
              <p className="text-sm text-muted-foreground">請輸入自訂的訂單編號</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="系統自動生成"
                  disabled={isProductSettingsConfirmed}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateNewOrderNumber}
                  disabled={isLoadingOrderNumber || isProductSettingsConfirmed}
                >
                  {isLoadingOrderNumber ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">系統自動生成格式：L-YYMMXXXXX (年月+序號)</p>
            </div>
          )}
        </div>

        {/* 付款和交貨條件 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">付款條件</Label>
            <Textarea
              id="paymentTerms"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="付款條件將從客戶資料自動填入"
              rows={3}
              disabled={isProductSettingsConfirmed}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tradeTerms">交貨條件</Label>
            <Textarea
              id="tradeTerms"
              value={tradeTerms}
              onChange={(e) => setTradeTerms(e.target.value)}
              placeholder="交貨條件將從客戶資料自動填入"
              rows={3}
              disabled={isProductSettingsConfirmed}
            />
          </div>
        </div>

        {/* 狀態提示 */}
        {isProductSettingsConfirmed && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              基本資訊已確認，如需修改請先取消產品設定確認。
              <br />
              已選擇 {orderItems.length} 項產品
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
