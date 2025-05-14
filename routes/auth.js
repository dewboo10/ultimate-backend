const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendOTP } = require('../utils/emailService');

// Store OTPs in memory (will be cleared on server restart)
const otpStore = new Map();

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Generate and store OTP
    const otp = generateOTP();
    otpStore.set(email, {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
    });

    // Send OTP via email
    const sent = await sendOTP(email, otp);
    if (!sent) {
      throw new Error('Failed to send OTP');
    }

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, otp } = req.body;

    // Validate input
    if (!email || !username || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Verify OTP
    const storedOTP = otpStore.get(email);
    if (!storedOTP || storedOTP.code !== otp || Date.now() > storedOTP.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Create user
    const user = await User.create({
      email,
      username,
      password
    });

    // Clear OTP
    otpStore.delete(email);

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

module.exports = router;