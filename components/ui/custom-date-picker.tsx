"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface CustomDatePickerProps {
  date?: Date
  setDate: (date: Date) => void
  disabled?: boolean
  className?: string
}

export function CustomDatePicker({ date, setDate, disabled = false, className }: CustomDatePickerProps) {
  const [open, setOpen] = React.useState(false)

  // 確保有一個有效的日期值
  const safeDate = date || new Date()

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      console.log("選擇日期:", selectedDate)
      setDate(selectedDate)
      setOpen(false) // 選擇後自動關閉
    }
  }

  const handleButtonClick = () => {
    console.log("日期按鈕被點擊")
    if (!disabled) {
      setOpen(true)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground", className)}
          onClick={handleButtonClick}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(safeDate, "yyyy-MM-dd") : "選擇日期"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={safeDate} onSelect={handleSelect} initialFocus />
      </PopoverContent>
    </Popover>
  )
}
