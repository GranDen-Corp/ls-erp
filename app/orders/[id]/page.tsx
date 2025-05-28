import type { Metadata } from "next"
import OrderPageClient from "./OrderPageClient"

export const metadata: Metadata = {
  title: "訂單詳情",
  description: "查看和管理訂單詳情",
}

export default async function OrderPage({
  params,
}: {
  params: { id: string }
}) {
  return <OrderPageClient params={params} />
}
