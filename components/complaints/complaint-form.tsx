"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Paperclip, X } from "lucide-react"

// 模擬客戶數據
const customers = [
  { id: "1", name: "台灣電子", code: "TE" },
  { id: "2", name: "新竹科技", code: "HT" },
  { id: "3", name: "台北工業", code: "TI" },
  { id: "4", name: "高雄製造", code: "KM" },
  { id: "5", name: "台中電子", code: "TC" },
]

// 模擬產品數據
const products = [
  {
    id: "1",
    pn: "LCD-15-HD",
    name: "15吋 HD LCD面板",
    customer: "1",
  },
  {
    id: "2",
    pn: "LCD-17-FHD",
    name: "17吋 FHD LCD面板",
    customer: "1",
  },
  {
    id: "3",
    pn: "CAP-104-SMD",
    name: "104 SMD電容",
    customer: "2",
  },
  {
    id: "4",
    pn: "RES-103-SMD",
    name: "103 SMD電阻",
    customer: "3",
  },
  {
    id: "5",
    pn: "IC-CPU-8086",
    name: "8086 CPU晶片",
    customer: "4",
  },
]

// 模擬訂單數據
const orders = [
  { id: "ORD-2023-0012", customer: "1" },
  { id: "ORD-2023-0011", customer: "2" },
  { id: "ORD-2023-0010", customer: "3" },
  { id: "ORD-2023-0009", customer: "4" },
  { id: "ORD-2023-0008", customer: "5" },
]

export function ComplaintForm() {
  const [complaintId, setComplaintId] = useState(
    `COMP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(4, "0")}`,
  )
  const [customerId, setCustomerId] = useState("")
  const [productId, setProductId] = useState("")
  const [orderId, setOrderId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [showOnPO, setShowOnPO] = useState(true)
  const [customerProducts, setCustomerProducts] = useState<typeof products>([])
  const [customerOrders, setCustomerOrders] = useState<typeof orders>([])
  const [attachments, setAttachments] = useState<{ id: string; name: string; size: string }[]>([])

  // 當客戶變更時，更新可選產品和訂單列表
  const handleCustomerChange = (value: string) => {
    setCustomerId(value)
    setProductId("")
    setOrderId("")

    const filteredProducts = products.filter((product) => product.customer === value)
    setCustomerProducts(filteredProducts)

    const filteredOrders = orders.filter((order) => order.customer === value)
    setCustomerOrders(filteredOrders)
  }

  // 處理文件上傳
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newAttachments = Array.from(files).map((file) => ({
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
    }))

    setAttachments([...attachments, ...newAttachments])

    // 清除文件輸入，以便可以再次選擇相同的文件
    e.target.value = ""
  }

  // 移除附件
  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((attachment) => attachment.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="complaintId">客訴編號</Label>
          <Input id="complaintId" value={complaintId} onChange={(e) => setComplaintId(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer">客戶</Label>
          <Select value={customerId} onValueChange={handleCustomerChange}>
            <SelectTrigger>
              <SelectValue placeholder="選擇客戶" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name} ({customer.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="product">產品</Label>
          <Select value={productId} onValueChange={setProductId} disabled={!customerId}>
            <SelectTrigger>
              <SelectValue placeholder={customerId ? "選擇產品" : "請先選擇客戶"} />
            </SelectTrigger>
            <SelectContent>
              {customerProducts.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.pn} - {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="order">相關訂單</Label>
          <Select value={orderId} onValueChange={setOrderId} disabled={!customerId}>
            <SelectTrigger>
              <SelectValue placeholder={customerId ? "選擇訂單" : "請先選擇客戶"} />
            </SelectTrigger>
            <SelectContent>
              {customerOrders.map((order) => (
                <SelectItem key={order.id} value={order.id}>
                  {order.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">優先級</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder="選擇優先級" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">高</SelectItem>
              <SelectItem value="medium">中</SelectItem>
              <SelectItem value="low">低</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">狀態</Label>
          <Input id="status" value="待處理" disabled />
          <p className="text-xs text-gray-500">新客訴預設為待處理狀態</p>
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="title">客訴標題</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="請輸入簡短的客訴標題"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="description">客訴描述</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="請詳細描述客訴內容，包括問題現象、影響範圍等"
            rows={5}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>附件</Label>
          <div>
            <Input id="file-upload" type="file" multiple className="hidden" onChange={handleFileUpload} />
            <Label htmlFor="file-upload" asChild>
              <Button variant="outline" size="sm">
                <Paperclip className="h-4 w-4 mr-2" />
                添加附件
              </Button>
            </Label>
          </div>
        </div>

        {attachments.length > 0 ? (
          <ul className="space-y-2">
            {attachments.map((attachment) => (
              <li key={attachment.id} className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center">
                  <Paperclip className="h-4 w-4 mr-2 text-blue-500" />
                  <span>{attachment.name}</span>
                  <span className="text-xs text-gray-500 ml-2">({attachment.size})</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveAttachment(attachment.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">尚未添加附件</p>
        )}
      </div>

      <Separator />

      <div className="flex items-center space-x-2">
        <Switch id="show-on-po" checked={showOnPO} onCheckedChange={setShowOnPO} />
        <Label htmlFor="show-on-po" className="font-medium">
          顯示於採購單
        </Label>
      </div>
      <p className="text-sm text-gray-500">啟用此選項後，此客訴資訊將顯示在相關產品的採購單上，提醒供應商注意</p>
    </div>
  )
}
