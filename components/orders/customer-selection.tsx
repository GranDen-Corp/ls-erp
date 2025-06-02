"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CustomerCombobox } from "@/components/ui/customer-combobox"
import { Switch } from "@/components/ui/switch"
import { RefreshCw, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabaseClient } from "@/lib/supabase-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Customer {
  customer_id: string
  customer_full_name: string
  customer_short_name?: string
  payment_terms_specification?: string
  trade_terms_specification?: string
  currency?: string
  sales_representative?: string
  logistics_coordinator?: string
}

interface TeamMember {
  id: number
  ls_employee_id: string
  name: string
  role?: string
  department?: string
  is_active?: boolean
}

interface Port {
  un_locode: string
  port_name_en: string
  port_name_zh: string
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
  portOfLoading: string
  setPortOfLoading: (port: string) => void
  portOfDischarge: string
  setPortOfDischarge: (port: string) => void
  ports: Array<{ un_locode: string; port_name_en: string; port_name_zh: string }> | undefined
  onCreateOrder: () => Promise<void>
  isCreatingOrder: boolean
  orderCreated: boolean
  getPortDisplayName?: (unLocode: string) => string
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
  portOfLoading,
  setPortOfLoading,
  portOfDischarge,
  setPortOfDischarge,
  ports = [], // 提供默認空陣列，避免 undefined
  onCreateOrder,
  isCreatingOrder,
  orderCreated,
  getPortDisplayName,
}: CustomerSelectionProps) {
  const [teamMembers, setTeamMembers] = useState<Record<string, string>>({})
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(true)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [loadingPorts, setLoadingPorts] = useState<boolean>(false)
  const [localPorts, setLocalPorts] = useState<
    Array<{ un_locode: string; port_name_en: string; port_name_zh: string }>
  >([])

  // 如果外部沒有提供 ports，則自行加載
  useEffect(() => {
    async function loadPorts() {
      if (ports && ports.length > 0) {
        setLocalPorts(ports)
        return
      }

      try {
        setLoadingPorts(true)
        const supabase = supabaseClient
        const { data, error } = await supabase
          .from("ports")
          .select("un_locode, port_name_en, port_name_zh")
          .order("port_name_en")

        if (error) {
          console.error("Error loading ports:", error)
          return
        }

        setLocalPorts(data || [])
      } catch (error) {
        console.error("Failed to fetch ports:", error)
      } finally {
        setLoadingPorts(false)
      }
    }

    loadPorts()
  }, [ports])

  const validateRequiredFields = () => {
    const errors: Record<string, string> = {}

    if (!selectedCustomerId) errors.customer = "請選擇客戶"
    if (!poNumber.trim()) errors.poNumber = "請輸入客戶PO編號"
    if (!portOfLoading) errors.portOfLoading = "請選擇出貨港"
    if (!portOfDischarge) errors.portOfDischarge = "請選擇到貨港"
    if (!paymentTerms.trim()) errors.paymentTerms = "請輸入付款條件"
    if (!tradeTerms.trim()) errors.tradeTerms = "請輸入交貨條件"

    const finalOrderNumber = useCustomOrderNumber ? customOrderNumber : orderNumber
    if (!finalOrderNumber.trim()) errors.orderNumber = "請設定訂單編號"

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateOrder = async () => {
    if (validateRequiredFields()) {
      await onCreateOrder()
    }
  }

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

  // 獲取船務負責人名稱
  const getLogisticsCoordinatorName = (customer: Customer) => {
    if (!customer.logistics_coordinator) return "-"

    const memberName = teamMembers[customer.logistics_coordinator]
    if (memberName) {
      return `${memberName} (${customer.logistics_coordinator})`
    }

    return customer.logistics_coordinator
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

  // 處理自訂編號切換
  const handleCustomOrderNumberToggle = (checked: boolean) => {
    setUseCustomOrderNumber(checked)

    // 如果從自訂切換到自動，確保顯示自動生成的編號
    if (!checked && orderNumber) {
      // 如果已有自動生成的編號，則使用它
      setCustomOrderNumber("") // 清空自訂編號
    } else if (checked) {
      // 如果從自動切換到自訂，可以將當前自動編號作為自訂編號的初始值
      if (orderNumber && customOrderNumber === "") {
        setCustomOrderNumber(orderNumber)
      }
    }
  }

  // 使用本地加載的港口數據
  const portsToDisplay = localPorts.length > 0 ? localPorts : []

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
              disabled={orderCreated}
            />
            {validationErrors.customer && <p className="text-sm text-red-500">{validationErrors.customer}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="poNumber">客戶PO編號 *</Label>
            <Input
              id="poNumber"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="請輸入客戶PO編號"
              disabled={orderCreated}
              required
            />
            {validationErrors.poNumber && <p className="text-sm text-red-500">{validationErrors.poNumber}</p>}
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
                <span className="text-blue-700 font-medium">負責業務:</span>
                <p className="text-blue-800">
                  {loadingTeamMembers ? "載入中..." : getSalesRepresentativeName(selectedCustomer)}
                </p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">負責船務:</span>
                <p className="text-blue-800">
                  {loadingTeamMembers ? "載入中..." : getLogisticsCoordinatorName(selectedCustomer)}
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
            {!orderCreated && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="useCustomOrderNumber"
                  checked={useCustomOrderNumber}
                  onCheckedChange={handleCustomOrderNumberToggle}
                  disabled={orderCreated}
                />
                <Label htmlFor="useCustomOrderNumber" className="text-sm">
                  使用自訂編號
                </Label>
              </div>
            )}
          </div>

          {orderCreated ? (
            <div className="space-y-2">
              <Input
                id="orderNumberDisplay"
                value={useCustomOrderNumber ? customOrderNumber : orderNumber}
                disabled={true}
                className="bg-gray-50 font-medium"
              />
              <p className="text-sm text-green-600">✓ 訂單編號已確定</p>
            </div>
          ) : useCustomOrderNumber ? (
            <div className="space-y-2">
              <Input
                id="customOrderNumber"
                value={customOrderNumber}
                onChange={(e) => setCustomOrderNumber(e.target.value)}
                placeholder="請輸入自訂訂單編號 (格式: YYMMXXXXX)"
                disabled={orderCreated}
                maxLength={9}
              />
              <p className="text-sm text-orange-600">請輸入9位數字格式的訂單編號 (YYMMXXXXX)</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder={isLoadingOrderNumber ? "生成中..." : "系統自動生成"}
                  disabled={true}
                  className="flex-1 bg-gray-50"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateNewOrderNumber}
                  disabled={isLoadingOrderNumber || orderCreated}
                >
                  {isLoadingOrderNumber ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">系統自動生成格式：YYMMXXXXX (年月+5位序號，每月重新計算)</p>
            </div>
          )}
          {validationErrors.orderNumber && <p className="text-sm text-red-500">{validationErrors.orderNumber}</p>}
        </div>

        {/* 港口設定 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="portOfLoading">出貨港 *</Label>
            <Select value={portOfLoading} onValueChange={setPortOfLoading} disabled={loadingPorts}>
              <SelectTrigger className={validationErrors.portOfLoading ? "border-red-500" : ""}>
                <SelectValue placeholder={loadingPorts ? "載入中..." : "請選擇出貨港"} />
              </SelectTrigger>
              <SelectContent>
                {loadingPorts ? (
                  <SelectItem value="loading" disabled>
                    載入中...
                  </SelectItem>
                ) : portsToDisplay.length > 0 ? (
                  portsToDisplay.map((port) => (
                    <SelectItem key={port.un_locode} value={port.un_locode}>
                      {port.port_name_en}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-ports" disabled>
                    無可用港口
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {validationErrors.portOfLoading && <p className="text-sm text-red-500">{validationErrors.portOfLoading}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="portOfDischarge">到貨港 *</Label>
            <Select value={portOfDischarge} onValueChange={setPortOfDischarge} disabled={loadingPorts}>
              <SelectTrigger className={validationErrors.portOfDischarge ? "border-red-500" : ""}>
                <SelectValue placeholder={loadingPorts ? "載入中..." : "請選擇到貨港"} />
              </SelectTrigger>
              <SelectContent>
                {loadingPorts ? (
                  <SelectItem value="loading" disabled>
                    載入中...
                  </SelectItem>
                ) : portsToDisplay.length > 0 ? (
                  portsToDisplay.map((port) => (
                    <SelectItem key={port.un_locode} value={port.un_locode}>
                      {port.port_name_en}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-ports" disabled>
                    無可用港口
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {validationErrors.portOfDischarge && (
              <p className="text-sm text-red-500">{validationErrors.portOfDischarge}</p>
            )}
          </div>
        </div>

        {/* 付款和交貨條件 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">付款條件 *</Label>
            <Textarea
              id="paymentTerms"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="請輸入付款條件"
              rows={3}
              className={validationErrors.paymentTerms ? "border-red-500" : ""}
            />
            {validationErrors.paymentTerms && <p className="text-sm text-red-500">{validationErrors.paymentTerms}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tradeTerms">交貨條件 *</Label>
            <Textarea
              id="tradeTerms"
              value={tradeTerms}
              onChange={(e) => setTradeTerms(e.target.value)}
              placeholder="請輸入交貨條件"
              rows={3}
              className={validationErrors.tradeTerms ? "border-red-500" : ""}
            />
            {validationErrors.tradeTerms && <p className="text-sm text-red-500">{validationErrors.tradeTerms}</p>}
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

        {/* 開立訂單按鈕 */}
        {!orderCreated && (
          <div className="flex justify-center pt-4 border-t">
            <Button
              onClick={handleCreateOrder}
              disabled={isCreatingOrder || loadingPorts}
              className="bg-green-600 hover:bg-green-700 min-w-[200px]"
              size="lg"
            >
              {isCreatingOrder ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  開立訂單中...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  開立訂單
                </>
              )}
            </Button>
          </div>
        )}

        {orderCreated && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">訂單已開立</AlertTitle>
            <AlertDescription className="text-green-700">
              訂單編號 {useCustomOrderNumber ? customOrderNumber : orderNumber} 已成功建立，現在可以繼續添加產品。
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
