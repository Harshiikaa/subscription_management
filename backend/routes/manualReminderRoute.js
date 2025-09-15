const express = require("express");
const router = express.Router();

const { authenticate } = require("../middlewares/authMiddleware");

const {
  getUserReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  getReminder,
  sendReminderNow,
  getReminderStats,
} = require("../controllers/manualReminderController");

// All routes require authentication
router.use(authenticate);

// Get user's reminders
router.get("/", getUserReminders);

// Get reminder statistics
router.get("/stats", getReminderStats);

// Create a new reminder
router.post("/", createReminder);

// Get a specific reminder
router.get("/:id", getReminder);

// Update a reminder
router.put("/:id", updateReminder);

// Delete a reminder
router.delete("/:id", deleteReminder);

// Send reminder immediately (for testing)
router.post("/:id/send", sendReminderNow);

module.exports = router;
