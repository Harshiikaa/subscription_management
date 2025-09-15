const express = require("express");
const {
  signupController,
  loginController,
  refreshController,
  getMyProfileController,
  googleLoginController,
  facebookLoginController,
  logoutController,
} = require("../controllers/authController");

const router = express.Router();
const asyncHandler = require("../middlewares/asyncHandler");
const { authenticate } = require("../middlewares/authMiddleware");

router.post("/signup", asyncHandler(signupController));
router.post("/login", loginController);
router.post("/refresh", refreshController);
router.get("/me", authenticate, asyncHandler(getMyProfileController));
router.post("/google-login", googleLoginController);
router.post("/facebook-login", asyncHandler(facebookLoginController));
router.post("/logout", authenticate, asyncHandler(logoutController));

module.exports = router;
