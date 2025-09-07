"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/admin/admin-layout"
import { mockSubscriptions, getProductById } from "@/lib/mock-data"
import { cancelSubscription } from "@/lib/admin-data"
import { Search, Filter, MoreHorizontal, XCircle, Edit, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function AdminSubscriptionsPage() {
  const [subscriptions] = useState(mockSubscriptions)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [billingFilter, setBillingFilter] = useState("all")

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const product = getProductById(subscription.productId)
    const matchesSearch =
      subscription.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.userId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || subscription.status === statusFilter
    const matchesBilling = billingFilter === "all" || subscription.billingCycle === billingFilter

    return matchesSearch && matchesStatus && matchesBilling
  })

  const handleCancelSubscription = (subscriptionId: string) => {
    cancelSubscription(subscriptionId)
    // In a real app, this would update the state
  }

  const totalRevenue = subscriptions.filter((sub) => sub.status === "active").reduce((sum, sub) => sum + sub.amount, 0)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Subscription Management</h1>
          <p className="text-muted-foreground text-pretty">Monitor and manage all platform subscriptions.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriptions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriptions.filter((s) => s.status === "active").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cancelled This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriptions.filter((s) => s.status === "cancelled").length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subscriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Select value={billingFilter} onValueChange={setBillingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Billing Cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cycles</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">Export Data</Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
            <CardDescription>{filteredSubscriptions.length} subscription(s) found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSubscriptions.map((subscription) => {
                const product = getProductById(subscription.productId)

                return (
                  <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-full">
                        <span className="text-sm font-medium">{product?.name.charAt(0) || "S"}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{product?.name || "Unknown Product"}</p>
                          <Badge variant="outline">{subscription.billingCycle}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>ID: {subscription.id}</span>
                          <span>•</span>
                          <span>User: {subscription.userId}</span>
                          <span>•</span>
                          <span>
                            ${subscription.amount}/{subscription.billingCycle}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Started: {new Date(subscription.startDate).toLocaleDateString()} • Ends:{" "}
                          {new Date(subscription.endDate).toLocaleDateString()}
                          {subscription.nextBilling && (
                            <> • Next billing: {new Date(subscription.nextBilling).toLocaleDateString()}</>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          subscription.status === "active"
                            ? "default"
                            : subscription.status === "cancelled"
                              ? "destructive"
                              : subscription.status === "expired"
                                ? "secondary"
                                : "outline"
                        }
                      >
                        {subscription.status}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Subscription
                          </DropdownMenuItem>
                          {subscription.status === "active" && (
                            <DropdownMenuItem onClick={() => handleCancelSubscription(subscription.id)}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel Subscription
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
