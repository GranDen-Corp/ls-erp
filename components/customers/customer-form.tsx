"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabaseClient } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface CustomerFormProps {
  initialData?: any
  customerId?: string
}

export function CustomerForm({ initialData, customerId }: CustomerFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  // 基本資訊
  const [customerCode, setCustomerCode] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [shortName, setShortName] = useState("")
  const [customerType, setCustomerType] = useState("")
  const [status, setStatus] = useState("active")

  // 聯絡資訊
  const [contactPerson, setContactPerson] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [fax, setFax] = useState("")
  const [address, setAddress] = useState("")
  const [country, setCountry] = useState("")
  const [website, setWebsite] = useState("")

  // 財務資訊
  const [taxId, setTaxId] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("")
  const [creditLimit, setCreditLimit] = useState(0)
  const [currency, setCurrency] = useState("TWD")
  const [bankName, setBankName] = useState("")
  const [bankAccount, setBankAccount] = useState("")

  // 其他資訊
  const [groupTag, setGroupTag] = useState("")
  const [notes, setNotes] = useState("")
  const [createdAt, setCreatedAt] = useState(new Date().toISOString())

  // 當 initialData 變更時更新狀態
  useEffect(() => {
    console.log("初始數據:", initialData) // 添加日誌以便調試

    if (initialData) {
      // 基本資訊
      setCustomerCode(initialData.customer_code || "")
      setCustomerName(initialData.customer_name || "")
      setShortName(initialData.short_name || "")
      setCustomerType(initialData.customer_type || "")
      setStatus(initialData.status || "active")

      // 聯絡資訊
      setContactPerson(initialData.contact_person || "")
      setEmail(initialData.email || "")
      setPhone(initialData.phone || "")
      setFax(initialData.fax || "")
      setAddress(initialData.address || "")
      setCountry(initialData.country || "")
      setWebsite(initialData.website || "")

      // 財務資訊
      setTaxId(initialData.tax_id || "")
      setPaymentTerms(initialData.payment_terms || "")
      setCreditLimit(initialData.credit_limit || 0)
      setCurrency(initialData.currency || "TWD")
      setBankName(initialData.bank_name || "")
      setBankAccount(initialData.bank_account || "")

      // 其他資訊
      setGroupTag(initialData.group_tag || initialData.group_code || "")
      setNotes(initialData.notes || "")
      setCreatedAt(initialData.created_at || new Date().toISOString())
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const customerData = {
        customer_code: customerCode,
        customer_name: customerName,
        short_name: shortName,
        customer_type: customerType,
        status,
        contact_person: contactPerson,
        email,
        phone,
        fax,
        address,
        country,
        website,
        tax_id: taxId,
        payment_terms: paymentTerms,
        credit_limit: creditLimit,
        currency,
        bank_name: bankName,
        bank_account: bankAccount,
        group_code: groupTag, // 注意：這裡使用 group_code 而不是 group_tag
        notes,
        updated_at: new Date().toISOString(),
      }

      console.log("提交的客戶數據:", customerData) // 添加日誌以便調試

      let result

      if (customerId) {
        // 更新現有客戶
        result = await supabaseClient.from("customers").update(customerData).eq("customer_id", customerId)
      } else {
        // 新增客戶
        result = await supabaseClient.from("customers").insert([
          {
            ...customerData,
            created_at: createdAt,
          },
        ])
      }

      if (result.error) {
        throw new Error(result.error.message)
      }

      toast({
        title: customerId ? "客戶更新成功" : "客戶創建成功",
        description: `客戶 ${customerName} 已${customerId ? "更新" : "創建"}`,
      })

      router.push("/customers")
      router.refresh()
    } catch (error) {
      console.error("保存客戶時出錯:", error)
      toast({
        title: "錯誤",
        description: `保存客戶失敗: ${error instanceof Error ? error.message : "未知錯誤"}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">基本資訊</TabsTrigger>
          <TabsTrigger value="contact">聯絡資訊</TabsTrigger>
          <TabsTrigger value="financial">財務資訊</TabsTrigger>
          <TabsTrigger value="other">其他資訊</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>基本資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerCode">客戶代碼 *</Label>
                  <Input
                    id="customerCode"
                    value={customerCode}
                    onChange={(e) => setCustomerCode(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerName">客戶名稱 *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortName">簡稱</Label>
                  <Input id="shortName" value={shortName} onChange={(e) => setShortName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerType">客戶類型</Label>
                  <Input id="customerType" value={customerType} onChange={(e) => setCustomerType(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">狀態</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇狀態" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">啟用</SelectItem>
                      <SelectItem value="inactive">停用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>聯絡資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">聯絡人</Label>
                  <Input id="contactPerson" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">電話</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fax">傳真</Label>
                  <Input id="fax" value={fax} onChange={(e) => setFax(e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">地址</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">國家/地區</Label>
                  <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">網站</Label>
                  <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>財務資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxId">統一編號</Label>
                  <Input id="taxId" value={taxId} onChange={(e) => setTaxId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">付款條件</Label>
                  <Input id="paymentTerms" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditLimit">信用額度</Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value === "" ? 0 : Number.parseInt(e.target.value, 10))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">貨幣</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇貨幣" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TWD">TWD</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                      <SelectItem value="CNY">CNY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">銀行名稱</Label>
                  <Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">銀行帳號</Label>
                  <Input id="bankAccount" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="other" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>其他資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="groupTag">客戶群組</Label>
                  <Input id="groupTag" value={groupTag} onChange={(e) => setGroupTag(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">備註</Label>
                  <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => router.push("/customers")} disabled={isSubmitting}>
          取消
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              處理中...
            </>
          ) : customerId ? (
            "更新客戶"
          ) : (
            "創建客戶"
          )}
        </Button>
      </div>
    </form>
  )
}

// 同時提供默認導出，以便兩種導入方式都能工作
export default CustomerForm
