const mongoose = require("mongoose");
const { ROLE } = require("../constants/enums");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return !(this.provider === "google" || this.provider === "facebook");
      },
      select: false,
    },
    fcmToken: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ROLE,
      default: "user",
    },
    picture: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
      default: "local",
    },
    googleId: {
      type: String,
      default: null,
    },
    facebookId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
