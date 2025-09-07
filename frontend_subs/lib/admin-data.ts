import { type User, mockUsers, mockSubscriptions, mockTransactions } from "./mock-data"

export interface AdminStats {
  totalUsers: number
  activeSubscriptions: number
  totalRevenue: number
  monthlyRecurringRevenue: number
  churnRate: number
  newUsersThisMonth: number
  pendingVerifications: number
  failedPayments: number
}

export interface RevenueData {
  month: string
  revenue: number
  subscriptions: number
}

// Extended user data for admin management
export interface AdminUserView extends User {
  subscriptionCount: number
  totalSpent: number
  lastLogin?: string
  status: "active" | "blocked" | "suspended"
}

// Calculate admin statistics
export const getAdminStats = (): AdminStats => {
  const totalUsers = mockUsers.length
  const activeSubscriptions = mockSubscriptions.filter((sub) => sub.status === "active").length
  const completedTransactions = mockTransactions.filter((txn) => txn.status === "completed")
  const totalRevenue = completedTransactions.reduce((sum, txn) => sum + txn.amount, 0)

  // Mock calculations for demonstration
  const monthlyRecurringRevenue = mockSubscriptions
    .filter((sub) => sub.status === "active" && sub.billingCycle === "monthly")
    .reduce((sum, sub) => sum + sub.amount, 0)

  const thisMonth = new Date()
  thisMonth.setDate(1)
  const newUsersThisMonth = mockUsers.filter((user) => new Date(user.createdAt) >= thisMonth).length

  const pendingVerifications = mockUsers.filter((user) => !user.isVerified).length
  const failedPayments = mockTransactions.filter((txn) => txn.status === "failed").length

  return {
    totalUsers,
    activeSubscriptions,
    totalRevenue,
    monthlyRecurringRevenue,
    churnRate: 5.2, // Mock churn rate
    newUsersThisMonth,
    pendingVerifications,
    failedPayments,
  }
}

// Get revenue data for charts
export const getRevenueData = (): RevenueData[] => {
  return [
    { month: "Jan", revenue: 4500, subscriptions: 45 },
    { month: "Feb", revenue: 5200, subscriptions: 52 },
    { month: "Mar", revenue: 4800, subscriptions: 48 },
    { month: "Apr", revenue: 6100, subscriptions: 61 },
    { month: "May", revenue: 7200, subscriptions: 72 },
    { month: "Jun", revenue: 8500, subscriptions: 85 },
  ]
}

// Get users with admin view data
export const getAdminUsers = (): AdminUserView[] => {
  return mockUsers.map((user) => {
    const userSubscriptions = mockSubscriptions.filter((sub) => sub.userId === user.id)
    const userTransactions = mockTransactions.filter((txn) => txn.userId === user.id)
    const totalSpent = userTransactions
      .filter((txn) => txn.status === "completed")
      .reduce((sum, txn) => sum + txn.amount, 0)

    return {
      ...user,
      subscriptionCount: userSubscriptions.length,
      totalSpent,
      lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: Math.random() > 0.1 ? "active" : "blocked", // Mock status
    }
  })
}

// Admin actions
export const blockUser = (userId: string): boolean => {
  console.log("Blocking user:", userId)
  return true
}

export const unblockUser = (userId: string): boolean => {
  console.log("Unblocking user:", userId)
  return true
}

export const verifyUser = (userId: string): boolean => {
  console.log("Verifying user:", userId)
  return true
}

export const refundTransaction = (transactionId: string): boolean => {
  console.log("Refunding transaction:", transactionId)
  return true
}

export const cancelSubscription = (subscriptionId: string): boolean => {
  console.log("Cancelling subscription:", subscriptionId)
  return true
}
