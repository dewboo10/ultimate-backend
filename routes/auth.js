const express = require("express");
const router = express.Router();
const User = require("../models/User");
const sendOtpEmail = require("/utils/sendOtpEmail");

// In-memory stores
const otpStore = {};
const verifiedEmails = new Set();

// === SEND OTP ===
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email is required." });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const result = await sendOtpEmail(email, otp);

  if (result.success) {
    otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };
    return res.json({ success: true, message: "OTP sent successfully." });
  } else {
    return res.status(500).json({ success: false, error: "Failed to send OTP." });
  }
});

// === VERIFY OTP ===
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const stored = otpStore[email];

  if (!stored) return res.status(400).json({ success: false, error: "No OTP found." });
  if (Date.now() > stored.expiresAt) return res.status(400).json({ success: false, error: "OTP expired." });
  if (stored.otp !== otp) return res.status(400).json({ success: false, error: "Invalid OTP." });

  verifiedEmails.add(email);
  delete otpStore[email];
  return res.json({ success: true, message: "OTP verified successfully." });
});

// === REGISTER ===
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!verifiedEmails.has(username)) {
    return res.status(403).json({ success: false, error: "Please verify OTP before registering." });
  }

  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ success: false, error: "User already exists." });

  const newUser = await User.create({ username, password });
  verifiedEmails.delete(username); // clear after use
  return res.json({ success: true, user: newUser });
});

// === LOGIN ===
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });

  if (!user) return res.status(401).json({ success: false, error: "Invalid credentials." });
  return res.json({ success: true, user });
});

// === MAKE PREMIUM ===
router.post("/make-premium", async (req, res) => {
  const { username } = req.body;
  const user = await User.findOneAndUpdate({ username }, { isPremium: true }, { new: true });

  if (!user) return res.status(404).json({ success: false, error: "User not found." });
  return res.json({ success: true, user });
});

// === TEST ===
router.get("/test", (req, res) => {
  res.send("✅ Backend is running and healthy!");
});

module.exports = router;
