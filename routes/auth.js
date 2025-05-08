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
  