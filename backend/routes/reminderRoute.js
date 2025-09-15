const express = require("express");
const router = express.Router();

const { authenticate } = require("../middlewares/authMiddleware");
const { requireAdmin } = require("../middlewares/adminMiddleware");

const {
  getReminderPreferences,
  updateReminderPreferences,
  sendTestEmail,
  getReminderStats,
} = require("../controllers/reminderController");

// User routes (authentication required)
router.get("/preferences", authenticate, getReminderPreferences);
router.put("/preferences", authenticate, updateReminderPreferences);
router.post("/test-email", authenticate, sendTestEmail);

// Admin routes
router.get("/stats", authenticate, requireAdmin, getReminderStats);

module.exports = router;
