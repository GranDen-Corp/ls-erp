/**
 * 生成產品索引字母 (A, B, C, ...)
 * @param index 產品索引 (0-based)
 * @returns 產品索引字母
 */
export function generateProductIndex(index: number): string {
  // 將數字轉換為字母 (0 -> A, 1 -> B, ...)
  return String.fromCharCode(65 + index)
}

/**
 * 生成訂單批次ID
 * @param orderId 訂單ID
 * @param productIndex 產品索引字母 (A, B, C, ...)
 * @param batchNumber 批次編號
 * @returns 訂單批次ID
 */
export function generateOrderBatchId(orderId: string, productIndex: string, batchNumber: number): string {
  // 格式: LS-{orderId}{productIndex}-{batchNumber}
  // 例如: LS-250500001A-1
  return `LS-${orderId}${productIndex}-${batchNumber}`
}

/**
 * 從訂單批次ID解析訂單ID
 * @param orderBatchId 訂單批次ID
 * @returns 訂單ID
 */
export function parseOrderIdFromBatchId(orderBatchId: string): string | null {
  // 格式: LS-{orderId}{productIndex}-{batchNumber}
  const match = orderBatchId.match(/^LS-([A-Z0-9-]+)[A-Z]-\d+$/)
  return match ? match[1] : null
}

/**
 * 從訂單批次ID解析產品索引
 * @param orderBatchId 訂單批次ID
 * @returns 產品索引字母
 */
export function parseProductIndexFromBatchId(orderBatchId: string): string | null {
  // 格式: LS-{orderId}{productIndex}-{batchNumber}
  const match = orderBatchId.match(/^LS-[A-Z0-9-]+([A-Z])-\d+$/)
  return match ? match[1] : null
}

/**
 * 從訂單批次ID解析批次編號
 * @param orderBatchId 訂單批次ID
 * @returns 批次編號
 */
export function parseBatchNumberFromBatchId(orderBatchId: string): number | null {
  // 格式: LS-{orderId}{productIndex}-{batchNumber}
  const match = orderBatchId.match(/^LS-[A-Z0-9-]+[A-Z]-(\d+)$/)
  return match ? Number.parseInt(match[1], 10) : null
}
