"use server"

import { createServerSupabaseClient } from "@/lib/supabase-client"
import { revalidatePath } from "next/cache"

export async function saveProduct(formData: any) {
  try {
    const supabase = createServerSupabaseClient()

    // 準備要插入的資料
    const productData = {
      // 組合主鍵欄位 - 已修改，移除 factory_id 作為主鍵的一部分
      customer_id: formData.customerName.id,
      part_no: formData.partNo,
      factory_id: formData.factoryName.id, // 仍然保留，但不再是主鍵的一部分

      // 其他欄位保持不變
      component_name: formData.componentName,
      specification: formData.specification,
      customs_code: formData.customsCode,
      end_customer: formData.endCustomer,
      product_type: formData.productType,
      classification_code: formData.classificationCode,
      vehicle_drawing_no: formData.vehicleDrawingNo,
      customer_drawing_no: formData.customerDrawingNo,
      product_period: formData.productPeriod,
      description: formData.description,
      status: formData.status,
      created_date: formData.createdDate || new Date().toISOString().split("T")[0],
      last_order_date: formData.lastOrderDate,
      last_price: formData.lastPrice,
      currency: formData.currency,
      specifications: formData.specifications,
      sample_status: formData.sampleStatus,
      sample_date: formData.sampleDate,
      original_drawing_version: formData.originalDrawingVersion,
      drawing_version: formData.drawingVersion,
      customer_original_drawing: formData.customerOriginalDrawing,
      jinzhan_drawing: formData.jinzhanDrawing,
      customer_drawing: formData.customerDrawing,
      factory_drawing: formData.factoryDrawing,
      customer_drawing_version: formData.customerDrawingVersion,
      factory_drawing_version: formData.factoryDrawingVersion,
      images: formData.images,
      is_assembly: formData.isAssembly,
      components: formData.components,
      assembly_time: formData.assemblyTime,
      assembly_cost_per_hour: formData.assemblyCostPerHour,
      additional_costs: formData.additionalCosts,
      important_documents: formData.importantDocuments,
      part_management: formData.partManagement,
      compliance_status: formData.complianceStatus,
      edit_notes: formData.editNotes,
      process_data: formData.processData,
      order_requirements: formData.orderRequirements,
      purchase_requirements: formData.purchaseRequirements,
      special_requirements: formData.specialRequirements,
      process_notes: formData.processNotes,
      has_mold: formData.hasMold,
      mold_cost: formData.moldCost,
      refundable_mold_quantity: formData.refundableMoldQuantity,
      mold_returned: formData.moldReturned,
      accounting_note: formData.accountingNote,
      quality_notes: formData.qualityNotes,
      order_history: formData.orderHistory,
      resume_notes: formData.resumeNotes,
      moq: formData.moq,
      lead_time: formData.leadTime,
      packaging_requirements: formData.packagingRequirements,
    }

    // 使用 upsert 方法，如果記錄已存在則更新，否則插入新記錄
    // 修改 onConflict 參數，移除 factory_id
    const { data, error } = await supabase.from("products").upsert(productData, {
      onConflict: "customer_id,part_no",
      returning: "minimal",
    })

    if (error) {
      console.error("保存產品時出錯:", error)
      return { success: false, error: error.message }
    }

    // 重新驗證路徑以更新資料
    revalidatePath("/products/all")
    revalidatePath("/products")

    return { success: true, data }
  } catch (error) {
    console.error("保存產品時出錯:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "保存產品時出錯",
    }
  }
}
