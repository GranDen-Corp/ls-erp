import { redirect } from "next/navigation"

export default function RedirectToAllProductsEdit({ params }: { params: { id: string } }) {
  const productId = params.id
  redirect(`/products/all/${encodeURIComponent(productId)}/edit`)
}
