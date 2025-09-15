const { sendSuccess, sendError } = require("../utils/response");
const AppError = require("../utils/errors");
const ReminderPreferences = require("../models/reminderPreferences");
const emailService = require("../services/emailService");

// Get user's reminder preferences
exports.getReminderPreferences = async (req, res, next) => {
  try {
    const userId = req.user._id;

    let preferences = await ReminderPreferences.getUserPreferences(userId);

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await ReminderPreferences.create({
        userId,
        subscriptionExpiryReminder: {
          enabled: true,
          daysBeforeExpiry: 10,
        },
        emailNotifications: {
          enabled: true,
          email: req.user.email,
        },
        smsNotifications: {
          enabled: false,
        },
      });
    }

    return sendSuccess(
      res,
      preferences,
      "Reminder preferences retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

// Update user's reminder preferences
exports.updateReminderPreferences = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { subscriptionExpiryReminder, emailNotifications, smsNotifications } =
      req.body;

    // Validate the data
    if (subscriptionExpiryReminder) {
      if (
        subscriptionExpiryReminder.daysBeforeExpiry &&
        ![10, 15].includes(subscriptionExpiryReminder.daysBeforeExpiry)
      ) {
        throw AppError.badRequest("Days before expiry must be either 10 or 15");
      }
    }

    if (
      emailNotifications &&
      emailNotifications.enabled &&
      !emailNotifications.email
    ) {
      throw AppError.badRequest(
        "Email is required when email notifications are enabled"
      );
    }

    if (
      smsNotifications &&
      smsNotifications.enabled &&
      !smsNotifications.phoneNumber
    ) {
      throw AppError.badRequest(
        "Phone number is required when SMS notifications are enabled"
      );
    }

    // Update preferences
    const preferences = await ReminderPreferences.updateUserPreferences(
      userId,
      {
        subscriptionExpiryReminder,
        emailNotifications,
        smsNotifications,
      }
    );

    return sendSuccess(
      res,
      preferences,
      "Reminder preferences updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

// Send test email
exports.sendTestEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw AppError.badRequest("Email address is required");
    }

    const result = await emailService.sendTestEmail(email);

    if (result.success) {
      return sendSuccess(
        res,
        { messageId: result.messageId },
        "Test email sent successfully"
      );
    } else {
      throw AppError.internalServerError(
        "Failed to send test email: " + result.error
      );
    }
  } catch (error) {
    next(error);
  }
};

// Get reminder statistics for admin
exports.getReminderStats = async (req, res, next) => {
  try {
    const stats = await ReminderPreferences.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          emailEnabled: {
            $sum: {
              $cond: [{ $eq: ["$emailNotifications.enabled", true] }, 1, 0],
            },
          },
          smsEnabled: {
            $sum: {
              $cond: [{ $eq: ["$smsNotifications.enabled", true] }, 1, 0],
            },
          },
          reminderEnabled: {
            $sum: {
              $cond: [
                { $eq: ["$subscriptionExpiryReminder.enabled", true] },
                1,
                0,
              ],
            },
          },
          tenDayReminders: {
            $sum: {
              $cond: [
                { $eq: ["$subscriptionExpiryReminder.daysBeforeExpiry", 10] },
                1,
                0,
              ],
            },
          },
          fifteenDayReminders: {
            $sum: {
              $cond: [
                { $eq: ["$subscriptionExpiryReminder.daysBeforeExpiry", 15] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalUsers: 0,
      emailEnabled: 0,
      smsEnabled: 0,
      reminderEnabled: 0,
      tenDayReminders: 0,
      fifteenDayReminders: 0,
    };

    return sendSuccess(
      res,
      result,
      "Reminder statistics retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};
