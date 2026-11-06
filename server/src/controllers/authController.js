import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  shopName: u.shopName,
});

export async function register(req, res) {
  const { name, email, password, shopName } = req.body;
  if (!name || !email || !password || !shopName)
    return res.status(400).json({ message: "All fields are required" });
  if (password.length < 6)
    return res.status(400).json({ message: "Password must be 6+ characters" });

  if (await User.findOne({ email: email.toLowerCase() }))
    return res.status(409).json({ message: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, shopName });

  res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || "").toLowerCase() });
  if (!user || !(await bcrypt.compare(password || "", user.passwordHash)))
    return res.status(401).json({ message: "Invalid email or password" });

  res.json({ token: signToken(user._id), user: publicUser(user) });
}

export async function me(req, res) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user: publicUser(user) });
}