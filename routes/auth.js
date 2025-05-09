const sendOtpEmail = require("../utils/sendOtpEmail");
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// REGISTER
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ success: false, error: "User already exists" });

  const newUser = await User.create({ username, password });
  res.json({ success: true, user: newUser });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.status(401).json({ success: false, error: "Invalid credentials" });

  res.json({ success: true, user });
});
// SEND OTP
router.post("/send-otp", async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required." });
    }
  
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  
    const result = await sendOtpEmail(email, otp);
  
    if (result.success) {
      // Store OTP temporarily in memory (or use Redis for production)
      global.otpStore = global.otpStore || {};
      global.otpStore[email] = {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
      };
  
      return res.json({ success: true, message: "OTP sent successfully." });
    } else {
      return res.status(500).json({ success: false, error: "Failed to send OTP." });
    }
  });
  
module.exports = router;
// === MAKE PREMIUM ===
router.post("/make-premium", async (req, res) => {
    const { username } = req.body;
  
    const user = await User.findOneAndUpdate(
      { username },
      { isPremium: true },
      { new: true }
    );
  
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
  
    res.json({ success: true, user });
  });
  
  router.get("/test", (req, res) => {
    res.send("✅ Your backend is live and working!");
  });
  // VERIFY OTP
router.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;
  
    const stored = global.otpStore?.[email];
    if (!stored) return res.status(400).json({ success: false, error: "No OTP found." });
  
    if (Date.now() > stored.expiresAt) {
      return res.status(400).json({ success: false, error: "OTP expired." });
    }
  
    if (stored.otp !== otp) {
      return res.status(400).json({ success: false, error: "Invalid OTP." });
    }
  
    delete global.otpStore[email]; // Clear OTP after use
    return res.json({ success: true, message: "OTP verified successfully." });
  });
  