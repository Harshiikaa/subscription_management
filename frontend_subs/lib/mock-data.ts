export interface Product {
  id: string
  name: string
  description: string
  features: string[]
  price: {
    monthly: number
    yearly: number
  }
  category: "basic" | "pro" | "enterprise"
  isPopular?: boolean
  maxUsers?: number
  storage?: string
  support?: string
  trialDays?: number
}

export interface Subscription {
  id: string
  userId: string
  productId: string
  status: "active" | "cancelled" | "expired" | "pending"
  billingCycle: "monthly" | "yearly"
  startDate: string
  endDate: string
  nextBilling?: string
  amount: number
  paymentMethod: string
  trialEndsAt?: string
  cancelledAt?: string
  cancelReason?: string
}

export interface Transaction {
  id: string
  userId: string
  subscriptionId: string
  amount: number
  status: "completed" | "pending" | "failed" | "refunded"
  paymentMethod: "esewa" | "khalti" | "stripe" | "card"
  date: string
  description: string
  refundedAt?: string
  refundReason?: string
  failureReason?: string
}

// Mock Products
export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Starter Plan",
    description: "Perfect for individuals and small teams getting started",
    features: [
      "Up to 5 users",
      "10GB storage",
      "Basic support",
      "Core features",
      "Mobile app access",
      "Basic analytics",
      "Email support",
    ],
    price: {
      monthly: 9.99,
      yearly: 99.99,
    },
    category: "basic",
    maxUsers: 5,
    storage: "10GB",
    support: "Email",
    trialDays: 14,
  },
  {
    id: "2",
    name: "Professional Plan",
    description: "Advanced features for growing businesses",
    features: [
      "Up to 25 users",
      "100GB storage",
      "Priority support",
      "Advanced analytics",
      "API access",
      "Custom integrations",
      "Team collaboration tools",
      "Advanced reporting",
      "Custom branding",
    ],
    price: {
      monthly: 29.99,
      yearly: 299.99,
    },
    category: "pro",
    isPopular: true,
    maxUsers: 25,
    storage: "100GB",
    support: "Priority",
    trialDays: 14,
  },
  {
    id: "3",
    name: "Enterprise Plan",
    description: "Complete solution for large organizations",
    features: [
      "Unlimited users",
      "1TB storage",
      "24/7 dedicated support",
      "Advanced security",
      "Custom branding",
      "SSO integration",
      "Advanced reporting",
      "Dedicated account manager",
      "Custom development",
      "SLA guarantee",
      "White-label options",
    ],
    price: {
      monthly: 99.99,
      yearly: 999.99,
    },
    category: "enterprise",
    maxUsers: undefined,
    storage: "1TB",
    support: "24/7 Dedicated",
    trialDays: 30,
  },
  {
    id: "4",
    name: "Team Plan",
    description: "Designed for medium-sized teams",
    features: [
      "Up to 15 users",
      "50GB storage",
      "Standard support",
      "Team analytics",
      "Basic API access",
      "File sharing",
      "Project management tools",
    ],
    price: {
      monthly: 19.99,
      yearly: 199.99,
    },
    category: "pro",
    maxUsers: 15,
    storage: "50GB",
    support: "Standard",
    trialDays: 14,
  },
]

// Mock Subscriptions
export const mockSubscriptions: Subscription[] = [
  {
    id: "sub_1",
    userId: "2",
    productId: "2",
    status: "active",
    billingCycle: "monthly",
    startDate: "2024-01-15T00:00:00Z",
    endDate: "2025-01-15T00:00:00Z",
    nextBilling: "2024-03-15T00:00:00Z",
    amount: 29.99,
    paymentMethod: "eSewa",
  },
  {
    id: "sub_2",
    userId: "3",
    productId: "1",
    status: "active",
    billingCycle: "yearly",
    startDate: "2024-02-01T00:00:00Z",
    endDate: "2025-02-01T00:00:00Z",
    nextBilling: "2025-02-01T00:00:00Z",
    amount: 99.99,
    paymentMethod: "Khalti",
  },
  {
    id: "sub_3",
    userId: "1",
    productId: "3",
    status: "active",
    billingCycle: "yearly",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2025-01-01T00:00:00Z",
    nextBilling: "2025-01-01T00:00:00Z",
    amount: 999.99,
    paymentMethod: "Stripe",
  },
  {
    id: "sub_4",
    userId: "4",
    productId: "1",
    status: "cancelled",
    billingCycle: "monthly",
    startDate: "2023-12-01T00:00:00Z",
    endDate: "2024-12-01T00:00:00Z",
    amount: 9.99,
    paymentMethod: "eSewa",
    cancelledAt: "2024-02-15T00:00:00Z",
    cancelReason: "Switching to different provider",
  },
  {
    id: "sub_5",
    userId: "5",
    productId: "4",
    status: "pending",
    billingCycle: "monthly",
    startDate: "2024-02-20T00:00:00Z",
    endDate: "2025-02-20T00:00:00Z",
    amount: 19.99,
    paymentMethod: "Khalti",
    trialEndsAt: "2024-03-05T00:00:00Z",
  },
]

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: "txn_1",
    userId: "2",
    subscriptionId: "sub_1",
    amount: 29.99,
    status: "completed",
    paymentMethod: "esewa",
    date: "2024-02-15T00:00:00Z",
    description: "Professional Plan - Monthly",
  },
  {
    id: "txn_2",
    userId: "2",
    subscriptionId: "sub_1",
    amount: 29.99,
    status: "completed",
    paymentMethod: "esewa",
    date: "2024-01-15T00:00:00Z",
    description: "Professional Plan - Monthly",
  },
  {
    id: "txn_3",
    userId: "3",
    subscriptionId: "sub_2",
    amount: 99.99,
    status: "completed",
    paymentMethod: "khalti",
    date: "2024-02-01T00:00:00Z",
    description: "Starter Plan - Yearly",
  },
  {
    id: "txn_4",
    userId: "1",
    subscriptionId: "sub_3",
    amount: 999.99,
    status: "completed",
    paymentMethod: "stripe",
    date: "2024-01-01T00:00:00Z",
    description: "Enterprise Plan - Yearly",
  },
  {
    id: "txn_5",
    userId: "4",
    subscriptionId: "sub_4",
    amount: 9.99,
    status: "refunded",
    paymentMethod: "esewa",
    date: "2024-01-01T00:00:00Z",
    description: "Starter Plan - Monthly",
    refundedAt: "2024-02-16T00:00:00Z",
    refundReason: "Customer requested cancellation",
  },
  {
    id: "txn_6",
    userId: "5",
    subscriptionId: "sub_5",
    amount: 19.99,
    status: "failed",
    paymentMethod: "khalti",
    date: "2024-02-20T00:00:00Z",
    description: "Team Plan - Monthly",
    failureReason: "Insufficient funds",
  },
  {
    id: "txn_7",
    userId: "6",
    subscriptionId: "sub_6",
    amount: 29.99,
    status: "pending",
    paymentMethod: "card",
    date: "2024-02-25T00:00:00Z",
    description: "Professional Plan - Monthly",
  },
]

// Utility functions
export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find((product) => product.id === id)
}

export const getUserSubscriptions = (userId: string): Subscription[] => {
  return mockSubscriptions.filter((sub) => sub.userId === userId)
}

export const getUserTransactions = (userId: string): Transaction[] => {
  return mockTransactions.filter((txn) => txn.userId === userId)
}

export const getActiveSubscription = (userId: string): Subscription | undefined => {
  return mockSubscriptions.find((sub) => sub.userId === userId && sub.status === "active")
}

export { mockUsers } from "./auth"
