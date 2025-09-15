const AppError = require("../utils/errors");
const Subscription = require("../models/subscription");
const Product = require("../models/product");
const SubscriptionPlan = require("../models/subscriptionPlan");
const ReminderPreferences = require("../models/reminderPreferences");
const agendaConfig = require("../configs/agenda");
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

// Helper function to schedule reminder for subscription
const scheduleSubscriptionReminder = async (subscription) => {
  try {
    // Get user's reminder preferences
    const preferences = await ReminderPreferences.getUserPreferences(
      subscription.userId
    );

    if (!preferences || !preferences.subscriptionExpiryReminder.enabled) {
      console.log(`Reminder not enabled for user ${subscription.userId}`);
      return;
    }

    // Calculate reminder date
    const reminderDate = new Date(subscription.endDate);
    reminderDate.setDate(
      reminderDate.getDate() -
        preferences.subscriptionExpiryReminder.daysBeforeExpiry
    );

    // Only schedule if reminder date is in the future
    if (reminderDate > new Date()) {
      await agendaConfig.scheduleSubscriptionReminder(
        subscription._id,
        reminderDate
      );
      console.log(
        `✅ Scheduled reminder for subscription ${subscription._id} at ${reminderDate}`
      );
    } else {
      console.log(
        `Reminder date ${reminderDate} is in the past, skipping for subscription ${subscription._id}`
      );
    }
  } catch (error) {
    console.error(
      `Error scheduling reminder for subscription ${subscription._id}:`,
      error
    );
  }
};

exports.createFromProductService = async ({
  productId,
  userId,
  billingCycle,
  paymentMethod,
}) => {
  try {
    const subscription = await createFromProductRepo(
      productId,
      userId,
      billingCycle,
      paymentMethod
    );

    // Schedule reminder for the new subscription
    await scheduleSubscriptionReminder(subscription);

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
}) => {
  try {
    const subscription = await createFromPlanRepo(
      subscriptionPlanId,
      userId,
      billingCycle,
      paymentMethod
    );

    // Schedule reminder for the new subscription
    await scheduleSubscriptionReminder(subscription);

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
  return sub;
};

exports.listMySubscriptionsService = async (
  userId,
  subscriptionType = null
) => {
  return await listUserSubscriptionsRepo(userId, subscriptionType);
};

exports.listAllSubscriptionsService = async (query) => {
  return await listAllSubscriptionsRepo(query);
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
