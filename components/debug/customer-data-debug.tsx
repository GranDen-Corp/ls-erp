"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CustomerDataDebugProps {
  customers: any[]
  loading: boolean
}

export function CustomerDataDebug({ customers, loading }: CustomerDataDebugProps) {
  const [showDebug, setShowDebug] = useState(false)

  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <div className="mt-4">
      <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)} className="mb-2">
        {showDebug ? "隱藏" : "顯示"}客戶資料調試信息
      </Button>

      {showDebug && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">客戶資料調試信息</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="text-sm">
              <p>載入狀態: {loading ? "載入中..." : "已完成"}</p>
              <p>客戶數量: {customers.length}</p>

              {customers.length > 0 && (
                <>
                  <p className="mt-2 font-medium">前5筆客戶資料:</p>
                  <ScrollArea className="h-[200px] mt-1 border rounded p-2">
                    <pre className="text-xs">
                      {JSON.stringify(
                        customers.slice(0, 5).map((c) => ({
                          id: c.id,
                          customer_id: c.customer_id,
                          name: c.name || c.customer_full_name || c.customer_name,
                          short_name: c.customer_short_name,
                        })),
                        null,
                        2,
                      )}
                    </pre>
                  </ScrollArea>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
