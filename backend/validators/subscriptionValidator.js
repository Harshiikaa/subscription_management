const { body, param, query, validationResult } = require("express-validator");
const AppError = require("../utils/errors");

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return next(AppError.badRequest(errorMessages.join(", ")));
  }
  next();
};

// Create subscription from product validation
const createFromProductValidation = [
  body("productId").isMongoId().withMessage("Invalid product ID"),

  body("billingCycle")
    .isIn(["monthly", "yearly", "quarterly", "weekly"])
    .withMessage(
      "Billing cycle must be one of: monthly, yearly, quarterly, weekly"
    ),

  body("paymentMethod")
    .isIn(["esewa", "khalti", "stripe", "card"])
    .withMessage("Payment method must be one of: esewa, khalti, stripe, card"),

  validate,
];

// Create subscription from plan validation
const createFromPlanValidation = [
  body("subscriptionPlanId")
    .isMongoId()
    .withMessage("Invalid subscription plan ID"),

  body("billingCycle")
    .isIn(["monthly", "yearly", "quarterly", "weekly"])
    .withMessage(
      "Billing cycle must be one of: monthly, yearly, quarterly, weekly"
    ),

  body("paymentMethod")
    .isIn(["esewa", "khalti", "stripe", "card"])
    .withMessage("Payment method must be one of: esewa, khalti, stripe, card"),

  validate,
];

// Get subscription validation
const getSubscriptionValidation = [
  param("subscriptionId").isMongoId().withMessage("Invalid subscription ID"),

  validate,
];

// List subscriptions validation
const listSubscriptionsValidation = [
  query("type")
    .optional()
    .isIn(["product", "plan"])
    .withMessage("Type must be 'product' or 'plan'"),

  query("status")
    .optional()
    .isIn(["active", "cancelled", "expired", "pending", "trial"])
    .withMessage("Invalid status"),

  query("billingCycle")
    .optional()
    .isIn(["monthly", "yearly", "quarterly", "weekly"])
    .withMessage("Invalid billing cycle"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  validate,
];

// Cancel subscription validation
const cancelSubscriptionValidation = [
  param("subscriptionId").isMongoId().withMessage("Invalid subscription ID"),

  body("reason")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Cancel reason must not exceed 500 characters"),

  validate,
];

// Renew subscription validation
const renewSubscriptionValidation = [
  param("subscriptionId").isMongoId().withMessage("Invalid subscription ID"),

  validate,
];

// Get subscriptions by product validation
const getSubscriptionsByProductValidation = [
  param("productId").isMongoId().withMessage("Invalid product ID"),

  validate,
];

// Get subscriptions by plan validation
const getSubscriptionsByPlanValidation = [
  param("planId").isMongoId().withMessage("Invalid plan ID"),

  validate,
];

// Get subscriptions by type validation
const getSubscriptionsByTypeValidation = [
  param("type")
    .isIn(["product", "plan"])
    .withMessage("Type must be 'product' or 'plan'"),

  validate,
];

// Get active subscriptions validation
const getActiveSubscriptionsValidation = [
  param("userId").optional().isMongoId().withMessage("Invalid user ID"),

  validate,
];

// Get expiring subscriptions validation
const getExpiringSubscriptionsValidation = [
  query("days")
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage("Days must be between 1 and 365"),

  validate,
];

module.exports = {
  createFromProductValidation,
  createFromPlanValidation,
  getSubscriptionValidation,
  listSubscriptionsValidation,
  cancelSubscriptionValidation,
  renewSubscriptionValidation,
  getSubscriptionsByProductValidation,
  getSubscriptionsByPlanValidation,
  getSubscriptionsByTypeValidation,
  getActiveSubscriptionsValidation,
  getExpiringSubscriptionsValidation,
};
