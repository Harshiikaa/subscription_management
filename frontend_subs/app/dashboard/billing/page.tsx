"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MainNav } from "@/components/navigation/main-nav"
import { PaymentMethodCard } from "@/components/payment/payment-method-card"
import { AddPaymentMethod } from "@/components/payment/add-payment-method"
import { InvoiceViewer } from "@/components/payment/invoice-viewer"
import { getUserTransactions } from "@/lib/mock-data"
import { paymentApi, Payment } from "@/lib/api/payments"
import { subscriptionApi, Subscription } from "@/lib/api/subscriptions"
import { CreditCard, Receipt, Settings, Download, Check, ArrowLeft, Filter, Calendar } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function BillingPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()
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
      type: "khalti" as const,
      name: "Khalti Wallet",
      details: "****@khalti.com",
      isDefault: false,
    },
  ])

  // Subscription creation state
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("1")
  const [productData, setProductData] = useState<any>(null)
  const [planData, setPlanData] = useState<any>(null)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)

  // Invoices state
  const [invoices, setInvoices] = useState<Payment[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [invoicesError, setInvoicesError] = useState<string | null>(null)
  const [invoiceFilter, setInvoiceFilter] = useState<string>("all") // all, completed, failed, pending, etc.

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false)
  const [subscriptionsError, setSubscriptionsError] = useState<string | null>(null)
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>("all") // all, active, inactive, cancelled, expired, trial
  const [reminderDaysById, setReminderDaysById] = useState<Record<string, number>>({})
  const [savingReminderId, setSavingReminderId] = useState<string | null>(null)
  const [reminderDialogId, setReminderDialogId] = useState<string | null>(null)
  const [tempReminderDays, setTempReminderDays] = useState<number>(5)

  const productId = searchParams.get("product")
  const planId = searchParams.get("plan")
  const billingCycle = (searchParams.get("billing") as "monthly" | "yearly") || "monthly"

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch invoices
  const fetchInvoices = async (statusFilter?: string) => {
    if (!isAuthenticated) return
    
    setInvoicesLoading(true)
    setInvoicesError(null)
    try {
      const response = await paymentApi.getMyPayments({
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: 50
      })
      setInvoices(response.data.items)
    } catch (error) {
      console.error("Failed to fetch invoices:", error)
      setInvoicesError("Failed to load invoices")
    } finally {
      setInvoicesLoading(false)
    }
  }

  // Fetch subscriptions
  const fetchSubscriptions = async (statusFilter?: string) => {
    if (!isAuthenticated) return
    
    setSubscriptionsLoading(true)
    setSubscriptionsError(null)
    try {
      const response = await subscriptionApi.listMy({
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: 50
      })
      // The API returns data as a direct array, not wrapped in items
      setSubscriptions(response.data)
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error)
      setSubscriptionsError("Failed to load subscriptions")
    } finally {
      setSubscriptionsLoading(false)
    }
  }

  const handleSaveReminder = async (subscriptionId: string, daysArg?: number) => {
    if (!isAuthenticated) return
    const days = daysArg ?? reminderDaysById[subscriptionId] ?? 5
    setSavingReminderId(subscriptionId)
    try {
      await subscriptionApi.setReminder(subscriptionId, days)
      const sub = subscriptions.find(s => s._id === subscriptionId)
      let scheduledMsg = ""
      if (sub?.endDate) {
        const d = new Date(sub.endDate)
        d.setDate(d.getDate() - days)
        scheduledMsg = ` (scheduled for ${d.toLocaleDateString()})`
      }
      toast({ title: "Reminder saved", description: `We'll remind you ${days} day(s) before expiry${scheduledMsg}.` })
    } catch (e: any) {
      toast({ title: "Failed to save reminder", description: e?.message || "Please try again.", variant: "destructive" })
    } finally {
      setSavingReminderId(null)
    }
  }

  const openReminderDialog = (subscriptionId: string) => {
    setTempReminderDays(reminderDaysById[subscriptionId] ?? 5)
    setReminderDialogId(subscriptionId)
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchInvoices()
      fetchSubscriptions()
    }
  }, [isAuthenticated])

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
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            productId,
            billingCycle,
            paymentMethod: paymentMethods.find(pm => pm.id === selectedPaymentMethod)?.type || "khalti",
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
      
      // Create Khalti payment
      const paymentResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/payments/khalti`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            productId,
            subscriptionId: subscriptionResult.data._id,
            amount: paymentAmount,
            currency: "NPR",
            customer_info: {
              name: user?.name || "Customer",
              email: user?.email || "",
              phone: user?.phone || "",
            },
            amount_breakdown: {
              subtotal: paymentAmount,
              tax: 0,
              shipping: 0,
              discount: 0,
            },
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

      // Redirect to Khalti payment page
      if (paymentResult.data?.payment_url) {
        // Redirect to Khalti payment page
        window.location.href = paymentResult.data.payment_url

        // Show success message
        setPaymentStatus("Redirecting to Khalti for payment...")
        setTimeout(() => {
          setPaymentStatus(null)
        }, 3000)
      } else {
        console.error("No Khalti URL provided")
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

  // Convert Payment data to Invoice format for display
  const formatInvoices = (payments: Payment[]) => {
    return payments.map((payment) => ({
      id: payment._id,
      date: payment.paidAt || payment.createdAt,
      amount: payment.amount,
      status: payment.status === "completed" ? "paid" : 
              payment.status === "pending" ? "pending" : 
              payment.status === "failed" ? "failed" : 
              payment.status === "cancelled" ? "cancelled" :
              payment.status === "refunded" ? "refunded" : "pending",
      description: payment.subscription?.subscriptionType === "product" 
        ? `Product: ${payment.product?.name || "Unknown Product"}`
        : payment.subscription?.subscriptionType === "plan"
        ? `Plan: ${payment.subscription?.subscriptionType}`
        : `Payment for ${payment.paymentType}`,
      paymentMethod: payment.paymentMethod,
      billingAddress: {
        name: user.name,
        email: user.email,
        address: "123 Main Street",
        city: "Kathmandu",
        country: "Nepal",
      },
      items: [
        {
          description: payment.subscription?.subscriptionType === "product" 
            ? `Product: ${payment.product?.name || "Unknown Product"}`
            : payment.subscription?.subscriptionType === "plan"
            ? `Plan: ${payment.subscription?.subscriptionType}`
            : `Payment for ${payment.paymentType}`,
          quantity: 1,
          unitPrice: payment.amount,
          total: payment.amount,
        },
      ],
      subtotal: payment.amount,
      tax: 0,
      total: payment.amount,
    }))
  }

  const formattedInvoices = formatInvoices(invoices)

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
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
                      {isCreatingSubscription ? "Processing..." : "Pay with Khalti"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">My Subscriptions</h2>
                <p className="text-muted-foreground">View and manage your active subscriptions</p>
              </div>
              <div className="flex items-center gap-4">
                <Select value={subscriptionFilter} onValueChange={(value) => {
                  setSubscriptionFilter(value)
                  fetchSubscriptions(value)
                }}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subscriptions</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Calendar
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Subscription History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptionsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading subscriptions...</p>
                  </div>
                ) : subscriptionsError ? (
                  <div className="text-center py-8">
                    <p className="text-destructive">{subscriptionsError}</p>
                    <Button 
                      variant="outline" 
                      onClick={() => fetchSubscriptions()}
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </div>
                ) : subscriptions.length > 0 ? (
                  <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                      <div key={subscription._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">
                              {subscription.subscriptionType === "product" 
                                ? (typeof subscription.productId === 'object' ? subscription.productId.name : "Product Subscription")
                                : subscription.subscriptionPlan?.name || "Plan Subscription"
                              }
                            </h3>
                            <Badge
                              variant={
                                subscription.status === "active"
                                  ? "default"
                                  : subscription.status === "trial"
                                    ? "secondary"
                                    : subscription.status === "cancelled"
                                      ? "destructive"
                                      : subscription.status === "expired"
                                        ? "outline"
                                        : "secondary"
                              }
                            >
                              {subscription.status}
                            </Badge>
                            {subscription.daysRemaining && subscription.daysRemaining > 0 && (
                              <Badge variant="outline">
                                {subscription.daysRemaining} days left
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {subscription.subscriptionType === "product" 
                              ? (typeof subscription.productId === 'object' ? subscription.productId.description : "Product subscription")
                              : subscription.subscriptionPlan?.description || "Plan subscription"
                            }
                          </p>
                          {subscription.subscriptionType === "product" && typeof subscription.productId === 'object' && subscription.productId.features && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {subscription.productId.features.slice(0, 3).map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                              {subscription.productId.features.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{subscription.productId.features.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Billing: {subscription.billingCycle}</span>
                            <span>Started: {new Date(subscription.startDate).toLocaleDateString()}</span>
                            {subscription.endDate && (
                              <span>Ends: {new Date(subscription.endDate).toLocaleDateString()}</span>
                            )}
                            {subscription.nextBilling && (
                              <span>Next billing: {new Date(subscription.nextBilling).toLocaleDateString()}</span>
                            )}
                            {subscription.paymentMethod && (
                              <span>Payment: {subscription.paymentMethod}</span>
                            )}
                            {subscription.autoRenew && (
                              <Badge variant="secondary" className="text-xs">Auto-renew</Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="font-semibold">{subscription.amount.toFixed(2)} {subscription.currency}</p>
                            <p className="text-sm text-muted-foreground">
                              {subscription.billingCycle === "monthly" ? "per month" : 
                               subscription.billingCycle === "yearly" ? "per year" : 
                               subscription.billingCycle === "quarterly" ? "per quarter" : 
                               subscription.billingCycle === "weekly" ? "per week" : "per billing cycle"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openReminderDialog(subscription._id)}
                            >
                              Set reminder
                            </Button>
                            {subscription.status === "active" && (
                              <Button variant="outline" size="sm">
                                Manage
                              </Button>
                            )}
                            {subscription.status === "active" && (
                              <Button variant="destructive" size="sm">
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No subscriptions found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {reminderDialogId && (
            <Dialog open={!!reminderDialogId} onOpenChange={(open) => !open && setReminderDialogId(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set subscription reminder</DialogTitle>
                  <DialogDescription>
                    Choose how many days before expiry you want to receive a reminder.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    className="w-28"
                    value={tempReminderDays}
                    onChange={(e) => setTempReminderDays(Number(e.target.value))}
                  />
                  <span className="text-sm text-muted-foreground">day(s) before expiry</span>
                </div>
                <DialogFooter>
                  <Button
                    disabled={savingReminderId === reminderDialogId}
                    onClick={async () => {
                      setReminderDaysById(prev => ({ ...prev, [reminderDialogId!]: tempReminderDays }))
                      await handleSaveReminder(reminderDialogId!, tempReminderDays)
                      setReminderDialogId(null)
                    }}
                  >
                    {savingReminderId === reminderDialogId ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <TabsContent value="invoices" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Invoices</h2>
                <p className="text-muted-foreground">View and download your invoices</p>
              </div>
              <div className="flex items-center gap-4">
                <Select value={invoiceFilter} onValueChange={(value) => {
                  setInvoiceFilter(value)
                  fetchInvoices(value)
                }}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download All
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Invoice History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoicesLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading invoices...</p>
                  </div>
                ) : invoicesError ? (
                  <div className="text-center py-8">
                    <p className="text-destructive">{invoicesError}</p>
                    <Button 
                      variant="outline" 
                      onClick={fetchInvoices}
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </div>
                ) : formattedInvoices.length > 0 ? (
                  <div className="space-y-4">
                    {formattedInvoices.map((invoice) => (
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
                                    : invoice.status === "failed"
                                      ? "destructive"
                                      : invoice.status === "cancelled"
                                        ? "outline"
                                        : invoice.status === "refunded"
                                          ? "secondary"
                                          : "secondary"
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
                            <p className="font-semibold">{invoice.amount.toFixed(2)} {invoices[0]?.currency || 'USD'}</p>
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
