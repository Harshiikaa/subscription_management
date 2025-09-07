"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { MainNav } from "@/components/navigation/main-nav"
import { getProductById, getUserSubscriptions } from "@/lib/mock-data"
import { CreditCard, Shield, Check, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [paymentMethod, setPaymentMethod] = useState("esewa")
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  })

  const productId = searchParams.get("product")
  const billingCycle = (searchParams.get("billing") as "monthly" | "yearly") || "monthly"

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !user || !productId) {
    return <div>Loading...</div>
  }

  const product = getProductById(productId)
  const userSubscriptions = getUserSubscriptions(user.id)
  const activeSubscription = userSubscriptions.find((sub) => sub.status === "active")

  if (!product) {
    router.push("/products")
    return null
  }

  const price = product.price[billingCycle]
  const isUpgrade = activeSubscription && activeSubscription.productId !== productId

  const handlePayment = async () => {
    setIsProcessing(true)

    // Mock payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real app, this would integrate with payment gateways
    console.log("Processing payment:", {
      productId,
      billingCycle,
      paymentMethod,
      amount: price,
      userId: user.id,
    })

    setIsProcessing(false)
    router.push("/dashboard/subscriptions?success=true")
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Plans
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your subscription details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                </div>
                <Badge>{billingCycle}</Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Features included:</h4>
                <ul className="space-y-1">
                  {product.features.slice(0, 5).map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${price}</span>
                </div>
                <p className="text-xs text-muted-foreground">Billed {billingCycle}. Cancel anytime.</p>
              </div>

              {isUpgrade && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium">Subscription Change</p>
                  <p className="text-xs text-muted-foreground">
                    Your current subscription will be cancelled and replaced with this new plan.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Choose your preferred payment method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-2">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="esewa" id="esewa" />
                    <Label htmlFor="esewa" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span>eSewa</span>
                        <Badge variant="secondary">Popular</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Pay with your eSewa wallet</p>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="khalti" id="khalti" />
                    <Label htmlFor="khalti" className="flex-1 cursor-pointer">
                      <span>Khalti</span>
                      <p className="text-xs text-muted-foreground">Pay with your Khalti wallet</p>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Credit/Debit Card</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard, American Express</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails((prev) => ({ ...prev, number: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails((prev) => ({ ...prev, expiry: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails((prev) => ({ ...prev, cvv: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Your payment information is secure and encrypted</span>
              </div>

              <Button className="w-full" size="lg" onClick={handlePayment} disabled={isProcessing}>
                {isProcessing ? "Processing..." : `Pay $${price}`}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By completing this purchase, you agree to our Terms of Service and Privacy Policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
