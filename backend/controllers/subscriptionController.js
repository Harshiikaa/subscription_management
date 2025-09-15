const { sendSuccess } = require("../utils/response");
const AppError = require("../utils/errors");
const {
  createFromProductService,
  createFromPlanService,
  getSubscriptionService,
  listMySubscriptionsService,
  listAllSubscriptionsService,
  cancelSubscriptionService,
  renewSubscriptionService,
  getSubscriptionsByProductService,
  getSubscriptionsByPlanService,
  getSubscriptionsByTypeService,
  getActiveSubscriptionsByUserService,
  getExpiringSubscriptionsService,
  setSubscriptionReminderService,
} = require("../services/subscriptionService");

// User creates subscription for a product
exports.createFromProduct = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, billingCycle, paymentMethod, reminderDaysBefore } =
      req.body;
    const sub = await createFromProductService({
      productId,
      userId,
      billingCycle,
      paymentMethod,
      reminderDaysBefore,
    });
    return sendSuccess(res, sub, "Product subscription created", 201);
  } catch (error) {
    next(error);
  }
};

// User creates subscription for a plan
exports.createFromPlan = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      subscriptionPlanId,
      billingCycle,
      paymentMethod,
      reminderDaysBefore,
    } = req.body;
    const sub = await createFromPlanService({
      subscriptionPlanId,
      userId,
      billingCycle,
      paymentMethod,
      reminderDaysBefore,
    });
    return sendSuccess(res, sub, "Plan subscription created", 201);
  } catch (error) {
    next(error);
  }
};

// Get single subscription
exports.getSubscription = async (req, res, next) => {
  try {
    const sub = await getSubscriptionService(req.params.subscriptionId);
    return sendSuccess(res, sub, "Subscription fetched");
  } catch (error) {
    next(error);
  }
};

// Set reminder days for a subscription
exports.setSubscriptionReminder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { reminderDaysBefore, testMinutesFromNow } = req.body;
    if (reminderDaysBefore == null || isNaN(reminderDaysBefore)) {
      throw AppError.badRequest(
        "reminderDaysBefore is required and must be a number"
      );
    }
    const reminder = await setSubscriptionReminderService({
      subscriptionId: id,
      userId,
      reminderDaysBefore: Number(reminderDaysBefore),
      testMinutesFromNow:
        testMinutesFromNow != null ? Number(testMinutesFromNow) : undefined,
    });
    return sendSuccess(res, reminder, "Subscription reminder scheduled");
  } catch (error) {
    next(error);
  }
};

// List current user's subscriptions
exports.listMySubscriptions = async (req, res, next) => {
  try {
    const subscriptionType = req.query.type; // 'product' or 'plan'
    const items = await listMySubscriptionsService(
      req.user._id,
      subscriptionType
    );
    return sendSuccess(res, items, "My subscriptions fetched");
  } catch (error) {
    next(error);
  }
};

// Admin list all subscriptions
exports.listAllSubscriptions = async (req, res, next) => {
  try {
    const data = await listAllSubscriptionsService({
      status: req.query.status,
      billingCycle: req.query.billingCycle,
      subscriptionType: req.query.type,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    });
    return sendSuccess(res, data, "All subscriptions fetched");
  } catch (error) {
    next(error);
  }
};

// Cancel a subscription
exports.cancelSubscription = async (req, res, next) => {
  try {
    const sub = await cancelSubscriptionService(
      req.params.subscriptionId,
      req.body?.reason
    );
    return sendSuccess(res, sub, "Subscription cancelled");
  } catch (error) {
    next(error);
  }
};

// Renew a subscription
exports.renewSubscription = async (req, res, next) => {
  try {
    const sub = await renewSubscriptionService(req.params.subscriptionId);
    return sendSuccess(res, sub, "Subscription renewed");
  } catch (error) {
    next(error);
  }
};

// Get subscriptions by product
exports.getSubscriptionsByProduct = async (req, res, next) => {
  try {
    const items = await getSubscriptionsByProductService(req.params.productId);
    return sendSuccess(res, items, "Product subscriptions fetched");
  } catch (error) {
    next(error);
  }
};

// Get subscriptions by plan
exports.getSubscriptionsByPlan = async (req, res, next) => {
  try {
    const items = await getSubscriptionsByPlanService(req.params.planId);
    return sendSuccess(res, items, "Plan subscriptions fetched");
  } catch (error) {
    next(error);
  }
};

// Get subscriptions by type
exports.getSubscriptionsByType = async (req, res, next) => {
  try {
    const subscriptionType = req.params.type; // 'product' or 'plan'
    const items = await getSubscriptionsByTypeService(subscriptionType);
    return sendSuccess(res, items, `${subscriptionType} subscriptions fetched`);
  } catch (error) {
    next(error);
  }
};

// Get active subscriptions for a user
exports.getActiveSubscriptions = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user._id;
    const items = await getActiveSubscriptionsByUserService(userId);
    return sendSuccess(res, items, "Active subscriptions fetched");
  } catch (error) {
    next(error);
  }
};

// Get expiring subscriptions
exports.getExpiringSubscriptions = async (req, res, next) => {
  try {
    const days = req.query.days ? Number(req.query.days) : 7;
    const items = await getExpiringSubscriptionsService(days);
    return sendSuccess(
      res,
      items,
      `Expiring subscriptions (${days} days) fetched`
    );
  } catch (error) {
    next(error);
  }
};
