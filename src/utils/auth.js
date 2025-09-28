import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "change_this";

export const signJwt = (payload) => {
  return jwt.sign(payload, JWT_SECRET);
};

export const verifyJwt = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
};

export const requireAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Missing token" });
  const payload = verifyJwt(token);
  if (!payload) return res.status(401).json({ message: "Invalid token" });
  req.user = payload;
  return next();
};

export const requireRole =
  (allowedRoles = []) =>
  (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!allowedRoles.includes(req.user.role))
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
