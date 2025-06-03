"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Trash2, FileText } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/hooks/use-toast"

interface ResumeTabProps {
  product: any
  handleInputChange: (field: string, value: any) => void
  setIsOrderHistoryDialogOpen?: (isOpen: boolean) => void
  setIsResumeNoteDialogOpen?: (isOpen: boolean) => void
  handleOrderHistoryChange?: (index: number, field: string, value: any) => void
  handleRemoveOrderHistory?: (index: number) => void
  isReadOnly?: boolean
}

export function ResumeTab({
  product,
  handleInputChange,
  setIsOrderHistoryDialogOpen,
  setIsResumeNoteDialogOpen,
  handleOrderHistoryChange,
  handleRemoveOrderHistory,
  isReadOnly = false,
}: ResumeTabProps) {
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false)
  const [newNote, setNewNote] = useState({ content: "", date: new Date().toISOString().split("T")[0], user: "" })
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [qualityEvents, setQualityEvents] = useState<any[]>([])
  const [isLoadingQualityEvents, setIsLoadingQualityEvents] = useState(false)

  const supabase = createClientComponentClient()

  // 從採購單表單中獲取訂單歷史
  useEffect(() => {
    async function fetchPurchaseOrders() {
      if (!product.partNo) {
        return
      }

      setIsLoadingOrders(true)
      try {
        const { data, error } = await supabase
          .from("purchase_items")
          .select(`
            quantity,
            purchases!fk_purchase (
              *,
              updated_at
            )
          `)
          .eq("product_part_no", product.partNo)
          //.order("purchases.updated_at", { ascending: false })

        if (error) {
          console.error("Error fetching purchase orders:", error)
          toast({
            title: "錯誤",
            description: "無法獲取採購訂單資料",
            variant: "destructive",
          })
        } else {
          // 前端排序
          const sorted = (data || []).sort(
            (a, b) => new Date(b.purchases?.updated_at || 0).getTime() - new Date(a.purchases?.updated_at || 0).getTime())

          setPurchaseOrders(data || [])

          // console.log("product.partNo:", product.partNo)
          // console.log("Fetched purchase orders:", data)
        }
      } catch (error) {
        console.error("Error fetching purchase orders:", error)
      } finally {
        setIsLoadingOrders(false)
      }
    }

    fetchPurchaseOrders()
  }, [product.partNo, supabase])

  // 從客訴表單中獲取品質事件
  useEffect(() => {
    async function fetchQualityEvents() {
      if (!product.partNo) {
        return
      }

      setIsLoadingQualityEvents(true)
      try {
        const { data, error } = await supabase
          .from("complaints")
          .select("*")
          .eq("product_id", product.partNo)
          .order("complaint_date", { ascending: false })

        if (error) {
          console.error("Error fetching quality events:", error)
          toast({
            title: "錯誤",
            description: "無法獲取品質事件資料",
            variant: "destructive",
          })
        } else {
          setQualityEvents(data || [])
        }
      } catch (error) {
        console.error("Error fetching quality events:", error)
      } finally {
        setIsLoadingQualityEvents(false)
      }
    }

    fetchQualityEvents()
  }, [product.partNo, supabase])

  // 處理添加備註
  const handleAddNote = () => {
    if (newNote.content && newNote.user) {
      const updatedNotes = [...(product.resumeNotes || []), newNote]
      handleInputChange("resumeNotes", updatedNotes)
      setNewNote({ content: "", date: new Date().toISOString().split("T")[0], user: "" })
      setIsAddNoteDialogOpen(false)

      toast({
        title: "成功",
        description: "備註已添加",
      })
    } else {
      toast({
        title: "錯誤",
        description: "請填寫備註內容和使用者",
        variant: "destructive",
      })
    }
  }

  // 處理刪除備註
  const handleRemoveNote = (index: number) => {
    const updatedNotes = [...(product.resumeNotes || [])]
    updatedNotes.splice(index, 1)
    handleInputChange("resumeNotes", updatedNotes)
  }

  // 查看採購訂單詳情
  const viewPurchaseOrder = (orderId: string) => {
    window.open(`/purchases/${orderId}`, "_blank")
  }

  // 查看客訴詳情
  const viewComplaint = (complaintId: string) => {
    window.open(`/complaints/${complaintId}`, "_blank")
  }

  return (
    <div className="space-y-6">
      {/* 模具資訊區塊 */}
      <Card>
        <CardHeader>
          <CardTitle>模具資訊</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Label className="text-base font-medium">有無開模具</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {isReadOnly ? (
                    <Checkbox id="hasMold" checked={product.hasMold === true} disabled className="cursor-not-allowed" />
                  ) : (
                    <Checkbox
                      id="hasMold"
                      checked={product.hasMold === true}
                      onCheckedChange={(checked) => handleInputChange("hasMold", checked === true)}
                    />
                  )}
                  <Label htmlFor="hasMold">有</Label>
                </div>
                <div className="flex items-center space-x-2">
                  {isReadOnly ? (
                    <Checkbox id="noMold" checked={product.hasMold === false} disabled className="cursor-not-allowed" />
                  ) : (
                    <Checkbox
                      id="noMold"
                      checked={product.hasMold === false}
                      onCheckedChange={(checked) => handleInputChange("hasMold", checked !== true)}
                    />
                  )}
                  <Label htmlFor="noMold">無</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="moldCost">模具費</Label>
                <Input
                  id="moldCost"
                  type="number"
                  value={product.moldCost || ""}
                  onChange={(e) =>
                    !isReadOnly && handleInputChange("moldCost", e.target.value ? Number(e.target.value) : "")
                  }
                  disabled={!product.hasMold || isReadOnly}
                  className={isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}
                  readOnly={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refundableMoldQuantity">可退模具數量</Label>
                <Input
                  id="refundableMoldQuantity"
                  type="number"
                  value={product.refundableMoldQuantity || ""}
                  onChange={(e) =>
                    !isReadOnly &&
                    handleInputChange("refundableMoldQuantity", e.target.value ? Number(e.target.value) : "")
                  }
                  disabled={!product.hasMold || isReadOnly}
                  className={isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}
                  readOnly={isReadOnly}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Label className="text-base font-medium">已退模</Label>
              {isReadOnly ? (
                <Checkbox
                  id="moldReturned"
                  checked={product.moldReturned === true}
                  disabled
                  className="cursor-not-allowed"
                />
              ) : (
                <Checkbox
                  id="moldReturned"
                  checked={product.moldReturned === true}
                  onCheckedChange={(checked) => handleInputChange("moldReturned", checked === true)}
                  disabled={!product.hasMold}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountingNote">會計備註</Label>
              {isReadOnly ? (
                <div className="p-2 border rounded-md bg-gray-50 min-h-[100px] whitespace-pre-wrap">
                  {product.accountingNote || ""}
                </div>
              ) : (
                <Textarea
                  id="accountingNote"
                  value={product.accountingNote || ""}
                  onChange={(e) => handleInputChange("accountingNote", e.target.value)}
                  rows={4}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 訂單歷史區塊 */}
      <Card>
        <CardHeader>
          <CardTitle>訂單歷史</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingOrders ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>訂單號碼</TableHead>
                  <TableHead>數量</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.length > 0 ? (
                  purchaseOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.purchases.order_id}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => viewPurchaseOrder(order.purchases.purchase_id)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      無訂單歷史記錄
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 零件品質事件區塊 */}
      <Card>
        <CardHeader>
          <CardTitle>零件品質事件</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingQualityEvents ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>客訴編號</TableHead>
                  <TableHead>問題描述</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qualityEvents.length > 0 ? (
                  qualityEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{event.complaint_number}</TableCell>
                      <TableCell>{event.description}</TableCell>
                      <TableCell>{event.status}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => viewComplaint(event.id)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      無品質事件記錄
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          <div className="mt-6 space-y-2">
            <Label htmlFor="qualityNotes">零件品質註記</Label>
            {isReadOnly ? (
              <div className="p-2 border rounded-md bg-gray-50 min-h-[100px] whitespace-pre-wrap">
                {product.qualityNotes || ""}
              </div>
            ) : (
              <Textarea
                id="qualityNotes"
                value={product.qualityNotes || ""}
                onChange={(e) => handleInputChange("qualityNotes", e.target.value)}
                rows={4}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* 編輯備註區塊 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>編輯備註</CardTitle>
          {!isReadOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                setIsAddNoteDialogOpen(true)
              }}
              type="button"
            >
              <Plus className="h-4 w-4 mr-1" /> 新增備註
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日期</TableHead>
                <TableHead>使用者</TableHead>
                <TableHead>內容</TableHead>
                <TableHead className="w-[80px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.resumeNotes && product.resumeNotes.length > 0 ? (
                product.resumeNotes.map((note: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{note.date}</TableCell>
                    <TableCell>{note.user}</TableCell>
                    <TableCell>{note.content}</TableCell>
                    <TableCell>
                      {!isReadOnly && (
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveNote(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    無備註記錄
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 新增備註對話框 */}
      {!isReadOnly && (
        <Dialog open={isAddNoteDialogOpen} onOpenChange={setIsAddNoteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增備註</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="noteDate">日期</Label>
                <Input
                  id="noteDate"
                  type="date"
                  value={newNote.date}
                  onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="noteUser">使用者</Label>
                <Input
                  id="noteUser"
                  value={newNote.user}
                  onChange={(e) => setNewNote({ ...newNote, user: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="noteContent">內容</Label>
                <Textarea
                  id="noteContent"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={4}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) {
                      e.preventDefault()
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsAddNoteDialogOpen(false)}>
                取消
              </Button>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  handleAddNote()
                }}
              >
                新增
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
