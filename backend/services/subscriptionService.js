const AppError = require("../utils/errors");
const Subscription = require("../models/subscription");
const Product = require("../models/product");
const {
  createSubscriptionRepo,
  getSubscriptionByIdRepo,
  listUserSubscriptionsRepo,
  listAllSubscriptionsRepo,
  cancelSubscriptionRepo,
  renewSubscriptionRepo,
} = require("../repositories/subscriptionRepo");

exports.createFromProductService = async ({
  productId,
  userId,
  billingCycle,
  paymentMethod,
}) => {
  // Uses model integrity helpers
  const product = await Product.findById(productId);
  if (!product) throw AppError.notFound("Product not found");
  if (!product.canSubscribe())
    throw AppError.badRequest("Product not available for subscription");

  const existing = await Subscription.findOne({
    userId,
    productId,
    status: { $in: ["active", "trial"] },
  });
  if (existing) throw AppError.badRequest("Already subscribed to this product");

  const data = product.validateSubscription({ billingCycle, userId });
  data.paymentMethod = paymentMethod;

  return await createSubscriptionRepo(data);
};

exports.getSubscriptionService = async (id) => {
  const sub = await getSubscriptionByIdRepo(id);
  if (!sub) throw AppError.notFound("Subscription not found");
  return sub;
};

exports.listMySubscriptionsService = async (userId) => {
  return await listUserSubscriptionsRepo(userId);
};

exports.listAllSubscriptionsService = async (query) => {
  return await listAllSubscriptionsRepo(query);
};

exports.cancelSubscriptionService = async (id, reason = null) => {
  const sub = await cancelSubscriptionRepo(id, reason);
  if (!sub) throw AppError.notFound("Subscription not found");
  return sub;
};

exports.renewSubscriptionService = async (id) => {
  const sub = await renewSubscriptionRepo(id);
  if (!sub) throw AppError.notFound("Subscription not found");
  return sub;
};
