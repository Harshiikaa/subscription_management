const express = require("express");
const router = express.Router();

const { authenticate } = require("../middlewares/authMiddleware");
const { requireAdmin } = require("../middlewares/adminMiddleware");

const {
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getSubscriptionPlan,
  listSubscriptionPlans,
  getPopularPlans,
  getPlansByType,
  searchPlans,
  getActivePlans,
  getSubscriptionOptions,
  updatePlanSortOrder,
  bulkUpdatePlans,
  togglePlanStatus,
  setPopularPlan,
  seedMockPlans,
} = require("../controllers/subscriptionPlanController");

// Admin: create subscription plan
router.post("/", authenticate, requireAdmin, createSubscriptionPlan);

// Admin: seed mock plans (for development/testing)
router.post("/seed", authenticate, requireAdmin, seedMockPlans);

// Public: list active subscription plans
router.get("/", listSubscriptionPlans);

// Public: get popular plans
router.get("/popular", getPopularPlans);

// Public: get plans by type
router.get("/type/:planType", getPlansByType);

// Public: search plans
router.get("/search", searchPlans);

// Public: get all active plans (simplified list)
router.get("/active", getActivePlans);

// Public: get subscription options for a specific plan
router.get("/:planId/options", getSubscriptionOptions);

// Admin: get specific plan (including inactive)
router.get("/:planId", authenticate, requireAdmin, getSubscriptionPlan);

// Admin: update subscription plan
router.put("/:planId", authenticate, requireAdmin, updateSubscriptionPlan);

// Admin: delete subscription plan (soft delete)
router.delete("/:planId", authenticate, requireAdmin, deleteSubscriptionPlan);

// Admin: toggle plan status (active/inactive)
router.patch(
  "/:planId/toggle-status",
  authenticate,
  requireAdmin,
  togglePlanStatus
);

// Admin: set plan as popular/not popular
router.patch("/:planId/popular", authenticate, requireAdmin, setPopularPlan);

// Admin: update plan sort order
router.patch(
  "/:planId/sort-order",
  authenticate,
  requireAdmin,
  updatePlanSortOrder
);

// Admin: bulk update plans
router.patch("/bulk-update", authenticate, requireAdmin, bulkUpdatePlans);

module.exports = router;
