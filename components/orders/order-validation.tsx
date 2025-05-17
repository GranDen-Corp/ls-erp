"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { convertCurrency } from "@/lib/currency-utils"

interface ValidationItem {
  productPartNo: string
  productName: string
  orderQuantity: number
  purchaseQuantity: number
  orderPrice: number
  purchasePrice: number
  orderCurrency: string
  purchaseCurrency: string
  orderDeliveryDate?: Date
  purchaseDeliveryDate?: Date
  isPriceValid: boolean
  isQuantityValid: boolean
  isDateValid: boolean
  priceMargin: number
  daysMargin: number
}

interface OrderValidationProps {
  orderItems: any[]
  procurementItems: any[]
  customerCurrency: string
}

export function OrderValidation({ orderItems, procurementItems, customerCurrency }: OrderValidationProps) {
  const [validationResults, setValidationResults] = useState<ValidationItem[]>([])
  const [isAllValid, setIsAllValid] = useState<boolean>(true)
  const [summary, setSummary] = useState({
    totalItems: 0,
    validPriceItems: 0,
    validQuantityItems: 0,
    validDateItems: 0,
    averagePriceMargin: 0,
    averageDaysMargin: 0,
  })

  useEffect(() => {
    if (!orderItems || !procurementItems) return

    const results: ValidationItem[] = []
    let totalPriceMargin = 0
    let totalDaysMargin = 0
    let validPriceCount = 0
    let validQuantityCount = 0
    let validDateCount = 0

    // 遍歷訂單項目
    orderItems.forEach((orderItem) => {
      // 查找對應的採購項目
      const purchaseItems = procurementItems.filter((p) => p.productPartNo === orderItem.productPartNo && p.isSelected)

      if (purchaseItems.length === 0) {
        // 沒有找到對應的採購項目
        results.push({
          productPartNo: orderItem.productPartNo,
          productName: orderItem.productName,
          orderQuantity: orderItem.quantity,
          purchaseQuantity: 0,
          orderPrice: orderItem.unitPrice,
          purchasePrice: 0,
          orderCurrency: orderItem.currency || customerCurrency,
          purchaseCurrency: "",
          orderDeliveryDate: getLatestDeliveryDate(orderItem),
          purchaseDeliveryDate: undefined,
          isPriceValid: false,
          isQuantityValid: false,
          isDateValid: false,
          priceMargin: 0,
          daysMargin: 0,
        })
        return
      }

      // 計算採購總數量
      const totalPurchaseQuantity = purchaseItems.reduce((sum, item) => sum + item.quantity, 0)

      // 計算採購加權平均價格
      const totalPurchaseValue = purchaseItems.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0)
      const avgPurchasePrice = totalPurchaseValue / totalPurchaseQuantity

      // 獲取最晚的採購交期
      const latestPurchaseDate = getLatestPurchaseDate(purchaseItems)
      const latestOrderDate = getLatestDeliveryDate(orderItem)

      // 轉換為相同貨幣進行比較
      const orderPriceInUSD = convertCurrency(orderItem.unitPrice, orderItem.currency || customerCurrency, "USD")
      const purchasePriceInUSD = convertCurrency(avgPurchasePrice, purchaseItems[0].currency || "USD", "USD")

      // 計算價格差異 - 修正毛利率計算公式
      const priceMargin =
        orderPriceInUSD > purchasePriceInUSD ? ((orderPriceInUSD - purchasePriceInUSD) / orderPriceInUSD) * 100 : 0

      // 計算日期差異
      const daysMargin =
        latestOrderDate && latestPurchaseDate
          ? Math.floor((latestOrderDate.getTime() - latestPurchaseDate.getTime()) / (1000 * 60 * 60 * 24))
          : 0

      // 驗證結果 - 修正價格驗證邏輯
      const isPriceValid = orderPriceInUSD > purchasePriceInUSD
      const isQuantityValid = orderItem.quantity === totalPurchaseQuantity
      const isDateValid = !latestOrderDate || !latestPurchaseDate || latestOrderDate >= latestPurchaseDate

      if (isPriceValid) {
        validPriceCount++
        totalPriceMargin += priceMargin
      }

      if (isQuantityValid) validQuantityCount++

      if (isDateValid) {
        validDateCount++
        if (daysMargin > 0) totalDaysMargin += daysMargin
      }

      results.push({
        productPartNo: orderItem.productPartNo,
        productName: orderItem.productName,
        orderQuantity: orderItem.quantity,
        purchaseQuantity: totalPurchaseQuantity,
        orderPrice: orderItem.unitPrice,
        purchasePrice: avgPurchasePrice,
        orderCurrency: orderItem.currency || customerCurrency,
        purchaseCurrency: purchaseItems[0].currency || "USD",
        orderDeliveryDate: latestOrderDate,
        purchaseDeliveryDate: latestPurchaseDate,
        isPriceValid,
        isQuantityValid,
        isDateValid,
        priceMargin,
        daysMargin,
      })
    })

    // 更新驗證結果
    setValidationResults(results)

    // 計算平均值
    const averagePriceMargin = validPriceCount > 0 ? totalPriceMargin / validPriceCount : 0
    const averageDaysMargin = validDateCount > 0 ? totalDaysMargin / validDateCount : 0

    // 更新摘要
    setSummary({
      totalItems: results.length,
      validPriceItems: validPriceCount,
      validQuantityItems: validQuantityCount,
      validDateItems: validDateCount,
      averagePriceMargin,
      averageDaysMargin,
    })

    // 檢查是否所有項目都有效
    setIsAllValid(
      validPriceCount === results.length && validQuantityCount === results.length && validDateCount === results.length,
    )
  }, [orderItems, procurementItems, customerCurrency])

  // 獲取訂單項目的最晚交期
  function getLatestDeliveryDate(orderItem: any): Date | undefined {
    if (!orderItem.shipmentBatches || orderItem.shipmentBatches.length === 0) {
      return undefined
    }

    const dates = orderItem.shipmentBatches.map((batch: any) => batch.plannedShipDate).filter((date: any) => date)

    if (dates.length === 0) return undefined

    return new Date(Math.max(...dates.map((date: any) => new Date(date).getTime())))
  }

  // 獲取採購項目的最晚交期
  function getLatestPurchaseDate(purchaseItems: any[]): Date | undefined {
    const dates = purchaseItems.map((item) => item.deliveryDate).filter((date) => date)

    if (dates.length === 0) return undefined

    return new Date(Math.max(...dates.map((date) => new Date(date).getTime())))
  }

  if (validationResults.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <Alert className={isAllValid ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}>
        <div className="flex items-center">
          {isAllValid ? (
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
          )}
          <AlertTitle className="text-lg font-medium">訂單驗證結果</AlertTitle>
        </div>
        <AlertDescription className="mt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div className="flex items-center space-x-2">
              <Badge
                variant={summary.validPriceItems === summary.totalItems ? "outline" : "destructive"}
                className="px-2 py-1"
              >
                價格驗證: {summary.validPriceItems}/{summary.totalItems}
              </Badge>
              <span className="text-sm">平均毛利: {summary.averagePriceMargin.toFixed(2)}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant={summary.validQuantityItems === summary.totalItems ? "outline" : "destructive"}
                className="px-2 py-1"
              >
                數量驗證: {summary.validQuantityItems}/{summary.totalItems}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant={summary.validDateItems === summary.totalItems ? "outline" : "destructive"}
                className="px-2 py-1"
              >
                交期驗證: {summary.validDateItems}/{summary.totalItems}
              </Badge>
              <span className="text-sm">平均緩衝: {summary.averageDaysMargin.toFixed(0)}天</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  產品
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  價格比較
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  數量比較
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  交期比較
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {validationResults.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{item.productPartNo}</div>
                    <div className="text-sm text-gray-500">{item.productName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center ${item.isPriceValid ? "text-green-600" : "text-red-600"}`}>
                      {item.isPriceValid ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      <div>
                        <div>
                          訂單: {item.orderPrice.toFixed(2)} {item.orderCurrency}
                        </div>
                        <div>
                          採購: {item.purchasePrice.toFixed(2)} {item.purchaseCurrency}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center ${item.isQuantityValid ? "text-green-600" : "text-red-600"}`}>
                      {item.isQuantityValid ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      <div>
                        <div>訂單: {item.orderQuantity}</div>
                        <div>採購: {item.purchaseQuantity}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center ${item.isDateValid ? "text-green-600" : "text-red-600"}`}>
                      {item.isDateValid ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      <div>
                        <div>
                          訂單: {item.orderDeliveryDate ? item.orderDeliveryDate.toLocaleDateString() : "未設定"}
                        </div>
                        <div>
                          採購: {item.purchaseDeliveryDate ? item.purchaseDeliveryDate.toLocaleDateString() : "未設定"}
                        </div>
                        {item.daysMargin !== 0 && <div className="text-xs">緩衝: {item.daysMargin} 天</div>}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
