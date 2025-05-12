"use client"

import { useState, useEffect } from "react"
import { DataTable } from "./data-table"
import { supabaseClient } from "@/lib/supabase-client"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function OrderDataTable() {
  const [customers, setCustomers] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 獲取客戶資料，用於顯示客戶名稱
  useEffect(() => {
    async function fetchCustomers() {
      try {
        // 嘗試獲取customers資料表的資料
        const { data, error } = await supabaseClient.from("customers").select("*")

        if (error) {
          console.error("獲取客戶資料失敗:", error)
          return
        }

        if (!data || data.length === 0) {
          console.log("客戶資料表為空或不存在")
          return
        }

        // 建立客戶ID到客戶名稱的映射
        const customerMap: Record<string, string> = {}

        // 嘗試找出客戶ID和名稱欄位
        const firstRow = data[0]
        const idField =
          "customer_id" in firstRow
            ? "customer_id"
            : "id" in firstRow
              ? "id"
              : Object.keys(firstRow).find((key) => key.includes("id")) || "id"

        const nameField =
          "name" in firstRow
            ? "name"
            : "customer_name" in firstRow
              ? "customer_name"
              : "company" in firstRow
                ? "company"
                : Object.keys(firstRow).find((key) => key.includes("name")) || "name"

        data.forEach((customer) => {
          const id = customer[idField]
          const name = customer[nameField]
          if (id && name) {
            customerMap[id] = name
          }
        })

        setCustomers(customerMap)
      } catch (error) {
        console.error("處理客戶資料時發生錯誤:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // 檢查orders資料表是否存在
    async function checkOrdersTable() {
      try {
        // 使用正確的語法來檢查資料表是否存在
        // 只選擇一條記錄來檢查資料表是否存在
        const { data, error } = await supabaseClient.from("orders").select("*").limit(1)

        if (error) {
          console.error("檢查orders資料表失敗:", error)
          setError("無法連接到orders資料表。請確認資料表存在並且您有權限訪問。")
        }
      } catch (error) {
        console.error("檢查orders資料表時出錯:", error)
        setError("檢查orders資料表時發生錯誤")
      }
    }

    checkOrdersTable()
    fetchCustomers()
  }, [])

  // 如果發生錯誤，顯示錯誤訊息
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>錯誤</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // 定義資料表欄位
  const columns = [
    {
      key: "order_id",
      title: "訂單編號",
      sortable: true,
    },
    {
      key: "po_id",
      title: "客戶PO編號",
      sortable: true,
    },
    {
      key: "customer_id",
      title: "客戶",
      render: (value: string) => customers[value] || value || "未知客戶",
      sortable: true,
    },
    {
      key: "part_no_assembly",
      title: "組件",
      sortable: true,
    },
    {
      key: "part_no_list",
      title: "Part No.清單",
      render: (value: string | string[]) => {
        if (!value) return "-"
        if (Array.isArray(value)) {
          return value.join(", ")
        }
        try {
          // 嘗試解析JSON字串
          const parsed = JSON.parse(value)
          if (Array.isArray(parsed)) {
            return parsed.join(", ")
          }
          return String(value)
        } catch {
          return String(value)
        }
      },
    },
    {
      key: "payment_term",
      title: "付款條件",
    },
    {
      key: "delivery_terms",
      title: "交貨條件",
    },
  ]

  // 定義詳情標籤
  const detailTabs = [
    {
      id: "basic",
      label: "基本資訊",
      fields: [
        { label: "訂單編號", key: "order_id" },
        { label: "客戶PO編號", key: "po_id" },
        { label: "客戶", key: "customer_id", render: (value: string) => customers[value] || value || "未知客戶" },
        { label: "組件", key: "part_no_assembly" },
        {
          label: "Part No.清單",
          key: "part_no_list",
          render: (value: string | string[]) => {
            if (!value) return "-"
            if (Array.isArray(value)) {
              return (
                <ul className="list-disc pl-5">
                  {value.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )
            }
            try {
              // 嘗試解析JSON字串
              const parsed = JSON.parse(value)
              if (Array.isArray(parsed)) {
                return (
                  <ul className="list-disc pl-5">
                    {parsed.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )
              }
              return String(value)
            } catch {
              return String(value)
            }
          },
        },
        { label: "付款條件", key: "payment_term" },
        { label: "交貨條件", key: "delivery_terms" },
      ],
    },
    {
      id: "additional",
      label: "附加資訊",
      fields: [
        {
          label: "建立日期",
          key: "created_at",
          render: (value: string) => {
            if (!value) return "-"
            try {
              return format(new Date(value), "yyyy/MM/dd HH:mm:ss", { locale: zhTW })
            } catch (e) {
              return value
            }
          },
        },
        {
          label: "更新日期",
          key: "updated_at",
          render: (value: string) => {
            if (!value) return "-"
            try {
              return format(new Date(value), "yyyy/MM/dd HH:mm:ss", { locale: zhTW })
            } catch (e) {
              return value
            }
          },
        },
        { label: "備註", key: "remarks" },
        { label: "狀態", key: "status" },
      ],
    },
  ]

  return <DataTable title="訂單" tableName="orders" columns={columns} detailTabs={detailTabs} isLoading={isLoading} />
}
