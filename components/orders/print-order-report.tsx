"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Printer, Eye } from "lucide-react"

interface OrderData {
  order_id: string
  po_id: string
  customer_name: string
  customer_address?: string
  customer_contact?: string
  order_date: string
  delivery_date: string
  payment_terms: string // 更新欄位名稱
  trade_terms: string // 更新欄位名稱
  remarks?: string
  amount: number
  currency: string
  order_info?: Record<string, any> // 新增 jsonb 欄位
  batch_items?: Array<{
    part_no: string
    description: string
    quantity: number
    unit_price: number
    total_price: number
    unit: string
  }>
}

interface PrintOrderReportProps {
  orderData: OrderData
  trigger?: React.ReactNode
}

export function PrintOrderReport({ orderData, trigger }: PrintOrderReportProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(generatePrintHTML())
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const calculateTotal = () => {
    return (
      orderData.batch_items?.reduce((sum, item) => sum + (item.total_price || item.quantity * item.unit_price), 0) || 0
    )
  }

  const generatePrintHTML = () => {
    const currentDate = formatDate(new Date().toISOString())
    const total = calculateTotal()

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Sales Confirmation - ${orderData.order_id}</title>
    <style>
        @page {
            size: A4;
            margin: 20mm;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            margin: 0;
            padding: 0;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
        }
        
        .company-info {
            flex: 1;
        }
        
        .company-info h1 {
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 5px 0;
            color: #000;
        }
        
        .company-info p {
            margin: 2px 0;
            font-size: 11px;
        }
        
        .document-title {
            text-align: center;
            flex: 1;
        }
        
        .document-title h2 {
            font-size: 20px;
            font-weight: bold;
            margin: 0;
            text-decoration: underline;
        }
        
        .reference-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 20px;
        }
        
        .ref-section h3 {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            text-decoration: underline;
        }
        
        .ref-item {
            margin-bottom: 5px;
        }
        
        .ref-label {
            font-weight: bold;
            display: inline-block;
            width: 80px;
        }
        
        .customer-section {
            margin-bottom: 20px;
        }
        
        .customer-section h3 {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .products-table th,
        .products-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }
        
        .products-table th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
        }
        
        .products-table .text-right {
            text-align: right;
        }
        
        .products-table .text-center {
            text-align: center;
        }
        
        .total-row {
            font-weight: bold;
            background-color: #f9f9f9;
        }
        
        .remarks-section {
            margin-top: 20px;
        }
        
        .remarks-section h3 {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
            margin-top: 40px;
        }
        
        .signature-box {
            text-align: center;
        }
        
        .signature-line {
            border-top: 1px solid #000;
            margin-top: 50px;
            padding-top: 5px;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        @media print {
            body { -webkit-print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <h1>LOCKSURE INC.</h1>
            <p>8F., No.456, Trade Road, Xinyi Dist.</p>
            <p>Taipei City 110, Taiwan (R.O.C.)</p>
            <p>TEL: +886-2-8765-4321</p>
            <p>FAX: +886-2-8765-4322</p>
            <p>Email: info@locksure.com.tw</p>
            <p>VAT: 12345678</p>
        </div>
        
        <div class="document-title">
            <h2>SALES CONFIRMATION</h2>
            <p style="margin-top: 10px;">******************</p>
        </div>
    </div>
    
    <div class="reference-info">
        <div class="ref-section">
            <div class="ref-item">
                <span class="ref-label">Our Ref.:</span>
                <span>${orderData.order_id}</span>
            </div>
            <div class="ref-item">
                <span class="ref-label">Your Ref.:</span>
                <span>${orderData.po_id || "N/A"}</span>
            </div>
            <div class="ref-item">
                <span class="ref-label">Date:</span>
                <span>${currentDate}</span>
            </div>
        </div>
        
        <div class="customer-section">
            <h3>Messrs.:</h3>
            <p><strong>${orderData.customer_name}</strong></p>
            ${orderData.customer_address ? `<p>${orderData.customer_address}</p>` : ""}
            ${orderData.customer_contact ? `<p>Contact: ${orderData.customer_contact}</p>` : ""}
        </div>
    </div>
    
    <table class="products-table">
        <thead>
            <tr>
                <th style="width: 20%;">Part No.</th>
                <th style="width: 35%;">Description</th>
                <th style="width: 15%;">Quantity</th>
                <th style="width: 15%;">Unit Price</th>
                <th style="width: 15%;">Amount</th>
            </tr>
        </thead>
        <tbody>
            ${
              orderData.batch_items
                ?.map(
                  (item) => `
                <tr>
                    <td><strong>${item.part_no}</strong></td>
                    <td>${item.description}</td>
                    <td class="text-right">${item.quantity.toLocaleString()} ${item.unit || "PCS"}</td>
                    <td class="text-right">${formatCurrency(item.unit_price, orderData.currency)}</td>
                    <td class="text-right">${formatCurrency(item.total_price || item.quantity * item.unit_price, orderData.currency)}</td>
                </tr>
            `,
                )
                .join("") || ""
            }
            <tr class="total-row">
                <td colspan="4" class="text-right"><strong>Total:</strong></td>
                <td class="text-right"><strong>${formatCurrency(total, orderData.currency)}</strong></td>
            </tr>
        </tbody>
    </table>
    
    ${
      orderData.remarks
        ? `
    <div class="remarks-section">
        <h3>Remarks:</h3>
        <div style="white-space: pre-line; border: 1px solid #ccc; padding: 10px; background-color: #f9f9f9;">
${orderData.remarks}
        </div>
    </div>
    `
        : ""
    }
    
    ${
      orderData.order_info && Object.keys(orderData.order_info).length > 0
        ? `
    <div class="remarks-section">
        <h3>Order Information:</h3>
        <div style="border: 1px solid #ccc; padding: 10px; background-color: #f9f9f9;">
            ${Object.entries(orderData.order_info)
              .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
              .join("")}
        </div>
    </div>
    `
        : ""
    }
    
    <div class="remarks-section">
        <h3>Terms & Conditions:</h3>
        <div style="border: 1px solid #ccc; padding: 10px; background-color: #f9f9f9;">
            <p><strong>1. PAYMENT:</strong> ${orderData.payment_terms || "T/T 30 days after shipment"}</p>
            <p><strong>2. DELIVERY:</strong> ${orderData.trade_terms || "FOB Taiwan"}</p>
            <p><strong>3. PACKING:</strong> By export carton then palletized</p>
            <p><strong>4. QUANTITY ALLOWANCE:</strong> Plus 10% / Minus 10%</p>
        </div>
    </div>
    
    <div class="signature-section">
        <div class="signature-box">
            <p><strong>Confirmed by Buyer</strong></p>
            <p>${orderData.customer_name}</p>
            <div class="signature-line">
                <p>Authorized Signature</p>
            </div>
        </div>
        
        <div class="signature-box">
            <p><strong>Confirmed by Seller</strong></p>
            <p>LOCKSURE INC.</p>
            <div class="signature-line">
                <p>Authorized Signature</p>
            </div>
        </div>
    </div>
</body>
</html>
    `
  }

  const ReportPreview = () => (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
        <div className="flex-1">
          <h1 className="text-lg font-bold mb-2">LOCKSURE INC.</h1>
          <div className="text-sm space-y-1">
            <p>8F., No.456, Trade Road, Xinyi Dist.</p>
            <p>Taipei City 110, Taiwan (R.O.C.)</p>
            <p>TEL: +886-2-8765-4321</p>
            <p>FAX: +886-2-8765-4322</p>
            <p>Email: info@locksure.com.tw</p>
            <p>VAT: 12345678</p>
          </div>
        </div>

        <div className="text-center flex-1">
          <h2 className="text-xl font-bold underline">SALES CONFIRMATION</h2>
          <p className="mt-2">******************</p>
        </div>
      </div>

      {/* Reference Info */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <div className="mb-2">
            <span className="font-bold inline-block w-20">Our Ref.:</span>
            <span>{orderData.order_id}</span>
          </div>
          <div className="mb-2">
            <span className="font-bold inline-block w-20">Your Ref.:</span>
            <span>{orderData.po_id || "N/A"}</span>
          </div>
          <div className="mb-2">
            <span className="font-bold inline-block w-20">Date:</span>
            <span>{formatDate(new Date().toISOString())}</span>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-2">Messrs.:</h3>
          <p className="font-bold">{orderData.customer_name}</p>
          {orderData.customer_address && <p>{orderData.customer_address}</p>}
          {orderData.customer_contact && <p>Contact: {orderData.customer_contact}</p>}
        </div>
      </div>

      {/* Products Table */}
      <div className="mb-6">
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-center">Part No.</th>
              <th className="border border-black p-2 text-center">Description</th>
              <th className="border border-black p-2 text-center">Quantity</th>
              <th className="border border-black p-2 text-center">Unit Price</th>
              <th className="border border-black p-2 text-center">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orderData.batch_items?.map((item, index) => (
              <tr key={index}>
                <td className="border border-black p-2 font-bold">{item.part_no}</td>
                <td className="border border-black p-2">{item.description}</td>
                <td className="border border-black p-2 text-right">
                  {item.quantity.toLocaleString()} {item.unit || "PCS"}
                </td>
                <td className="border border-black p-2 text-right">
                  {formatCurrency(item.unit_price, orderData.currency)}
                </td>
                <td className="border border-black p-2 text-right">
                  {formatCurrency(item.total_price || item.quantity * item.unit_price, orderData.currency)}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold">
              <td colSpan={4} className="border border-black p-2 text-right">
                Total:
              </td>
              <td className="border border-black p-2 text-right">
                {formatCurrency(calculateTotal(), orderData.currency)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Remarks */}
      {orderData.remarks && (
        <div className="mb-6">
          <h3 className="font-bold mb-2">Remarks:</h3>
          <div className="border border-gray-300 p-3 bg-gray-50 whitespace-pre-line">{orderData.remarks}</div>
        </div>
      )}

      {/* Order Info */}
      {orderData.order_info && Object.keys(orderData.order_info).length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold mb-2">Order Information:</h3>
          <div className="border border-gray-300 p-3 bg-gray-50 space-y-2">
            {Object.entries(orderData.order_info).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {String(value)}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Terms & Conditions */}
      <div className="mb-8">
        <h3 className="font-bold mb-2">Terms & Conditions:</h3>
        <div className="border border-gray-300 p-3 bg-gray-50 space-y-2">
          <p>
            <strong>1. PAYMENT:</strong> {orderData.payment_terms || "T/T 30 days after shipment"}
          </p>
          <p>
            <strong>2. DELIVERY:</strong> {orderData.trade_terms || "FOB Taiwan"}
          </p>
          <p>
            <strong>3. PACKING:</strong> By export carton then palletized
          </p>
          <p>
            <strong>4. QUANTITY ALLOWANCE:</strong> Plus 10% / Minus 10%
          </p>
        </div>
      </div>

      {/* Signature Section */}
      <div className="grid grid-cols-2 gap-12">
        <div className="text-center">
          <p className="font-bold mb-2">Confirmed by Buyer</p>
          <p className="mb-12">{orderData.customer_name}</p>
          <div className="border-t border-black pt-2">
            <p>Authorized Signature</p>
          </div>
        </div>

        <div className="text-center">
          <p className="font-bold mb-2">Confirmed by Seller</p>
          <p className="mb-12">LOCKSURE INC.</p>
          <div className="border-t border-black pt-2">
            <p>Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              預覽報表
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Sales Confirmation - {orderData.order_id}</span>
              <div className="flex gap-2">
                <Button onClick={handlePrint} className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  列印報表
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <ReportPreview />
        </DialogContent>
      </Dialog>

      <Button onClick={handlePrint} variant="outline" size="sm" className="ml-2">
        <Printer className="h-4 w-4 mr-2" />
        直接列印
      </Button>
    </>
  )
}
