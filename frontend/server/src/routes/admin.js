import { Router } from "express";
import { db } from "../lib/store.js";
import { requireAuth, requireRole } from "../lib/auth.js";

const router = Router();

router.get("/users", requireAuth, requireRole("admin"), (_req, res) => {
  const users = db.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
  }));
  return res.json({ success: true, data: users });
});

router.put("/users/:id/role", requireAuth, requireRole("admin"), (req, res) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user)
    return res.status(404).json({ success: false, message: "Not found" });
  const { role } = req.body || {};
  if (!role || !["user", "admin"].includes(role))
    return res.status(400).json({ success: false, message: "Invalid role" });
  user.role = role;
  return res.json({ success: true });
});

router.get("/payments", requireAuth, requireRole("admin"), (_req, res) => {
  const items = db.payments.map((p) => ({
    id: p.id,
    date: p.createdAt?.slice(0, 10),
    userEmail: (db.users.find((u) => u.id === p.userId) || {}).email,
    gateway: p.gateway,
    amount: p.amount,
    status: p.status,
  }));
  return res.json({ success: true, data: items });
});

export default router;
