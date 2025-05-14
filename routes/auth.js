
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const sendOtpEmail = require('../utils/sendOtpEmail');
const validate = require('../middlewares/validate');
const authSchemas = require('../validations/authSchemas');

const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX,
  handler: (req, res) => res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later'
  })
});

// Register without OTP or Redis
router.post('/register', validate(authSchemas.register), async (req, res) => {
  try {
    const { username, password, email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    const user = new User({ email, username, password });
    await user.save();

    await sendOtpEmail(email); // just send welcome mail

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

router.post('/login', validate(authSchemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

module.exports = router;
