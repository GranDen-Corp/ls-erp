"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ImagesTabProps {
  product: any
  handleInputChange: (field: string, value: any) => void
  setProduct: React.Dispatch<React.SetStateAction<any>>
}

export function ImagesTab({ product, handleInputChange, setProduct }: ImagesTabProps) {
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldType: string) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // In a real application, this would upload the file to the server
    // Here we're just simulating the upload process
    const file = files[0]
    const fileData = {
      path: URL.createObjectURL(file),
      filename: file.name,
    }

    switch (fieldType) {
      case "customerOriginalDrawing":
        setProduct((prev: any) => ({
          ...prev,
          customerOriginalDrawing: fileData,
        }))
        break
      case "customerDrawing":
        setProduct((prev: any) => ({
          ...prev,
          customerDrawing: fileData,
        }))
        break
      case "factoryDrawing":
        setProduct((prev: any) => ({
          ...prev,
          factoryDrawing: fileData,
        }))
        break
      default:
        break
    }

    // Reset input to allow selecting the same file again
    e.target.value = ""
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-1 gap-6">
        {/* Drawing Information */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">圖面資訊</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Left: Original Drawing Version and Customer Original Drawing */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="originalDrawingVersion">原圖版次</Label>
                    <Input
                      id="originalDrawingVersion"
                      value={product.originalDrawingVersion || ""}
                      onChange={(e) => handleInputChange("originalDrawingVersion", e.target.value)}
                      placeholder="輸入原圖版次"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerOriginalDrawing">客戶原圖</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        id="customerOriginalDrawing"
                        onChange={(e) => handleFileUpload(e, "customerOriginalDrawing")}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("customerOriginalDrawing")?.click()}
                        className="w-full"
                      >
                        選擇圖面連結
                      </Button>
                    </div>

                    {product.customerOriginalDrawing?.filename && (
                      <div className="mt-4 border rounded-md p-4">
                        <p className="text-center font-medium mb-2">
                          {product.customerOriginalDrawing.filename.split(".").slice(0, -1).join(".")}
                        </p>
                        {product.customerOriginalDrawing.path && (
                          <div className="flex justify-center mb-2">
                            <img
                              src={product.customerOriginalDrawing.path || "/placeholder.svg"}
                              alt="客戶原圖預覽"
                              className="max-h-40 object-contain"
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).style.display = "none"
                                ;(e.target as HTMLImageElement).nextElementSibling!.style.display = "block"
                              }}
                            />
                            <div className="hidden text-center text-gray-500 py-4">無法預覽此文件格式</div>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 break-all">{product.customerOriginalDrawing.path}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Vehicle Drawing No and Customer Drawing No (synced from basic info) */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="syncedVehicleDrawingNo">車廠圖號</Label>
                    <Input
                      id="syncedVehicleDrawingNo"
                      value={product.vehicleDrawingNo || ""}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="syncedCustomerDrawingNo">客戶圖號</Label>
                    <Input
                      id="syncedCustomerDrawingNo"
                      value={product.customerDrawingNo || ""}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-center">今湛客圖</h4>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-center">今湛工廠圖</h4>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerDrawingVersion">客戶圖版次</Label>
                  <Input
                    id="customerDrawingVersion"
                    value={product.customerDrawingVersion || ""}
                    onChange={(e) => handleInputChange("customerDrawingVersion", e.target.value)}
                    placeholder="輸入客戶圖版次"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="factoryDrawingVersion">工廠圖版次</Label>
                  <Input
                    id="factoryDrawingVersion"
                    value={product.factoryDrawingVersion || ""}
                    onChange={(e) => handleInputChange("factoryDrawingVersion", e.target.value)}
                    placeholder="輸入工廠圖版次"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerDrawing">今湛客圖</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      id="customerDrawing"
                      onChange={(e) => handleFileUpload(e, "customerDrawing")}
                      className="hidden"
                    />
                    <Input readOnly value={product.customerDrawing?.filename || "未選擇圖面"} className="flex-1" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("customerDrawing")?.click()}
                    >
                      選擇圖面連結
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="factoryDrawing">今湛工廠圖</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      id="factoryDrawing"
                      onChange={(e) => handleFileUpload(e, "factoryDrawing")}
                      className="hidden"
                    />
                    <Input readOnly value={product.factoryDrawing?.filename || "未選擇圖面"} className="flex-1" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("factoryDrawing")?.click()}
                    >
                      選擇圖面連結
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
