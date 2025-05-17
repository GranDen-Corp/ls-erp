// 簡單的匯率轉換工具
// 實際應用中可能需要連接到外部API獲取即時匯率

// 基準貨幣為USD
const exchangeRates: Record<string, number> = {
  USD: 1.0,
  TWD: 0.032, // 1 TWD = 0.032 USD
  EUR: 1.09, // 1 EUR = 1.09 USD
  JPY: 0.0067, // 1 JPY = 0.0067 USD
  CNY: 0.14, // 1 CNY = 0.14 USD
  GBP: 1.27, // 1 GBP = 1.27 USD
  AUD: 0.66, // 1 AUD = 0.66 USD
  CAD: 0.74, // 1 CAD = 0.74 USD
  HKD: 0.13, // 1 HKD = 0.13 USD
  SGD: 0.75, // 1 SGD = 0.75 USD
}

/**
 * 將金額從一種貨幣轉換為另一種貨幣
 * @param amount 金額
 * @param fromCurrency 原始貨幣
 * @param toCurrency 目標貨幣
 * @returns 轉換後的金額
 */
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  // 如果貨幣相同，直接返回原金額
  if (fromCurrency === toCurrency) {
    return amount
  }

  // 標準化貨幣代碼
  const from = fromCurrency.toUpperCase()
  const to = toCurrency.toUpperCase()

  // 檢查貨幣是否支持
  if (!exchangeRates[from]) {
    console.warn(`不支持的貨幣: ${from}，使用默認匯率 1.0`)
    return amount
  }

  if (!exchangeRates[to]) {
    console.warn(`不支持的貨幣: ${to}，使用默認匯率 1.0`)
    return amount
  }

  // 先轉換為USD，再轉換為目標貨幣
  const amountInUSD = amount * exchangeRates[from]
  const amountInTargetCurrency = amountInUSD / exchangeRates[to]

  return amountInTargetCurrency
}

/**
 * 獲取貨幣符號
 * @param currency 貨幣代碼
 * @returns 貨幣符號
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    TWD: "NT$",
    EUR: "€",
    JPY: "¥",
    CNY: "¥",
    GBP: "£",
    AUD: "A$",
    CAD: "C$",
    HKD: "HK$",
    SGD: "S$",
  }

  return symbols[currency.toUpperCase()] || currency
}

/**
 * 格式化貨幣金額
 * @param amount 金額
 * @param currency 貨幣代碼
 * @returns 格式化後的金額字符串
 */
export function formatCurrencyAmount(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency)

  // 根據貨幣不同，可能需要不同的小數位數
  const decimals = currency.toUpperCase() === "JPY" ? 0 : 2

  return `${symbol}${amount.toFixed(decimals)}`
}
