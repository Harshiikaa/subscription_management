const AppError = require("../utils/errors");
const SubscriptionPlan = require("../models/subscriptionPlan");
const {
  createSubscriptionPlanRepo,
  updateSubscriptionPlanRepo,
  deleteSubscriptionPlanRepo,
  getSubscriptionPlanByIdRepo,
  getSubscriptionPlanByNameRepo,
  listSubscriptionPlansRepo,
  getPopularPlansRepo,
  getPlansByTypeRepo,
  searchPlansRepo,
  getActivePlansRepo,
  updatePlanSortOrderRepo,
  bulkUpdatePlansRepo,
} = require("../repositories/subscriptionPlanRepo");

// Source of truth mock subscription plans
const MOCK_PLANS = [
  {
    name: "Basic Plan",
    description: "Perfect for individuals and small teams getting started",
    planType: "basic",
    pricing: { monthly: 9.99, yearly: 99.99, currency: "USD" },
    features: [
      {
        name: "5GB Storage",
        description: "Secure cloud storage",
        included: true,
      },
      { name: "Basic Support", description: "Email support", included: true },
      {
        name: "Mobile App",
        description: "Access on mobile devices",
        included: true,
      },
      {
        name: "File Sharing",
        description: "Share files with team members",
        included: true,
      },
    ],
    billingCycles: ["monthly", "yearly"],
    trialPeriod: { enabled: true, days: 14 },
    limits: {
      maxUsers: 5,
      maxStorage: "5GB",
      maxApiCalls: 1000,
      maxProjects: 3,
    },
    isPopular: false,
    tags: ["basic", "starter", "individual"],
    sortOrder: 1,
  },
  {
    name: "Professional Plan",
    description: "Advanced features for growing businesses and teams",
    planType: "premium",
    pricing: { monthly: 29.99, yearly: 299.99, currency: "USD" },
    features: [
      {
        name: "100GB Storage",
        description: "Ample cloud storage",
        included: true,
      },
      {
        name: "Priority Support",
        description: "24/7 priority support",
        included: true,
      },
      {
        name: "Advanced Analytics",
        description: "Detailed usage analytics",
        included: true,
      },
      {
        name: "Team Collaboration",
        description: "Advanced team features",
        included: true,
      },
      { name: "API Access", description: "Full API access", included: true },
      {
        name: "Custom Integrations",
        description: "Integrate with your tools",
        included: true,
      },
    ],
    billingCycles: ["monthly", "yearly"],
    trialPeriod: { enabled: true, days: 30 },
    limits: {
      maxUsers: 25,
      maxStorage: "100GB",
      maxApiCalls: 10000,
      maxProjects: 15,
    },
    isPopular: true,
    tags: ["professional", "business", "team"],
    sortOrder: 2,
  },
  {
    name: "Enterprise Plan",
    description: "Complete solution for large organizations with custom needs",
    planType: "enterprise",
    pricing: { monthly: 99.99, yearly: 999.99, currency: "USD" },
    features: [
      {
        name: "Unlimited Storage",
        description: "No storage limits",
        included: true,
      },
      {
        name: "Dedicated Support",
        description: "Dedicated account manager",
        included: true,
      },
      {
        name: "Advanced Security",
        description: "Enterprise-grade security",
        included: true,
      },
      {
        name: "Custom Workflows",
        description: "Tailored to your needs",
        included: true,
      },
      {
        name: "SSO Integration",
        description: "Single sign-on support",
        included: true,
      },
      {
        name: "Audit Logs",
        description: "Complete activity tracking",
        included: true,
      },
      {
        name: "White-labeling",
        description: "Brand with your identity",
        included: true,
      },
    ],
    billingCycles: ["monthly", "yearly"],
    trialPeriod: { enabled: true, days: 60 },
    limits: {
      maxUsers: null, // unlimited
      maxStorage: "unlimited",
      maxApiCalls: null, // unlimited
      maxProjects: null, // unlimited
    },
    isPopular: false,
    tags: ["enterprise", "large", "custom"],
    sortOrder: 3,
  },
];

exports.seedMockPlansService = async () => {
  for (const mock of MOCK_PLANS) {
    // use name as an idempotent unique field for upsert
    await SubscriptionPlan.updateOne(
      { name: mock.name },
      { $setOnInsert: mock, $set: { isActive: true } },
      { upsert: true }
    );
  }
  // return all active plans
  const seeded = await SubscriptionPlan.find({ isActive: true }).sort({
    sortOrder: 1,
  });
  return seeded;
};

exports.createSubscriptionPlanService = async (adminId, payload) => {
  // Check if plan with same name already exists
  const existingPlan = await getSubscriptionPlanByNameRepo(payload.name);
  if (existingPlan) {
    throw AppError.badRequest("Plan with this name already exists");
  }

  const plan = await SubscriptionPlan.createPlan({ ...payload }, adminId);
  return plan;
};

exports.updateSubscriptionPlanService = async (adminId, planId, payload) => {
  // Check if plan exists
  const existingPlan = await getSubscriptionPlanByIdRepo(planId);
  if (!existingPlan) {
    throw AppError.notFound("Subscription plan not found");
  }

  // If name is being updated, check for duplicates
  if (payload.name && payload.name !== existingPlan.name) {
    const duplicatePlan = await getSubscriptionPlanByNameRepo(payload.name);
    if (duplicatePlan) {
      throw AppError.badRequest("Plan with this name already exists");
    }
  }

  const updated = await SubscriptionPlan.updatePlan(
    planId,
    { ...payload },
    adminId
  );
  if (!updated) throw AppError.notFound("Subscription plan not found");
  return updated;
};

exports.deleteSubscriptionPlanService = async (adminId, planId) => {
  const deleted = await SubscriptionPlan.deletePlan(planId, adminId);
  if (!deleted) throw AppError.notFound("Subscription plan not found");
  return deleted;
};

exports.getSubscriptionPlanService = async (planId) => {
  try {
    const plan = await getSubscriptionPlanByIdRepo(planId);
    if (!plan) {
      throw AppError.notFound("Subscription plan not found");
    }
    if (!plan.isActive) {
      throw AppError.notFound("Subscription plan is not active");
    }
    return plan;
  } catch (error) {
    if (error.name === "CastError") {
      throw AppError.badRequest("Invalid subscription plan ID");
    }
    throw error;
  }
};

exports.listSubscriptionPlansService = async (query) => {
  return await listSubscriptionPlansRepo(query);
};

exports.getPopularPlansService = async (limit = 10) => {
  return await getPopularPlansRepo(limit);
};

exports.getPlansByTypeService = async (planType) => {
  return await getPlansByTypeRepo(planType);
};

exports.searchPlansService = async (query, options = {}) => {
  return await searchPlansRepo(query, options);
};

exports.getActivePlansService = async () => {
  return await getActivePlansRepo();
};

exports.getSubscriptionOptionsService = async (planId) => {
  const plan = await getSubscriptionPlanByIdRepo(planId);
  if (!plan || !plan.isActive)
    throw AppError.notFound("Subscription plan not found");
  const options = plan.getSubscriptionOptions();
  if (!options)
    throw AppError.badRequest("Plan not available for subscription");
  return options;
};

exports.updatePlanSortOrderService = async (planId, sortOrder) => {
  const plan = await getSubscriptionPlanByIdRepo(planId);
  if (!plan) throw AppError.notFound("Subscription plan not found");

  return await updatePlanSortOrderRepo(planId, sortOrder);
};

exports.bulkUpdatePlansService = async (updates) => {
  // Validate all plan IDs exist
  const planIds = updates.map((update) => update.planId);
  const existingPlans = await SubscriptionPlan.find({ _id: { $in: planIds } });

  if (existingPlans.length !== planIds.length) {
    throw AppError.badRequest("One or more plans not found");
  }

  return await bulkUpdatePlansRepo(updates);
};

exports.togglePlanStatusService = async (adminId, planId) => {
  const plan = await getSubscriptionPlanByIdRepo(planId);
  if (!plan) throw AppError.notFound("Subscription plan not found");

  const updated = await SubscriptionPlan.updatePlan(
    planId,
    { isActive: !plan.isActive },
    adminId
  );
  return updated;
};

exports.setPopularPlanService = async (adminId, planId, isPopular) => {
  const plan = await getSubscriptionPlanByIdRepo(planId);
  if (!plan) throw AppError.notFound("Subscription plan not found");

  const updated = await SubscriptionPlan.updatePlan(
    planId,
    { isPopular },
    adminId
  );
  return updated;
};
