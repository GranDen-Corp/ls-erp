"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus } from "lucide-react"
import {
  getCustomersForAssignment,
  getFactoriesForAssignment,
  updateTeamMemberCustomers,
  updateTeamMemberFactories,
  updateCustomerSales,
  updateSupplierQualityContact,
} from "@/app/settings/team-matrix-actions"
import type { TeamMemberWithRelations } from "@/types/team-matrix"
import { useToast } from "@/hooks/use-toast"

interface AssignmentDialogProps {
  open: boolean
  onClose: () => void
  member: TeamMemberWithRelations | null
}

export function AssignmentDialog({ open, onClose, member }: AssignmentDialogProps) {
  const [customers, setCustomers] = useState<any[]>([])
  const [factories, setFactories] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>("")
  const [selectedFactory, setSelectedFactory] = useState<string>("")
  const [loading, setLoading] = useState(false)
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
      const result = await updateCustomerSales(customerId, member.ls_employee_id)

      if (result.success) {
        toast({
          title: "成功",
          description: "業務負責人已設定",
        })
        onClose()
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
      const result = await updateSupplierQualityContact(factoryId, contactType, member.ls_employee_id)

      if (result.success) {
        toast({
          title: "成功",
          description: "品管負責人已設定",
        })
        onClose()
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

  if (!member) return null

  const shouldShowCustomers = member.role === "admin" || member.role === "sales"
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

                {/* 1對多分配 */}
                <div className="space-y-2">
                  <h4 className="font-medium">分配客戶 (1對多)</h4>
                  <div className="flex gap-2">
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="選擇客戶" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers
                          .filter((c) => !member.assigned_customers?.includes(c.customer_id))
                          .map((customer) => (
                            <SelectItem key={customer.customer_id} value={customer.customer_id}>
                              {customer.customer_short_name || customer.customer_id}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddCustomer} disabled={!selectedCustomer}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {member.assigned_customers_data?.map((customer) => (
                      <Badge key={customer.customer_id} variant="outline" className="flex items-center gap-1">
                        {customer.customer_short_name || customer.customer_id}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => handleRemoveCustomer(customer.customer_id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 1對1業務負責人 */}
                {member.role === "sales" && (
                  <div className="space-y-2">
                    <h4 className="font-medium">設為業務負責人 (1對1)</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {customers
                        .filter((c) => !c.client_sales || c.client_sales === member.ls_employee_id)
                        .map((customer) => (
                          <div
                            key={customer.customer_id}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <span className="text-sm">{customer.customer_short_name || customer.customer_id}</span>
                            <Button
                              size="sm"
                              variant={customer.client_sales === member.ls_employee_id ? "default" : "outline"}
                              onClick={() => handleSetSalesCustomer(customer.customer_id)}
                            >
                              {customer.client_sales === member.ls_employee_id ? "已設定" : "設定"}
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {shouldShowFactories && (
            <TabsContent value="factories" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">工廠分配</h3>

                {/* 1對多分配 */}
                <div className="space-y-2">
                  <h4 className="font-medium">分配工廠 (1對多)</h4>
                  <div className="flex gap-2">
                    <Select value={selectedFactory} onValueChange={setSelectedFactory}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="選擇工廠" />
                      </SelectTrigger>
                      <SelectContent>
                        {factories
                          .filter((f) => !member.assigned_factories?.includes(f.factory_id))
                          .map((factory) => (
                            <SelectItem key={factory.factory_id} value={factory.factory_id}>
                              {factory.supplier_short_name || factory.supplier_name || factory.factory_id}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddFactory} disabled={!selectedFactory}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {member.assigned_factories_data?.map((factory) => (
                      <Badge key={factory.factory_id} variant="outline" className="flex items-center gap-1">
                        {factory.supplier_short_name || factory.supplier_name || factory.factory_id}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => handleRemoveFactory(factory.factory_id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 1對1品管負責人 */}
                {member.role === "qc" && (
                  <div className="space-y-2">
                    <h4 className="font-medium">設為品管負責人 (1對1)</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {factories.map((factory) => (
                        <div key={factory.factory_id} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">
                            {factory.supplier_short_name || factory.supplier_name || factory.factory_id}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={factory.quality_contact1 === member.ls_employee_id ? "default" : "outline"}
                              onClick={() => handleSetQualityContact(factory.factory_id, "quality_contact1")}
                            >
                              {factory.quality_contact1 === member.ls_employee_id ? "主要負責人" : "設為主要"}
                            </Button>
                            <Button
                              size="sm"
                              variant={factory.quality_contact2 === member.ls_employee_id ? "default" : "outline"}
                              onClick={() => handleSetQualityContact(factory.factory_id, "quality_contact2")}
                            >
                              {factory.quality_contact2 === member.ls_employee_id ? "次要負責人" : "設為次要"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
