import { Router } from "express";
import { db, createId } from "../lib/store.js";
import { requireAuth, requireRole } from "../lib/auth.js";

const router = Router();

router.get("/", (_req, res) => {
  return res.json({
    success: true,
    data: db.plans.filter((p) => p.isActive !== false),
  });
});

router.post("/", requireAuth, requireRole("admin"), (req, res) => {
  const { name, price, features = [], isActive = true } = req.body;
  if (!name || !price)
    return res.status(400).json({ success: false, message: "Missing fields" });
  const plan = { id: createId(), name, price, features, isActive };
  db.plans.push(plan);
  return res.json({ success: true, data: plan });
});

router.put("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const idx = db.plans.findIndex((p) => p.id === req.params.id);
  if (idx === -1)
    return res.status(404).json({ success: false, message: "Not found" });
  db.plans[idx] = { ...db.plans[idx], ...req.body };
  return res.json({ success: true, data: db.plans[idx] });
});

router.delete("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const idx = db.plans.findIndex((p) => p.id === req.params.id);
  if (idx === -1)
    return res.status(404).json({ success: false, message: "Not found" });
  const [removed] = db.plans.splice(idx, 1);
  return res.json({ success: true, data: removed });
});

export default router;
