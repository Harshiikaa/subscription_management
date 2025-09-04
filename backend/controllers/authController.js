const { signUpService } = require("../services/authService");
const AppError = require("../utils/errors");
const { sendSuccess, sendError } = require("../utils/response");

exports.signupController = async (req, res) => {
  const user = await signUpService(req.body);
  return sendSuccess(res, user, "User created successfully", 201);
};
