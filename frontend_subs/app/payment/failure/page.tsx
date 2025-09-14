"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentFailurePage() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<{
    message?: string;
    errorCode?: string;
    transactionId?: string;
    amount?: string;
  }>({});

  useEffect(() => {
    const message = searchParams.get("message");
    const errorCode = searchParams.get("errorCode");
    const transactionId = searchParams.get("transactionId");
    const amount = searchParams.get("amount");

    setPaymentData({
      message: message || "Payment could not be completed",
      errorCode: errorCode || undefined,
      transactionId: transactionId || undefined,
      amount: amount || undefined,
    });
  }, [searchParams]);

  const getErrorMessage = (message?: string) => {
    if (!message) return "An unexpected error occurred";
    
    // Common error messages and their user-friendly versions
    const errorMap: { [key: string]: string } = {
      "Payment verification failed": "We couldn't verify your payment. Please try again.",
      "Amount mismatch": "There was a discrepancy in the payment amount. Please contact support.",
      "Payment is still pending": "Your payment is being processed. Please wait a few minutes and refresh.",
      "Payment failed": "The payment could not be completed. Please try again or use a different payment method.",
      "Invalid signature": "There was a security issue with the payment. Please try again.",
      "Missing payment data": "Required payment information was missing. Please try again.",
      "Server error": "Our servers are experiencing issues. Please try again in a few minutes.",
    };

    return errorMap[message] || message;
  };

  const getErrorSuggestions = (message?: string) => {
    if (!message) return ["Try again with a different payment method", "Contact support if the issue persists"];
    
    const suggestions: { [key: string]: string[] } = {
      "Payment verification failed": [
        "Check your internet connection",
        "Try again in a few minutes",
        "Contact support if the issue persists"
      ],
      "Amount mismatch": [
        "Refresh the page and try again",
        "Contact support with your transaction details"
      ],
      "Payment is still pending": [
        "Wait 5-10 minutes and check your payment status",
        "Check your email for payment confirmation"
      ],
      "Payment failed": [
        "Try a different payment method",
        "Check your account balance",
        "Contact your bank if using card payment"
      ],
      "Invalid signature": [
        "Refresh the page and try again",
        "Clear your browser cache and cookies"
      ],
      "Missing payment data": [
        "Go back and complete the payment form again",
        "Ensure all required fields are filled"
      ],
      "Server error": [
        "Wait a few minutes and try again",
        "Contact support if the issue continues"
      ],
    };

    return suggestions[message] || [
      "Try again with a different payment method",
      "Contact support if the issue persists"
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Payment Failed
          </CardTitle>
          <CardDescription className="text-gray-600">
            {getErrorMessage(paymentData.message)}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-900">Error Details</h3>
            {paymentData.transactionId && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-gray-900">
                  {paymentData.transactionId}
                </span>
              </div>
            )}
            {paymentData.amount && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-gray-900">
                  NPR {paymentData.amount}
                </span>
              </div>
            )}
            {paymentData.errorCode && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Error Code:</span>
                <span className="font-mono text-red-600">
                  {paymentData.errorCode}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold text-red-600">Failed</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time:</span>
              <span className="font-semibold text-gray-900">
                {new Date().toLocaleString()}
              </span>
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <HelpCircle className="w-4 h-4 mr-2" />
              What you can do:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {getErrorSuggestions(paymentData.message).map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/checkout">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Support Information */}
          <div className="text-center text-sm text-gray-500">
            <p>
              Need help? Contact our support team at{" "}
              <a 
                href="mailto:support@example.com" 
                className="text-blue-600 hover:underline"
              >
                support@example.com
              </a>
            </p>
            <p className="mt-1">
              Reference: {paymentData.transactionId || "Unknown"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
