"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw } from "lucide-react"

interface PaymentStatusProps {
  status: "success" | "failed" | "pending" | "processing"
  amount: number
  transactionId: string
  paymentMethod: string
  onRetry?: () => void
  onViewDetails?: () => void
}

export function PaymentStatus({
  status,
  amount,
  transactionId,
  paymentMethod,
  onRetry,
  onViewDetails,
}: PaymentStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-12 w-12 text-green-600" />
      case "failed":
        return <XCircle className="h-12 w-12 text-red-600" />
      case "pending":
        return <Clock className="h-12 w-12 text-yellow-600" />
      case "processing":
        return <RefreshCw className="h-12 w-12 text-blue-600 animate-spin" />
      default:
        return <AlertTriangle className="h-12 w-12 text-gray-600" />
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case "success":
        return {
          title: "Payment Successful!",
          description: "Your payment has been processed successfully.",
          variant: "default" as const,
        }
      case "failed":
        return {
          title: "Payment Failed",
          description: "There was an issue processing your payment. Please try again.",
          variant: "destructive" as const,
        }
      case "pending":
        return {
          title: "Payment Pending",
          description: "Your payment is being processed. This may take a few minutes.",
          variant: "secondary" as const,
        }
      case "processing":
        return {
          title: "Processing Payment",
          description: "Please wait while we process your payment...",
          variant: "secondary" as const,
        }
      default:
        return {
          title: "Unknown Status",
          description: "Payment status is unknown.",
          variant: "outline" as const,
        }
    }
  }

  const statusInfo = getStatusMessage()

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">{getStatusIcon()}</div>
        <CardTitle className="text-xl">{statusInfo.title}</CardTitle>
        <p className="text-muted-foreground">{statusInfo.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center">
          <Badge variant={statusInfo.variant} className="mb-2">
            {status.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Transaction ID:</span>
            <span className="font-medium">{transactionId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Method:</span>
            <span className="font-medium">{paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          {status === "failed" && onRetry && (
            <Button onClick={onRetry} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Payment
            </Button>
          )}
          {onViewDetails && (
            <Button variant="outline" onClick={onViewDetails} className="flex-1 bg-transparent">
              View Details
            </Button>
          )}
          {status === "success" && <Button className="w-full">Continue to Dashboard</Button>}
        </div>
      </CardContent>
    </Card>
  )
}
