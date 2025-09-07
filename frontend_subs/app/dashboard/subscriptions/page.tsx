"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MainNav } from "@/components/navigation/main-nav"
import { SubscriptionCard } from "@/components/subscription/subscription-card"
import { getUserSubscriptions, getProductById } from "@/lib/mock-data"
import { Plus, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SubscriptionsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }

    // Check for success parameter
    if (searchParams.get("success") === "true") {
      setShowSuccess(true)
      // Remove the success parameter from URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete("success")
      window.history.replaceState({}, "", newUrl.toString())
    }
  }, [isAuthenticated, isLoading, router, searchParams])

  if (isLoading || !user) {
    return <div>Loading...</div>
  }

  const userSubscriptions = getUserSubscriptions(user.id)

  const handleManageSubscription = (subscriptionId: string) => {
    console.log("Managing subscription:", subscriptionId)
    // In a real app, this would open a management modal or navigate to a detailed page
  }

  const handleUpgradeSubscription = (subscriptionId: string) => {
    router.push("/products")
  }

  const handleCancelSubscription = (subscriptionId: string) => {
    console.log("Cancelling subscription:", subscriptionId)
    // In a real app, this would show a confirmation dialog and process the cancellation
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">My Subscriptions</h1>
              <p className="text-muted-foreground text-pretty">
                Manage your active subscriptions and billing information.
              </p>
            </div>
            <Button asChild>
              <Link href="/products">
                <Plus className="mr-2 h-4 w-4" />
                Add Subscription
              </Link>
            </Button>
          </div>
        </div>

        {showSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Payment successful! Your subscription has been activated.
            </AlertDescription>
          </Alert>
        )}

        {userSubscriptions.length > 0 ? (
          <div className="space-y-6">
            {userSubscriptions.map((subscription) => {
              const product = getProductById(subscription.productId)
              if (!product) return null

              return (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  product={product}
                  onManage={() => handleManageSubscription(subscription.id)}
                  onUpgrade={() => handleUpgradeSubscription(subscription.id)}
                  onCancel={() => handleCancelSubscription(subscription.id)}
                />
              )
            })}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Active Subscriptions</CardTitle>
              <CardDescription>You don't have any subscriptions yet.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Browse our plans to find the perfect subscription for your needs.
              </p>
              <Button asChild>
                <Link href="/products">Browse Plans</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Billing Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>Manage your payment methods and billing details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Default Payment Method</p>
                <p className="text-sm text-muted-foreground">eSewa Wallet (****@esewa.com)</p>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Billing Address</p>
                <p className="text-sm text-muted-foreground">Kathmandu, Nepal</p>
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tax Information</p>
                <p className="text-sm text-muted-foreground">VAT ID: Not provided</p>
              </div>
              <Button variant="outline" size="sm">
                Add VAT ID
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
