const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendOtpEmail = require('../utils/sendOtpEmail');
const validate = require('../middlewares/validate');
const authSchemas = require('../validations/authSchemas');
const redisClient = global.redisClient; // ✅ Use shared Redis client from server.js

const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX,
  handler: (req, res) => res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later'
  })
});


// Send OTP with rate limiting
router.post('/send-otp', authLimiter, validate(authSchemas.sendOtp), async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  await redisClient.setex(`otp:${email}`, 600, otp);
  await sendOtpEmail(email, otp);
  
  res.json({ 
    success: true, 
    message: 'OTP sent successfully' 
  });
});

// Verify OTP
router.post('/verify-otp', validate(authSchemas.verifyOtp), async (req, res) => {
  const { email, otp } = req.body;
  const storedOtp = await redisClient.get(`otp:${email}`);
  
  if (!storedOtp || storedOtp !== otp) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid or expired OTP' 
    });
  }
  
  await redisClient.del(`otp:${email}`);
  const tempToken = jwt.sign({ email }, process.env.JWT_SECRET, { 
    expiresIn: '10m' 
  });
  
  res.json({ 
    success: true, 
    tempToken 
  });
});

// Register User
router.post('/register', validate(authSchemas.register), async (req, res) => {
  try {
    const { username, password, tempToken } = req.body;
    
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded.email) throw new Error('Invalid token');
    
    const existingUser = await User.findOne({ email: decoded.email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    const user = new User({ email: decoded.email, username, password });
await user.save();  // ensures pre('save') runs and hashes password

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(201).json({
      success: true,
      token,
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

// Login User
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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.json({
      success: true,
      token,
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