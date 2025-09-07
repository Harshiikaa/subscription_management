"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MainNav } from "@/components/navigation/main-nav"
import { getUserSubscriptions, getUserTransactions, getProductById } from "@/lib/mock-data"
import { CreditCard, Package, TrendingUp, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !user) {
    return <div>Loading...</div>
  }

  const userSubscriptions = getUserSubscriptions(user.id)
  const userTransactions = getUserTransactions(user.id)
  const activeSubscription = userSubscriptions.find((sub) => sub.status === "active")
  const activeProduct = activeSubscription ? getProductById(activeSubscription.productId) : null

  const totalSpent = userTransactions
    .filter((txn) => txn.status === "completed")
    .reduce((sum, txn) => sum + txn.amount, 0)

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground text-pretty">Here's an overview of your account and subscriptions.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscription</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProduct ? activeProduct.name : "None"}</div>
              <p className="text-xs text-muted-foreground">
                {activeSubscription ? `${activeSubscription.billingCycle} billing` : "No active plan"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Across {userTransactions.length} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant={user.isVerified ? "default" : "secondary"}>
                  {user.isVerified ? "Verified" : "Pending"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeSubscription?.nextBilling
                  ? new Date(activeSubscription.nextBilling).toLocaleDateString()
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {activeSubscription ? `$${activeSubscription.amount}` : "No active subscription"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Current Subscription */}
        {activeSubscription && activeProduct ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>Your active plan details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{activeProduct.name}</h3>
                  <p className="text-muted-foreground">{activeProduct.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge>{activeSubscription.status}</Badge>
                    <span className="text-sm text-muted-foreground">
                      ${activeSubscription.amount}/{activeSubscription.billingCycle}
                    </span>
                  </div>
                </div>
                <Button asChild>
                  <Link href="/dashboard/subscriptions">
                    Manage <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>No Active Subscription</CardTitle>
              <CardDescription>Choose a plan to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You don't have an active subscription. Browse our plans to find the perfect fit for your needs.
              </p>
              <Button asChild>
                <Link href="/products">
                  Browse Plans <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest payment history</CardDescription>
          </CardHeader>
          <CardContent>
            {userTransactions.length > 0 ? (
              <div className="space-y-4">
                {userTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()} • {transaction.paymentMethod}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${transaction.amount}</p>
                      <Badge
                        variant={
                          transaction.status === "completed"
                            ? "default"
                            : transaction.status === "pending"
                              ? "secondary"
                              : transaction.status === "failed"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/dashboard/transactions">View All Transactions</Link>
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">No transactions yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
