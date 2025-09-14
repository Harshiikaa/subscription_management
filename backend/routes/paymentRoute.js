const express = require("express");
const { authenticate } = require("../middlewares/authMiddleware");
const { requireAdmin } = require("../middlewares/adminMiddleware");
const {
  createSubscriptionPayment,
  createProductPayment,
  createEsewaPayment,
  createKhaltiPayment,
  completePayment,
  verifyKhaltiPayment,
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
  testKhaltiConfig,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/product", authenticate, createProductPayment);
router.post("/esewa", authenticate, createEsewaPayment); // Legacy eSewa payment
router.post("/khalti", authenticate, createKhaltiPayment); // Khalti payment
// Payment completion (gateway callbacks)
router.all("/complete", completePayment);
router.all("/khalti/verify", verifyKhaltiPayment); // Khalti payment verification
// Payment status pages
router.get("/success", success);
router.get("/failure", failure);

// Test endpoints
router.get("/khalti/test", testKhaltiConfig);

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
