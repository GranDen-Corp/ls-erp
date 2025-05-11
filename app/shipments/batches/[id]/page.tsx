"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowLeft, Calendar, Save } from "lucide-react"
import { formatDate } from "@/lib/utils"

// 模擬數據
const getBatchById = (id: string) => {
  return {
    id: "BAT001",
    orderNumber: "ORD-2023-001",
    batchNumber: 1,
    customer: "ABC Electronics",
    product: "Wireless Earbuds",
    totalQuantity: 1000,
    batchQuantity: 500,
    originalDeliveryDate: "2023-05-15",
    updatedCustomerDeliveryDate: "2023-05-20",
    factoryDeliveryDate: "2023-05-10",
    actualFactoryDeliveryDate: "2023-05-12",
    status: "on-time",
    notes: "First batch of wireless earbuds",
  }
}

const formSchema = z.object({
  updatedCustomerDeliveryDate: z.date().optional(),
  actualFactoryDeliveryDate: z.date().optional(),
  notes: z.string().optional(),
})

export default function BatchDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const batch = getBatchById(params.id)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      updatedCustomerDeliveryDate: batch.updatedCustomerDeliveryDate
        ? new Date(batch.updatedCustomerDeliveryDate)
        : undefined,
      actualFactoryDeliveryDate: batch.actualFactoryDeliveryDate
        ? new Date(batch.actualFactoryDeliveryDate)
        : undefined,
      notes: batch.notes,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // 在實際應用中，這裡會發送API請求來更新批次信息
    console.log(values)
    alert("批次信息已更新")
    router.push("/shipments/batches")
  }

  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>批次詳情</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">訂單號</label>
                      <p className="text-lg font-semibold">{batch.orderNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">批次</label>
                      <p className="text-lg font-semibold">批次 {batch.batchNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">客戶</label>
                      <p>{batch.customer}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">產品</label>
                      <p>{batch.product}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">總數量</label>
                      <p>{batch.totalQuantity}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">批次數量</label>
                      <p>{batch.batchQuantity}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">原始交貨期</label>
                      <p>{formatDate(batch.originalDeliveryDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">工廠交貨期</label>
                      <p>{formatDate(batch.factoryDeliveryDate)}</p>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="updatedCustomerDeliveryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>客戶更新交貨期</FormLabel>
                        <FormControl>
                          <DatePicker date={field.value} setDate={field.onChange} />
                        </FormControl>
                        <FormDescription>客戶要求的最新交貨日期</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="actualFactoryDeliveryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>工廠實際交貨期</FormLabel>
                        <FormControl>
                          <DatePicker date={field.value} setDate={field.onChange} />
                        </FormControl>
                        <FormDescription>工廠實際完成生產的日期</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>備註</FormLabel>
                        <FormControl>
                          <Textarea placeholder="輸入關於此批次的任何附加信息" className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    保存更改
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>交貨狀態</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">原始計劃</h3>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{formatDate(batch.originalDeliveryDate)}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">客戶更新</h3>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {batch.updatedCustomerDeliveryDate ? formatDate(batch.updatedCustomerDeliveryDate) : "未更新"}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">工廠計劃</h3>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{formatDate(batch.factoryDeliveryDate)}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">工廠實際</h3>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {batch.actualFactoryDeliveryDate ? formatDate(batch.actualFactoryDeliveryDate) : "尚未交貨"}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium">交貨狀態</h3>
                  <div className="mt-2">
                    {batch.status === "on-time" && (
                      <div className="flex">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-5 h-5 text-green-500 mr-2"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        準時交貨
                      </div>
                    )}
                    {batch.status === "delayed" && (
                      <div className="flex">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-5 h-5 text-red-500 mr-2"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                            clipRule="evenodd"
                          />
                        </svg>
                        延遲交貨
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
