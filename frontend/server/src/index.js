import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import planRoutes from "./routes/plans.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import paymentRoutes from "./routes/payments.js";
import webhookRoutes from "./routes/webhooks.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/admin", adminRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API listening on :${port}`));
