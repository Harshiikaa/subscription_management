"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainNav } from "@/components/navigation/main-nav"
import { PaymentMethodCard } from "@/components/payment/payment-method-card"
import { AddPaymentMethod } from "@/components/payment/add-payment-method"
import { InvoiceViewer } from "@/components/payment/invoice-viewer"
import { getUserTransactions } from "@/lib/mock-data"
import { CreditCard, Receipt, Settings, Download } from "lucide-react"

export default function BillingPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: "1",
      type: "esewa" as const,
      name: "eSewa Wallet",
      details: "****@esewa.com",
      isDefault: true,
    },
    {
      id: "2",
      type: "card" as const,
      name: "Visa Card",
      details: "**** **** **** 4242",
      expiryDate: "12/25",
      isDefault: false,
    },
  ])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !user) {
    return <div>Loading...</div>
  }

  const userTransactions = getUserTransactions(user.id)

  // Mock invoices data
  const invoices = userTransactions.map((transaction) => ({
    id: transaction.id,
    date: transaction.date,
    amount: transaction.amount,
    status:
      transaction.status === "completed"
        ? ("paid" as const)
        : transaction.status === "pending"
          ? ("pending" as const)
          : ("overdue" as const),
    description: transaction.description,
    paymentMethod: transaction.paymentMethod,
    billingAddress: {
      name: user.name,
      email: user.email,
      address: "123 Main Street",
      city: "Kathmandu",
      country: "Nepal",
    },
    items: [
      {
        description: transaction.description,
        quantity: 1,
        unitPrice: transaction.amount,
        total: transaction.amount,
      },
    ],
    subtotal: transaction.amount,
    tax: 0,
    total: transaction.amount,
  }))

  const handleSetDefault = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((method) => ({
        ...method,
        isDefault: method.id === id,
      })),
    )
  }

  const handleEditPaymentMethod = (id: string) => {
    console.log("Editing payment method:", id)
  }

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods((prev) => prev.filter((method) => method.id !== id))
  }

  const handleAddPaymentMethod = (newMethod: any) => {
    setPaymentMethods((prev) => [...prev, newMethod])
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Billing & Payments</h1>
          <p className="text-muted-foreground text-pretty">
            Manage your payment methods, view invoices, and update billing information.
          </p>
        </div>

        <Tabs defaultValue="payment-methods" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="billing-info">Billing Info</TabsTrigger>
          </TabsList>

          <TabsContent value="payment-methods" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Payment Methods</h2>
                <p className="text-muted-foreground">Manage your saved payment methods</p>
              </div>
              <AddPaymentMethod onAdd={handleAddPaymentMethod} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  paymentMethod={method}
                  onSetDefault={handleSetDefault}
                  onEdit={handleEditPaymentMethod}
                  onDelete={handleDeletePaymentMethod}
                />
              ))}
            </div>

            {paymentMethods.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    No Payment Methods
                  </CardTitle>
                  <CardDescription>Add a payment method to start making payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <AddPaymentMethod onAdd={handleAddPaymentMethod} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Invoices</h2>
                <p className="text-muted-foreground">View and download your invoices</p>
              </div>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download All
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Invoice History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoices.length > 0 ? (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">Invoice #{invoice.id}</p>
                            <Badge
                              variant={
                                invoice.status === "paid"
                                  ? "default"
                                  : invoice.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(invoice.date).toLocaleDateString()} • {invoice.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">${invoice.amount.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">{invoice.paymentMethod}</p>
                          </div>
                          <InvoiceViewer invoice={invoice} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No invoices found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing-info" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Billing Information</h2>
              <p className="text-muted-foreground">Update your billing address and tax information</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Billing Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm">123 Main Street</p>
                    <p className="text-sm">Kathmandu, Nepal</p>
                    <p className="text-sm">Postal Code: 44600</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Update Address
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tax Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">VAT Number</p>
                    <p className="text-sm text-muted-foreground">Not provided</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Tax Rate</p>
                    <p className="text-sm text-muted-foreground">0% (No tax applicable)</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Add VAT Number
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Billing Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Invoices</p>
                    <p className="text-sm text-muted-foreground">Receive invoices via email</p>
                  </div>
                  <Badge>Enabled</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-pay</p>
                    <p className="text-sm text-muted-foreground">Automatically pay invoices</p>
                  </div>
                  <Badge variant="secondary">Disabled</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Payment Reminders</p>
                    <p className="text-sm text-muted-foreground">Get reminded before payments</p>
                  </div>
                  <Badge>Enabled</Badge>
                </div>

                <Button variant="outline">Update Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
