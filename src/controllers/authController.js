import User from "../models/User.js";
import { signJwt } from "../utils/auth.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already used" });
    const user = new User({ name, email, role });
    await user.setPassword(password);
    await user.save();
    const token = signJwt({ id: user._id, email: user.email, role: user.role });
    res.cookie("token", token, { httpOnly: true});
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing" });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (!await user.validatePassword(password)) return res.status(401).json({ message: "Invalid credentials" });
    const token = signJwt({ id: user._id, email: user.email, role: user.role });
    res.cookie("token", token, { httpOnly: true});
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "server error" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};

export const checkAuth = (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  const payload = verifyJwt(token);
  if (!payload) return res.status(401).json({ message: "Unauthorized" });
  res.json({ user: { id: payload.id, email: payload.email, role: payload.role } });
}