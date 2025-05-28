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
import { useToast } from "@/components/ui/use-toast"
import { supabaseClient } from "@/lib/supabase-client"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// 表單驗證 schema - 對應 suppliers 表結構
const factoryFormSchema = z.object({
  factory_id: z.string().min(1, { message: "供應商編號不能為空" }),
  factory_name: z.string().min(1, { message: "供應商名稱不能為空" }),
  factory_full_name: z.string().min(1, { message: "供應商全名不能為空" }),
  factory_address: z.string().optional(),
  factory_phone: z.string().optional(),
  factory_fax: z.string().optional(),
  tax_id: z.string().optional(),
  supplier_type: z.string().min(1, { message: "請選擇供應商類型" }),
  category1: z.string().optional(),
  category2: z.string().optional(),
  category3: z.string().optional(),
  iso9001_certified: z.string().optional(),
  iatf16949_certified: z.string().optional(),
  iso17025_certified: z.string().optional(),
  cqi9_certified: z.string().optional(),
  cqi11_certified: z.string().optional(),
  cqi12_certified: z.string().optional(),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email({ message: "請輸入有效的電子郵件地址" }).optional().or(z.literal("")),
  website: z.string().url({ message: "請輸入有效的網址" }).optional().or(z.literal("")),
  country: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
  quality_contact1: z.string().optional(),
  quality_contact2: z.string().optional(),
})

type FactoryFormValues = z.infer<typeof factoryFormSchema>

// 預設值
const defaultValues: Partial<FactoryFormValues> = {
  factory_id: "",
  factory_name: "",
  factory_full_name: "",
  factory_address: "",
  factory_phone: "",
  factory_fax: "",
  tax_id: "",
  supplier_type: "assembly",
  category1: "",
  category2: "",
  category3: "",
  iso9001_certified: "否",
  iatf16949_certified: "否",
  iso17025_certified: "否",
  cqi9_certified: "否",
  cqi11_certified: "否",
  cqi12_certified: "否",
  contact_person: "",
  contact_phone: "",
  contact_email: "",
  website: "",
  country: "台灣",
  city: "",
  postal_code: "",
  notes: "",
  status: "active",
  quality_contact1: "",
  quality_contact2: "",
}

interface FactoryFormProps {
  factory?: any
  factoryId?: string
  initialData?: any
}

export function FactoryForm({ factory, factoryId, initialData }: FactoryFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 合併初始數據
  const mergedInitialData = initialData || factory || {}

  // 初始化表單
  const form = useForm<FactoryFormValues>({
    resolver: zodResolver(factoryFormSchema),
    defaultValues: mergedInitialData.factory_id ? mergedInitialData : defaultValues,
  })

  // 當初始數據變更時更新表單
  useEffect(() => {
    if (mergedInitialData && Object.keys(mergedInitialData).length > 0) {
      console.log("FactoryForm 接收到的初始數據:", mergedInitialData)

      // 將初始數據映射到表單字段
      const formData = {
        factory_id: mergedInitialData.factory_id || "",
        factory_name: mergedInitialData.factory_name || "",
        factory_full_name: mergedInitialData.factory_full_name || "",
        factory_address: mergedInitialData.factory_address || "",
        factory_phone: mergedInitialData.factory_phone || "",
        factory_fax: mergedInitialData.factory_fax || "",
        tax_id: mergedInitialData.tax_id || "",
        supplier_type: mergedInitialData.supplier_type || "assembly",
        category1: mergedInitialData.category1 || "",
        category2: mergedInitialData.category2 || "",
        category3: mergedInitialData.category3 || "",
        iso9001_certified: mergedInitialData.iso9001_certified || "否",
        iatf16949_certified: mergedInitialData.iatf16949_certified || "否",
        iso17025_certified: mergedInitialData.iso17025_certified || "否",
        cqi9_certified: mergedInitialData.cqi9_certified || "否",
        cqi11_certified: mergedInitialData.cqi11_certified || "否",
        cqi12_certified: mergedInitialData.cqi12_certified || "否",
        contact_person: mergedInitialData.contact_person || "",
        contact_phone: mergedInitialData.contact_phone || "",
        contact_email: mergedInitialData.contact_email || "",
        website: mergedInitialData.website || "",
        country: mergedInitialData.country || "台灣",
        city: mergedInitialData.city || "",
        postal_code: mergedInitialData.postal_code || "",
        notes: mergedInitialData.notes || "",
        status: mergedInitialData.status || "active",
        quality_contact1: mergedInitialData.quality_contact1 || "",
        quality_contact2: mergedInitialData.quality_contact2 || "",
      }

      form.reset(formData)
    }
  }, [mergedInitialData, form])

  // 表單提交處理
  async function onSubmit(data: FactoryFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      // 檢查供應商ID是否已存在（僅在創建新供應商時檢查）
      if (!factoryId && !factory) {
        const { data: existingFactory, error: checkError } = await supabaseClient
          .from("suppliers")
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
      const supplierData = {
        ...data,
        updated_at: new Date().toISOString(),
      }

      // 如果是新增，加入創建時間
      if (!factoryId && !factory) {
        supplierData.created_at = new Date().toISOString()
      }

      // 插入或更新供應商資料
      const { error: saveError } =
        factoryId || factory
          ? await supabaseClient
              .from("suppliers")
              .update(supplierData)
              .eq("factory_id", factoryId || factory.factory_id)
          : await supabaseClient.from("suppliers").insert(supplierData)

      if (saveError) {
        throw new Error(`保存供應商資料時出錯: ${saveError.message}`)
      }

      // 顯示成功訊息
      toast({
        title: factoryId || factory ? "供應商已更新" : "供應商已建立",
        description: `供應商 ${data.factory_name} 已成功${factoryId || factory ? "更新" : "建立"}`,
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">基本資訊</TabsTrigger>
            <TabsTrigger value="contact">聯絡資訊</TabsTrigger>
            <TabsTrigger value="certification">認證資訊</TabsTrigger>
            <TabsTrigger value="additional">其他資訊</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>基本資訊</CardTitle>
                <CardDescription>輸入供應商的基本資訊</CardDescription>
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
                          <Input placeholder="輸入供應商編號" {...field} disabled={!!factoryId || !!factory} />
                        </FormControl>
                        <FormDescription>
                          {factoryId || factory ? "供應商編號不可修改" : "請輸入唯一的供應商識別碼"}
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
                    name="supplier_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>供應商類型 *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>國家/地區</FormLabel>
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
                  name="factory_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>地址</FormLabel>
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

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>聯絡資訊</CardTitle>
                <CardDescription>設定供應商的聯絡方式</CardDescription>
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
                        <FormControl>
                          <Input placeholder="輸入品質聯絡人1" {...field} />
                        </FormControl>
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
                        <FormControl>
                          <Input placeholder="輸入品質聯絡人2" {...field} />
                        </FormControl>
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
                <CardDescription>設定供應商的認證相關資訊</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="iso9001_certified"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ISO 9001認證</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="選擇認證狀態" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="是">已認證</SelectItem>
                            <SelectItem value="否">未認證</SelectItem>
                            <SelectItem value="審核中">審核中</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="iatf16949_certified"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IATF 16949認證</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="選擇認證狀態" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="是">已認證</SelectItem>
                            <SelectItem value="否">未認證</SelectItem>
                            <SelectItem value="審核中">審核中</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="iso17025_certified"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ISO 17025認證</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="選擇認證狀態" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="是">已認證</SelectItem>
                            <SelectItem value="否">未認證</SelectItem>
                            <SelectItem value="審核中">審核中</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cqi9_certified"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CQI-9認證</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="選擇認證狀態" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="是">已認證</SelectItem>
                            <SelectItem value="否">未認證</SelectItem>
                            <SelectItem value="審核中">審核中</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cqi11_certified"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CQI-11認證</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="選擇認證狀態" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="是">已認證</SelectItem>
                            <SelectItem value="否">未認證</SelectItem>
                            <SelectItem value="審核中">審核中</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cqi12_certified"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CQI-12認證</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="選擇認證狀態" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="是">已認證</SelectItem>
                            <SelectItem value="否">未認證</SelectItem>
                            <SelectItem value="審核中">審核中</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
            ) : factoryId || factory ? (
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
