"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Plus, X, ChevronUp, ChevronDown, FolderSync, Languages } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { getTranslationsByCategory, formatProcessesForOrderRemarks } from "@/lib/translation-service"
import { ProcessDialog } from "../dialogs/process-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

// 預設製程資料 - 根據提供的圖片更新
export const defaultProcesses = [
  {
    id: "proc_1",
    process: "材料",
    vendor: "中鋼",
    capacity: "產能數值",
    requirements: "SAE 10B21",
    report: "材證",
  },
  {
    id: "proc_2",
    process: "成型",
    vendor: "岡岩",
    capacity: "產能數值",
    requirements: "",
    report: "",
  },
  {
    id: "proc_3",
    process: "搓牙",
    vendor: "岡岩",
    capacity: "產能數值",
    requirements: "",
    report: "",
  },
  {
    id: "proc_4",
    process: "熱處理",
    vendor: "力大",
    capacity: "產能數值",
    requirements: "硬度HRC 28-32，拉力800Mpa，降伏640Mpa",
    report: "硬度，拉力",
  },
  {
    id: "proc_5",
    process: "電鍍",
    vendor: "頂上興",
    capacity: "產能數值",
    requirements: "三價鉻鋅SUM MIN，鹽測12/48",
    report: "膜厚，鹽測，除氫",
  },
  {
    id: "proc_6",
    process: "篩選",
    vendor: "聖鼎",
    capacity: "產能數值",
    requirements: "50 PPM：混料、總長",
    report: "篩選報告",
  },
]

interface ProcessTabProps {
  product?: any
  setProduct?: (product: any) => void
  handleInputChange?: (field: string, value: any) => void
  formData?: any
  updateFormData?: (data: any) => void
  readOnly?: boolean
}

export function ProcessTab({
  product,
  setProduct,
  handleInputChange,
  formData = {},
  updateFormData = () => {},
  readOnly = false,
}: ProcessTabProps) {
  const [translations, setTranslations] = useState<any[]>([])
  const [isTranslating, setIsTranslating] = useState(false)
  const [isAddProcessDialogOpen, setIsAddProcessDialogOpen] = useState(false)
  const [isSpecialReqDialogOpen, setIsSpecialReqDialogOpen] = useState(false)
  const [isProcessNoteDialogOpen, setIsProcessNoteDialogOpen] = useState(false)
  const [newProcess, setNewProcess] = useState({
    id: "",
    process: "",
    vendor: "",
    capacity: "",
    requirements: "",
    report: "",
  })
  const [newSpecialReq, setNewSpecialReq] = useState({ content: "", date: "", user: "" })
  const [newProcessNote, setNewProcessNote] = useState({ content: "", date: "", user: "" })
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null)
  const [editingProcessIndex, setEditingProcessIndex] = useState<number | null>(null)

  // 確保 formData 有初始值
  const safeFormData = formData || {}
  const safeProduct = product || {}

  // 初始化製程列表
  useEffect(() => {
    console.log("product:", product)
    if (updateFormData && (!safeFormData.processes || safeFormData.processes.length === 0)) {
      //console.log("updateFormData:",safeFormData);
      updateFormData({ ...safeFormData, processes: defaultProcesses })
    } else if (setProduct && (!safeProduct.processData || safeProduct.processData.length === 0)) {
      //console.log("設置默認製程數據:",safeProduct);
      // 設置默認製程數據
      setProduct((prev) => {
        if (!prev.processData || prev.processData.length === 0) {
          return {
            ...prev,
            processData: defaultProcesses,
          }
        }
        return prev
      })
    }
  }, []) // Empty dependency array to run only once on mount

  // 載入翻譯資料
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const processTranslations = await getTranslationsByCategory("process")
        setTranslations(processTranslations)
      } catch (error) {
        console.error("載入翻譯資料失敗:", error)
      }
    }

    loadTranslations()
  }, [])

  // 處理表單欄位變更
  const handleFieldChange = (field: string, value: any) => {
    if (handleInputChange) {
      handleInputChange(field, value)
    } else if (updateFormData) {
      updateFormData({ ...safeFormData, [field]: value })
    }
  }

  // 獲取製程資料
  const getProcesses = () => {
    if (readOnly && safeProduct.processData) {
      return safeProduct.processData
    } else if (safeFormData.processes) {
      return safeFormData.processes
    } else if (safeProduct.processData) {
      return safeProduct.processData
    }
    return []
  }

  // 獲取製程備註
  const getProcessNotes = () => {
    if (readOnly && safeProduct.processNotes) {
      return safeProduct.processNotes
    } else if (safeProduct.processNotes) {
      return safeProduct.processNotes
    } else if (safeFormData.processNotes) {
      return safeFormData.processNotes
    }
    return []
  }

  // 獲取特殊要求
  const getSpecialRequirements = () => {
    if (readOnly && safeProduct.specialRequirements) {
      return safeProduct.specialRequirements
    } else if (updateFormData && safeFormData.specialRequirements) {
      return safeFormData.specialRequirements
    } else if (safeProduct.specialRequirements) {
      return safeProduct.specialRequirements
    }
    return []
  }

  // 獲取訂單零件需求
  const getOrderRequirements = () => {
    let requirements = ""
    if (readOnly && safeProduct.orderRequirements) {
      requirements = safeProduct.orderRequirements
    } else if (updateFormData && safeFormData.orderRequirements) {
      requirements = safeFormData.orderRequirements
    } else if (safeProduct.orderRequirements) {
      requirements = safeProduct.orderRequirements
    }
    // 將字串中的 \n 轉換為實際的換行符號
    return requirements.replace(/\\n/g, "\n")
  }

  // 獲取採購零件需求
  const getPurchaseRequirements = () => {
    let requirements = ""

    if (readOnly && safeProduct.purchaseRequirements) {
      requirements = safeProduct.purchaseRequirements
    } else if (updateFormData && safeFormData.purchaseRequirements) {
      return safeFormData.purchaseRequirements
    } else if (safeProduct.purchaseRequirements) {
      return safeProduct.purchaseRequirements
    }
    // 將字串中的 \n 轉換為實際的換行符號
    return requirements.replace(/\\n/g, "\n")
  }

  // 處理製程資料更新
  const handleAddProcessData = (processData: any) => {
    console.log("Adding process data:", processData)

    if (!processData.process) return

    if (setProduct) {
      setProduct((prev: any) => {
        // Make sure processData exists and is an array
        const currentProcessData = Array.isArray(prev.processData) ? [...prev.processData] : []

        if (
          editingProcessIndex !== null &&
          editingProcessIndex >= 0 &&
          editingProcessIndex < currentProcessData.length
        ) {
          // Update existing process
          currentProcessData[editingProcessIndex] = {
            ...currentProcessData[editingProcessIndex],
            ...processData,
          }
        } else {
          // Add new process
          currentProcessData.push({
            id: processData.id || `proc_${Date.now()}`,
            process: processData.process,
            vendor: processData.vendor,
            capacity: processData.capacity,
            requirements: processData.requirements,
            report: processData.report,
          })
        }

        return {
          ...prev,
          processData: currentProcessData,
        }
      })
    }

    // Reset form and close dialog
    setNewProcess({
      id: "",
      process: "",
      vendor: "",
      capacity: "",
      requirements: "",
      report: "",
    })
    setEditingProcessIndex(null)
    setIsAddProcessDialogOpen(false)

    // Show success toast
    toast({
      title: editingProcessIndex !== null ? "製程已更新" : "製程已新增",
      description: `製程 "${processData.process}" ${editingProcessIndex !== null ? "已更新" : "已新增"}`,
    })
  }

  // 處理刪除製程
  const handleDeleteProcess = (index: number) => {
    const currentProcesses = getProcesses()
    if (!currentProcesses[index]) return

    const updatedProcesses = [...currentProcesses]
    updatedProcesses.splice(index, 1)

    if (updateFormData) {
      const newFormData = { ...safeFormData, processes: updatedProcesses }
      updateFormData(newFormData)

      if (setProduct) {
        setProduct((prev: any) => ({
          ...prev,
          processData: updatedProcesses,
        }))
      }
    } else if (setProduct) {
      setProduct((prev: any) => ({
        ...prev,
        processData: updatedProcesses,
      }))
    }
  }

  // 處理編輯製程
  const handleEditProcess = (index: number) => {
    const processes = getProcesses()
    if (processes[index]) {
      setNewProcess({
        id: processes[index].id || `proc_${Date.now()}`,
        process: processes[index].process || processes[index].name || "",
        vendor: processes[index].vendor || processes[index].factory || "",
        capacity: processes[index].capacity || "",
        requirements: processes[index].requirements || processes[index].description || "",
        report: processes[index].report || "",
      })
      setEditingProcessIndex(index)
      setIsAddProcessDialogOpen(true)
    }
  }

  // 處理移動製程
  const handleMoveProcessItem = (index: number, direction: "up" | "down") => {
    const currentProcesses = getProcesses()
    const updatedProcesses = [...currentProcesses]

    if (direction === "up" && index > 0) {
      ;[updatedProcesses[index], updatedProcesses[index - 1]] = [updatedProcesses[index - 1], updatedProcesses[index]]
    } else if (direction === "down" && index < updatedProcesses.length - 1) {
      ;[updatedProcesses[index], updatedProcesses[index + 1]] = [updatedProcesses[index + 1], updatedProcesses[index]]
    }

    if (updateFormData) {
      const newFormData = { ...safeFormData, processes: updatedProcesses }
      updateFormData(newFormData)

      if (setProduct) {
        setProduct((prev: any) => ({
          ...prev,
          processData: updatedProcesses,
        }))
      }
    } else if (setProduct) {
      setProduct((prev: any) => ({
        ...prev,
        processData: updatedProcesses,
      }))
    }
  }

  // 處理編輯特殊要求
  const handleEditSpecialReq = (e: React.MouseEvent, req: any, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("編輯特殊要求:", req, index)
    setNewSpecialReq({
      content: req.content || "",
      user: req.user || "",
      date: req.date || "",
    })
    setIsEditingNote(true)
    setEditingNoteIndex(index)
    setIsSpecialReqDialogOpen(true)
  }

  // 處理特殊要求對話框關閉
  const handleSpecialReqDialogClose = (open: boolean) => {
    if (!open) {
      // 當對話框關閉時，重置所有狀態
      setNewSpecialReq({ content: "", date: "", user: "" })
      setIsEditingNote(false)
      setEditingNoteIndex(null)
    }
    setIsSpecialReqDialogOpen(open)
  }

  // 處理添加特殊要求
  const handleAddSpecialReq = () => {
    if (!newSpecialReq.content) return

    const date = newSpecialReq.date || new Date().toLocaleDateString("zh-TW")
    const user = newSpecialReq.user || "系統使用者"

    if (setProduct) {
      if (isEditingNote && editingNoteIndex !== null) {
        // 更新現有特殊要求
        setProduct((prev) => {
          const currentReqs = prev.specialRequirements || []
          const updatedReqs = [...currentReqs]
          updatedReqs[editingNoteIndex] = {
            content: newSpecialReq.content,
            date,
            user,
          }
          return {
            ...prev,
            specialRequirements: updatedReqs,
          }
        })
        toast({
          title: "特殊要求已更新",
          description: "特殊要求已成功更新",
        })
      } else {
        // 添加新特殊要求
        setProduct((prev) => {
          const currentReqs = prev.specialRequirements || []
          return {
            ...prev,
            specialRequirements: [
              ...currentReqs,
              {
                content: newSpecialReq.content,
                date,
                user,
              },
            ],
          }
        })
        toast({
          title: "特殊要求已新增",
          description: "特殊要求已成功新增",
        })
      }
    }

    // 重置表單和狀態
    setNewSpecialReq({ content: "", date: "", user: "" })
    setIsSpecialReqDialogOpen(false)
    setIsEditingNote(false)
    setEditingNoteIndex(null)
  }

  // 處理編輯備註
  const handleEditNote = (e: React.MouseEvent, note: any, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("編輯備註:", note, index)
    setNewProcessNote({
      content: note.content || "",
      user: note.user || "",
      date: note.date || "",
    })
    setIsEditingNote(true)
    setEditingNoteIndex(index)
    setIsProcessNoteDialogOpen(true)
  }

  // 處理對話框關閉
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // 當對話框關閉時，重置所有狀態
      setNewProcessNote({ content: "", date: "", user: "" })
      setIsEditingNote(false)
      setEditingNoteIndex(null)
    }
    setIsProcessNoteDialogOpen(open)
  }

  // 處理添加製程備註
  const handleAddProcessNote = () => {
    if (!newProcessNote.content) return

    const date = newProcessNote.date || new Date().toLocaleDateString("zh-TW")
    const user = newProcessNote.user || "系統使用者"

    if (setProduct) {
      if (isEditingNote && editingNoteIndex !== null) {
        // 更新現有備註
        setProduct((prev) => {
          const currentNotes = prev.processNotes || []
          const updatedNotes = [...currentNotes]
          updatedNotes[editingNoteIndex] = {
            content: newProcessNote.content,
            date,
            user,
          }
          return {
            ...prev,
            processNotes: updatedNotes,
          }
        })
        toast({
          title: "製程備註已更新",
          description: "製程備註已成功更新",
        })
      } else {
        // 添加新備註
        setProduct((prev) => {
          const currentNotes = prev.processNotes || []
          return {
            ...prev,
            processNotes: [
              ...currentNotes,
              {
                content: newProcessNote.content,
                date,
                user,
              },
            ],
          }
        })
        toast({
          title: "製程備註已新增",
          description: "製程備註已成功新增",
        })
      }
    }

    // 重置表單和狀態
    setNewProcessNote({ content: "", date: "", user: "" })
    setIsProcessNoteDialogOpen(false)
    setIsEditingNote(false)
    setEditingNoteIndex(null)
  }

  // 同步製程到訂單零件需求
  const syncProcessToOrder = async () => {
    try {
      let processes: string[] = []

      if (updateFormData) {
        processes = (safeFormData.processes || [])
          .map((p: any) => `${p.process}: ${p.requirements || ""}`)
          .filter((p: string) => p.trim() !== "")
      } else if (safeProduct.processData) {
        processes = safeProduct.processData
          .map((p: any) => `${p.process}: ${p.requirements || ""}`)
          .filter((p: string) => p.trim() !== "")
      }

      if (processes.length === 0) {
        toast({
          title: "警告",
          description: "沒有可同步的製程資料",
          variant: "warning",
        })
        return
      }

      const formattedText = processes.map((p) => `- ${p}`).join("\n")
      const orderRequirements = `製程要求:\n${formattedText}`

      if (handleInputChange) {
        handleInputChange("orderRequirements", orderRequirements)
      } else if (updateFormData) {
        updateFormData({ ...safeFormData, orderComponentRequirements: orderRequirements })
      }

      toast({
        title: "同步成功",
        description: "製程資料已同步到訂單零件需求",
      })
    } catch (error) {
      console.error("同步製程到訂單零件需求失敗:", error)
      toast({
        title: "同步失敗",
        description: "無法同步製程資料到訂單零件需求",
        variant: "destructive",
      })
    }
  }

  // 同步製程到採購零件需求
  const syncProcessToPurchase = async () => {
    try {
      let processes: string[] = []

      if (updateFormData) {
        processes = (safeFormData.processes || [])
          .map((p: any) => `${p.process}: ${p.requirements || ""}`)
          .filter((p: string) => p.trim() !== "")
      } else if (safeProduct.processData) {
        processes = safeProduct.processData
          .map((p: any) => `${p.process}: ${p.requirements || ""}`)
          .filter((p: string) => p.trim() !== "")
      }

      if (processes.length === 0) {
        toast({
          title: "警告",
          description: "沒有可同步的製程資料",
          variant: "warning",
        })
        return
      }

      const formattedText = processes.map((p) => `- ${p}`).join("\n")
      const purchaseRequirements = `製程要求:\n${formattedText}`

      if (handleInputChange) {
        handleInputChange("purchaseRequirements", purchaseRequirements)
      } else if (updateFormData) {
        updateFormData({ ...safeFormData, purchaseComponentRequirements: purchaseRequirements })
      }

      toast({
        title: "同步成功",
        description: "製程資料已同步到採購零件需求",
      })
    } catch (error) {
      console.error("同步製程到採購零件需求失敗:", error)
      toast({
        title: "同步失敗",
        description: "無法同步製程資料到採購零件需求",
        variant: "destructive",
      })
    }
  }

  // 翻譯製程資料
  const translateProcess = async () => {
    try {
      setIsTranslating(true)
      let processes: string[] = []

      if (updateFormData) {
        processes = (safeFormData.processes || [])
          .map((p: any) => `${p.process}: ${p.requirements || ""}`)
          .filter((p: string) => p.trim() !== "")
      } else if (safeProduct.processData) {
        processes = safeProduct.processData
          .map((p: any) => `${p.process}: ${p.requirements || ""}`)
          .filter((p: string) => p.trim() !== "")
      }

      if (processes.length === 0) {
        toast({
          title: "警告",
          description: "沒有可翻譯的製程資料",
          variant: "warning",
        })
        return
      }

      const translatedText = await formatProcessesForOrderRemarks(processes, true)

      if (handleInputChange) {
        handleInputChange("orderRequirements", translatedText)
      } else if (updateFormData) {
        updateFormData({ ...safeFormData, orderComponentRequirements: translatedText })
      }

      toast({
        title: "翻譯成功",
        description: "製程資料已成功翻譯並同步到訂單零件需求",
      })
    } catch (error) {
      console.error("翻譯製程資料失敗:", error)
      toast({
        title: "翻譯失敗",
        description: "無法翻譯製程資料",
        variant: "destructive",
      })
    } finally {
      setIsTranslating(false)
    }
  }

  // 如果是唯讀模式，則顯示簡化版的製程資料
  if (readOnly) {
    return (
      <div className="space-y-6">
        {/* 製程資料 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">製程資料</h3>
          <div className="border rounded-md">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">製程</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">廠商</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">產能(8H)</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">要求</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">報告</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {getProcesses().map((process: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{process.process || process.name}</td>
                    <td className="px-4 py-2 text-sm">{process.vendor || process.factory}</td>
                    <td className="px-4 py-2 text-sm">{process.capacity}</td>
                    <td className="px-4 py-2 text-sm">{process.requirements || process.description}</td>
                    <td className="px-4 py-2 text-sm">{process.report}</td>
                  </tr>
                ))}
                {getProcesses().length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500">
                      尚未添加製程資料
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Separator />

        {/* 訂單零件需求和採購零件需求 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">訂單零件需求</h3>
            <div className="p-4 bg-gray-50 rounded-md min-h-[100px] whitespace-pre-wrap">
              {getOrderRequirements() || "無訂單零件需求"}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">採購零件需求</h3>
            <div className="p-4 bg-gray-50 rounded-md min-h-[100px] whitespace-pre-wrap">
              {getPurchaseRequirements() || "無採購零件需求"}
            </div>
          </div>
        </div>

        <Separator />

        {/* 特殊要求/測試 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">特殊要求/測試</h3>
          <div className="border rounded-md">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">要求內容</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 w-[120px]">日期</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 w-[120px]">使用者</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {getSpecialRequirements().map((req: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{req.content}</td>
                    <td className="px-4 py-2 text-sm">{req.date}</td>
                    <td className="px-4 py-2 text-sm">{req.user}</td>
                  </tr>
                ))}
                {getSpecialRequirements().length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-center text-sm text-gray-500">
                      尚未添加特殊要求/測試
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Separator />

        {/* 編輯備註 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">編輯備註</h3>
          <div className="border rounded-md">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">備註內容</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 w-[120px]">日期</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 w-[120px]">使用者</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {getProcessNotes().map((note: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{note.content}</td>
                    <td className="px-4 py-2 text-sm">{note.date}</td>
                    <td className="px-4 py-2 text-sm">{note.user}</td>
                  </tr>
                ))}
                {getProcessNotes().length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-center text-sm text-gray-500">
                      尚未添加編輯備註
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 製程資料 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">製程資料</h3>
          {!readOnly && (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={syncProcessToOrder}>
                <FolderSync className="h-4 w-4 mr-2" />
                同步到訂單需求
              </Button>
              <Button variant="outline" size="sm" onClick={syncProcessToPurchase}>
                <FolderSync className="h-4 w-4 mr-2" />
                同步到採購需求
              </Button>
              <Button variant="outline" size="sm" onClick={translateProcess} disabled={isTranslating}>
                <Languages className="h-4 w-4 mr-2" />
                翻譯製程
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  setNewProcess({
                    id: "",
                    process: "",
                    vendor: "",
                    capacity: "",
                    requirements: "",
                    report: "",
                  })
                  setEditingProcessIndex(null)
                  setIsAddProcessDialogOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                新增製程
              </Button>
            </div>
          )}
        </div>

        <div className="border rounded-md">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">製程</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">廠商</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">產能(8H)</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">要求</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">報告</th>
                {!readOnly && <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">操作</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {getProcesses().map((process: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">{process.process}</td>
                  <td className="px-4 py-2 text-sm">{process.vendor}</td>
                  <td className="px-4 py-2 text-sm">{process.capacity}</td>
                  <td className="px-4 py-2 text-sm">{process.requirements}</td>
                  <td className="px-4 py-2 text-sm">{process.report}</td>
                  {!readOnly && (
                    <td className="px-4 py-2">
                      <div className="flex justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleMoveProcessItem(index, "up")
                          }}
                          disabled={index === 0}
                          className="h-7 w-7"
                          type="button"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleMoveProcessItem(index, "down")
                          }}
                          disabled={index === getProcesses().length - 1}
                          className="h-7 w-7"
                          type="button"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleEditProcess(index)
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
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDeleteProcess(index)
                          }}
                          className="h-7 w-7 text-red-500 hover:text-red-700"
                          type="button"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {getProcesses().length === 0 && (
                <tr>
                  <td colSpan={readOnly ? 5 : 6} className="px-4 py-4 text-center text-sm text-gray-500">
                    尚未添加製程資料
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Separator />

      {/* 訂單零件需求和採購零件需求 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">訂單零件需求</h3>
          <Textarea
            value={getOrderRequirements()}
            onChange={(e) =>
              handleFieldChange(updateFormData ? "orderComponentRequirements" : "orderRequirements", e.target.value)
            }
            placeholder="請輸入訂單零件需求"
            rows={10}
            className="resize-none"
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">採購零件需求</h3>
          <Textarea
            value={getPurchaseRequirements()}
            onChange={(e) =>
              handleFieldChange(
                updateFormData ? "purchaseComponentRequirements" : "purchaseRequirements",
                e.target.value,
              )
            }
            placeholder="請輸入採購零件需求"
            rows={10}
            className="resize-none"
            disabled={readOnly}
          />
        </div>
      </div>

      <Separator />

      {/* 特殊要求/測試 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">特殊要求/測試</h3>
          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                setIsSpecialReqDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              添加特殊要求/測試
            </Button>
          )}
        </div>

        <div className="border rounded-md">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">要求內容</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 w-[120px]">日期</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 w-[120px]">使用者</th>
                {!readOnly && (
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 w-[100px]">操作</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {getSpecialRequirements().map((req: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">{req.content}</td>
                  <td className="px-4 py-2 text-sm">{req.date}</td>
                  <td className="px-4 py-2 text-sm">{req.user}</td>
                  {!readOnly && (
                    <td className="px-4 py-2">
                      <div className="flex justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleEditSpecialReq(e, req, index)}
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
                              const updatedReqs = [...(safeProduct.specialRequirements || [])]
                              updatedReqs.splice(index, 1)
                              setProduct({
                                ...safeProduct,
                                specialRequirements: updatedReqs,
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
              ))}
              {getSpecialRequirements().length === 0 && (
                <tr>
                  <td colSpan={readOnly ? 3 : 4} className="px-4 py-4 text-center text-sm text-gray-500">
                    尚未添加特殊要求/測試
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Separator />

      {/* 編輯備註 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">編輯備註</h3>
          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                setIsProcessNoteDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              添加備註
            </Button>
          )}
        </div>

        <div className="border rounded-md">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">備註內容</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 w-[120px]">日期</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 w-[120px]">使用者</th>
                {!readOnly && (
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 w-[100px]">操作</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {getProcessNotes().map((note: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">{note.content}</td>
                  <td className="px-4 py-2 text-sm">{note.date}</td>
                  <td className="px-4 py-2 text-sm">{note.user}</td>
                  {!readOnly && (
                    <td className="px-4 py-2">
                      <div className="flex justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleEditNote(e, note, index)}
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
                              const updatedNotes = [...(safeProduct.processNotes || [])]
                              updatedNotes.splice(index, 1)
                              setProduct({
                                ...safeProduct,
                                processNotes: updatedNotes,
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
              ))}
              {getProcessNotes().length === 0 && (
                <tr>
                  <td colSpan={readOnly ? 3 : 4} className="px-4 py-4 text-center text-sm text-gray-500">
                    尚未添加製程備註
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 使用 ProcessDialog 組件 */}
      <ProcessDialog
        isOpen={isAddProcessDialogOpen}
        onClose={() => setIsAddProcessDialogOpen(false)}
        onSave={handleAddProcessData}
        initialData={editingProcessIndex !== null ? newProcess : undefined}
      />

      {/* 特殊要求對話框 */}
      <Dialog open={isSpecialReqDialogOpen} onOpenChange={handleSpecialReqDialogClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditingNote ? "編輯特殊要求" : "添加特殊要求"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="content">特殊要求內容</Label>
              <Textarea
                id="content"
                value={newSpecialReq.content}
                onChange={(e) => setNewSpecialReq({ ...newSpecialReq, content: e.target.value })}
                placeholder="輸入特殊要求內容"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">日期</Label>
                <Input
                  id="date"
                  type="text"
                  value={newSpecialReq.date}
                  onChange={(e) => setNewSpecialReq({ ...newSpecialReq, date: e.target.value })}
                  placeholder="YYYY/MM/DD"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user">使用者</Label>
                <Input
                  id="user"
                  value={newSpecialReq.user}
                  onChange={(e) => setNewSpecialReq({ ...newSpecialReq, user: e.target.value })}
                  placeholder="輸入使用者名稱"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleSpecialReqDialogClose(false)}>
              取消
            </Button>
            <Button type="button" onClick={handleAddSpecialReq}>
              {isEditingNote ? "更新" : "添加"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 製程備註對話框 */}
      <Dialog open={isProcessNoteDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditingNote ? "編輯製程備註" : "添加製程備註"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="processNoteContent">備註內容</Label>
              <Textarea
                id="processNoteContent"
                value={newProcessNote.content}
                onChange={(e) => setNewProcessNote({ ...newProcessNote, content: e.target.value })}
                placeholder="輸入備註內容"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="processNoteDate">日期</Label>
                <Input
                  id="processNoteDate"
                  type="text"
                  value={newProcessNote.date}
                  onChange={(e) => setNewProcessNote({ ...newProcessNote, date: e.target.value })}
                  placeholder="YYYY/MM/DD"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="processNoteUser">使用者</Label>
                <Input
                  id="processNoteUser"
                  value={newProcessNote.user}
                  onChange={(e) => setNewProcessNote({ ...newProcessNote, user: e.target.value })}
                  placeholder="輸入使用者名稱"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
              取消
            </Button>
            <Button type="button" onClick={handleAddProcessNote}>
              {isEditingNote ? "更新" : "添加"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
