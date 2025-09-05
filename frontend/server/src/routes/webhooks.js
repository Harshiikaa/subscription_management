import { Router } from "express";

const router = Router();

router.post("/esewa", (req, res) => {
  // TODO: validate signature and event
  return res.json({ ok: true });
});

router.post("/imepay", (req, res) => {
  // TODO: validate signature and event
  return res.json({ ok: true });
});

export default router;
