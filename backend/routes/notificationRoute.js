const express = require("express");
const { authenticate } = require("../middlewares/authMiddleware");
const {
  listMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.use(authenticate);

// GET /api/notifications?unreadOnly=true&page=1&limit=20
router.get("/", listMyNotifications);

// POST /api/notifications/:id/read
router.post("/:id/read", markNotificationRead);

// POST /api/notifications/read-all
router.post("/read-all", markAllNotificationsRead);

module.exports = router;
