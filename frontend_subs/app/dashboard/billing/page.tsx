"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
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
import { CreditCard, Receipt, Settings, Download, Check, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function BillingPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
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

  // Subscription creation state
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("1")
  const [productData, setProductData] = useState<any>(null)
  const [planData, setPlanData] = useState<any>(null)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)

  const productId = searchParams.get("product")
  const planId = searchParams.get("plan")
  const billingCycle = (searchParams.get("billing") as "monthly" | "yearly") || "monthly"

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch product and plan data if coming from subscription flow
  useEffect(() => {
    const fetchData = async () => {
      if (productId) {
        try {
          const productRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/products/${productId}`
          )
          const productJson = await productRes.json()
          setProductData(productJson.data)
        } catch (error) {
          console.error("Failed to fetch product:", error)
        }
      }
      
      if (planId) {
        try {
          const planRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/subscription-plans/${planId}`
          )
          const planJson = await planRes.json()
          setPlanData(planJson.data)
        } catch (error) {
          console.error("Failed to fetch plan:", error)
        }
      }
    }

    if (productId || planId) {
      fetchData()
    }
  }, [productId, planId])

  const handleCreateSubscription = async () => {
    if (!productId || !planId) return

    setIsCreatingSubscription(true)
    try {
      // First, create the subscription
      const subscriptionResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/subscriptions/product`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            productId,
            billingCycle,
            paymentMethod: paymentMethods.find(pm => pm.id === selectedPaymentMethod)?.type || "esewa",
          }),
        }
      )

      if (!subscriptionResponse.ok) {
        const error = await subscriptionResponse.json()
        console.error("Failed to create subscription:", error)
        alert("Failed to create subscription. Please try again.")
        return
      }

      const subscriptionResult = await subscriptionResponse.json()
      console.log("Subscription created:", subscriptionResult)

      // Get the payment amount from product or plan data
      const paymentAmount = productData?.price?.[billingCycle] || planData?.pricing?.[billingCycle] || 0
      
      // Create eSewa payment
      const paymentResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/payments/esewa`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            productId,
            amount: paymentAmount,
            currency: "NPR", // eSewa uses NPR
          }),
        }
      )

      if (!paymentResponse.ok) {
        const error = await paymentResponse.json()
        console.error("Failed to create payment:", error)
        alert("Failed to create payment. Please try again.")
        return
      }

      const paymentResult = await paymentResponse.json()
      console.log("Payment created:", paymentResult)

      // Redirect to eSewa payment page
      if (paymentResult.data?.esewa_initiate_url) {
        // Create a form to submit to eSewa
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = paymentResult.data.esewa_initiate_url
        form.target = '_blank'

        // Add all the required fields for eSewa
        const fields = {
          amount: paymentResult.data.amount,
          tax_amount: paymentResult.data.tax_amount,
          total_amount: paymentResult.data.total_amount,
          transaction_uuid: paymentResult.data.transaction_uuid,
          product_code: paymentResult.data.product_code,
          product_service_charge: paymentResult.data.product_service_charge,
          product_delivery_charge: paymentResult.data.product_delivery_charge,
          success_url: paymentResult.data.success_url,
          failure_url: paymentResult.data.failure_url,
          signed_field_names: paymentResult.data.signed_field_names,
          signature: paymentResult.data.signature,
        }

        // Add fields to form
        Object.entries(fields).forEach(([key, value]) => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = value
          form.appendChild(input)
        })

        // Submit form
        document.body.appendChild(form)
        form.submit()
        document.body.removeChild(form)

        // Show success message
        setPaymentStatus("Redirecting to eSewa for payment...")
        setTimeout(() => {
          setPaymentStatus(null)
        }, 3000)
      } else {
        console.error("No eSewa URL provided")
        setPaymentStatus("Payment created but no payment URL provided.")
        setTimeout(() => {
          setPaymentStatus(null)
        }, 5000)
      }

    } catch (error) {
      console.error("Error creating subscription:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsCreatingSubscription(false)
    }
  }

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
          <div className="flex items-center gap-4 mb-4">
            {productId && (
              <Button variant="ghost" asChild>
                <Link href="/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Products
                </Link>
              </Button>
            )}
          </div>
          <h1 className="text-3xl font-bold text-balance">
            {productId ? "Complete Your Subscription" : "Billing & Payments"}
          </h1>
          <p className="text-muted-foreground text-pretty">
            {productId 
              ? "Choose your payment method and complete your subscription."
              : "Manage your payment methods, view invoices, and update billing information."
            }
          </p>
        </div>

        {/* Subscription Summary */}
        {productId && productData && planData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Subscription Summary</CardTitle>
              <CardDescription>Review your subscription details before payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{productData.name}</h3>
                  <p className="text-sm text-muted-foreground">{productData.description}</p>
                </div>
                <Badge>{billingCycle}</Badge>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Plan: {planData.name}</h4>
                <p className="text-sm text-muted-foreground">{planData.description}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Features included:</h4>
                <ul className="space-y-1">
                  {planData.features?.slice(0, 5).map((feature: any, index: number) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                      {feature.name || feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${productData.price?.[billingCycle] || planData.pricing?.[billingCycle] || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${productData.price?.[billingCycle] || planData.pricing?.[billingCycle] || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Billed {billingCycle}. Cancel anytime.</p>
              </div>
            </CardContent>
          </Card>
        )}

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
                <div key={method.id} className="relative">
                  <PaymentMethodCard
                    paymentMethod={method}
                    onSetDefault={handleSetDefault}
                    onEdit={handleEditPaymentMethod}
                    onDelete={handleDeletePaymentMethod}
                  />
                  {productId && (
                    <div className="absolute top-2 right-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-primary"
                      />
                    </div>
                  )}
                </div>
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

            {/* Payment Status */}
            {paymentStatus && (
              <Card className="mt-6 border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-blue-800">{paymentStatus}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subscription Creation Button */}
            {productId && planId && (
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Ready to Subscribe?</h3>
                      <p className="text-sm text-muted-foreground">
                        Complete your subscription with the selected payment method
                      </p>
                      {productData && planData && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Amount: {productData.currency || "USD"} {productData.price?.[billingCycle] || planData.pricing?.[billingCycle] || 0}
                        </p>
                      )}
                    </div>
                    <Button 
                      onClick={handleCreateSubscription}
                      disabled={isCreatingSubscription || !productData || !planData}
                      size="lg"
                    >
                      {isCreatingSubscription ? "Processing..." : "Complete Subscription"}
                    </Button>
                  </div>
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
