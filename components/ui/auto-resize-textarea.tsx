"use client"

import React from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number
  maxRows?: number
}

export const AutoResizeTextarea = React.forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  ({ className, minRows = 3, maxRows = 10, rows, ...props }, ref) => {
    // 使用固定行數，不再嘗試自動調整高度
    const actualRows = rows || minRows

    return <Textarea ref={ref} className={cn("min-h-[80px]", className)} rows={actualRows} {...props} />
  },
)

AutoResizeTextarea.displayName = "AutoResizeTextarea"
