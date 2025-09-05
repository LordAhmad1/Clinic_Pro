/**
 * Validation Middleware
 * Handles request validation errors from express-validator
 */

const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Validation failed:', {
      url: req.url,
      method: req.method,
      errors: errors.array(),
      body: req.body,
      user: req.user?.id || 'anonymous'
    });

    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        statusCode: 400,
        type: 'ValidationError',
        details: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      },
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

module.exports = {
  validateRequest
};
