"use server"

import { createServerSupabaseClient } from "@/lib/supabase-client"
import { revalidatePath } from "next/cache"

export async function initLocksureData() {
  try {
    const supabase = createServerSupabaseClient()

    // 清除現有訂單和採購單資料
    await supabase.from("purchases").delete().neq("id", "0")
    await supabase.from("orders").delete().neq("id", "0")

    // 創建新的訂單資料
    const orders = []
    const customers = await supabase.from("customers").select("id, name").limit(10)

    if (customers.error) throw customers.error

    // 創建20筆訂單資料
    for (let i = 1; i <= 20; i++) {
      const randomCustomer = customers.data[Math.floor(Math.random() * customers.data.length)]
      const orderDate = new Date()
      orderDate.setDate(orderDate.getDate() - i)

      const statusOptions = ["待確認", "進行中", "驗貨完成", "已出貨", "結案"]
      const status = statusOptions[i % 5]

      const productOptions = [
        `特殊冷成型零件 x ${Math.floor(Math.random() * 1000 + 100)}`,
        `汽車緊固件 x ${Math.floor(Math.random() * 500 + 50)}`,
        `特殊沖壓零件 x ${Math.floor(Math.random() * 2000 + 200)}`,
        `組裝零件 x ${Math.floor(Math.random() * 300 + 30)}`,
      ]
      const products = productOptions[i % 4]

      const amount = Number.parseFloat((Math.random() * 50000 + 5000).toFixed(2))

      const orderNumber = `ORD-${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, "0")}${String(orderDate.getDate()).padStart(2, "0")}-${String(i).padStart(3, "0")}`
      const poNumber = `PO-${randomCustomer.name.substring(0, 2)}-${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, "0")}${String(orderDate.getDate()).padStart(2, "0")}-${String(i * 3).padStart(3, "0")}`

      orders.push({
        order_number: orderNumber,
        customer_id: randomCustomer.id,
        po_number: poNumber,
        amount,
        status,
        order_date: orderDate.toISOString().split("T")[0],
        products,
        currency: "USD",
      })
    }

    const { data: ordersData, error: ordersError } = await supabase.from("orders").insert(orders).select()

    if (ordersError) throw ordersError

    // 創建採購單資料
    const purchases = []
    const factories = await supabase.from("factories").select("factory_id, factory_name").limit(10)

    if (factories.error) throw factories.error

    // 創建15筆採購單資料
    for (let i = 1; i <= 15; i++) {
      const randomFactory = factories.data[Math.floor(Math.random() * factories.data.length)]
      const randomOrder = ordersData[Math.floor(Math.random() * ordersData.length)]

      const poDate = new Date()
      poDate.setDate(poDate.getDate() - i)

      const statusOptions = ["待確認", "進行中", "已完成"]
      const status = statusOptions[i % 3]

      const productOptions = [
        `特殊冷成型零件 x ${Math.floor(Math.random() * 1000 + 100)}`,
        `汽車緊固件 x ${Math.floor(Math.random() * 500 + 50)}`,
        `特殊沖壓零件 x ${Math.floor(Math.random() * 2000 + 200)}`,
        `組裝零件 x ${Math.floor(Math.random() * 300 + 30)}`,
      ]
      const products = productOptions[i % 4]

      const amount = Number.parseFloat((Math.random() * 40000 + 4000).toFixed(2))

      const poNumber = `PO-${poDate.getFullYear()}${String(poDate.getMonth() + 1).padStart(2, "0")}${String(poDate.getDate()).padStart(2, "0")}-${String(i).padStart(3, "0")}`

      let productImages
      if (products.includes("特殊冷成型零件")) {
        productImages = [{ id: "1", url: "/hex-bolt.png", alt: "特殊冷成型零件", isThumbnail: true }]
      } else if (products.includes("汽車緊固件")) {
        productImages = [{ id: "2", url: "/socket-head-cap-screw.png", alt: "汽車緊固件", isThumbnail: true }]
      } else if (products.includes("特殊沖壓零件")) {
        productImages = [{ id: "3", url: "/ball-bearing.png", alt: "特殊沖壓零件", isThumbnail: true }]
      } else {
        productImages = [{ id: "4", url: "/tapered-roller-bearing.png", alt: "組裝零件", isThumbnail: true }]
      }

      purchases.push({
        po_number: poNumber,
        factory_id: randomFactory.factory_id,
        order_id: randomOrder.id,
        amount,
        status,
        po_date: poDate.toISOString().split("T")[0],
        products,
        currency: "USD",
        product_images: productImages,
      })
    }

    const { error: purchasesError } = await supabase.from("purchases").insert(purchases)

    if (purchasesError) throw purchasesError

    // 更新訂單的關聯採購單
    const { data: allPurchases, error: fetchPurchasesError } = await supabase.from("purchases").select("id, order_id")

    if (fetchPurchasesError) throw fetchPurchasesError

    // 按訂單ID分組採購單
    const purchasesByOrderId = allPurchases.reduce((acc, purchase) => {
      if (!acc[purchase.order_id]) {
        acc[purchase.order_id] = []
      }
      acc[purchase.order_id].push(purchase.id)
      return acc
    }, {})

    // 更新每個訂單的關聯採購單
    for (const [orderId, purchaseIds] of Object.entries(purchasesByOrderId)) {
      const { error: updateOrderError } = await supabase
        .from("orders")
        .update({ related_purchase_ids: purchaseIds })
        .eq("id", orderId)

      if (updateOrderError) throw updateOrderError
    }

    // 重新驗證路徑以更新資料
    revalidatePath("/orders")
    revalidatePath("/purchases")

    return { success: true, message: "已成功初始化Locksure公司相關的訂單和採購單資料" }
  } catch (error) {
    console.error("初始化Locksure資料時出錯:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "初始化Locksure資料時出錯",
    }
  }
}
