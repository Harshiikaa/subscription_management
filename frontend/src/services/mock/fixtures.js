export const mockPlans = [
  {
    id: "free",
    name: "Free",
    price: "NPR 0",
    features: ["Basic features", "Email support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "NPR 999/mo",
    features: ["Advanced features", "Priority support", "Higher limits"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Contact us",
    features: ["Custom features", "Dedicated success manager", "SLA support"],
  },
];

export const mockSubscription = {
  planId: "free",
  planName: "Free",
  status: "active",
  renewsOn: null,
};

export const mockPayments = [
  {
    id: "p1",
    date: "2025-01-01",
    gateway: "esewa",
    amount: "NPR 999",
    status: "paid",
  },
  {
    id: "p2",
    date: "2025-02-01",
    gateway: "imepay",
    amount: "NPR 999",
    status: "paid",
  },
];

export const mockUser = {
  token: "mock-token",
  user: {
    id: "u_mock",
    name: "Mock User",
    email: "user@example.com",
    role: "user",
  },
};

export const mockAdminUsers = [
  { id: "u1", name: "Admin User", email: "admin@example.com", role: "admin" },
  { id: "u2", name: "Regular User", email: "user@example.com", role: "user" },
];

export const mockAdminPayments = [
  {
    id: "ap1",
    date: "2025-03-01",
    userEmail: "user@example.com",
    gateway: "esewa",
    amount: "NPR 999",
    status: "paid",
  },
  {
    id: "ap2",
    date: "2025-03-10",
    userEmail: "user2@example.com",
    gateway: "imepay",
    amount: "NPR 1999",
    status: "paid",
  },
];
