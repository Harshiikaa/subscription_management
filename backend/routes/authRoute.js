const express = require("express");
const { signupController } = require("../controllers/authController");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");

router.post("/signup", asyncHandler(signupController));
// router.post("/login", authController.login);
// router.post("/refresh", authController.refresh);

module.exports = router;
