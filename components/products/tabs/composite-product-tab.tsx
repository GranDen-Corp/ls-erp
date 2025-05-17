"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

interface CompositeProductTabProps {
  selectedComponents: any[]
  componentDetails: { [key: string]: string }
  openComponentSelector: () => void
  removeComponent: (partNo: string) => void
}

export function CompositeProductTab({
  selectedComponents,
  componentDetails,
  openComponentSelector,
  removeComponent,
}: CompositeProductTabProps) {
  return (
    <Card className="mt-4">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">組件產品列表</h3>
            <Button type="button" onClick={openComponentSelector}>
              <Plus className="h-4 w-4 mr-2" />
              選擇組件
            </Button>
          </div>

          {selectedComponents.length === 0 ? (
            <div className="text-center py-8 border rounded-md text-gray-500">尚未選擇任何組件產品</div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">產品編號</th>
                    <th className="px-4 py-2 text-left">產品名稱</th>
                    <th className="px-4 py-2 text-center w-20">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedComponents.map((component, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2 font-medium">{component.part_no}</td>
                      <td className="px-4 py-2">
                        {componentDetails[component.part_no] || component.description || ""}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeComponent(component.part_no)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="text-sm text-gray-500">
            注意：組合產品將由上述選擇的組件組成。請確保所有必要的組件都已添加。
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
