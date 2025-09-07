export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = []

  if (!email) {
    errors.push("Email is required")
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Invalid email format")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = []

  if (!password) {
    errors.push("Password is required")
  } else {
    if (password.length < 6) {
      errors.push("Password must be at least 6 characters long")
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter")
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Password must contain at least one uppercase letter")
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number")
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validatePaymentAmount = (amount: number): ValidationResult => {
  const errors: string[] = []

  if (!amount || amount <= 0) {
    errors.push("Amount must be greater than 0")
  }

  if (amount > 10000) {
    errors.push("Amount cannot exceed $10,000")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateSubscriptionData = (data: any): ValidationResult => {
  const errors: string[] = []

  if (!data.userId) {
    errors.push("User ID is required")
  }

  if (!data.productId) {
    errors.push("Product ID is required")
  }

  if (!data.billingCycle || !["monthly", "yearly"].includes(data.billingCycle)) {
    errors.push("Valid billing cycle is required")
  }

  if (!data.paymentMethod) {
    errors.push("Payment method is required")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "")
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}
