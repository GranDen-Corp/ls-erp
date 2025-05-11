// 訂單狀態自動更新服務

import { EventEmitter } from "events"

// 訂單狀態事件發射器
export const orderStatusEventEmitter = new EventEmitter()

// 訂單狀態事件類型
export enum OrderStatusEventType {
  QC_PASSED = "qc_passed",
  SHIPMENT_CREATED = "shipment_created",
  INVOICE_CREATED = "invoice_created",
  PAYMENT_RECEIVED = "payment_received",
  DAYS_PASSED = "days_passed",
}

// 訂單狀態事件接口
export interface OrderStatusEvent {
  type: OrderStatusEventType
  orderId: string
  data?: any
}

// 訂單狀態更新接口
export interface OrderStatusUpdate {
  orderId: string
  fromStatus: string
  toStatus: string
  reason: string
  updatedBy: string
  updatedAt: Date
}

// 訂單狀態服務
export class OrderStatusService {
  // 註冊事件監聽器
  static registerEventListeners() {
    // 品檢通過事件
    orderStatusEventEmitter.on(OrderStatusEventType.QC_PASSED, (event: OrderStatusEvent) => {
      console.log(`訂單 ${event.orderId} 品檢通過，準備更新狀態`)
      // 在實際應用中，這裡會查詢數據庫獲取訂單當前狀態和適用的流程規則
      // 然後根據規則更新訂單狀態
      OrderStatusService.updateOrderStatus({
        orderId: event.orderId,
        fromStatus: "進行中",
        toStatus: "驗貨完成",
        reason: "品檢通過自動更新",
        updatedBy: "system",
        updatedAt: new Date(),
      })
    })

    // 創建出貨單事件
    orderStatusEventEmitter.on(OrderStatusEventType.SHIPMENT_CREATED, (event: OrderStatusEvent) => {
      console.log(`訂單 ${event.orderId} 創建出貨單，準備更新狀態`)
      OrderStatusService.updateOrderStatus({
        orderId: event.orderId,
        fromStatus: "驗貨完成",
        toStatus: "已出貨",
        reason: "創建出貨單自動更新",
        updatedBy: "system",
        updatedAt: new Date(),
      })
    })

    // 創建發票事件
    orderStatusEventEmitter.on(OrderStatusEventType.INVOICE_CREATED, (event: OrderStatusEvent) => {
      console.log(`訂單 ${event.orderId} 創建發票，準備更新狀態`)
      OrderStatusService.updateOrderStatus({
        orderId: event.orderId,
        fromStatus: "已出貨",
        toStatus: "待收款",
        reason: "創建發票自動更新",
        updatedBy: "system",
        updatedAt: new Date(),
      })
    })

    // 收到付款事件
    orderStatusEventEmitter.on(OrderStatusEventType.PAYMENT_RECEIVED, (event: OrderStatusEvent) => {
      console.log(`訂單 ${event.orderId} 收到付款，準備更新狀態`)
      OrderStatusService.updateOrderStatus({
        orderId: event.orderId,
        fromStatus: "待收款",
        toStatus: "結案",
        reason: "收到付款自動更新",
        updatedBy: "system",
        updatedAt: new Date(),
      })
    })

    // 天數經過事件
    orderStatusEventEmitter.on(OrderStatusEventType.DAYS_PASSED, (event: OrderStatusEvent) => {
      console.log(`訂單 ${event.orderId} 在當前狀態超過指定天數，準備檢查是否需要更新`)
      // 在實際應用中，這裡會根據訂單當前狀態和天數規則決定是否更新狀態
    })
  }

  // 更新訂單狀態
  static async updateOrderStatus(update: OrderStatusUpdate): Promise<boolean> {
    try {
      console.log(`更新訂單 ${update.orderId} 狀態：${update.fromStatus} -> ${update.toStatus}`)

      // 在實際應用中，這裡會調用數據庫API更新訂單狀態
      // 例如：await db.orders.update({ id: update.orderId }, { status: update.toStatus })

      // 記錄狀態變更歷史
      await OrderStatusService.recordStatusHistory(update)

      // 發送通知
      await OrderStatusService.sendStatusChangeNotifications(update)

      return true
    } catch (error) {
      console.error(`更新訂單狀態失敗：`, error)
      return false
    }
  }

  // 記錄狀態變更歷史
  static async recordStatusHistory(update: OrderStatusUpdate): Promise<void> {
    console.log(`記錄訂單 ${update.orderId} 狀態變更歷史`)
    // 在實際應用中，這裡會將狀態變更記錄到數據庫中
    // 例如：await db.orderStatusHistory.create({ ...update })
  }

  // 發送狀態變更通知
  static async sendStatusChangeNotifications(update: OrderStatusUpdate): Promise<void> {
    console.log(`發送訂單 ${update.orderId} 狀態變更通知`)
    // 在實際應用中，這裡會根據通知設定發送郵件或系統內通知
    // 例如：await notificationService.send({ type: 'order_status_changed', data: update })
  }

  // 觸發訂單狀態事件
  static triggerEvent(event: OrderStatusEvent): void {
    orderStatusEventEmitter.emit(event.type, event)
  }
}

// 初始化訂單狀態服務
export function initOrderStatusService() {
  OrderStatusService.registerEventListeners()
  console.log("訂單狀態自動更新服務已初始化")
}
