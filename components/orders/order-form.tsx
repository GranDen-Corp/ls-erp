"use client"

import type React from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"

interface OrderFormValues {
  customer_id: string
  order_date: string
  trade_terms: string
  payment_terms: string
  order_info: string // Expecting JSON string
}

const OrderForm: React.FC = () => {
  const initialValues: OrderFormValues = {
    customer_id: "",
    order_date: "",
    trade_terms: "",
    payment_terms: "",
    order_info: "{}",
  }

  const validationSchema = Yup.object().shape({
    customer_id: Yup.string().required("Customer ID is required"),
    order_date: Yup.string().required("Order Date is required"),
    trade_terms: Yup.string().required("Trade Terms are required"),
    payment_terms: Yup.string().required("Payment Terms are required"),
    order_info: Yup.string().test("is-json", "Order Info must be a valid JSON", (value) => {
      if (!value) return true // Allow empty string
      try {
        JSON.parse(value)
        return true
      } catch (e) {
        return false
      }
    }),
  })

  const handleSubmit = (
    values: OrderFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    try {
      const orderInfo = JSON.parse(values.order_info)
      // Handle form submission logic here, e.g., send data to an API
      console.log("Form values:", { ...values, order_info: orderInfo })
      setSubmitting(false)
    } catch (error) {
      console.error("Error parsing order_info:", error)
      alert("Invalid JSON in Order Info field.")
      setSubmitting(false)
    }
  }

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form>
          <div>
            <label htmlFor="customer_id">Customer ID:</label>
            <Field type="text" id="customer_id" name="customer_id" />
            <ErrorMessage name="customer_id" component="div" />
          </div>

          <div>
            <label htmlFor="order_date">Order Date:</label>
            <Field type="date" id="order_date" name="order_date" />
            <ErrorMessage name="order_date" component="div" />
          </div>

          <div>
            <label htmlFor="trade_terms">Trade Terms:</label>
            <Field type="text" id="trade_terms" name="trade_terms" />
            <ErrorMessage name="trade_terms" component="div" />
          </div>

          <div>
            <label htmlFor="payment_terms">Payment Terms:</label>
            <Field type="text" id="payment_terms" name="payment_terms" />
            <ErrorMessage name="payment_terms" component="div" />
          </div>

          <div>
            <label htmlFor="order_info">Order Info (JSON):</label>
            <Field as="textarea" id="order_info" name="order_info" />
            <ErrorMessage name="order_info" component="div" />
          </div>

          <button type="submit" disabled={isSubmitting}>
            Submit
          </button>
        </Form>
      )}
    </Formik>
  )
}

export default OrderForm
