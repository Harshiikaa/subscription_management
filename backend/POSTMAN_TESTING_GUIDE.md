# Postman Testing Guide for Khalti Payment Integration

This guide shows you how to test the Khalti payment integration using Postman.

## Prerequisites

1. **Install Postman** (if not already installed)
2. **Set up environment variables** in your `.env` file
3. **Start your backend server** (`npm run dev`)
4. **Get authentication token** (for protected endpoints)

## Environment Setup

### 1. Create Postman Environment

Create a new environment in Postman with these variables:

```
BASE_URL: http://localhost:5000/api
AUTH_TOKEN: your_jwt_token_here
KHALTI_SECRET_KEY: b61c2b8d036244a6aa8c71a43a26f5e1
KHALTI_PUBLIC_KEY: 5bda7cbd4a4a48c099a8d189abc999e4
```

### 2. Backend Environment Variables

Make sure your `.env` file has:

```env
# Khalti Configuration
KHALTI_SECRET_KEY=b61c2b8d036244a6aa8c71a43a26f5e1
KHALTI_PUBLIC_KEY=5bda7cbd4a4a48c099a8d189abc999e4
KHALTI_BASE_URL=https://a.khalti.com/api/v2/epayment/initiate/
KHALTI_VERIFY_URL=https://a.khalti.com/api/v2/epayment/lookup/
KHALTI_STATUS_URL=https://a.khalti.com/api/v2/epayment/status/
KHALTI_RETURN_URL=http://localhost:5000/api/payments/khalti/verify
KHALTI_WEBSITE_URL=http://localhost:3000
```

## API Testing Collection

### 1. Authentication (Get Token)

**POST** `{{BASE_URL}}/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "your_email@example.com",
  "password": "your_password"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

**Save the token** to your environment variable `AUTH_TOKEN`.

---

### 2. Create Khalti Payment (Product)

**POST** `{{BASE_URL}}/payments/khalti`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{AUTH_TOKEN}}
```

**Body (raw JSON):**
```json
{
  "productId": "your_product_id_here",
  "amount": 1000,
  "currency": "NPR",
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

**Expected Response:**
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

---

### 3. Create Khalti Payment (Subscription)

**POST** `{{BASE_URL}}/payments/khalti`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{AUTH_TOKEN}}
```

**Body (raw JSON):**
```json
{
  "subscriptionId": "your_subscription_id_here",
  "amount": 5000,
  "currency": "NPR",
  "customer_info": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "9841234568"
  },
  "amount_breakdown": {
    "subtotal": 5000,
    "tax": 0,
    "shipping": 0,
    "discount": 0
  }
}
```

---

### 4. Verify Khalti Payment (Callback)

**GET** `{{BASE_URL}}/payments/khalti/verify?pidx=khalti_payment_id&transaction_uuid=transaction_uuid`

**Headers:**
```
Content-Type: application/json
```

**Expected Response:**
- **Success**: Redirects to success page with transaction details
- **Failure**: Redirects to failure page with error message

---

### 5. Get Payment Details

**GET** `{{BASE_URL}}/payments/{{paymentId}}`

**Headers:**
```
Authorization: Bearer {{AUTH_TOKEN}}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment fetched",
  "data": {
    "_id": "payment_id",
    "userId": "user_id",
    "productId": "product_id",
    "paymentType": "product",
    "paymentMethod": "khalti",
    "amount": 1000,
    "currency": "NPR",
    "status": "pending",
    "transactionUUID": "transaction_uuid",
    "orderId": "ORDER_1234567890_abc123",
    "providerRefId": "khalti_pidx",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 6. Get User Payments

**GET** `{{BASE_URL}}/payments/me`

**Headers:**
```
Authorization: Bearer {{AUTH_TOKEN}}
```

**Query Parameters (optional):**
```
paymentType: product|subscription
status: pending|processing|completed|failed|cancelled|refunded
page: 1
limit: 20
```

---

### 7. Update Payment Status (Admin)

**PUT** `{{BASE_URL}}/payments/{{paymentId}}/status`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{AUTH_TOKEN}}
```

**Body (raw JSON):**
```json
{
  "status": "completed",
  "additionalData": {
    "adminNote": "Payment manually verified"
  }
}
```

---

## Testing Workflow

### Step 1: Authentication
1. Use the login endpoint to get an authentication token
2. Save the token to your environment variable

### Step 2: Create Payment
1. Use the Khalti payment creation endpoint
2. Copy the `payment_url` from the response
3. Open the URL in a browser to test the payment flow

### Step 3: Test Payment Flow
1. **In Browser**: Open the payment URL
2. **Complete Payment**: Use Khalti's test credentials
3. **Verify Callback**: Check if the verification endpoint is called
4. **Check Status**: Use the get payment endpoint to verify status

### Step 4: Verify Results
1. Check payment status in database
2. Verify amount and transaction details
3. Test error scenarios

## Test Scenarios

### 1. Successful Payment
- Create payment with valid data
- Complete payment on Khalti
- Verify payment status is "completed"

### 2. Failed Payment
- Create payment with invalid amount
- Test with insufficient funds
- Verify payment status is "failed"

### 3. Pending Payment
- Create payment but don't complete
- Check payment status remains "pending"
- Test timeout scenarios

### 4. Error Handling
- Test with missing required fields
- Test with invalid authentication
- Test with invalid payment IDs

## Common Issues & Solutions

### 1. Authentication Errors
**Problem**: 401 Unauthorized
**Solution**: 
- Check if token is valid
- Ensure token is in correct format: `Bearer your_token_here`
- Verify token hasn't expired

### 2. Payment Creation Fails
**Problem**: 400 Bad Request
**Solution**:
- Check required fields (productId OR subscriptionId)
- Verify amount is a positive number
- Ensure currency is "NPR"

### 3. Khalti API Errors
**Problem**: Khalti API returns error
**Solution**:
- Check environment variables
- Verify Khalti credentials
- Check network connectivity
- Review Khalti API documentation

### 4. Callback Issues
**Problem**: Payment verification fails
**Solution**:
- Check return URL configuration
- Verify pidx parameter
- Check server logs for errors

## Environment Variables Check

Use this endpoint to verify your environment setup:

**GET** `{{BASE_URL}}/payments/khalti/test`

This will return the status of your Khalti configuration.

## Monitoring & Logs

1. **Check Server Logs**: Monitor console output for errors
2. **Database Verification**: Check payment records in MongoDB
3. **Khalti Dashboard**: Monitor payments in Khalti's merchant dashboard

## Production Testing

Before going live:

1. **Test with Real Khalti Credentials**
2. **Use Production URLs**
3. **Test with Real Payment Amounts**
4. **Verify SSL/HTTPS Configuration**
5. **Test Error Scenarios Thoroughly**

This comprehensive testing approach ensures your Khalti integration works correctly in all scenarios.
