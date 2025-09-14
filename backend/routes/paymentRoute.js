const express = require("express");
const { authenticate } = require("../middlewares/authMiddleware");
const { requireAdmin } = require("../middlewares/adminMiddleware");
const {
  createSubscriptionPayment,
  createProductPayment,
  createEsewaPayment,
  completePayment,
  getPayment,
  getUserPayments,
  getSubscriptionPayments,
  getProductPayments,
  getCompletedPayments,
  updatePaymentStatus,
  processRefund,
  deletePayment,
  getPaymentStats,
  success,
  failure,
} = require("../controllers/paymentController");

const router = express.Router();
// ////////////////////////////////////
// router.post("/createPayment", authenticate, createPayment);
// router.all("/completePayment", completePayment);
// router.get("/payment/success", success);
// router.get("/payment/failure", failure);
// /////////////////////////////////////////

router.post("/product", authenticate, createProductPayment);
router.post("/esewa", authenticate, createEsewaPayment); // Legacy eSewa payment
// Payment completion (gateway callbacks)
router.all("/complete", completePayment);
// Payment status pages
router.get("/success", success);
router.get("/failure", failure);

// Payment retrieval routes
router.get("/me", authenticate, getUserPayments);
router.get(
  "/subscription/:subscriptionId",
  authenticate,
  getSubscriptionPayments
);
router.get("/product/:productId", authenticate, getProductPayments);
router.get("/:paymentId", authenticate, getPayment);

// Admin routes
router.get(
  "/admin/completed",
  authenticate,
  requireAdmin,
  getCompletedPayments
);
router.get("/admin/stats", authenticate, requireAdmin, getPaymentStats);
// Payment creation routes
router.post("/subscription", authenticate, createSubscriptionPayment);

// Payment management routes
router.put("/:paymentId/status", authenticate, updatePaymentStatus);
router.post("/:paymentId/refund", authenticate, processRefund);
router.delete("/:paymentId", authenticate, requireAdmin, deletePayment);

module.exports = router;
