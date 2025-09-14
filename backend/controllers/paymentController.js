const { sendSuccess } = require("../utils/response");
const AppError = require("../utils/errors");
const Payment = require("../models/payment");
const {
  createPaymentService,
  getPaymentService,
  getPaymentByTransactionUUIDService,
  getPaymentsByUserService,
  getPaymentsBySubscriptionService,
  getPaymentsByProductService,
  getCompletedPaymentsService,
  updatePaymentStatusService,
  updatePaymentByTransactionUUIDService,
  completePaymentService,
  failPaymentService,
  processRefundService,
  deletePaymentService,
  getPaymentStatsService,
} = require("../services/paymentService");
const getEsewaPaymentHash = require("../utils/esewaSignature");
const verifyReturnSignature = require("../utils/esewaVerifySignature");
const esewaStatusCheck = require("../utils/esewaStatusCheck");
const initiateKhaltiPayment = require("../utils/khaltiInitiate");
const {
  verifyKhaltiPayment,
  checkKhaltiPaymentStatus,
} = require("../utils/khaltiVerify");

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

// Create Khalti payment
exports.createKhaltiPayment = async (req, res, next) => {
  try {
    const {
      productId,
      subscriptionId,
      amount,
      currency = "NPR",
      customer_info = {},
      amount_breakdown = {},
    } = req.body;
    const userId = req.user._id;

    // Determine payment type and validate
    let paymentType, referenceId;
    if (subscriptionId) {
      paymentType = "subscription";
      referenceId = subscriptionId;
    } else if (productId) {
      paymentType = "product";
      referenceId = productId;
    } else {
      throw AppError.badRequest(
        "Either productId or subscriptionId is required"
      );
    }

    const paymentData = {
      userId,
      [paymentType === "subscription" ? "subscriptionId" : "productId"]:
        referenceId,
      paymentType,
      paymentMethod: "khalti",
      amount,
      currency,
    };

    const payment = await createPaymentService(paymentData);

    // Initiate Khalti payment
    const returnUrl = `${
      process.env.KHALTI_RETURN_URL
    }?transaction_uuid=${encodeURIComponent(
      payment.transactionUUID
    )}&order_id=${encodeURIComponent(payment.orderId)}`;

    const khaltiResponse = await initiateKhaltiPayment({
      return_url: returnUrl,
      website_url: process.env.KHALTI_WEBSITE_URL || "http://localhost:3000",
      amount: payment.amount,
      purchase_order_id: payment.orderId,
      purchase_order_name: `${paymentType} payment`,
      customer_info: {
        name: customer_info.name || req.user.name || "Customer",
        email: customer_info.email || req.user.email || "",
        phone: customer_info.phone || "",
        ...customer_info,
      },
      amount_breakdown: {
        subtotal: amount_breakdown.subtotal || payment.amount,
        tax: amount_breakdown.tax || 0,
        shipping: amount_breakdown.shipping || 0,
        discount: amount_breakdown.discount || 0,
        ...amount_breakdown,
      },
    });

    if (!khaltiResponse.success) {
      throw AppError.badRequest(
        khaltiResponse.error?.message || "Failed to initiate Khalti payment"
      );
    }

    // Update payment with Khalti pidx
    await updatePaymentByTransactionUUIDService(payment.transactionUUID, {
      providerRefId: khaltiResponse.data.pidx,
      gatewayData: {
        khaltiInitiateResponse: khaltiResponse.data,
      },
    });

    return sendSuccess(
      res,
      {
        payment_url: khaltiResponse.data.payment_url,
        pidx: khaltiResponse.data.pidx,
        paymentId: payment._id,
        transactionUUID: payment.transactionUUID,
      },
      "Khalti payment initiated"
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

// Verify Khalti payment
exports.verifyKhaltiPayment = async (req, res, next) => {
  try {
    const { pidx, transaction_uuid } = req.query;

    // Debug logging
    console.log("🔍 Khalti verification called with:");
    console.log("  pidx:", pidx);
    console.log("  transaction_uuid:", transaction_uuid);
    console.log("  query params:", req.query);

    if (!pidx) {
      return res.redirect(
        "http://localhost:3000/payment/failure?message=Missing%20payment%20ID"
      );
    }

    // Load payment using multiple lookup methods
    let payment;
    const orderId = req.query.order_id;

    // Method 1: Try to find by transaction_uuid if provided
    if (transaction_uuid) {
      try {
        payment = await getPaymentByTransactionUUIDService(transaction_uuid);
        console.log("✅ Payment found by transaction_uuid:", transaction_uuid);
      } catch (error) {
        console.log(
          "⚠️  Payment not found by transaction_uuid:",
          error.message
        );
      }
    }

    // Method 2: Try to find by pidx if not found yet
    if (!payment && pidx) {
      payment = await Payment.findOne({ providerRefId: pidx });
      if (payment) {
        console.log("✅ Payment found by pidx:", pidx);
      } else {
        console.log("⚠️  Payment not found by pidx:", pidx);
      }
    }

    // Method 3: Try to find by order_id if provided and not found yet
    if (!payment && orderId) {
      payment = await Payment.findOne({ orderId: orderId });
      if (payment) {
        console.log("✅ Payment found by order_id:", orderId);
      } else {
        console.log("⚠️  Payment not found by order_id:", orderId);
      }
    }

    // Method 4: Try to find by pidx in gatewayData if not found yet
    if (!payment && pidx) {
      payment = await Payment.findOne({
        "gatewayData.khaltiInitiateResponse.pidx": pidx,
      });
      if (payment) {
        console.log("✅ Payment found by pidx in gatewayData:", pidx);
        // Update providerRefId for future lookups
        if (!payment.providerRefId) {
          payment.providerRefId = pidx;
          await payment.save();
          console.log("✅ Updated providerRefId for future lookups");
        }
      } else {
        console.log("⚠️  Payment not found by pidx in gatewayData:", pidx);
      }
    }

    // If still not found, return error with debugging info
    if (!payment) {
      console.error("❌ Payment not found by any method");
      console.error("Search parameters:");
      console.error("  - transaction_uuid:", transaction_uuid);
      console.error("  - pidx:", pidx);
      console.error("  - order_id:", orderId);

      // List recent payments for debugging
      const recentPayments = await Payment.find({
        paymentMethod: "khalti",
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("transactionUUID orderId providerRefId createdAt");
      console.error("Recent Khalti payments:", recentPayments);

      return res.redirect(
        "http://localhost:3000/payment/failure?message=Payment%20not%20found"
      );
    }

    // Verify payment with Khalti
    console.log("🔍 Verifying payment with Khalti using pidx:", pidx);
    const verifyResponse = await verifyKhaltiPayment(pidx);
    console.log("🔍 Khalti verification response:", verifyResponse);

    if (!verifyResponse.success) {
      console.error("❌ Khalti verification failed:", verifyResponse.error);
      await failPaymentService(
        payment.transactionUUID,
        "Khalti verification failed"
      );
      return res.redirect(
        "http://localhost:3000/payment/failure?message=Payment%20verification%20failed"
      );
    }

    const { status, amount, transaction_id } = verifyResponse.data;

    // Check if payment is completed
    if (status === "Completed") {
      const amountMatches = Number(amount) / 100 === Number(payment.amount); // Convert from paisa

      if (amountMatches) {
        const gatewayData = {
          khaltiVerifyResponse: verifyResponse.data,
          pidx: pidx,
          transaction_id: transaction_id,
        };

        await completePaymentService(
          payment.transactionUUID,
          transaction_id,
          gatewayData
        );

        return res.redirect(
          `http://localhost:3000/payment/success?transactionId=${encodeURIComponent(
            transaction_id || ""
          )}&message=${encodeURIComponent("Payment verified successfully")}`
        );
      } else {
        await failPaymentService(payment.transactionUUID, "Amount mismatch");
        return res.redirect(
          "http://localhost:3000/payment/failure?message=Amount%20mismatch"
        );
      }
    } else {
      const reason =
        status === "Pending" ? "Payment is still pending" : "Payment failed";
      await failPaymentService(payment.transactionUUID, reason);
      return res.redirect(
        `http://localhost:3000/payment/failure?message=${encodeURIComponent(
          reason
        )}`
      );
    }
  } catch (error) {
    console.error("Khalti Payment Verification Error:", error);
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

// Test Khalti configuration
exports.testKhaltiConfig = async (req, res, next) => {
  try {
    const requiredEnvVars = [
      "KHALTI_SECRET_KEY",
      "KHALTI_PUBLIC_KEY",
      "KHALTI_BASE_URL",
      "KHALTI_VERIFY_URL",
      "KHALTI_RETURN_URL",
    ];

    const config = {};
    const missing = [];

    requiredEnvVars.forEach((varName) => {
      if (process.env[varName]) {
        config[varName] = process.env[varName].substring(0, 10) + "..."; // Hide full value
      } else {
        missing.push(varName);
        config[varName] = "NOT SET";
      }
    });

    return sendSuccess(
      res,
      {
        configuration: config,
        missingVariables: missing,
        isConfigured: missing.length === 0,
        message:
          missing.length === 0
            ? "Khalti is properly configured"
            : "Missing required environment variables",
      },
      "Khalti configuration status"
    );
  } catch (error) {
    next(error);
  }
};
