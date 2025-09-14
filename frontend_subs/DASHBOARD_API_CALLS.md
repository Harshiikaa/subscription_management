# Dashboard API Calls Documentation

This document lists all the API endpoints that are being used throughout the dashboard application.

## Base URLs

- **Backend API**: `http://localhost:5000/api`
- **Environment Variable**: `NEXT_PUBLIC_API_URL` (falls back to localhost:5000)

## Authentication APIs

### 1. User Logout

- **Endpoint**: `POST /api/auth/logout`
- **File**: `components/navigation/user-nav.tsx`
- **Purpose**: Logout user from the system
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Success message

### 2. Google Login

- **Endpoint**: `POST /api/auth/google-login`
- **File**: `contexts/auth-context.tsx`
- **Purpose**: Authenticate user with Google OAuth
- **Body**: `{ token: firebaseIdToken }`
- **Response**: User data + access/refresh tokens

### 3. Facebook Login

- **Endpoint**: `POST /api/auth/facebook-login`
- **File**: `contexts/auth-context.tsx`
- **Purpose**: Authenticate user with Facebook OAuth
- **Body**: `{ token: firebaseIdToken }`
- **Response**: User data + access/refresh tokens

### 4. Regular Login

- **Endpoint**: `POST /api/auth/login`
- **File**: `lib/auth.ts`
- **Purpose**: Authenticate user with email/password
- **Body**: `{ email, password }`
- **Response**: User data + access/refresh tokens

### 5. User Registration

- **Endpoint**: `POST /api/auth/signup`
- **File**: `lib/auth.ts`
- **Purpose**: Register new user
- **Body**: `{ email, password, name }`
- **Response**: User data + access/refresh tokens

## Product APIs

### 6. Get Product by ID

- **Endpoint**: `GET /api/products/{productId}`
- **File**: `app/dashboard/billing/page.tsx`
- **Purpose**: Fetch specific product details
- **Headers**: None (public endpoint)
- **Response**: Product data

## Subscription Plan APIs

### 7. List Subscription Plans

- **Endpoint**: `GET /api/subscription-plans`
- **File**: `lib/api/subscription-plans.ts`
- **Purpose**: Get all subscription plans with filtering
- **Query Parameters**:
  - `page`, `limit`, `search`, `planType`
  - `isPopular`, `minPrice`, `maxPrice`
  - `includeInactive`, `sortBy`, `sortOrder`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Paginated list of subscription plans

### 8. Get Subscription Plan by ID

- **Endpoint**: `GET /api/subscription-plans/{id}`
- **File**: `lib/api/subscription-plans.ts`
- **Purpose**: Get specific subscription plan details
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Subscription plan data

### 9. Create Subscription Plan

- **Endpoint**: `POST /api/subscription-plans`
- **File**: `lib/api/subscription-plans.ts`
- **Purpose**: Create new subscription plan (admin)
- **Headers**: `Authorization: Bearer {token}`
- **Body**: Subscription plan data
- **Response**: Created subscription plan

### 10. Update Subscription Plan

- **Endpoint**: `PUT /api/subscription-plans/{id}`
- **File**: `lib/api/subscription-plans.ts`
- **Purpose**: Update existing subscription plan (admin)
- **Headers**: `Authorization: Bearer {token}`
- **Body**: Updated subscription plan data
- **Response**: Updated subscription plan

### 11. Delete Subscription Plan

- **Endpoint**: `DELETE /api/subscription-plans/{id}`
- **File**: `lib/api/subscription-plans.ts`
- **Purpose**: Delete subscription plan (admin)
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Success message

## Subscription APIs

### 12. List All Subscriptions (Admin)

- **Endpoint**: `GET /api/subscriptions`
- **File**: `lib/api/subscriptions.ts`
- **Purpose**: Get all subscriptions with filtering (admin only)
- **Query Parameters**:
  - `page`, `limit`, `status`, `subscriptionType`
  - `userId`, `productId`, `subscriptionPlanId`
  - `sortBy`, `sortOrder`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Paginated list of subscriptions

### 13. List User's Subscriptions

- **Endpoint**: `GET /api/subscriptions/my`
- **File**: `lib/api/subscriptions.ts`, `components/reminder/manual-reminder-manager.tsx`
- **Purpose**: Get current user's subscriptions
- **Query Parameters**: `page`, `limit`, `status`, `subscriptionType`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: User's subscriptions

### 14. Get Subscription by ID

- **Endpoint**: `GET /api/subscriptions/{id}`
- **File**: `lib/api/subscriptions.ts`
- **Purpose**: Get specific subscription details
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Subscription data

### 15. Create Subscription from Product

- **Endpoint**: `POST /api/subscriptions/product`
- **File**: `lib/api/subscriptions.ts`, `app/dashboard/billing/page.tsx`
- **Purpose**: Create subscription from product
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ productId, billingCycle, currency }`
- **Response**: Created subscription

### 16. Create Subscription from Plan

- **Endpoint**: `POST /api/subscriptions/plan`
- **File**: `lib/api/subscriptions.ts`, `app/dashboard/billing/page.tsx`
- **Purpose**: Create subscription from subscription plan
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ subscriptionPlanId, billingCycle, currency }`
- **Response**: Created subscription

### 17. Update Subscription

- **Endpoint**: `PUT /api/subscriptions/{id}`
- **File**: `lib/api/subscriptions.ts`
- **Purpose**: Update existing subscription
- **Headers**: `Authorization: Bearer {token}`
- **Body**: Updated subscription data
- **Response**: Updated subscription

### 18. Cancel Subscription

- **Endpoint**: `DELETE /api/subscriptions/{id}`
- **File**: `lib/api/subscriptions.ts`
- **Purpose**: Cancel subscription
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Cancelled subscription

## Payment APIs

### 19. Create Khalti Payment

- **Endpoint**: `POST /api/payments/khalti`
- **File**: `components/payment/khalti-payment-button.tsx`, `app/dashboard/billing/page.tsx`
- **Purpose**: Initiate Khalti payment
- **Headers**: `Authorization: Bearer {token}`
- **Body**: Payment details including productId, subscriptionId, amount, customer_info, amount_breakdown
- **Response**: Payment URL for redirection

### 20. Get Payment Status

- **Endpoint**: `GET /api/payments/{paymentId}`
- **File**: `components/payment/payment-status.tsx`
- **Purpose**: Check payment status
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Payment status and details

## Reminder APIs

### 21. Get Reminder Preferences

- **Endpoint**: `GET /api/reminders/preferences`
- **File**: `components/reminder/reminder-preferences.tsx`
- **Purpose**: Get user's reminder preferences
- **Headers**: `Authorization: Bearer {token}`
- **Response**: User's reminder settings

### 22. Update Reminder Preferences

- **Endpoint**: `PUT /api/reminders/preferences`
- **File**: `components/reminder/reminder-preferences.tsx`
- **Purpose**: Update user's reminder preferences
- **Headers**: `Authorization: Bearer {token}`
- **Body**: Updated reminder preferences
- **Response**: Updated preferences

### 23. Send Test Email

- **Endpoint**: `POST /api/reminders/test-email`
- **File**: `components/reminder/reminder-preferences.tsx`
- **Purpose**: Send test reminder email
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ email }`
- **Response**: Success message

### 24. Get Reminder Statistics

- **Endpoint**: `GET /api/reminders/stats`
- **File**: `components/reminder/reminder-preferences.tsx`
- **Purpose**: Get reminder statistics (admin)
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Reminder statistics

## Manual Reminder APIs

### 25. List Manual Reminders

- **Endpoint**: `GET /api/manual-reminders`
- **File**: `components/reminder/manual-reminder-manager.tsx`
- **Purpose**: Get user's manual reminders
- **Query Parameters**: `subscriptionId`, `upcoming`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: User's manual reminders

### 26. Create Manual Reminder

- **Endpoint**: `POST /api/manual-reminders`
- **File**: `components/reminder/manual-reminder-manager.tsx`
- **Purpose**: Create new manual reminder
- **Headers**: `Authorization: Bearer {token}`
- **Body**: Reminder data (title, description, reminderDate, reminderTime, etc.)
- **Response**: Created reminder

### 27. Get Manual Reminder by ID

- **Endpoint**: `GET /api/manual-reminders/{id}`
- **File**: `lib/api/manual-reminders.ts` (if exists)
- **Purpose**: Get specific manual reminder
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Reminder data

### 28. Update Manual Reminder

- **Endpoint**: `PUT /api/manual-reminders/{id}`
- **File**: `components/reminder/manual-reminder-manager.tsx`
- **Purpose**: Update existing manual reminder
- **Headers**: `Authorization: Bearer {token}`
- **Body**: Updated reminder data
- **Response**: Updated reminder

### 29. Delete Manual Reminder

- **Endpoint**: `DELETE /api/manual-reminders/{id}`
- **File**: `components/reminder/manual-reminder-manager.tsx`
- **Purpose**: Delete manual reminder
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Success message

### 30. Send Manual Reminder Now

- **Endpoint**: `POST /api/manual-reminders/{id}/send`
- **File**: `components/reminder/manual-reminder-manager.tsx`
- **Purpose**: Send reminder immediately (for testing)
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Success message

### 31. Get Manual Reminder Statistics

- **Endpoint**: `GET /api/manual-reminders/stats`
- **File**: `components/reminder/manual-reminder-manager.tsx`
- **Purpose**: Get manual reminder statistics
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Reminder statistics

## API Usage Patterns

### Authentication

- Most APIs require `Authorization: Bearer {token}` header
- Token is retrieved from `localStorage.getItem("accessToken")`
- Fallback to environment variable for API base URL

### Error Handling

- All API calls include try-catch blocks
- Error messages are displayed via toast notifications
- Loading states are managed for better UX

### Data Flow

1. **Dashboard Page**: Uses mock data (no API calls)
2. **Billing Page**: Fetches products/plans, creates subscriptions, initiates payments
3. **Subscriptions Page**: Lists subscription plans, manages subscriptions
4. **Transactions Page**: Uses mock data (no API calls)
5. **Profile Page**: Uses mock data (no API calls)
6. **Reminder Components**: Full CRUD operations for reminders

## Notes

- Some pages still use mock data instead of real API calls
- Payment integration is specifically for Khalti payment gateway
- Reminder system includes both automatic and manual reminder management
- Admin-specific APIs require admin role verification
