const { markReminderSentRepo } = require("../repositories/subscriptionRepo");
const Subscription = require("../models/subscription");
const { createNotificationRepo } = require("../repositories/notificationRepo");

module.exports = (agenda) => {
  agenda.define("send-subscription-reminder", async (job) => {
    const { subscriptionId } = job.attrs.data || {};
    if (!subscriptionId) return;

    const subscription = await Subscription.findById(subscriptionId).populate(
      "userId productId subscriptionPlanId"
    );
    if (!subscription) return;

    // Create in-app notification instead of email
    const title = "Subscription expiring soon";
    const message = `Your subscription for ${
      subscription.productId?.name ||
      subscription.subscriptionPlanId?.name ||
      "a plan"
    } expires on ${new Date(subscription.endDate).toLocaleString()}.`;
    await createNotificationRepo({
      userId: subscription.userId?._id || subscription.userId,
      type: "subscription_reminder",
      title,
      message,
      metadata: {
        subscriptionId: subscription._id,
        productId:
          subscription.productId?._id || subscription.productId || null,
        subscriptionPlanId:
          subscription.subscriptionPlanId?._id ||
          subscription.subscriptionPlanId ||
          null,
        endDate: subscription.endDate,
      },
    });

    await markReminderSentRepo(subscription._id);
  });
};
