import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to a localized string
 */
export function formatDate(date: Date | string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return ""

  const dateObj = typeof date === "string" ? new Date(date) : date

  if (isNaN(dateObj.getTime())) return ""

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }

  return dateObj.toLocaleDateString("en-US", { ...defaultOptions, ...options })
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number | string | null | undefined, currency = "USD", locale = "en-US"): string {
  if (amount === null || amount === undefined || amount === "") return ""

  const numericAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

  if (isNaN(numericAmount)) return ""

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(numericAmount)
}
