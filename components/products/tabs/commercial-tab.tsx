"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface CommercialTabProps {
  product: any
  handleInputChange: (field: string, value: any) => void
}

export function CommercialTab({ product, handleInputChange }: CommercialTabProps) {
  return (
    <Card className="mt-4">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="moq">最小訂購量 (MOQ)</Label>
              <Input
                id="moq"
                type="number"
                value={product.moq || 0}
                onChange={(e) => handleInputChange("moq", Number.parseInt(e.target.value) || 0)}
                placeholder="輸入最小訂購量"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="leadTime">交貨時間</Label>
              <Input
                id="leadTime"
                value={product.leadTime || ""}
                onChange={(e) => handleInputChange("leadTime", e.target.value)}
                placeholder="輸入交貨時間"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="packagingRequirements">包裝要求</Label>
              <Input
                id="packagingRequirements"
                value={product.packagingRequirements || ""}
                onChange={(e) => handleInputChange("packagingRequirements", e.target.value)}
                placeholder="輸入包裝要求"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
