import { Router } from "express";
import { db, createId } from "../lib/store.js";
import { requireAuth } from "../lib/auth.js";

const router = Router();

router.get("/me", requireAuth, (req, res) => {
  const sub = db.subscriptions.find(
    (s) => s.userId === req.user.id && s.status !== "cancelled"
  );
  if (!sub) return res.json({ success: true, data: null });
  const plan = db.plans.find((p) => p.id === sub.planId);
  return res.json({
    success: true,
    data: {
      planId: sub.planId,
      planName: plan?.name,
      status: sub.status,
      renewsOn: sub.renewsOn || null,
    },
  });
});

router.post("/", requireAuth, (req, res) => {
  const { planId, gateway } = req.body;
  const plan = db.plans.find((p) => p.id === planId);
  if (!plan)
    return res.status(400).json({ success: false, message: "Invalid plan" });
  let sub = db.subscriptions.find(
    (s) => s.userId === req.user.id && s.status !== "cancelled"
  );
  if (!sub) {
    sub = {
      id: createId(),
      userId: req.user.id,
      planId,
      status: "pending",
      gateway,
    };
    db.subscriptions.push(sub);
  } else {
    sub.planId = planId;
    sub.gateway = gateway;
    sub.status = "pending";
  }
  return res.json({ success: true, data: { id: sub.id } });
});

router.post("/upgrade", requireAuth, (req, res) => {
  const { planId } = req.body;
  const sub = db.subscriptions.find(
    (s) => s.userId === req.user.id && s.status !== "cancelled"
  );
  if (!sub)
    return res.status(400).json({ success: false, message: "No subscription" });
  sub.planId = planId;
  sub.status = "active";
  return res.json({ success: true });
});

router.post("/downgrade", requireAuth, (req, res) => {
  const { planId } = req.body;
  const sub = db.subscriptions.find(
    (s) => s.userId === req.user.id && s.status !== "cancelled"
  );
  if (!sub)
    return res.status(400).json({ success: false, message: "No subscription" });
  sub.planId = planId;
  sub.status = "active";
  return res.json({ success: true });
});

router.post("/cancel", requireAuth, (req, res) => {
  const sub = db.subscriptions.find(
    (s) => s.userId === req.user.id && s.status !== "cancelled"
  );
  if (!sub)
    return res.status(400).json({ success: false, message: "No subscription" });
  sub.status = "cancelled";
  return res.json({ success: true });
});

export default router;
