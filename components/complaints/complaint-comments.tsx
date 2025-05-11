"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Send, Paperclip } from "lucide-react"

interface ComplaintCommentsProps {
  complaintId: string
}

export function ComplaintComments({ complaintId }: ComplaintCommentsProps) {
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 模擬客訴處理記錄數據
  const [comments, setComments] = useState([
    {
      id: "1",
      user: {
        id: "1",
        name: "王小明",
        avatar: "/placeholder.svg",
        department: "業務部",
      },
      content: "已聯繫客戶了解詳細情況，客戶將提供問題面板的照片和測試報告。",
      createdAt: new Date("2023-05-10T10:30:00"),
      attachments: [],
    },
    {
      id: "2",
      user: {
        id: "2",
        name: "李品管",
        avatar: "/placeholder.svg",
        department: "品管部",
      },
      content: "已收到客戶提供的測試報告和照片，確認部分面板亮度不足。將聯繫工廠了解情況。",
      createdAt: new Date("2023-05-11T14:15:00"),
      attachments: [],
    },
    {
      id: "3",
      user: {
        id: "3",
        name: "張工廠",
        avatar: "/placeholder.svg",
        department: "工廠聯絡人",
      },
      content:
        "工廠確認批次SZ20230510有部分面板亮度不足的問題，原因是生產過程中的參數設定有誤。工廠已調整參數，並將對問題批次進行全檢。",
      createdAt: new Date("2023-05-12T09:45:00"),
      attachments: [{ id: "1", name: "工廠回覆說明.pdf", size: "1.5MB" }],
    },
  ])

  const handleSubmitComment = async () => {
    if (!comment.trim()) return

    setIsSubmitting(true)

    try {
      // 模擬API請求
      await new Promise((resolve) => setTimeout(resolve, 500))

      // 添加新評論
      const newComment = {
        id: `${Date.now()}`,
        user: {
          id: "1",
          name: "王小明",
          avatar: "/placeholder.svg",
          department: "業務部",
        },
        content: comment,
        createdAt: new Date(),
        attachments: [],
      }

      setComments([...comments, newComment])
      setComment("")
    } catch (error) {
      console.error("提交評論失敗：", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4 p-4 border rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
              <AvatarFallback>{comment.user.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{comment.user.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({comment.user.department})</span>
                </div>
                <span className="text-sm text-gray-500">{format(comment.createdAt, "yyyy-MM-dd HH:mm")}</span>
              </div>
              <p className="text-sm">{comment.content}</p>
              {comment.attachments.length > 0 && (
                <div className="pt-2">
                  <p className="text-sm font-medium text-gray-500">附件：</p>
                  <ul className="space-y-1 mt-1">
                    {comment.attachments.map((attachment) => (
                      <li key={attachment.id} className="flex items-center">
                        <Paperclip className="h-4 w-4 mr-2 text-blue-500" />
                        <a href="#" className="text-sm text-blue-600 hover:underline">
                          {attachment.name}
                        </a>
                        <span className="text-xs text-gray-500 ml-2">({attachment.size})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Textarea placeholder="輸入處理記錄..." value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
        <div className="flex justify-between">
          <Button variant="outline" size="sm">
            <Paperclip className="h-4 w-4 mr-2" />
            添加附件
          </Button>
          <Button onClick={handleSubmitComment} disabled={!comment.trim() || isSubmitting}>
            {isSubmitting ? "提交中..." : "提交記錄"}
            <Send className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
