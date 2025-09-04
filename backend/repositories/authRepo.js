const User = require("../models/user");

exports.createUserRepo = async (userData) => {
  return await User.create(userData);
};

exports.findByEmailRepo = async (email) => {
  return await User.findOne({ email });
};

exports.findUserByEmailWithPasswordRepo = async (email) => {
  return await User.findOne({ email }).select("+password");
};

exports.findByIdRepo = async (id) => {
  return await User.findById(id);
};

exports.getMyProfileRepo = async (userId) => {
  return await User.findOne({ _id: userId }).select("-password");
};
