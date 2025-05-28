"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CustomerComboboxProps {
  customers: Customer[]
  selectedCustomerId: string
  onCustomerChange: (customerId: string) => void
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
}

interface Customer {
  customer_id: string
  customer_full_name: string
  customer_short_name?: string
}

export function CustomerCombobox({
  customers = [], // Add default empty array
  selectedCustomerId,
  onCustomerChange,
  placeholder = "選擇客戶...",
  emptyMessage = "找不到客戶",
  disabled = false,
  className,
}: CustomerComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Filter customers based on search query
  const filteredCustomers = searchQuery
    ? customers.filter(
        (customer) =>
          customer.customer_full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.customer_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (customer.customer_short_name &&
            customer.customer_short_name.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : customers

  // Get currently selected customer
  const selectedCustomer = customers.find((customer) => customer.customer_id === selectedCustomerId)

  return (
    <div className="relative w-full">
      {/* Custom button */}
      <Button
        ref={buttonRef}
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn("w-full justify-between", disabled ? "opacity-50 cursor-not-allowed" : "", className)}
        disabled={disabled}
        type="button"
        onClick={() => {
          if (!open) {
            console.log("CustomerCombobox 打開下拉選單")
            console.log("CustomerCombobox 客戶數量:", customers.length)
            console.log("CustomerCombobox 當前值:", selectedCustomerId)
            console.log("CustomerCombobox 選中客戶:", selectedCustomer)
          }
          setOpen(!open)
        }}
      >
        {selectedCustomerId && selectedCustomer ? (
          <span className="text-left truncate">{selectedCustomer.customer_full_name}</span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {/* Custom dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          className="absolute z-[9999] w-full bg-white rounded-md border border-gray-200 shadow-lg mt-1 overflow-hidden"
          style={{ maxHeight: "300px", overflowY: "auto" }}
        >
          {/* Search box */}
          <div className="p-2 border-b relative">
            <Input
              placeholder="搜尋客戶..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
              autoFocus
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            {searchQuery && (
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Options list */}
          <div className="py-1">
            {filteredCustomers.length === 0 ? (
              <div className="px-2 py-3 text-sm text-gray-500 text-center">{emptyMessage}</div>
            ) : (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.customer_id}
                  className={cn(
                    "px-2 py-2 text-sm flex items-center cursor-pointer hover:bg-gray-100",
                    selectedCustomerId === customer.customer_id ? "bg-gray-100" : "",
                  )}
                  onClick={() => {
                    console.log("選擇客戶:", customer.customer_id, customer.customer_full_name)
                    onCustomerChange(customer.customer_id)
                    setOpen(false)
                    setSearchQuery("")
                  }}
                >
                  <div className="w-5 h-5 mr-2 flex items-center justify-center">
                    {selectedCustomerId === customer.customer_id && <Check className="h-4 w-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span>{customer.customer_full_name}</span>
                    {customer.customer_short_name && (
                      <span className="text-xs text-gray-500">{customer.customer_short_name}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
