"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil } from "lucide-react"
import { useState, useEffect } from "react"

interface ResumeTabProps {
  product: any
  handleInputChange: (field: string, value: any) => void
  setIsOrderHistoryDialogOpen: (open: boolean) => void
  setIsResumeNoteDialogOpen: (open: boolean) => void
  handleOrderHistoryChange: (index: number, field: string, value: string | number) => void
  handleRemoveOrderHistory: (index: number) => void
}

interface EditNoteDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  initialNote: string
  onSaveNote: (note: string) => void
  title?: string
}

function EditNoteDialog({ open, setOpen, initialNote, onSaveNote, title = "編輯備註" }: EditNoteDialogProps) {
  const [note, setNote] = useState(initialNote)

  return (
    <dialog open={open} className="fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} className="w-full mb-4" />
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button
            onClick={() => {
              onSaveNote(note)
              setOpen(false)
            }}
          >
            儲存
          </Button>
        </div>
      </div>
    </dialog>
  )
}

interface SpecialReqDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  initialRequirements: string
  onSaveRequirements: (requirements: string) => void
}

function SpecialReqDialog({ open, setOpen, initialRequirements, onSaveRequirements }: SpecialReqDialogProps) {
  const [requirements, setRequirements] = useState(initialRequirements)

  return (
    <dialog open={open} className="fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">編輯特殊要求</h2>
        <Textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          rows={4}
          className="w-full mb-4"
        />
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button
            onClick={() => {
              onSaveRequirements(requirements)
              setOpen(false)
            }}
          >
            儲存
          </Button>
        </div>
      </div>
    </dialog>
  )
}

interface ComplianceDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  initialInfo: string
  onSaveInfo: (info: string) => void
}

function ComplianceDialog({ open, setOpen, initialInfo, onSaveInfo }: ComplianceDialogProps) {
  const [info, setInfo] = useState(initialInfo)

  return (
    <dialog open={open} className="fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">編輯合規資料</h2>
        <Textarea value={info} onChange={(e) => setInfo(e.target.value)} rows={4} className="w-full mb-4" />
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button
            onClick={() => {
              onSaveInfo(info)
              setOpen(false)
            }}
          >
            儲存
          </Button>
        </div>
      </div>
    </dialog>
  )
}

export function ResumeTab({
  product,
  handleInputChange,
  setIsOrderHistoryDialogOpen,
  setIsResumeNoteDialogOpen,
  handleOrderHistoryChange,
  handleRemoveOrderHistory,
}: ResumeTabProps) {
  const [resumeData, setResumeData] = useState({
    resume_note: product.resume_note || "",
    quality_note: product.quality_note || "",
    special_requirements: product.special_requirements || "",
    compliance_info: product.compliance_info || "",
  })
  const [isEditNoteDialogOpen, setIsEditNoteDialogOpen] = useState(false)
  const [isQualityNoteDialogOpen, setIsQualityNoteDialogOpen] = useState(false)
  const [isSpecialReqDialogOpen, setIsSpecialReqDialogOpen] = useState(false)
  const [isComplianceDialogOpen, setIsComplianceDialogOpen] = useState(false)

  // 確保在組件掛載時不會自動打開對話框
  useEffect(() => {
    // 初始化數據，但不打開對話框
    setResumeData({
      resume_note: product.resume_note || "",
      quality_note: product.quality_note || "",
      special_requirements: product.special_requirements || "",
      compliance_info: product.compliance_info || "",
    })
  }, [product])

  const onResumeDataChange = (updatedData: any) => {
    handleInputChange("resume_note", updatedData.resume_note)
    handleInputChange("quality_note", updatedData.quality_note)
    handleInputChange("special_requirements", updatedData.special_requirements)
    handleInputChange("compliance_info", updatedData.compliance_info)
  }

  const handleSaveResumeNote = (note: string) => {
    const updatedData = {
      ...resumeData,
      resume_note: note,
    }
    setResumeData(updatedData)
    onResumeDataChange(updatedData)
    setIsEditNoteDialogOpen(false)
  }

  const handleSaveSpecialRequirements = (requirements: string) => {
    const updatedData = {
      ...resumeData,
      special_requirements: requirements,
    }
    setResumeData(updatedData)
    onResumeDataChange(updatedData)
    setIsSpecialReqDialogOpen(false)
  }

  const handleSaveComplianceInfo = (info: string) => {
    const updatedData = {
      ...resumeData,
      compliance_info: info,
    }
    setResumeData(updatedData)
    onResumeDataChange(updatedData)
    setIsComplianceDialogOpen(false)
  }

  const handleSaveQualityNote = (note: string) => {
    const updatedData = {
      ...resumeData,
      quality_note: note,
    }
    setResumeData(updatedData)
    onResumeDataChange(updatedData)
    setIsQualityNoteDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左側欄 */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">基本履歷資料</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsEditNoteDialogOpen(true)}>
                  <Pencil className="h-4 w-4 mr-1" /> 編輯備註
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="resume_note">產品備註</Label>
                    <div className="p-3 bg-muted rounded-md min-h-[100px] whitespace-pre-wrap">
                      {resumeData.resume_note || "無產品備註"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">品質資料</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsQualityNoteDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> 添加品質備註
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="quality_note">品質備註</Label>
                    <div className="p-3 bg-muted rounded-md min-h-[100px] whitespace-pre-wrap">
                      {resumeData.quality_note || "無品質備註"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右側欄 */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">特殊要求</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsSpecialReqDialogOpen(true)}>
                  <Pencil className="h-4 w-4 mr-1" /> 編輯特殊要求
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="special_requirements">特殊要求內容</Label>
                    <div className="p-3 bg-muted rounded-md min-h-[100px] whitespace-pre-wrap">
                      {resumeData.special_requirements || "無特殊要求"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">合規資料</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsComplianceDialogOpen(true)}>
                  <Pencil className="h-4 w-4 mr-1" /> 編輯合規資料
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="compliance_info">合規資訊</Label>
                    <div className="p-3 bg-muted rounded-md min-h-[100px] whitespace-pre-wrap">
                      {resumeData.compliance_info || "無合規資訊"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 對話框 */}
      <EditNoteDialog
        open={isEditNoteDialogOpen}
        setOpen={setIsEditNoteDialogOpen}
        initialNote={resumeData.resume_note || ""}
        onSaveNote={handleSaveResumeNote}
      />

      <SpecialReqDialog
        open={isSpecialReqDialogOpen}
        setOpen={setIsSpecialReqDialogOpen}
        initialRequirements={resumeData.special_requirements || ""}
        onSaveRequirements={handleSaveSpecialRequirements}
      />

      <ComplianceDialog
        open={isComplianceDialogOpen}
        setOpen={setIsComplianceDialogOpen}
        initialInfo={resumeData.compliance_info || ""}
        onSaveInfo={handleSaveComplianceInfo}
      />

      <EditNoteDialog
        open={isQualityNoteDialogOpen}
        setOpen={setIsQualityNoteDialogOpen}
        initialNote={resumeData.quality_note || ""}
        onSaveNote={handleSaveQualityNote}
        title="添加品質備註"
      />
    </div>
  )
}
