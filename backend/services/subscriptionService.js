const AppError = require("../utils/errors");
const Subscription = require("../models/subscription");
const Product = require("../models/product");
const SubscriptionPlan = require("../models/subscriptionPlan");
const { getAgenda } = require("../utils/agenda");
const SubscriptionReminder = require("../models/subscriptionReminder");
const {
  createSubscriptionRepo,
  getSubscriptionByIdRepo,
  listUserSubscriptionsRepo,
  listAllSubscriptionsRepo,
  cancelSubscriptionRepo,
  renewSubscriptionRepo,
  createFromProductRepo,
  createFromPlanRepo,
  getSubscriptionsByProductRepo,
  getSubscriptionsByPlanRepo,
  getSubscriptionsByTypeRepo,
  getActiveSubscriptionsByUserRepo,
  getExpiringSubscriptionsRepo,
} = require("../repositories/subscriptionRepo");
const {
  listSubscriptionsByUserRepo,
} = require("../repositories/subscriptionRepo");

// Helper function to schedule reminder for subscription with explicit reminderDaysBefore
const scheduleSubscriptionReminder = async (
  subscription,
  reminderDaysBefore,
  testMinutesFromNow
) => {
  const agenda = getAgenda();
  const endDate = new Date(subscription.endDate);
  let reminderDate = new Date(endDate);
  reminderDate.setDate(reminderDate.getDate() - (reminderDaysBefore || 5));

  if (
    process.env.NODE_ENV !== "production" &&
    testMinutesFromNow &&
    testMinutesFromNow > 0
  ) {
    reminderDate = new Date(Date.now() + testMinutesFromNow * 60 * 1000);
  }

  if (reminderDate <= new Date()) {
    console.log(
      `Reminder date ${reminderDate} is in the past, skipping for subscription ${subscription._id}`
    );
    return null;
  }

  await agenda.schedule(reminderDate, "send-subscription-reminder", {
    subscriptionId: subscription._id,
  });

  return await SubscriptionReminder.findOneAndUpdate(
    { subscriptionId: subscription._id },
    {
      subscriptionId: subscription._id,
      userId: subscription.userId,
      reminderDaysBefore: reminderDaysBefore || 5,
      reminderDate,
      status: "scheduled",
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

exports.createFromProductService = async ({
  productId,
  userId,
  billingCycle,
  paymentMethod,
  reminderDaysBefore,
}) => {
  try {
    const subscription = await createFromProductRepo(
      productId,
      userId,
      billingCycle,
      paymentMethod
    );

    // Schedule reminder for the new subscription
    await scheduleSubscriptionReminder(subscription, reminderDaysBefore);

    return subscription;
  } catch (error) {
    if (error.message.includes("not found")) {
      throw AppError.notFound("Product not found");
    }
    if (error.message.includes("not available")) {
      throw AppError.badRequest("Product not available for subscription");
    }
    if (error.message.includes("already has an active subscription")) {
      throw AppError.badRequest("Already subscribed to this product");
    }
    throw error;
  }
};

exports.createFromPlanService = async ({
  subscriptionPlanId,
  userId,
  billingCycle,
  paymentMethod,
  reminderDaysBefore,
}) => {
  try {
    const subscription = await createFromPlanRepo(
      subscriptionPlanId,
      userId,
      billingCycle,
      paymentMethod
    );

    // Schedule reminder for the new subscription
    await scheduleSubscriptionReminder(subscription, reminderDaysBefore);

    return subscription;
  } catch (error) {
    if (error.message.includes("not found")) {
      throw AppError.notFound("Subscription plan not found");
    }
    if (error.message.includes("not available")) {
      throw AppError.badRequest("Plan not available for subscription");
    }
    if (error.message.includes("already has an active subscription")) {
      throw AppError.badRequest("Already subscribed to this plan");
    }
    throw error;
  }
};

exports.getSubscriptionService = async (id) => {
  const sub = await getSubscriptionByIdRepo(id);
  if (!sub) throw AppError.notFound("Subscription not found");
  return {
    ...sub.toObject(),
    expiryDate: sub.endDate,
  };
};

exports.listMySubscriptionsService = async (
  userId,
  subscriptionType = null
) => {
  const items = await listUserSubscriptionsRepo(userId, subscriptionType);
  return items.map((s) => ({ ...s.toObject(), expiryDate: s.endDate }));
};

exports.listAllSubscriptionsService = async (query) => {
  return await listAllSubscriptionsRepo(query);
};

exports.listSubscriptionsByUserService = async (userId) => {
  return await listSubscriptionsByUserRepo(userId);
};

exports.getSubscriptionsByProductService = async (productId) => {
  return await getSubscriptionsByProductRepo(productId);
};

exports.getSubscriptionsByPlanService = async (subscriptionPlanId) => {
  return await getSubscriptionsByPlanRepo(subscriptionPlanId);
};

exports.getSubscriptionsByTypeService = async (subscriptionType) => {
  return await getSubscriptionsByTypeRepo(subscriptionType);
};

exports.getActiveSubscriptionsByUserService = async (userId) => {
  return await getActiveSubscriptionsByUserRepo(userId);
};

exports.getExpiringSubscriptionsService = async (days = 7) => {
  return await getExpiringSubscriptionsRepo(days);
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

// Public API: set reminder by days and (re)schedule job
exports.setSubscriptionReminderService = async ({
  subscriptionId,
  userId,
  reminderDaysBefore,
  testMinutesFromNow,
}) => {
  const sub = await getSubscriptionByIdRepo(subscriptionId);
  if (!sub) throw AppError.notFound("Subscription not found");
  const subOwnerId =
    sub?.userId && typeof sub.userId === "object" && sub.userId._id
      ? sub.userId._id
      : sub.userId;
  if (String(subOwnerId) !== String(userId)) {
    throw AppError.forbidden("You do not own this subscription");
  }
  const reminder = await scheduleSubscriptionReminder(
    sub,
    reminderDaysBefore,
    testMinutesFromNow
  );
  return reminder;
};
