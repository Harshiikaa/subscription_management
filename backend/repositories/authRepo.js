const User = require("../models/user");

exports.createUserRepo = async (userData) => {
  const user = new User(userData);
  return await User.create(userData);
};

exports.findByEmailRepo = async (email) => {
  return await User.findOne({ email });
};
