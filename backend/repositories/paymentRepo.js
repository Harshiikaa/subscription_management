const Payment = require("../models/payment");

exports.createPaymentRepo = async (data) => {
  return await Payment.create(data);
};

exports.getPaymentByIdRepo = async (id) => {
  return await Payment.findById(id).populate("userId subscriptionId productId");
};

exports.getPaymentByTransactionUUIDRepo = async (transactionUUID) => {
  return await Payment.findOne({ transactionUUID }).populate(
    "userId subscriptionId productId"
  );
};

exports.getPaymentsByUserRepo = async (userId, options = {}) => {
  const { paymentType, status, limit = 20, page = 1 } = options;
  const query = { userId };

  if (paymentType) query.paymentType = paymentType;
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("subscriptionId productId"),
    Payment.countDocuments(query),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

exports.getPaymentsBySubscriptionRepo = async (subscriptionId) => {
  return await Payment.find({ subscriptionId, paymentType: "subscription" })
    .sort({ createdAt: -1 })
    .populate("subscriptionId");
};

exports.getPaymentsByProductRepo = async (productId) => {
  return await Payment.find({ productId, paymentType: "product" })
    .sort({ createdAt: -1 })
    .populate("productId");
};

exports.getCompletedPaymentsRepo = async (options = {}) => {
  const { startDate, endDate, limit = 100 } = options;
  const query = { status: "completed" };

  if (startDate || endDate) {
    query.paidAt = {};
    if (startDate) query.paidAt.$gte = new Date(startDate);
    if (endDate) query.paidAt.$lte = new Date(endDate);
  }

  return await Payment.find(query)
    .sort({ paidAt: -1 })
    .limit(limit)
    .populate("userId subscriptionId productId");
};

exports.updatePaymentStatusRepo = async (id, status, additionalData = {}) => {
  const updateData = { status, ...additionalData };

  if (status === "completed") {
    updateData.paidAt = new Date();
  } else if (status === "failed" || status === "cancelled") {
    updateData.failedAt = new Date();
  }

  return await Payment.findByIdAndUpdate(id, updateData, {
    new: true,
  }).populate("userId subscriptionId productId");
};

exports.updatePaymentByTransactionUUIDRepo = async (
  transactionUUID,
  updateData
) => {
  return await Payment.findOneAndUpdate({ transactionUUID }, updateData, {
    new: true,
  }).populate("userId subscriptionId productId");
};

exports.deletePaymentRepo = async (id) => {
  return await Payment.findByIdAndDelete(id);
};

exports.getPaymentStatsRepo = async (options = {}) => {
  const { startDate, endDate } = options;
  const matchQuery = {};

  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  const pipeline = [
    { $match: matchQuery },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
        avgAmount: { $avg: "$amount" },
      },
    },
  ];

  return await Payment.aggregate(pipeline);
};
