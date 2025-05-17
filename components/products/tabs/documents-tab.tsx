"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, X } from "lucide-react"

interface DocumentsTabProps {
  product: any
  setProduct: React.Dispatch<React.SetStateAction<any>>
  setIsNoteDialogOpen: (open: boolean) => void
  setIsPartManagementDialogOpen: (open: boolean) => void
  setIsComplianceDialogOpen: (open: boolean) => void
  handlePartManagementChange: (field: string, value: boolean) => void
  handleComplianceStatusChange: (regulation: string, status: string) => void
  handleComplianceFieldChange: (regulation: string, field: string, value: string) => void
}

export function DocumentsTab({
  product,
  setProduct,
  setIsNoteDialogOpen,
  setIsPartManagementDialogOpen,
  setIsComplianceDialogOpen,
  handlePartManagementChange,
  handleComplianceStatusChange,
  handleComplianceFieldChange,
}: DocumentsTabProps) {
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
      case "PPAP":
        setProduct((prev: any) => ({
          ...prev,
          importantDocuments: {
            ...(prev.importantDocuments || {}),
            PPAP: { document: fileData.path, filename: fileData.filename },
          },
        }))
        break
      case "PSW":
        setProduct((prev: any) => ({
          ...prev,
          importantDocuments: {
            ...(prev.importantDocuments || {}),
            PSW: { document: fileData.path, filename: fileData.filename },
          },
        }))
        break
      case "capacityAnalysis":
        setProduct((prev: any) => ({
          ...prev,
          importantDocuments: {
            ...(prev.importantDocuments || {}),
            capacityAnalysis: { document: fileData.path, filename: fileData.filename },
          },
        }))
        break
      default:
        if (fieldType.startsWith("compliance_")) {
          const regulation = fieldType.split("_")[1]
          setProduct((prev: any) => ({
            ...prev,
            complianceStatus: {
              ...(prev.complianceStatus || {}),
              [regulation]: {
                ...(prev.complianceStatus?.[regulation] || {}),
                document: fileData.path,
                filename: fileData.filename,
              },
            },
          }))
        } else if (fieldType.startsWith("customDoc_")) {
          const key = fieldType.replace("customDoc_", "")
          setProduct((prev: any) => ({
            ...prev,
            importantDocuments: {
              ...(prev.importantDocuments || {}),
              [key]: {
                ...((prev.importantDocuments || {})[key] || {}),
                document: fileData.path,
                filename: fileData.filename,
              },
            },
          }))
        }
        break
    }

    // Reset input to allow selecting the same file again
    e.target.value = ""
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-1 gap-6">
        {/* Important Documents */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">重要文件</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newDocKey = `customDoc_${Date.now()}`
                    setProduct((prev: any) => ({
                      ...prev,
                      importantDocuments: {
                        ...(prev.importantDocuments || {}),
                        [newDocKey]: { document: "", filename: "", title: "新文件" },
                      },
                    }))
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  新增文件
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Standard Documents */}
                <div className="space-y-2">
                  <Label htmlFor="PPAP">PPAP認可資料夾</Label>
                  <div className="flex items-center gap-2">
                    <Input type="file" id="PPAP" onChange={(e) => handleFileUpload(e, "PPAP")} className="hidden" />
                    <Input
                      readOnly
                      value={product.importantDocuments?.PPAP?.filename || "未選擇文件"}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={() => document.getElementById("PPAP")?.click()}>
                      選擇文件連結
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="PSW">PSW報告</Label>
                  <div className="flex items-center gap-2">
                    <Input type="file" id="PSW" onChange={(e) => handleFileUpload(e, "PSW")} className="hidden" />
                    <Input
                      readOnly
                      value={product.importantDocuments?.PSW?.filename || "未選擇文件"}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={() => document.getElementById("PSW")?.click()}>
                      選擇文件連結
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacityAnalysis">產能分析</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      id="capacityAnalysis"
                      onChange={(e) => handleFileUpload(e, "capacityAnalysis")}
                      className="hidden"
                    />
                    <Input
                      readOnly
                      value={product.importantDocuments?.capacityAnalysis?.filename || "未選擇文件"}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("capacityAnalysis")?.click()}
                    >
                      選擇文件連結
                    </Button>
                  </div>
                </div>

                {/* Custom Documents */}
                {product.importantDocuments &&
                  Object.entries(product.importantDocuments).map(([key, doc]) => {
                    if (key === "PPAP" || key === "PSW" || key === "capacityAnalysis") return null

                    return (
                      <div key={key} className="space-y-2 border-t pt-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Input
                              value={(doc as any).title || key}
                              onChange={(e) => {
                                setProduct((prev: any) => ({
                                  ...prev,
                                  importantDocuments: {
                                    ...(prev.importantDocuments || {}),
                                    [key]: {
                                      ...((prev.importantDocuments || {})[key] || {}),
                                      title: e.target.value,
                                    },
                                  },
                                }))
                              }}
                              className="w-48"
                              placeholder="文件標題"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setProduct((prev: any) => {
                                const newDocs = { ...(prev.importantDocuments || {}) }
                                delete newDocs[key]
                                return {
                                  ...prev,
                                  importantDocuments: newDocs,
                                }
                              })
                            }}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            id={`customDoc_${key}`}
                            onChange={(e) => handleFileUpload(e, `customDoc_${key}`)}
                            className="hidden"
                          />
                          <Input readOnly value={(doc as any).filename || "未選擇文件"} className="flex-1" />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById(`customDoc_${key}`)?.click()}
                          >
                            選擇文件連結
                          </Button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Part Management Characteristics */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">零件管理特性</h3>
                <Button type="button" size="sm" variant="outline" onClick={() => setIsPartManagementDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  新增特性
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>特性名稱</Label>
                  </div>
                  <div className="text-right"></div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                  <div className="col-span-2">
                    <Label htmlFor="safetyPart">安全件</Label>
                  </div>
                  <div className="flex justify-end">
                    <Checkbox
                      id="safetyPart"
                      checked={product.partManagement?.safetyPart || false}
                      onCheckedChange={(checked) => handlePartManagementChange("safetyPart", checked === true)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                  <div className="col-span-2">
                    <Label htmlFor="automotivePart">汽車件</Label>
                  </div>
                  <div className="flex justify-end">
                    <Checkbox
                      id="automotivePart"
                      checked={product.partManagement?.automotivePart || false}
                      onCheckedChange={(checked) => handlePartManagementChange("automotivePart", checked === true)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                  <div className="col-span-2">
                    <Label htmlFor="CBAMPart">CBAM零件</Label>
                  </div>
                  <div className="flex justify-end">
                    <Checkbox
                      id="CBAMPart"
                      checked={product.partManagement?.CBAMPart || false}
                      onCheckedChange={(checked) => handlePartManagementChange("CBAMPart", checked === true)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                  <div className="col-span-2">
                    <Label htmlFor="clockRequirement">熔鑄地要求</Label>
                  </div>
                  <div className="flex justify-end">
                    <Checkbox
                      id="clockRequirement"
                      checked={product.partManagement?.clockRequirement || false}
                      onCheckedChange={(checked) => handlePartManagementChange("clockRequirement", checked === true)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Requirements */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">符合性要求</h3>
                <Button type="button" size="sm" variant="outline" onClick={() => setIsComplianceDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  新增法規
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <Label>法規</Label>
                  </div>
                  <div className="text-center">
                    <Label>符合狀態</Label>
                  </div>
                  <div className="text-center">
                    <Label>含有物質</Label>
                  </div>
                  <div className="text-center">
                    <Label>理由</Label>
                  </div>
                  <div className="text-center">
                    <Label>文件</Label>
                  </div>
                </div>

                {["RoHS", "REACh", "EUPOP", "TSCA", "CP65", "PFAS", "CMRT", "EMRT"].map((regulation) => (
                  <div key={regulation} className="grid grid-cols-5 gap-4 items-center border-b pb-2">
                    <div>
                      <Label>{regulation}</Label>
                    </div>
                    {regulation === "PFAS" || regulation === "CMRT" || regulation === "EMRT" ? (
                      <RadioGroup
                        value={product.complianceStatus?.[regulation]?.status || ""}
                        onValueChange={(value) => handleComplianceStatusChange(regulation, value)}
                        className="flex justify-center space-x-4"
                      >
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="含有" id={`${regulation}-has`} />
                          <Label htmlFor={`${regulation}-has`} className="text-sm">
                            含有
                          </Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="不含有" id={`${regulation}-not-has`} />
                          <Label htmlFor={`${regulation}-not-has`} className="text-sm">
                            不含有
                          </Label>
                        </div>
                      </RadioGroup>
                    ) : (
                      <RadioGroup
                        value={product.complianceStatus?.[regulation]?.status || ""}
                        onValueChange={(value) => handleComplianceStatusChange(regulation, value)}
                        className="flex justify-center space-x-4"
                      >
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="符合" id={`${regulation}-comply`} />
                          <Label htmlFor={`${regulation}-comply`} className="text-sm">
                            符合
                          </Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="不符" id={`${regulation}-not-comply`} />
                          <Label htmlFor={`${regulation}-not-comply`} className="text-sm">
                            不符
                          </Label>
                        </div>
                      </RadioGroup>
                    )}
                    <div>
                      <Input
                        value={product.complianceStatus?.[regulation]?.substances || ""}
                        onChange={(e) => handleComplianceFieldChange(regulation, "substances", e.target.value)}
                        placeholder="含有物質"
                      />
                    </div>
                    <div>
                      <Input
                        value={product.complianceStatus?.[regulation]?.reason || ""}
                        onChange={(e) => handleComplianceFieldChange(regulation, "reason", e.target.value)}
                        placeholder="理由"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        id={`compliance_${regulation}`}
                        onChange={(e) => handleFileUpload(e, `compliance_${regulation}`)}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => document.getElementById(`compliance_${regulation}`)?.click()}
                      >
                        選擇文件連結
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Notes */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">編輯備註</h3>
                <Button type="button" size="sm" variant="outline" onClick={() => setIsNoteDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加備註
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>備註內容</Label>
                </div>
                <div>
                  <Label>使用者</Label>
                </div>
                <div>
                  <Label>日期</Label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {product.editNotes &&
                  product.editNotes.map((note: any, index: number) => (
                    <div key={index} className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                      <div>{note.content}</div>
                      <div>{note.user}</div>
                      <div>{note.date}</div>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
