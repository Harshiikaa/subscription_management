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

// Create subscription plan validation
const createSubscriptionPlanValidation = [
  body("name")
    .notEmpty()
    .withMessage("Plan name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Plan name must be between 2 and 100 characters")
    .trim(),

  body("description")
    .notEmpty()
    .withMessage("Plan description is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Plan description must be between 10 and 500 characters")
    .trim(),

  body("planType")
    .isIn(["basic", "premium", "enterprise", "custom"])
    .withMessage(
      "Plan type must be one of: basic, premium, enterprise, custom"
    ),

  body("pricing.monthly")
    .isNumeric()
    .withMessage("Monthly price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Monthly price must be greater than or equal to 0"),

  body("pricing.yearly")
    .isNumeric()
    .withMessage("Yearly price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Yearly price must be greater than or equal to 0"),

  body("pricing.currency")
    .optional()
    .isIn(["USD", "EUR", "GBP", "NPR"])
    .withMessage("Currency must be one of: USD, EUR, GBP, NPR"),

  body("features")
    .isArray({ min: 1 })
    .withMessage("At least one feature is required"),

  body("features.*.name")
    .notEmpty()
    .withMessage("Feature name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Feature name must be between 2 and 100 characters"),

  body("features.*.description")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Feature description must not exceed 200 characters"),

  body("features.*.included")
    .optional()
    .isBoolean()
    .withMessage("Feature included must be a boolean"),

  body("billingCycles")
    .optional()
    .isArray()
    .withMessage("Billing cycles must be an array"),

  body("billingCycles.*")
    .optional()
    .isIn(["monthly", "yearly", "quarterly", "weekly"])
    .withMessage("Invalid billing cycle"),

  body("trialPeriod.enabled")
    .optional()
    .isBoolean()
    .withMessage("Trial period enabled must be a boolean"),

  body("trialPeriod.days")
    .optional()
    .isInt({ min: 0, max: 365 })
    .withMessage("Trial period days must be between 0 and 365"),

  body("limits.maxUsers")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Max users must be a positive integer"),

  body("limits.maxStorage")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Max storage description must not exceed 50 characters"),

  body("limits.maxApiCalls")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Max API calls must be a non-negative integer"),

  body("limits.maxProjects")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Max projects must be a non-negative integer"),

  body("isPopular")
    .optional()
    .isBoolean()
    .withMessage("isPopular must be a boolean"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a non-negative integer"),

  body("tags").optional().isArray().withMessage("Tags must be an array"),

  body("tags.*")
    .optional()
    .isLength({ min: 1, max: 30 })
    .withMessage("Each tag must be between 1 and 30 characters"),

  validate,
];

// Update subscription plan validation
const updateSubscriptionPlanValidation = [
  param("planId").isMongoId().withMessage("Invalid plan ID"),

  body("name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Plan name must be between 2 and 100 characters")
    .trim(),

  body("description")
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage("Plan description must be between 10 and 500 characters")
    .trim(),

  body("planType")
    .optional()
    .isIn(["basic", "premium", "enterprise", "custom"])
    .withMessage(
      "Plan type must be one of: basic, premium, enterprise, custom"
    ),

  body("pricing.monthly")
    .optional()
    .isNumeric()
    .withMessage("Monthly price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Monthly price must be greater than or equal to 0"),

  body("pricing.yearly")
    .optional()
    .isNumeric()
    .withMessage("Yearly price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Yearly price must be greater than or equal to 0"),

  body("pricing.currency")
    .optional()
    .isIn(["USD", "EUR", "GBP", "NPR"])
    .withMessage("Currency must be one of: USD, EUR, GBP, NPR"),

  body("features")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one feature is required"),

  body("features.*.name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Feature name must be between 2 and 100 characters"),

  body("features.*.description")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Feature description must not exceed 200 characters"),

  body("features.*.included")
    .optional()
    .isBoolean()
    .withMessage("Feature included must be a boolean"),

  body("billingCycles")
    .optional()
    .isArray()
    .withMessage("Billing cycles must be an array"),

  body("billingCycles.*")
    .optional()
    .isIn(["monthly", "yearly", "quarterly", "weekly"])
    .withMessage("Invalid billing cycle"),

  body("trialPeriod.enabled")
    .optional()
    .isBoolean()
    .withMessage("Trial period enabled must be a boolean"),

  body("trialPeriod.days")
    .optional()
    .isInt({ min: 0, max: 365 })
    .withMessage("Trial period days must be between 0 and 365"),

  body("limits.maxUsers")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Max users must be a positive integer"),

  body("limits.maxStorage")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Max storage description must not exceed 50 characters"),

  body("limits.maxApiCalls")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Max API calls must be a non-negative integer"),

  body("limits.maxProjects")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Max projects must be a non-negative integer"),

  body("isPopular")
    .optional()
    .isBoolean()
    .withMessage("isPopular must be a boolean"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a non-negative integer"),

  body("tags").optional().isArray().withMessage("Tags must be an array"),

  body("tags.*")
    .optional()
    .isLength({ min: 1, max: 30 })
    .withMessage("Each tag must be between 1 and 30 characters"),

  validate,
];

// Get subscription plan validation
const getSubscriptionPlanValidation = [
  param("planId").isMongoId().withMessage("Invalid plan ID"),

  validate,
];

// List subscription plans validation
const listSubscriptionPlansValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("planType")
    .optional()
    .isIn(["basic", "premium", "enterprise", "custom"])
    .withMessage("Invalid plan type"),

  query("isPopular")
    .optional()
    .isIn(["true", "false"])
    .withMessage("isPopular must be true or false"),

  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Min price must be a non-negative number"),

  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Max price must be a non-negative number"),

  query("includeInactive")
    .optional()
    .isIn(["true", "false"])
    .withMessage("includeInactive must be true or false"),

  query("sortBy")
    .optional()
    .isIn([
      "sortOrder",
      "name",
      "pricing.monthly",
      "pricing.yearly",
      "createdAt",
      "updatedAt",
    ])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),

  validate,
];

// Search plans validation
const searchPlansValidation = [
  query("q")
    .notEmpty()
    .withMessage("Search query is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Search query must be between 2 and 100 characters"),

  query("planType")
    .optional()
    .isIn(["basic", "premium", "enterprise", "custom"])
    .withMessage("Invalid plan type"),

  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Min price must be a non-negative number"),

  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Max price must be a non-negative number"),

  query("tags")
    .optional()
    .isString()
    .withMessage("Tags must be a comma-separated string"),

  validate,
];

// Get plans by type validation
const getPlansByTypeValidation = [
  param("planType")
    .isIn(["basic", "premium", "enterprise", "custom"])
    .withMessage("Invalid plan type"),

  validate,
];

// Update sort order validation
const updateSortOrderValidation = [
  param("planId").isMongoId().withMessage("Invalid plan ID"),

  body("sortOrder")
    .isInt({ min: 0 })
    .withMessage("Sort order must be a non-negative integer"),

  validate,
];

// Set popular plan validation
const setPopularPlanValidation = [
  param("planId").isMongoId().withMessage("Invalid plan ID"),

  body("isPopular").isBoolean().withMessage("isPopular must be a boolean"),

  validate,
];

// Bulk update validation
const bulkUpdateValidation = [
  body("updates")
    .isArray({ min: 1 })
    .withMessage("Updates must be a non-empty array"),

  body("updates.*.planId")
    .isMongoId()
    .withMessage("Invalid plan ID in updates"),

  body("updates.*.updateData")
    .isObject()
    .withMessage("Update data must be an object"),

  validate,
];

module.exports = {
  createSubscriptionPlanValidation,
  updateSubscriptionPlanValidation,
  getSubscriptionPlanValidation,
  listSubscriptionPlansValidation,
  searchPlansValidation,
  getPlansByTypeValidation,
  updateSortOrderValidation,
  setPopularPlanValidation,
  bulkUpdateValidation,
};
