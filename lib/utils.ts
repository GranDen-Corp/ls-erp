import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date into a localized string
 * @param date The date to format
 * @param options Optional Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
): string {
  if (!date) return "N/A"

  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date

  if (isNaN(dateObj.getTime())) return "Invalid Date"

  return new Intl.DateTimeFormat("en-US", options).format(dateObj)
}

/**
 * Formats a number as currency
 * @param amount The amount to format
 * @param currency The currency code (default: USD)
 * @param locale The locale (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | null | undefined, currency = "USD", locale = "en-US"): string {
  if (amount === null || amount === undefined) return "N/A"

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
