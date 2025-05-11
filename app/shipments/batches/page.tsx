import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShipmentBatchesTable } from "@/components/shipments/shipment-batches-table"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Input } from "@/components/ui/input"
import { CalendarIcon, Download, Search } from "lucide-react"

// 模擬從API獲取出貨批次數據
async function getShipmentBatches() {
  // 這裡應該是從API獲取數據的邏輯
  // 目前使用模擬數據
  return []
}

export default function ShipmentBatchesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">出貨批次管理</h1>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          匯出批次報表
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>批次搜尋</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <Input placeholder="搜尋訂單號碼、客戶或產品..." />
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">日期範圍:</span>
              <DateRangePicker />
            </div>
            <Button>
              <Search className="mr-2 h-4 w-4" />
              搜尋
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>出貨批次列表</CardTitle>
        </CardHeader>
        <CardContent>
          <ShipmentBatchesTable />
        </CardContent>
      </Card>
    </div>
  )
}
