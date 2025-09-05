import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export const signToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role)
    return res.status(403).json({ success: false, message: "Forbidden" });
  return next();
};
