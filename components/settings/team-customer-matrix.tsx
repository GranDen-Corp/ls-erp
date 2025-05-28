"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Edit, Plus, Save, Trash, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

// 模擬團隊成員數據
const initialTeamMembers = [
  {
    id: "1",
    name: "王小明",
    email: "wang@lstrading.com",
    role: "sales",
    department: "業務部",
    customers: ["1", "2", "3", "4"], // 客戶ID
    factories: ["1", "2"], // 工廠ID
  },
  {
    id: "2",
    name: "李小華",
    email: "lee@lstrading.com",
    role: "sales",
    department: "業務部",
    customers: ["5", "6", "7"],
    factories: ["3", "4"],
  },
  {
    id: "3",
    name: "張小芳",
    email: "chang@lstrading.com",
    role: "shipping",
    department: "船務部",
    customers: ["1", "3", "4"],
    factories: [],
  },
  {
    id: "4",
    name: "陳小強",
    email: "chen@lstrading.com",
    role: "shipping",
    department: "船務部",
    customers: ["2", "5", "6", "7"],
    factories: [],
  },
  {
    id: "5",
    name: "林志玲",
    email: "lin@lstrading.com",
    role: "qc",
    department: "品管部",
    customers: [],
    factories: ["1", "2", "3"],
  },
]

// 模擬客戶數據
const customers = [
  { id: "1", name: "台灣電子", code: "TE" },
  { id: "2", name: "新竹科技", code: "HT" },
  { id: "3", name: "台北工業", code: "TI" },
  { id: "4", name: "高雄製造", code: "KM" },
  { id: "5", name: "台中電子", code: "TC" },
  { id: "6", name: "桃園科技", code: "TY" },
  { id: "7", name: "嘉義工業", code: "CY" },
]

// 模擬工廠數據
const factories = [
  { id: "1", name: "深圳電子廠", code: "SZE" },
  { id: "2", name: "上海科技廠", code: "SHT" },
  { id: "3", name: "東莞工業廠", code: "DGI" },
  { id: "4", name: "廣州製造廠", code: "GZM" },
  { id: "5", name: "蘇州電子廠", code: "SZE" },
]

// 角色列表
const roles = [
  { id: "sales", name: "業務" },
  { id: "shipping", name: "船務" },
  { id: "qc", name: "品管" },
  { id: "finance", name: "財務" },
  { id: "admin", name: "管理員" },
]

// 部門列表
const departments = [
  { id: "業務部", name: "業務部" },
  { id: "船務部", name: "船務部" },
  { id: "品管部", name: "品管部" },
  { id: "財務部", name: "財務部" },
  { id: "管理部", name: "管理部" },
]

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  department: string
  customers: string[]
  factories: string[]
}

export function TeamCustomerMatrix() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isMatrixDialogOpen, setIsMatrixDialogOpen] = useState(false)
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null)
  const [isNewMember, setIsNewMember] = useState(false)
  const [activeTab, setActiveTab] = useState("sales")

  const handleAddMember = () => {
    setCurrentMember({
      id: `${Date.now()}`,
      name: "",
      email: "",
      role: "sales",
      department: "業務部",
      customers: [],
      factories: [],
    })
    setIsNewMember(true)
    setIsDialogOpen(true)
  }

  const handleEditMember = (member: TeamMember) => {
    setCurrentMember(member)
    setIsNewMember(false)
    setIsDialogOpen(true)
  }

  const handleEditMatrix = (member: TeamMember) => {
    setCurrentMember(member)
    setIsMatrixDialogOpen(true)
  }

  const handleDeleteMember = (id: string) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== id))
  }

  const handleSaveMember = () => {
    if (!currentMember) return

    if (isNewMember) {
      setTeamMembers([...teamMembers, currentMember])
    } else {
      setTeamMembers(teamMembers.map((member) => (member.id === currentMember.id ? currentMember : member)))
    }

    setIsDialogOpen(false)
  }

  const handleSaveMatrix = () => {
    if (!currentMember) return

    setTeamMembers(teamMembers.map((member) => (member.id === currentMember.id ? currentMember : member)))

    setIsMatrixDialogOpen(false)
  }

  const handleToggleCustomer = (customerId: string) => {
    if (!currentMember) return

    const newCustomers = currentMember.customers.includes(customerId)
      ? currentMember.customers.filter((id) => id !== customerId)
      : [...currentMember.customers, customerId]

    setCurrentMember({
      ...currentMember,
      customers: newCustomers,
    })
  }

  const handleToggleFactory = (factoryId: string) => {
    if (!currentMember) return

    const newFactories = currentMember.factories.includes(factoryId)
      ? currentMember.factories.filter((id) => id !== factoryId)
      : [...currentMember.factories, factoryId]

    setCurrentMember({
      ...currentMember,
      factories: newFactories,
    })
  }

  const getRoleName = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId)
    return role ? role.name : roleId
  }

  const getCustomerNames = (customerIds: string[]) => {
    return customerIds
      .map((id) => {
        const customer = customers.find((c) => c.id === id)
        return customer ? customer.name : id
      })
      .join(", ")
  }

  const getFactoryNames = (factoryIds: string[]) => {
    return factoryIds
      .map((id) => {
        const factory = factories.find((f) => f.id === id)
        return factory ? factory.name : id
      })
      .join(", ")
  }

  const filteredMembers = teamMembers.filter((member) => member.role === activeTab)

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Button onClick={handleAddMember}>
          <Plus className="mr-2 h-4 w-4" />
          新增成員
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sales">業務團隊</TabsTrigger>
          <TabsTrigger value="shipping">船務團隊</TabsTrigger>
          <TabsTrigger value="qc">品管團隊</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>{getRoleName(activeTab)}團隊矩陣</CardTitle>
              <CardDescription>
                {activeTab === "qc"
                  ? `管理${getRoleName(activeTab)}團隊成員負責的工廠（一對多關係）`
                  : activeTab === "shipping"
                    ? `管理${getRoleName(activeTab)}團隊成員負責的客戶（一對多關係）`
                    : `管理${getRoleName(activeTab)}團隊成員負責的客戶及工廠（一對多關係）`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>姓名</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>部門</TableHead>
                      {activeTab !== "qc" && <TableHead>負責客戶</TableHead>}
                      {(activeTab === "qc" || activeTab === "sales") && <TableHead>負責工廠</TableHead>}
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.department}</TableCell>
                        {activeTab !== "qc" && (
                          <TableCell>
                            {member.customers.length > 0 ? (
                              getCustomerNames(member.customers)
                            ) : (
                              <span className="text-muted-foreground">未指派</span>
                            )}
                          </TableCell>
                        )}
                        {(activeTab === "qc" || activeTab === "sales") && (
                          <TableCell>
                            {member.factories.length > 0 ? (
                              getFactoryNames(member.factories)
                            ) : (
                              <span className="text-muted-foreground">未指派</span>
                            )}
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditMatrix(member)}>
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditMember(member)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteMember(member.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredMembers.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={activeTab === "qc" ? 5 : activeTab === "shipping" ? 5 : 6}
                          className="text-center py-4"
                        >
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Users className="h-8 w-8 mb-2" />
                            <p>尚未有{getRoleName(activeTab)}團隊成員</p>
                            <Button variant="outline" className="mt-2" onClick={handleAddMember}>
                              <Plus className="mr-2 h-4 w-4" />
                              新增成員
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 新增/編輯成員對話框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNewMember ? "新增團隊成員" : "編輯團隊成員"}</DialogTitle>
            <DialogDescription>{isNewMember ? "新增一個團隊成員到系統中" : "編輯現有的團隊成員"}</DialogDescription>
          </DialogHeader>

          {currentMember && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={currentMember.name}
                  onChange={(e) =>
                    setCurrentMember({
                      ...currentMember,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={currentMember.email}
                  onChange={(e) =>
                    setCurrentMember({
                      ...currentMember,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">角色</Label>
                <Select
                  value={currentMember.role}
                  onValueChange={(value) =>
                    setCurrentMember({
                      ...currentMember,
                      role: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇角色" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="department">部門</Label>
                <Select
                  value={currentMember.department}
                  onValueChange={(value) =>
                    setCurrentMember({
                      ...currentMember,
                      department: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇部門" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveMember}>
              <Save className="mr-2 h-4 w-4" />
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 編輯矩陣對話框 */}
      <Dialog open={isMatrixDialogOpen} onOpenChange={setIsMatrixDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>編輯負責矩陣</DialogTitle>
            <DialogDescription>{currentMember && `設定 ${currentMember.name} 負責的客戶及工廠`}</DialogDescription>
          </DialogHeader>

          {currentMember && (
            <div className="grid gap-4 py-4">
              <Tabs defaultValue={currentMember.role === "qc" ? "factories" : "customers"}>
                <TabsList>
                  {currentMember.role !== "qc" && <TabsTrigger value="customers">負責客戶</TabsTrigger>}
                  {(currentMember.role === "qc" || currentMember.role === "sales") && (
                    <TabsTrigger value="factories">負責工廠</TabsTrigger>
                  )}
                </TabsList>

                {currentMember.role !== "qc" && (
                  <TabsContent value="customers">
                    <Card>
                      <CardHeader>
                        <CardTitle>客戶列表</CardTitle>
                        <CardDescription>選擇 {currentMember.name} 負責的客戶</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {customers.map((customer) => (
                            <div key={customer.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`customer-${customer.id}`}
                                checked={currentMember.customers.includes(customer.id)}
                                onCheckedChange={() => handleToggleCustomer(customer.id)}
                              />
                              <Label htmlFor={`customer-${customer.id}`}>
                                {customer.name} ({customer.code})
                              </Label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {(currentMember.role === "qc" || currentMember.role === "sales") && (
                  <TabsContent value="factories">
                    <Card>
                      <CardHeader>
                        <CardTitle>工廠列表</CardTitle>
                        <CardDescription>選擇 {currentMember.name} 負責的工廠</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {factories.map((factory) => (
                            <div key={factory.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`factory-${factory.id}`}
                                checked={currentMember.factories.includes(factory.id)}
                                onCheckedChange={() => handleToggleFactory(factory.id)}
                              />
                              <Label htmlFor={`factory-${factory.id}`}>
                                {factory.name} ({factory.code})
                              </Label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMatrixDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveMatrix}>
              <Save className="mr-2 h-4 w-4" />
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
