import { Router } from "express";
import { db, createId } from "../lib/store.js";
import { requireAuth } from "../lib/auth.js";

const router = Router();

// eSewa initiate - return redirect to FE callback (demo)
router.post("/esewa/initiate", requireAuth, (req, res) => {
  const { planId } = req.body;
  const plan = db.plans.find((p) => p.id === planId);
  if (!plan)
    return res.status(400).json({ success: false, message: "Invalid plan" });
  const redirectUrl = `${
    process.env.ESEWA_CALLBACK ||
    "http://localhost:3000/payments/esewa/callback"
  }?ref=${createId()}`;
  return res.json({ success: true, redirectUrl });
});

// eSewa verify - mark subscription active
router.get("/esewa/verify", requireAuth, (req, res) => {
  const sub = db.subscriptions.find(
    (s) => s.userId === req.user.id && s.status === "pending"
  );
  if (!sub)
    return res.json({ success: false, message: "No pending subscription" });
  sub.status = "active";
  // Optionally record payment
  db.payments.push({
    id: createId(),
    userId: req.user.id,
    subscriptionId: sub.id,
    gateway: "esewa",
    amount: "NPR 999",
    status: "paid",
    externalRef: req.query.ref,
    createdAt: new Date().toISOString(),
  });
  return res.json({ success: true });
});

// IME Pay initiate
router.post("/imepay/initiate", requireAuth, (req, res) => {
  const { planId } = req.body;
  const plan = db.plans.find((p) => p.id === planId);
  if (!plan)
    return res.status(400).json({ success: false, message: "Invalid plan" });
  const redirectUrl = `${
    process.env.IMEPAY_CALLBACK ||
    "http://localhost:3000/payments/imepay/callback"
  }?ref=${createId()}`;
  return res.json({ success: true, redirectUrl });
});

router.get("/imepay/verify", requireAuth, (req, res) => {
  const sub = db.subscriptions.find(
    (s) => s.userId === req.user.id && s.status === "pending"
  );
  if (!sub)
    return res.json({ success: false, message: "No pending subscription" });
  sub.status = "active";
  db.payments.push({
    id: createId(),
    userId: req.user.id,
    subscriptionId: sub.id,
    gateway: "imepay",
    amount: "NPR 999",
    status: "paid",
    externalRef: req.query.ref,
    createdAt: new Date().toISOString(),
  });
  return res.json({ success: true });
});

// User billing history
router.get("/history", requireAuth, (req, res) => {
  const items = db.payments
    .filter((p) => p.userId === req.user.id)
    .map((p) => ({
      id: p.id,
      date: p.createdAt?.slice(0, 10),
      gateway: p.gateway,
      amount: p.amount,
      status: p.status,
    }));
  return res.json({ success: true, data: items });
});

// Admin views
router.get("/admin", requireAuth, (req, res) => {
  // alias if needed
  return res.json({ success: true, data: db.payments });
});

export default router;
