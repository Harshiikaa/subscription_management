const { sendError } = require("../utils/response");
const AppError = require("../utils/errors");

module.exports = (err, req, res, next) => {
  // Log details to the terminal
  console.error("🔥 Unexpected Error:", {
    message: err.message,
    stack: err.stack,
    name: err.name,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Known (custom) error
  if (err instanceof AppError) {
    return sendError(res, {
      message: err.message,
      statusCode: err.statusCode,
      errors: err.errors,
    });
  }

  // Fallback (Internal Server Error)
  return sendError(res, {
    message: "Internal Server Error",
    statusCode: 500,
  });
};
