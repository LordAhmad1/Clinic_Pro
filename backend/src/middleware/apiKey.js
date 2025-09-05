/**
 * API Key Authentication Middleware
 * Additional layer of security for API endpoints
 */

const securityConfig = require('../config/security');
const logger = require('../utils/logger');

const validateApiKey = (req, res, next) => {
  // Skip API key validation if not enabled
  if (!securityConfig.apiKey.enabled) {
    return next();
  }

  const apiKey = req.headers[securityConfig.apiKey.header.toLowerCase()] || 
                 req.headers['x-api-key'] ||
                 req.query.apiKey;

  if (!apiKey) {
    logger.security(`API key missing from request: ${req.method} ${req.path}`);
    return res.status(401).json({
      success: false,
      error: {
        message: 'API key required',
        statusCode: 401,
        type: 'ApiKeyRequiredError'
      }
    });
  }

  if (apiKey !== securityConfig.apiKey.value) {
    logger.security(`Invalid API key attempt: ${req.method} ${req.path} from IP: ${req.ip}`);
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid API key',
        statusCode: 401,
        type: 'InvalidApiKeyError'
      }
    });
  }

  // API key is valid
  logger.info(`Valid API key used: ${req.method} ${req.path}`);
  next();
};

// Optional API key validation (for public endpoints that can work with or without API key)
const optionalApiKey = (req, res, next) => {
  if (!securityConfig.apiKey.enabled) {
    return next();
  }

  const apiKey = req.headers[securityConfig.apiKey.header.toLowerCase()] || 
                 req.headers['x-api-key'] ||
                 req.query.apiKey;

  if (apiKey && apiKey === securityConfig.apiKey.value) {
    req.hasValidApiKey = true;
    logger.info(`Optional API key validated: ${req.method} ${req.path}`);
  } else {
    req.hasValidApiKey = false;
  }

  next();
};

module.exports = {
  validateApiKey,
  optionalApiKey
};
