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
import { useEffect, useState } from "react";
import subscriptionPlanApi, { SubscriptionPlan, CreateSubscriptionPlanData } from "@/lib/api/subscription-plans";

export function SubscriptionPlanManagement() {
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    planType: "basic" as const,
    monthlyPrice: "",
    yearlyPrice: "",
    currency: "USD",
    features: "",
    billingCycles: [] as string[],
    trialEnabled: false,
    trialDays: "",
    maxUsers: "",
    maxStorage: "",
    maxApiCalls: "",
    maxProjects: "",
    isPopular: false,
    sortOrder: "",
    tags: "",
  });

  // Fetch subscription plans from API
  const fetchSubscriptionPlans = async () => {
    try {
      setLoading(true);
      const result = await subscriptionPlanApi.list();
      setSubscriptionPlans(result.data.items);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
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
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const handleCreatePlan = async () => {
    try {
      const planData: CreateSubscriptionPlanData = {
        name: formData.name,
        description: formData.description,
        planType: formData.planType,
        pricing: {
          monthly: parseFloat(formData.monthlyPrice),
          yearly: parseFloat(formData.yearlyPrice),
          currency: formData.currency,
        },
        features: formData.features
          .split(",")
          .map((f) => ({
            name: f.trim(),
            included: true,
          }))
          .filter((f) => f.name),
        billingCycles: formData.billingCycles,
        trialPeriod: {
          enabled: formData.trialEnabled,
          days: parseInt(formData.trialDays) || 0,
        },
        limits: {
          maxUsers: formData.maxUsers ? parseInt(formData.maxUsers) : undefined,
          maxStorage: formData.maxStorage || undefined,
          maxApiCalls: formData.maxApiCalls ? parseInt(formData.maxApiCalls) : undefined,
          maxProjects: formData.maxProjects ? parseInt(formData.maxProjects) : undefined,
        },
        isPopular: formData.isPopular,
        sortOrder: parseInt(formData.sortOrder) || 0,
        tags: formData.tags.split(",").map((t) => t.trim()).filter((t) => t),
      };

      const result = await subscriptionPlanApi.create(planData);
      setSubscriptionPlans([...subscriptionPlans, result.data]);
      resetForm();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      // For demo purposes, add to local state
      const newPlan: SubscriptionPlan = {
        _id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        planType: formData.planType,
        pricing: {
          monthly: parseFloat(formData.monthlyPrice),
          yearly: parseFloat(formData.yearlyPrice),
          currency: formData.currency,
        },
        features: formData.features
          .split(",")
          .map((f) => ({
            name: f.trim(),
            included: true,
          }))
          .filter((f) => f.name),
        billingCycles: formData.billingCycles,
        trialPeriod: {
          enabled: formData.trialEnabled,
          days: parseInt(formData.trialDays) || 0,
        },
        limits: {
          maxUsers: formData.maxUsers ? parseInt(formData.maxUsers) : undefined,
          maxStorage: formData.maxStorage || undefined,
          maxApiCalls: formData.maxApiCalls ? parseInt(formData.maxApiCalls) : undefined,
          maxProjects: formData.maxProjects ? parseInt(formData.maxProjects) : undefined,
        },
        isPopular: formData.isPopular,
        isActive: true,
        sortOrder: parseInt(formData.sortOrder) || 0,
        tags: formData.tags.split(",").map((t) => t.trim()).filter((t) => t),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSubscriptionPlans([...subscriptionPlans, newPlan]);
      resetForm();
      setIsCreateDialogOpen(false);
    }
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      planType: plan.planType,
      monthlyPrice: plan.pricing.monthly.toString(),
      yearlyPrice: plan.pricing.yearly.toString(),
      currency: plan.pricing.currency,
      features: plan.features.map((f) => f.name).join(", "),
      billingCycles: plan.billingCycles,
      trialEnabled: plan.trialPeriod.enabled,
      trialDays: plan.trialPeriod.days.toString(),
      maxUsers: plan.limits.maxUsers?.toString() || "",
      maxStorage: plan.limits.maxStorage || "",
      maxApiCalls: plan.limits.maxApiCalls?.toString() || "",
      maxProjects: plan.limits.maxProjects?.toString() || "",
      isPopular: plan.isPopular,
      sortOrder: plan.sortOrder.toString(),
      tags: plan.tags.join(", "),
    });
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;

    try {
      const planData: Partial<CreateSubscriptionPlanData> = {
        name: formData.name,
        description: formData.description,
        planType: formData.planType,
        pricing: {
          monthly: parseFloat(formData.monthlyPrice),
          yearly: parseFloat(formData.yearlyPrice),
          currency: formData.currency,
        },
        features: formData.features
          .split(",")
          .map((f) => ({
            name: f.trim(),
            included: true,
          }))
          .filter((f) => f.name),
        billingCycles: formData.billingCycles,
        trialPeriod: {
          enabled: formData.trialEnabled,
          days: parseInt(formData.trialDays) || 0,
        },
        limits: {
          maxUsers: formData.maxUsers ? parseInt(formData.maxUsers) : undefined,
          maxStorage: formData.maxStorage || undefined,
          maxApiCalls: formData.maxApiCalls ? parseInt(formData.maxApiCalls) : undefined,
          maxProjects: formData.maxProjects ? parseInt(formData.maxProjects) : undefined,
        },
        isPopular: formData.isPopular,
        sortOrder: parseInt(formData.sortOrder) || 0,
        tags: formData.tags.split(",").map((t) => t.trim()).filter((t) => t),
      };

      const result = await subscriptionPlanApi.update(editingPlan._id, planData);
      setSubscriptionPlans(subscriptionPlans.map(p => p._id === editingPlan._id ? result.data : p));
      setEditingPlan(null);
      resetForm();
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      // For demo purposes, update local state
      const updatedPlan: SubscriptionPlan = {
        ...editingPlan,
        name: formData.name,
        description: formData.description,
        planType: formData.planType,
        pricing: {
          monthly: parseFloat(formData.monthlyPrice),
          yearly: parseFloat(formData.yearlyPrice),
          currency: formData.currency,
        },
        features: formData.features
          .split(",")
          .map((f) => ({
            name: f.trim(),
            included: true,
          }))
          .filter((f) => f.name),
        billingCycles: formData.billingCycles,
        trialPeriod: {
          enabled: formData.trialEnabled,
          days: parseInt(formData.trialDays) || 0,
        },
        limits: {
          maxUsers: formData.maxUsers ? parseInt(formData.maxUsers) : undefined,
          maxStorage: formData.maxStorage || undefined,
          maxApiCalls: formData.maxApiCalls ? parseInt(formData.maxApiCalls) : undefined,
          maxProjects: formData.maxProjects ? parseInt(formData.maxProjects) : undefined,
        },
        isPopular: formData.isPopular,
        sortOrder: parseInt(formData.sortOrder) || 0,
        tags: formData.tags.split(",").map((t) => t.trim()).filter((t) => t),
        updatedAt: new Date().toISOString(),
      };
      setSubscriptionPlans(subscriptionPlans.map(p => p._id === editingPlan._id ? updatedPlan : p));
      setEditingPlan(null);
      resetForm();
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await subscriptionPlanApi.delete(id);
      setSubscriptionPlans(subscriptionPlans.filter(p => p._id !== id));
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      // For demo purposes, remove from local state
      setSubscriptionPlans(subscriptionPlans.filter(p => p._id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      planType: "basic",
      monthlyPrice: "",
      yearlyPrice: "",
      currency: "USD",
      features: "",
      billingCycles: [],
      trialEnabled: false,
      trialDays: "",
      maxUsers: "",
      maxStorage: "",
      maxApiCalls: "",
      maxProjects: "",
      isPopular: false,
      sortOrder: "",
      tags: "",
    });
  };

  const getPlanTypeBadge = (type: string) => {
    const colors = {
      basic: "bg-blue-100 text-blue-800",
      premium: "bg-green-100 text-green-800",
      enterprise: "bg-purple-100 text-purple-800",
      custom: "bg-orange-100 text-orange-800",
    } as const;

    return (
      <Badge className={colors[type as keyof typeof colors]}>
        {type}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading subscription plans...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Subscription Plan Management
          </h2>
          <p className="text-muted-foreground">
            Create and manage subscription plans independently of products
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Subscription Plan</DialogTitle>
              <DialogDescription>
                Create a subscription plan with pricing, features, and limits
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Professional Plan"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="planType">Plan Type</Label>
                  <Select
                    value={formData.planType}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, planType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="monthlyPrice">Monthly Price ($)</Label>
                  <Input
                    id="monthlyPrice"
                    type="number"
                    step="0.01"
                    value={formData.monthlyPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyPrice: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="yearlyPrice">Yearly Price ($)</Label>
                  <Input
                    id="yearlyPrice"
                    type="number"
                    step="0.01"
                    value={formData.yearlyPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, yearlyPrice: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="NPR">NPR</SelectItem>
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

              <div className="grid gap-2">
                <Label>Billing Cycles</Label>
                <div className="flex gap-2">
                  {["monthly", "yearly", "quarterly", "weekly"].map((cycle) => (
                    <label key={cycle} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.billingCycles.includes(cycle)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              billingCycles: [...formData.billingCycles, cycle],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              billingCycles: formData.billingCycles.filter(
                                (c) => c !== cycle
                              ),
                            });
                          }
                        }}
                      />
                      <span className="text-sm capitalize">{cycle}</span>
                    </label>
                  ))}
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
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="trialEnabled"
                    checked={formData.trialEnabled}
                    onChange={(e) =>
                      setFormData({ ...formData, trialEnabled: e.target.checked })
                    }
                  />
                  <Label htmlFor="trialEnabled">Enable Trial</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="maxUsers">Max Users</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    value={formData.maxUsers}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUsers: e.target.value })
                    }
                    placeholder="Unlimited"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxStorage">Max Storage</Label>
                  <Input
                    id="maxStorage"
                    value={formData.maxStorage}
                    onChange={(e) =>
                      setFormData({ ...formData, maxStorage: e.target.value })
                    }
                    placeholder="e.g., 10GB, unlimited"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="maxApiCalls">Max API Calls</Label>
                  <Input
                    id="maxApiCalls"
                    type="number"
                    value={formData.maxApiCalls}
                    onChange={(e) =>
                      setFormData({ ...formData, maxApiCalls: e.target.value })
                    }
                    placeholder="Unlimited"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxProjects">Max Projects</Label>
                  <Input
                    id="maxProjects"
                    type="number"
                    value={formData.maxProjects}
                    onChange={(e) =>
                      setFormData({ ...formData, maxProjects: e.target.value })
                    }
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, sortOrder: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={formData.isPopular}
                    onChange={(e) =>
                      setFormData({ ...formData, isPopular: e.target.checked })
                    }
                  />
                  <Label htmlFor="isPopular">Popular Plan</Label>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="business, professional, team"
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
              <Button onClick={handleCreatePlan}>
                Create Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>
            Manage subscription plans with pricing, features, and limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Details</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Trial</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptionPlans.map((plan) => (
                <TableRow key={plan._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {plan.description}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {plan.features
                          .slice(0, 2)
                          .map((feature, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {feature.name}
                            </Badge>
                          ))}
                        {plan.features.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{plan.features.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getPlanTypeBadge(plan.planType)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="text-sm">
                          {plan.pricing.currency} {plan.pricing.monthly}/mo
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="text-sm">
                          {plan.pricing.currency} {plan.pricing.yearly}/yr
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {plan.billingCycles.map((cycle) => (
                        <Badge key={cycle} variant="outline" className="text-xs">
                          {cycle}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span className="text-sm">
                        {plan.trialPeriod.enabled ? `${plan.trialPeriod.days} days` : "No trial"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getStatusBadge(plan.isActive)}
                      {plan.isPopular && (
                        <Badge variant="secondary" className="text-xs">
                          Popular
                        </Badge>
                      )}
                    </div>
                  </TableCell>
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
                            onClick={() => handleEditPlan(plan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Subscription Plan</DialogTitle>
                            <DialogDescription>
                              Update subscription plan details
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            {/* Same form fields as create dialog */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-name">Plan Name</Label>
                                <Input
                                  id="edit-name"
                                  value={formData.name}
                                  onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-planType">Plan Type</Label>
                                <Select
                                  value={formData.planType}
                                  onValueChange={(value: any) =>
                                    setFormData({ ...formData, planType: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="basic">Basic</SelectItem>
                                    <SelectItem value="premium">Premium</SelectItem>
                                    <SelectItem value="enterprise">Enterprise</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            {/* Add other form fields here - same as create form */}
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setEditingPlan(null)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleUpdatePlan}>
                              Update Plan
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePlan(plan._id)}
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
