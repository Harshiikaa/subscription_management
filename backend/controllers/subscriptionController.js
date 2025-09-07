const { sendSuccess } = require("../utils/response");
const AppError = require("../utils/errors");
const {
  createFromProductService,
  getSubscriptionService,
  listMySubscriptionsService,
  listAllSubscriptionsService,
  cancelSubscriptionService,
  renewSubscriptionService,
} = require("../services/subscriptionService");

// User creates subscription for a product
exports.createFromProduct = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, billingCycle, paymentMethod } = req.body;
    const sub = await createFromProductService({
      productId,
      userId,
      billingCycle,
      paymentMethod,
    });
    return sendSuccess(res, sub, "Subscription created", 201);
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

// List current user's subscriptions
exports.listMySubscriptions = async (req, res, next) => {
  try {
    const items = await listMySubscriptionsService(req.user._id);
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
