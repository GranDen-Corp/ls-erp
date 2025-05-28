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
  updateSupplierQualityContact,
} from "@/app/settings/team-matrix-actions"
import { useToast } from "@/hooks/use-toast"

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
                <p className="text-muted-foreground">客戶分配功能正在開發中...</p>
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
