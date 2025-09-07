const Subscription = require("../models/subscription");

exports.createSubscriptionRepo = async (data) => {
  return await Subscription.create(data);
};

exports.getSubscriptionByIdRepo = async (id) => {
  return await Subscription.findById(id).populate("userId productId");
};

exports.listUserSubscriptionsRepo = async (userId) => {
  return await Subscription.find({ userId })
    .sort({ createdAt: -1 })
    .populate("productId");
};

exports.listAllSubscriptionsRepo = async ({
  status,
  billingCycle,
  page = 1,
  limit = 20,
} = {}) => {
  const query = {};
  if (status) query.status = status;
  if (billingCycle) query.billingCycle = billingCycle;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Subscription.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId productId"),
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
