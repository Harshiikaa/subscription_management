"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, CreditCard, Users, HardDrive, TrendingUp } from "lucide-react"
import type { Subscription, Product } from "@/lib/mock-data"

interface SubscriptionCardProps {
  subscription: Subscription
  product: Product
  onManage?: () => void
  onUpgrade?: () => void
  onCancel?: () => void
}

export function SubscriptionCard({ subscription, product, onManage, onUpgrade, onCancel }: SubscriptionCardProps) {
  const daysUntilRenewal = subscription.nextBilling
    ? Math.ceil((new Date(subscription.nextBilling).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const usagePercentage = Math.floor(Math.random() * 80) + 10 // Mock usage data

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {product.name}
            </CardTitle>
            <CardDescription>{product.description}</CardDescription>
          </div>
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
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Billing Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Billing
            </div>
            <p className="text-2xl font-bold">${subscription.amount}</p>
            <p className="text-sm text-muted-foreground">
              per {subscription.billingCycle === "monthly" ? "month" : "year"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Next Billing
            </div>
            <p className="text-lg font-semibold">
              {subscription.nextBilling ? new Date(subscription.nextBilling).toLocaleDateString() : "N/A"}
            </p>
            <p className="text-sm text-muted-foreground">
              {daysUntilRenewal > 0 ? `in ${daysUntilRenewal} days` : "Expired"}
            </p>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="space-y-4">
          <h4 className="font-medium">Usage Overview</h4>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Users
                </span>
                <span>
                  {Math.floor((usagePercentage * (product.maxUsers || 100)) / 100)} / {product.maxUsers || "Unlimited"}
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Storage
                </span>
                <span>
                  {Math.floor(usagePercentage * 0.8)}% of {product.storage}
                </span>
              </div>
              <Progress value={usagePercentage * 0.8} className="h-2" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {onManage && (
            <Button variant="outline" onClick={onManage}>
              Manage Plan
            </Button>
          )}
          {onUpgrade && subscription.status === "active" && <Button onClick={onUpgrade}>Upgrade</Button>}
          {onCancel && subscription.status === "active" && (
            <Button variant="destructive" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
