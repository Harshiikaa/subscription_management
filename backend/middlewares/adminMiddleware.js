const { sendError } = require("../utils/response");
const AppError = require("../utils/errors");
const User = require("../models/user");

// Middleware to check if user is admin or superadmin
exports.requireAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated (should be called after authenticate middleware)
    if (!req.user) {
      return sendError(res, { message: "Authentication required" }, 401);
    }

    // Check if user has admin or superadmin role
    if (!["admin", "superadmin"].includes(req.user.role)) {
      return sendError(res, { message: "Admin access required" }, 403);
    }

    next();
  } catch (error) {
    return sendError(
      res,
      { message: "Error checking admin access", error: error.message },
      500
    );
  }
};

// Middleware to check if user is superadmin only
exports.requireSuperAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return sendError(res, { message: "Authentication required" }, 401);
    }

    // Check if user has superadmin role
    if (req.user.role !== "superadmin") {
      return sendError(res, { message: "Super admin access required" }, 403);
    }

    next();
  } catch (error) {
    return sendError(
      res,
      { message: "Error checking super admin access", error: error.message },
      500
    );
  }
};

// Middleware to check if user can manage products
exports.canManageProducts = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, { message: "Authentication required" }, 401);
    }

    // Only admins and superadmins can manage products
    if (!["admin", "superadmin"].includes(req.user.role)) {
      return sendError(
        res,
        { message: "Insufficient permissions to manage products" },
        403
      );
    }

    // Add admin info to request for use in controllers
    req.adminId = req.user._id;
    req.adminRole = req.user.role;

    next();
  } catch (error) {
    return sendError(
      res,
      {
        message: "Error checking product management permissions",
        error: error.message,
      },
      500
    );
  }
};

// Middleware to check if user can view products (all authenticated users)
exports.canViewProducts = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, { message: "Authentication required" }, 401);
    }

    next();
  } catch (error) {
    return sendError(
      res,
      {
        message: "Error checking product view permissions",
        error: error.message,
      },
      500
    );
  }
};

// Middleware to check if user can subscribe to products
exports.canSubscribe = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, { message: "Authentication required" }, 401);
    }

    // Regular users can subscribe, admins can also subscribe
    req.userId = req.user._id;
    req.userRole = req.user.role;

    next();
  } catch (error) {
    return sendError(
      res,
      {
        message: "Error checking subscription permissions",
        error: error.message,
      },
      500
    );
  }
};

// Utility function to check if user is admin (for use in services)
exports.isAdmin = (user) => {
  return user && ["admin", "superadmin"].includes(user.role);
};

// Utility function to check if user is superadmin (for use in services)
exports.isSuperAdmin = (user) => {
  return user && user.role === "superadmin";
};

// Utility function to get admin permissions level
exports.getAdminLevel = (user) => {
  if (!user) return 0;

  switch (user.role) {
    case "superadmin":
      return 3;
    case "admin":
      return 2;
    case "user":
      return 1;
    default:
      return 0;
  }
};
