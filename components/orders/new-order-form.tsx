"use client"

import { forwardRef, useImperativeHandle, useEffect, memo } from "react"
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
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ProcurementDataEditor } from "@/components/orders/procurement-data-editor"
import { formatCurrencyAmount } from "@/lib/currency-utils"
import { OrderValidation } from "@/components/orders/order-validation"
import { useOrderForm } from "@/hooks/use-order-form"
import { CustomerSelection } from "./customer-selection"
import { ProductSelection } from "./product-selection"
import { ProductList } from "./product-list"
import { BatchManagement } from "./batch-management"
import { OrderInfo } from "./order-info"

interface Customer {
  id: string
  customer_id?: string
  name?: string
  customer_name?: string
  customer_full_name?: string
  customer_short_name?: string
  payment_term?: string
  delivery_terms?: string
  packing_condition?: string
  qty_allowance_percent?: string
  forwarder_agent?: string
  shipping_agent?: string
  sales_representative?: string
  sales_email?: string
  [key: string]: any
}

interface Product {
  id: string
  part_no: string
  component_name?: string
  description?: string
  is_assembly?: boolean
  customer_id?: string
  unit_price?: number
  last_price?: number
  sub_part_no?: any
  factory_id?: string
  currency?: string
  customs_code?: string
  order_requirements?: string
  customer_drawing?: {
    filename?: string
    path?: string
  }
  customer_drawing_version?: string
  specification?: string
  [key: string]: any
}

interface ShipmentBatch {
  id: string
  productPartNo: string // 關聯的產品編號
  batchNumber: number
  plannedShipDate: Date | undefined
  quantity: number // 批次數量
  notes?: string
  status?: string // 批次狀態
  trackingNumber?: string // 追蹤號碼
  actualShipDate?: Date // 實際出貨日期
  estimatedArrivalDate?: Date // 預計到達日期
  customsInfo?: {
    clearanceDate?: Date
    customsNumber?: string
    customsFees?: number
  } // 海關資訊
}

interface OrderItem {
  id: string
  productKey: string // 使用 customer_id + part_no 作為唯一標識
  productName: string
  productPartNo: string
  quantity: number
  unitPrice: number
  isAssembly: boolean
  shipmentBatches: ShipmentBatch[] // 每個產品的批次列表
  specifications?: string // 產品規格
  remarks?: string // 產品備註
  currency: string // 貨幣
  discount?: number // 折扣
  taxRate?: number // 稅率
  product?: Product // 產品完整資料
}

interface NewOrderFormProps {
  onSubmit: (createPurchaseOrder?: boolean) => void
  createdOrderId?: string
  currentStep?: number
  orderData?: any
}

// Memoize child components to prevent unnecessary re-renders
const MemoizedCustomerSelection = memo(CustomerSelection)
const MemoizedProductSelection = memo(ProductSelection)
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
    ) // Add orderForm as a dependency

    // 當步驟變更時，更新UI - only run when currentStep changes
    useEffect(() => {
      if (currentStep === 1) {
        orderForm.setActiveTab("procurement")
      }
    }, [currentStep, orderForm])

    // 當訂單數據變更時，更新表單 - only run when orderData or currentStep changes
    useEffect(() => {
      if (orderData) {
        // 如果有訂單數據，則禁用編輯
        if (currentStep === 1) {
          // 在採購步驟中，只需要確保採購資料已準備好
          orderForm.setIsProcurementReady(true)
        }
      }
    }, [orderData, currentStep, orderForm])

    // 根據當前步驟渲染不同的內容
    if (currentStep === 1) {
      // 採購資料確認步驟
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h3 className="text-lg font-medium text-blue-800 mb-2">訂單已成功建立</h3>
            <p className="text-blue-700">
              訂單編號: <span className="font-semibold">{createdOrderId || orderData?.order_id}</span>
            </p>
            <p className="text-blue-700 mt-1">請確認以下採購資料，並點擊「創建採購單」按鈕完成採購單創建。</p>
          </div>

          <ProcurementDataEditor
            orderItems={orderForm.orderItems}
            onProcurementDataChange={orderForm.handleProcurementDataChange}
            isCreatingPurchaseOrder={orderForm.isCreatingPurchaseOrder}
            orderId={createdOrderId || orderData?.order_id}
            readOnly={false}
          />
        </div>
      )
    }

    if (orderForm.loading) {
      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-center text-muted-foreground">正在載入客戶和產品資料...</p>
        </div>
      )
    }

    if (orderForm.error) {
      return (
        <Alert variant="destructive">
          <LucideAlertCircle className="h-4 w-4" />
          <AlertTitle>錯誤</AlertTitle>
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
        {/* 工作流程控制按鈕 */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            {orderForm.activeTab === "products" ? "產品選擇與設定" : "採購資料設定"}
          </h3>
          <div className="flex gap-2">
            {orderForm.activeTab === "procurement" && (
              <Button variant="outline" size="sm" onClick={handleGoToProducts} className="flex items-center">
                <LucideArrowLeft className="h-4 w-4 mr-2" />
                返回產品設定
              </Button>
            )}
            {orderForm.isProductSettingsConfirmed && orderForm.isProcurementSettingsConfirmed && (
              <>
                <Button
                  onClick={() => onSubmit(false)}
                  disabled={orderForm.isSubmitting || orderForm.isCreatingPurchaseOrder}
                  variant="outline"
                >
                  <LucideSave className="h-4 w-4 mr-2" />
                  僅建立訂單
                </Button>
                <Button
                  onClick={() => onSubmit(true)}
                  disabled={orderForm.isSubmitting || orderForm.isCreatingPurchaseOrder}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <LucideShoppingCart className="h-4 w-4 mr-2" />
                  儲存並同時建立訂單與採購單
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 基本訂單資訊區域 */}
        <MemoizedCustomerSelection
          customers={orderForm.customers}
          selectedCustomerId={orderForm.selectedCustomerId}
          setSelectedCustomerId={orderForm.setSelectedCustomerId}
          poNumber={orderForm.poNumber}
          setPoNumber={orderForm.setPoNumber}
          paymentTerm={orderForm.paymentTerm}
          setPaymentTerm={orderForm.setPaymentTerm}
          deliveryTerms={orderForm.deliveryTerms}
          setDeliveryTerms={orderForm.setDeliveryTerms}
          orderNumber={orderForm.orderNumber}
          isLoadingOrderNumber={orderForm.isLoadingOrderNumber}
          customOrderNumber={orderForm.customOrderNumber}
          setCustomOrderNumber={orderForm.setCustomOrderNumber}
          useCustomOrderNumber={orderForm.useCustomOrderNumber}
          setUseCustomOrderNumber={orderForm.setUseCustomOrderNumber}
          isCheckingOrderNumber={orderForm.isCheckingOrderNumber}
          orderNumberStatus={orderForm.orderNumberStatus}
          orderNumberMessage={orderForm.orderNumberMessage}
          checkOrderNumberDuplicate={orderForm.checkOrderNumberDuplicate}
          isProductSettingsConfirmed={orderForm.isProductSettingsConfirmed}
          isProcurementSettingsConfirmed={orderForm.isProcurementSettingsConfirmed}
          getCustomerName={orderForm.getCustomerName}
          setOrderNumberStatus={orderForm.setOrderNumberStatus}
          setOrderNumberMessage={orderForm.setOrderNumberMessage}
        />

        <Separator />

        {/* 產品設定區域 */}
        {orderForm.activeTab === "products" && (
          <div className="space-y-4">
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
              isProductAdded={orderForm.isProductAdded}
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

            <MemoizedProductList
              orderItems={orderForm.orderItems}
              handleItemChange={orderForm.handleItemChange}
              handleRemoveProduct={orderForm.handleRemoveProduct}
              calculateItemTotal={orderForm.calculateItemTotal}
              openBatchManagement={orderForm.openBatchManagement}
              customerCurrency={orderForm.customerCurrency}
              isProductSettingsConfirmed={orderForm.isProductSettingsConfirmed}
            />

            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-md border">
              <div className="space-y-2">
                <div className="flex justify-between gap-8">
                  <span className="text-muted-foreground">小計:</span>
                  <span className="font-medium">
                    {formatCurrencyAmount(orderForm.calculateTotal(), orderForm.customerCurrency)}
                  </span>
                </div>
                <div className="flex justify-between gap-8">
                  <span className="font-medium">總計:</span>
                  <span className="font-bold text-lg">
                    {formatCurrencyAmount(orderForm.calculateTotal(), orderForm.customerCurrency)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {orderForm.orderItems.length > 0 && (
                  <Button
                    onClick={orderForm.confirmProductsReady}
                    variant={orderForm.isProductSettingsConfirmed ? "outline" : "default"}
                  >
                    {orderForm.isProductSettingsConfirmed ? (
                      <>
                        <LucideSettings className="h-4 w-4 mr-2" />
                        修改產品設定
                      </>
                    ) : (
                      <>
                        <LucideCheckCircle className="h-4 w-4 mr-2" />
                        確認產品設定完成
                      </>
                    )}
                  </Button>
                )}
                {orderForm.orderItems.length > 0 && (
                  <Button
                    onClick={handleGoToProcurement}
                    disabled={!orderForm.isProductSettingsConfirmed}
                    className="gap-2"
                  >
                    <LucideArrowRight className="h-4 w-4" />
                    前往設定採購資料
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 採購資料設定區域 */}
        {orderForm.activeTab === "procurement" && (
          <div className="space-y-6">
            {/* 訂單摘要卡片 */}
            <div className="bg-white border rounded-md p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h4 className="font-medium text-lg">訂單產品摘要</h4>
                  <p className="text-muted-foreground text-sm">請確認以下產品資料，再進行採購設定</p>
                </div>
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {orderForm.orderItems.length} 項產品
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    總金額: {formatCurrencyAmount(orderForm.calculateTotal(), orderForm.customerCurrency)}
                  </Badge>
                </div>
              </div>

              {/* 產品資料表格 - 響應式設計 */}
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">產品編號</TableHead>
                      <TableHead>產品名稱</TableHead>
                      <TableHead className="text-center w-[80px]">數量</TableHead>
                      <TableHead className="text-right w-[100px]">單價</TableHead>
                      <TableHead className="text-right w-[100px]">金額 (USD)</TableHead>
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
                          {formatCurrencyAmount(orderForm.calculateItemTotal(item), orderForm.customerCurrency)}
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
            />
            {orderForm.activeTab === "procurement" && orderForm.isProcurementSettingsConfirmed && (
              <OrderValidation
                orderItems={orderForm.orderItems}
                procurementItems={orderForm.procurementItems}
                customerCurrency={orderForm.customerCurrency}
              />
            )}
          </div>
        )}

        <Separator />

        {/* 訂單資訊和備註 - 始終顯示在頁面底部 */}
        <MemoizedOrderInfo
          orderInfo={orderForm.orderInfo}
          setOrderInfo={orderForm.setOrderInfo}
          remarks={orderForm.remarks}
          setRemarks={orderForm.setRemarks}
          isProductSettingsConfirmed={orderForm.isProductSettingsConfirmed}
          isProcurementSettingsConfirmed={orderForm.isProcurementSettingsConfirmed}
        />

        {/* 批次管理對話框 */}
        <MemoizedBatchManagement
          isManagingBatches={orderForm.isManagingBatches}
          setIsManagingBatches={orderForm.setIsManagingBatches}
          currentManagingProductPartNo={orderForm.currentManagingProductPartNo}
          batchManagementTab={orderForm.batchManagementTab}
          setBatchManagementTab={orderForm.setBatchManagementTab}
          getCurrentItem={orderForm.getCurrentItem}
          getCurrentBatches={orderForm.getCurrentBatches}
          addBatch={orderForm.addBatch}
          removeBatch={orderForm.removeBatch}
          updateBatch={orderForm.updateBatch}
          calculateAllocatedQuantity={orderForm.calculateAllocatedQuantity}
          calculateRemainingQuantity={orderForm.calculateRemainingQuantity}
        />
      </div>
    )
  },
)

NewOrderForm.displayName = "NewOrderForm"

export { NewOrderForm }
