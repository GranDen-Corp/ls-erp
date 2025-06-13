"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { initLocksureData } from "@/app/actions/init-locksure-data"
import { Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function InitLocksureDataButton() {
  const [loading, setLoading] = useState(false)

  const handleInitData = async () => {
    if (loading) return

    if (!confirm("這將清除所有現有的訂單和採購單資料，並創建新的Locksure公司相關資料。確定要繼續嗎？")) {
      return
    }

    setLoading(true)

    try {
      const result = await initLocksureData()

      if (result.success) {
        toast({
          title: "初始化成功",
          description: result.message,
          variant: "default",
        })
      } else {
        toast({
          title: "初始化失敗",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "初始化失敗",
        description: "發生未知錯誤，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleInitData} disabled={loading} variant="outline">
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          初始化中...
        </>
      ) : (
        "初始化Locksure資料"
      )}
    </Button>
  )
}
