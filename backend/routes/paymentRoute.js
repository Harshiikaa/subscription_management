const express = require("express");
const { authenticate } = require("../middlewares/authMiddleware");
const { createPayment, completePayment, success, failure } = require("../controllers/paymentController");

const router = express.Router();

// POST /api/payment
router.post("/createPayment", authenticate, createPayment);
router.all("/completePayment", completePayment);
router.get("/payment/success", success);
router.get("/payment/failure", failure);
module.exports = router;
