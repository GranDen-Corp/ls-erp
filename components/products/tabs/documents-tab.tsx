"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, X } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"


interface DocumentsTabProps {
  product: any
  setProduct: React.Dispatch<React.SetStateAction<any>>
  setIsNoteDialogOpen?: (open: boolean) => void
  setIsPartManagementDialogOpen?: (open: boolean) => void
  setIsComplianceDialogOpen?: (open: boolean) => void
  handlePartManagementChange?: (field: string, value: boolean) => void
  handleComplianceStatusChange?: (regulation: string, status: boolean) => void
  handleComplianceFieldChange?: (regulation: string, field: string, value: string) => void
  form?: any
  documentData?: any
  onDocumentDataChange?: (data: any) => void
  isReadOnly?: boolean
}

export function DocumentsTab({
  product,
  setProduct,
  isReadOnly = false,
  setIsNoteDialogOpen,
  setIsPartManagementDialogOpen,
  setIsComplianceDialogOpen,
  handlePartManagementChange,
  handleComplianceStatusChange,
  handleComplianceFieldChange,
  form,
  documentData,
  onDocumentDataChange,
}: DocumentsTabProps) {
  // Dialog 狀態
  const [isEditNoteDialogOpen, setIsEditNoteDialogOpen] = useState(false)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null)
  const [editNote, setEditNote] = useState({ content: "", date: "", user: "" })

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldType: string) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const filePath = e.target.value // 獲取完整路徑
    const fileData = {
      path: filePath,
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
          setProduct((prev: any) => {
            const exists = (prev.complianceStatus || []).some((item: any) => item.regulation === regulation)
            return {
              ...prev,
              complianceStatus: exists
                ? prev.complianceStatus.map((item: any) =>
                    item.regulation === regulation
                      ? { ...item, document: fileData.path }
                      : item
                  )
                : [...(prev.complianceStatus || []), {
                    regulation,
                    document: fileData.path,
                    regulationType: "standard",
                  }],
            }
          })
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

  // 處理文件路徑輸入
  const handleFilePathInput = (path: string, fieldType: string) => {
    const fileData = {
      path: path,
      filename: path.split('\\').pop() || path.split('/').pop() || path,
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
          setProduct((prev: any) => {
            const exists = (prev.complianceStatus || []).some((item: any) => item.regulation === regulation)
            return {
              ...prev,
              complianceStatus: exists
                ? prev.complianceStatus.map((item: any) =>
                    item.regulation === regulation
                      ? { ...item, document: fileData.path }
                      : item
                  )
                : [...(prev.complianceStatus || []), {
                    regulation,
                    document: fileData.path,
                    regulationType: "standard",
                  }],
            }
          })
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
  }

  // 處理文件下載
  const handleFileDownload = async (path: string, filename: string) => {
    try {
      const response = await fetch(`/api/preview?path=${encodeURIComponent(path)}`)
      if (!response.ok) throw new Error('下載失敗')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('下載檔案時發生錯誤:', error)
      alert('下載檔案時發生錯誤')
    }
  }

  // 如果有文件選擇對話框，確保它保存完整路徑
  const handleDocumentSelect = (documentPath: string) => {
    // 保存完整路徑
    if (form && onDocumentDataChange) {
      const currentDocs = form.getValues("important_documents") || ""
      const newDocs = currentDocs ? `${currentDocs}\n${documentPath}` : documentPath

      form.setValue("important_documents", newDocs)
      const updatedData = {
        ...(documentData || {}),
        important_documents: newDocs,
      }
      onDocumentDataChange(updatedData)
    }
  }

  return (
    <div>
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
                    disabled={isReadOnly}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    新增文件
                  </Button>
                </div>

                {/* 直接顯示文件上傳區域，移除JSON欄位和提示文字 */}

                {/* Standard Documents */}
                <div className="space-y-4 mt-4">
                  <h4 className="text-sm font-medium">標準文件</h4>

                  <div className="space-y-2">
                    <Label htmlFor="PPAP">PPAP認可資料夾</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={product.importantDocuments?.PPAP?.document || ""}
                        onChange={(e) => handleFilePathInput(e.target.value, "PPAP")}
                        placeholder="請輸入完整資料夾路徑"
                        className="flex-1"
                        disabled={isReadOnly}
                      />
                      {isReadOnly && product.importantDocuments?.PPAP?.document && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            // 使用 API 開啟資料夾
                            fetch(`/api/preview?path=${encodeURIComponent(product.importantDocuments.PPAP.document)}&type=folder`)
                              .then(response => {
                                if (!response.ok) {
                                  throw new Error('開啟資料夾失敗')
                                }
                                return response.json()
                              })
                              .then(data => {
                                if (data.success) {
                                  console.log('資料夾已開啟')
                                } else {
                                  throw new Error(data.message || '開啟資料夾失敗')
                                }
                              })
                              .catch(error => {
                                console.error('開啟資料夾時發生錯誤:', error)
                                alert('開啟資料夾時發生錯誤')
                              })
                          }}
                        >
                          開啟資料夾
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="PSW">PSW報告</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={product.importantDocuments?.PSW?.document || ""}
                        onChange={(e) => handleFilePathInput(e.target.value, "PSW")}
                        placeholder="請輸入完整檔案路徑"
                        className="flex-1"
                        disabled={isReadOnly}
                      />
                      {!isReadOnly && (
                        <>
                          <Input
                            type="file"
                            id="PSW"
                            onChange={(e) => handleFileUpload(e, "PSW")}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("PSW")?.click()}
                          >
                            選擇檔案
                          </Button>
                        </>
                      )}
                      {isReadOnly && product.importantDocuments?.PSW?.document && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{product.importantDocuments.PSW.document}</span>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleFileDownload(
                              product.importantDocuments.PSW.document,
                              product.importantDocuments.PSW.filename || product.importantDocuments.PSW.document.split('\\').pop() || product.importantDocuments.PSW.document.split('/').pop() || product.importantDocuments.PSW.document
                            )}
                          >
                            下載並開啟
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacityAnalysis">產能分析</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={product.importantDocuments?.capacityAnalysis?.document || ""}
                        onChange={(e) => handleFilePathInput(e.target.value, "capacityAnalysis")}
                        placeholder="請輸入完整檔案路徑"
                        className="flex-1"
                        disabled={isReadOnly}
                      />
                      {!isReadOnly && (
                        <>
                          <Input
                            type="file"
                            id="capacityAnalysis"
                            onChange={(e) => handleFileUpload(e, "capacityAnalysis")}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("capacityAnalysis")?.click()}
                          >
                            選擇檔案
                          </Button>
                        </>
                      )}
                      {isReadOnly && product.importantDocuments?.capacityAnalysis?.document && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{product.importantDocuments.capacityAnalysis.document}</span>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleFileDownload(
                              product.importantDocuments.capacityAnalysis.document,
                              product.importantDocuments.capacityAnalysis.filename || product.importantDocuments.capacityAnalysis.document.split('\\').pop() || product.importantDocuments.capacityAnalysis.document.split('/').pop() || product.importantDocuments.capacityAnalysis.document
                            )}
                          >
                            下載並開啟
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Custom Documents */}
                {product.importantDocuments &&
                  Object.entries(product.importantDocuments).map(([key, doc]) => {
                    if (key === "PPAP" || key === "PSW" || key === "capacityAnalysis" || key === "text") return null

                    return (
                      <div key={key} className="space-y-2 border-t pt-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              value={(doc as any).title || key}
                              onChange={(e) => {
                                if (!isReadOnly) {
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
                                }
                              }}
                              className="w-48"
                              placeholder="文件標題"
                              disabled={isReadOnly}
                            />
                          </div>
                          {!isReadOnly && (
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
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            value={(doc as any).document || ""}
                            onChange={(e) => handleFilePathInput(e.target.value, `customDoc_${key}`)}
                            placeholder="請輸入完整檔案路徑"
                            className="flex-1"
                            disabled={isReadOnly}
                          />
                          {isReadOnly && (doc as any).document && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleFileDownload(
                                (doc as any).document,
                                (doc as any).filename || (doc as any).document.split('\\').pop() || (doc as any).document.split('/').pop() || (doc as any).document
                              )}
                            >
                              下載並開啟
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Part Management Characteristics */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">零件管理特性</h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setIsPartManagementDialogOpen && setIsPartManagementDialogOpen(true)}
                    disabled={isReadOnly}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    新增特性
                  </Button>
                </div>

                <div className="space-y-2">
                  {Object.entries(product.partManagement || {}).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                      <div className="col-span-2">
                        <Label htmlFor={key}>{key}</Label>
                      </div>
                      <div className="flex justify-end">
                        <Checkbox
                          id={key}
                          checked={value === true}
                          onCheckedChange={(checked) =>
                            !isReadOnly &&
                            handlePartManagementChange &&
                            handlePartManagementChange(key, checked === true)
                          }
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>
                  ))}
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
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setIsComplianceDialogOpen && setIsComplianceDialogOpen(true)}
                    disabled={isReadOnly}
                  >
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

                  {product.complianceStatus && Object.entries(product.complianceStatus).map(([idx,data]: any) => (
                    <div key={data.regulation} className="grid grid-cols-5 gap-4 items-center border-b pb-2">
                      <div><Label>{data.regulation}</Label></div>

                      <RadioGroup
                        value={data.status ? "Yes" : "No"}
                        onValueChange={(value) =>
                          !isReadOnly && handleComplianceStatusChange && handleComplianceStatusChange(data.regulation, value === "Yes")
                        }
                        className="flex justify-center space-x-4"
                        disabled={isReadOnly}
                      >
                        {data.regulationType === "containment" ? (
                          <>
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="Yes" id={`${data.regulation}-has`} />
                              <Label htmlFor={`${data.regulation}-has`} className="text-sm">含有</Label>
                            </div>
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="No" id={`${data.regulation}-not-has`} />
                              <Label htmlFor={`${data.regulation}-not-has`} className="text-sm">不含有</Label>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="Yes" id={`${data.regulation}-comply`} />
                              <Label htmlFor={`${data.regulation}-comply`} className="text-sm">符合</Label>
                            </div>
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="No" id={`${data.regulation}-not-comply`} />
                              <Label htmlFor={`${data.regulation}-not-comply`} className="text-sm">不符</Label>
                            </div>
                          </>
                        )}
                      </RadioGroup>

                      <div>
                        <Input
                          type="text"
                          value={data.substances || ""}
                          onChange={(e) =>
                            !isReadOnly && handleComplianceFieldChange && handleComplianceFieldChange(data.regulation, "substances", e.target.value)
                          }
                          placeholder="含有物質"
                          disabled={isReadOnly}
                        />
                      </div>

                      <div>
                        <Input
                          type="text"
                          value={data.reason || ""}
                          onChange={(e) =>
                            !isReadOnly && handleComplianceFieldChange && handleComplianceFieldChange(data.regulation, "reason", e.target.value)
                          }
                          placeholder="理由"
                          disabled={isReadOnly}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={data.document || ""}
                          onChange={(e) => handleFilePathInput(e.target.value, `compliance_${data.regulation}`)}
                          placeholder="請輸入完整檔案路徑"
                          className="flex-1"
                          disabled={isReadOnly}
                        />
                        {isReadOnly && data.document && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleFileDownload(
                              data.document,
                              data.document.split('\\').pop() || data.document.split('/').pop() || data.document
                            )}
                          >
                            下載並開啟
                          </Button>
                        )}
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
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditNote({ content: "", date: new Date().toLocaleDateString("zh-TW"), user: "" })
                      setIsEditingNote(false)
                      setEditingNoteIndex(null)
                      setIsEditNoteDialogOpen(true)
                    }}
                    disabled={isReadOnly}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加備註
                  </Button>
                </div>

                <div className="border rounded-md">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">備註內容</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 w-[120px]">日期</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 w-[120px]">使用者</th>
                        {!isReadOnly && (
                          <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 w-[100px]">操作</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {product.editNotes && product.editNotes.length > 0 ? (
                        product.editNotes.map((note: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm">{note.content}</td>
                            <td className="px-4 py-2 text-sm">{note.date}</td>
                            <td className="px-4 py-2 text-sm">{note.user}</td>
                            {!isReadOnly && (
                              <td className="px-4 py-2">
                                <div className="flex justify-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditNote({
                                        content: note.content || "",
                                        user: note.user || "",
                                        date: note.date || "",
                                      })
                                      setIsEditingNote(true)
                                      setEditingNoteIndex(index)
                                      setIsEditNoteDialogOpen(true)
                                    }}
                                    className="h-7 w-7"
                                    type="button"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                      <path d="m15 5 4 4" />
                                    </svg>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      if (setProduct) {
                                        const updatedNotes = [...(product.editNotes || [])]
                                        updatedNotes.splice(index, 1)
                                        setProduct({
                                          ...product,
                                          editNotes: updatedNotes,
                                        })
                                      }
                                    }}
                                    className="h-7 w-7 text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={isReadOnly ? 3 : 4} className="px-4 py-4 text-center text-sm text-gray-500">
                            尚未添加編輯備註
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 編輯/新增備註 Dialog */}
          <Dialog open={isEditNoteDialogOpen} onOpenChange={setIsEditNoteDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{isEditingNote ? "編輯備註" : "添加備註"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editNoteContent">備註內容</Label>
                  <Textarea
                    id="editNoteContent"
                    value={editNote.content}
                    onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                    placeholder="輸入備註內容"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editNoteDate">日期</Label>
                    <Input
                      id="editNoteDate"
                      type="text"
                      value={editNote.date}
                      onChange={(e) => setEditNote({ ...editNote, date: e.target.value })}
                      placeholder="YYYY/MM/DD"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editNoteUser">使用者</Label>
                    <Input
                      id="editNoteUser"
                      value={editNote.user}
                      onChange={(e) => setEditNote({ ...editNote, user: e.target.value })}
                      placeholder="輸入使用者名稱"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditNoteDialogOpen(false)}>
                  取消
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (!editNote.content) return
                    const date = editNote.date || new Date().toLocaleDateString("zh-TW")
                    const user = editNote.user || "系統使用者"
                    if (isEditingNote && editingNoteIndex !== null) {
                      // 編輯
                      setProduct((prev: any) => {
                        const notes = [...(prev.editNotes || [])]
                        notes[editingNoteIndex] = { ...editNote, date, user }
                        return { ...prev, editNotes: notes }
                      })
                    } else {
                      // 新增
                      setProduct((prev: any) => ({
                        ...prev,
                        editNotes: [...(prev.editNotes || []), { ...editNote, date, user }],
                      }))
                    }
                    setIsEditNoteDialogOpen(false)
                  }}
                >
                  {isEditingNote ? "更新" : "添加"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </div>
    </div>
  )
}
