"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getCustomersForAssignment,
  getFactoriesForAssignment,
  updateTeamMemberCustomers,
  updateTeamMemberFactories,
  updateCustomerRepresentSales,
  updateCustomerLogisticsCoordinator,
  updateFactoryQualityContact,
} from "@/app/settings/team-matrix-actions"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface AssignmentDialogProps {
  open: boolean
  onClose: () => void
  member: any | null
}

export function AssignmentDialog({ open, onClose, member }: AssignmentDialogProps) {
  const [customers, setCustomers] = useState<any[]>([])
  const [factories, setFactories] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>("")
  const [selectedFactory, setSelectedFactory] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [customerAssignmentType, setCustomerAssignmentType] = useState<"sales" | "logistics">("sales")
  const [openCustomerSelector, setOpenCustomerSelector] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && member) {
      loadData()
    }
  }, [open, member])

  const loadData = async () => {
    try {
      setLoading(true)
      const [customersData, factoriesData] = await Promise.all([
        getCustomersForAssignment(),
        getFactoriesForAssignment(),
      ])
      setCustomers(customersData)
      setFactories(factoriesData)
    } catch (error) {
      toast({
        title: "錯誤",
        description: "無法載入資料",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddCustomer = async () => {
    if (!member || !selectedCustomer) return

    try {
      const currentCustomers = member.assigned_customers || []
      if (currentCustomers.includes(selectedCustomer)) {
        toast({
          title: "提示",
          description: "此客戶已經分配給該成員",
          variant: "destructive",
        })
        return
      }

      const newCustomers = [...currentCustomers, selectedCustomer]
      const result = await updateTeamMemberCustomers(member.id, newCustomers)

      if (result.success) {
        toast({
          title: "成功",
          description: "客戶分配已更新",
        })
        setSelectedCustomer("")
        onClose()
      } else {
        toast({
          title: "錯誤",
          description: result.error || "更新失敗",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "錯誤",
        description: "操作失敗",
        variant: "destructive",
      })
    }
  }

  const handleRemoveCustomer = async (customerId: string) => {
    if (!member) return

    try {
      const currentCustomers = member.assigned_customers || []
      const newCustomers = currentCustomers.filter((id) => id !== customerId)
      const result = await updateTeamMemberCustomers(member.id, newCustomers)

      if (result.success) {
        toast({
          title: "成功",
          description: "客戶分配已移除",
        })
        onClose()
      } else {
        toast({
          title: "錯誤",
          description: result.error || "移除失敗",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "錯誤",
        description: "操作失敗",
        variant: "destructive",
      })
    }
  }

  const handleAddFactory = async () => {
    if (!member || !selectedFactory) return

    try {
      const currentFactories = member.assigned_factories || []
      if (currentFactories.includes(selectedFactory)) {
        toast({
          title: "提示",
          description: "此工廠已經分配給該成員",
          variant: "destructive",
        })
        return
      }

      const newFactories = [...currentFactories, selectedFactory]
      const result = await updateTeamMemberFactories(member.id, newFactories)

      if (result.success) {
        toast({
          title: "成功",
          description: "工廠分配已更新",
        })
        setSelectedFactory("")
        onClose()
      } else {
        toast({
          title: "錯誤",
          description: result.error || "更新失敗",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "錯誤",
        description: "操作失敗",
        variant: "destructive",
      })
    }
  }

  const handleRemoveFactory = async (factoryId: string) => {
    if (!member) return

    try {
      const currentFactories = member.assigned_factories || []
      const newFactories = currentFactories.filter((id) => id !== factoryId)
      const result = await updateTeamMemberFactories(member.id, newFactories)

      if (result.success) {
        toast({
          title: "成功",
          description: "工廠分配已移除",
        })
        onClose()
      } else {
        toast({
          title: "錯誤",
          description: result.error || "移除失敗",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "錯誤",
        description: "操作失敗",
        variant: "destructive",
      })
    }
  }

  const handleSetSalesCustomer = async (customerId: string) => {
    if (!member) return

    try {
      const result = await updateCustomerRepresentSales(customerId, member.ls_employee_id)

      if (result.success) {
        toast({
          title: "成功",
          description: "業務負責人已設定",
        })
        loadData() // 重新載入資料以更新顯示
      } else {
        toast({
          title: "錯誤",
          description: result.error || "設定失敗",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "錯誤",
        description: "操作失敗",
        variant: "destructive",
      })
    }
  }

  const handleSetLogisticsCustomer = async (customerId: string) => {
    if (!member) return

    try {
      const result = await updateCustomerLogisticsCoordinator(customerId, member.ls_employee_id)

      if (result.success) {
        toast({
          title: "成功",
          description: "船務負責人已設定",
        })
        loadData() // 重新載入資料以更新顯示
      } else {
        toast({
          title: "錯誤",
          description: result.error || "設定失敗",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "錯誤",
        description: "操作失敗",
        variant: "destructive",
      })
    }
  }

  const handleSetQualityContact = async (factoryId: string, contactType: "quality_contact1" | "quality_contact2") => {
    if (!member) return

    try {
      const result = await updateFactoryQualityContact(factoryId, contactType, member.ls_employee_id)

      if (result.success) {
        toast({
          title: "成功",
          description: "品管負責人已設定",
        })
        loadData() // 重新載入資料以更新顯示
      } else {
        toast({
          title: "錯誤",
          description: result.error || "設定失敗",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "錯誤",
        description: "操作失敗",
        variant: "destructive",
      })
    }
  }

  // 過濾客戶列表
  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      customer.customer_id?.toLowerCase().includes(searchLower) ||
      customer.customer_short_name?.toLowerCase().includes(searchLower)
    )
  })

  // 檢查客戶是否已有指定的負責人
  const hasResponsible = (customer: any, type: "sales" | "logistics") => {
    if (type === "sales") {
      return customer.sales_representative && customer.sales_representative !== member?.ls_employee_id
    } else {
      return customer.logistics_coordinator && customer.logistics_coordinator !== member?.ls_employee_id
    }
  }

  // 檢查客戶是否已由當前成員負責
  const isResponsibleBy = (customer: any, type: "sales" | "logistics") => {
    if (type === "sales") {
      return customer.sales_representative === member?.ls_employee_id
    } else {
      return customer.logistics_coordinator === member?.ls_employee_id
    }
  }

  if (!member) return null

  const shouldShowCustomers = member.role === "admin" || member.role === "sales" || member.role === "shipping"
  const shouldShowFactories = member.role === "admin" || member.role === "shipping" || member.role === "qc"

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>管理分配 - {member.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="customers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customers" disabled={!shouldShowCustomers}>
              客戶管理
            </TabsTrigger>
            <TabsTrigger value="factories" disabled={!shouldShowFactories}>
              工廠管理
            </TabsTrigger>
          </TabsList>

          {shouldShowCustomers && (
            <TabsContent value="customers" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">客戶分配</h3>

                {/* 客戶分配類型選擇 */}
                <div className="flex space-x-2 mb-4">
                  <Button
                    variant={customerAssignmentType === "sales" ? "default" : "outline"}
                    onClick={() => setCustomerAssignmentType("sales")}
                    disabled={member.role !== "admin" && member.role !== "sales"}
                  >
                    業務負責人
                  </Button>
                  <Button
                    variant={customerAssignmentType === "logistics" ? "default" : "outline"}
                    onClick={() => setCustomerAssignmentType("logistics")}
                    disabled={member.role !== "admin" && member.role !== "shipping"}
                  >
                    船務負責人
                  </Button>
                </div>

                {/* 客戶選擇器 */}
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2">
                    <Popover open={openCustomerSelector} onOpenChange={setOpenCustomerSelector}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCustomerSelector}
                          className="w-full justify-between"
                        >
                          {selectedCustomer
                            ? customers.find((customer) => customer.customer_id === selectedCustomer)
                                ?.customer_short_name
                            : "選擇客戶..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput placeholder="搜尋客戶..." />
                          <CommandList>
                            <CommandEmpty>找不到客戶</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="h-[300px]">
                                {filteredCustomers.map((customer) => (
                                  <CommandItem
                                    key={customer.customer_id}
                                    value={customer.customer_id}
                                    onSelect={() => {
                                      setSelectedCustomer(
                                        customer.customer_id === selectedCustomer ? "" : customer.customer_id,
                                      )
                                      setOpenCustomerSelector(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedCustomer === customer.customer_id ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span>{customer.customer_short_name}</span>
                                      <span className="text-xs text-muted-foreground">{customer.customer_id}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </ScrollArea>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    <Button
                      onClick={() => {
                        if (customerAssignmentType === "sales") {
                          handleSetSalesCustomer(selectedCustomer)
                        } else {
                          handleSetLogisticsCustomer(selectedCustomer)
                        }
                        setSelectedCustomer("")
                      }}
                      disabled={!selectedCustomer}
                    >
                      設定為{customerAssignmentType === "sales" ? "業務" : "船務"}負責人
                    </Button>
                  </div>

                  {/* 客戶列表 */}
                  <div className="border rounded-md">
                    <div className="p-2 bg-muted/50 border-b flex justify-between items-center">
                      <h4 className="font-medium">客戶列表</h4>
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="搜尋客戶..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="h-8 w-[200px]"
                        />
                      </div>
                    </div>
                    <ScrollArea className="h-[300px]">
                      <div className="p-2 space-y-2">
                        {filteredCustomers.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">沒有找到符合條件的客戶</div>
                        ) : (
                          filteredCustomers.map((customer) => {
                            const isSalesResponsible = isResponsibleBy(customer, "sales")
                            const isLogisticsResponsible = isResponsibleBy(customer, "logistics")
                            const hasSalesResponsible = hasResponsible(customer, "sales")
                            const hasLogisticsResponsible = hasResponsible(customer, "logistics")

                            return (
                              <div
                                key={customer.customer_id}
                                className="flex justify-between items-center p-2 border rounded-md hover:bg-muted/30"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{customer.customer_short_name}</span>
                                  <span className="text-xs text-muted-foreground">{customer.customer_id}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {customerAssignmentType === "sales" && (
                                    <>
                                      {isSalesResponsible ? (
                                        <Badge variant="default" className="flex items-center space-x-1">
                                          <span>業務負責人</span>
                                          <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => handleSetSalesCustomer(customer.customer_id)}
                                          />
                                        </Badge>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleSetSalesCustomer(customer.customer_id)}
                                          disabled={hasSalesResponsible}
                                          title={hasSalesResponsible ? "此客戶已有業務負責人" : ""}
                                        >
                                          {hasSalesResponsible ? "已有負責人" : "設為業務負責人"}
                                        </Button>
                                      )}
                                    </>
                                  )}

                                  {customerAssignmentType === "logistics" && (
                                    <>
                                      {isLogisticsResponsible ? (
                                        <Badge variant="default" className="flex items-center space-x-1">
                                          <span>船務負責人</span>
                                          <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => handleSetLogisticsCustomer(customer.customer_id)}
                                          />
                                        </Badge>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleSetLogisticsCustomer(customer.customer_id)}
                                          disabled={hasLogisticsResponsible}
                                          title={hasLogisticsResponsible ? "此客戶已有船務負責人" : ""}
                                        >
                                          {hasLogisticsResponsible ? "已有負責人" : "設為船務負責人"}
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {shouldShowFactories && (
            <TabsContent value="factories" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">工廠分配</h3>
                <p className="text-muted-foreground">工廠分配功能正在開發中...</p>
              </div>
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            關閉
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
