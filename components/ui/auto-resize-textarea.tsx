"use client"

import React, { useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number
  maxRows?: number
}

export const AutoResizeTextarea = React.forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  ({ className, minRows = 3, maxRows = 10, value, onChange, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const combinedRef = (node: HTMLTextAreaElement) => {
      textareaRef.current = node
      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }

    // 調整高度的函數
    const adjustHeight = () => {
      const textarea = textareaRef.current
      if (!textarea) return

      // 重置高度以獲取正確的 scrollHeight
      textarea.style.height = "auto"

      // 計算行高 (假設每行約 24px)
      const lineHeight = 24

      // 計算最小和最大高度
      const minHeight = minRows * lineHeight
      const maxHeight = maxRows * lineHeight

      // 計算新高度
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)

      // 設置新高度
      textarea.style.height = `${newHeight}px`
    }

    // 當值變化時調整高度
    useEffect(() => {
      adjustHeight()
    }, [value])

    // 初始化時調整高度
    useEffect(() => {
      adjustHeight()

      // 監聽窗口大小變化，重新調整高度
      window.addEventListener("resize", adjustHeight)
      return () => {
        window.removeEventListener("resize", adjustHeight)
      }
    }, [])

    return (
      <Textarea
        ref={combinedRef}
        className={cn("min-h-[80px] transition-height duration-100", className)}
        value={value}
        onChange={(e) => {
          if (onChange) {
            onChange(e)
          }
        }}
        {...props}
      />
    )
  },
)

AutoResizeTextarea.displayName = "AutoResizeTextarea"
