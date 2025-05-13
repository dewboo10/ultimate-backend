const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // 1. Check for token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    // 2. Verify token
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check user exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    // 4. Attach user to request
    req.user = user;
    next();

  } catch (error) {
    // Handle different error types
    const message = error.name === 'JsonWebTokenError' 
      ? 'Invalid token' 
      : 'Session expired';
      
    res.status(401).json({
      success: false,
      message
    });
  }
};