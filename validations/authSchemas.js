const Joi = require('joi');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

module.exports = {
  sendOtp: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    })
  }),

  verifyOtp: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required()
      .messages({
        'string.pattern.base': 'OTP must contain only numbers',
        'string.length': 'OTP must be 6 digits'
      })
  }),

  register: Joi.object({
    username: Joi.string().min(3).max(30).required()
      .messages({
        'string.min': 'Username must be at least 3 characters',
        'string.max': 'Username cannot exceed 30 characters'
      }),
    password: Joi.string().pattern(passwordRegex).required()
      .messages({
        'string.pattern.base': 'Password must contain 8+ characters with at least one uppercase, lowercase, number, and special character'
      }),
    tempToken: Joi.string().required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};