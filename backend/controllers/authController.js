const { signUpService, loginService, getMyProfileService } = require("../services/authService");
const AppError = require("../utils/errors");
const { sendSuccess, sendError } = require("../utils/response");
const { refreshService } = require("../services/authService");
const { findUserByEmailWithPasswordRepo } = require("../repositories/authRepo");

exports.signupController = async (req, res) => {
  const user = await signUpService(req.body);
  return sendSuccess(res, user, "User created successfully", 201);
};

exports.loginController = async (req, res) => {
  const { email, password } = req.body;
 const user = await findUserByEmailWithPasswordRepo(email);
 if (!user) {
   throw AppError.notFound("No user found with this email", "email");
 }
 const result = await loginService({ user, password });
 sendSuccess(res, result, "Login Successful", 201);
};
exports.refreshController = async (req, res) => {
  const { refreshToken } = req.body;
  const result = await refreshService(refreshToken);

  return sendSuccess(res, result, "Token refreshed", 200);
};

exports.getMyProfileController = async (req, res) => {
  const userId = req.user._id;
  const profile = await getMyProfileService(userId);
  // if (!userId) throw AppError.notFound('No user found with this id', 'id');
  if (!profile) {
    throw AppError.notFound("No profile found with this user id", "id");
  }
  sendSuccess(res, profile, "User profile found successfully", 200);
};
