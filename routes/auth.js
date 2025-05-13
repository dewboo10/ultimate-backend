const express = require("express");
const router = express.Router();
const User = require("../models/User");

const otpStore = {}; // email -> { otp, expires }
const verifiedEmails = new Set();

// Dummy email sender
const sendOtpEmail = async (email, otp) => {
  console.log(`OTP for ${email} is ${otp}`);
};

// Send OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

  await sendOtpEmail(email, otp);
  res.json({ success: true, message: "OTP sent" });
});

// Verify OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const stored = otpStore[email];
  if (!stored || stored.otp !== otp || stored.expires < Date.now()) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }

  verifiedEmails.add(email);
  delete otpStore[email];
  res.json({ success: true });
});

// Register
router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;
  if (!verifiedEmails.has(email)) return res.status(403).json({ message: "OTP not verified" });

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: "Email already registered" });

  const user = new User({ email, username, password });
  await user.save();
  verifiedEmails.delete(email);
  res.json({ success: true });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  res.json({ success: true, username: user.username });
});

module.exports = router;
