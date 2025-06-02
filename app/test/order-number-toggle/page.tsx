import OrderNumberToggleTest from "@/components/test/order-number-toggle-test"

export default function OrderNumberToggleTestPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">訂單編號切換功能測試</h1>
        <p className="text-muted-foreground mt-2">測試自訂編號和自動編號之間的切換功能是否正常工作</p>
      </div>

      <OrderNumberToggleTest />
    </div>
  )
}
