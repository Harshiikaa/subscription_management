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
import { useState } from "react";

interface Subscription {
  id: string;
  productId: string;
  productName: string;
  planName: string;
  description: string;
  price: number;
  billingCycle: "monthly" | "yearly" | "weekly";
  trialDays: number;
  features: string[];
  status: "active" | "inactive" | "draft";
  createdAt: string;
}

export function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: "1",
      productId: "1",
      productName: "Premium Plan",
      planName: "Premium Monthly",
      description: "Monthly subscription with full access",
      price: 29.99,
      billingCycle: "monthly",
      trialDays: 14,
      features: ["Unlimited access", "Priority support", "Advanced analytics"],
      status: "active",
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      productId: "1",
      productName: "Premium Plan",
      planName: "Premium Yearly",
      description: "Yearly subscription with 20% discount",
      price: 299.99,
      billingCycle: "yearly",
      trialDays: 30,
      features: [
        "Unlimited access",
        "Priority support",
        "Advanced analytics",
        "20% discount",
      ],
      status: "active",
      createdAt: "2024-01-15",
    },
    {
      id: "3",
      productId: "2",
      productName: "Basic Plan",
      planName: "Basic Monthly",
      description: "Monthly basic subscription",
      price: 9.99,
      billingCycle: "monthly",
      trialDays: 7,
      features: ["Basic access", "Email support"],
      status: "active",
      createdAt: "2024-01-10",
    },
  ]);

  const [products] = useState([
    { id: "1", name: "Premium Plan" },
    { id: "2", name: "Basic Plan" },
    { id: "3", name: "Enterprise Plan" },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [formData, setFormData] = useState({
    productId: "",
    planName: "",
    description: "",
    price: "",
    billingCycle: "monthly" as const,
    trialDays: "",
    features: "",
    status: "draft" as const,
  });

  const handleCreateSubscription = () => {
    const selectedProduct = products.find((p) => p.id === formData.productId);
    const newSubscription: Subscription = {
      id: Date.now().toString(),
      productId: formData.productId,
      productName: selectedProduct?.name || "",
      planName: formData.planName,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      billingCycle: formData.billingCycle,
      trialDays: Number.parseInt(formData.trialDays),
      features: formData.features
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f),
      status: formData.status,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setSubscriptions([...subscriptions, newSubscription]);
    resetForm();
    setIsCreateDialogOpen(false);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      productId: subscription.productId,
      planName: subscription.planName,
      description: subscription.description,
      price: subscription.price.toString(),
      billingCycle: subscription.billingCycle,
      trialDays: subscription.trialDays.toString(),
      features: subscription.features.join(", "),
      status: subscription.status,
    });
  };

  const handleUpdateSubscription = () => {
    if (!editingSubscription) return;

    const selectedProduct = products.find((p) => p.id === formData.productId);
    const updatedSubscriptions = subscriptions.map((s) =>
      s.id === editingSubscription.id
        ? {
            ...s,
            productId: formData.productId,
            productName: selectedProduct?.name || "",
            planName: formData.planName,
            description: formData.description,
            price: Number.parseFloat(formData.price),
            billingCycle: formData.billingCycle,
            trialDays: Number.parseInt(formData.trialDays),
            features: formData.features
              .split(",")
              .map((f) => f.trim())
              .filter((f) => f),
            status: formData.status,
          }
        : s
    );
    setSubscriptions(updatedSubscriptions);
    setEditingSubscription(null);
    resetForm();
  };

  const handleDeleteSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter((s) => s.id !== id));
  };

  const resetForm = () => {
    setFormData({
      productId: "",
      planName: "",
      description: "",
      price: "",
      billingCycle: "monthly",
      trialDays: "",
      features: "",
      status: "draft",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      draft: "outline",
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
      weekly: "bg-purple-100 text-purple-800",
    } as const;

    return (
      <Badge className={colors[cycle as keyof typeof colors]}>{cycle}</Badge>
    );
  };

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
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>
            Manage subscription plans and pricing for your products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Details</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Trial</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{subscription.planName}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {subscription.description}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {subscription.features
                          .slice(0, 2)
                          .map((feature, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {feature}
                            </Badge>
                          ))}
                        {subscription.features.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{subscription.features.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{subscription.productName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {subscription.price}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getBillingCycleBadge(subscription.billingCycle)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {subscription.trialDays} days
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
                          handleDeleteSubscription(subscription.id)
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
