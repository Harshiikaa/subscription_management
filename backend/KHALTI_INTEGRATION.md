# Khalti Payment Integration

This document describes the Khalti payment gateway integration for the subscription management system.

## Environment Variables Required

Add the following environment variables to your `.env` file:

```env
# Khalti Configuration
KHALTI_SECRET_KEY=your_khalti_secret_key_here
KHALTI_PUBLIC_KEY=your_khalti_public_key_here
KHALTI_BASE_URL=https://a.khalti.com/api/v2/epayment/initiate/
KHALTI_VERIFY_URL=https://a.khalti.com/api/v2/epayment/lookup/
KHALTI_STATUS_URL=https://a.khalti.com/api/v2/epayment/status/
KHALTI_RETURN_URL=http://localhost:5000/api/payments/khalti/verify
KHALTI_WEBSITE_URL=http://localhost:3000
```

## API Endpoints

### 1. Create Khalti Payment

**POST** `/api/payments/khalti`

Creates a new Khalti payment for either a product or subscription.

**Request Body:**

```json
{
  "productId": "product_id_here", // Optional - for product payments
  "subscriptionId": "subscription_id_here", // Optional - for subscription payments
  "amount": 1000, // Amount in NPR
  "currency": "NPR", // Default: NPR
  "customer_info": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9841234567"
  },
  "amount_breakdown": {
    "subtotal": 1000,
    "tax": 0,
    "shipping": 0,
    "discount": 0
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Khalti payment initiated",
  "data": {
    "payment_url": "https://a.khalti.com/pay/...",
    "pidx": "khalti_payment_id",
    "paymentId": "local_payment_id",
    "transactionUUID": "transaction_uuid"
  }
}
```

### 2. Verify Khalti Payment

**GET/POST** `/api/payments/khalti/verify?pidx=khalti_payment_id&transaction_uuid=transaction_uuid`

This endpoint is called by Khalti after payment completion.

**Query Parameters:**

- `pidx`: Khalti payment ID
- `transaction_uuid`: Your transaction UUID (optional)

**Response:**
Redirects to success or failure page based on payment status.

## Payment Flow

1. **Initiate Payment**: Call `/api/payments/khalti` with payment details
2. **Redirect User**: Use the `payment_url` from response to redirect user to Khalti
3. **Payment Processing**: User completes payment on Khalti's platform
4. **Callback**: Khalti redirects to `/api/payments/khalti/verify` with payment details
5. **Verification**: System verifies payment with Khalti API
6. **Completion**: Payment status is updated and user is redirected to success/failure page

## Integration Notes

- Amounts are automatically converted to paisa (multiply by 100) when sending to Khalti
- The system supports both product and subscription payments
- Payment verification includes amount matching for security
- All payment data is stored in the database with proper status tracking
- The integration follows the same pattern as the existing eSewa integration

## Testing

For testing, you can use Khalti's test credentials:

- Test Secret Key: Use the provided test key
- Test Public Key: Use the provided test key
- Test URLs: Use the sandbox URLs provided by Khalti

## Security Features

- Amount verification to prevent tampering
- Transaction UUID tracking for idempotency
- Proper error handling and logging
- Secure API key management through environment variables
