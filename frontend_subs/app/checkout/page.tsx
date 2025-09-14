"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, CreditCard, User, Mail, Phone } from "lucide-react";
import KhaltiPaymentButton from "@/components/payment/khalti-payment-button";
import PaymentStatus from "@/components/payment/payment-status";
import { toast } from "@/hooks/use-toast";

export default function CheckoutPage() {
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [showPaymentStatus, setShowPaymentStatus] = useState(false);

  // Mock product data - replace with actual data from your API
  const product = {
    id: "68bd5c9ee0f8f2ae8a6a5239",
    name: "Premium Subscription",
    description: "Access to all premium features for 1 month",
    price: 1299,
    currency: "NPR",
  };

  const amountBreakdown = {
    subtotal: product.price,
    tax: Math.round(product.price * 0.13), // 13% VAT
    shipping: 0,
    discount: 0,
  };

  const totalAmount = amountBreakdown.subtotal + amountBreakdown.tax + amountBreakdown.shipping - amountBreakdown.discount;

  const handlePaymentSuccess = (paymentData: any) => {
    setPaymentId(paymentData.paymentId);
    setShowPaymentStatus(true);
    toast({
      title: "Payment Initiated",
      description: "Redirecting to Khalti payment page...",
    });
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Error",
      description: error,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Customer Info & Payment */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </CardTitle>
                <CardDescription>
                  Please provide your contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <KhaltiPaymentButton
              productId={product.id}
              amount={totalAmount}
              currency={product.currency}
              customerInfo={customerInfo}
              amountBreakdown={amountBreakdown}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              disabled={!customerInfo.name || !customerInfo.email}
            />
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Details */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.description}</p>
                  </div>
                  <Badge variant="secondary">1 Month</Badge>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{product.currency} {amountBreakdown.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>VAT (13%):</span>
                    <span>{product.currency} {amountBreakdown.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>{product.currency} {amountBreakdown.shipping.toFixed(2)}</span>
                  </div>
                  {amountBreakdown.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-{product.currency} {amountBreakdown.discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>{product.currency} {totalAmount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>PCI DSS compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Secure payment processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>No card details stored</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            {showPaymentStatus && paymentId && (
              <PaymentStatus
                paymentId={paymentId}
                autoRefresh={true}
                refreshInterval={3000}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}