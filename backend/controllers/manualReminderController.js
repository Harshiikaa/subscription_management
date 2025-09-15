const { sendSuccess, sendError } = require("../utils/response");
const AppError = require("../utils/errors");
const ManualReminder = require("../models/manualReminder");
const Subscription = require("../models/subscription");
const emailService = require("../services/emailService");

// Get user's manual reminders
exports.getUserReminders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { subscriptionId, upcoming } = req.query;

    const reminders = await ManualReminder.getUserReminders(userId, {
      subscriptionId,
      upcoming: upcoming === "true",
    });

    return sendSuccess(
      res,
      reminders,
      "Manual reminders retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

// Create a new manual reminder
exports.createReminder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      subscriptionId,
      title,
      description,
      reminderDate,
      reminderTime,
      reminderType = "email",
      customMessage,
      priority = "medium",
      tags = [],
    } = req.body;

    // Validate required fields
    if (!subscriptionId || !title || !reminderDate || !reminderTime) {
      throw AppError.badRequest(
        "Subscription ID, title, reminder date, and time are required"
      );
    }

    // Verify subscription belongs to user
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId: userId,
    });

    if (!subscription) {
      throw AppError.notFound("Subscription not found or access denied");
    }

    // Validate reminder date is in the future
    const reminderDateTime = new Date(`${reminderDate}T${reminderTime}:00`);
    if (reminderDateTime <= new Date()) {
      throw AppError.badRequest("Reminder date and time must be in the future");
    }

    // Create reminder
    const reminder = await ManualReminder.createReminder({
      userId,
      subscriptionId,
      title,
      description,
      reminderDate: new Date(reminderDate),
      reminderTime,
      reminderType,
      customMessage,
      priority,
      tags,
    });

    // Populate subscription details
    await reminder.populate(
      "subscriptionId",
      "productId subscriptionPlanId billingCycle amount currency endDate"
    );

    return sendSuccess(
      res,
      reminder,
      "Manual reminder created successfully",
      201
    );
  } catch (error) {
    next(error);
  }
};

// Update a manual reminder
exports.updateReminder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const reminderId = req.params.id;
    const updateData = req.body;

    // Find reminder and verify ownership
    const reminder = await ManualReminder.findOne({
      _id: reminderId,
      userId: userId,
      isActive: true,
    });

    if (!reminder) {
      throw AppError.notFound("Reminder not found or access denied");
    }

    // Don't allow updating if already sent
    if (reminder.isSent) {
      throw AppError.badRequest(
        "Cannot update a reminder that has already been sent"
      );
    }

    // Validate reminder date if being updated
    if (updateData.reminderDate || updateData.reminderTime) {
      const reminderDate = updateData.reminderDate || reminder.reminderDate;
      const reminderTime = updateData.reminderTime || reminder.reminderTime;
      const reminderDateTime = new Date(`${reminderDate}T${reminderTime}:00`);

      if (reminderDateTime <= new Date()) {
        throw AppError.badRequest(
          "Reminder date and time must be in the future"
        );
      }
    }

    // Update reminder
    const updatedReminder = await ManualReminder.findByIdAndUpdate(
      reminderId,
      updateData,
      { new: true, runValidators: true }
    ).populate(
      "subscriptionId",
      "productId subscriptionPlanId billingCycle amount currency endDate"
    );

    return sendSuccess(res, updatedReminder, "Reminder updated successfully");
  } catch (error) {
    next(error);
  }
};

// Delete a manual reminder
exports.deleteReminder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const reminderId = req.params.id;

    // Find reminder and verify ownership
    const reminder = await ManualReminder.findOne({
      _id: reminderId,
      userId: userId,
    });

    if (!reminder) {
      throw AppError.notFound("Reminder not found or access denied");
    }

    // Cancel reminder (soft delete)
    await reminder.cancel();

    return sendSuccess(res, null, "Reminder deleted successfully");
  } catch (error) {
    next(error);
  }
};

// Get a specific reminder
exports.getReminder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const reminderId = req.params.id;

    const reminder = await ManualReminder.findOne({
      _id: reminderId,
      userId: userId,
    }).populate(
      "subscriptionId",
      "productId subscriptionPlanId billingCycle amount currency endDate"
    );

    if (!reminder) {
      throw AppError.notFound("Reminder not found or access denied");
    }

    return sendSuccess(res, reminder, "Reminder retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// Send manual reminder immediately (for testing)
exports.sendReminderNow = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const reminderId = req.params.id;

    const reminder = await ManualReminder.findOne({
      _id: reminderId,
      userId: userId,
      isActive: true,
    }).populate("userId subscriptionId");

    if (!reminder) {
      throw AppError.notFound("Reminder not found or access denied");
    }

    if (reminder.isSent) {
      throw AppError.badRequest("Reminder has already been sent");
    }

    // Send email reminder
    const emailResult = await emailService.sendManualReminder(reminder);

    if (emailResult.success) {
      await reminder.markAsSent();
      return sendSuccess(
        res,
        { messageId: emailResult.messageId },
        "Reminder sent successfully"
      );
    } else {
      throw AppError.internalServerError(
        "Failed to send reminder: " + emailResult.error
      );
    }
  } catch (error) {
    next(error);
  }
};

// Get reminder statistics for user
exports.getReminderStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const stats = await ManualReminder.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalReminders: { $sum: 1 },
          activeReminders: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          sentReminders: {
            $sum: { $cond: [{ $eq: ["$isSent", true] }, 1, 0] },
          },
          upcomingReminders: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isActive", true] },
                    { $eq: ["$isSent", false] },
                    { $gt: ["$reminderDate", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          highPriorityReminders: {
            $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalReminders: 0,
      activeReminders: 0,
      sentReminders: 0,
      upcomingReminders: 0,
      highPriorityReminders: 0,
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
