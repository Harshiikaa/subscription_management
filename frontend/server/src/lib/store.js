import { v4 as uuid } from "uuid";

export const db = {
  users: [
    {
      id: "u1",
      name: "Admin User",
      email: "admin@example.com",
      password: "admin",
      role: "admin",
    },
    {
      id: "u2",
      name: "Regular User",
      email: "user@example.com",
      password: "user",
      role: "user",
    },
  ],
  plans: [
    {
      id: "free",
      name: "Free",
      price: "NPR 0",
      features: ["Basic features", "Email support"],
      isActive: true,
    },
    {
      id: "pro",
      name: "Pro",
      price: "NPR 999/mo",
      features: ["Advanced features", "Priority support", "Higher limits"],
      isActive: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Contact us",
      features: ["Custom features", "Dedicated success manager", "SLA support"],
      isActive: true,
    },
  ],
  subscriptions: [
    // { id, userId, planId, status, renewsOn, gateway }
  ],
  payments: [
    // { id, userId, subscriptionId, gateway, amount, status, externalRef, createdAt }
  ],
};

export const createId = () => uuid();
