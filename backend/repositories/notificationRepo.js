const Notification = require("../models/notification");

exports.createNotificationRepo = async ({
  userId,
  type = "system",
  title,
  message,
  metadata = {},
}) => {
  const doc = await Notification.create({
    userId,
    type,
    title,
    message,
    metadata,
  });
  return doc;
};

exports.listNotificationsRepo = async (
  userId,
  { page = 1, limit = 20, unreadOnly = false, type } = {}
) => {
  const filter = { userId };
  if (unreadOnly) filter.read = false;
  if (type) filter.type = type;

  const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
  const [items, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Math.max(1, limit)),
    Notification.countDocuments(filter),
  ]);

  return {
    items,
    page: Math.max(1, page),
    limit: Math.max(1, limit),
    total,
    totalPages: Math.ceil(total / Math.max(1, limit)) || 1,
  };
};

exports.markNotificationReadRepo = async (userId, notificationId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true, readAt: new Date() },
    { new: true }
  );
};

exports.markAllNotificationsReadRepo = async (userId) => {
  const result = await Notification.updateMany(
    { userId, read: false },
    { $set: { read: true, readAt: new Date() } }
  );
  return {
    matched: result.matchedCount ?? result.n,
    modified: result.modifiedCount ?? result.nModified,
  };
};
