const Joi = require('joi');

module.exports = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false
  });

  if (error) {
    const errors = error.details.map(err => ({
      field: err.context.key,
      message: err.message.replace(/"/g, '')
    }));

    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};