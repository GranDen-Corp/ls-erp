"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CustomerFormData } from "@/types/customer"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "客戶名稱至少需要2個字符",
  }),
  contactPerson: z.string().min(2, {
    message: "聯絡人姓名至少需要2個字符",
  }),
  email: z.string().email({
    message: "請輸入有效的電子郵件地址",
  }),
  phone: z.string().min(5, {
    message: "請輸入有效的電話號碼",
  }),
  address: z.string().min(5, {
    message: "地址至少需要5個字符",
  }),
  country: z.string().min(1, {
    message: "請選擇國家",
  }),
  paymentTerms: z.string().min(1, {
    message: "請輸入付款條件",
  }),
  creditLimit: z.coerce.number().min(0, {
    message: "信用額度不能為負數",
  }),
  currency: z.string().min(1, {
    message: "請選擇貨幣",
  }),
  status: z.enum(["active", "inactive"]),
  groupTag: z.string().optional(),
  notes: z.string().optional(),
})

interface CustomerFormProps {
  initialData?: CustomerFormData
  customerId?: string
}

export default function CustomerForm({ initialData, customerId }: CustomerFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      country: "",
      paymentTerms: "",
      creditLimit: 0,
      currency: "TWD",
      status: "active",
      groupTag: "",
      notes: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      // 在實際應用中，這裡會發送API請求
      console.log(values)

      // 模擬API請求延遲
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: customerId ? "客戶資料已更新" : "客戶已創建",
        description: `客戶 ${values.name} 的資料已成功${customerId ? "更新" : "創建"}。`,
      })

      router.push("/customers")
    } catch (error) {
      console.error("提交表單時出錯:", error)
      toast({
        title: "操作失敗",
        description: "保存客戶資料時發生錯誤，請稍後再試。",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>客戶名稱</FormLabel>
                    <FormControl>
                      <Input placeholder="輸入客戶名稱" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>聯絡人</FormLabel>
                    <FormControl>
                      <Input placeholder="輸入聯絡人姓名" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="groupTag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>集團標籤</FormLabel>
                    <FormControl>
                      <Input placeholder="輸入集團標籤 (例如: A集團)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>電子郵件</FormLabel>
                    <FormControl>
                      <Input placeholder="輸入電子郵件地址" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>電話</FormLabel>
                    <FormControl>
                      <Input placeholder="輸入電話號碼" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>地址</FormLabel>
                    <FormControl>
                      <Input placeholder="輸入地址" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>國家</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇國家" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TW">台灣</SelectItem>
                        <SelectItem value="CN">中國</SelectItem>
                        <SelectItem value="US">美國</SelectItem>
                        <SelectItem value="JP">日本</SelectItem>
                        <SelectItem value="KR">韓國</SelectItem>
                        <SelectItem value="VN">越南</SelectItem>
                        <SelectItem value="TH">泰國</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>付款條件</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇付款條件" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="30days">30天</SelectItem>
                        <SelectItem value="60days">60天</SelectItem>
                        <SelectItem value="90days">90天</SelectItem>
                        <SelectItem value="COD">貨到付款</SelectItem>
                        <SelectItem value="prepaid">預付款</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="creditLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>信用額度</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="輸入信用額度" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>貨幣</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇貨幣" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TWD">新台幣 (TWD)</SelectItem>
                        <SelectItem value="USD">美元 (USD)</SelectItem>
                        <SelectItem value="CNY">人民幣 (CNY)</SelectItem>
                        <SelectItem value="JPY">日元 (JPY)</SelectItem>
                        <SelectItem value="EUR">歐元 (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>狀態</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇狀態" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">活躍</SelectItem>
                        <SelectItem value="inactive">非活躍</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-6">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>備註</FormLabel>
                    <FormControl>
                      <Textarea placeholder="輸入備註信息" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push("/customers")} disabled={isSubmitting}>
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "處理中..." : customerId ? "更新客戶" : "創建客戶"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
