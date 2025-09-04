require("dotenv-flow").config(); // Auto-load based on NODE_ENV
const express = require("express");
const cors = require("cors");
const connectDB = require("./database/db");
const authRoute = require("./routes/authRoute");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
// Middleware (to parse JSON body)
app.use(express.json());

app.use("/api/auth", authRoute);

// Basic route
app.get("/", (req, res) => {
  res.send("Hello, backend is running!");
});

// Health
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: "Employee Backend is running." });
});

app.use(errorHandler);

// Start server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// 404 handler
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// --- Start
(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();
