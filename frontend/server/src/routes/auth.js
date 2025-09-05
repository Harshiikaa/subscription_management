import { Router } from "express";
import { db, createId } from "../lib/store.js";
import { signToken, requireAuth } from "../lib/auth.js";

const router = Router();

router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "Missing fields" });
  if (db.users.find((u) => u.email === email))
    return res.status(400).json({ success: false, message: "Email exists" });
  const user = {
    id: createId(),
    name: name || email,
    email,
    password,
    role: "user",
  };
  db.users.push(user);
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(
    (u) => u.email === email && u.password === password
  );
  if (!user)
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

router.get("/me", requireAuth, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user)
    return res.status(404).json({ success: false, message: "Not found" });
  return res.json({
    success: true,
    data: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

router.post("/logout", requireAuth, (_req, res) => {
  return res.json({ success: true });
});

export default router;
