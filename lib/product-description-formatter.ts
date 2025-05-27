interface ProductData {
  product_type?: string
  part_no: string
  component_name?: string
  order_requirements?: string
  customer_original_drawing?: string
  drawing_version?: string
  packaging_requirements?: string
}

export function formatProductDescription(productData: ProductData, orderId: string): string {
  const {
    product_type = "",
    part_no = "",
    component_name = "",
    order_requirements = "",
    customer_original_drawing = "",
    drawing_version = "",
    packaging_requirements = "",
  } = productData

  // 處理 order_requirements 中的 \n 換行符號
  const formattedOrderRequirements = order_requirements.replace(/\\n/g, "\n")

  // 組合圖紙資訊
  const drawingInfo =
    customer_original_drawing && drawing_version
      ? `${customer_original_drawing} + ${drawing_version}`
      : customer_original_drawing || drawing_version || ""

  // 生成標準格式描述
  const description = [
    product_type,
    "xxxxxxxxxxxxxxxxxx",
    "",
    `BSC CODE# ${part_no}`,
    `LOT NO. ${orderId}`,
    component_name,
    formattedOrderRequirements,
    drawingInfo ? `As per print ${drawingInfo}` : "",
    packaging_requirements,
  ]
    .filter((line) => line !== undefined)
    .join("\n")

  return description
}

export function parseProductDescription(description: string): {
  product_type: string
  part_no: string
  component_name: string
  order_requirements: string
  drawing_info: string
  packaging_requirements: string
} {
  const lines = description.split("\n")

  return {
    product_type: lines[0] || "",
    part_no: lines[3]?.replace("BSC CODE# ", "") || "",
    component_name: lines[5] || "",
    order_requirements: lines.slice(6, -2).join("\n") || "",
    drawing_info: lines[lines.length - 2]?.replace("As per print ", "") || "",
    packaging_requirements: lines[lines.length - 1] || "",
  }
}
