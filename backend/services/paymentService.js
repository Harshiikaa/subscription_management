const AppError = require("../utils/errors");
const Payment = require("../models/payment");
const Subscription = require("../models/subscription");
const Product = require("../models/product");
const {
  createPaymentRepo,
  getPaymentByIdRepo,
  getPaymentByTransactionUUIDRepo,
  getPaymentsByUserRepo,
  getPaymentsBySubscriptionRepo,
  getPaymentsByProductRepo,
  getCompletedPaymentsRepo,
  updatePaymentStatusRepo,
  updatePaymentByTransactionUUIDRepo,
  deletePaymentRepo,
  getPaymentStatsRepo,
} = require("../repositories/paymentRepo");

exports.createPaymentService = async (paymentData) => {
  try {
    // Validate payment type and references
    if (
      paymentData.paymentType === "subscription" &&
      !paymentData.subscriptionId
    ) {
      throw AppError.badRequest(
        "subscriptionId is required for subscription payments"
      );
    }
    if (paymentData.paymentType === "product" && !paymentData.productId) {
      throw AppError.badRequest("productId is required for product payments");
    }

    // Generate unique transaction UUID if not provided
    if (!paymentData.transactionUUID) {
      paymentData.transactionUUID = require("crypto").randomUUID();
    }

    // Generate order ID if not provided
    if (!paymentData.orderId) {
      paymentData.orderId = `ORDER_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }

    return await createPaymentRepo(paymentData);
  } catch (error) {
    if (error.code === 11000) {
      throw AppError.badRequest(
        "Payment with this transaction UUID or order ID already exists"
      );
    }
    throw error;
  }
};

exports.getPaymentService = async (id) => {
  const payment = await getPaymentByIdRepo(id);
  if (!payment) throw AppError.notFound("Payment not found");
  return payment;
};

exports.getPaymentByTransactionUUIDService = async (transactionUUID) => {
  const payment = await getPaymentByTransactionUUIDRepo(transactionUUID);
  if (!payment) throw AppError.notFound("Payment not found");
  return payment;
};

exports.getPaymentsByUserService = async (userId, options = {}) => {
  return await getPaymentsByUserRepo(userId, options);
};

exports.getPaymentsBySubscriptionService = async (subscriptionId) => {
  return await getPaymentsBySubscriptionRepo(subscriptionId);
};

exports.getPaymentsByProductService = async (productId) => {
  return await getPaymentsByProductRepo(productId);
};

exports.getCompletedPaymentsService = async (options = {}) => {
  return await getCompletedPaymentsRepo(options);
};

exports.updatePaymentStatusService = async (
  id,
  status,
  additionalData = {}
) => {
  const validStatuses = [
    "pending",
    "processing",
    "completed",
    "failed",
    "cancelled",
    "refunded",
  ];
  if (!validStatuses.includes(status)) {
    throw AppError.badRequest("Invalid payment status");
  }

  const payment = await updatePaymentStatusRepo(id, status, additionalData);
  if (!payment) throw AppError.notFound("Payment not found");
  return payment;
};

exports.updatePaymentByTransactionUUIDService = async (
  transactionUUID,
  updateData
) => {
  const payment = await updatePaymentByTransactionUUIDRepo(
    transactionUUID,
    updateData
  );
  if (!payment) throw AppError.notFound("Payment not found");
  return payment;
};

exports.completePaymentService = async (
  transactionUUID,
  providerRefId = null,
  gatewayData = {}
) => {
  try {
    const payment = await getPaymentByTransactionUUIDRepo(transactionUUID);
    if (!payment) {
      throw AppError.notFound("Payment not found");
    }

    if (payment.status === "completed") {
      return payment; // Idempotent - already completed
    }

    if (payment.status !== "pending" && payment.status !== "processing") {
      throw AppError.badRequest(
        "Payment cannot be completed from current status"
      );
    }

    // Update payment status
    const updateData = {
      status: "completed",
      paidAt: new Date(),
      providerRefId,
      gatewayData,
    };

    const updatedPayment = await updatePaymentByTransactionUUIDRepo(
      transactionUUID,
      updateData
    );

    // If this is a subscription payment, update the subscription status
    if (
      updatedPayment.paymentType === "subscription" &&
      updatedPayment.subscriptionId
    ) {
      await Subscription.findByIdAndUpdate(updatedPayment.subscriptionId, {
        status: "active",
        lastPaymentDate: new Date(),
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });
    }

    return updatedPayment;
  } catch (error) {
    if (error.message.includes("not found")) {
      throw AppError.notFound("Payment not found");
    }
    throw error;
  }
};

exports.failPaymentService = async (transactionUUID, reason = null) => {
  try {
    const payment = await getPaymentByTransactionUUIDRepo(transactionUUID);
    if (!payment) {
      throw AppError.notFound("Payment not found");
    }

    if (payment.status === "completed") {
      throw AppError.badRequest("Cannot fail a completed payment");
    }

    const updateData = {
      status: "failed",
      failedAt: new Date(),
      failureReason: reason,
    };

    return await updatePaymentByTransactionUUIDRepo(
      transactionUUID,
      updateData
    );
  } catch (error) {
    if (error.message.includes("not found")) {
      throw AppError.notFound("Payment not found");
    }
    throw error;
  }
};

exports.processRefundService = async (
  paymentId,
  refundAmount = null,
  reason = null
) => {
  try {
    const payment = await getPaymentByIdRepo(paymentId);
    if (!payment) {
      throw AppError.notFound("Payment not found");
    }

    if (payment.status !== "completed") {
      throw AppError.badRequest("Only completed payments can be refunded");
    }

    if (payment.status === "refunded") {
      throw AppError.badRequest("Payment has already been refunded");
    }

    const refundAmountToProcess = refundAmount || payment.amount;

    if (refundAmountToProcess > payment.amount) {
      throw AppError.badRequest("Refund amount cannot exceed payment amount");
    }

    const updateData = {
      status: "refunded",
      refundedAt: new Date(),
      refundAmount: refundAmountToProcess,
      refundReason: reason,
    };

    const updatedPayment = await updatePaymentStatusRepo(
      paymentId,
      "refunded",
      updateData
    );

    // If this is a subscription payment, cancel the subscription
    if (
      updatedPayment.paymentType === "subscription" &&
      updatedPayment.subscriptionId
    ) {
      await Subscription.findByIdAndUpdate(updatedPayment.subscriptionId, {
        status: "cancelled",
        cancelledAt: new Date(),
        cancelReason: "Payment refunded",
      });
    }

    return updatedPayment;
  } catch (error) {
    if (error.message.includes("not found")) {
      throw AppError.notFound("Payment not found");
    }
    throw error;
  }
};

exports.deletePaymentService = async (id) => {
  const payment = await deletePaymentRepo(id);
  if (!payment) throw AppError.notFound("Payment not found");
  return payment;
};

exports.getPaymentStatsService = async (options = {}) => {
  return await getPaymentStatsRepo(options);
};
