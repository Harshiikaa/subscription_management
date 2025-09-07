import type { User, Subscription, Transaction } from "./mock-data"

export class DemoDataGenerator {
  private static userCounter = 100
  private static transactionCounter = 1000
  private static subscriptionCounter = 100

  static generateUser(overrides: Partial<User> = {}): User {
    const id = (this.userCounter++).toString()
    const names = ["John", "Jane", "Bob", "Alice", "Charlie", "Diana", "Eve", "Frank"]
    const surnames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]
    const domains = ["example.com", "test.com", "demo.com", "sample.org"]

    const firstName = names[Math.floor(Math.random() * names.length)]
    const lastName = surnames[Math.floor(Math.random() * surnames.length)]
    const domain = domains[Math.floor(Math.random() * domains.length)]

    return {
      id,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      name: `${firstName} ${lastName}`,
      role: Math.random() > 0.9 ? "admin" : "user",
      isVerified: Math.random() > 0.3,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      ...overrides,
    }
  }

  static generateSubscription(userId: string, productId: string, overrides: Partial<Subscription> = {}): Subscription {
    const id = `sub_${this.subscriptionCounter++}`
    const statuses: Subscription["status"][] = ["active", "cancelled", "expired", "pending"]
    const billingCycles: Subscription["billingCycle"][] = ["monthly", "yearly"]
    const paymentMethods = ["eSewa", "Khalti", "Stripe", "Card"]

    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const billingCycle = billingCycles[Math.floor(Math.random() * billingCycles.length)]
    const startDate = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
    const endDate = new Date(startDate.getTime() + (billingCycle === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000)

    return {
      id,
      userId,
      productId,
      status,
      billingCycle,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      nextBilling:
        status === "active" ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      amount: billingCycle === "yearly" ? Math.random() * 500 + 100 : Math.random() * 50 + 10,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      ...overrides,
    }
  }

  static generateTransaction(
    userId: string,
    subscriptionId: string,
    overrides: Partial<Transaction> = {},
  ): Transaction {
    const id = `txn_${this.transactionCounter++}`
    const statuses: Transaction["status"][] = ["completed", "pending", "failed", "refunded"]
    const paymentMethods: Transaction["paymentMethod"][] = ["esewa", "khalti", "stripe", "card"]
    const descriptions = [
      "Starter Plan - Monthly",
      "Professional Plan - Monthly",
      "Enterprise Plan - Yearly",
      "Team Plan - Monthly",
    ]

    const status = statuses[Math.floor(Math.random() * statuses.length)]

    return {
      id,
      userId,
      subscriptionId,
      amount: Math.random() * 100 + 10,
      status,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      refundedAt: status === "refunded" ? new Date().toISOString() : undefined,
      refundReason: status === "refunded" ? "Customer requested refund" : undefined,
      failureReason: status === "failed" ? "Payment method declined" : undefined,
      ...overrides,
    }
  }

  static generateBulkUsers(count: number): User[] {
    return Array.from({ length: count }, () => this.generateUser())
  }

  static generateBulkSubscriptions(userIds: string[], productIds: string[], count: number): Subscription[] {
    return Array.from({ length: count }, () => {
      const userId = userIds[Math.floor(Math.random() * userIds.length)]
      const productId = productIds[Math.floor(Math.random() * productIds.length)]
      return this.generateSubscription(userId, productId)
    })
  }

  static generateBulkTransactions(subscriptions: Subscription[], count: number): Transaction[] {
    return Array.from({ length: count }, () => {
      const subscription = subscriptions[Math.floor(Math.random() * subscriptions.length)]
      return this.generateTransaction(subscription.userId, subscription.id)
    })
  }

  static generateCompleteDataset(userCount = 50, subscriptionCount = 75, transactionCount = 200) {
    const users = this.generateBulkUsers(userCount)
    const productIds = ["1", "2", "3", "4"] // Using existing product IDs
    const subscriptions = this.generateBulkSubscriptions(
      users.map((u) => u.id),
      productIds,
      subscriptionCount,
    )
    const transactions = this.generateBulkTransactions(subscriptions, transactionCount)

    return {
      users,
      subscriptions,
      transactions,
    }
  }
}

// Generate additional test data
export const additionalTestData = DemoDataGenerator.generateCompleteDataset(25, 40, 100)
