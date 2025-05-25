"use client"

import { forwardRef, useImperativeHandle, useEffect, memo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  LucideLayers,
  LucideAlertCircle,
  LucideSettings,
  LucideLoader2,
  LucideCheckCircle,
  LucideShoppingCart,
  LucideArrowRight,
  LucideArrowLeft,
  LucideSave,
  LucidePackage,
  LucideClipboardList,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProcurementDataEditor } from "@/components/orders/procurement-data-editor"
import { formatCurrencyAmount } from "@/lib/currency-utils"
import { OrderValidation } from "@/components/orders/order-validation"
import { useOrderForm } from "@/hooks/use-order-form"
import CustomerSelection from "./customer-selection"
import { ProductSelection } from "./product-selection"
import { EnhancedProductList } from "./enhanced-product-list"
import { ProductList } from "./product-list"
import { BatchManagement } from "./batch-management"
import { OrderInfo } from "./order-info"
import { EnhancedBatchManagement } from "./enhanced-batch-management"

interface NewOrderFormProps {
  onSubmit: (createPurchaseOrder?: boolean) => void
  createdOrderId?: string
  currentStep?: number
  orderData?: any
}

// Memoize child components to prevent unnecessary re-renders
const MemoizedCustomerSelection = memo(CustomerSelection)
const MemoizedProductSelection = memo(ProductSelection)
const MemoizedEnhancedProductList = memo(EnhancedProductList)
const MemoizedProductList = memo(ProductList)
const MemoizedOrderInfo = memo(OrderInfo)
const MemoizedBatchManagement = memo(BatchManagement)

const NewOrderForm = forwardRef<any, NewOrderFormProps>(
  ({ onSubmit, createdOrderId, currentStep = 0, orderData }, ref) => {
    const orderForm = useOrderForm()

    // 暴露指定方法給父組件
    useImperativeHandle(
      ref,
      () => ({
        submitOrder: async (createPurchaseOrder = false) => {
          return await orderForm.handleSubmitOrder(createPurchaseOrder)
        },
        createPurchaseOrdersOnly: async (orderId: string) => {
          if (!orderId) {
            throw new Error("訂單ID不能為空")
          }
          return await orderForm.createPurchaseOrders(orderId)
        },
        getOrderData: async (skipValidation = false) => {
          return await orderForm.getOrderData(skipValidation)
        },
      }),
      [orderForm],
    )

    // 當步驟變更時，更新UI
    useEffect(() => {
      if (currentStep === 1) {
        orderForm.setActiveTab("procurement")
      }
    }, [currentStep, orderForm])

    // 當訂單數據變更時，更新表單
    const hasProcurementReady = useRef(false)

    useEffect(() => {
      if (orderData && currentStep === 1 && !hasProcurementReady.current) {
        orderForm.setIsProcurementReady(true)
        hasProcurementReady.current = true
      }
    }, [orderData, currentStep, orderForm])

    // 根據當前步驟渲染不同的內容
    if (currentStep === 1) {
      // 採購資料確認步驟
      return (
        <div className="space-y-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <LucideCheckCircle className="h-5 w-5" />
                訂單建立成功
              </CardTitle>
              <CardDescription className="text-blue-700">
                訂單編號: <span className="font-semibold">{createdOrderId || orderData?.order_id}</span>
                <br />
                請確認以下採購資料，並點擊「創建採購單」按鈕完成採購單創建。
              </CardDescription>
            </CardHeader>
          </Card>

          <ProcurementDataEditor
            orderItems={orderForm.orderItems}
            onProcurementDataChange={orderForm.handleProcurementDataChange}
            isCreatingPurchaseOrder={orderForm.isCreatingPurchaseOrder}
            orderId={createdOrderId || orderData?.order_id}
            readOnly={false}
            productUnits={orderForm.productUnits}
            getUnitMultiplier={orderForm.getUnitMultiplier}
          />
        </div>
      )
    }

    if (orderForm.loading) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-center text-muted-foreground">正在載入客戶和產品資料...</p>
          </CardContent>
        </Card>
      )
    }

    if (orderForm.error) {
      return (
        <Alert variant="destructive">
          <LucideAlertCircle className="h-4 w-4" />
          <AlertTitle>載入錯誤</AlertTitle>
          <AlertDescription>{orderForm.error}</AlertDescription>
        </Alert>
      )
    }

    // Create stable callback functions
    const handleGoToProcurement = () => {
      orderForm.setActiveTab("procurement")
      orderForm.setIsSplitView(true)
    }

    const handleGoToProducts = () => {
      orderForm.setActiveTab("products")
    }

    return (
      <div className="space-y-6">
        {/* 進度指示器 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`flex items-center space-x-2 ${orderForm.activeTab === "products" ? "text-blue-600" : "text-gray-400"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${orderForm.activeTab === "products" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  >
                    <LucidePackage className="h-4 w-4" />
                  </div>
                  <span className="font-medium">產品選擇與設定</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div
                  className={`flex items-center space-x-2 ${orderForm.activeTab === "procurement" ? "text-blue-600" : "text-gray-400"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${orderForm.activeTab === "procurement" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  >
                    <LucideClipboardList className="h-4 w-4" />
                  </div>
                  <span className="font-medium">採購資料設定</span>
                </div>
              </div>

              {/* 快速操作按鈕 */}
              <div className="flex gap-2">
                {orderForm.isProductSettingsConfirmed && orderForm.isProcurementSettingsConfirmed && (
                  <>
                    <Button
                      onClick={() => onSubmit(false)}
                      disabled={orderForm.isSubmitting || orderForm.isCreatingPurchaseOrder}
                      variant="outline"
                      size="sm"
                    >
                      <LucideSave className="h-4 w-4 mr-2" />
                      僅建立訂單
                    </Button>
                    <Button
                      onClick={() => onSubmit(true)}
                      disabled={orderForm.isSubmitting || orderForm.isCreatingPurchaseOrder}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <LucideShoppingCart className="h-4 w-4 mr-2" />
                      建立訂單與採購單
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 基本訂單資訊區域 */}
        <MemoizedCustomerSelection
          customers={orderForm.customers}
          selectedCustomerId={orderForm.selectedCustomerId}
          setSelectedCustomerId={orderForm.setSelectedCustomerId}
          poNumber={orderForm.poNumber}
          setPoNumber={orderForm.setPoNumber}
          orderNumber={orderForm.orderNumber}
          setOrderNumber={orderForm.setOrderNumber}
          customOrderNumber={orderForm.customOrderNumber}
          setCustomOrderNumber={orderForm.setCustomOrderNumber}
          useCustomOrderNumber={orderForm.useCustomOrderNumber}
          setUseCustomOrderNumber={orderForm.setUseCustomOrderNumber}
          isProductSettingsConfirmed={orderForm.isProductSettingsConfirmed}
          setOrderNumberStatus={orderForm.setOrderNumberStatus}
          setOrderNumberMessage={orderForm.setOrderNumberMessage}
          orderItems={orderForm.orderItems}
          paymentTerm={orderForm.paymentTerm}
          setPaymentTerm={orderForm.setPaymentTerm}
          deliveryTerms={orderForm.deliveryTerms}
          setDeliveryTerms={orderForm.setDeliveryTerms}
          isLoadingOrderNumber={orderForm.isLoadingOrderNumber}
          generateNewOrderNumber={orderForm.generateNewOrderNumber}
        />

        {/* 產品設定區域 */}
        {orderForm.activeTab === "products" && (
          <div className="space-y-6">
            <MemoizedProductSelection
              regularProducts={orderForm.regularProducts}
              assemblyProducts={orderForm.assemblyProducts}
              selectedCustomerId={orderForm.selectedCustomerId}
              isProductSettingsConfirmed={orderForm.isProductSettingsConfirmed}
              productSelectionTab={orderForm.productSelectionTab}
              setProductSelectionTab={orderForm.setProductSelectionTab}
              productSearchTerm={orderForm.productSearchTerm}
              setProductSearchTerm={orderForm.setProductSearchTerm}
              selectedProducts={orderForm.selectedProducts}
              selectedProductPartNo={orderForm.selectedProductPartNo}
              setSelectedProductPartNo={orderForm.setSelectedProductPartNo}
              customerCurrency={orderForm.customerCurrency}
              isProductAdded={orderForm.checkIsProductAdded}
              isProductSelected={orderForm.isProductSelected}
              toggleProductSelection={orderForm.toggleProductSelection}
              clearAllSelections={orderForm.clearAllSelections}
              handleAddSelectedProducts={orderForm.handleAddSelectedProducts}
              handleAddAssemblyProduct={orderForm.handleAddAssemblyProduct}
              loadingSelectedProducts={orderForm.loadingSelectedProducts}
              getProductPartNo={orderForm.getProductPartNo}
              getProductName={orderForm.getProductName}
              isProductAssembly={orderForm.isProductAssembly}
              parseSubPartNo={orderForm.parseSubPartNo}
            />

            <MemoizedEnhancedProductList
              orderItems={orderForm.orderItems}
              handleItemChange={orderForm.handleItemChange}
              handleRemoveProduct={orderForm.handleRemoveProduct}
              calculateItemTotal={orderForm.calculateItemTotal}
              openBatchManagement={orderForm.openBatchManagement}
              customerCurrency={orderForm.customerCurrency}
              isProductSettingsConfirmed={orderForm.isProductSettingsConfirmed}
              handleClearAllProducts={orderForm.handleClearAllProducts}
              productUnits={orderForm.productUnits}
              exchangeRates={orderForm.exchangeRates}
              getUnitMultiplier={orderForm.getUnitMultiplier}
              calculateActualQuantity={orderForm.calculateActualQuantity}
              calculateActualUnitPrice={orderForm.calculateActualUnitPrice}
            />

            {/* 產品設定總結和操作區 */}
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        {orderForm.orderItems.length} 項產品
                      </Badge>
                      <span className="text-2xl font-bold text-green-700">
                        總計: {formatCurrencyAmount(orderForm.calculateTotal(), orderForm.customerCurrency)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      請確認所有產品的數量、單位、價格設定無誤後，點擊確認按鈕進入下一步。
                    </p>
                  </div>

                  <div className="flex gap-3">
                    {orderForm.orderItems.length > 0 && (
                      <Button
                        onClick={orderForm.confirmProductsReady}
                        variant={orderForm.isProductSettingsConfirmed ? "outline" : "default"}
                        size="lg"
                      >
                        {orderForm.isProductSettingsConfirmed ? (
                          <>
                            <LucideSettings className="h-5 w-5 mr-2" />
                            修改產品設定
                          </>
                        ) : (
                          <>
                            <LucideCheckCircle className="h-5 w-5 mr-2" />
                            確認產品設定完成
                          </>
                        )}
                      </Button>
                    )}
                    {orderForm.orderItems.length > 0 && orderForm.isProductSettingsConfirmed && (
                      <Button onClick={handleGoToProcurement} className="gap-2" size="lg">
                        <LucideArrowRight className="h-5 w-5" />
                        前往設定採購資料
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 採購資料設定區域 */}
        {orderForm.activeTab === "procurement" && orderForm.isProcurementReady && (
          <div className="space-y-6">
            {/* 訂單摘要卡片 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <LucidePackage className="h-5 w-5" />
                    訂單產品摘要
                  </CardTitle>
                  <CardDescription>請確認以下產品資料，再進行採購設定</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {orderForm.orderItems.length} 項產品
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    總金額: {formatCurrencyAmount(orderForm.calculateTotal(), orderForm.customerCurrency)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">產品編號</TableHead>
                        <TableHead>產品名稱</TableHead>
                        <TableHead className="text-center w-[80px]">數量</TableHead>
                        <TableHead className="text-right w-[100px]">單價</TableHead>
                        <TableHead className="text-right w-[100px]">金額</TableHead>
                        <TableHead className="text-center w-[80px]">批次</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderForm.orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.productPartNo}
                            {item.isAssembly && (
                              <Badge className="ml-2 bg-purple-500 text-white">
                                <LucideLayers className="h-3 w-3 mr-1" />
                                組件
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {item.unitPrice.toFixed(2)} {item.currency}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {orderForm.calculateItemTotal(item).toFixed(2)} {item.currency}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{item.shipmentBatches.length}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-bold">
                          訂單總金額:
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrencyAmount(orderForm.calculateTotal(), orderForm.customerCurrency)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* 返回產品設定按鈕 */}
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleGoToProducts} className="flex items-center gap-2">
                <LucideArrowLeft className="h-4 w-4" />
                返回產品設定
              </Button>
            </div>

            {/* 採購資料設定 */}
            <ProcurementDataEditor
              orderItems={orderForm.orderItems}
              onProcurementDataChange={orderForm.handleProcurementDataChange}
              isCreatingPurchaseOrder={orderForm.isCreatingPurchaseOrder}
              orderId={createdOrderId}
              readOnly={orderForm.isProcurementSettingsConfirmed}
              onConfirmSettings={orderForm.confirmProcurementSettings}
              isSettingsConfirmed={orderForm.isProcurementSettingsConfirmed}
              productUnits={orderForm.productUnits}
              getUnitMultiplier={orderForm.getUnitMultiplier}
            />

            {orderForm.isProcurementSettingsConfirmed && (
              <OrderValidation
                orderItems={orderForm.orderItems}
                procurementItems={orderForm.procurementItems}
                customerCurrency={orderForm.customerCurrency}
              />
            )}
          </div>
        )}

        {/* 訂單資訊和備註 - 始終顯示在頁面底部 */}
        <MemoizedOrderInfo
          orderInfo={orderForm.orderInfo}
          setOrderInfo={orderForm.setOrderInfo}
          remarks={orderForm.remarks}
          setRemarks={orderForm.setRemarks}
          purchaseInfo={orderForm.purchaseInfo}
          setPurchaseInfo={orderForm.setPurchaseInfo}
          purchaseRemarks={orderForm.purchaseRemarks}
          setPurchaseRemarks={orderForm.setPurchaseRemarks}
          isProductSettingsConfirmed={orderForm.isProductSettingsConfirmed}
          isProcurementSettingsConfirmed={orderForm.isProcurementSettingsConfirmed}
        />

        {/* 批次管理對話框 */}
        <EnhancedBatchManagement
          isOpen={orderForm.isManagingBatches}
          onClose={() => orderForm.setIsManagingBatches(false)}
          orderItem={orderForm.getCurrentItem()}
          onUpdateBatches={(productPartNo, batches) => {
            // 更新指定產品的批次資料
            orderForm.setOrderItems((prevItems) =>
              prevItems.map((item) =>
                item.productPartNo === productPartNo ? { ...item, shipmentBatches: batches } : item,
              ),
            )
          }}
          getUnitMultiplier={orderForm.getUnitMultiplier}
        />
      </div>
    )
  },
)

NewOrderForm.displayName = "NewOrderForm"

export { NewOrderForm }
