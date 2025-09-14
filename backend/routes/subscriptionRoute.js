const express = require("express");
const router = express.Router();

const { authenticate } = require("../middlewares/authMiddleware");
const { requireAdmin } = require("../middlewares/adminMiddleware");

const {
  createFromProduct,
  createFromPlan,
  getSubscription,
  listMySubscriptions,
  listAllSubscriptions,
  cancelSubscription,
  renewSubscription,
  getSubscriptionsByProduct,
  getSubscriptionsByPlan,
  getSubscriptionsByType,
  getActiveSubscriptions,
  getExpiringSubscriptions,
} = require("../controllers/subscriptionController");

// User: create subscription from product
router.post("/product", authenticate, createFromProduct);

// User: create subscription from plan
router.post("/plan", authenticate, createFromPlan);

// User: list my subscriptions (with optional type filter)
router.get("/me", authenticate, listMySubscriptions);

// Admin: list all subscriptions (with optional type filter)
router.get("/", authenticate, requireAdmin, listAllSubscriptions);

// Admin: get subscriptions by product
router.get(
  "/product/:productId",
  authenticate,
  requireAdmin,
  getSubscriptionsByProduct
);

// Admin: get subscriptions by plan
router.get("/plan/:planId", authenticate, requireAdmin, getSubscriptionsByPlan);

// Admin: get subscriptions by type
router.get("/type/:type", authenticate, requireAdmin, getSubscriptionsByType);

// Admin: get active subscriptions for a user
router.get("/active", authenticate, requireAdmin, getActiveSubscriptions);
router.get("/active/:userId", authenticate, requireAdmin, getActiveSubscriptions);

// Admin: get expiring subscriptions
router.get("/expiring", authenticate, requireAdmin, getExpiringSubscriptions);

// Shared: get, cancel, renew
router.get("/:subscriptionId", authenticate, getSubscription);
router.post("/:subscriptionId/cancel", authenticate, cancelSubscription);
router.post("/:subscriptionId/renew", authenticate, renewSubscription);

module.exports = router;
