"use client"

import type React from "react"

import { useRef, useLayoutEffect } from "react"
import { Textarea } from "@/components/ui/textarea"

interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number
}

export const AutoResizeTextarea = ({ minRows = 3, value, onChange, ...props }: AutoResizeTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    // 重置高度以獲取正確的 scrollHeight
    textarea.style.height = "auto"

    // 計算新高度 (最小高度為 minRows 的高度)
    const lineHeight = Number.parseInt(getComputedStyle(textarea).lineHeight) || 20
    const minHeight = minRows * lineHeight
    const scrollHeight = textarea.scrollHeight

    // 設置新高度
    textarea.style.height = `${Math.max(minHeight, scrollHeight)}px`
  }

  // 初始化和更新時調整高度
  useLayoutEffect(() => {
    adjustHeight()
  }, [value])

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        if (onChange) {
          onChange(e)
        }
        // 在下一個渲染週期調整高度
        setTimeout(adjustHeight, 0)
      }}
      className="resize-none overflow-hidden"
      {...props}
    />
  )
}
