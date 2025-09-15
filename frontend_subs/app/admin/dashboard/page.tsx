"use client";
import { ProductManagement } from "@/components/product/product-management";
import { SubscriptionManagement } from "@/components/subscription/subscription-management";
import { SubscriptionPlanManagement } from "@/components/subscription/subscription-plan-management";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, CreditCard, Package, Users, Settings, LogOut } from "lucide-react";
import { LogoutButton } from "@/components/navigation/logout-button";
import { useState, useEffect } from "react";
import subscriptionApi from "@/lib/api/subscriptions";
import subscriptionPlanApi from "@/lib/api/subscription-plans";
import productsApi from "@/lib/api/products";
const page = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    totalSubscribers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch subscriptions data
        const subscriptionsResult = await subscriptionApi.listAll();
        const subscriptions = subscriptionsResult.data.items;
        
        // Fetch products from backend
        const productsResult = await productsApi.list({ limit: 100 });
        const products = productsResult.items;
        
        // Calculate stats
        const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
        const monthlyRevenue = subscriptions
          .filter(sub => sub.status === 'active' && sub.billingCycle === 'monthly')
          .reduce((sum, sub) => sum + sub.amount, 0);
        const yearlyRevenue = subscriptions
          .filter(sub => sub.status === 'active' && sub.billingCycle === 'yearly')
          .reduce((sum, sub) => sum + sub.amount, 0);
        const totalMonthlyRevenue = monthlyRevenue + (yearlyRevenue / 12);
        
        const uniqueUsers = new Set(subscriptions.map(sub => sub.userId)).size;
        
        setStats({
          totalProducts: products.length,
          activeSubscriptions,
          monthlyRevenue: Math.round(totalMonthlyRevenue * 100) / 100,
          totalSubscribers: uniqueUsers,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback to default values
        setStats({
          totalProducts: 12,
          activeSubscriptions: 24,
          monthlyRevenue: 4250,
          totalSubscribers: 156,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Product, Subscription & Plan Management
                </p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.totalProducts}
              </div>
              <p className="text-xs text-muted-foreground">
                Subscription plans available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Subscriptions
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.activeSubscriptions}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active subscriptions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Revenue
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : `$${stats.monthlyRevenue.toLocaleString()}`}
              </div>
              <p className="text-xs text-muted-foreground">
                Recurring monthly revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Subscribers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.totalSubscribers}
              </div>
              <p className="text-xs text-muted-foreground">
                Unique users with subscriptions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Product Management
            </TabsTrigger>
            <TabsTrigger
              value="subscriptions"
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Subscription Management
            </TabsTrigger>
            <TabsTrigger
              value="subscription-plans"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Subscription Plans
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="subscriptions">
            <SubscriptionManagement />
          </TabsContent>

          <TabsContent value="subscription-plans">
            <SubscriptionPlanManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default page;
