const express = require("express");
const router = express.Router();

const { authenticate } = require("../middlewares/authMiddleware");
const { requireAdmin } = require("../middlewares/adminMiddleware");

const {
  createFromProduct,
  getSubscription,
  listMySubscriptions,
  listAllSubscriptions,
  cancelSubscription,
  renewSubscription,
} = require("../controllers/subscriptionController");

// User: create subscription from product
router.post("/", authenticate, createFromProduct);

// User: list my subscriptions
router.get("/me", authenticate, listMySubscriptions);

// Admin: list all subscriptions
router.get("/", authenticate, requireAdmin, listAllSubscriptions);

// Shared: get, cancel, renew
router.get("/:subscriptionId", authenticate, getSubscription);
router.post("/:subscriptionId/cancel", authenticate, cancelSubscription);
router.post("/:subscriptionId/renew", authenticate, renewSubscription);

module.exports = router;
