/**
 * 匯出工具函數
 * 用於將資料匯出為不同格式的檔案
 */

// 將資料轉換為CSV格式
export function convertToCSV(data: any[], headers?: Record<string, string>) {
  if (!data || data.length === 0) return ""

  // 如果提供了自定義標頭，使用它們；否則使用對象的鍵作為標頭
  const headerKeys = headers ? Object.keys(headers) : Object.keys(data[0])
  const headerValues = headers ? Object.values(headers) : headerKeys

  // 創建CSV標頭行
  let csv = headerValues.join(",") + "\n"

  // 添加每一行數據
  data.forEach((item) => {
    const row = headerKeys.map((key) => {
      // 處理值中的逗號和引號，確保CSV格式正確
      const value = item[key] !== undefined && item[key] !== null ? item[key] : ""
      const valueStr = String(value)
      // 如果值包含逗號、引號或換行符，則用引號括起來
      if (valueStr.includes(",") || valueStr.includes('"') || valueStr.includes("\n")) {
        return `"${valueStr.replace(/"/g, '""')}"`
      }
      return valueStr
    })
    csv += row.join(",") + "\n"
  })

  return csv
}

// 將資料轉換為JSON格式
export function convertToJSON(data: any[]) {
  return JSON.stringify(data, null, 2)
}

// 下載檔案
export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 匯出為CSV檔案
export function exportToCSV(data: any[], fileName: string, headers?: Record<string, string>) {
  const csv = convertToCSV(data, headers)
  downloadFile(csv, fileName, "text/csv;charset=utf-8;")
}

// 匯出為JSON檔案
export function exportToJSON(data: any[], fileName: string) {
  const json = convertToJSON(data)
  downloadFile(json, fileName, "application/json;charset=utf-8;")
}

// 格式化日期為YYYY-MM-DD格式
export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// 獲取當前日期時間作為檔案名稱的一部分
export function getTimestamp(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  const seconds = String(now.getSeconds()).padStart(2, "0")

  return `${year}${month}${day}_${hours}${minutes}${seconds}`
}
