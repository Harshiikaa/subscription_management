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
import subscriptionPlanApi, { SubscriptionPlan } from "@/lib/api/subscription-plans";
import subscriptionApi, { Subscription } from "@/lib/api/subscriptions";

export default function SubscriptionsPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  
  // User subscriptions state
  const [userSubscriptions, setUserSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [subscriptionsError, setSubscriptionsError] = useState<string | null>(null);

  // Fetch subscription plans from API
  const fetchSubscriptionPlans = async () => {
    try {
      setPlansLoading(true);
      setPlansError(null);
      const result = await subscriptionPlanApi.list({ includeInactive: false });
      setSubscriptionPlans(result.data.items);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      setPlansError('Failed to load subscription plans');
      // Fallback to mock data if API fails
      setSubscriptionPlans([
        {
          _id: "1",
          name: "Basic Plan",
          description: "Perfect for individuals and small teams getting started",
          planType: "basic",
          pricing: { monthly: 9.99, yearly: 99.99, currency: "USD" },
          features: [
            { name: "5GB Storage", description: "Secure cloud storage", included: true },
            { name: "Basic Support", description: "Email support", included: true },
          ],
          billingCycles: ["monthly", "yearly"],
          trialPeriod: { enabled: true, days: 14 },
          limits: { maxUsers: 5, maxStorage: "5GB", maxApiCalls: 1000, maxProjects: 3 },
          isPopular: false,
          isActive: true,
          sortOrder: 1,
          tags: ["basic", "starter"],
          createdAt: "2024-01-15T00:00:00.000Z",
          updatedAt: "2024-01-15T00:00:00.000Z",
        },
        {
          _id: "2",
          name: "Professional Plan",
          description: "Advanced features for growing businesses and teams",
          planType: "premium",
          pricing: { monthly: 29.99, yearly: 299.99, currency: "USD" },
          features: [
            { name: "100GB Storage", description: "Ample cloud storage", included: true },
            { name: "Priority Support", description: "24/7 priority support", included: true },
            { name: "Advanced Analytics", description: "Detailed usage analytics", included: true },
          ],
          billingCycles: ["monthly", "yearly"],
          trialPeriod: { enabled: true, days: 30 },
          limits: { maxUsers: 25, maxStorage: "100GB", maxApiCalls: 10000, maxProjects: 15 },
          isPopular: true,
          isActive: true,
          sortOrder: 2,
          tags: ["professional", "business"],
          createdAt: "2024-01-15T00:00:00.000Z",
          updatedAt: "2024-01-15T00:00:00.000Z",
        },
        {
          _id: "3",
          name: "Enterprise Plan",
          description: "Complete solution for large organizations",
          planType: "enterprise",
          pricing: { monthly: 99.99, yearly: 999.99, currency: "USD" },
          features: [
            { name: "Unlimited Storage", description: "No storage limits", included: true },
            { name: "Dedicated Support", description: "Personal account manager", included: true },
            { name: "Custom Integrations", description: "Tailored integrations", included: true },
            { name: "Advanced Security", description: "Enterprise-grade security", included: true },
          ],
          billingCycles: ["monthly", "yearly"],
          trialPeriod: { enabled: true, days: 30 },
          limits: { maxUsers: null, maxStorage: "Unlimited", maxApiCalls: null, maxProjects: null },
          isPopular: false,
          isActive: true,
          sortOrder: 3,
          tags: ["enterprise", "large"],
          createdAt: "2024-01-15T00:00:00.000Z",
          updatedAt: "2024-01-15T00:00:00.000Z",
        },
      ]);
    } finally {
      setPlansLoading(false);
    }
  };

  // Fetch user subscriptions from API
  const fetchUserSubscriptions = async () => {
    if (!isAuthenticated) return;
    
    try {
      setSubscriptionsLoading(true);
      setSubscriptionsError(null);
      const result = await subscriptionApi.listMy({ limit: 50 });
      // API returns an array in data
      setUserSubscriptions(result.data);
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      setSubscriptionsError('Failed to load subscriptions');
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    } else if (isAuthenticated) {
      fetchSubscriptionPlans();
      fetchUserSubscriptions();
    }
  }, [isAuthenticated, isLoading, router]);

  // Note: avoid early return before all hooks are declared

  // Use API data instead of mock data
  const activeSubscription = userSubscriptions.find(
    (sub) => sub.status === "active"
  );

  const handleSubscribe = (planId: string) => {
    const productId = searchParams.get("product");
    if (productId) {
      // If coming from products page, redirect to billing with both product and plan
      router.push(`/dashboard/billing?product=${productId}&plan=${planId}&billing=${billingCycle}`);
    } else {
      // If coming directly to subscriptions, redirect to checkout
      router.push(`/checkout?plan=${planId}&billing=${billingCycle}`);
    }
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
            Choose Your Subscription Plan
          </h1>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Select the perfect subscription plan for your needs. Upgrade or downgrade at any
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

        {/* Subscription Plan Cards */}
        {plansLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading subscription plans...</div>
          </div>
        ) : plansError ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-destructive">{plansError}</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {subscriptionPlans.map((plan) => {
              const isCurrentPlan = activeSubscription?.productId === plan._id;
              const price = billingCycle === "monthly" ? plan.pricing.monthly : plan.pricing.yearly;

              return (
                <Card
                  key={plan._id}
                  className={`relative ${
                    plan.isPopular ? "border-primary shadow-lg" : ""
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-pretty">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        {plan.pricing.currency} {price}
                      </span>
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
                          {plan.limits.maxUsers || "Unlimited"}
                        </p>
                        <p className="text-xs text-muted-foreground">Users</p>
                      </div>
                      <div>
                        <HardDrive className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {plan.limits.maxStorage || "Unlimited"}
                        </p>
                        <p className="text-xs text-muted-foreground">Storage</p>
                      </div>
                      <div>
                        <Headphones className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {plan.trialPeriod.enabled ? `${plan.trialPeriod.days} days trial` : "No trial"}
                        </p>
                        <p className="text-xs text-muted-foreground">Trial</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium">Features included:</p>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                            {feature.name}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium">Billing cycles:</p>
                      <div className="flex flex-wrap gap-1">
                        {plan.billingCycles.map((cycle) => (
                          <Badge key={cycle} variant="outline" className="text-xs">
                            {cycle}
                          </Badge>
                        ))}
                      </div>
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
                        variant={plan.isPopular ? "default" : "outline"}
                        onClick={() => handleSubscribe(plan._id)}
                      >
                        {activeSubscription ? "Switch Plan" : "Get Started"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

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

        {subscriptionsLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading subscriptions...</p>
          </div>
        ) : subscriptionsError ? (
          <div className="text-center py-8">
            <p className="text-destructive">{subscriptionsError}</p>
            <Button 
              variant="outline" 
              onClick={fetchUserSubscriptions}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        ) : userSubscriptions.length > 0 ? (
          <div className="space-y-6">
            {userSubscriptions.map((subscription) => {
              // Handle both populated product object and plain id
              const product = typeof (subscription as any).productId === 'object'
                ? {
                    id: (subscription as any).productId._id || (subscription as any).productId.id || '',
                    name: (subscription as any).productId.name,
                    description: (subscription as any).productId.description,
                    features: (subscription as any).productId.features || [],
                    price: (subscription as any).productId.price || { monthly: subscription.amount, yearly: subscription.amount * 12 },
                    category: "basic" as const,
                    maxUsers: (subscription as any).productId.maxUsers,
                    storage: (subscription as any).productId.storage,
                    support: (subscription as any).productId.support,
                    trialDays: (subscription as any).productId.trialDays,
                  }
                : (subscription.productId ? getProductById(subscription.productId as any) : null);

              // Convert API subscription to the format expected by SubscriptionCard
              const subscriptionForCard = {
                id: subscription._id,
                userId: subscription.userId,
                productId: subscription.productId || '',
                status: subscription.status,
                billingCycle: subscription.billingCycle,
                startDate: subscription.startDate,
                endDate: subscription.endDate || '',
                nextBilling: subscription.nextBilling,
                amount: subscription.amount,
                paymentMethod: subscription.paymentMethod || 'card',
                trialEndsAt: subscription.trialEndsAt,
                cancelledAt: subscription.cancelledAt,
                cancelReason: subscription.cancelReason,
              };

              return (
                <SubscriptionCard
                  key={subscription._id}
                  subscription={subscriptionForCard}
                  product={product}
                  onManage={() => handleManageSubscription(subscription._id)}
                  onUpgrade={() => handleUpgradeSubscription(subscription._id)}
                  onCancel={() => handleCancelSubscription(subscription._id)}
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
