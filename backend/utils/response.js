
// Sends a success response
exports.sendSuccess = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Sends an error response
exports.sendError = (res, { message, statusCode = 500, errors = [] }) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
