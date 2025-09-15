"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, DollarSign, Edit, Eye, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import subscriptionApi, { Subscription } from "@/lib/api/subscriptions";
import productsApi from "@/lib/api/products";

export function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<string>("");
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [formData, setFormData] = useState({
    userId: "",
    productId: "",
    subscriptionPlanId: "",
    subscriptionType: "product" as const,
    billingCycle: "monthly" as const,
    currency: "USD",
    amount: "",
    startDate: "",
    endDate: "",
    trialEndsAt: "",
  });

  // Fetch subscriptions from API
  const fetchSubscriptions = async (statusFilter?: string, userIdFilter?: string) => {
    try {
      setLoading(true);
      setError(null);
      if (userIdFilter && userIdFilter.trim().length > 0) {
        const result = await subscriptionApi.getByUser(userIdFilter.trim());
        setSubscriptions(result.data);
      } else {
        const result = await subscriptionApi.listAll({ status: statusFilter });
        setSubscriptions(result.data.items);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setError('Failed to load subscriptions');
      // Fallback to mock data if API fails
      setSubscriptions([
        {
          _id: "1",
          userId: "user1",
          productId: "product1",
          subscriptionType: "product",
          status: "active",
          billingCycle: "monthly",
          currency: "USD",
          amount: 29.99,
          startDate: "2024-01-15T00:00:00.000Z",
          nextBilling: "2024-02-15T00:00:00.000Z",
          createdAt: "2024-01-15T00:00:00.000Z",
          updatedAt: "2024-01-15T00:00:00.000Z",
          product: {
            _id: "product1",
            name: "Premium Plan",
            description: "Monthly subscription with full access"
          }
        },
        {
          _id: "2",
          userId: "user2",
          subscriptionPlanId: "plan1",
          subscriptionType: "plan",
          status: "active",
          billingCycle: "yearly",
          currency: "USD",
          amount: 299.99,
          startDate: "2024-01-15T00:00:00.000Z",
          nextBilling: "2025-01-15T00:00:00.000Z",
          createdAt: "2024-01-15T00:00:00.000Z",
          updatedAt: "2024-01-15T00:00:00.000Z",
          subscriptionPlan: {
            _id: "plan1",
            name: "Professional Plan",
            description: "Yearly subscription with 20% discount"
          }
        },
        {
          _id: "3",
          userId: "user3",
          productId: "product2",
          subscriptionType: "product",
          status: "trial",
          billingCycle: "monthly",
          currency: "USD",
          amount: 9.99,
          startDate: "2024-01-10T00:00:00.000Z",
          trialEndsAt: "2024-01-17T00:00:00.000Z",
          createdAt: "2024-01-10T00:00:00.000Z",
          updatedAt: "2024-01-10T00:00:00.000Z",
          product: {
            _id: "product2",
            name: "Basic Plan",
            description: "Monthly basic subscription"
          }
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    // fetch products for select dropdowns
    (async () => {
      try {
        const data = await productsApi.list({ limit: 100 });
        const items = data.items.map((p: any) => ({ id: p._id, name: p.name }));
        setProducts(items);
      } catch (e) {
        // ignore silently for now; dropdown will be empty
      }
    })();
  }, []);

  const handleCreateSubscription = async () => {
    try {
      const subscriptionData = {
        userId: formData.userId,
        productId: formData.productId || undefined,
        subscriptionPlanId: formData.subscriptionPlanId || undefined,
        subscriptionType: formData.subscriptionType,
        billingCycle: formData.billingCycle,
        currency: formData.currency,
        amount: Number.parseFloat(formData.amount),
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        trialEndsAt: formData.trialEndsAt || undefined,
      };

      let result;
      if (formData.subscriptionType === "product") {
        result = await subscriptionApi.createFromProduct({
          productId: formData.productId,
          billingCycle: formData.billingCycle,
          currency: formData.currency,
        });
      } else {
        result = await subscriptionApi.createFromPlan({
          subscriptionPlanId: formData.subscriptionPlanId,
          billingCycle: formData.billingCycle,
          currency: formData.currency,
        });
      }

      setSubscriptions([...subscriptions, result.data]);
      resetForm();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating subscription:', error);
      // For demo purposes, add to local state
      const newSubscription: Subscription = {
        _id: Date.now().toString(),
        userId: formData.userId,
        productId: formData.productId || undefined,
        subscriptionPlanId: formData.subscriptionPlanId || undefined,
        subscriptionType: formData.subscriptionType,
        status: "active",
        billingCycle: formData.billingCycle,
        currency: formData.currency,
        amount: Number.parseFloat(formData.amount),
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        trialEndsAt: formData.trialEndsAt || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSubscriptions([...subscriptions, newSubscription]);
      resetForm();
      setIsCreateDialogOpen(false);
    }
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      userId: subscription.userId,
      productId: subscription.productId || "",
      subscriptionPlanId: subscription.subscriptionPlanId || "",
      subscriptionType: subscription.subscriptionType,
      billingCycle: subscription.billingCycle,
      currency: subscription.currency,
      amount: subscription.amount.toString(),
      startDate: subscription.startDate.split('T')[0],
      endDate: subscription.endDate ? subscription.endDate.split('T')[0] : "",
      trialEndsAt: subscription.trialEndsAt ? subscription.trialEndsAt.split('T')[0] : "",
    });
  };

  const handleUpdateSubscription = async () => {
    if (!editingSubscription) return;

    try {
      const updateData = {
        userId: formData.userId,
        productId: formData.productId || undefined,
        subscriptionPlanId: formData.subscriptionPlanId || undefined,
        subscriptionType: formData.subscriptionType,
        billingCycle: formData.billingCycle,
        currency: formData.currency,
        amount: Number.parseFloat(formData.amount),
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        trialEndsAt: formData.trialEndsAt || undefined,
      };

      const result = await subscriptionApi.update(editingSubscription._id, updateData);
      setSubscriptions(subscriptions.map(s => s._id === editingSubscription._id ? result.data : s));
      setEditingSubscription(null);
      resetForm();
    } catch (error) {
      console.error('Error updating subscription:', error);
      // For demo purposes, update local state
      const updatedSubscriptions = subscriptions.map((s) =>
        s._id === editingSubscription._id
          ? {
              ...s,
              userId: formData.userId,
              productId: formData.productId || undefined,
              subscriptionPlanId: formData.subscriptionPlanId || undefined,
              subscriptionType: formData.subscriptionType,
              billingCycle: formData.billingCycle,
              currency: formData.currency,
              amount: Number.parseFloat(formData.amount),
              startDate: formData.startDate,
              endDate: formData.endDate || undefined,
              trialEndsAt: formData.trialEndsAt || undefined,
              updatedAt: new Date().toISOString(),
            }
          : s
      );
      setSubscriptions(updatedSubscriptions);
      setEditingSubscription(null);
      resetForm();
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    try {
      await subscriptionApi.cancel(id);
      setSubscriptions(subscriptions.filter((s) => s._id !== id));
    } catch (error) {
      console.error('Error deleting subscription:', error);
      // For demo purposes, remove from local state
      setSubscriptions(subscriptions.filter((s) => s._id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      userId: "",
      productId: "",
      subscriptionPlanId: "",
      subscriptionType: "product",
      billingCycle: "monthly",
      currency: "USD",
      amount: "",
      startDate: "",
      endDate: "",
      trialEndsAt: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      cancelled: "destructive",
      expired: "outline",
      trial: "secondary",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const getBillingCycleBadge = (cycle: string) => {
    const colors = {
      monthly: "bg-blue-100 text-blue-800",
      yearly: "bg-green-100 text-green-800",
      quarterly: "bg-orange-100 text-orange-800",
      weekly: "bg-purple-100 text-purple-800",
    } as const;

    return (
      <Badge className={colors[cycle as keyof typeof colors]}>{cycle}</Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading subscriptions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Subscription Management
          </h2>
          <p className="text-muted-foreground">
            Create and manage subscription plans for your products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter by User ID"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" onClick={() => fetchSubscriptions(undefined, userFilter)}>
            Apply
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setUserFilter("");
              fetchSubscriptions();
            }}
          >
            Clear
          </Button>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Subscription Plan</DialogTitle>
              <DialogDescription>
                Create a subscription plan for one of your products
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="product">Product</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, productId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="planName">Plan Name</Label>
                <Input
                  id="planName"
                  value={formData.planName}
                  onChange={(e) =>
                    setFormData({ ...formData, planName: e.target.value })
                  }
                  placeholder="e.g., Premium Monthly"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe this subscription plan"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="billingCycle">Billing Cycle</Label>
                  <Select
                    value={formData.billingCycle}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, billingCycle: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="trialDays">Trial Days</Label>
                  <Input
                    id="trialDays"
                    type="number"
                    value={formData.trialDays}
                    onChange={(e) =>
                      setFormData({ ...formData, trialDays: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="features">Features (comma-separated)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) =>
                    setFormData({ ...formData, features: e.target.value })
                  }
                  placeholder="Feature 1, Feature 2, Feature 3"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateSubscription}>
                Create Subscription
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

        <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>
            Manage all user subscriptions and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subscription Details</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Next Billing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {subscription.subscriptionType === "product"
                          ? (
                              typeof subscription.productId === "object"
                                ? (subscription.productId as any).name
                                : subscription.product?.name || "Unknown Product"
                            )
                          : (
                              subscription.subscriptionPlan?.name ||
                              (typeof subscription.subscriptionPlanId === "object"
                                ? (subscription.subscriptionPlanId as any).name
                                : "Unknown Plan")
                            )}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {subscription.subscriptionType === "product"
                          ? (
                              typeof subscription.productId === "object"
                                ? (subscription.productId as any).description || ""
                                : subscription.product?.description || ""
                            )
                          : (
                              subscription.subscriptionPlan?.description ||
                              (typeof subscription.subscriptionPlanId === "object"
                                ? (subscription.subscriptionPlanId as any).description || ""
                                : "")
                            )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Started: {new Date(subscription.startDate).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {(
                          typeof subscription.userId === "object"
                            ? (subscription.userId as any).name
                            : subscription.user?.name
                        ) || "Unknown User"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {typeof subscription.userId === "object"
                          ? (subscription.userId as any).email
                          : subscription.user?.email || String(subscription.userId)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {subscription.subscriptionType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {subscription.currency} {subscription.amount}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getBillingCycleBadge(subscription.billingCycle)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {subscription.nextBilling 
                        ? new Date(subscription.nextBilling).toLocaleDateString()
                        : "N/A"
                      }
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSubscription(subscription)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Edit Subscription Plan</DialogTitle>
                            <DialogDescription>
                              Update subscription plan details
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-product">Product</Label>
                              <Select
                                value={formData.productId}
                                onValueChange={(value) =>
                                  setFormData({ ...formData, productId: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map((product) => (
                                    <SelectItem
                                      key={product.id}
                                      value={product.id}
                                    >
                                      {product.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-planName">Plan Name</Label>
                              <Input
                                id="edit-planName"
                                value={formData.planName}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    planName: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-description">
                                Description
                              </Label>
                              <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    description: e.target.value,
                                  })
                                }
                                rows={2}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-price">Price ($)</Label>
                                <Input
                                  id="edit-price"
                                  type="number"
                                  step="0.01"
                                  value={formData.price}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      price: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-billingCycle">
                                  Billing Cycle
                                </Label>
                                <Select
                                  value={formData.billingCycle}
                                  onValueChange={(value: any) =>
                                    setFormData({
                                      ...formData,
                                      billingCycle: value,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="weekly">
                                      Weekly
                                    </SelectItem>
                                    <SelectItem value="monthly">
                                      Monthly
                                    </SelectItem>
                                    <SelectItem value="yearly">
                                      Yearly
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-trialDays">
                                  Trial Days
                                </Label>
                                <Input
                                  id="edit-trialDays"
                                  type="number"
                                  value={formData.trialDays}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      trialDays: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-status">Status</Label>
                                <Select
                                  value={formData.status}
                                  onValueChange={(value: any) =>
                                    setFormData({ ...formData, status: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="active">
                                      Active
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                      Inactive
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-features">
                                Features (comma-separated)
                              </Label>
                              <Textarea
                                id="edit-features"
                                value={formData.features}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    features: e.target.value,
                                  })
                                }
                                rows={2}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setEditingSubscription(null)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleUpdateSubscription}>
                              Update Subscription
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteSubscription(subscription._id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
