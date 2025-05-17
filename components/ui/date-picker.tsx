"use client"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  setDate: (date: Date) => void
  disabled?: boolean
  className?: string
}

export function DatePicker({ date, setDate, disabled = false, className }: DatePickerProps) {
  console.log("DatePicker 渲染，當前日期:", date)

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    console.log("日曆選擇了日期:", selectedDate)
    if (selectedDate) {
      setDate(selectedDate)
    }
  }

  const handleTriggerClick = () => {
    console.log("DatePicker 觸發器被點擊")
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground", className)}
          disabled={disabled}
          onClick={handleTriggerClick}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>選擇日期</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={handleCalendarSelect} initialFocus />
      </PopoverContent>
    </Popover>
  )
}
