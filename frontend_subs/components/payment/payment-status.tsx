"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Loader2,
  AlertCircle 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PaymentStatusProps {
  paymentId: string;
  onStatusChange?: (status: string) => void;
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    description: "Payment is being processed"
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    description: "Payment is being verified"
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
    description: "Payment was successful"
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    description: "Payment could not be completed"
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    description: "Payment was cancelled"
  },
  refunded: {
    label: "Refunded",
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    description: "Payment has been refunded"
  }
};

export default function PaymentStatus({
  paymentId,
  onStatusChange,
  className,
  autoRefresh = false,
  refreshInterval = 5000,
}: PaymentStatusProps) {
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to view payment status");
      }

      const response = await fetch(`/api/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch payment status");
      }

      const data = await response.json();
      
      if (data.success) {
        setPayment(data.data);
        onStatusChange?.(data.data.status);
      } else {
        throw new Error(data.message || "Failed to fetch payment status");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentStatus();
  }, [paymentId]);

  useEffect(() => {
    if (autoRefresh && payment?.status === "pending") {
      const interval = setInterval(fetchPaymentStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, payment?.status, refreshInterval]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading payment status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Error Loading Payment
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchPaymentStatus} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!payment) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">
              Payment Not Found
            </h3>
          </div>
        </CardContent>
      </Card>
    );
  }

  const status = payment.status as PaymentStatus;
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Payment Status</span>
          <Badge 
            variant="secondary" 
            className={`${config.color} ${config.bgColor} border-0`}
          >
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </CardTitle>
        <CardDescription>
          {config.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Payment Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Amount:</span>
            <p className="font-semibold">
              {payment.currency} {payment.amount?.toFixed(2)}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Method:</span>
            <p className="font-semibold capitalize">{payment.paymentMethod}</p>
          </div>
          <div>
            <span className="text-gray-600">Order ID:</span>
            <p className="font-mono text-xs">{payment.orderId}</p>
          </div>
          <div>
            <span className="text-gray-600">Transaction ID:</span>
            <p className="font-mono text-xs">{payment.transactionUUID}</p>
          </div>
        </div>

        {/* Timestamps */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Created:</span>
            <span>{new Date(payment.createdAt).toLocaleString()}</span>
          </div>
          {payment.paidAt && (
            <div className="flex justify-between">
              <span className="text-gray-600">Paid:</span>
              <span>{new Date(payment.paidAt).toLocaleString()}</span>
            </div>
          )}
          {payment.failedAt && (
            <div className="flex justify-between">
              <span className="text-gray-600">Failed:</span>
              <span>{new Date(payment.failedAt).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Failure Reason */}
        {payment.failureReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-red-800 mb-1">
              Failure Reason:
            </h4>
            <p className="text-sm text-red-700">{payment.failureReason}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={fetchPaymentStatus} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {status === "completed" && (
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard">View Dashboard</a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}