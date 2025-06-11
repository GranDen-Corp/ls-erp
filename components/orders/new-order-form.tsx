"use client"

import { forwardRef, useImperativeHandle, useEffect, memo, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
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
import { useOrderForm } from "@/hooks/use-order-form"
import CustomerSelection from "./customer-selection"
import { ProductSelection } from "./product-selection"
import { EnhancedProductList } from "./enhanced-product-list"
import { ProductList } from "./product-list"
import { BatchManagement } from "./batch-management"
import { OrderInfo } from "./order-info"
import { ProcurementProductList } from "./procurement-product-list"
import { ProductProcurementInfo } from "./product-procurement-info"

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
const MemoizedProductProcurementInfo = memo(ProductProcurementInfo)

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

    // 準備列印報表的資料
    const preparePrintData = () => {
      const selectedCustomer = orderForm.customers.find((c) => c.customer_id === orderForm.selectedCustomerId)

      return {
        order_id: orderForm.useCustomOrderNumber ? orderForm.customOrderNumber : orderForm.orderNumber,
        po_id: orderForm.poNumber || "",
        customer_name: selectedCustomer?.customer_full_name || "未選擇客戶",
        customer_address: selectedCustomer?.customer_address || "",
        customer_contact: selectedCustomer?.customer_phone || "",
        order_date: new Date().toISOString(),
        delivery_date: orderForm.deliveryDate
          ? orderForm.deliveryDate.toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        payment_terms: orderForm.paymentTerms || "",
        trade_terms: orderForm.tradeTerms || "",
        remarks: orderForm.remarks || "",
        amount: orderForm.calculateTotal(),
        currency: orderForm.customerCurrency,
        order_info: orderForm.orderInfo || "",
        batch_items: (orderForm.orderItems || []).map((item) => ({
          part_no: item.productPartNo,
          description: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: orderForm.calculateItemTotal(item),
          unit: orderForm.getUnitDisplayName(item.unit),
        })),
      }
    }

    // 如果訂單尚未建立，只顯示基本資訊表單
    if (!orderForm.orderCreated) {
      return (
        <div className="space-y-6">
          <MemoizedCustomerSelection
            customers={orderForm.customers || []}
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
            isProductSettingsConfirmed={false}
            setOrderNumberStatus={orderForm.setOrderNumberStatus}
            setOrderNumberMessage={orderForm.setOrderNumberMessage}
            orderItems={[]}
            paymentTerms={orderForm.paymentTerms}
            setPaymentTerms={orderForm.setPaymentTerms}
            tradeTerms={orderForm.tradeTerms}
            setTradeTerms={orderForm.setTradeTerms}
            isLoadingOrderNumber={orderForm.isLoadingOrderNumber}
            generateNewOrderNumber={orderForm.generateNewOrderNumber}
            portOfLoading={orderForm.portOfLoading}
            setPortOfLoading={orderForm.setPortOfLoading}
            portOfDischarge={orderForm.portOfDischarge}
            setPortOfDischarge={orderForm.setPortOfDischarge}
            ports={orderForm.ports || []}
            onCreateOrder={orderForm.createInitialOrder}
            isCreatingOrder={orderForm.isCreatingOrder}
            orderCreated={orderForm.orderCreated}
            getPortDisplayName={orderForm.getPortDisplayName}
            deliveryDate={orderForm.deliveryDate}
            setDeliveryDate={orderForm.setDeliveryDate}
          />
        </div>
      )
    }

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
            orderItems={orderForm.orderItems || []}
            onProcurementDataChange={orderForm.handleProcurementDataChange}
            isCreatingPurchaseOrder={orderForm.isCreatingPurchaseOrder}
            orderId={createdOrderId || orderData?.order_id}
            readOnly={false}
            productUnits={orderForm.productUnits || []}
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
      console.log("前往設定採購資料 - 設置狀態")
      orderForm.setActiveTab("procurement")
      orderForm.setIsProcurementReady(true) // 確保設置採購準備狀態
      orderForm.setIsSplitView(true)
      console.log("採購狀態設置完成:", {
        activeTab: "procurement",
        isProcurementReady: true,
        orderItemsLength: (orderForm.orderItems || []).length,
      })
    }

    const handleGoToProducts = () => {
      orderForm.setActiveTab("products")
    }

    return (
      <div className="space-y-6">
        {/* 訂單已建立後的進度指示器 */}
        {orderForm.orderCreated && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <LucideCheckCircle className="h-5 w-5" />
                訂單已建立 - {orderForm.createdOrderId}
              </CardTitle>
              <CardDescription className="text-green-700">
                基本訂單資訊已保存，現在可以繼續添加產品和設定採購資料。
              </CardDescription>
            </CardHeader>
          </Card>
        )}

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
                      僅更新訂單內容
                    </Button>
                    <Button
                      onClick={() => onSubmit(true)}
                      disabled={
                        orderForm.isSubmitting ||
                        orderForm.isCreatingPurchaseOrder ||
                        !orderForm.isProcurementSettingsConfirmed
                      }
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
          customers={orderForm.customers || []}
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
          orderItems={orderForm.orderItems || []}
          paymentTerms={orderForm.paymentTerms}
          setPaymentTerms={orderForm.setPaymentTerms}
          tradeTerms={orderForm.tradeTerms}
          setTradeTerms={orderForm.setTradeTerms}
          isLoadingOrderNumber={orderForm.isLoadingOrderNumber}
          generateNewOrderNumber={orderForm.generateNewOrderNumber}
          portOfLoading={orderForm.portOfLoading}
          setPortOfLoading={orderForm.setPortOfLoading}
          portOfDischarge={orderForm.portOfDischarge}
          setPortOfDischarge={orderForm.setPortOfDischarge}
          ports={orderForm.ports || []}
          onCreateOrder={orderForm.createInitialOrder}
          isCreatingOrder={orderForm.isCreatingOrder}
          orderCreated={orderForm.orderCreated}
          getPortDisplayName={orderForm.getPortDisplayName}
          deliveryDate={orderForm.deliveryDate}
          setDeliveryDate={orderForm.setDeliveryDate}
        />

        {/* 產品設定區域 */}
        {orderForm.activeTab === "products" && (
          <div className="space-y-6">
            <MemoizedProductSelection
              regularProducts={orderForm.regularProducts || []}
              assemblyProducts={orderForm.assemblyProducts || []}
              selectedCustomerId={orderForm.selectedCustomerId}
              isProductSettingsConfirmed={orderForm.isProductSettingsConfirmed}
              productSelectionTab={orderForm.productSelectionTab}
              setProductSelectionTab={orderForm.setProductSelectionTab}
              productSearchTerm={orderForm.productSearchTerm}
              setProductSearchTerm={orderForm.setProductSearchTerm}
              selectedProducts={orderForm.selectedProducts || []}
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
              orderItems={orderForm.orderItems || []}
              handleItemChange={orderForm.handleItemChange}
              handleRemoveProduct={orderForm.handleRemoveProduct}
              calculateItemTotal={orderForm.calculateItemTotal}
              openBatchManagement={orderForm.openBatchManagement}
              customerCurrency={orderForm.customerCurrency}
              isProductSettingsConfirmed={orderForm.isProductSettingsConfirmed}
              handleClearAllProducts={orderForm.handleClearAllProducts}
              productUnits={orderForm.productUnits || []}
              exchangeRates={orderForm.exchangeRates || []}
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
                        {(orderForm.orderItems || []).length} 項產品
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
                    {(orderForm.orderItems || []).length > 0 && (
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
                    {(orderForm.orderItems || []).length > 0 && orderForm.isProductSettingsConfirmed && (
                      <Button onClick={handleGoToProcurement} className="gap-2" size="lg">
                        <LucideArrowRight className="h-5 w-5" />
                        前往設定採購資料
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 訂單資訊 - 在產品設定確認後顯示 */}
            <MemoizedOrderInfo
              remarks={orderForm.remarks}
              setRemarks={orderForm.setRemarks}
              orderItems={orderForm.orderItems || []}
              productProcurementInfo={orderForm.productProcurementInfo || {}}
              setProductProcurementInfo={orderForm.setProductProcurementInfo}
              isProductSettingsConfirmed={orderForm.isProductSettingsConfirmed}
              isProcurementSettingsConfirmed={orderForm.isProcurementSettingsConfirmed}
              disabled={false}
              orderId={orderForm.useCustomOrderNumber ? orderForm.customOrderNumber : orderForm.orderNumber}
              customerCurrency={orderForm.customerCurrency}
              getUnitDisplayName={orderForm.getUnitDisplayName}
              calculateItemTotal={orderForm.calculateItemTotal}
              orderData={preparePrintData()}
            />

            {/* 產品採購資訊 - 獨立區塊，在訂單資訊後方 */}
            <MemoizedProductProcurementInfo
              orderItems={orderForm.orderItems || []}
              productProcurementInfo={orderForm.productProcurementInfo || {}}
              setProductProcurementInfo={orderForm.setProductProcurementInfo}
              isProductSettingsConfirmed={orderForm.isProductSettingsConfirmed}
              isProcurementSettingsConfirmed={orderForm.isProcurementSettingsConfirmed}
              disabled={false}
            />
          </div>
        )}

        {/* 採購資料設定區域 */}
        {orderForm.activeTab === "procurement" && (
          <div className="space-y-6">
            {/* 返回產品設定按鈕 */}
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleGoToProducts} className="flex items-center gap-2">
                <LucideArrowLeft className="h-4 w-4" />
                返回產品設定
              </Button>
            </div>

            {/* 採購資料設定 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LucideClipboardList className="h-5 w-5" />
                    採購資料設定
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {(orderForm.orderItems || []).length} 項產品
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      總金額: {formatCurrencyAmount(orderForm.calculateTotal(), orderForm.customerCurrency)}
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription>請設定各產品的採購資料，包括供應商、價格、交期等資訊</CardDescription>
              </CardHeader>
              <CardContent>
                <ProcurementProductList
                  orderItems={orderForm.orderItems || []}
                  onProcurementDataChange={orderForm.handleProcurementDataChange}
                  customerCurrency={orderForm.customerCurrency}
                  productUnits={orderForm.productUnits || []}
                  getUnitMultiplier={orderForm.getUnitMultiplier}
                  disabled={orderForm.isProcurementSettingsConfirmed}
                />
              </CardContent>
            </Card>

            {/* 採購設定確認按鈕 */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-green-800">採購資料設定</h3>
                    <p className="text-sm text-green-700">
                      請確認所有採購產品的供應商、價格、交期等資訊無誤後，點擊確認按鈕完成設定。
                    </p>
                  </div>
                  <div className="flex gap-3">
                    {!orderForm.isProcurementSettingsConfirmed && (
                      <Button
                        onClick={orderForm.confirmProcurementSettings}
                        className="bg-green-600 hover:bg-green-700"
                        size="lg"
                      >
                        <LucideCheckCircle className="h-5 w-5 mr-2" />
                        確認採購設定完成
                      </Button>
                    )}
                    {orderForm.isProcurementSettingsConfirmed && (
                      <Button onClick={orderForm.confirmProcurementSettings} variant="outline" size="lg">
                        <LucideSettings className="h-5 w-5 mr-2" />
                        修改採購設定
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 最終提交按鈕 */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-blue-800">準備完成</h3>
                    <p className="text-sm text-blue-700">產品設定和採購設定都已完成，現在可以提交訂單並創建採購單。</p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => onSubmit(false)}
                      disabled={orderForm.isSubmitting}
                      variant="outline"
                      size="lg"
                    >
                      <LucideSave className="h-5 w-5 mr-2" />
                      僅更新訂單內容
                    </Button>
                    <Button
                      onClick={() => onSubmit(true)}
                      disabled={orderForm.isSubmitting || !orderForm.isProcurementSettingsConfirmed}
                      className="bg-purple-600 hover:bg-purple-700"
                      size="lg"
                    >
                      <LucideShoppingCart className="h-5 w-5 mr-2" />
                      建立訂單與採購單
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 在採購資料設定區域也顯示訂單資訊和產品採購資訊 */}
            <MemoizedOrderInfo
              remarks={orderForm.remarks}
              setRemarks={orderForm.setRemarks}
              orderItems={orderForm.orderItems || []}
              productProcurementInfo={orderForm.productProcurementInfo || {}}
              setProductProcurementInfo={orderForm.setProductProcurementInfo}
              isProductSettingsConfirmed={orderForm.isProductSettingsConfirmed}
              isProcurementSettingsConfirmed={orderForm.isProcurementSettingsConfirmed}
              disabled={false}
              orderId={orderForm.useCustomOrderNumber ? orderForm.customOrderNumber : orderForm.orderNumber}
              customerCurrency={orderForm.customerCurrency}
              getUnitDisplayName={orderForm.getUnitDisplayName}
              calculateItemTotal={orderForm.calculateItemTotal}
              orderData={preparePrintData()}
            />

            <MemoizedProductProcurementInfo
              orderItems={orderForm.orderItems || []}
              productProcurementInfo={orderForm.productProcurementInfo || {}}
              setProductProcurementInfo={orderForm.setProductProcurementInfo}
              isProductSettingsConfirmed={orderForm.isProductSettingsConfirmed}
              isProcurementSettingsConfirmed={orderForm.isProcurementSettingsConfirmed}
              disabled={false}
            />
          </div>
        )}
      </div>
    )
  },
)

NewOrderForm.displayName = "NewOrderForm"

export { NewOrderForm }
