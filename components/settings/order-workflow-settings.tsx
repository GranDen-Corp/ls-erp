"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Plus, Save, Settings, Trash } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { OrderStatusFlowChart } from "@/components/settings/order-status-flow-chart"

// 模擬訂單狀態數據
const initialOrderStatuses = [
  { id: "1", name: "待確認", color: "#f59e0b", isDefault: true, isActive: true },
  { id: "2", name: "進行中", color: "#3b82f6", isDefault: false, isActive: true },
  { id: "3", name: "驗貨完成", color: "#10b981", isDefault: false, isActive: true },
  { id: "4", name: "已出貨", color: "#8b5cf6", isDefault: false, isActive: true },
  { id: "5", name: "待收款", color: "#ec4899", isDefault: false, isActive: true },
  { id: "6", name: "結案", color: "#6b7280", isDefault: false, isActive: true },
]

// 模擬訂單狀態流程規則
const initialWorkflowRules = [
  {
    id: "1",
    fromStatus: "1", // 待確認
    toStatus: "2", // 進行中
    triggerType: "manual", // 手動觸發
    triggerCondition: null,
    requireApproval: false,
    approvalRoles: [],
    notifyRoles: ["sales"],
    isActive: true,
  },
  {
    id: "2",
    fromStatus: "2", // 進行中
    toStatus: "3", // 驗貨完成
    triggerType: "event", // 事件觸發
    triggerCondition: "qc_passed", // 品檢通過事件
    requireApproval: false,
    approvalRoles: [],
    notifyRoles: ["sales", "shipping"],
    isActive: true,
  },
  {
    id: "3",
    fromStatus: "3", // 驗貨完成
    toStatus: "4", // 已出貨
    triggerType: "event", // 事件觸發
    triggerCondition: "shipment_created", // 創建出貨單事件
    requireApproval: false,
    approvalRoles: [],
    notifyRoles: ["sales", "shipping", "finance"],
    isActive: true,
  },
  {
    id: "4",
    fromStatus: "4", // 已出貨
    toStatus: "5", // 待收款
    triggerType: "event", // 事件觸發
    triggerCondition: "invoice_created", // 創建發票事件
    requireApproval: false,
    approvalRoles: [],
    notifyRoles: ["sales", "finance"],
    isActive: true,
  },
  {
    id: "5",
    fromStatus: "5", // 待收款
    toStatus: "6", // 結案
    triggerType: "event", // 事件觸發
    triggerCondition: "payment_received", // 收到付款事件
    requireApproval: false,
    approvalRoles: [],
    notifyRoles: ["sales", "finance"],
    isActive: true,
  },
]

// 模擬自動化觸發條件
const triggerConditions = [
  { id: "qc_passed", name: "品檢通過", description: "當品檢報告標記為通過時" },
  { id: "shipment_created", name: "創建出貨單", description: "當出貨單被創建時" },
  { id: "invoice_created", name: "創建發票", description: "當發票被創建時" },
  { id: "payment_received", name: "收到付款", description: "當系統記錄收到付款時" },
  { id: "days_passed", name: "天數經過", description: "當訂單在當前狀態超過指定天數時" },
]

// 模擬角色列表
const roles = [
  { id: "sales", name: "業務" },
  { id: "shipping", name: "船務" },
  { id: "qc", name: "品管" },
  { id: "finance", name: "財務" },
  { id: "admin", name: "管理員" },
]

interface OrderStatus {
  id: string
  name: string
  color: string
  isDefault: boolean
  isActive: boolean
}

interface WorkflowRule {
  id: string
  fromStatus: string
  toStatus: string
  triggerType: "manual" | "event" | "time"
  triggerCondition: string | null
  requireApproval: boolean
  approvalRoles: string[]
  notifyRoles: string[]
  isActive: boolean
}

export function OrderWorkflowSettings() {
  const [statuses, setStatuses] = useState<OrderStatus[]>(initialOrderStatuses)
  const [workflowRules, setWorkflowRules] = useState<WorkflowRule[]>(initialWorkflowRules)
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false)
  const [currentRule, setCurrentRule] = useState<WorkflowRule | null>(null)
  const [isNewRule, setIsNewRule] = useState(false)
  const [activeTab, setActiveTab] = useState("rules")

  const handleAddRule = () => {
    setCurrentRule({
      id: `${Date.now()}`,
      fromStatus: "",
      toStatus: "",
      triggerType: "manual",
      triggerCondition: null,
      requireApproval: false,
      approvalRoles: [],
      notifyRoles: [],
      isActive: true,
    })
    setIsNewRule(true)
    setIsRuleDialogOpen(true)
  }

  const handleEditRule = (rule: WorkflowRule) => {
    setCurrentRule({ ...rule })
    setIsNewRule(false)
    setIsRuleDialogOpen(true)
  }

  const handleDeleteRule = (id: string) => {
    setWorkflowRules(workflowRules.filter((rule) => rule.id !== id))
  }

  const handleSaveRule = () => {
    if (!currentRule) return

    if (isNewRule) {
      setWorkflowRules([...workflowRules, currentRule])
    } else {
      setWorkflowRules(workflowRules.map((rule) => (rule.id === currentRule.id ? currentRule : rule)))
    }

    setIsRuleDialogOpen(false)
  }

  const handleToggleRuleActive = (id: string, isActive: boolean) => {
    setWorkflowRules(workflowRules.map((rule) => (rule.id === id ? { ...rule, isActive } : rule)))
  }

  const getStatusName = (id: string) => {
    const status = statuses.find((s) => s.id === id)
    return status ? status.name : id
  }

  const getStatusColor = (id: string) => {
    const status = statuses.find((s) => s.id === id)
    return status ? status.color : "#000000"
  }

  const getTriggerTypeName = (type: string) => {
    switch (type) {
      case "manual":
        return "手動觸發"
      case "event":
        return "事件觸發"
      case "time":
        return "時間觸發"
      default:
        return type
    }
  }

  const getTriggerConditionName = (conditionId: string | null) => {
    if (!conditionId) return "無"
    const condition = triggerConditions.find((c) => c.id === conditionId)
    return condition ? condition.name : conditionId
  }

  const getRoleNames = (roleIds: string[]) => {
    return roleIds
      .map((id) => {
        const role = roles.find((r) => r.id === id)
        return role ? role.name : id
      })
      .join(", ")
  }

  const handleToggleApprovalRole = (roleId: string) => {
    if (!currentRule) return

    const newApprovalRoles = currentRule.approvalRoles.includes(roleId)
      ? currentRule.approvalRoles.filter((id) => id !== roleId)
      : [...currentRule.approvalRoles, roleId]

    setCurrentRule({
      ...currentRule,
      approvalRoles: newApprovalRoles,
    })
  }

  const handleToggleNotifyRole = (roleId: string) => {
    if (!currentRule) return

    const newNotifyRoles = currentRule.notifyRoles.includes(roleId)
      ? currentRule.notifyRoles.filter((id) => id !== roleId)
      : [...currentRule.notifyRoles, roleId]

    setCurrentRule({
      ...currentRule,
      notifyRoles: newNotifyRoles,
    })
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rules">流程規則</TabsTrigger>
          <TabsTrigger value="visualization">流程圖</TabsTrigger>
          <TabsTrigger value="automation">自動化設定</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-medium">訂單狀態流程規則</h3>
              <p className="text-sm text-muted-foreground">設定訂單狀態之間的流轉規則</p>
            </div>
            <Button onClick={handleAddRule}>
              <Plus className="mr-2 h-4 w-4" />
              新增規則
            </Button>
          </div>

          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left font-medium">從狀態</th>
                  <th className="p-2 text-left font-medium"></th>
                  <th className="p-2 text-left font-medium">至狀態</th>
                  <th className="p-2 text-left font-medium">觸發類型</th>
                  <th className="p-2 text-left font-medium">觸發條件</th>
                  <th className="p-2 text-left font-medium">需要審批</th>
                  <th className="p-2 text-left font-medium">通知角色</th>
                  <th className="p-2 text-left font-medium">啟用</th>
                  <th className="p-2 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {workflowRules.map((rule) => (
                  <tr key={rule.id} className="border-b">
                    <td className="p-2">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: getStatusColor(rule.fromStatus) }}
                        ></div>
                        {getStatusName(rule.fromStatus)}
                      </div>
                    </td>
                    <td className="p-2">
                      <ArrowRight className="h-4 w-4" />
                    </td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: getStatusColor(rule.toStatus) }}
                        ></div>
                        {getStatusName(rule.toStatus)}
                      </div>
                    </td>
                    <td className="p-2">{getTriggerTypeName(rule.triggerType)}</td>
                    <td className="p-2">{getTriggerConditionName(rule.triggerCondition)}</td>
                    <td className="p-2">{rule.requireApproval ? "是" : "否"}</td>
                    <td className="p-2">{getRoleNames(rule.notifyRoles) || "無"}</td>
                    <td className="p-2">
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={(checked) => handleToggleRuleActive(rule.id, checked)}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditRule(rule)}>
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {workflowRules.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-muted-foreground">
                      尚未設定任何流程規則
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="visualization">
          <Card>
            <CardHeader>
              <CardTitle>訂單狀態流程圖</CardTitle>
              <CardDescription>視覺化顯示訂單狀態流程</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderStatusFlowChart statuses={statuses} workflowRules={workflowRules} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle>自動化設定</CardTitle>
              <CardDescription>設定訂單狀態自動更新的條件和行為</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="auto-update" defaultChecked />
                  <Label htmlFor="auto-update">啟用訂單狀態自動更新</Label>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>自動更新檢查頻率</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue placeholder="選擇檢查頻率" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">每小時</SelectItem>
                      <SelectItem value="daily">每天</SelectItem>
                      <SelectItem value="realtime">即時（事件觸發）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>自動通知設定</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="notify-email" defaultChecked />
                      <Label htmlFor="notify-email">電子郵件通知</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="notify-system" defaultChecked />
                      <Label htmlFor="notify-system">系統內通知</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 編輯規則對話框 */}
      <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isNewRule ? "新增流程規則" : "編輯流程規則"}</DialogTitle>
            <DialogDescription>
              {isNewRule ? "新增一個訂單狀態流程規則" : "編輯現有的訂單狀態流程規則"}
            </DialogDescription>
          </DialogHeader>

          {currentRule && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromStatus">從狀態</Label>
                  <Select
                    value={currentRule.fromStatus}
                    onValueChange={(value) =>
                      setCurrentRule({
                        ...currentRule,
                        fromStatus: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇起始狀態" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toStatus">至狀態</Label>
                  <Select
                    value={currentRule.toStatus}
                    onValueChange={(value) =>
                      setCurrentRule({
                        ...currentRule,
                        toStatus: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇目標狀態" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="triggerType">觸發類型</Label>
                <Select
                  value={currentRule.triggerType}
                  onValueChange={(value: "manual" | "event" | "time") =>
                    setCurrentRule({
                      ...currentRule,
                      triggerType: value,
                      triggerCondition: value === "manual" ? null : currentRule.triggerCondition,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇觸發類型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">手動觸發</SelectItem>
                    <SelectItem value="event">事件觸發</SelectItem>
                    <SelectItem value="time">時間觸發</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {currentRule.triggerType !== "manual" && (
                <div className="space-y-2">
                  <Label htmlFor="triggerCondition">觸發條件</Label>
                  <Select
                    value={currentRule.triggerCondition || ""}
                    onValueChange={(value) =>
                      setCurrentRule({
                        ...currentRule,
                        triggerCondition: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇觸發條件" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerConditions.map((condition) => (
                        <SelectItem key={condition.id} value={condition.id}>
                          {condition.name} - {condition.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireApproval"
                    checked={currentRule.requireApproval}
                    onCheckedChange={(checked) =>
                      setCurrentRule({
                        ...currentRule,
                        requireApproval: checked,
                      })
                    }
                  />
                  <Label htmlFor="requireApproval">需要審批</Label>
                </div>
              </div>

              {currentRule.requireApproval && (
                <div className="space-y-2">
                  <Label>審批角色</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Switch
                          id={`approval-${role.id}`}
                          checked={currentRule.approvalRoles.includes(role.id)}
                          onCheckedChange={() => handleToggleApprovalRole(role.id)}
                        />
                        <Label htmlFor={`approval-${role.id}`}>{role.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>通知角色</Label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Switch
                        id={`notify-${role.id}`}
                        checked={currentRule.notifyRoles.includes(role.id)}
                        onCheckedChange={() => handleToggleNotifyRole(role.id)}
                      />
                      <Label htmlFor={`notify-${role.id}`}>{role.name}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={currentRule.isActive}
                    onCheckedChange={(checked) =>
                      setCurrentRule({
                        ...currentRule,
                        isActive: checked,
                      })
                    }
                  />
                  <Label htmlFor="isActive">啟用此規則</Label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRuleDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveRule}>
              <Save className="mr-2 h-4 w-4" />
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
