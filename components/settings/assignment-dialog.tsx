"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getCustomersForAssignment,
  getFactoriesForAssignment,
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
  const [factorySearchTerm, setFactorySearchTerm] = useState("")
  const [customerAssignmentType, setCustomerAssignmentType] = useState<"sales" | "logistics">("sales")
  const [factoryAssignmentType, setFactoryAssignmentType] = useState<"quality_contact1" | "quality_contact2">(
    "quality_contact1",
  )
  const [openCustomerSelector, setOpenCustomerSelector] = useState(false)
  const [openFactorySelector, setOpenFactorySelector] = useState(false)
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

  const handleSetSalesCustomer = async (customerId: string) => {
    if (!member) return

    try {
      const result = await updateCustomerRepresentSales(customerId, member.ls_employee_id)

      if (result.success) {
        toast({
          title: "成功",
          description: "業務負責人已設定",
        })
        loadData()
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
        loadData()
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
        loadData()
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

  const handleRemoveQualityContact = async (
    factoryId: string,
    contactType: "quality_contact1" | "quality_contact2",
  ) => {
    if (!member) return

    try {
      const result = await updateFactoryQualityContact(factoryId, contactType, null)

      if (result.success) {
        toast({
          title: "成功",
          description: "品管負責人已移除",
        })
        loadData()
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

  // 過濾客戶列表
  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      customer.customer_id?.toLowerCase().includes(searchLower) ||
      customer.customer_short_name?.toLowerCase().includes(searchLower)
    )
  })

  // 過濾工廠列表
  const filteredFactories = factories.filter((factory) => {
    const searchLower = factorySearchTerm.toLowerCase()
    return (
      factory.factory_id?.toLowerCase().includes(searchLower) ||
      factory.factory_name?.toLowerCase().includes(searchLower) ||
      factory.factory_short_name?.toLowerCase().includes(searchLower)
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

  // 檢查工廠是否已由當前成員負責
  const isFactoryResponsibleBy = (factory: any, contactType: "quality_contact1" | "quality_contact2") => {
    return factory[contactType] === member?.ls_employee_id
  }

  // 檢查工廠是否已有其他負責人
  const hasFactoryResponsible = (factory: any, contactType: "quality_contact1" | "quality_contact2") => {
    return factory[contactType] && factory[contactType] !== member?.ls_employee_id
  }

  if (!member) return null

  const shouldShowCustomers = member.role === "admin" || member.role === "sales" || member.role === "shipping"
  const shouldShowFactories = member.role === "admin" || member.role === "qc"

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
                                            onClick={() => updateCustomerRepresentSales(customer.customer_id, null)}
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
                                            onClick={() =>
                                              updateCustomerLogisticsCoordinator(customer.customer_id, null)
                                            }
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

                {/* 工廠分配類型選擇 */}
                <div className="flex space-x-2 mb-4">
                  <Button
                    variant={factoryAssignmentType === "quality_contact1" ? "default" : "outline"}
                    onClick={() => setFactoryAssignmentType("quality_contact1")}
                  >
                    品管聯絡人1
                  </Button>
                  <Button
                    variant={factoryAssignmentType === "quality_contact2" ? "default" : "outline"}
                    onClick={() => setFactoryAssignmentType("quality_contact2")}
                  >
                    品管聯絡人2
                  </Button>
                </div>

                {/* 工廠選擇器 */}
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2">
                    <Popover open={openFactorySelector} onOpenChange={setOpenFactorySelector}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openFactorySelector}
                          className="w-full justify-between"
                        >
                          {selectedFactory
                            ? factories.find((factory) => factory.factory_id === selectedFactory)?.factory_name
                            : "選擇工廠..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput placeholder="搜尋工廠..." />
                          <CommandList>
                            <CommandEmpty>找不到工廠</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="h-[300px]">
                                {filteredFactories.map((factory) => (
                                  <CommandItem
                                    key={factory.factory_id}
                                    value={factory.factory_id}
                                    onSelect={() => {
                                      setSelectedFactory(
                                        factory.factory_id === selectedFactory ? "" : factory.factory_id,
                                      )
                                      setOpenFactorySelector(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedFactory === factory.factory_id ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span>{factory.factory_name}</span>
                                      <span className="text-xs text-muted-foreground">{factory.factory_id}</span>
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
                        handleSetQualityContact(selectedFactory, factoryAssignmentType)
                        setSelectedFactory("")
                      }}
                      disabled={!selectedFactory}
                    >
                      設定為{factoryAssignmentType === "quality_contact1" ? "品管聯絡人1" : "品管聯絡人2"}
                    </Button>
                  </div>

                  {/* 工廠列表 */}
                  <div className="border rounded-md">
                    <div className="p-2 bg-muted/50 border-b flex justify-between items-center">
                      <h4 className="font-medium">工廠列表</h4>
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="搜尋工廠..."
                          value={factorySearchTerm}
                          onChange={(e) => setFactorySearchTerm(e.target.value)}
                          className="h-8 w-[200px]"
                        />
                      </div>
                    </div>
                    <ScrollArea className="h-[300px]">
                      <div className="p-2 space-y-2">
                        {filteredFactories.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">沒有找到符合條件的工廠</div>
                        ) : (
                          filteredFactories.map((factory) => {
                            const isContact1Responsible = isFactoryResponsibleBy(factory, "quality_contact1")
                            const isContact2Responsible = isFactoryResponsibleBy(factory, "quality_contact2")
                            const hasContact1Responsible = hasFactoryResponsible(factory, "quality_contact1")
                            const hasContact2Responsible = hasFactoryResponsible(factory, "quality_contact2")

                            return (
                              <div
                                key={factory.factory_id}
                                className="flex justify-between items-center p-2 border rounded-md hover:bg-muted/30"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{factory.factory_name}</span>
                                  <span className="text-xs text-muted-foreground">{factory.factory_id}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {factoryAssignmentType === "quality_contact1" && (
                                    <>
                                      {isContact1Responsible ? (
                                        <Badge variant="default" className="flex items-center space-x-1">
                                          <span>品管聯絡人1</span>
                                          <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() =>
                                              handleRemoveQualityContact(factory.factory_id, "quality_contact1")
                                            }
                                          />
                                        </Badge>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            handleSetQualityContact(factory.factory_id, "quality_contact1")
                                          }
                                          disabled={hasContact1Responsible}
                                          title={hasContact1Responsible ? "此工廠已有品管聯絡人1" : ""}
                                        >
                                          {hasContact1Responsible ? "已有聯絡人1" : "設為品管聯絡人1"}
                                        </Button>
                                      )}
                                    </>
                                  )}

                                  {factoryAssignmentType === "quality_contact2" && (
                                    <>
                                      {isContact2Responsible ? (
                                        <Badge variant="default" className="flex items-center space-x-1">
                                          <span>品管聯絡人2</span>
                                          <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() =>
                                              handleRemoveQualityContact(factory.factory_id, "quality_contact2")
                                            }
                                          />
                                        </Badge>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            handleSetQualityContact(factory.factory_id, "quality_contact2")
                                          }
                                          disabled={hasContact2Responsible}
                                          title={hasContact2Responsible ? "此工廠已有品管聯絡人2" : ""}
                                        >
                                          {hasContact2Responsible ? "已有聯絡人2" : "設為品管聯絡人2"}
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
