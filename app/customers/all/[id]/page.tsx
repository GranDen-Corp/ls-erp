"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  payment_terms: string
}

const CustomerDetailPage = () => {
  const { id } = useParams()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/customers/${id}`)
        if (!res.ok) {
          throw new Error(`Failed to fetch customer: ${res.status} ${res.statusText}`)
        }
        const data = await res.json()

        setCustomer({
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          payment_terms: data.payment_terms || "",
        })
      } catch (e: any) {
        setError(e.message || "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCustomer()
    }
  }, [id])

  if (loading) {
    return <p>Loading customer details...</p>
  }

  if (error) {
    return <p>Error: {error}</p>
  }

  if (!customer) {
    return <p>Customer not found.</p>
  }

  return (
    <div>
      <h1>Customer Details</h1>
      <p>ID: {customer.id}</p>
      <p>Name: {customer.name}</p>
      <p>Email: {customer.email}</p>
      <p>Phone: {customer.phone}</p>
      <p>Address: {customer.address}</p>
      <p>Payment Terms: {customer.payment_terms || "-"}</p>
    </div>
  )
}

export default CustomerDetailPage
