const bcrypt = require("bcryptjs");
const AppError = require("../utils/errors");
const { findByEmailRepo, createUserRepo } = require("../repositories/authRepo");
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
