"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Search, AlertCircle, Check } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { FactoryInfoCard } from "./factory-info-card"

interface FactoriesSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (factory: any) => void
  productPartNo?: string
  productName?: string
  currentFactoryId?: string
}

export function FactorySelectorDialog({
  open,
  onOpenChange,
  onSelect,
  productPartNo,
  productName,
  currentFactoryId: currentFactoryId,
}: FactoriesSelectorDialogProps) {
  const [factories, setFactories] = useState<any[]>([])
  const [recentFactories, setRecentFactories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(currentFactoryId || null)

  // 載入供應商資料
  useEffect(() => {
    if (!open) return

    const fetchFactories = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

        // 先獲取表結構以了解可用的列
        const { data: tableInfo, error: tableError } = await supabase.from("factories").select("*").limit(1)

        if (tableError) {
          throw new Error(`獲取供應商表結構失敗: ${tableError.message}`)
        }

        // 檢查表是否為空
        if (!tableInfo || tableInfo.length === 0) {
          console.warn("供應商資料表為空")
          setFactories([])
          setRecentFactories([])
          setLoading(false)
          return
        }

        // 獲取第一行數據以了解列結構
        const firstRow = tableInfo[0]
        console.log("供應商表結構:", Object.keys(firstRow))

        // 獲取所有供應商數據
        const { data: factoriesData, error: factoriesError } = await supabase.from("factories").select("*")

        if (factoriesError) {
          throw new Error(`獲取供應商資料失敗: ${factoriesError.message}`)
        }

        if (!factoriesData || factoriesData.length === 0) {
          setFactories([])
          setRecentFactories([])
        } else {
          // 將factories資料轉換為標準格式，使用動態欄位名稱
          const convertedData = factoriesData.map((factory) => {
            // 嘗試找出ID和名稱欄位
            const id = factory.id || factory.factory_id || ""
            const name = factory.name || factory.factory_name || `供應商 ${id}`

            return {
              ...factory,
              factory_id: id,
              factory_name: name,
              factory_full_name:
                factory.full_name || factory.factory_full_name || name,
              quality_contact1: factory.contact_person || factory.contact_name || "",
              factory_phone: factory.phone || factory.contact_phone || "",
              factory_address: factory.address || "",
              payment_term: factory.payment_term || "",
              delivery_term: factory.delivery_term || "",
              legacy_notes: factory.notes || "",
            }
          })

          setFactories(convertedData)
          // 模擬最近使用的供應商
          setRecentFactories(convertedData.slice(0, 5))
        }
      } catch (err: any) {
        console.error("獲取供應商資料失敗:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchFactories()
  }, [open])

  // 過濾供應商
  const filteredFactories = factories.filter((factory) => {
    if (!searchTerm) return true

    const factoryName = factory.factory_name || factory.factory_full_name || ""
    const factoryId = factory.factory_id || ""
    const contactPerson = factory.quality_contact1 || factory.contact_person || ""

    const term = searchTerm.toLowerCase()
    return (
      factoryName.toLowerCase().includes(term) ||
      factoryId.toLowerCase().includes(term) ||
      contactPerson.toLowerCase().includes(term)
    )
  })

  // 處理選擇供應商
  const handleSelectFactory = (factory: any) => {
    setSelectedFactoryId(factory.factory_id)
    onSelect(factory)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>選擇供應商</DialogTitle>
          <DialogDescription>
            {productPartNo && productName
              ? `為產品 ${productPartNo} (${productName}) 選擇供應商`
              : "選擇供應商進行採購"}
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜尋供應商名稱、ID或聯絡人..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">所有供應商</TabsTrigger>
            <TabsTrigger value="recent">最近使用</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="all" className="h-full overflow-auto p-1">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">載入供應商資料中...</span>
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>錯誤</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : filteredFactories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "沒有符合搜尋條件的供應商" : "沒有供應商資料"}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                  {filteredFactories.map((factory) => (
                    <FactoryInfoCard
                      key={factory.factory_id}
                      factory={factory}
                      onSelect={() => handleSelectFactory(factory)}
                      isSelected={selectedFactoryId === factory.factory_id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent" className="h-full overflow-auto p-1">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">載入供應商資料中...</span>
                </div>
              ) : recentFactories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">沒有最近使用的供應商</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                  {recentFactories.map((factory) => (
                    <FactoryInfoCard
                      key={factory.factory_id}
                      factory={factory}
                      onSelect={() => handleSelectFactory(factory)}
                      isSelected={selectedFactoryId === factory.factory_id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
            取消
          </Button>
          <Button
            onClick={() => {
              const selectedFactory = factories.find((s) => s.factory_id === selectedFactoryId)
              if (selectedFactory) {
                onSelect(selectedFactory)
                onOpenChange(false)
              }
            }}
            disabled={!selectedFactoryId}
          >
            <Check className="h-4 w-4 mr-2" />
            確認選擇
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
