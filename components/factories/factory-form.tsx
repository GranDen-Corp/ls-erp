"use client"

import { useState, useEffect } from "react"
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
import { toast } from "@/hooks/use-toast"
import { supabaseClient } from "@/lib/supabase-client"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// 表單驗證 schema - 完整對應 factories 表結構
const factoryFormSchema = z.object({
  factory_id: z.string().min(1, { message: "供應商編號不能為空" }),
  factory_name: z.string().min(1, { message: "供應商名稱不能為空" }),
  factory_full_name: z.string().min(1, { message: "供應商全名不能為空" }),
  factory_short_name: z.string().optional(),
  factory_address: z.string().optional(),
  factory_phone: z.string().optional(),
  factory_fax: z.string().optional(),
  tax_id: z.string().optional(),
  factory_type: z.string().min(1, { message: "請選擇供應商類型" }),
  category1: z.string().optional(),
  category2: z.string().optional(),
  category3: z.string().optional(),
  iso9001_certified: z.string().min(1, { message: "請選擇認證狀態" }),
  iatf16949_certified: z.string().min(1, { message: "請選擇認證狀態" }),
  iso17025_certified: z.string().min(1, { message: "請選擇認證狀態" }),
  cqi9_certified: z.string().min(1, { message: "請選擇認證狀態" }),
  cqi11_certified: z.string().min(1, { message: "請選擇認證狀態" }),
  cqi12_certified: z.string().min(1, { message: "請選擇認證狀態" }),
  iso9001_expiry: z.string().optional(),
  iatf16949_expiry: z.string().optional(),
  iso17025_expiry: z.string().optional(),
  cqi9_expiry: z.string().optional(),
  cqi11_expiry: z.string().optional(),
  cqi12_expiry: z.string().optional(),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email({ message: "請輸入有效的電子郵件地址" }).optional().or(z.literal("")),
  website: z.string().url({ message: "請輸入有效的網址" }).optional().or(z.literal("")),
  location: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  invoice_address: z.string().optional(),
  postal_code: z.string().optional(),
  notes: z.string().optional(),
  status: z.boolean().optional(),
  quality_contact1: z.string().optional(),
  quality_contact2: z.string().optional(),
})

type FactoryFormValues = z.infer<typeof factoryFormSchema>

// 預設值
const defaultValues: Partial<FactoryFormValues> = {
  factory_id: "",
  factory_name: "",
  factory_full_name: "",
  factory_short_name: "",
  factory_address: "",
  factory_phone: "",
  factory_fax: "",
  tax_id: "",
  factory_type: "assembly",
  category1: "",
  category2: "",
  category3: "",
  iso9001_certified: "N",
  iatf16949_certified: "N",
  iso17025_certified: "N",
  cqi9_certified: "N",
  cqi11_certified: "N",
  cqi12_certified: "N",
  iso9001_expiry: "",
  iatf16949_expiry: "",
  iso17025_expiry: "",
  cqi9_expiry: "",
  cqi11_expiry: "",
  cqi12_expiry: "",
  contact_person: "",
  contact_phone: "",
  contact_email: "",
  website: "",
  location: "台灣",
  country: "台灣",
  city: "",
  invoice_address: "",
  postal_code: "",
  notes: "",
  status: true,
  quality_contact1: "",
  quality_contact2: "",
}

interface FactoryFormProps {
  factoryData?: any
  factoryId?: string
  initialData?: any
}

export function FactoryForm({ factoryData, factoryId, initialData }: FactoryFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [teamMembers, setTeamMembers] = useState<any[]>([])

  // 初始化表單
  const form = useForm<FactoryFormValues>({
    resolver: zodResolver(factoryFormSchema),
    defaultValues: defaultValues,
  })

  // 載入團隊成員資料
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabaseClient
          .from("team_members")
          .select("ls_employee_id, name")
          .eq("is_active", true)
          .order("name")

        if (error) {
          console.error("載入團隊成員失敗:", error)
        } else {
          setTeamMembers(data || [])
        }
      } catch (err) {
        console.error("載入團隊成員時出錯:", err)
      }
    }

    fetchTeamMembers()
  }, [])

  // 當初始數據變更時更新表單
  useEffect(() => {
    const data = factoryData || initialData || {}

    if (Object.keys(data).length > 0) {
      console.log("FactoryForm 接收到的初始數據:", data)

      form.reset({
        ...defaultValues,
        ...data,
        status: data.status === true || data.status === "true" || data.status === "Y",
      })
    }
  }, [factoryData, initialData, form])

  // 表單提交處理
  async function onSubmit(data: FactoryFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      const isEditing = !!factoryData || !!factoryId

      // 檢查供應商ID是否已存在（僅在創建新供應商時檢查）
      if (!isEditing) {
        const { data: existingFactory, error: checkError } = await supabaseClient
          .from("factories")
          .select("factory_id")
          .eq("factory_id", data.factory_id)
          .single()

        if (checkError && checkError.code !== "PGRST116") {
          throw new Error(`檢查供應商ID時出錯: ${checkError.message}`)
        }

        if (existingFactory) {
          throw new Error(`供應商編號 ${data.factory_id} 已存在，請使用其他編號`)
        }
      }

      // 準備要保存的數據
      const factoryDataToSave = {
        ...data,
        updated_at: new Date().toISOString(),
      }

      // 如果是新增，加入創建時間
      if (!isEditing) {
        factoryDataToSave.created_at = new Date().toISOString()
      }

      // 插入或更新供應商資料
      const { error: saveError } = isEditing
        ? await supabaseClient.from("factories").update(factoryDataToSave).eq("factory_id", data.factory_id)
        : await supabaseClient.from("factories").insert(factoryDataToSave)

      if (saveError) {
        throw new Error(`保存供應商資料時出錯: ${saveError.message}`)
      }

      // 顯示成功訊息
      toast({
        title: isEditing ? "供應商已更新" : "供應商已建立",
        description: `供應商 ${data.factory_name} 已成功${isEditing ? "更新" : "建立"}`,
      })

      // 導航回供應商列表
      router.push("/factories/all")
      router.refresh()
    } catch (err) {
      console.error("保存供應商資料時出錯:", err)
      setError(err instanceof Error ? err.message : "保存供應商資料時出錯")
      toast({
        title: "操作失敗",
        description: err instanceof Error ? err.message : "保存供應商資料時出錯",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>錯誤</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">基本資訊</TabsTrigger>
            <TabsTrigger value="location">地址資訊</TabsTrigger>
            <TabsTrigger value="contact">聯絡資訊</TabsTrigger>
            <TabsTrigger value="certification">認證資訊</TabsTrigger>
            <TabsTrigger value="additional">其他資訊</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>基本資訊</CardTitle>
                <CardDescription>輸入供應商的基本識別資訊</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="factory_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>供應商編號 *</FormLabel>
                        <FormControl>
                          <Input placeholder="輸入供應商編號" {...field} disabled={!!factoryData || !!factoryId} />
                        </FormControl>
                        <FormDescription>
                          {factoryData || factoryId ? "供應商編號不可修改" : "請輸入唯一的供應商識別碼"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="factory_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>供應商名稱 *</FormLabel>
                        <FormControl>
                          <Input placeholder="輸入供應商名稱" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="factory_full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>供應商全名 *</FormLabel>
                        <FormControl>
                          <Input placeholder="輸入供應商全名" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="factory_short_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>供應商簡稱</FormLabel>
                        <FormControl>
                          <Input placeholder="輸入供應商簡稱" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tax_id"
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

                  <FormField
                    control={form.control}
                    name="factory_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>供應商類型 *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || "assembly"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="選擇供應商類型" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="assembly">組裝廠</SelectItem>
                            <SelectItem value="production">生產廠</SelectItem>
                            <SelectItem value="parts">零件廠</SelectItem>
                            <SelectItem value="material">材料供應商</SelectItem>
                            <SelectItem value="service">服務供應商</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>狀態</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "true")}
                        value={field.value ? "true" : "false"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="選擇狀態" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">啟用</SelectItem>
                          <SelectItem value="false">停用</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle>地址資訊</CardTitle>
                <CardDescription>設定供應商的地理位置資訊</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>國家/地區</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || "台灣"}>
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
                            <SelectItem value="泰國">泰國</SelectItem>
                            <SelectItem value="印尼">印尼</SelectItem>
                            <SelectItem value="菲律賓">菲律賓</SelectItem>
                            <SelectItem value="其他">其他</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <FormControl>
                          <Input placeholder="輸入國家" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>城市</FormLabel>
                        <FormControl>
                          <Input placeholder="輸入城市" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>郵遞區號</FormLabel>
                        <FormControl>
                          <Input placeholder="輸入郵遞區號" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="factory_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>工廠地址</FormLabel>
                      <FormControl>
                        <Input placeholder="輸入工廠完整地址" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoice_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>發票地址</FormLabel>
                      <FormControl>
                        <Input placeholder="輸入發票地址" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>聯絡資訊</CardTitle>
                <CardDescription>設定供應商的聯絡方式和負責人資訊</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="factory_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>公司電話</FormLabel>
                        <FormControl>
                          <Input placeholder="輸入公司電話" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="factory_fax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>公司傳真</FormLabel>
                        <FormControl>
                          <Input placeholder="輸入公司傳真" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_person"
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
                    name="contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>聯絡人電話</FormLabel>
                        <FormControl>
                          <Input placeholder="輸入聯絡人電話" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>聯絡人電子郵件</FormLabel>
                        <FormControl>
                          <Input placeholder="輸入聯絡人電子郵件" {...field} />
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
                    name="quality_contact1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>品質聯絡人1</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="選擇品質聯絡人1" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">無</SelectItem>
                            {teamMembers.map((member) => (
                              <SelectItem key={member.ls_employee_id} value={member.ls_employee_id}>
                                {member.name} ({member.ls_employee_id})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quality_contact2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>品質聯絡人2</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="選擇品質聯絡人2" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">無</SelectItem>
                            {teamMembers.map((member) => (
                              <SelectItem key={member.ls_employee_id} value={member.ls_employee_id}>
                                {member.name} ({member.ls_employee_id})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certification">
            <Card>
              <CardHeader>
                <CardTitle>認證資訊</CardTitle>
                <CardDescription>設定供應商的認證相關資訊和到期日</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ISO 9001 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <FormField
                    control={form.control}
                    name="iso9001_certified"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ISO 9001認證</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || "N"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="選擇認證狀態" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Y">已認證</SelectItem>
                            <SelectItem value="N">未認證</SelectItem>
                            <SelectItem value="審核中">審核中</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="iso9001_expiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ISO 9001到期日</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* IATF 16949 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <FormField
                    control={form.control}
                    name="iatf16949_certified"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IATF 16949認證</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || "N"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="選擇認證狀態" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Y">已認證</SelectItem>
                            <SelectItem value="N">未認證</SelectItem>
                            <SelectItem value="審核中">審核中</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="iatf16949_expiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IATF 16949到期日</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ISO 17025 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <FormField
                    control={form.control}
                    name="iso17025_certified"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ISO 17025認證</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || "N"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="選擇認證狀態" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Y">已認證</SelectItem>
                            <SelectItem value="N">未認證</SelectItem>
                            <SelectItem value="審核中">審核中</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="iso17025_expiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ISO 17025到期日</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* CQI 認證 */}
                <div className="space-y-4">
                  <h4 className="font-medium">CQI 認證</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                    <FormField
                      control={form.control}
                      name="cqi9_certified"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CQI-9認證</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || "N"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="選擇認證狀態" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Y">已認證</SelectItem>
                              <SelectItem value="N">未認證</SelectItem>
                              <SelectItem value="審核中">審核中</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cqi9_expiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CQI-9到期日</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                    <FormField
                      control={form.control}
                      name="cqi11_certified"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CQI-11認證</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || "N"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="選擇認證狀態" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Y">已認證</SelectItem>
                              <SelectItem value="N">未認證</SelectItem>
                              <SelectItem value="審核中">審核中</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cqi11_expiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CQI-11到期日</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                    <FormField
                      control={form.control}
                      name="cqi12_certified"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CQI-12認證</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || "N"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="選擇認證狀態" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Y">已認證</SelectItem>
                              <SelectItem value="N">未認證</SelectItem>
                              <SelectItem value="審核中">審核中</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cqi12_expiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CQI-12到期日</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="category1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>類別1</FormLabel>
                        <FormControl>
                          <Input placeholder="輸入類別1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>類別2</FormLabel>
                        <FormControl>
                          <Input placeholder="輸入類別2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category3"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>類別3</FormLabel>
                        <FormControl>
                          <Input placeholder="輸入類別3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional">
            <Card>
              <CardHeader>
                <CardTitle>其他資訊</CardTitle>
                <CardDescription>添加其他相關資訊和備註</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>備註</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="輸入供應商相關備註"
                          className="min-h-[150px]"
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
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
          <Button type="button" variant="outline" onClick={() => router.push("/factories/all")} disabled={isLoading}>
            取消
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                處理中...
              </>
            ) : factoryData || factoryId ? (
              "更新供應商"
            ) : (
              "創建供應商"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
