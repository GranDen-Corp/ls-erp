import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date into a localized string representation
 * @param date - The date to format
 * @param locale - The locale to use for formatting (defaults to 'en-US')
 * @param options - DateTimeFormatOptions for customizing the format
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  },
): string {
  if (!date) return ""

  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return ""
  }

  return new Intl.DateTimeFormat(locale, options).format(dateObj)
}

/**
 * Formats a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (defaults to 'USD')
 * @param locale - The locale to use for formatting (defaults to 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | string | null | undefined, currency = "USD", locale = "en-US"): string {
  if (amount === null || amount === undefined || amount === "") {
    return ""
  }

  const numericAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

  if (isNaN(numericAmount)) {
    return ""
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount)
}
