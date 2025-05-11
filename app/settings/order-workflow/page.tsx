import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderWorkflowSettings } from "@/components/settings/order-workflow-settings"

export default function OrderWorkflowPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">訂單流程設定</h1>

      <Card>
        <CardHeader>
          <CardTitle>訂單狀態流程設定</CardTitle>
          <CardDescription>設定訂單狀態流程及自動化規則</CardDescription>
        </CardHeader>
        <CardContent>
          <OrderWorkflowSettings />
        </CardContent>
      </Card>
    </div>
  )
}
