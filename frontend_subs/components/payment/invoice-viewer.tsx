"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Eye, Calendar, CreditCard } from "lucide-react"

interface Invoice {
  id: string
  date: string
  amount: number
  status: "paid" | "pending" | "overdue"
  description: string
  paymentMethod: string
  billingAddress: {
    name: string
    email: string
    address: string
    city: string
    country: string
  }
  items: {
    description: string
    quantity: number
    unitPrice: number
    total: number
  }[]
  subtotal: number
  tax: number
  total: number
}

interface InvoiceViewerProps {
  invoice: Invoice
}

export function InvoiceViewer({ invoice }: InvoiceViewerProps) {
  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    console.log("Downloading invoice:", invoice.id)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="mr-2 h-4 w-4" />
          View Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice #{invoice.id}</span>
            <Button onClick={handleDownload} size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">SaaS Platform</h2>
              <p className="text-muted-foreground">Professional Subscription Services</p>
            </div>
            <div className="text-right">
              <Badge
                variant={
                  invoice.status === "paid" ? "default" : invoice.status === "pending" ? "secondary" : "destructive"
                }
              >
                {invoice.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Invoice Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{invoice.billingAddress.name}</p>
                <p>{invoice.billingAddress.email}</p>
                <p>{invoice.billingAddress.address}</p>
                <p>
                  {invoice.billingAddress.city}, {invoice.billingAddress.country}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Invoice Details:</h3>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date: {new Date(invoice.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Payment Method: {invoice.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Invoice Items */}
          <div>
            <h3 className="font-semibold mb-4">Items:</h3>
            <div className="space-y-2">
              {invoice.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} × ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold">${item.total.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Invoice Totals */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${invoice.tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>${invoice.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This invoice has been {invoice.status === "paid" ? "paid" : "not yet paid"} via {invoice.paymentMethod}.
                {invoice.status === "pending" && " Payment is currently being processed."}
                {invoice.status === "overdue" && " This payment is overdue. Please contact support."}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
