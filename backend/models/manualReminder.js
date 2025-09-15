const mongoose = require("mongoose");

const manualReminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    reminderDate: {
      type: Date,
      required: true,
    },
    reminderTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSent: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    reminderType: {
      type: String,
      enum: ["email", "sms", "both"],
      default: "email",
    },
    customMessage: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 20,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
manualReminderSchema.index({ userId: 1, isActive: 1 });
manualReminderSchema.index({ reminderDate: 1, isActive: 1, isSent: 1 });
manualReminderSchema.index({ subscriptionId: 1 });

// Virtual for full reminder datetime
manualReminderSchema.virtual("fullReminderDateTime").get(function () {
  if (!this.reminderDate || !this.reminderTime) return null;

  const date = new Date(this.reminderDate);
  const [hours, minutes] = this.reminderTime.split(":");
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return date;
});

// Ensure virtual fields are serialized
manualReminderSchema.set("toJSON", { virtuals: true });

// Static method to get user's active reminders
manualReminderSchema.statics.getUserReminders = function (
  userId,
  options = {}
) {
  const query = { userId, isActive: true };

  if (options.subscriptionId) {
    query.subscriptionId = options.subscriptionId;
  }

  if (options.upcoming) {
    query.reminderDate = { $gte: new Date() };
  }

  return this.find(query)
    .populate(
      "subscriptionId",
      "productId subscriptionPlanId billingCycle amount currency endDate"
    )
    .sort({ reminderDate: 1, reminderTime: 1 });
};

// Static method to get reminders due for sending
manualReminderSchema.statics.getDueReminders = function () {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

  return this.find({
    isActive: true,
    isSent: false,
    reminderDate: { $lte: now },
    $or: [
      { reminderDate: { $lt: now } },
      {
        reminderDate: { $eq: now },
        reminderTime: { $lte: currentTime },
      },
    ],
  }).populate("userId subscriptionId");
};

// Static method to create reminder
manualReminderSchema.statics.createReminder = function (reminderData) {
  return this.create(reminderData);
};

// Instance method to check if reminder is due
manualReminderSchema.methods.isDue = function () {
  if (!this.reminderDate || !this.reminderTime || this.isSent) return false;

  const now = new Date();
  const reminderDateTime = this.fullReminderDateTime;

  return reminderDateTime && reminderDateTime <= now;
};

// Instance method to mark as sent
manualReminderSchema.methods.markAsSent = function () {
  this.isSent = true;
  this.sentAt = new Date();
  return this.save();
};

// Instance method to cancel reminder
manualReminderSchema.methods.cancel = function () {
  this.isActive = false;
  return this.save();
};

// Pre-save validation
manualReminderSchema.pre("save", function (next) {
  // Ensure reminder date is in the future
  if (this.fullReminderDateTime <= new Date()) {
    return next(new Error("Reminder date and time must be in the future"));
  }

  next();
});

module.exports = mongoose.model("ManualReminder", manualReminderSchema);
