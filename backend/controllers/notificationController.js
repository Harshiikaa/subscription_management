const AppError = require("../utils/errors");
const { sendSuccess } = require("../utils/response");
const {
  listNotificationsRepo,
  markNotificationReadRepo,
  markAllNotificationsReadRepo,
} = require("../repositories/notificationRepo");

exports.listMyNotifications = async (req, res, next) => {
  try {
    const { page, limit, unreadOnly, type } = req.query;
    const data = await listNotificationsRepo(req.user._id, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      unreadOnly: unreadOnly === "true",
      type,
    });
    return sendSuccess(res, data, "Notifications fetched");
  } catch (e) {
    next(e);
  }
};

exports.markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await markNotificationReadRepo(req.user._id, id);
    if (!updated) return next(AppError.notFound("Notification not found"));
    return sendSuccess(res, updated, "Notification marked as read");
  } catch (e) {
    next(e);
  }
};

exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    const result = await markAllNotificationsReadRepo(req.user._id);
    return sendSuccess(res, result, "All notifications marked as read");
  } catch (e) {
    next(e);
  }
};
