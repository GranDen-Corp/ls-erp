import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const data = await request.json()

    // 準備要更新的資料
    const productData = {
      // 組合主鍵欄位 - 已修改，移除 factory_id 作為主鍵的一部分
      customer_id: data.customerName?.id || data.customer_id,
      part_no: data.partNo,
      factory_id: data.factoryName?.id || data.factory_id, // 仍然保留，但不再是主鍵的一部分

      // 基本資訊
      component_name: data.componentName,
      specification: data.specification,
      customs_code: data.customsCode,
      end_customer: data.endCustomer,
      product_type: data.productType,
      classification_code: data.classificationCode,
      vehicle_drawing_no: data.vehicleDrawingNo,
      customer_drawing_no: data.customerDrawingNo,
      product_period: data.productPeriod,
      description: data.description,
      status: data.status,
      created_date: data.createdDate || new Date().toISOString().split("T")[0],
      last_order_date: data.lastOrderDate,
      last_price: data.lastPrice,
      currency: data.currency,

      // 其他欄位保持不變
      specifications: data.specifications,
      sample_status: data.sampleStatus,
      sample_date: data.sampleDate,
      original_drawing_version: data.originalDrawingVersion,
      drawing_version: data.drawingVersion,
      customer_original_drawing: data.customerOriginalDrawing,
      jinzhan_drawing: data.jinzhanDrawing,
      customer_drawing: data.customerDrawing,
      factory_drawing: data.factoryDrawing,
      customer_drawing_version: data.customerDrawingVersion,
      factory_drawing_version: data.factoryDrawingVersion,
      images: data.images,
      is_assembly: data.isAssembly,
      components: data.components,
      assembly_time: data.assemblyTime,
      assembly_cost_per_hour: data.assemblyCostPerHour,
      additional_costs: data.additionalCosts,
      important_documents: data.importantDocuments,
      part_management: data.partManagement,
      compliance_status: data.complianceStatus,
      edit_notes: data.editNotes,
      process_data: data.processData,
      order_requirements: data.orderRequirements,
      purchase_requirements: data.purchaseRequirements,
      special_requirements: data.specialRequirements,
      process_notes: data.processNotes,
      has_mold: data.hasMold,
      mold_cost: data.moldCost,
      refundable_mold_quantity: data.refundableMoldQuantity,
      mold_returned: data.moldReturned,
      accounting_note: data.accountingNote,
      quality_notes: data.qualityNotes,
      order_history: data.orderHistory,
      resume_notes: data.resumeNotes,
      moq: data.moq,
      lead_time: data.leadTime,
      packaging_requirements: data.packagingRequirements,

      // 組合產品相關欄位
      sub_part_no: data.isCompositeProduct ? data.selectedComponents : null,
    }

    // 使用 upsert 方法，如果記錄已存在則更新，否則插入新記錄
    // 修改 onConflict 參數，移除 factory_id
    const { data: result, error } = await supabase.from("products").upsert(productData, {
      onConflict: "customer_id,part_no",
      returning: "minimal",
    })

    if (error) {
      console.error("更新產品時出錯:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("處理請求時出錯:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "更新產品時出錯" },
      { status: 500 },
    )
  }
}
