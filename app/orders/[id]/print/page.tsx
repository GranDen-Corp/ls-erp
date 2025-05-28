import type { Metadata } from "next"
import OrderPrintPage from "./OrderPrintPage"

export const metadata: Metadata = {
  title: "列印訂單",
  description: "列印訂單報表",
}

export default function PrintPage({
  params,
}: {
  params: { id: string }
}) {
  return <OrderPrintPage orderId={params.id} />
}
