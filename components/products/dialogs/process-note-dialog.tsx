"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

interface ProcessNoteDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (noteData: any) => void
  initialData?: any
}

const processNoteSchema = z.object({
  note: z.string().min(2, {
    message: "製程備註 must be at least 2 characters.",
  }),
})

type ProcessNoteFormValues = z.infer<typeof processNoteSchema>

export function ProcessNoteDialog({ isOpen, onClose, onSave, initialData }: ProcessNoteDialogProps) {
  // Initialize with empty object if initialData is undefined
  const [noteData, setNoteData] = useState({
    id: "",
    type: "general",
    content: "",
    date: new Date().toISOString().split("T")[0],
    user: "系統管理員",
  })

  // Update local state when dialog opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Use initialData if available, with fallbacks for each property
        setNoteData({
          id: initialData.id || "",
          type: initialData.type || "general",
          content: initialData.content || "",
          date: initialData.date || new Date().toISOString().split("T")[0],
          user: initialData.user || "系統管理員",
        })
      } else {
        // Reset to default state if no initialData
        setNoteData({
          id: "",
          type: "general",
          content: "",
          date: new Date().toISOString().split("T")[0],
          user: "系統管理員",
        })
      }
    }
  }, [isOpen, initialData])

  const handleChange = (field: string, value: string) => {
    setNoteData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = () => {
    // Generate an ID if one doesn't exist
    const dataToSave = {
      ...noteData,
      id: noteData.id || `note_${Date.now()}`,
    }
    onSave(dataToSave)
  }

  const form = useForm<ProcessNoteFormValues>({
    resolver: zodResolver(processNoteSchema),
    defaultValues: {
      note: "",
    },
  })

  const onSubmit = (data: ProcessNoteFormValues) => {
    onSave(data.note)
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "編輯製程備註" : "新增製程備註"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>製程備註</FormLabel>
                  <FormControl>
                    <Textarea placeholder="輸入製程備註" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button type="submit">{initialData ? "更新" : "新增"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
