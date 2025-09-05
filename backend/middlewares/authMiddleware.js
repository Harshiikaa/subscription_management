const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/response");
const User = require("../models/user");
const AppError = require("../utils/errors");

exports.authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("authHeader: ", authHeader);
  if (!authHeader?.startsWith("Bearer ")) {
    // If the Authorization header is missing or invalid, return an error.
    return sendError(
      res,
      { message: "Authorization header missing or invalid" },
      401
    );
  }

  const token = authHeader.split(" ")[1];
  try {
    // Verify the JWT token.
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch the user from the database using the userId in the decoded token.
    // const user = await User.findById(decoded.userId).select("-password");
    // const user = await User.findById(decoded.id).select("-password");
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(AppError.notFound("User not found in DB", "userId"));
    }
    req.user = user;
    console.log("user in auth middleware: ", user);
    next();
  } catch (err) {
    // If the token is invalid or expired, return an error.
    return next(AppError.unauthorized("Invalid or expired token"));
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is among the allowed roles
    if (!roles.includes(req.user.role)) {
      // If not, throw an access denied error
      return next(
        AppError.forbidden("Access denied: insufficient permissions")
      );
    }
    // If the user's role is allowed, proceed to the next middleware
    next();
  };
};

