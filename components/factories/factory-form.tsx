"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

// 表單驗證 schema
const factoryFormSchema = z.object({
  name: z.string().min(1, { message: "工廠名稱不能為空" }),
  contactPerson: z.string().min(1, { message: "聯絡人不能為空" }),
  email: z.string().email({ message: "請輸入有效的電子郵件地址" }),
  phone: z.string().min(1, { message: "電話不能為空" }),
  address: z.string().min(1, { message: "地址不能為空" }),
  country: z.string().min(1, { message: "國家/地區不能為空" }),
  type: z.enum(["assembly", "production", "parts"]),
  status: z.enum(["active", "inactive"]),
  taxId: z.string().optional(),
  website: z.string().url({ message: "請輸入有效的網址" }).optional().or(z.literal("")),
  capacity: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

type FactoryFormValues = z.infer<typeof factoryFormSchema>

// 預設值
const defaultValues: Partial<FactoryFormValues> = {
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  country: "台灣",
  type: "assembly",
  status: "active",
  taxId: "",
  website: "",
  capacity: "",
  certifications: [],
  notes: "",
}

// 認證選項
const certificationOptions = [
  { id: "iso9001", label: "ISO 9001" },
  { id: "iso14001", label: "ISO 14001" },
  { id: "iso45001", label: "ISO 45001" },
  { id: "iatf16949", label: "IATF 16949" },
  { id: "as9100", label: "AS9100" },
]

interface FactoryFormProps {
  factory?: any
}

export function FactoryForm({ factory }: FactoryFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // 初始化表單
  const form = useForm<FactoryFormValues>({
    resolver: zodResolver(factoryFormSchema),
    defaultValues: factory || defaultValues,
  })

  // 表單提交處理
  async function onSubmit(data: FactoryFormValues) {
    setIsLoading(true)

    try {
      // 模擬API請求
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 顯示成功訊息
      toast({
        title: factory ? "工廠已更新" : "工廠已建立",
        description: `工廠 ${data.name} 已成功${factory ? "更新" : "建立"}`,
      })

      // 導航回工廠列表或詳情頁面
      router.push(factory ? `/factories/${factory.id}` : "/factories")
    } catch (error) {
      toast({
        title: "操作失敗",
        description: "無法保存工廠資料，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">基本資訊</TabsTrigger>
            <TabsTrigger value="production">生產資訊</TabsTrigger>
            <TabsTrigger value="additional">其他資訊</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>基本資訊</CardTitle>
                <CardDescription>輸入工廠的基本聯絡資訊</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>工廠名稱 *</FormLabel>
                        <FormControl>
                          <Input placeholder="輸入工廠名稱" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>統一編號</FormLabel>
                        <FormControl>
                          <Input placeholder="輸入統一編號" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>聯絡人 *</FormLabel>
                        <FormControl>
                          <Input placeholder="輸入聯絡人姓名" {...field} />
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
                        <FormLabel>電子郵件 *</FormLabel>
                        <FormControl>
                          <Input placeholder="輸入電子郵件" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>電話 *</FormLabel>
                        <FormControl>
                          <Input placeholder="輸入電話號碼" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>網站</FormLabel>
                        <FormControl>
                          <Input placeholder="輸入網站網址" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>國家/地區 *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="選擇國家/地區" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="台灣">台灣</SelectItem>
                            <SelectItem value="中國">中國</SelectItem>
                            <SelectItem value="越南">越南</SelectItem>
                            <SelectItem value="馬來西亞">馬來西亞</SelectItem>
                            <SelectItem value="其他">其他</SelectItem>
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
                        <FormLabel>狀態 *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="選擇狀態" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">啟用</SelectItem>
                            <SelectItem value="inactive">停用</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>地址 *</FormLabel>
                      <FormControl>
                        <Input placeholder="輸入完整地址" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="production">
            <Card>
              <CardHeader>
                <CardTitle>生產資訊</CardTitle>
                <CardDescription>設定工廠的生產相關資訊</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>工廠類型 *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="選擇工廠類型" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="assembly">組裝廠</SelectItem>
                            <SelectItem value="production">生產廠</SelectItem>
                            <SelectItem value="parts">零件廠</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>產能</FormLabel>
                        <FormControl>
                          <Input placeholder="例如：每月5000單位" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="certifications"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>認證</FormLabel>
                        <FormDescription>選擇工廠擁有的認證</FormDescription>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {certificationOptions.map((certification) => (
                          <FormField
                            key={certification.id}
                            control={form.control}
                            name="certifications"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={certification.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(certification.label)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || []
                                        return checked
                                          ? field.onChange([...current, certification.label])
                                          : field.onChange(current.filter((value) => value !== certification.label))
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{certification.label}</FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional">
            <Card>
              <CardHeader>
                <CardTitle>其他資訊</CardTitle>
                <CardDescription>添加其他相關資訊</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>備註</FormLabel>
                      <FormControl>
                        <Textarea placeholder="輸入工廠相關備註" className="min-h-[150px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(factory ? `/factories/${factory.id}` : "/factories")}
          >
            取消
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "處理中..." : factory ? "更新工廠" : "建立工廠"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
