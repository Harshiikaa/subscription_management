"use client";

import { MainNav } from "@/components/navigation/main-nav";
import { SubscriptionCard } from "@/components/subscription/subscription-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { CheckCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getProductById,
  getUserSubscriptions,
  mockProducts,
} from "@/lib/mock-data";
import { Check, HardDrive, Headphones, Star, Users } from "lucide-react";

export default function SubscriptionsPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const userSubscriptions = user ? getUserSubscriptions(user.id) : [];
  const activeSubscription = userSubscriptions.find(
    (sub) => sub.status === "active"
  );

  const handleSubscribe = (productId: string) => {
    router.push(`/checkout?product=${productId}&billing=${billingCycle}`);
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }

    // Check for success parameter
    if (searchParams.get("success") === "true") {
      setShowSuccess(true);
      // Remove the success parameter from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("success");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  // const userSubscriptions = getUserSubscriptions(user.id);

  const handleManageSubscription = (subscriptionId: string) => {
    console.log("Managing subscription:", subscriptionId);
    // In a real app, this would open a management modal or navigate to a detailed page
  };

  const handleUpgradeSubscription = (subscriptionId: string) => {
    router.push("/products");
  };

  const handleCancelSubscription = (subscriptionId: string) => {
    console.log("Cancelling subscription:", subscriptionId);
    // In a real app, this would show a confirmation dialog and process the cancellation
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-balance">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Select the perfect plan for your needs. Upgrade or downgrade at any
            time.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4 bg-muted p-1 rounded-lg">
            <Button
              variant={billingCycle === "monthly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === "yearly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly
              <Badge variant="secondary" className="ml-2">
                Save 17%
              </Badge>
            </Button>
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {mockProducts.map((product) => {
            const isCurrentPlan = activeSubscription?.productId === product.id;
            const price = product.price[billingCycle];

            return (
              <Card
                key={product.id}
                className={`relative ${
                  product.isPopular ? "border-primary shadow-lg" : ""
                }`}
              >
                {product.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <CardDescription className="text-pretty">
                    {product.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-muted-foreground">
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {product.maxUsers || "Unlimited"}
                      </p>
                      <p className="text-xs text-muted-foreground">Users</p>
                    </div>
                    <div>
                      <HardDrive className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm font-medium">{product.storage}</p>
                      <p className="text-xs text-muted-foreground">Storage</p>
                    </div>
                    <div>
                      <Headphones className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm font-medium">{product.support}</p>
                      <p className="text-xs text-muted-foreground">Support</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium">Features included:</p>
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter>
                  {isCurrentPlan ? (
                    <Button className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={product.isPopular ? "default" : "outline"}
                      onClick={() => handleSubscribe(product.id)}
                    >
                      {activeSubscription ? "Switch Plan" : "Get Started"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <div>
              <h3 className="font-semibold mb-2">
                Can I change my plan anytime?
              </h3>
              <p className="text-muted-foreground text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-muted-foreground text-sm">
                We accept eSewa, Khalti, and major credit cards for your
                convenience.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, all plans come with a 14-day free trial. No credit card
                required to start.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground text-sm">
                Absolutely. You can cancel your subscription at any time with no
                cancellation fees.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">
                My Subscriptions
              </h1>
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
              const product = getProductById(subscription.productId);
              if (!product) return null;

              return (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  product={product}
                  onManage={() => handleManageSubscription(subscription.id)}
                  onUpgrade={() => handleUpgradeSubscription(subscription.id)}
                  onCancel={() => handleCancelSubscription(subscription.id)}
                />
              );
            })}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Active Subscriptions</CardTitle>
              <CardDescription>
                You don't have any subscriptions yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Browse our plans to find the perfect subscription for your
                needs.
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
            <CardDescription>
              Manage your payment methods and billing details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Default Payment Method</p>
                <p className="text-sm text-muted-foreground">
                  eSewa Wallet (****@esewa.com)
                </p>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Billing Address</p>
                <p className="text-sm text-muted-foreground">
                  Kathmandu, Nepal
                </p>
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tax Information</p>
                <p className="text-sm text-muted-foreground">
                  VAT ID: Not provided
                </p>
              </div>
              <Button variant="outline" size="sm">
                Add VAT ID
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
