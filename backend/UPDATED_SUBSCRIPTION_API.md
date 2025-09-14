# Updated Subscription API Documentation

This document describes the enhanced subscription system that now supports both **product-based** and **plan-based** subscriptions, providing flexibility for different business models.

## Overview

The updated subscription system allows you to:

- Create subscriptions from products (existing functionality)
- Create subscriptions from subscription plans (new functionality)
- Manage both types of subscriptions with unified endpoints
- Filter and query subscriptions by type
- Support multiple billing cycles (weekly, monthly, quarterly, yearly)
- Include currency information for international support

## Key Changes

### 1. Enhanced Subscription Model

- Added `subscriptionPlanId` field for plan-based subscriptions
- Added `subscriptionType` field to distinguish between "product" and "plan" subscriptions
- Added `currency` field for multi-currency support
- Enhanced `billingCycle` to support weekly, monthly, quarterly, and yearly options
- Added validation to ensure either `productId` OR `subscriptionPlanId` is provided, but not both

### 2. New API Endpoints

- `POST /api/subscriptions/product` - Create subscription from product
- `POST /api/subscriptions/plan` - Create subscription from plan
- `GET /api/subscriptions/type/:type` - Get subscriptions by type
- `GET /api/subscriptions/product/:productId` - Get subscriptions for a product
- `GET /api/subscriptions/plan/:planId` - Get subscriptions for a plan
- `GET /api/subscriptions/active/:userId?` - Get active subscriptions
- `GET /api/subscriptions/expiring` - Get expiring subscriptions

## API Endpoints

### Base URL

```
/api/subscriptions
```

## User Endpoints (Authentication Required)

### 1. Create Product Subscription

```http
POST /api/subscriptions/product
```

**Headers:**

```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "productId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "billingCycle": "monthly",
  "paymentMethod": "stripe"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Product subscription created",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "userId": "60f7b3b3b3b3b3b3b3b3b3b1",
    "productId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "subscriptionType": "product",
    "status": "active",
    "billingCycle": "monthly",
    "amount": 29.99,
    "currency": "USD",
    "startDate": "2023-12-01T00:00:00.000Z",
    "endDate": "2023-12-31T00:00:00.000Z",
    "paymentMethod": "stripe",
    "autoRenew": true,
    "createdAt": "2023-12-01T00:00:00.000Z",
    "updatedAt": "2023-12-01T00:00:00.000Z"
  }
}
```

### 2. Create Plan Subscription

```http
POST /api/subscriptions/plan
```

**Headers:**

```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "subscriptionPlanId": "60f7b3b3b3b3b3b3b3b3b3b5",
  "billingCycle": "yearly",
  "paymentMethod": "stripe"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Plan subscription created",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b6",
    "userId": "60f7b3b3b3b3b3b3b3b3b3b1",
    "subscriptionPlanId": "60f7b3b3b3b3b3b3b3b3b3b5",
    "subscriptionType": "plan",
    "status": "trial",
    "billingCycle": "yearly",
    "amount": 299.99,
    "currency": "USD",
    "startDate": "2023-12-01T00:00:00.000Z",
    "endDate": "2024-12-01T00:00:00.000Z",
    "trialEndsAt": "2023-12-31T00:00:00.000Z",
    "paymentMethod": "stripe",
    "autoRenew": true,
    "createdAt": "2023-12-01T00:00:00.000Z",
    "updatedAt": "2023-12-01T00:00:00.000Z"
  }
}
```

### 3. List My Subscriptions

```http
GET /api/subscriptions/me
```

**Headers:**

```
Authorization: Bearer <user_token>
```

**Query Parameters:**

- `type` (optional): Filter by subscription type ("product" or "plan")

**Example:**

```
GET /api/subscriptions/me?type=plan
```

**Response:**

```json
{
  "success": true,
  "message": "My subscriptions fetched",
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "userId": "60f7b3b3b3b3b3b3b3b3b3b1",
      "productId": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "name": "Premium Cloud Storage",
        "description": "Secure cloud storage solution"
      },
      "subscriptionType": "product",
      "status": "active",
      "billingCycle": "monthly",
      "amount": 29.99,
      "currency": "USD",
      "startDate": "2023-12-01T00:00:00.000Z",
      "endDate": "2023-12-31T00:00:00.000Z",
      "paymentMethod": "stripe",
      "autoRenew": true
    }
  ]
}
```

### 4. Get Single Subscription

```http
GET /api/subscriptions/:subscriptionId
```

**Headers:**

```
Authorization: Bearer <user_token>
```

### 5. Cancel Subscription

```http
POST /api/subscriptions/:subscriptionId/cancel
```

**Headers:**

```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "reason": "No longer needed"
}
```

### 6. Renew Subscription

```http
POST /api/subscriptions/:subscriptionId/renew
```

**Headers:**

```
Authorization: Bearer <user_token>
```

## Admin Endpoints (Admin Authentication Required)

### 1. List All Subscriptions

```http
GET /api/subscriptions
```

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `type` (optional): Filter by subscription type ("product" or "plan")
- `status` (optional): Filter by status
- `billingCycle` (optional): Filter by billing cycle
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**

```json
{
  "success": true,
  "message": "All subscriptions fetched",
  "data": {
    "items": [...],
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 2. Get Subscriptions by Product

```http
GET /api/subscriptions/product/:productId
```

**Headers:**

```
Authorization: Bearer <admin_token>
```

### 3. Get Subscriptions by Plan

```http
GET /api/subscriptions/plan/:planId
```

**Headers:**

```
Authorization: Bearer <admin_token>
```

### 4. Get Subscriptions by Type

```http
GET /api/subscriptions/type/:type
```

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `type`: "product" or "plan"

### 5. Get Active Subscriptions

```http
GET /api/subscriptions/active/:userId?
```

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `userId` (optional): Specific user ID, defaults to current user

### 6. Get Expiring Subscriptions

```http
GET /api/subscriptions/expiring
```

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `days` (optional): Number of days ahead to check (default: 7)

## Data Models

### Updated Subscription Schema

```javascript
{
  userId: ObjectId, // Required, reference to User
  productId: ObjectId, // Optional, reference to Product (for product subscriptions)
  subscriptionPlanId: ObjectId, // Optional, reference to SubscriptionPlan (for plan subscriptions)
  subscriptionType: String, // Required, "product" or "plan"
  status: String, // active, cancelled, expired, pending, trial
  billingCycle: String, // monthly, yearly, quarterly, weekly
  amount: Number, // Required, subscription amount
  currency: String, // USD, EUR, GBP, NPR (default: USD)
  startDate: Date, // Required, subscription start date
  endDate: Date, // Required, subscription end date
  nextBilling: Date, // Next billing date
  trialEndsAt: Date, // Trial end date (if applicable)
  paymentMethod: String, // esewa, khalti, stripe, card
  cancelledAt: Date, // Cancellation date
  cancelReason: String, // Cancellation reason
  failureReason: String, // Payment failure reason
  lastPaymentDate: Date, // Last successful payment date
  nextPaymentDate: Date, // Next payment due date
  autoRenew: Boolean, // Auto-renewal setting
  metadata: Object, // Additional data
  createdAt: Date,
  updatedAt: Date
}
```

## Validation Rules

### Create Product Subscription

- `productId`: Required, valid MongoDB ObjectId
- `billingCycle`: Required, must be one of: monthly, yearly, quarterly, weekly
- `paymentMethod`: Required, must be one of: esewa, khalti, stripe, card

### Create Plan Subscription

- `subscriptionPlanId`: Required, valid MongoDB ObjectId
- `billingCycle`: Required, must be one of: monthly, yearly, quarterly, weekly
- `paymentMethod`: Required, must be one of: esewa, khalti, stripe, card

### Business Rules

- Either `productId` OR `subscriptionPlanId` must be provided, but not both
- User cannot have multiple active subscriptions for the same product/plan
- Product/Plan must be available for subscription
- Billing cycle must be supported by the product/plan

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden (admin required)
- `404`: Not Found
- `500`: Internal Server Error

## Usage Examples

### Creating a Product Subscription

```bash
curl -X POST http://localhost:5000/api/subscriptions/product \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "billingCycle": "monthly",
    "paymentMethod": "stripe"
  }'
```

### Creating a Plan Subscription

```bash
curl -X POST http://localhost:5000/api/subscriptions/plan \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionPlanId": "60f7b3b3b3b3b3b3b3b3b3b5",
    "billingCycle": "yearly",
    "paymentMethod": "stripe"
  }'
```

### Getting My Plan Subscriptions

```bash
curl "http://localhost:5000/api/subscriptions/me?type=plan" \
  -H "Authorization: Bearer <user_token>"
```

### Getting All Product Subscriptions (Admin)

```bash
curl "http://localhost:5000/api/subscriptions/type/product" \
  -H "Authorization: Bearer <admin_token>"
```

## Migration Notes

### For Existing Subscriptions

- Existing subscriptions will have `subscriptionType: "product"` by default
- The `productId` field remains required for existing subscriptions
- New `subscriptionPlanId` and `currency` fields are optional

### For New Subscriptions

- Use `/api/subscriptions/product` for product-based subscriptions
- Use `/api/subscriptions/plan` for plan-based subscriptions
- The system will automatically set the appropriate `subscriptionType`

## Integration with Subscription Plans

The subscription system now seamlessly integrates with the subscription plan system:

1. **Plan-based subscriptions** use the subscription plan's pricing, features, and limits
2. **Product-based subscriptions** use the product's pricing and features
3. Both types support the same billing cycles and payment methods
4. Unified management through the same subscription endpoints

This provides maximum flexibility for different business models while maintaining a consistent API interface.
