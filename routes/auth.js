// ✅ Updated backend routes/auth.js with safe OTP memory check

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const sendOtpEmail = require("../utils/sendOtpEmail");

// In-memory stores
const otpStore = {}; // { email: { otp: '123456', expires: timestamp } }
const verifiedEmails = new Set();

// === SEND OTP ===
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email is required." });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const result = await sendOtpEmail(email, otp);

  if (result.success) {
    otpStore[email] = {
      otp,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    };
    return res.json({ success: true });
  } else {
    return res.status(500).json({ success: false, error: result.error });
  }
});

// === VERIFY OTP ===
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, error: "Email and OTP required." });

  const record = otpStore[email];
  if (!record || record.otp !== otp) {
    return res.status(400).json({ success: false, error: "Invalid OTP." });
  }

  if (Date.now() > record.expires) {
    delete otpStore[email];
    return res.status(400).json({ success: false, error: "OTP expired." });
  }

  verifiedEmails.add(email);
  delete otpStore[email];
  return res.json({ success: true });
});

// === REGISTER ===
router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ success: false, error: "All fields required." });
  }

  if (!verifiedEmails.has(email)) {
    return res.status(403).json({ success: false, error: "Please verify OTP before registering." });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(409).json({ success: false, error: "Username already exists." });
  }

  const user = new User({ username, password, email });
  await user.save();
  verifiedEmails.delete(email);

  return res.json({ success: true, user: { username: user.username, isPremium: user.isPremium } });
});

// === LOGIN ===
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: "Username and password required." });
  }

  const user = await User.findOne({ username, password });
  if (!user) {
    return res.status(401).json({ success: false, error: "Invalid credentials." });
  }

  return res.json({ success: true, user: { username: user.username, isPremium: user.isPremium } });
});

module.exports = router;
