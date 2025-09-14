# Subscription Plans API Documentation

This document describes the complete CRUD API for managing subscription plans, which are independent of products and provide a flexible way to create subscription offerings.

## Overview

The subscription plan system allows you to:

- Create, read, update, and delete subscription plans
- Define pricing, features, limits, and billing cycles
- Manage plan types (basic, premium, enterprise, custom)
- Set up trial periods and popular plan flags
- Search and filter plans
- Bulk update operations

## API Endpoints

### Base URL

```
/api/subscription-plans
```

## Public Endpoints (No Authentication Required)

### 1. List All Subscription Plans

```http
GET /api/subscription-plans
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search term for name, description, or tags
- `planType` (optional): Filter by plan type (basic, premium, enterprise, custom)
- `isPopular` (optional): Filter by popularity (true/false)
- `minPrice` (optional): Minimum monthly price
- `maxPrice` (optional): Maximum monthly price
- `includeInactive` (optional): Include inactive plans (true/false)
- `sortBy` (optional): Sort field (sortOrder, name, pricing.monthly, etc.)
- `sortOrder` (optional): Sort direction (asc/desc)

**Response:**

```json
{
  "success": true,
  "message": "Subscription plans fetched",
  "data": {
    "items": [...],
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 2. Get Popular Plans

```http
GET /api/subscription-plans/popular
```

**Query Parameters:**

- `limit` (optional): Number of plans to return (default: 10)

### 3. Get Plans by Type

```http
GET /api/subscription-plans/type/:planType
```

**Path Parameters:**

- `planType`: basic, premium, enterprise, or custom

### 4. Search Plans

```http
GET /api/subscription-plans/search?q=search_term
```

**Query Parameters:**

- `q` (required): Search query
- `planType` (optional): Filter by plan type
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `tags` (optional): Comma-separated tags

### 5. Get Active Plans (Simplified)

```http
GET /api/subscription-plans/active
```

### 6. Get Subscription Options

```http
GET /api/subscription-plans/:planId/options
```

**Path Parameters:**

- `planId`: MongoDB ObjectId of the plan

## Admin Endpoints (Authentication Required)

### 1. Create Subscription Plan

```http
POST /api/subscription-plans
```

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "name": "Professional Plan",
  "description": "Advanced features for growing businesses",
  "planType": "premium",
  "pricing": {
    "monthly": 29.99,
    "yearly": 299.99,
    "currency": "USD"
  },
  "features": [
    {
      "name": "100GB Storage",
      "description": "Ample cloud storage",
      "included": true,
      "limit": "100GB"
    }
  ],
  "billingCycles": ["monthly", "yearly"],
  "trialPeriod": {
    "enabled": true,
    "days": 30
  },
  "limits": {
    "maxUsers": 25,
    "maxStorage": "100GB",
    "maxApiCalls": 10000,
    "maxProjects": 15
  },
  "isPopular": true,
  "sortOrder": 2,
  "tags": ["professional", "business"]
}
```

### 2. Update Subscription Plan

```http
PUT /api/subscription-plans/:planId
```

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:** Same as create, but all fields are optional.

### 3. Delete Subscription Plan (Soft Delete)

```http
DELETE /api/subscription-plans/:planId
```

**Headers:**

```
Authorization: Bearer <admin_token>
```

### 4. Get Specific Plan (Including Inactive)

```http
GET /api/subscription-plans/:planId
```

**Headers:**

```
Authorization: Bearer <admin_token>
```

### 5. Toggle Plan Status

```http
PATCH /api/subscription-plans/:planId/toggle-status
```

**Headers:**

```
Authorization: Bearer <admin_token>
```

### 6. Set Popular Plan

```http
PATCH /api/subscription-plans/:planId/popular
```

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "isPopular": true
}
```

### 7. Update Sort Order

```http
PATCH /api/subscription-plans/:planId/sort-order
```

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "sortOrder": 5
}
```

### 8. Bulk Update Plans

```http
PATCH /api/subscription-plans/bulk-update
```

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "updates": [
    {
      "planId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "updateData": {
        "isPopular": true,
        "sortOrder": 1
      }
    }
  ]
}
```

### 9. Seed Mock Plans (Development)

```http
POST /api/subscription-plans/seed
```

**Headers:**

```
Authorization: Bearer <admin_token>
```

## Data Models

### Subscription Plan Schema

```javascript
{
  name: String, // Required, unique
  description: String, // Required
  planType: String, // basic, premium, enterprise, custom
  pricing: {
    monthly: Number, // Required, >= 0
    yearly: Number, // Required, >= 0
    currency: String // USD, EUR, GBP, NPR (default: USD)
  },
  features: [{
    name: String, // Required
    description: String, // Optional
    included: Boolean, // Default: true
    limit: String // Optional, e.g., "unlimited", "100GB"
  }],
  billingCycles: [String], // monthly, yearly, quarterly, weekly
  trialPeriod: {
    enabled: Boolean, // Default: false
    days: Number // 0-365, default: 0
  },
  limits: {
    maxUsers: Number, // Optional, >= 1
    maxStorage: String, // Optional, e.g., "10GB", "unlimited"
    maxApiCalls: Number, // Optional, >= 0
    maxProjects: Number // Optional, >= 0
  },
  isPopular: Boolean, // Default: false
  isActive: Boolean, // Default: true
  sortOrder: Number, // Default: 0
  tags: [String], // Optional
  metadata: Object, // Optional, for custom data
  createdBy: ObjectId, // Reference to User
  updatedBy: ObjectId, // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

## Virtual Fields

The model includes several virtual fields:

- `formattedPricing`: Human-readable pricing (e.g., "USD 29.99")
- `yearlySavings`: Percentage saved with yearly billing
- `trialDays`: Number of trial days (0 if disabled)

## Validation Rules

### Create/Update Validation

- `name`: Required, 2-100 characters, unique
- `description`: Required, 10-500 characters
- `planType`: Must be one of: basic, premium, enterprise, custom
- `pricing.monthly`: Required, numeric, >= 0
- `pricing.yearly`: Required, numeric, >= 0
- `pricing.currency`: Optional, must be USD, EUR, GBP, or NPR
- `features`: Array with at least 1 item
- `features[].name`: Required, 2-100 characters
- `features[].description`: Optional, max 200 characters
- `trialPeriod.days`: 0-365 if enabled
- `limits.maxUsers`: Positive integer if provided
- `tags`: Array of strings, each 1-30 characters

### Business Rules

- Yearly price must be less than 12 times monthly price
- Only admins can create/update/delete plans
- Plan names must be unique
- Soft delete sets `isActive` to false

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

### Creating a Basic Plan

```bash
curl -X POST http://localhost:5000/api/subscription-plans \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Starter Plan",
    "description": "Perfect for individuals getting started",
    "planType": "basic",
    "pricing": {
      "monthly": 9.99,
      "yearly": 99.99
    },
    "features": [
      {
        "name": "5GB Storage",
        "description": "Secure cloud storage"
      }
    ],
    "trialPeriod": {
      "enabled": true,
      "days": 14
    }
  }'
```

### Searching Plans

```bash
curl "http://localhost:5000/api/subscription-plans/search?q=storage&planType=premium"
```

### Getting Popular Plans

```bash
curl "http://localhost:5000/api/subscription-plans/popular?limit=5"
```

## Integration with Subscriptions

The subscription plan system is designed to work independently but can be integrated with the existing subscription system. Plans can be used to create subscriptions by:

1. Getting subscription options: `GET /api/subscription-plans/:planId/options`
2. Using the returned data to create a subscription with the plan details

This provides flexibility to either use product-based subscriptions or plan-based subscriptions depending on your business needs.
