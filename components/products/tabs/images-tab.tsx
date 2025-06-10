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

// 顯示圖面預覽的組件
const DrawingPreview = ({ drawing, label }: { drawing: any; label: string }) => {
  if (!drawing || !drawing.filename) return null

  // 獲取文件名（不含副檔名）
  const fileName = drawing.filename.split(".").slice(0, -1).join(".")

  // 構建 API URL
  const previewUrl = drawing.path ? `/api/preview?path=${encodeURIComponent(drawing.path)}` : null
  console.log('預覽 URL:', previewUrl)

  // 檢查是否為圖片檔案
  const isImage = drawing.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(drawing.filename)

  return (
    <div className="mt-4 border rounded-md p-4">
      <p className="text-center font-medium mb-2">{fileName}</p>
      {previewUrl ? (
        <div className="flex justify-center mb-2">
          {isImage ? (
            <img
              src={previewUrl}
              alt={`${label}預覽`}
              className="max-h-40 object-contain"
              onError={(e) => {
                //console.error('圖片載入失敗:', e)
                const target = e.target as HTMLImageElement
                target.style.display = "none"
                const nextElement = target.nextElementSibling as HTMLElement
                if (nextElement) {
                  nextElement.style.display = "block"
                }
              }}
            />
          ) : (
            <div className="text-center">
              <p className="text-gray-500 mb-2">此檔案類型無法在網頁中預覽</p>
              <Button
                variant="outline"
                onClick={() => {
                  // 使用 API 路由開啟檔案
                  fetch(`/api/preview?path=${encodeURIComponent(drawing.path)}`)
                    .then(response => response.blob())
                    .then(blob => {
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = drawing.filename
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                    })
                    .catch(error => {
                      console.error('開啟檔案時發生錯誤:', error)
                      alert('開啟檔案時發生錯誤')
                    })
                }}
              >
                下載並開啟檔案
              </Button>
            </div>
          )}
          <div className="hidden text-center text-gray-500 py-4">無法預覽此文件格式</div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">
          {drawing.type ? `此檔案類型 (${drawing.type}) 無法預覽` : '無法預覽此文件格式'}
        </div>
      )}
      <p className="text-xs text-gray-500 break-all">{drawing.originalPath}</p>
    </div>
  )
}

export function ImagesTab({ product, handleInputChange, setProduct }: ImagesTabProps) {
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldType: string) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    // 檢查檔案類型
    const isImage = file.type.startsWith('image/')
    
    // 只更新檔案名稱，保留原有的路徑
    const fileName = file.name
    
    setProduct((prev: any) => {
      const currentDrawing = prev[fieldType] || {}
      return {
        ...prev,
        [fieldType]: {
          ...currentDrawing,
          filename: fileName,
          type: file.type
        }
      }
    })
    
    console.log('更新檔案名稱:', fileName)
    
    // Reset input to allow selecting the same file again
    e.target.value = ""
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">圖面資訊</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
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
                      <Input readOnly value={product.customerOriginalDrawing?.filename || "未選擇圖面"} className="flex-1" />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("customerOriginalDrawing")?.click()}
                      >
                        選擇圖面連結
                      </Button>
                    </div>
                    <div className="mt-2">
                      <Label htmlFor="customerOriginalDrawingPath">檔案路徑</Label>
                      <Input
                        id="customerOriginalDrawingPath"
                        value={product.customerOriginalDrawing?.path || ""}
                        onChange={(e) => {
                          const newPath = e.target.value
                          setProduct((prev: any) => ({
                            ...prev,
                            customerOriginalDrawing: {
                              ...prev.customerOriginalDrawing,
                              path: newPath,
                              originalPath: newPath
                            }
                          }))
                        }}
                        placeholder="請輸入完整的檔案路徑 (例如: Y:\資料夾\檔案.jpg)"
                      />
                    </div>
                    <DrawingPreview drawing={product.customerOriginalDrawing} label="客戶原圖" />
                  </div>
                </div>

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
                  <div className="mt-2">
                    <Label htmlFor="customerDrawingPath">檔案路徑</Label>
                    <Input
                      id="customerDrawingPath"
                      value={product.customerDrawing?.path || ""}
                      onChange={(e) => {
                        const newPath = e.target.value
                        setProduct((prev: any) => ({
                          ...prev,
                          customerDrawing: {
                            ...prev.customerDrawing,
                            path: newPath,
                            originalPath: newPath
                          }
                        }))
                      }}
                      placeholder="請輸入完整的檔案路徑 (例如: Y:\資料夾\檔案.jpg)"
                    />
                  </div>
                  <DrawingPreview drawing={product.customerDrawing} label="今湛客圖" />
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
                  <div className="mt-2">
                    <Label htmlFor="factoryDrawingPath">檔案路徑</Label>
                    <Input
                      id="factoryDrawingPath"
                      value={product.factoryDrawing?.path || ""}
                      onChange={(e) => {
                        const newPath = e.target.value
                        setProduct((prev: any) => ({
                          ...prev,
                          factoryDrawing: {
                            ...prev.factoryDrawing,
                            path: newPath,
                            originalPath: newPath
                          }
                        }))
                      }}
                      placeholder="請輸入完整的檔案路徑 (例如: Y:\資料夾\檔案.jpg)"
                    />
                  </div>
                  <DrawingPreview drawing={product.factoryDrawing} label="今湛工廠圖" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
