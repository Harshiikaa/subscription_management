const jwt = require("jsonwebtoken");

exports.generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_SECRET, { expiresIn: "20s" });
};

exports.generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: "2m" });
};
