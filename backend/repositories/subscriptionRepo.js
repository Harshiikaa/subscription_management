const Subscription = require("../models/subscription");
const SubscriptionReminder = require("../models/subscriptionReminder");

exports.createSubscriptionRepo = async (data) => {
  return await Subscription.create(data);
};

exports.getSubscriptionByIdRepo = async (id) => {
  return await Subscription.findById(id).populate(
    "userId productId subscriptionPlanId"
  );
};

exports.listUserSubscriptionsRepo = async (userId, subscriptionType = null) => {
  const query = { userId };
  if (subscriptionType) query.subscriptionType = subscriptionType;

  return await Subscription.find(query)
    .sort({ createdAt: -1 })
    .populate("productId subscriptionPlanId");
};

exports.listAllSubscriptionsRepo = async ({
  status,
  billingCycle,
  subscriptionType,
  page = 1,
  limit = 20,
} = {}) => {
  const query = {};
  if (status) query.status = status;
  if (billingCycle) query.billingCycle = billingCycle;
  if (subscriptionType) query.subscriptionType = subscriptionType;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Subscription.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId productId subscriptionPlanId"),
    Subscription.countDocuments(query),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

exports.cancelSubscriptionRepo = async (id, reason = null) => {
  const sub = await Subscription.findById(id);
  if (!sub) return null;
  await sub.cancel(reason);
  return sub;
};

exports.renewSubscriptionRepo = async (id) => {
  const sub = await Subscription.findById(id);
  if (!sub) return null;
  await sub.renew();
  return sub;
};

// New methods for handling both product and plan subscriptions
exports.createFromProductRepo = async (
  productId,
  userId,
  billingCycle,
  paymentMethod
) => {
  return await Subscription.createFromProduct(
    productId,
    userId,
    billingCycle,
    paymentMethod
  );
};

exports.createFromPlanRepo = async (
  subscriptionPlanId,
  userId,
  billingCycle,
  paymentMethod
) => {
  return await Subscription.createFromPlan(
    subscriptionPlanId,
    userId,
    billingCycle,
    paymentMethod
  );
};

exports.getSubscriptionsByProductRepo = async (productId) => {
  return await Subscription.findByProduct(productId);
};

exports.getSubscriptionsByPlanRepo = async (subscriptionPlanId) => {
  return await Subscription.findByPlan(subscriptionPlanId);
};

exports.getSubscriptionsByTypeRepo = async (subscriptionType) => {
  return await Subscription.findByType(subscriptionType);
};

exports.getActiveSubscriptionsByUserRepo = async (userId) => {
  return await Subscription.findActiveByUser(userId);
};

exports.getExpiringSubscriptionsRepo = async (days = 7) => {
  return await Subscription.findExpiring(days);
};

// Reminder repository helpers
exports.upsertSubscriptionReminderRepo = async ({
  subscriptionId,
  userId,
  reminderDaysBefore,
  reminderDate,
}) => {
  const doc = await SubscriptionReminder.findOneAndUpdate(
    { subscriptionId },
    {
      subscriptionId,
      userId,
      reminderDaysBefore,
      reminderDate,
      status: "scheduled",
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return doc;
};

exports.markReminderSentRepo = async (subscriptionId) => {
  return await SubscriptionReminder.findOneAndUpdate(
    { subscriptionId },
    { status: "sent", lastSentAt: new Date() },
    { new: true }
  );
};

exports.getReminderBySubscriptionRepo = async (subscriptionId) => {
  return await SubscriptionReminder.findOne({ subscriptionId });
};
