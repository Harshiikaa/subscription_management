const { markReminderSentRepo } = require("../repositories/subscriptionRepo");
const Subscription = require("../models/subscription");

module.exports = (agenda) => {
  agenda.define("send-subscription-reminder", async (job) => {
    const { subscriptionId } = job.attrs.data || {};
    if (!subscriptionId) return;

    const subscription = await Subscription.findById(subscriptionId).populate(
      "userId productId subscriptionPlanId"
    );
    if (!subscription) return;

    // Replace with real email logic if needed
    console.log(
      `Reminder: Subscription ${subscription._id} for user ${subscription.userId?.email} is expiring on ${subscription.endDate}`
    );

    await markReminderSentRepo(subscription._id);
  });
};
