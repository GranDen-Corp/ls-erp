"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateTimePickerProps {
  date?: Date
  setDate?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DateTimePicker({
  date,
  setDate,
  placeholder = "選擇日期和時間",
  className,
  disabled = false,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
  const [isOpen, setIsOpen] = React.useState(false)

  // 當內部狀態改變時，更新外部狀態
  React.useEffect(() => {
    if (selectedDate !== date && setDate) {
      setDate(selectedDate)
    }
  }, [selectedDate, date, setDate])

  // 當外部狀態改變時，更新內部狀態
  React.useEffect(() => {
    if (date !== selectedDate) {
      setSelectedDate(date)
    }
  }, [date, selectedDate])

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined)
      return
    }

    const currentDate = selectedDate || new Date()
    const hours = currentDate.getHours()
    const minutes = currentDate.getMinutes()

    const newDate = new Date(date)
    newDate.setHours(hours)
    newDate.setMinutes(minutes)

    setSelectedDate(newDate)
  }

  const handleHourChange = (hour: string) => {
    if (!selectedDate) return

    const newDate = new Date(selectedDate)
    newDate.setHours(Number.parseInt(hour))
    setSelectedDate(newDate)
  }

  const handleMinuteChange = (minute: string) => {
    if (!selectedDate) return

    const newDate = new Date(selectedDate)
    newDate.setMinutes(Number.parseInt(minute))
    setSelectedDate(newDate)
  }

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"))

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
              className,
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "yyyy-MM-dd HH:mm") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="start" sideOffset={5}>
          <div className="p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
              disabled={disabled}
            />
            <div className="flex items-center justify-center p-3 border-t">
              <Clock className="mr-2 h-4 w-4" />
              <div className="flex space-x-2">
                <Select
                  value={selectedDate ? selectedDate.getHours().toString().padStart(2, "0") : "00"}
                  onValueChange={handleHourChange}
                  disabled={!selectedDate || disabled}
                >
                  <SelectTrigger className="w-16">
                    <SelectValue placeholder="時" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="h-48 overflow-y-auto">
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour}>
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-center py-2">:</span>
                <Select
                  value={selectedDate ? selectedDate.getMinutes().toString().padStart(2, "0") : "00"}
                  onValueChange={handleMinuteChange}
                  disabled={!selectedDate || disabled}
                >
                  <SelectTrigger className="w-16">
                    <SelectValue placeholder="分" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="h-48 overflow-y-auto">
                    {minutes.map((minute) => (
                      <SelectItem key={minute} value={minute}>
                        {minute}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
