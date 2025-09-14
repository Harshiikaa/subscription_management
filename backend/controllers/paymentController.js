const { sendSuccess } = require("../utils/response");
const AppError = require("../utils/errors");
const {
  createPaymentService,
  getPaymentService,
  getPaymentByTransactionUUIDService,
  getPaymentsByUserService,
  getPaymentsBySubscriptionService,
  getPaymentsByProductService,
  getCompletedPaymentsService,
  updatePaymentStatusService,
  completePaymentService,
  failPaymentService,
  processRefundService,
  deletePaymentService,
  getPaymentStatsService,
} = require("../services/paymentService");
const getEsewaPaymentHash = require("../utils/esewaSignature");
const verifyReturnSignature = require("../utils/esewaVerifySignature");
const esewaStatusCheck = require("../utils/esewaStatusCheck");

// Create payment for subscription
exports.createSubscriptionPayment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      subscriptionId,
      paymentMethod,
      amount,
      currency = "USD",
    } = req.body;

    const paymentData = {
      userId,
      subscriptionId,
      paymentType: "subscription",
      paymentMethod,
      amount,
      currency,
    };

    const payment = await createPaymentService(paymentData);
    return sendSuccess(res, payment, "Payment created", 201);
  } catch (error) {
    next(error);
  }
};

// Create payment for product
exports.createProductPayment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, paymentMethod, amount, currency = "USD" } = req.body;

    const paymentData = {
      userId,
      productId,
      paymentType: "product",
      paymentMethod,
      amount,
      currency,
    };

    const payment = await createPaymentService(paymentData);
    return sendSuccess(res, payment, "Payment created", 201);
  } catch (error) {
    next(error);
  }
};

// Create eSewa payment (legacy method for backward compatibility)
exports.createEsewaPayment = async (req, res, next) => {
  try {
    const { productId, amount, currency = "NPR" } = req.body;
    const userId = req.user._id;

    const paymentData = {
      userId,
      productId,
      paymentType: "product",
      paymentMethod: "esewa",
      amount,
      currency,
    };

    const payment = await createPaymentService(paymentData);

    // Generate eSewa payment hash
    const signed = getEsewaPaymentHash({
      amount: payment.amount,
      tax_amount: 0,
      total_amount: payment.amount,
      product_service_charge: 0,
      product_delivery_charge: 0,
      transaction_uuid: payment.transactionUUID,
      product_code: process.env.ESEWA_MERCHANT_CODE,
      success_url: process.env.ESEWA_SUCCESS_URL,
      failure_url: process.env.ESEWA_FAILURE_URL,
    });

    return sendSuccess(
      res,
      {
        ...signed,
        esewa_initiate_url: process.env.ESEWA_FORM_URL,
        paymentId: payment._id,
      },
      "eSewa payment initiated"
    );
  } catch (error) {
    next(error);
  }
};

// Complete payment (eSewa callback)
exports.completePayment = async (req, res, next) => {
  try {
    // Accept GET or POST return
    const dataB64 = (req.body && req.body.data) || req.query.data;
    if (!dataB64) {
      return res.redirect(
        "http://localhost:3000/payment/failure?message=Missing%20payment%20data"
      );
    }

    // 1) Decode Base64 JSON
    const decoded = JSON.parse(
      Buffer.from(dataB64, "base64").toString("utf-8")
    );

    // 2) Verify the return signature (defense-in-depth)
    const okSig = verifyReturnSignature({
      signed_field_names: decoded.signed_field_names,
      signature: decoded.signature,
      payload: decoded,
    });
    if (!okSig) {
      return res.redirect(
        "http://localhost:3000/payment/failure?message=Invalid%20signature"
      );
    }

    // 3) Load our PENDING payment by transaction_uuid
    const txnUUID = decoded.transaction_uuid;
    const payment = await getPaymentByTransactionUUIDService(txnUUID);

    // 4) SERVER→SERVER verification (Status Check)
    const statusData = await esewaStatusCheck({
      product_code: process.env.ESEWA_MERCHANT_CODE,
      total_amount: payment.amount,
      transaction_uuid: txnUUID,
    });

    const amountMatches =
      Number(statusData.total_amount) === Number(payment.amount);
    const isComplete = statusData.status === "COMPLETE";

    // 5) Idempotent update + redirect to your React routes
    if (isComplete && amountMatches) {
      const gatewayData = {
        rawReturn: decoded,
        statusCheckResponse: statusData,
        signature: decoded.signature,
      };

      await completePaymentService(
        txnUUID,
        statusData.ref_id || decoded.transaction_code,
        gatewayData
      );

      return res.redirect(
        `http://localhost:3000/payment/success?transactionId=${encodeURIComponent(
          statusData.ref_id || decoded.transaction_code || ""
        )}&message=${encodeURIComponent("Payment verified")}`
      );
    }

    // Pending or failed paths
    const reason =
      statusData.status === "pending" || statusData.status === "ambiguous"
        ? "Payment pending. Please wait or refresh."
        : "Payment verification failed";

    await failPaymentService(txnUUID, reason);

    return res.redirect(
      `http://localhost:3000/payment/failure?message=${encodeURIComponent(
        reason
      )}`
    );
  } catch (error) {
    console.error("Payment Error:", error);
    return res.redirect(
      `http://localhost:3000/payment/failure?message=${encodeURIComponent(
        "Server%20error"
      )}`
    );
  }
};

// Get payment by ID
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await getPaymentService(req.params.paymentId);
    return sendSuccess(res, payment, "Payment fetched");
  } catch (error) {
    next(error);
  }
};

// Get payments by user
exports.getUserPayments = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const options = {
      paymentType: req.query.paymentType,
      status: req.query.status,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    };

    const data = await getPaymentsByUserService(userId, options);
    return sendSuccess(res, data, "User payments fetched");
  } catch (error) {
    next(error);
  }
};

// Get payments by subscription
exports.getSubscriptionPayments = async (req, res, next) => {
  try {
    const payments = await getPaymentsBySubscriptionService(
      req.params.subscriptionId
    );
    return sendSuccess(res, payments, "Subscription payments fetched");
  } catch (error) {
    next(error);
  }
};

// Get payments by product
exports.getProductPayments = async (req, res, next) => {
  try {
    const payments = await getPaymentsByProductService(req.params.productId);
    return sendSuccess(res, payments, "Product payments fetched");
  } catch (error) {
    next(error);
  }
};

// Get completed payments (admin)
exports.getCompletedPayments = async (req, res, next) => {
  try {
    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit ? Number(req.query.limit) : 100,
    };

    const payments = await getCompletedPaymentsService(options);
    return sendSuccess(res, payments, "Completed payments fetched");
  } catch (error) {
    next(error);
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const additionalData = req.body.additionalData || {};

    const payment = await updatePaymentStatusService(
      req.params.paymentId,
      status,
      additionalData
    );
    return sendSuccess(res, payment, "Payment status updated");
  } catch (error) {
    next(error);
  }
};

// Process refund
exports.processRefund = async (req, res, next) => {
  try {
    const { refundAmount, reason } = req.body;

    const payment = await processRefundService(
      req.params.paymentId,
      refundAmount,
      reason
    );
    return sendSuccess(res, payment, "Refund processed");
  } catch (error) {
    next(error);
  }
};

// Delete payment
exports.deletePayment = async (req, res, next) => {
  try {
    const payment = await deletePaymentService(req.params.paymentId);
    return sendSuccess(res, payment, "Payment deleted");
  } catch (error) {
    next(error);
  }
};

// Get payment statistics
exports.getPaymentStats = async (req, res, next) => {
  try {
    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const stats = await getPaymentStatsService(options);
    return sendSuccess(res, stats, "Payment statistics fetched");
  } catch (error) {
    next(error);
  }
};

// Success page
exports.success = (req, res) => {
  res.status(200).send(`
    <h1>Payment Successful!</h1>
    <p>${req.query.message || ""}</p>
    <p>Transaction ID: ${req.query.transactionId || ""}</p>
    <a href="/">Back to home</a>
  `);
};

// Failure page
exports.failure = (req, res) => {
  res.status(400).send(`
    <h1>Payment Failed</h1>
    <p>${req.query.message || "There was an issue with your payment."}</p>
    <a href="/">Back to home</a>
  `);
};
