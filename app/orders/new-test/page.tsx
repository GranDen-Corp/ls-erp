import { redirect } from "next/navigation"

export default function NewOrderTestRedirect() {
  redirect("/orders/new")
}
