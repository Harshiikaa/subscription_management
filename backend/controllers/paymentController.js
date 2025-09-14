const Products = require("../models/product");
const Payment = require("../models/payment");
const getEsewaPaymentHash = require("../utils/esewaSignature");
const verifyReturnSignature = require("../utils/esewaVerifySignature");
const esewaStatusCheck = require("../utils/esewaStatusCheck");

exports.createPayment = async (req, res) => {
  try {
    const { productID, deliveryDate, returnDate, quantity } = req.body;

    const product = await Products.findById(productID);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // ✅ Server-side amount calculation (adjust to your policy)
    const days = Math.max(
      1,
      Math.ceil(
        (new Date(returnDate) - new Date(deliveryDate)) / (1000 * 60 * 60 * 24)
      )
    );
    const qty = Number(quantity || 1);
    const base = Number(product.productRentalPrice) * days * qty;
    const deposit = Number(product.productSecurityDeposit || 0);
    const product_service_charge = 0;
    const product_delivery_charge = 0;
    const tax_amount = 0;
    const total =
      base +
      deposit +
      product_service_charge +
      product_delivery_charge +
      tax_amount;

    const shoppingBag = await ShoppingBag.create({
      userID: req.user.id,
      productID,
      deliveryDate,
      returnDate,
      quantity: qty,
      totalPrice: total, // canonical amount stored by server
    });

    // ✅ Create Payment=pending (anchor the attempt)
    const paymentPending = await Payment.create({
      userId: req.user.id,
      orderId: shoppingBag._id,
      transactionUUID: shoppingBag._id.toString(), // hex is alnum (valid)
      amount: total,
      currency: "NPR",
      status: "pending",
      provider: "esewa",
    });

    // Sign exactly the required fields (request payload)
    const signed = getEsewaPaymentHash({
      amount: total,
      tax_amount,
      total_amount: total,
      product_service_charge,
      product_delivery_charge,
      transaction_uuid: paymentPending.transactionUUID,
      product_code: process.env.ESEWA_MERCHANT_CODE,
      success_url: process.env.ESEWA_SUCCESS_URL,
      failure_url: process.env.ESEWA_FAILURE_URL,
    });

    res.status(200).json({
      success: true,
      payment: {
        ...signed,
        esewa_initiate_url: process.env.ESEWA_FORM_URL,
      },
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Error initializing payment" });
  }
};

exports.completePayment = async (req, res) => {
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
    // Example: { transaction_code, status, total_amount, transaction_uuid, product_code, signed_field_names, signature }

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
    const payment = await Payment.findOne({ transactionUUID: txnUUID });
    if (!payment) {
      return res.redirect(
        "http://localhost:3000/payment/failure?message=Unknown%20transaction"
      );
    }

    // 4) SERVER→SERVER verification (Status Check)
    const statusData = await esewaStatusCheck({
      product_code: process.env.ESEWA_MERCHANT_CODE,
      total_amount: payment.amount, // use your stored canonical amount
      transaction_uuid: txnUUID,
    });
    // statusData: { product_code, transaction_uuid, total_amount, status, ref_id }

    const amountMatches =
      Number(statusData.total_amount) === Number(payment.amount);
    const isComplete = statusData.status === "COMPLETE";

    // 5) Idempotent update + redirect to your React routes
    if (isComplete && amountMatches) {
      if (payment.status !== "paid") {
        payment.status = "paid";
        payment.esewaRefId =
          statusData.ref_id || decoded.transaction_code || null;
        payment.rawReturn = decoded;
        payment.statusCheckResponse = statusData;
        await payment.save();
      }
      return res.redirect(
        `http://localhost:3000/payment/success?transactionId=${encodeURIComponent(
          payment.esewaRefId || decoded.transaction_code || ""
        )}&message=${encodeURIComponent("Payment verified")}`
      );
    }

    // Pending or failed paths
    payment.status =
      statusData.status === "pending" || statusData.status === "ambiguous"
        ? "pending"
        : "FAILED";
    payment.rawReturn = decoded;
    payment.statusCheckResponse = statusData;
    await payment.save();

    const msg =
      statusData.status === "pending"
        ? "Payment pending. Please wait or refresh."
        : "Payment verification failed";

    return res.redirect(
      `http://localhost:3000/payment/failure?message=${encodeURIComponent(msg)}`
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
