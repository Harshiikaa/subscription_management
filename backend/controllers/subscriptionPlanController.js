const { sendSuccess } = require("../utils/response");
const AppError = require("../utils/errors");
const {
  createSubscriptionPlanService,
  updateSubscriptionPlanService,
  deleteSubscriptionPlanService,
  getSubscriptionPlanService,
  listSubscriptionPlansService,
  getPopularPlansService,
  getPlansByTypeService,
  searchPlansService,
  getActivePlansService,
  getSubscriptionOptionsService,
  updatePlanSortOrderService,
  bulkUpdatePlansService,
  togglePlanStatusService,
  setPopularPlanService,
  seedMockPlansService,
} = require("../services/subscriptionPlanService");

exports.createSubscriptionPlan = async (req, res, next) => {
  try {
    const adminId = req.user._id;
    const plan = await createSubscriptionPlanService(adminId, req.body);
    return sendSuccess(res, plan, "Subscription plan created", 201);
  } catch (error) {
    next(error);
  }
};

exports.updateSubscriptionPlan = async (req, res, next) => {
  try {
    const adminId = req.user._id;
    const plan = await updateSubscriptionPlanService(
      adminId,
      req.params.planId,
      req.body
    );
    return sendSuccess(res, plan, "Subscription plan updated");
  } catch (error) {
    next(error);
  }
};

exports.deleteSubscriptionPlan = async (req, res, next) => {
  try {
    const adminId = req.user._id;
    const plan = await deleteSubscriptionPlanService(
      adminId,
      req.params.planId
    );
    return sendSuccess(res, plan, "Subscription plan deleted");
  } catch (error) {
    next(error);
  }
};

exports.getSubscriptionPlan = async (req, res, next) => {
  try {
    const plan = await getSubscriptionPlanService(req.params.planId);
    return sendSuccess(res, plan, "Subscription plan fetched");
  } catch (error) {
    next(error);
  }
};

exports.listSubscriptionPlans = async (req, res, next) => {
  try {
    const data = await listSubscriptionPlansService({
      search: req.query.search,
      planType: req.query.planType,
      isPopular:
        req.query.isPopular === "true"
          ? true
          : req.query.isPopular === "false"
          ? false
          : undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      includeInactive: req.query.includeInactive === "true",
      sortBy: req.query.sortBy || "sortOrder",
      sortOrder: req.query.sortOrder === "desc" ? -1 : 1,
    });
    return sendSuccess(res, data, "Subscription plans fetched");
  } catch (error) {
    next(error);
  }
};

exports.getPopularPlans = async (req, res, next) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const plans = await getPopularPlansService(limit);
    return sendSuccess(res, plans, "Popular plans fetched");
  } catch (error) {
    next(error);
  }
};

exports.getPlansByType = async (req, res, next) => {
  try {
    const plans = await getPlansByTypeService(req.params.planType);
    return sendSuccess(res, plans, "Plans by type fetched");
  } catch (error) {
    next(error);
  }
};

exports.searchPlans = async (req, res, next) => {
  try {
    const { q: query } = req.query;
    if (!query) {
      throw AppError.badRequest("Search query is required");
    }

    const data = await searchPlansService(query, {
      planType: req.query.planType,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      tags: req.query.tags ? req.query.tags.split(",") : undefined,
    });
    return sendSuccess(res, data, "Search results fetched");
  } catch (error) {
    next(error);
  }
};

exports.getActivePlans = async (req, res, next) => {
  try {
    const plans = await getActivePlansService();
    return sendSuccess(res, plans, "Active plans fetched");
  } catch (error) {
    next(error);
  }
};

exports.getSubscriptionOptions = async (req, res, next) => {
  try {
    const data = await getSubscriptionOptionsService(req.params.planId);
    return sendSuccess(res, data, "Subscription options fetched");
  } catch (error) {
    next(error);
  }
};

exports.updatePlanSortOrder = async (req, res, next) => {
  try {
    const { sortOrder } = req.body;
    if (typeof sortOrder !== "number") {
      throw AppError.badRequest("Sort order must be a number");
    }

    const plan = await updatePlanSortOrderService(req.params.planId, sortOrder);
    return sendSuccess(res, plan, "Plan sort order updated");
  } catch (error) {
    next(error);
  }
};

exports.bulkUpdatePlans = async (req, res, next) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      throw AppError.badRequest("Updates array is required");
    }

    const result = await bulkUpdatePlansService(updates);
    return sendSuccess(res, result, "Plans updated successfully");
  } catch (error) {
    next(error);
  }
};

exports.togglePlanStatus = async (req, res, next) => {
  try {
    const adminId = req.user._id;
    const plan = await togglePlanStatusService(adminId, req.params.planId);
    return sendSuccess(res, plan, "Plan status toggled");
  } catch (error) {
    next(error);
  }
};

exports.setPopularPlan = async (req, res, next) => {
  try {
    const adminId = req.user._id;
    const { isPopular } = req.body;

    if (typeof isPopular !== "boolean") {
      throw AppError.badRequest("isPopular must be a boolean value");
    }

    const plan = await setPopularPlanService(
      adminId,
      req.params.planId,
      isPopular
    );
    return sendSuccess(res, plan, "Plan popularity status updated");
  } catch (error) {
    next(error);
  }
};

exports.seedMockPlans = async (req, res, next) => {
  try {
    const plans = await seedMockPlansService();
    return sendSuccess(res, plans, "Mock subscription plans seeded");
  } catch (error) {
    next(error);
  }
};
