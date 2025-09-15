const mongoose = require("mongoose");

const reminderPreferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    subscriptionExpiryReminder: {
      enabled: {
        type: Boolean,
        default: true,
      },
      daysBeforeExpiry: {
        type: Number,
        enum: [10, 15],
        default: 10,
      },
    },
    emailNotifications: {
      enabled: {
        type: Boolean,
        default: true,
      },
      email: {
        type: String,
        required: function () {
          return this.emailNotifications.enabled;
        },
      },
    },
    smsNotifications: {
      enabled: {
        type: Boolean,
        default: false,
      },
      phoneNumber: {
        type: String,
        required: function () {
          return this.smsNotifications.enabled;
        },
      },
    },
    lastReminderSent: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
reminderPreferencesSchema.index({ userId: 1 });

// Static method to get user's reminder preferences
reminderPreferencesSchema.statics.getUserPreferences = function (userId) {
  return this.findOne({ userId });
};

// Static method to create or update user preferences
reminderPreferencesSchema.statics.updateUserPreferences = function (
  userId,
  preferences
) {
  return this.findOneAndUpdate(
    { userId },
    { $set: preferences },
    { upsert: true, new: true, runValidators: true }
  );
};

// Instance method to check if reminder should be sent
reminderPreferencesSchema.methods.shouldSendReminder = function (
  subscriptionEndDate
) {
  if (!this.subscriptionExpiryReminder.enabled) {
    return false;
  }

  const reminderDate = new Date(subscriptionEndDate);
  reminderDate.setDate(
    reminderDate.getDate() - this.subscriptionExpiryReminder.daysBeforeExpiry
  );

  const now = new Date();
  const timeDiff = reminderDate.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // Send reminder if we're within 1 day of the reminder date
  return daysDiff <= 1 && daysDiff >= 0;
};

module.exports = mongoose.model(
  "ReminderPreferences",
  reminderPreferencesSchema
);
