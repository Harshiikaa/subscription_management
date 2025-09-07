"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Shield, Users, CreditCard, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-balance">
            Manage Your Subscriptions
            <span className="text-primary"> Effortlessly</span>
          </h1>
          <p className="text-xl text-muted-foreground text-pretty">
            A comprehensive SaaS platform for subscription management, user administration, and secure payment
            processing. Built for businesses that scale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">Get Started Free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-balance">Everything You Need</h2>
          <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
            Powerful features designed to help you manage users, subscriptions, and payments with ease.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Secure Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Multi-provider OAuth support with role-based access control for users and admins.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Comprehensive admin tools for managing users, verification, and account status.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CreditCard className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Payment Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Secure payment integration with multiple gateways including eSewa and Khalti.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Detailed insights into revenue, subscriptions, and user engagement metrics.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-card">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4 text-balance">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Join thousands of businesses already using our platform to manage their subscriptions and grow their
            revenue.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">Start Your Free Trial</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
