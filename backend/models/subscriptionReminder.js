const mongoose = require("mongoose");

const SubscriptionReminderSchema = new mongoose.Schema(
  {
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
      index: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reminderDaysBefore: {
      type: Number,
      required: true,
      min: 0,
      default: 5,
    },
    reminderDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "sent", "cancelled"],
      default: "scheduled",
      index: true,
    },
    lastSentAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "SubscriptionReminder",
  SubscriptionReminderSchema
);
