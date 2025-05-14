
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const OtpStore = require('../models/OtpStore');
const sendOtpEmail = require('../utils/sendOtpEmail');

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Invalid email' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    await OtpStore.deleteMany({ email });
    await OtpStore.create({ email, otp });
    await sendOtpEmail(email, otp);
    res.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const match = await OtpStore.findOne({ email, otp });
  if (!match) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }
  await OtpStore.deleteMany({ email });
  res.json({ success: true, message: 'OTP verified' });
});

// Register user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  res.json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email
    }
  });
});

module.exports = router;
