"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Edit, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Translation {
  id: number
  category: string
  chinese_term: string
  english_term: string
  description: string | null
  created_at: string
  updated_at: string
}

interface TranslationFormData {
  category: string
  chinese_term: string
  english_term: string
  description: string
}

export function TranslationsManager() {
  const [translations, setTranslations] = useState<Translation[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null)
  const [formData, setFormData] = useState<TranslationFormData>({
    category: "",
    chinese_term: "",
    english_term: "",
    description: "",
  })

  const supabase = createClient()

  useEffect(() => {
    fetchTranslations()
  }, [])

  const fetchTranslations = async () => {
    try {
      const { data, error } = await supabase
        .from("translations")
        .select("*")
        .order("category", { ascending: true })
        .order("chinese_term", { ascending: true })

      if (error) throw error
      setTranslations(data || [])
    } catch (error) {
      console.error("Error fetching translations:", error)
      toast({
        title: "錯誤",
        description: "無法載入翻譯資料",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const translationData = {
        category: formData.category,
        chinese_term: formData.chinese_term,
        english_term: formData.english_term,
        description: formData.description || null,
      }

      if (editingTranslation) {
        const { error } = await supabase.from("translations").update(translationData).eq("id", editingTranslation.id)

        if (error) throw error

        toast({
          title: "成功",
          description: "翻譯已更新",
        })
      } else {
        const { error } = await supabase.from("translations").insert([translationData])

        if (error) throw error

        toast({
          title: "成功",
          description: "翻譯已新增",
        })
      }

      setIsDialogOpen(false)
      setEditingTranslation(null)
      setFormData({
        category: "",
        chinese_term: "",
        english_term: "",
        description: "",
      })
      fetchTranslations()
    } catch (error) {
      console.error("Error saving translation:", error)
      toast({
        title: "錯誤",
        description: "儲存翻譯時發生錯誤",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (translation: Translation) => {
    setEditingTranslation(translation)
    setFormData({
      category: translation.category,
      chinese_term: translation.chinese_term,
      english_term: translation.english_term,
      description: translation.description || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("確定要刪除此翻譯嗎？")) {
      try {
        const { error } = await supabase.from("translations").delete().eq("id", id)

        if (error) throw error

        toast({
          title: "成功",
          description: "翻譯已刪除",
        })
        fetchTranslations()
      } catch (error) {
        console.error("Error deleting translation:", error)
        toast({
          title: "錯誤",
          description: "刪除翻譯時發生錯誤",
          variant: "destructive",
        })
      }
    }
  }

  const resetForm = () => {
    setFormData({
      category: "",
      chinese_term: "",
      english_term: "",
      description: "",
    })
    setEditingTranslation(null)
  }

  // Group translations by category
  const groupedTranslations = translations.reduce(
    (acc, translation) => {
      if (!acc[translation.category]) {
        acc[translation.category] = []
      }
      acc[translation.category].push(translation)
      return acc
    },
    {} as Record<string, Translation[]>,
  )

  if (loading) {
    return <div className="flex justify-center p-8">載入中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">系統翻譯表</h3>
          <p className="text-sm text-muted-foreground">管理系統中的多語言翻譯</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增翻譯
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTranslation ? "編輯翻譯" : "新增翻譯"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">類別</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="例如: process, material, status"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chinese_term">中文術語</Label>
                <Input
                  id="chinese_term"
                  value={formData.chinese_term}
                  onChange={(e) => setFormData({ ...formData, chinese_term: e.target.value })}
                  placeholder="中文翻譯"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="english_term">英文術語</Label>
                <Input
                  id="english_term"
                  value={formData.english_term}
                  onChange={(e) => setFormData({ ...formData, english_term: e.target.value })}
                  placeholder="English translation"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="翻譯用途說明"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingTranslation ? "更新" : "新增"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    resetForm()
                  }}
                  className="flex-1"
                >
                  取消
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedTranslations).map(([category, categoryTranslations]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-base">
                {category} ({categoryTranslations.length} 項)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>中文術語</TableHead>
                      <TableHead>英文術語</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryTranslations.map((translation) => (
                      <TableRow key={translation.id}>
                        <TableCell className="font-medium">{translation.chinese_term}</TableCell>
                        <TableCell>{translation.english_term}</TableCell>
                        <TableCell>{translation.description || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(translation)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(translation.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
