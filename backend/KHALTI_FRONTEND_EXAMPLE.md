# Khalti Payment Integration - Frontend Example

This document shows how to integrate Khalti payments in your frontend application.

## React/Next.js Integration Example

### 1. Payment Initiation Component

```jsx
import React, { useState } from "react";
import axios from "axios";

const KhaltiPayment = ({
  productId,
  subscriptionId,
  amount,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);

  const initiateKhaltiPayment = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        "/api/payments/khalti",
        {
          productId,
          subscriptionId,
          amount,
          currency: "NPR",
          customer_info: {
            name: "Customer Name",
            email: "customer@example.com",
            phone: "9841234567",
          },
          amount_breakdown: {
            subtotal: amount,
            tax: 0,
            shipping: 0,
            discount: 0,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Redirect to Khalti payment page
        window.location.href = response.data.data.payment_url;
      } else {
        onError(response.data.message || "Payment initiation failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      onError(error.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={initiateKhaltiPayment}
      disabled={loading}
      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Processing..." : "Pay with Khalti"}
    </button>
  );
};

export default KhaltiPayment;
```

### 2. Payment Status Handling

```jsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const transactionId = searchParams.get("transactionId");
    const message = searchParams.get("message");

    if (transactionId) {
      setStatus("success");
      setMessage(message || "Payment successful");
    } else {
      setStatus("error");
      setMessage(message || "Payment failed");
    }
  }, [searchParams]);

  if (status === "loading") {
    return <div>Processing payment...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      {status === "success" ? (
        <div className="text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-4">{message}</p>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">✗</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Payment Failed
          </h2>
          <p className="text-gray-600 mb-4">{message}</p>
          <button
            onClick={() => (window.location.href = "/checkout")}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;
```

### 3. API Service Functions

```javascript
// services/paymentService.js
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const paymentService = {
  // Initiate Khalti payment
  initiateKhaltiPayment: async (paymentData) => {
    const response = await axios.post(
      `${API_BASE_URL}/payments/khalti`,
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (paymentId) => {
    const response = await axios.get(`${API_BASE_URL}/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  },

  // Get user payments
  getUserPayments: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await axios.get(`${API_BASE_URL}/payments/me?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  },
};
```

### 4. Usage in Components

```jsx
import React from "react";
import KhaltiPayment from "./components/KhaltiPayment";
import { paymentService } from "./services/paymentService";

const CheckoutPage = () => {
  const handlePaymentSuccess = (paymentData) => {
    console.log("Payment successful:", paymentData);
    // Redirect to success page or update UI
  };

  const handlePaymentError = (error) => {
    console.error("Payment error:", error);
    // Show error message to user
  };

  return (
    <div className="checkout-page">
      <h2>Complete Your Purchase</h2>

      <div className="payment-section">
        <h3>Payment Method</h3>
        <KhaltiPayment
          productId="product_123"
          amount={1000}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </div>
    </div>
  );
};

export default CheckoutPage;
```

## Environment Variables for Frontend

Add these to your frontend `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_KHALTI_PUBLIC_KEY=your_khalti_public_key_here
```

## Error Handling

The integration includes comprehensive error handling:

1. **Network Errors**: Handle API connection issues
2. **Validation Errors**: Show user-friendly messages for invalid data
3. **Payment Failures**: Handle Khalti payment failures gracefully
4. **Timeout Errors**: Handle request timeouts

## Security Considerations

1. **API Keys**: Never expose secret keys in frontend code
2. **Token Storage**: Use secure token storage (httpOnly cookies recommended)
3. **HTTPS**: Always use HTTPS in production
4. **Input Validation**: Validate all user inputs before sending to API

## Testing

1. Use Khalti's test environment for development
2. Test with small amounts first
3. Verify payment callbacks work correctly
4. Test error scenarios (network failures, invalid data, etc.)

This integration provides a complete payment solution using Khalti while maintaining security and user experience best practices.
