const bcrypt = require("bcryptjs");
const AppError = require("../utils/errors");
const { findByEmailRepo, createUserRepo, getMyProfileRepo } = require("../repositories/authRepo");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

exports.signUpService = async ({ name, email, password }) => {
  // check if email already exists
  const existingUser = await findByEmailRepo(email);
  if (existingUser) {
    throw AppError.badRequest("Email already registered");
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create user
  const user = await createUserRepo({
    name,
    email,
    password: hashedPassword,
  });

  return user;
};

exports.loginService = async ({ user, password }) => {
  if (!user) {
    throw AppError.unauthorized("Invalid credentials");
  }
  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw AppError.unauthorized("Invalid credentials");
  }
  const payload = {
    userId: user._id,
    organizationId: user.organizationId,
    role: user.role,
  };
  // ✅ Both tokens are created here
  const accessToken = generateAccessToken({ id: user._id });
  const refreshToken = generateRefreshToken({ id: user._id });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

exports.refreshService = async (token) => {
  if (!token) throw AppError.unauthorized("Refresh token missing");

  const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
  //   const newAccessToken = generateAccessToken({ id: decoded.id });
  //   return { accessToken: newAccessToken };
  const user = await findByIdRepo(decoded.id);
  if (!user) throw AppError.unauthorized("User no longer exists");

  const newAccessToken = generateAccessToken({ id: user._id });
  return { accessToken: newAccessToken };
};

exports.getMyProfileService = async (userId) => {
  return await getMyProfileRepo(userId);
};
