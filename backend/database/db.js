const mongoose = require("mongoose");
require("dotenv").config();

/**
 * Establishes a connection to the MongoDB database.
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI; 

  if (!uri) {
    throw new Error("Mongo URI is missing! Please check your .env file");
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
