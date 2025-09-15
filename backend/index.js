require("dotenv-flow").config(); // Auto-load based on NODE_ENV
const express = require("express");
const cors = require("cors");
const connectDB = require("./database/db");
const authRoute = require("./routes/authRoute");
const productRoute = require("./routes/productRoute");
const subscriptionRoute = require("./routes/subscriptionRoute");
const subscriptionPlanRoute = require("./routes/subscriptionPlanRoute");
const paymentRoute = require("./routes/paymentRoute");
const reminderRoute = require("./routes/reminderRoute");
const manualReminderRoute = require("./routes/manualReminderRoute");
const errorHandler = require("./middlewares/errorHandler");
const agendaConfig = require("./configs/agenda");

const { seedMockProductsService } = require("./services/productService");
const { seedMockPlansService } = require("./services/subscriptionPlanService");

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
app.use("/api/products", productRoute);
app.use("/api/subscriptions", subscriptionRoute);
app.use("/api/subscription-plans", subscriptionPlanRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/reminders", reminderRoute);
app.use("/api/manual-reminders", manualReminderRoute);

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

  // Initialize Agenda for cron jobs
  try {
    await agendaConfig.initialize();
    await agendaConfig.scheduleJobs();
    console.log("✅ Agenda jobs scheduled");
  } catch (e) {
    console.error("⚠️ Failed to initialize Agenda:", e.message);
  }

  // Auto-seed products (idempotent)
  try {
    await seedMockProductsService();
    console.log("✅ Mock products seeded");
  } catch (e) {
    console.error("⚠️ Failed to seed products:", e.message);
  }

  // Auto-seed subscription plans (idempotent)
  try {
    await seedMockPlansService();
    console.log("✅ Mock subscription plans seeded");
  } catch (e) {
    console.error("⚠️ Failed to seed subscription plans:", e.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();
