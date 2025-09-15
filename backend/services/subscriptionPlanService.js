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

// Seeder removed for production usage

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
