"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Loader2, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface KhaltiPaymentButtonProps {
  productId?: string;
  subscriptionId?: string;
  amount: number;
  currency?: string;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  amountBreakdown?: {
    subtotal?: number;
    tax?: number;
    shipping?: number;
    discount?: number;
  };
  onSuccess?: (paymentData: any) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function KhaltiPaymentButton({
  productId,
  subscriptionId,
  amount,
  currency = "NPR",
  customerInfo = {},
  amountBreakdown = {},
  onSuccess,
  onError,
  className,
  disabled = false,
}: KhaltiPaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const initiateKhaltiPayment = async () => {
    try {
      setLoading(true);

      // Get auth token from localStorage or context
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Please log in to make a payment");
      }

      const response = await fetch("/api/payments/khalti", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          subscriptionId,
          amount,
          currency,
          customer_info: {
            name: customerInfo.name || "Customer",
            email: customerInfo.email || "",
            phone: customerInfo.phone || "",
          },
          amount_breakdown: {
            subtotal: amountBreakdown.subtotal || amount,
            tax: amountBreakdown.tax || 0,
            shipping: amountBreakdown.shipping || 0,
            discount: amountBreakdown.discount || 0,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment initiation failed");
      }

      if (data.success && data.data.payment_url) {
        // Redirect to Khalti payment page
        window.location.href = data.data.payment_url;
        
        // Call success callback if provided
        onSuccess?.(data.data);
      } else {
        throw new Error(data.message || "Payment initiation failed");
      }
    } catch (error) {
      console.error("Khalti payment error:", error);
      const errorMessage = error instanceof Error ? error.message : "Payment failed";
      
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Pay with Khalti
        </CardTitle>
        <CardDescription>
          Secure payment powered by Khalti
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount:</span>
            <span className="font-semibold text-lg">
              {currency} {amount.toFixed(2)}
            </span>
          </div>
          
          {amountBreakdown.subtotal && amountBreakdown.subtotal !== amount && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span>{currency} {amountBreakdown.subtotal.toFixed(2)}</span>
            </div>
          )}
          
          {amountBreakdown.tax && amountBreakdown.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span>{currency} {amountBreakdown.tax.toFixed(2)}</span>
            </div>
          )}
          
          {amountBreakdown.shipping && amountBreakdown.shipping > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping:</span>
              <span>{currency} {amountBreakdown.shipping.toFixed(2)}</span>
            </div>
          )}
          
          {amountBreakdown.discount && amountBreakdown.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount:</span>
              <span className="text-green-600">
                -{currency} {amountBreakdown.discount.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Payment Method Info */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Payment Method:</span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            Khalti
          </Badge>
        </div>

        {/* Payment Button */}
        <Button
          onClick={initiateKhaltiPayment}
          disabled={loading || disabled}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4 mr-2" />
              Pay with Khalti
            </>
          )}
        </Button>

        {/* Security Notice */}
        <div className="text-xs text-gray-500 text-center">
          <p>
            Your payment is secured by Khalti's encryption technology.
          </p>
          <p className="mt-1">
            You will be redirected to Khalti's secure payment page.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
