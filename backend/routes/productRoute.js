const express = require("express");
const router = express.Router();

const { authenticate } = require("../middlewares/authMiddleware");
const { requireAdmin } = require("../middlewares/adminMiddleware");

const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  listProducts,
  getSubscriptionOptions,
  seedMockProducts,
} = require("../controllers/productController");

// Public list (optionally require auth later)
router.get("/", listProducts);

// Seed mock products (admin) - can be run once in deployment
router.post("/seed", authenticate, requireAdmin, seedMockProducts);

// Public product details
router.get("/:productId", getProduct);

// Get subscription options for a product (requires auth since subscription is user-specific context)
router.get(
  "/:productId/subscription-options",
  authenticate,
  getSubscriptionOptions
);

// Admin-only CRUD
router.post("/", authenticate, requireAdmin, createProduct);
router.put("/:productId", authenticate, requireAdmin, updateProduct);
router.delete("/:productId", authenticate, requireAdmin, deleteProduct);

module.exports = router;
