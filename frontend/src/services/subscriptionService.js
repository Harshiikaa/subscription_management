import api from "./api";

export const subscriptionService = {
  listPlans: () => api.get("/plans"),
  createPlan: (payload) => api.post("/plans", payload),
  updatePlan: (id, payload) => api.put(`/plans/${id}`, payload),
  deletePlan: (id) => api.delete(`/plans/${id}`),

  getMySubscription: () => api.get("/subscriptions/me"),
  subscribe: (planId, gateway) =>
    api.post("/subscriptions", { planId, gateway }),
  upgrade: (planId) => api.post("/subscriptions/upgrade", { planId }),
  downgrade: (planId) => api.post("/subscriptions/downgrade", { planId }),
  cancel: () => api.post("/subscriptions/cancel"),
  billingHistory: () => api.get("/payments/history"),
};

export default subscriptionService;
